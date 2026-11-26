import type { Address, Hex } from "viem";

/** A payout operator's binding offer to deliver HKD for a given USDC.e amount. */
export interface Quote {
  quoteId: string;
  caseId: string;
  payout: Address;
  payoutName: string;
  corridor: "KR->HK";
  sendAmountUsdc: string; // base units (6 dp)
  payoutAmountHkd: number;
  feeBps: number;
  etaMinutes: number;
  expiresAt: number;
  signature?: Hex;
}

export type LedgerEvent =
  | { type: "case.received"; caseId: string; at: number; summary: string }
  | { type: "compliance.reviewed"; caseId: string; at: number; decision: string; findings: string[]; intentSource: string }
  | { type: "quotes.received"; caseId: string; at: number; quotes: Quote[] }
  | { type: "payee.rejected"; caseId: string; at: number; payout: Address; name: string; missing: string[] }
  | { type: "quote.selected"; caseId: string; at: number; quoteId: string; payoutName: string }
  | { type: "escrow.locked"; caseId: string; at: number; transferId: Hex; txHash: Hex; amount: string }
  | { type: "hsp.paid"; caseId: string; at: number; paymentId: Hex; backend: string; txHash: Hex }
  | { type: "hsp.verified"; caseId: string; at: number; by: string; outcome: string; missing: string[] }
  | { type: "receipt.anchored"; caseId: string; at: number; transferId: Hex; receiptHash: Hex; txHash: Hex }
  | { type: "payout.delivered"; caseId: string; at: number; bankRef: string; amountHkd: number }
  | { type: "escrow.released"; caseId: string; at: number; transferId: Hex; txHash: Hex }
  | { type: "escrow.refunded"; caseId: string; at: number; transferId: Hex; txHash: Hex }
  | { type: "evidence.anchored"; caseId: string; at: number; kind: string; packHash: Hex; txHash: Hex };
