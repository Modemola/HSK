// EIP-712 encodings used by the local HSP simulator. The real HSP Coordinator defines its
// own encodings; Corridor only depends on the HspGateway interface, never on these.
import { hashTypedData, type Address, type Hex } from "viem";
import type { Attestation, Mandate, Receipt } from "./types.ts";

export const hspDomain = (chainId: number) => ({ name: "HSP", version: "1", chainId }) as const;

export const mandateTypes = {
  Mandate: [
    { name: "chainId", type: "uint256" },
    { name: "token", type: "address" },
    { name: "payer", type: "address" },
    { name: "payee", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "requiredCapabilities", type: "string[]" },
    { name: "reference", type: "bytes32" },
    { name: "nonce", type: "bytes32" },
    { name: "validBefore", type: "uint256" },
  ],
} as const;

export const receiptTypes = {
  Receipt: [
    { name: "mandateHash", type: "bytes32" },
    { name: "chainId", type: "uint256" },
    { name: "txHash", type: "bytes32" },
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "observedAt", type: "uint256" },
    { name: "adapterId", type: "string" },
    { name: "satisfies", type: "string[]" },
  ],
} as const;

export const attestationTypes = {
  Attestation: [
    { name: "subject", type: "address" },
    { name: "capability", type: "string" },
    { name: "issuedAt", type: "uint256" },
    { name: "expiresAt", type: "uint256" },
  ],
} as const;

export function mandateMessage(m: Omit<Mandate, "signature" | "version">) {
  return {
    chainId: BigInt(m.chainId),
    token: m.token,
    payer: m.payer,
    payee: m.payee,
    amount: BigInt(m.amount),
    requiredCapabilities: m.requiredCapabilities,
    reference: m.reference,
    nonce: m.nonce,
    validBefore: BigInt(m.validBefore),
  };
}

export function receiptMessage(r: Omit<Receipt, "signature" | "version" | "adapter">) {
  return {
    mandateHash: r.mandateHash,
    chainId: BigInt(r.chainId),
    txHash: r.txHash,
    from: r.from,
    to: r.to,
    amount: BigInt(r.amount),
    observedAt: BigInt(r.observedAt),
    adapterId: r.adapterId,
    satisfies: r.satisfies,
  };
}

export function attestationMessage(a: Pick<Attestation, "subject" | "capability" | "issuedAt" | "expiresAt">) {
  return {
    subject: a.subject,
    capability: a.capability,
    issuedAt: BigInt(a.issuedAt),
    expiresAt: BigInt(a.expiresAt),
  };
}

/** paymentId in HSP equals the mandate hash. */
export function mandateHash(m: Mandate): Hex {
  return hashTypedData({
    domain: hspDomain(m.chainId),
    types: mandateTypes,
    primaryType: "Mandate",
    message: mandateMessage(m),
  });
}

export function receiptHash(r: Receipt): Hex {
  return hashTypedData({
    domain: hspDomain(r.chainId),
    types: receiptTypes,
    primaryType: "Receipt",
    message: receiptMessage(r),
  });
}

export function sameAddress(a: Address, b: Address): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
