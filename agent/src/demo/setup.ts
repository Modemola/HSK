// Wires a full Corridor world: chain + contracts, operators, HSP gateway, agents.
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, keccak256, toHex, type Hex, type LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  corridorEscrowAbi,
  corridorEscrowBytecode,
  corridorRegistryAbi,
  corridorRegistryBytecode,
  evidenceAnchorAbi,
  evidenceAnchorBytecode,
  mockUsdcAbi,
  mockUsdcBytecode,
} from "../chain/abis.ts";
import { chainById, CorridorChain, localChain, type Deployment } from "../chain/corridor.ts";
import { ComplianceAgent } from "../compliance/agent.ts";
import { coordinatorConfigFromEnv, createCoordinatorGateway } from "../hsp/coordinator.ts";
import { createSimulatorWorld, grant, LocalHspSimulator, trustPolicyFor } from "../hsp/simulator.ts";
import { CAP, type HspGateway, type TrustPolicy } from "../hsp/types.ts";
import { Ledger } from "../agents/ledger.ts";
import { PayoutAgent } from "../agents/payout.ts";
import { SenderAgent } from "../agents/sender.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");

// Well-known Hardhat development keys — LOCAL CHAIN ONLY.
const HARDHAT_KEYS: Hex[] = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
];

export type NetworkName = "local" | "testnet" | "mainnet";

export interface World {
  network: NetworkName;
  chain: CorridorChain;
  ledger: Ledger;
  sender: SenderAgent;
  payouts: PayoutAgent[];
  gateway: HspGateway;
  accounts: { deployer: LocalAccount; sender: LocalAccount; relayer: LocalAccount; payoutA: LocalAccount; payoutB: LocalAccount };
  valueScale: number;
  shutdown: () => void;
}

async function rpcUp(url: string) {
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' });
    return r.ok;
  } catch {
    return false;
  }
}

async function startLocalNode(): Promise<ChildProcess | null> {
  const url = localChain.rpcUrls.default.http[0]!;
  if (await rpcUp(url)) return null;
  const child = spawn("npx", ["hardhat", "node"], { cwd: path.join(repoRoot, "contracts"), stdio: "ignore" });
  for (let i = 0; i < 120; i++) {
    if (await rpcUp(url)) return child;
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error("local hardhat node did not start");
}

async function deployLocal(deployer: LocalAccount, sender: LocalAccount, relayer: LocalAccount, payouts: { acct: LocalAccount; name: string }[]): Promise<Deployment> {
  const pc = createPublicClient({ chain: localChain, transport: http() });
  const wc = createWalletClient({ account: deployer, chain: localChain, transport: http() });
  const deploy = async (abi: any, bytecode: Hex, args: unknown[]) => {
    const hash = await wc.deployContract({ abi, bytecode, args } as any);
    const r = await pc.waitForTransactionReceipt({ hash });
    return r.contractAddress!;
  };
  const write = async (address: Hex, abi: any, functionName: string, args: unknown[], account = deployer) => {
    const w = createWalletClient({ account, chain: localChain, transport: http() });
    const hash = await w.writeContract({ address, abi, functionName, args } as any);
    await pc.waitForTransactionReceipt({ hash });
  };
  const token = await deploy(mockUsdcAbi, mockUsdcBytecode, []);
  const registry = await deploy(corridorRegistryAbi, corridorRegistryBytecode, [deployer.address]);
  const escrow = await deploy(corridorEscrowAbi, corridorEscrowBytecode, [token, registry, deployer.address]);
  const anchor = await deploy(evidenceAnchorAbi, evidenceAnchorBytecode, [deployer.address]);
  await write(registry, corridorRegistryAbi, "setEscrow", [escrow]);
  await write(escrow, corridorEscrowAbi, "setRelayer", [relayer.address, true]);
  await write(anchor, evidenceAnchorAbi, "setAnchorer", [relayer.address, true]);
  await write(registry, corridorRegistryAbi, "registerOperator", [sender.address, 1, "Hanbit Remit (demo)", "KR->HK", keccak256(toHex("DEMO-KR-VA-TRANSFER-REG"))]);
  for (const [i, p] of payouts.entries()) {
    await write(registry, corridorRegistryAbi, "registerOperator", [p.acct.address, 2, p.name, "KR->HK", keccak256(toHex(`DEMO-HK-MSO-${i + 1}`))]);
  }
  await write(token, mockUsdcAbi, "mint", [sender.address, 1_000_000n * 10n ** 6n]);
  return { chainId: localChain.id, stablecoin: token, registry, escrow, evidenceAnchor: anchor };
}

function requireKey(name: string): Hex {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required for this network`);
  return v as Hex;
}

export async function createWorld(network: NetworkName = (process.env.CORRIDOR_NETWORK as NetworkName) ?? "local"): Promise<World> {
  let node: ChildProcess | null = null;
  let accounts: World["accounts"];
  let deployment: Deployment;
  const payoutNames = ["Victoria Payout (demo)", "Harbour Cash (demo)"];

  if (network === "local") {
    node = await startLocalNode();
    const [d, s, r, a, b] = HARDHAT_KEYS.map((k) => privateKeyToAccount(k));
    accounts = { deployer: d!, sender: s!, relayer: r!, payoutA: a!, payoutB: b! };
    deployment = await deployLocal(accounts.deployer, accounts.sender, accounts.relayer, [
      { acct: accounts.payoutA, name: payoutNames[0]! },
      { acct: accounts.payoutB, name: payoutNames[1]! },
    ]);
  } else {
    const file = path.join(repoRoot, "contracts", "deployments", `${network === "mainnet" ? "hashkeyMainnet" : "hashkeyTestnet"}.json`);
    deployment = JSON.parse(fs.readFileSync(file, "utf8"));
    accounts = {
      deployer: privateKeyToAccount(requireKey("RELAYER_PRIVATE_KEY")),
      sender: privateKeyToAccount(requireKey("SENDER_PRIVATE_KEY")),
      relayer: privateKeyToAccount(requireKey("RELAYER_PRIVATE_KEY")),
      payoutA: privateKeyToAccount(requireKey("PAYOUT_A_PRIVATE_KEY")),
      payoutB: privateKeyToAccount(requireKey("PAYOUT_B_PRIVATE_KEY")),
    };
  }

  const chain = new CorridorChain(chainById(deployment.chainId), deployment);
  const ledger = new Ledger();
  ledger.reset();

  // HSP: the organiser's Coordinator when credentials exist, otherwise the labelled local simulator.
  let gateway: HspGateway;
  let trust: TrustPolicy;
  const coord = coordinatorConfigFromEnv();
  if (coord) {
    gateway = await createCoordinatorGateway(coord);
    trust = {
      adapterAddress: requireKey("HSP_ADAPTER_ADDRESS") as `0x${string}`,
      trustedIssuers: (process.env.HSP_TRUSTED_ISSUERS ?? "").split(",").filter(Boolean) as `0x${string}`[],
      policyRequiredCaps: [],
    };
  } else {
    const world = createSimulatorWorld();
    // Demo fixture: the sender is KYC'd and screened, Victoria is screened, Harbour Cash is NOT.
    grant(world, accounts.sender.address, [CAP.kyc, CAP.sanctions]);
    grant(world, accounts.payoutA.address, [CAP.sanctions]);
    gateway = new LocalHspSimulator(world, accounts.sender);
    trust = trustPolicyFor(world);
  }

  const valueScale = Number(process.env.CORRIDOR_VALUE_SCALE ?? (network === "local" ? 1 : 0.001));
  const payouts = [
    new PayoutAgent(payoutNames[0]!, accounts.payoutA, { feeBps: 45, fxSpreadBps: 30, etaMinutes: 15 }, trust, ledger),
    // Cheapest quote — but its HSP issuer will not attest sanctions screening.
    new PayoutAgent(payoutNames[1]!, accounts.payoutB, { feeBps: 20, fxSpreadBps: 15, etaMinutes: 10 }, trust, ledger),
  ];
  const sender = new SenderAgent(
    {
      operatorName: "Hanbit Remit (demo)",
      account: accounts.sender,
      relayer: accounts.relayer,
      slaSeconds: Number(process.env.CORRIDOR_SLA_SECONDS ?? 3600),
      valueScale,
    },
    new ComplianceAgent(),
    gateway,
    chain,
    ledger,
  );

  ledger.writeMeta({
    network,
    chainId: deployment.chainId,
    explorer: chain.chain.blockExplorers?.default.url ?? null,
    deployment,
    hspBackend: gateway.backend,
    valueScale,
    operators: {
      sender: { name: "Hanbit Remit (demo)", address: accounts.sender.address },
      payouts: payouts.map((p) => ({ name: p.name, address: p.address })),
      relayer: accounts.relayer.address,
    },
    startedAt: new Date().toISOString(),
  });

  return {
    network,
    chain,
    ledger,
    sender,
    payouts,
    gateway,
    accounts,
    valueScale,
    shutdown: () => node?.kill(),
  };
}

export { repoRoot };
