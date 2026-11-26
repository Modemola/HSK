// End-to-end Corridor demo.
//   npm run demo                         # local chain + local HSP simulator, no credentials needed
//   CORRIDOR_NETWORK=mainnet npm run demo # real contracts on HSK Chain (see README for env)
import { createTestClient, http } from "viem";
import { explorerTx, localChain } from "../chain/corridor.ts";
import { createWorld } from "./setup.ts";
import { refundCase, settlementCase, structuringCases } from "./scenarios.ts";

const c = { dim: "\x1b[2m", b: "\x1b[1m", g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", cy: "\x1b[36m", x: "\x1b[0m" };

async function main() {
  const world = await createWorld();
  const { ledger, sender, payouts, chain } = world;
  const tx = (h: `0x${string}`) => explorerTx(chain.chain, h) ?? h;

  ledger.onEvent((e) => {
    const line = (() => {
      switch (e.type) {
        case "case.received": return `${c.b}▶ ${e.caseId}${c.x} ${e.summary}`;
        case "compliance.reviewed": {
          const col = e.decision.startsWith("ALLOW") ? c.g : c.r;
          return `  ${c.cy}compliance${c.x} ${col}${e.decision}${c.x} ${c.dim}(intent: ${e.intentSource})${c.x}` +
            e.findings.map((f) => `\n    · ${f}`).join("");
        }
        case "quotes.received": return `  ${c.cy}quotes${c.x} ` + e.quotes.map((q) => `${q.payoutName}: HK$${q.payoutAmountHkd} (${q.feeBps}bps, ${q.etaMinutes}m)`).join(" | ");
        case "payee.rejected": return `  ${c.r}✗ ${e.name}${c.x} excluded before payment, missing ${e.missing.join(", ")}`;
        case "quote.selected": return `  ${c.g}✓ selected${c.x} ${e.payoutName}`;
        case "hsp.paid": return `  ${c.cy}HSP${c.x} compliant payment ${e.paymentId.slice(0, 18)}… via ${e.backend}`;
        case "hsp.verified": return `  ${c.cy}verifier${c.x} ${e.by}: ${e.outcome === "ACCEPT" ? c.g : c.r}${e.outcome}${c.x}${e.missing.length ? ` missing ${e.missing.join(", ")}` : ""}`;
        case "escrow.locked": return `  ${c.cy}escrow${c.x} locked ${Number(e.amount) / 1e6} USDC  ${c.dim}${tx(e.txHash)}${c.x}`;
        case "receipt.anchored": return `  ${c.cy}relayer${c.x} HSP receipt anchored  ${c.dim}${tx(e.txHash)}${c.x}`;
        case "payout.delivered": return `  ${c.cy}payout${c.x} HK$${e.amountHkd} delivered (${e.bankRef}, simulated FPS)`;
        case "escrow.released": return `  ${c.g}escrow released to payout operator${c.x}  ${c.dim}${tx(e.txHash)}${c.x}`;
        case "escrow.refunded": return `  ${c.y}escrow refunded to sender after SLA${c.x}  ${c.dim}${tx(e.txHash)}${c.x}`;
        case "evidence.anchored": return `  ${c.cy}evidence${c.x} ${e.kind} pack ${e.packHash.slice(0, 18)}… anchored  ${c.dim}${tx(e.txHash)}${c.x}`;
      }
    })();
    console.log(line);
  });

  console.log(`${c.b}Corridor demo${c.x} — network=${world.network} chainId=${chain.chain.id} HSP=${world.gateway.backend} valueScale=${world.valueScale}\n`);

  console.log(`${c.b}Scenario 1 — SME pays a Hong Kong supplier${c.x}`);
  const s1 = await sender.process(settlementCase(), payouts);
  console.log(`  → ${s1.status}\n`);

  console.log(`${c.b}Scenario 2 — structuring attempt (3 × HK$7,900)${c.x}`);
  for (const r of structuringCases()) {
    const o = await sender.process(r, payouts);
    console.log(`  → ${o.status}${o.compliance.remediation ? `: ${o.compliance.remediation}` : ""}`);
    console.log(`  ${c.dim}analyst: ${o.compliance.intent.narrative}${c.x}\n`);
  }

  console.log(`${c.b}Scenario 3 — payout operator misses the SLA${c.x}`);
  const s3 = await sender.process(refundCase(), payouts, { payoutFails: true });
  if (world.network === "local") {
    const test = createTestClient({ chain: localChain, mode: "hardhat", transport: http() });
    await test.increaseTime({ seconds: Number(process.env.CORRIDOR_SLA_SECONDS ?? 3600) + 1 });
    await test.mine({ blocks: 1 });
  } else {
    const wait = Number(process.env.CORRIDOR_SLA_SECONDS ?? 3600) + 5;
    console.log(`  waiting ${wait}s for the SLA to lapse…`);
    await new Promise((r) => setTimeout(r, wait * 1000));
  }
  const r3 = await sender.refundExpired(s3.caseId);
  console.log(`  → ${r3.status}\n`);

  const op = await chain.getOperator(payouts[0]!.address);
  console.log(`${c.b}On-chain record for ${op.name}${c.x}: settled=${op.settledCount} refunded=${op.refundedCount} volume=${Number(op.settledVolume) / 1e6} USDC`);
  console.log(`Ledger and evidence packs: ${ledger.dir}`);
  world.shutdown();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
