// Wire objects of the HashKey Settlement Protocol (HSP), as described in the
// HashFans "Building on HSP" developer guide:
//   Mandate     — signed by the payer: "I intend to pay X to Y, and I require capabilities Z"
//   Receipt     — signed by a settlement adapter: "I observed the settlement that satisfies this mandate"
//   Attestation — signed by an issuer: "I vouch that the subject is KYC'd / not sanctioned / ..."
// A verifier ACCEPTs iff requiredCapabilities ⊆ satisfiedCapabilities.

import type { Address, Hex } from "viem";

/** `verb:object:version`, e.g. `attests:kyc:v1`, `proves:settlement-verified:v1`. */
export type Capability = string;

export const CAP = {
  settlementVerified: "proves:settlement-verified:v1",
  kyc: "attests:kyc:v1",
  sanctions: "attests:sanctions:v1",
} as const;

export interface Mandate {
  version: "hsp-mandate-v1";
  chainId: number;
  token: Address;
  payer: Address;
  payee: Address;
  amount: string; // base units, decimal string
  requiredCapabilities: Capability[];
  /** Binds the HSP payment to a Corridor quote (keccak256 of the canonical quote). */
  reference: Hex;
  nonce: Hex;
  validBefore: number; // unix seconds
  signature: Hex;
}

export interface Receipt {
  version: "hsp-receipt-v1";
  mandateHash: Hex;
  chainId: number;
  txHash: Hex;
  from: Address;
  to: Address;
  amount: string;
  observedAt: number;
  adapterId: string;
  satisfies: Capability[]; // structural proofs the adapter vouches for
  adapter: Address;
  signature: Hex;
}

export interface Attestation {
  version: "hsp-attestation-v1";
  subject: Address;
  capability: Capability;
  issuer: Address;
  issuedAt: number;
  expiresAt: number;
  signature: Hex;
}

export type OutcomeClass = "ACCEPT" | "REJECT" | "PENDING";

export interface VerifyDecision {
  ok: boolean;
  outcomeClass: OutcomeClass;
  required: Capability[];
  satisfied: Capability[];
  missing: Capability[];
  reasons: string[];
}

export interface TrustPolicy {
  /** Adapter observation address pinned out-of-band (from the Coordinator's /chains). */
  adapterAddress: Address;
  trustedIssuers: Address[];
  /** Capabilities the relying party demands regardless of what the mandate says. */
  policyRequiredCaps: Capability[];
}

export interface PaymentResult {
  paymentId: Hex; // = mandateHash
  mandate: Mandate;
  receipt: Receipt;
  attestations: Attestation[];
  /** Where this payment ran: the organiser's HSP Coordinator or the local protocol simulator. */
  backend: "hsp-coordinator" | "local-simulator";
}

export interface PayRequest {
  to: Address;
  amount: bigint;
  reference: Hex;
  compliance: ("kyc" | "sanctions")[];
}

/** What Corridor needs from HSP. Implemented by the real SDK adapter and the local simulator. */
export interface HspGateway {
  readonly backend: PaymentResult["backend"];
  readonly payer: Address;
  pay(req: PayRequest): Promise<PaymentResult>;
  verify(result: Pick<PaymentResult, "mandate" | "receipt" | "attestations">, policy: TrustPolicy): Promise<VerifyDecision>;
  /**
   * Pre-flight: which of `caps` the issuer will attest for `subject`. Lets the Sender Agent drop a
   * non-compliant payee BEFORE any money moves. Optional: undefined = not supported by backend.
   */
  attestableCapabilities?(subject: Address, caps: Capability[]): Promise<Capability[]>;
}
