// Relying-party verifier for the local simulator. Mirrors HSP's rule:
//   ACCEPT  iff  requiredCapabilities ⊆ satisfiedCapabilities
// where `required` = mandate's required caps ∪ the relying party's own policy caps.
// Against the real Coordinator, Corridor uses the SDK's HSPVerifier instead.
import { verifyTypedData, type Address } from "viem";
import {
  attestationMessage,
  attestationTypes,
  hspDomain,
  mandateHash,
  mandateMessage,
  mandateTypes,
  receiptMessage,
  receiptTypes,
  sameAddress,
} from "./eip712.ts";
import { CAP, type Attestation, type Capability, type Mandate, type Receipt, type TrustPolicy, type VerifyDecision } from "./types.ts";

/** Which party each attestation capability must be about. */
const SUBJECTS: Record<string, ("payer" | "payee")[]> = {
  [CAP.kyc]: ["payer"],
  [CAP.sanctions]: ["payer", "payee"],
};

export async function verifyPayment(
  mandate: Mandate,
  receipt: Receipt,
  attestations: Attestation[],
  policy: TrustPolicy,
  now = Math.floor(Date.now() / 1000),
): Promise<VerifyDecision> {
  const reasons: string[] = [];
  const required = [...new Set([...mandate.requiredCapabilities, ...policy.policyRequiredCaps])].sort();
  const satisfied = new Set<Capability>();

  const mandateOk = await verifyTypedData({
    address: mandate.payer,
    domain: hspDomain(mandate.chainId),
    types: mandateTypes,
    primaryType: "Mandate",
    message: mandateMessage(mandate),
    signature: mandate.signature,
  });
  if (!mandateOk) reasons.push("mandate signature does not recover to payer");
  if (now > mandate.validBefore) reasons.push("mandate expired");

  const receiptSigOk = await verifyTypedData({
    address: policy.adapterAddress,
    domain: hspDomain(receipt.chainId),
    types: receiptTypes,
    primaryType: "Receipt",
    message: receiptMessage(receipt),
    signature: receipt.signature,
  });
  if (!receiptSigOk) reasons.push("receipt not signed by the pinned adapter");

  const bindingOk =
    receipt.mandateHash === mandateHash(mandate) &&
    receipt.chainId === mandate.chainId &&
    sameAddress(receipt.from, mandate.payer) && // wallet-settling: Transfer.from == mandate signer
    sameAddress(receipt.to, mandate.payee) &&
    BigInt(receipt.amount) >= BigInt(mandate.amount);
  if (!bindingOk) reasons.push("receipt does not settle this mandate");

  if (mandateOk && receiptSigOk && bindingOk) {
    for (const cap of receipt.satisfies) satisfied.add(cap);
  }

  for (const [cap, parties] of Object.entries(SUBJECTS)) {
    const covered = parties.every((party) => {
      const subject: Address = party === "payer" ? mandate.payer : mandate.payee;
      return attestations.some(
        (a) =>
          a.capability === cap &&
          sameAddress(a.subject, subject) &&
          policy.trustedIssuers.some((i) => sameAddress(i, a.issuer)) &&
          a.issuedAt <= now &&
          now < a.expiresAt,
      );
    });
    if (covered) satisfied.add(cap);
  }

  // Attestation signatures are checked individually; a forged one removes its capability.
  for (const a of attestations) {
    const ok = await verifyTypedData({
      address: a.issuer,
      domain: hspDomain(mandate.chainId),
      types: attestationTypes,
      primaryType: "Attestation",
      message: attestationMessage(a),
      signature: a.signature,
    });
    if (!ok) {
      satisfied.delete(a.capability);
      reasons.push(`attestation ${a.capability} for ${a.subject} has an invalid signature`);
    }
  }

  const satisfiedList = [...satisfied].sort();
  const missing = required.filter((c) => !satisfied.has(c));
  for (const m of missing) reasons.push(`missing capability ${m}`);
  const ok = reasons.length === 0 && missing.length === 0;
  return { ok, outcomeClass: ok ? "ACCEPT" : "REJECT", required, satisfied: satisfiedList, missing, reasons };
}
