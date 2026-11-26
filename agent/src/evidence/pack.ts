// Evidence pack: everything an auditor or regulator needs to re-check one case, in canonical
// JSON so its keccak256 can be compared against the hash anchored on HSK Chain.
import { keccak256, toHex, type Hex } from "viem";
import { canonicalJson, hashCanonical } from "../util/canonical.ts";
import type { ComplianceResult, Party, TransferRequest } from "../compliance/types.ts";
import type { Attestation, PaymentResult, VerifyDecision } from "../hsp/types.ts";
import type { Quote } from "../agents/types.ts";

export type PackKind = "Settlement" | "Refund" | "Blocked";

/** IVMS101-style Travel-Rule payload (field names simplified; the real IVMS101 schema is richer). */
export function travelRulePacket(req: TransferRequest, originatingVasp: string, beneficiaryVasp: string) {
  const person = (p: Party) => ({
    naturalOrLegalName: p.name,
    country: p.country,
    geographicAddress: p.address ?? null,
    dateOfBirth: p.dateOfBirth ?? null,
    nationalIdentification: p.nationalIdRef ?? null,
    accountNumber: p.accountRef ?? p.wallet ?? null,
    institution: p.institution ?? null,
  });
  return {
    standard: "IVMS101 (modelled)",
    originatingVASP: originatingVasp,
    beneficiaryVASP: beneficiaryVasp,
    originator: person(req.originator),
    beneficiary: person(req.beneficiary),
  };
}

/**
 * MODELLED record for Korea's cross-border virtual-asset transfer reporting (FX Transactions Act
 * amendment). The official schema is not public; field choice follows the BOK's existing
 * cross-border remittance reporting items.
 */
export function fxReportRecord(req: TransferRequest, c: ComplianceResult, operatorName: string, settlementRef: string | null) {
  return {
    schema: "corridor/kr-va-transfer-report/v0 (modelled, not official)",
    reportingEntity: operatorName,
    direction: "outbound",
    counterpartyCountry: req.beneficiary.country,
    amountKrw: req.amountKrw,
    amountUsdEquivalent: c.amountUsd,
    asset: "USDC.e",
    purposeCategory: c.intent.purposeCategory,
    originatorRef: req.originator.id,
    beneficiaryRef: req.beneficiary.id,
    decision: c.decision,
    settlementRef,
    reportedAt: new Date(req.createdAt * 1000).toISOString(),
  };
}

const attestationDigest = (a: Attestation) => ({
  capability: a.capability,
  subject: a.subject,
  issuer: a.issuer,
  expiresAt: a.expiresAt,
  digest: keccak256(toHex(canonicalJson(a))),
});

export interface EvidencePackInput {
  kind: PackKind;
  operatorName: string;
  request: TransferRequest;
  compliance: ComplianceResult;
  quotes?: Quote[];
  selectedQuote?: Quote;
  rejectedPayees?: { payout: string; name: string; decision: VerifyDecision }[];
  payment?: PaymentResult;
  verifierDecision?: VerifyDecision;
  escrow?: { chainId: number; address: string; transferId: Hex; lockTx?: Hex; releaseTx?: Hex; refundTx?: Hex };
  payoutProofHash?: Hex;
}

export function buildEvidencePack(i: EvidencePackInput) {
  const beneficiaryVasp = i.selectedQuote?.payoutName ?? "n/a";
  const pack = {
    schema: "corridor/evidence-pack/v1",
    kind: i.kind,
    caseId: i.request.caseId,
    createdAt: i.request.createdAt,
    operator: i.operatorName,
    compliance: {
      decision: i.compliance.decision,
      findings: i.compliance.findings,
      remediation: i.compliance.remediation ?? null,
      intent: i.compliance.intent,
      amountHkd: i.compliance.amountHkd,
      aggregateHkdInWindow: i.compliance.aggregateHkdInWindow,
    },
    travelRule: i.compliance.travelRuleRequired ? travelRulePacket(i.request, i.operatorName, beneficiaryVasp) : null,
    fxReport: fxReportRecord(i.request, i.compliance, i.operatorName, i.escrow?.transferId ?? null),
    quotes: i.quotes ?? [],
    selectedQuote: i.selectedQuote ?? null,
    rejectedPayees: i.rejectedPayees ?? [],
    hsp: i.payment
      ? {
          backend: i.payment.backend,
          paymentId: i.payment.paymentId,
          mandate: { ...i.payment.mandate },
          receipt: { ...i.payment.receipt },
          attestations: i.payment.attestations.map(attestationDigest),
          verifierDecision: i.verifierDecision ?? null,
        }
      : null,
    escrow: i.escrow ?? null,
    payoutProofHash: i.payoutProofHash ?? null,
  };
  return { pack, packHash: hashCanonical(pack) };
}

export function caseSubjectId(caseId: string): Hex {
  return keccak256(toHex(`corridor-case:${caseId}`));
}
