// Payout Agent: run by a licensed Hong Kong payout operator. Quotes, verifies the incoming HSP
// payment itself (relying party), delivers HKD (MOCKED bank leg) and claims the escrow.
import { keccak256, toHex, type Address, type Hex, type LocalAccount } from "viem";
import type { CorridorChain } from "../chain/corridor.ts";
import { FX } from "../compliance/rules.ts";
import { CAP, type HspGateway, type PaymentResult, type TrustPolicy, type VerifyDecision } from "../hsp/types.ts";
import { canonicalJson, hashCanonical } from "../util/canonical.ts";
import type { Ledger } from "./ledger.ts";
import type { Quote } from "./types.ts";

export interface PayoutPricing {
  feeBps: number;
  /** Spread the operator takes on the reference HKD/USD rate, in bps. */
  fxSpreadBps: number;
  etaMinutes: number;
}

export class PayoutAgent {
  constructor(
    readonly name: string,
    readonly account: LocalAccount,
    private readonly pricing: PayoutPricing,
    private readonly trust: TrustPolicy,
    private readonly ledger: Ledger,
  ) {}

  get address(): Address {
    return this.account.address;
  }

  async quote(caseId: string, sendAmountUsdc: bigint): Promise<Quote> {
    const usd = Number(sendAmountUsdc) / 1e6;
    const hkdPerUsd = (FX.KRW_PER_USD / FX.KRW_PER_HKD) * (1 - this.pricing.fxSpreadBps / 10_000);
    const payoutAmountHkd = Math.floor(usd * hkdPerUsd * (1 - this.pricing.feeBps / 10_000) * 100) / 100;
    const q: Quote = {
      quoteId: `${caseId}:${this.name}`,
      caseId,
      payout: this.address,
      payoutName: this.name,
      corridor: "KR->HK",
      sendAmountUsdc: sendAmountUsdc.toString(),
      payoutAmountHkd,
      feeBps: this.pricing.feeBps,
      etaMinutes: this.pricing.etaMinutes,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    };
    q.signature = await this.account.signMessage({ message: canonicalJson(q) });
    return q;
  }

  /** Relying-party check: never trust the coordinator's word; ACCEPT only if every required capability is satisfied. */
  async verifyIncoming(gateway: HspGateway, payment: PaymentResult, caseId: string): Promise<VerifyDecision> {
    const decision = await gateway.verify(payment, {
      ...this.trust,
      policyRequiredCaps: [CAP.settlementVerified, CAP.kyc, CAP.sanctions],
    });
    this.ledger.emit({
      type: "hsp.verified",
      caseId,
      at: Date.now(),
      by: this.name,
      outcome: decision.outcomeClass,
      missing: decision.missing,
    });
    return decision;
  }

  /** MOCKED: instructs the HK bank transfer to the beneficiary and returns a payout proof. */
  async deliverFiat(quote: Quote, beneficiaryAccount: string) {
    const proof = {
      bankRef: `FPS-${quote.caseId.replace(/\W/g, "").slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      rail: "HK FPS (simulated)",
      beneficiaryAccount,
      amountHkd: quote.payoutAmountHkd,
      paidAt: Math.floor(Date.now() / 1000),
      operator: this.name,
    };
    this.ledger.emit({ type: "payout.delivered", caseId: quote.caseId, at: Date.now(), bankRef: proof.bankRef, amountHkd: proof.amountHkd });
    return { proof, proofHash: hashCanonical(proof) };
  }

  async claim(chain: CorridorChain, transferId: Hex, proofHash: Hex) {
    return chain.confirmPayout(this.account, transferId, proofHash);
  }
}

export const quoteHash = (q: Quote): Hex => keccak256(toHex(canonicalJson({ ...q, signature: undefined })));
