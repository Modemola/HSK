// Sender Agent: run by the licensed Korean sending operator. Takes a customer instruction,
// obeys the Compliance Agent, runs a quote auction among registered payout operators, pays the
// winner through HSP (compliant profile), locks the value in CorridorEscrow on HSK Chain and
// files the evidence pack.
import type { Hex, LocalAccount } from "viem";
import { EvidenceKind, type CorridorChain } from "../chain/corridor.ts";
import type { ComplianceAgent } from "../compliance/agent.ts";
import { toUsd } from "../compliance/rules.ts";
import type { ComplianceResult, TransferRequest } from "../compliance/types.ts";
import { buildEvidencePack, caseSubjectId, type PackKind } from "../evidence/pack.ts";
import { CAP, type HspGateway, type PaymentResult, type VerifyDecision } from "../hsp/types.ts";
import { hashCanonical } from "../util/canonical.ts";
import type { Ledger } from "./ledger.ts";
import { quoteHash, type PayoutAgent } from "./payout.ts";
import type { Quote } from "./types.ts";

export interface SenderConfig {
  operatorName: string;
  account: LocalAccount; // registered Sender operator on CorridorRegistry
  relayer: LocalAccount; // allowed relayer on CorridorEscrow + anchorer on EvidenceAnchor
  slaSeconds: number;
  /**
   * Fraction of the real USD value actually locked on chain. 1 = full value. For a mainnet demo
   * with a small float, e.g. 0.001 locks 1/1000 of the value; the console states the scale.
   */
  valueScale: number;
}

export interface CaseOutcome {
  caseId: string;
  status: "SETTLED" | "BLOCKED" | "HELD" | "AWAITING_PAYOUT" | "REFUNDED";
  compliance: ComplianceResult;
  transferId?: Hex;
  packHash?: Hex;
  selectedQuote?: Quote;
}

interface CaseState {
  request: TransferRequest;
  compliance: ComplianceResult;
  quotes: Quote[];
  rejected: { payout: string; name: string; decision: VerifyDecision }[];
  selected?: Quote;
  payment?: PaymentResult;
  verifier?: VerifyDecision;
  escrow?: { chainId: number; address: string; transferId: Hex; lockTx?: Hex; releaseTx?: Hex; refundTx?: Hex };
}

export class SenderAgent {
  private readonly cases = new Map<string, CaseState>();

  constructor(
    private readonly cfg: SenderConfig,
    private readonly compliance: ComplianceAgent,
    private readonly gateway: HspGateway,
    private readonly chain: CorridorChain,
    private readonly ledger: Ledger,
  ) {}

  async process(req: TransferRequest, payouts: PayoutAgent[], opts: { payoutFails?: boolean } = {}): Promise<CaseOutcome> {
    const L = this.ledger;
    L.emit({
      type: "case.received",
      caseId: req.caseId,
      at: Date.now(),
      summary: `${req.originator.name} → ${req.beneficiary.name}: ₩${req.amountKrw.toLocaleString()} — "${req.memo}"`,
    });

    const compliance = await this.compliance.review(req);
    L.emit({
      type: "compliance.reviewed",
      caseId: req.caseId,
      at: Date.now(),
      decision: compliance.decision,
      findings: compliance.findings.map((f) => `${f.code}: ${f.detail}`),
      intentSource: compliance.intent.source,
    });
    const state: CaseState = { request: req, compliance, quotes: [], rejected: [] };
    this.cases.set(req.caseId, state);

    if (compliance.decision === "BLOCK" || compliance.decision === "HOLD") {
      const packHash = await this.fileEvidence(state, "Blocked", caseSubjectId(req.caseId));
      return { caseId: req.caseId, status: compliance.decision === "BLOCK" ? "BLOCKED" : "HELD", compliance, packHash };
    }

    // 1. Quote auction among registered payout operators.
    const sendAmountUsdc = BigInt(Math.max(1, Math.round(toUsd(req.amountKrw) * this.cfg.valueScale * 1e6)));
    state.quotes = await Promise.all(payouts.map((p) => p.quote(req.caseId, sendAmountUsdc)));
    L.emit({ type: "quotes.received", caseId: req.caseId, at: Date.now(), quotes: state.quotes });

    // 2. Pre-flight: drop any payee the HSP issuer will not attest as sanctions-clear.
    const eligible: Quote[] = [];
    for (const q of state.quotes) {
      const caps = (await this.gateway.attestableCapabilities?.(q.payout, [CAP.sanctions])) ?? [CAP.sanctions];
      if (!caps.includes(CAP.sanctions)) {
        const decision: VerifyDecision = {
          ok: false,
          outcomeClass: "REJECT",
          required: [CAP.sanctions],
          satisfied: caps,
          missing: [CAP.sanctions],
          reasons: ["issuer will not attest sanctions screening for this payee"],
        };
        state.rejected.push({ payout: q.payout, name: q.payoutName, decision });
        L.emit({ type: "payee.rejected", caseId: req.caseId, at: Date.now(), payout: q.payout, name: q.payoutName, missing: decision.missing });
      } else {
        eligible.push(q);
      }
    }
    const best = eligible.sort((a, b) => b.payoutAmountHkd - a.payoutAmountHkd || a.etaMinutes - b.etaMinutes)[0];
    if (!best) {
      compliance.decision = "HOLD";
      compliance.remediation = "No compliant payout operator available for this corridor.";
      const packHash = await this.fileEvidence(state, "Blocked", caseSubjectId(req.caseId));
      return { caseId: req.caseId, status: "HELD", compliance, packHash };
    }
    state.selected = best;
    L.emit({ type: "quote.selected", caseId: req.caseId, at: Date.now(), quoteId: best.quoteId, payoutName: best.payoutName });
    const payout = payouts.find((p) => p.address === best.payout)!;

    // 3. Compliant HSP payment, bound to the selected quote.
    const qHash = quoteHash(best);
    const payment = await this.gateway.pay({
      to: best.payout,
      amount: BigInt(best.sendAmountUsdc),
      reference: qHash,
      compliance: ["kyc", "sanctions"],
    });
    state.payment = payment;
    L.emit({ type: "hsp.paid", caseId: req.caseId, at: Date.now(), paymentId: payment.paymentId, backend: payment.backend, txHash: payment.receipt.txHash });

    // 4. The payout operator verifies independently. No ACCEPT, no escrow.
    const verdict = await payout.verifyIncoming(this.gateway, payment, req.caseId);
    state.verifier = verdict;
    if (!verdict.ok) {
      compliance.decision = "HOLD";
      compliance.remediation = `Payout operator's verifier rejected the HSP payment: ${verdict.reasons.join("; ")}`;
      const packHash = await this.fileEvidence(state, "Blocked", caseSubjectId(req.caseId));
      return { caseId: req.caseId, status: "HELD", compliance, packHash, selectedQuote: best };
    }

    // 5. Lock value on HSK Chain, keyed to the HSP payment id and the quote.
    const deadline = (await this.chain.now()) + BigInt(this.cfg.slaSeconds);
    const { transferId, txHash: lockTx } = await this.chain.lock(this.cfg.account, {
      payout: best.payout,
      amount: BigInt(best.sendAmountUsdc),
      deadline,
      mandateHash: payment.paymentId,
      quoteHash: qHash,
    });
    state.escrow = { chainId: this.chain.chain.id, address: this.chain.d.escrow, transferId, lockTx };
    L.emit({ type: "escrow.locked", caseId: req.caseId, at: Date.now(), transferId, txHash: lockTx, amount: best.sendAmountUsdc });

    // 6. Relayer anchors the ACCEPTed receipt; this is what unlocks confirmPayout.
    const receiptHash = hashCanonical(payment.receipt);
    const anchorTx = await this.chain.anchorReceipt(this.cfg.relayer, transferId, receiptHash);
    L.emit({ type: "receipt.anchored", caseId: req.caseId, at: Date.now(), transferId, receiptHash, txHash: anchorTx });

    if (opts.payoutFails) {
      return { caseId: req.caseId, status: "AWAITING_PAYOUT", compliance, transferId, selectedQuote: best };
    }

    // 7. Payout operator delivers HKD (mocked) and claims.
    const { proofHash } = await payout.deliverFiat(best, req.beneficiary.accountRef ?? "n/a");
    const releaseTx = await payout.claim(this.chain, transferId, proofHash);
    state.escrow.releaseTx = releaseTx;
    L.emit({ type: "escrow.released", caseId: req.caseId, at: Date.now(), transferId, txHash: releaseTx });

    const packHash = await this.fileEvidence(state, "Settlement", transferId, proofHash);
    return { caseId: req.caseId, status: "SETTLED", compliance, transferId, packHash, selectedQuote: best };
  }

  /** After the SLA lapses, return the funds to the sender. Attestations stay attached to the case. */
  async refundExpired(caseId: string): Promise<CaseOutcome> {
    const state = this.cases.get(caseId);
    if (!state?.escrow) throw new Error(`no escrow for case ${caseId}`);
    const refundTx = await this.chain.refund(this.cfg.relayer, state.escrow.transferId);
    state.escrow.refundTx = refundTx;
    this.ledger.emit({ type: "escrow.refunded", caseId, at: Date.now(), transferId: state.escrow.transferId, txHash: refundTx });
    const packHash = await this.fileEvidence(state, "Refund", state.escrow.transferId);
    return { caseId, status: "REFUNDED", compliance: state.compliance, transferId: state.escrow.transferId, packHash, selectedQuote: state.selected };
  }

  private async fileEvidence(state: CaseState, kind: PackKind, subjectId: Hex, payoutProofHash?: Hex): Promise<Hex> {
    const { pack, packHash } = buildEvidencePack({
      kind,
      operatorName: this.cfg.operatorName,
      request: state.request,
      compliance: state.compliance,
      quotes: state.quotes,
      selectedQuote: state.selected,
      rejectedPayees: state.rejected,
      payment: state.payment,
      verifierDecision: state.verifier,
      escrow: state.escrow,
      payoutProofHash,
    });
    this.ledger.savePack(packHash, pack);
    const txHash = await this.chain.anchorEvidence(
      this.cfg.relayer,
      subjectId,
      packHash,
      EvidenceKind[kind],
      `corridor://packs/${packHash}`,
    );
    this.ledger.emit({ type: "evidence.anchored", caseId: state.request.caseId, at: Date.now(), kind, packHash, txHash });
    return packHash;
  }
}
