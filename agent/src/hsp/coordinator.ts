// Adapter for the organiser-hosted HSP Coordinator via the official `@hsp/sdk`.
//
// The SDK is distributed as a git repository to hackathon teams (not on npm). Once the
// organisers share <REPO_URL>, <COORDINATOR_URL>, <API_KEY> and the issuer URL:
//   1. clone the repo and `npm install /path/to/hsp/packages/sdk /path/to/hsp/packages/core`
//   2. set HSP_COORDINATOR_URL, HSP_API_KEY, HSP_ISSUER_URL, HSP_PRIVATE_KEY, HSP_ADAPTER_ADDRESS
//   3. run with CORRIDOR_HSP_BACKEND=coordinator
// The call shapes below follow the HashFans "Building on HSP" guide (pay(), profile.compliance,
// awaitSettled(), HSPVerifier.verify()). Field mapping must be re-checked against the SDK source.
import type { Address, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { HspGateway, PaymentResult, PayRequest, TrustPolicy, VerifyDecision } from "./types.ts";

export interface CoordinatorConfig {
  coordinatorUrl: string;
  apiKey: string;
  issuerUrl?: string;
  privateKey: Hex;
  chainName: string; // e.g. "hashkey-testnet"
}

export async function createCoordinatorGateway(cfg: CoordinatorConfig): Promise<HspGateway> {
  const sdkName = "@hsp/sdk";
  const coreChains = "@hsp/core/chains/index";
  // Dynamic, string-built specifiers so the project builds without the SDK installed.
  const sdk: any = await import(sdkName).catch(() => {
    throw new Error("@hsp/sdk is not installed. See src/hsp/coordinator.ts for setup steps.");
  });
  const { resolveChain }: any = await import(coreChains);
  const chain = resolveChain(cfg.chainName);
  const client = new sdk.HSPClient({
    coordinatorUrl: cfg.coordinatorUrl,
    apiKey: cfg.apiKey,
    issuerUrl: cfg.issuerUrl,
    signer: { kind: "privateKey", privateKey: cfg.privateKey },
    chain,
  });
  const payer = privateKeyToAccount(cfg.privateKey).address;

  return {
    backend: "hsp-coordinator",
    payer,
    async pay(req: PayRequest): Promise<PaymentResult> {
      const handle = await client.pay({
        to: req.to,
        amount: req.amount,
        profile: req.compliance.length ? { compliance: req.compliance } : undefined,
        // Corridor binds the payment to its quote; if the SDK exposes a memo/reference field use it here.
        reference: req.reference,
      });
      await handle.awaitSettled();
      const stored = await fetch(`${cfg.coordinatorUrl}/payments/${handle.paymentId}`).then((r) => r.json());
      return {
        paymentId: handle.paymentId as Hex,
        mandate: stored.mandate,
        receipt: { ...stored.receipt, txHash: (stored.receipt?.txHash ?? handle.txHash) as Hex },
        attestations: stored.attestations ?? [],
        backend: "hsp-coordinator",
      };
    },
    async verify(result, policy: TrustPolicy): Promise<VerifyDecision> {
      const verifier = new sdk.HSPVerifier({
        chain,
        adapterAddress: policy.adapterAddress,
        compliance: { trustedIssuers: policy.trustedIssuers, policyRequiredCaps: policy.policyRequiredCaps },
      });
      const d = await verifier.verify(result.mandate, result.receipt, result.attestations);
      const required: string[] = d.required ?? policy.policyRequiredCaps;
      const satisfied: string[] = d.satisfied ?? [];
      return {
        ok: Boolean(d.ok && d.outcomeClass === "ACCEPT"),
        outcomeClass: d.outcomeClass,
        required,
        satisfied,
        missing: required.filter((c) => !satisfied.includes(c)),
        reasons: d.reasons ?? [],
      };
    },
  };
}

export function coordinatorConfigFromEnv(): CoordinatorConfig | null {
  const { HSP_COORDINATOR_URL, HSP_API_KEY, HSP_PRIVATE_KEY, HSP_ISSUER_URL, HSP_CHAIN } = process.env;
  if (!HSP_COORDINATOR_URL || !HSP_API_KEY || !HSP_PRIVATE_KEY) return null;
  return {
    coordinatorUrl: HSP_COORDINATOR_URL,
    apiKey: HSP_API_KEY,
    issuerUrl: HSP_ISSUER_URL,
    privateKey: HSP_PRIVATE_KEY as Hex,
    chainName: HSP_CHAIN ?? "hashkey-testnet",
  };
}

export type { Address };
