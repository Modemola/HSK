// Typed access to the Corridor contracts on HSK Chain (mainnet 177, testnet 133, or a local node).
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseEventLogs,
  type Address,
  type Chain,
  type Hex,
  type LocalAccount,
  type PublicClient,
} from "viem";
import { corridorEscrowAbi, corridorRegistryAbi, evidenceAnchorAbi, mockUsdcAbi } from "./abis.ts";

export const hashkeyMainnet = defineChain({
  id: 177,
  name: "HashKey Chain",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: { default: { http: [process.env.HSK_MAINNET_RPC ?? "https://mainnet.hsk.xyz"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://hsk.blockscout.com" } },
});

export const hashkeyTestnet = defineChain({
  id: 133,
  name: "HashKey Chain Testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: { default: { http: [process.env.HSK_TESTNET_RPC ?? "https://testnet.hsk.xyz"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://testnet-explorer.hskchain.net" } },
  testnet: true,
});

export const localChain = defineChain({
  id: 31337,
  name: "Local (Hardhat)",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: { default: { http: [process.env.LOCAL_RPC ?? "http://127.0.0.1:8545"] } },
});

export function chainById(id: number): Chain {
  if (id === 177) return hashkeyMainnet;
  if (id === 133) return hashkeyTestnet;
  return localChain;
}

export function explorerTx(chain: Chain, hash: Hex): string | null {
  const base = chain.blockExplorers?.default.url;
  return base ? `${base}/tx/${hash}` : null;
}

export interface Deployment {
  chainId: number;
  stablecoin: Address;
  registry: Address;
  escrow: Address;
  evidenceAnchor: Address;
}

export const EvidenceKind = { Settlement: 0, Refund: 1, Blocked: 2 } as const;
export const EscrowStatus = ["None", "Locked", "Released", "Refunded"] as const;

export class CorridorChain {
  readonly publicClient: PublicClient;
  constructor(
    readonly chain: Chain,
    readonly d: Deployment,
  ) {
    this.publicClient = createPublicClient({ chain, transport: http() });
  }

  private wallet(account: LocalAccount) {
    return createWalletClient({ account, chain: this.chain, transport: http() });
  }

  private async send(account: LocalAccount, req: Parameters<ReturnType<typeof createWalletClient>["writeContract"]>[0]) {
    const { request } = await this.publicClient.simulateContract({ ...(req as any), account });
    const hash = await this.wallet(account).writeContract(request as any);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error(`transaction ${hash} reverted`);
    return receipt;
  }

  balanceOf(owner: Address) {
    return this.publicClient.readContract({ address: this.d.stablecoin, abi: mockUsdcAbi, functionName: "balanceOf", args: [owner] });
  }

  async approve(account: LocalAccount, amount: bigint) {
    return this.send(account, {
      address: this.d.stablecoin,
      abi: mockUsdcAbi,
      functionName: "approve",
      args: [this.d.escrow, amount],
    } as any);
  }

  async lock(
    sender: LocalAccount,
    p: { payout: Address; amount: bigint; deadline: bigint; mandateHash: Hex; quoteHash: Hex },
  ): Promise<{ transferId: Hex; txHash: Hex }> {
    const allowance = await this.publicClient.readContract({
      address: this.d.stablecoin,
      abi: mockUsdcAbi,
      functionName: "allowance",
      args: [sender.address, this.d.escrow],
    });
    if (allowance < p.amount) await this.approve(sender, p.amount);
    const receipt = await this.send(sender, {
      address: this.d.escrow,
      abi: corridorEscrowAbi,
      functionName: "lock",
      args: [p.payout, p.amount, p.deadline, p.mandateHash, p.quoteHash],
    } as any);
    const [ev] = parseEventLogs({ abi: corridorEscrowAbi, logs: receipt.logs, eventName: "Locked" });
    if (!ev) throw new Error("Locked event missing");
    return { transferId: ev.args.transferId, txHash: receipt.transactionHash };
  }

  async anchorReceipt(relayer: LocalAccount, transferId: Hex, receiptHash: Hex) {
    const r = await this.send(relayer, {
      address: this.d.escrow,
      abi: corridorEscrowAbi,
      functionName: "anchorReceipt",
      args: [transferId, receiptHash],
    } as any);
    return r.transactionHash;
  }

  async confirmPayout(payout: LocalAccount, transferId: Hex, proofHash: Hex) {
    const r = await this.send(payout, {
      address: this.d.escrow,
      abi: corridorEscrowAbi,
      functionName: "confirmPayout",
      args: [transferId, proofHash],
    } as any);
    return r.transactionHash;
  }

  async refund(caller: LocalAccount, transferId: Hex) {
    const r = await this.send(caller, {
      address: this.d.escrow,
      abi: corridorEscrowAbi,
      functionName: "refund",
      args: [transferId],
    } as any);
    return r.transactionHash;
  }

  async anchorEvidence(relayer: LocalAccount, subjectId: Hex, packHash: Hex, kind: number, uri: string) {
    const r = await this.send(relayer, {
      address: this.d.evidenceAnchor,
      abi: evidenceAnchorAbi,
      functionName: "anchor",
      args: [subjectId, packHash, kind, uri],
    } as any);
    return r.transactionHash;
  }

  getTransfer(transferId: Hex) {
    return this.publicClient.readContract({
      address: this.d.escrow,
      abi: corridorEscrowAbi,
      functionName: "getTransfer",
      args: [transferId],
    });
  }

  getOperator(op: Address) {
    return this.publicClient.readContract({
      address: this.d.registry,
      abi: corridorRegistryAbi,
      functionName: "getOperator",
      args: [op],
    });
  }

  isAnchored(packHash: Hex) {
    return this.publicClient.readContract({
      address: this.d.evidenceAnchor,
      abi: evidenceAnchorAbi,
      functionName: "isAnchored",
      args: [packHash],
    });
  }

  async now(): Promise<bigint> {
    const b = await this.publicClient.getBlock();
    return b.timestamp;
  }
}
