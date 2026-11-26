// LOCAL HSP SIMULATOR — for offline development, tests and a no-credentials demo.
// It reproduces HSP's protocol model (payer-signed mandate, adapter-signed receipt,
// issuer-signed attestations, subset-rule verifier) with throwaway keys. It does NOT talk
// to the HashKey Coordinator and its receipts are not HSP receipts. Every result is
// labelled `backend: "local-simulator"`, and the console shows that label.
import { keccak256, toHex, type Address, type Hex, type LocalAccount } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import {
  attestationMessage,
  attestationTypes,
  hspDomain,
  mandateHash,
  mandateMessage,
  mandateTypes,
  receiptMessage,
  receiptTypes,
} from "./eip712.ts";
import { verifyPayment } from "./verifier.ts";
import {
  CAP,
  type Attestation,
  type Capability,
  type HspGateway,
  type Mandate,
  type PaymentResult,
  type PayRequest,
  type Receipt,
  type TrustPolicy,
} from "./types.ts";

export interface SimulatorWorld {
  chainId: number;
  token: Address;
  adapter: LocalAccount;
  issuer: LocalAccount;
  /** What the sandbox issuer is willing to attest, per address. */
  issuerGrants: Map<string, Set<Capability>>;
  adapterId: string;
}

export function createSimulatorWorld(opts: { chainId?: number; token?: Address } = {}): SimulatorWorld {
  return {
    chainId: opts.chainId ?? 133,
    token: opts.token ?? "0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e",
    adapter: privateKeyToAccount(generatePrivateKey()),
    issuer: privateKeyToAccount(generatePrivateKey()),
    issuerGrants: new Map(),
    adapterId: "sim-evm-transfer",
  };
}

export function grant(world: SimulatorWorld, subject: Address, caps: Capability[]) {
  const set = world.issuerGrants.get(subject.toLowerCase()) ?? new Set<Capability>();
  caps.forEach((c) => set.add(c));
  world.issuerGrants.set(subject.toLowerCase(), set);
}

export function trustPolicyFor(world: SimulatorWorld, policyRequiredCaps: Capability[] = []): TrustPolicy {
  return { adapterAddress: world.adapter.address, trustedIssuers: [world.issuer.address], policyRequiredCaps };
}

export async function issueAttestations(world: SimulatorWorld, subject: Address, caps: Capability[]): Promise<Attestation[]> {
  const granted = world.issuerGrants.get(subject.toLowerCase()) ?? new Set();
  const now = Math.floor(Date.now() / 1000);
  const out: Attestation[] = [];
  for (const capability of caps) {
    if (!granted.has(capability)) continue; // the issuer refuses: no attestation exists
    const base = { subject, capability, issuedAt: now - 1, expiresAt: now + 86_400 };
    const signature = await world.issuer.signTypedData({
      domain: hspDomain(world.chainId),
      types: attestationTypes,
      primaryType: "Attestation",
      message: attestationMessage(base),
    });
    out.push({ version: "hsp-attestation-v1", ...base, issuer: world.issuer.address, signature });
  }
  return out;
}

const COMPLIANCE_CAP: Record<"kyc" | "sanctions", Capability> = { kyc: CAP.kyc, sanctions: CAP.sanctions };

export class LocalHspSimulator implements HspGateway {
  readonly backend = "local-simulator" as const;
  constructor(
    private readonly world: SimulatorWorld,
    private readonly payerAccount: LocalAccount,
  ) {}

  get payer(): Address {
    return this.payerAccount.address;
  }

  async pay(req: PayRequest): Promise<PaymentResult> {
    const w = this.world;
    const required = [CAP.settlementVerified, ...req.compliance.map((c) => COMPLIANCE_CAP[c])];
    const base = {
      chainId: w.chainId,
      token: w.token,
      payer: this.payer,
      payee: req.to,
      amount: req.amount.toString(),
      requiredCapabilities: required,
      reference: req.reference,
      nonce: keccak256(toHex(`${this.payer}:${req.reference}:${Date.now()}:${Math.random()}`)),
      validBefore: Math.floor(Date.now() / 1000) + 3600,
    };
    const signature = await this.payerAccount.signTypedData({
      domain: hspDomain(w.chainId),
      types: mandateTypes,
      primaryType: "Mandate",
      message: mandateMessage(base),
    });
    const mandate: Mandate = { version: "hsp-mandate-v1", ...base, signature };
    const mHash = mandateHash(mandate);

    // Settlement: in the simulator the "on-chain transfer" is a deterministic pseudo tx hash.
    const rBase = {
      mandateHash: mHash,
      chainId: w.chainId,
      txHash: keccak256(toHex(`sim-settlement:${mHash}`)) as Hex,
      from: this.payer,
      to: req.to,
      amount: base.amount,
      observedAt: Math.floor(Date.now() / 1000),
      adapterId: w.adapterId,
      satisfies: [CAP.settlementVerified],
    };
    const rSig = await w.adapter.signTypedData({
      domain: hspDomain(w.chainId),
      types: receiptTypes,
      primaryType: "Receipt",
      message: receiptMessage(rBase),
    });
    const receipt: Receipt = { version: "hsp-receipt-v1", ...rBase, adapter: w.adapter.address, signature: rSig };

    const caps = req.compliance.map((c) => COMPLIANCE_CAP[c]);
    const attestations = [
      ...(await issueAttestations(w, this.payer, caps)),
      ...(await issueAttestations(w, req.to, caps.filter((c) => c === CAP.sanctions))),
    ];
    return { paymentId: mHash, mandate, receipt, attestations, backend: this.backend };
  }

  verify(result: Pick<PaymentResult, "mandate" | "receipt" | "attestations">, policy: TrustPolicy) {
    return verifyPayment(result.mandate, result.receipt, result.attestations, policy);
  }

  async attestableCapabilities(subject: Address, caps: Capability[]): Promise<Capability[]> {
    return (await issueAttestations(this.world, subject, caps)).map((a) => a.capability);
  }
}
