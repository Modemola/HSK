import type { Address } from "viem";

export interface Party {
  id: string;
  name: string;
  country: string; // ISO-3166 alpha-2
  address?: string;
  dateOfBirth?: string;
  nationalIdRef?: string; // hashed / tokenised reference, never the raw id
  accountRef?: string;
  institution?: string;
  wallet?: Address;
}

/** A customer instruction received by the sending operator. */
export interface TransferRequest {
  caseId: string;
  createdAt: number; // unix seconds
  originator: Party;
  beneficiary: Party;
  amountKrw: number;
  memo: string;
  declaredPurpose?: string;
}

export type Decision = "ALLOW" | "ALLOW_WITH_TRAVEL_RULE" | "HOLD" | "BLOCK";

export interface Finding {
  code:
    | "STRUCTURING_ORIGINATOR"
    | "STRUCTURING_BENEFICIARY"
    | "NEAR_THRESHOLD"
    | "SANCTIONS_NAME_MATCH"
    | "TRAVEL_RULE_INCOMPLETE"
    | "INTENT_EVASION"
    | "PURPOSE_MISMATCH"
    | "HIGH_RISK_JURISDICTION";
  severity: "info" | "medium" | "high" | "critical";
  detail: string;
  relatedCaseIds?: string[];
}

export interface IntentAnalysis {
  source: "llm" | "heuristic";
  purposeCategory: string;
  evasionIndicators: string[];
  evasionRisk: "none" | "low" | "medium" | "high";
  narrative: string;
}

export interface ComplianceResult {
  caseId: string;
  decision: Decision;
  findings: Finding[];
  amountHkd: number;
  amountUsd: number;
  travelRuleRequired: boolean;
  aggregateHkdInWindow: number;
  intent: IntentAnalysis;
  /** What the operator should do instead, e.g. "submit one aggregated transfer with a full Travel-Rule packet". */
  remediation?: string;
}
