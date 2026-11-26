# Corridor: pitch, demo script and submission checklist

## One line

Corridor lets licensed remitters' AI agents settle Korea→Hong Kong stablecoin transfers through HSP's compliant payments, so every transfer carries verified KYC and sanctions attestations, a Travel-Rule packet and an FX-report record from the moment it settles.

## 3-minute demo

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "Korea's new rules for cross-border virtual-asset transfers start this month. Most illegal crypto FX runs on stablecoins. HashKey and Kbank have announced a compliant KR↔HK corridor. This is the settlement layer for it, running on HSK Chain." | Title slide, three facts |
| 0:20–0:50 | "A Seoul parts importer pays a Kowloon supplier ₩3M. Our Sender Agent gets quotes from licensed payout operators." | Console: case 001, payout auction |
| 0:50–1:25 | "The cheapest quote is Harbour Cash, but HSP's issuer won't attest it as sanctions-screened, so the agent drops it before any money moves. Victoria's own verifier ACCEPTs: KYC, sanctions and settlement all satisfied." | Auction table (rejected badge), HSP verification block |
| 1:25–1:55 | "Value is locked in escrow on HSK Chain mainnet. The escrow can't release until the HSP receipt is anchored and the payout operator confirms HKD delivery." | Blockscout links: lock → receipt anchored → released |
| 1:55–2:25 | "Now a worker sends HK$7,900 three times, just under Hong Kong's HK$8,000 Travel-Rule line. The first is fine. The second links to the first and is blocked. The third memo says '신고 안 되게 나눠서', 'split it so it isn't reported', and the agent catches the intent, refuses, and tells the operator to resubmit as one transfer with full Travel-Rule data." | Cases 102/103, findings, analyst narrative |
| 2:25–2:50 | "Every decision, including refusals and refunds, is an evidence pack whose hash is on chain. An auditor clicks once and re-verifies it. When a payout operator misses its SLA, the escrow refunds the sender and the compliance proofs stay attached." | Re-verify button ✅✅, refund case |
| 2:50–3:00 | "Real: contracts on mainnet, HSP compliant flow, compliance engine. Simulated: the bank legs. We want to pilot with an operator in the Kbank corridor." | Real-vs-simulated table |

## Likely judge questions

- **Why agents and not a form?** The decisions depend on context: linking transfers across a time window and across senders, reading intent in a Korean memo, choosing compliance over price in a live auction, and verifying counterparties independently. The deterministic rules make the call; the LLM explains and adds signals.
- **Is this legal in Korea?** Corridor is infrastructure for licensed and registered operators. It doesn't convert KRW peer to peer, and the fiat legs stay with the licensed parties. It produces the records the new regime asks for.
- **Why HSK Chain and HSP?** HSP's compliant profile (attestations plus a subset-rule verifier) is exactly what a regulated corridor needs, and HSK Chain gives low fees, fast finality and USDC.e.
- **Testnet HSP and mainnet escrow?** The HSP sandbox is testnet-only. A relayer anchors the ACCEPTed receipt hash on mainnet. Once HSP runs on mainnet, the escrow can be registered as a custom HSP settlement adapter and the relayer goes away.
- **What stops a rogue relayer?** Today it's trusted (disclosed). Next step: verify the adapter's receipt signature on chain.

## Day-one questions for organisers (Telegram / pentabase)

1. Is a mainnet deployment strictly required for prizes, and does mainnet escrow plus testnet HSP count as using HSP?
2. Does the Seoul sandbox support compliant payments (`attests:kyc`, `attests:sanctions`)? Who runs the issuer, and can it attest our test addresses (and *refuse* one, for the demo)?
3. Coordinator `@hsp/sdk` or MCP gateway: which counts as the official HSP integration? Is there a chain-177 endpoint?
4. How long does registering a custom `@hsp/devkit` adapter take?
5. Are HKDAP or RDUSD available on HSK Chain for teams?
6. What are the rubric weights and the official-product bonus rules?

## Submission checklist (deadline 3 Dec 2026 13:00 KST)

- [ ] Contracts deployed and verified on HSK mainnet; addresses in README
- [ ] One full mainnet demo run recorded (Blockscout links visible)
- [ ] HSP Coordinator run (or clearly labelled simulator run if sandbox access never arrives)
- [ ] `ANTHROPIC_API_KEY` set for the recorded run so the narrative comes from Claude
- [ ] 3-minute video and 5-slide deck
- [ ] DoraHacks BUIDL page: track 2, repo link, video, real-vs-simulated table
- [ ] Submit by 2 Dec evening KST (buffer)
