# Past Winners of HashKey Chain / HSK Chain Hackathons (2024–2026) and the Pattern of What Wins

Research date: 2026-11-25. Network note: in this environment only WebSearch snippets and GitHub (raw.githubusercontent.com, gh search) were reachable. dorahacks.io, x.com (402), medium.com, panewslab.com, aicoin.com, followin.io, luma.com, zaikei.co.jp, techflowpost.com and hackathonradar.com all failed to resolve or fetch, so most facts below come from search-engine snippets of those pages. Treat snippet-derived placings as "reported", not verified against the full page.

## 1. Winners of each HashKey hackathon (track, one-liner, tech, judge commentary)

### Takeaway
Confirmed podiums exist for the Japan edition (Jul 2026), the Hong Kong Hacker House "Taichu" (Dec 2024), and partly for the global Horizon Hackathon (Mar–Apr 2026) and the Seoul "Taiyi" hackathon (Mar 2025). The India/Mumbai winners (announced 5 Nov 2026) could not be found. Recent winners are mostly "AI agent + real payment/settlement rail" projects that state their compliance and safety limits openly and use HashKey's own rails (HSP, USDC.e on mainnet).

### Cited Findings

**A. HashKey Chain Horizon Hackathon (global, online plus demo day). Build period 10 Mar – 23 Apr 2026. Tracks: DeFi, PayFi, AI, ZKID. Prize pool 40,000 USDT.**
- Scale: 468 registered developers, 166 approved projects; tracks DeFi, PayFi, AI and ZKID — [DoraHacks report (snippet)](https://dorahacks.io/hackathon/2045/report)
- Co-organized by HashKey Chain, the Ethereum Application Guild (EAG) and DGrid AI; registration opened 5 Feb — [TechFlow event page (snippet)](https://www.techflowpost.com/en-US/events/3195)
- 28 finalist teams pitched live at Demo Day on 22 Apr 2026 ("grand finale of the Horizon Hackathon") — [HSK Chain on X](https://x.com/HSKChain/status/2046767383889735681)
- A HashKey Medium retrospective titled "HashKey Chain Horizon Hackathon: A Full Retrospective" lists these first places: **CoverFi Protocol (DeFi), FlowLink (PayFi), Clustly (AI)**, and **FairDrop** as first in **ZKID** (that entry is cut off in the snippet). It reports about 450 builders and twelve advancing teams — [HashKey Chain Medium (snippet)](https://medium.com/@HashKeyHSK)
  - Conflict: one search summary placed CoverFi under ZKID in the DoraHacks report. A Clustly team member's LinkedIn says Clustly took 1st in AI — [LinkedIn, Ryan Lim](https://sg.linkedin.com/in/ryanlimxy); [DoraHacks report](https://dorahacks.io/hackathon/2045/report)
- PayFi: **FlowLink 1st, HSP Payment Agent 2nd** (DoraHacks report as summarized by search) — [DoraHacks report](https://dorahacks.io/hackathon/2045/report)
  - **FlowLink**: a B2B crypto payment-automation platform with on-chain invoicing, payment links and AI payment agents. Its current GitHub README describes an "agent-native compliance-first payment layer on HashKey Chain". AI agents create stablecoin invoices and settle them, with OFAC screening and velocity limits applied at the call site and ed25519-signed receipts. Its agent surface uses `llms.txt`, `skills/*.md` and `.well-known/mcp.json`, with an `lib/hsp` module that degrades gracefully. The README calls itself "a ground-up rewrite of an earlier FlowLink prototype". It shows a testnet (chain 133) badge — [GitHub Akasxh/flowlink](https://github.com/Akasxh/flowlink)
  - **HSP Payment Agent**: handles payments and RWA investments through natural-language AI agents — [DoraHacks report (snippet)](https://dorahacks.io/hackathon/2045/report)
- AI: **Clustly** (1st per Medium and LinkedIn): AI agents that automate freelancing workflows, including verification and payment handling — [DoraHacks report](https://dorahacks.io/hackathon/2045/report). **Noah Comic** and **Sentinel Treasury** ("AI copilot for on-chain treasury management") are also listed as AI winners, places not stated — [DoraHacks report](https://dorahacks.io/hackathon/2045/report)
- DeFi: **CoverFi Protocol**: on-chain credit default swaps for tokenized RWAs, with algorithmic credit scoring and dual-tranche insurance pools — [DoraHacks report](https://dorahacks.io/hackathon/2045/report). (Its current GitHub org has moved to a Stellar/Soroban pilot, "testnet only" — [GitHub CoverFI-space/coverfi-contracts](https://github.com/CoverFI-space/coverfi-contracts).) **OutcomeX** is also listed under DeFi, place not stated — [DoraHacks report](https://dorahacks.io/hackathon/2045/report)
  - **OutcomeX** README: an "AI delivery network" where users buy outcomes, not prompts. Payment goes through PWR or **USDC/USDT via HSP**, with escrowed settlement, revenue splits, refunds, and machine NFTs whose claimable revenue gates transfer. It frames itself as "a DeFi submission first, not a generic AI app" with a "productive digital RWA" angle. Stack: Foundry contracts, FastAPI backend with HSP webhook and polling, deployed on **HashKey testnet (chain 133)** on 2026-04-14. The README admits "fully live merchant rollout still depends on environment and webhook setup" — [GitHub Contrarian3-Labs/OutcomeX](https://github.com/Contrarian3-Labs/OutcomeX)
- ZKID: **FairDrop**: zero-knowledge proofs enforce one-human-one-action for fair airdrops and private voting — [DoraHacks report (snippet)](https://dorahacks.io/hackathon/2045/report)
- **Moss** (@mymoss_io) posted that it "won the DeFi Track at the @HSKChain Horizon Hackathon". The post date (16 Feb) and place are unclear and do not cleanly match the global edition's timeline — [Moss on X](https://twitter.com/mymoss_io)

**B. HSK Chain Horizon Hackathon · Japan (around WebX Tokyo, Jul 2026). Tracks: AI, DeFi. Prize pool 12,000 USDT. Winners announced about 15 Jul 2026.**
- **AI track: 1st Helm (3,000 USDT), 2nd Maneki AI (2,000 USDT), 3rd MiuroAI (1,000 USDT)** — [HSK Chain on X](https://x.com/HSKChain/status/2077272198910529876?lang=en)
- **DeFi track: 1st AllScale Agentic Commerce Gateway (3,000 USDT, dorahacks.io/buidl/46727), 2nd Astrail (2,000 USDT), 3rd Dow Protocol (1,000 USDT)** — [HSK Chain on X](https://x.com/HSKChain/status/2077272198910529876?lang=en)
- Top projects also receive official incubation support and access to HSK Chain ecosystem resources — [HSK Chain on X (snippet)](https://x.com/HSKChain/status/2077272198910529876?lang=en)
- 12 teams presented at the Tokyo Demo Day, Helm among them — [Zaikei (snippet)](https://zaikei.co.jp/article/20260724/862732.html)
- Co-organized with FEB Event and AKINDO at WebX Tokyo 2026 — [KuCoin news](https://www.kucoin.com/news/flash/hashkey-hosts-on-chain-finance-forum-and-hackathon-at-webx-tokyo-2026)
- **Judging criteria (stated)**: real-world demand, commercialization potential, user experience, and potential to develop into on-chain financial infrastructure — [HackathonRadar Japan Demo Day listing (snippet)](https://www.hackathonradar.com/database/hackathon/hashkey-chain-horizon-hackathon-japan-demo-day-2026)
- **AllScale Agentic Commerce Gateway** (DeFi 1st), from a public repo tagged "HashKey Chain hackathon demo": an AI-agent checkout gateway. A request tagged ACP / AP2 / x402 / MPP becomes a canonical checkout. The gateway signs an EIP-712 quote, the agent calls `SettlementGateway.pay()` (ERC-20 transfer, with signature, expiry, replay and spending-limit checks), and a `CheckoutSettled` event receipt is verified. It is **deployed on HashKey Chain mainnet** (`0xDF0008D5…4fae01`, chain 177) against the real bridged **USDC.e** (`0x054ed458…`), with Blockscout tx links. The README is very candid: the protocol adapters are "interface-level mocks", the KYT (BlockSec) and Primus zkTLS gates are simulators, mock tokens are refused on mainnet, and approvals are bounded (1 USDC) — [GitHub slucifersz/allscale-agentic-commerce-gateway](https://github.com/slucifersz/allscale-agentic-commerce-gateway). Note: the repo's last push was 16 Jul 2026, so whether the mainnet deployment came before judging cannot be confirmed.
- **Maneki AI** (AI 2nd): the same team (OneHaydenZhang) maintains many ports: Celo (ERC-8004 identity for trading agents, x402 pay-per-request arena), Solana, OKX X Layer (A2MCP, x402, hire Hyperliquid trading agents), FuriosaAI NPU. It is a serial hackathon product about autonomous trading/asset-management agents paid via stablecoins — [GitHub search results: OneHaydenZhang/ManekiAI-*](https://github.com/OneHaydenZhang/ManekiAI-Celo)
- **Helm** (AI 1st): no HashKey-specific description found. A "Helm" project also shared a "Best Use of BNB Agent SDK" prize at a BNB hack, which suggests an AI-agent product reused across hackathons (same name, identity not confirmed) — [search summary; source not linked]

**C. HSK Chain Horizon Hackathon · India / Mumbai (Oct–Nov 2026). Tracks: AI Agent Trading; Agent Payments & A2A Settlement (same tracks as Seoul).**
- Prize pool 10,000 USDT. Per track: 1st 2,500, 2nd 1,500, 3rd 1,000 USDT. Demo Day 4 Nov 2026 in Mumbai, winners 5 Nov 2026 — [Luma Mumbai Demo Day (snippet)](https://luma.com/hashkey-demo-day-mumbai); [DoraHacks India (snippet)](https://dorahacks.io/hackathon/hskchainindia/detail)
- Panel: five judges, **three from ecosystem partners and two from HashKey Chain**. Three judged in person; the HashKey Chain judges and mentors joined remotely. Judging criteria were "TBC" on the listing — [Luma Mumbai Demo Day (snippet)](https://luma.com/hashkey-demo-day-mumbai)
- The Agent Payments track **requires HSP usage** — [Luma (snippet)](https://luma.com/hashkey-demo-day-mumbai)
- **Winners: NOT FOUND.** DoraHacks shows "Winner Announced", but no snippet names the winners.
- Visible India submissions on GitHub (non-winners unless proven otherwise) cluster around the same designs: EIP-712 mandates, escrow, x402, MCP servers, risk-guard vaults. Examples include NeelShah1505/hsk-a2a-settlement (gasless EIP-3009 escrow that HSP can settle into, delivery proof and refund, reputation, 10-tool MCP server), swarnnim/horizon-agent (EMA/RSI agent plus -3% kill switch) and Eshan276/concord-a2a (A2A negotiation settled via HSP) — [GitHub search](https://github.com/NeelShah1505/hsk-a2a-settlement)

**D. HashKey Chain Hackathon "Taiyi" (Seoul, 28–30 Mar 2025; 2nd stop of HashKey Hackerhouse series). Tracks: PayFi, Social, AI & AI Agent, AI Infra. Pool "500,000 HSK" (headline).**
- 110+ developers, 11 project submissions, **9 teams won track awards**. Sponsors: OKX Wallet, INFINI — [PANews (snippet)](https://www.panewslab.com/en/articledetails/1cqk9adz.html); [AiCoin (snippet)](https://www.aicoin.com/en/article/451226)
- Prizes: AI Agent 1st 2,000 HSK / 2nd 1,000 HSK; PayFi 1st 2,000 HSK / 2nd 1,000 HSK; 1,500 HSK each for best AI infra and best social; special student prize — [Luma Taiyi (snippet)](https://luma.com/va084lwn)
- **PayFi champion: OSY (Optimized Stable Yield)**, a stablecoin-yield tool; **runner-up: Portal Trade** — [PANews (snippet)](https://www.panewslab.com/en/articles/ac7x69ft)
- **AI & AI Agent champion: ChatPulse**. **HashScope** received an honorable mention (an API platform linking real-world data to the chain) — [AiCoin (snippet)](https://www.aicoin.com/en/article/451226)
- HashKey's recap: participants "built real-world #RWA, #MMF, and #AI use cases… From stablecoin yield tools to invoice NFTs — the future of compliant DeFi" — [HSK Chain on X](https://x.com/HSKChain/status/1907289601791914297)
- AI Infra and Social winners and the invoice-NFT team: not found.

**E. HashKey Hackerhouse "Taichu" (Hong Kong, 20–22 Dec 2024; 1st stop). Pool about $7,000. Theme: Web3 applications within regulatory frameworks.**
- **1st: Likwid & Stable Swap** (DeFi innovation); **2nd: Asteroidx & Lego Perpetual Protocol** (RWA/derivatives); **3rd: Bnb3 & Lightning Huskey** (RWA digitization); special awards: **Tiptag.social** (NFT social tools) and **Trusta** (payment security). Winners were to be "connected to the HashKey ecosystem" — [PANews](https://panews.io/articles/vy3u0sig); [AiCoin](https://www.aicoin.com/en/article/435906); [DoraHacks Taichu](https://dorahacks.io/hackathon/taichu2024)

### Inferences
- Across 2024–2026, the winning theme moved from "compliant DeFi/RWA primitives" (Taichu 2024: stable swap, perps, RWA) to "stablecoin yield/PayFi" (Taiyi 2025) to "AI agents that move real stablecoins under compliance and limits" (Horizon 2026: FlowLink, HSP Payment Agent, Clustly, OutcomeX; Japan: AllScale, Helm, Maneki). The Seoul tracks (agent trading, agent payments/HSP) are the endpoint of that shift.
- Notably, the Japan **DeFi** 1st place went to an **agentic payments/checkout gateway** (AllScale), and global PayFi 1st and 2nd were both agent-payment products. Judges reward "agent commerce settlement" across track labels.

### Gaps
- Full 2nd/3rd placements for the global Horizon tracks (the DoraHacks report was not reachable).
- India/Mumbai winners (5 Nov 2026).
- Descriptions of Helm, MiuroAI, Astrail, Dow Protocol, Noah Comic, ChatPulse, Portal Trade.
- Taiyi AI Infra and Social winners.

## 2. Who judged, and what did they say they valued?

### Takeaway
No judge names were found for any edition. Stated criteria emphasize real-world demand, commercialization, UX, and becoming on-chain financial infrastructure (Japan). For Seoul they are completeness, technical maturity and innovation, plus a bonus for official products. Panels mix HashKey Chain staff with ecosystem partners.

### Cited Findings
- Mumbai: a five-judge panel, 3 ecosystem partners plus 2 HashKey Chain — [Luma Mumbai](https://luma.com/hashkey-demo-day-mumbai)
- Japan: judging weighed real-world demand, commercialization potential, user experience, and potential to become on-chain financial infrastructure — [HackathonRadar (snippet)](https://www.hackathonradar.com/database/hackathon/hashkey-chain-horizon-hackathon-japan-demo-day-2026)
- HashKey's framing of its hackathons stresses "compliant" finance: Taichu was themed around regulatory frameworks, and Taiyi was recapped as "the future of compliant DeFi" — [PANews Taichu](https://panews.io/articles/vy3u0sig); [HSK Chain on X](https://x.com/HSKChain/status/1907289601791914297)
- Related ecosystem people appearing in HSK Chain's AI x on-chain Spaces (a signal of who is in the network, not confirmed judges): a Senior Product Manager of @HashKeyDEX, Jason Shen (founder of Articuler AI), and the Head of GoPlus Research — [HSK Chain on X](https://x.com/HSKChain/status/2039580319901446181)

### Inferences
- Expect Seoul to follow the Mumbai template, likely about 5 judges (HashKey Chain product/DevRel plus Korean and ecosystem partners). This is inference only.
- "Commercialization potential" and "on-chain financial infrastructure" language suggests judges favour a product that could become a real HashKey ecosystem primitive (a gateway, a settlement layer, risk rails) over a one-off app.

### Gaps
- No judge names or quotes for any edition. Full DoraHacks pages, Luma pages and X threads were unreachable.
- No judge commentary on individual winners was found.

## 3. Did winners integrate official HashKey products, and were they on mainnet?

### Takeaway
Several 2026 winners integrated **HSP** (FlowLink, HSP Payment Agent, OutcomeX). The Japan DeFi winner (AllScale) shows a **mainnet** deployment using **real USDC.e**. Global Horizon winners appear mostly testnet-based (chain 133). Mainnet plus official rails is a likely differentiator now that Seoul requires mainnet for prizes.

### Cited Findings
- OutcomeX: HSP stablecoin rail (USDC/USDT via HSP) with webhook/polling integration; testnet deployment 2026-04-14 — [GitHub OutcomeX](https://github.com/Contrarian3-Labs/OutcomeX)
- FlowLink: `lib/hsp` settlement via HSP mandate; testnet badge (chain 133) — [GitHub FlowLink](https://github.com/Akasxh/flowlink)
- HSP Payment Agent (PayFi 2nd) is named for HSP — [DoraHacks report](https://dorahacks.io/hackathon/2045/report)
- AllScale (Japan DeFi 1st): mainnet SettlementGateway on chain 177 with USDC.e; mainnet deploy and spending-limit txs linked on hsk.blockscout.com — [GitHub AllScale](https://github.com/slucifersz/allscale-agentic-commerce-gateway)
- Sources disagree on what HSP stands for: "HashKey Settlement Protocol" vs "HashKey Smart Payment" (the latter used in competitor repos) — [GitHub settlebridge](https://github.com/Devinricho22/settlebridge)

### Inferences
- HSKSwap is not visibly used by any confirmed past winner. Trading-agent tracks are new in the India and Seoul editions, so there is no winning precedent for Track 1.
- The honest "what is real vs. mocked" tables in the AllScale and FlowLink READMEs are a common feature of winners. Judges seem to tolerate mocks if they are clearly labelled and the core settlement path is real.

### Gaps
- No evidence of past winners using HashKey ID, CaaS or HashKey DID.
- Mainnet status of the global Horizon winners at judging time is unknown.

## 4. Seoul 2026 edition: judges, format, competition

### Takeaway
No Seoul judges are published in reachable sources. The format: 12,000 USDT pool, online build 20 Nov – 3 Dec 13:00 KST, demo day 5 Dec at Space Share Gangnam Center. Competition on GitHub is already dense, with dozens of near-identical "guard-railed HSKSwap agent" and "EIP-712 mandate escrow" repos.

### Cited Findings
- Hosted by HashKey Chain; submissions 20 Nov – 3 Dec 13:00; demo day 5 Dec, Space Share Gangnam Center; 12,000 USDT total — [brave-people/Dev-Event PR #798](https://github.com/brave-people/Dev-Event/pull/798)
- Competitor repos for Seoul and the Horizon tracks (all from GitHub search, 2026-11-25) include: Track 1: Keel (KeelVault risk guard plus chat approval), Kharon (an agent that refuses to trade, with on-chain proof), Leash / Glassbox (contract-enforced budgets on mainnet), Avow (each trade pre-committed as a falsifiable on-chain note), ARUNIKA, TrendPilot, Sentinel-hsk, SayTrade, Rowan Trade, HorizonQuant (EIP-712 session keys, HSKSwap V3). Track 2: Landed (airline delay compensation via HSP), Selesai/settletable, SettleBridge, AgentMandate (x402), MandateSettle, bountypilot-hsp (verify-before-pay compute), Proviso (AP2 over A2A, ERC-8004), AgentTab (EIP-712 vouchers plus batch settlement plus HSP top-ups) — [GitHub search results](https://github.com/Tharun2075/leash)
- One competitor repo claims DoraHacks rules require mainnet deployment for demo eligibility and prize claims, and another says this is unverified — [search summary of competitor repos](https://github.com/alphonshhhomenicmtu/horizonquant-hsk)

### Inferences (the pattern of what wins, for the report writer)
1. **Real money path, honestly scoped.** Winners show one end-to-end settlement flow that actually moves a real stablecoin (AllScale on mainnet USDC.e; OutcomeX and FlowLink through HSP) and openly label what is mocked.
2. **"Infrastructure, not app" framing.** Gateways, settlement layers and protocol-agnostic adapters (ACP/AP2/x402/MPP) map directly to the "on-chain financial infrastructure" criterion.
3. **Compliance as a feature.** OFAC/KYT gates, velocity and spending limits, signed receipts, and zk identity (FairDrop) fit HashKey's licensed, compliance-first brand.
4. **Closed economic loop.** OutcomeX (pay, execute, confirm, settle, yield) and Clustly (verify, then pay) both close the loop of demand, payment, delivery and settlement. Open-loop "AI chatbot + wallet" ideas do not appear among winners.
5. **Agent-native surfaces.** FlowLink's llms.txt, skills and MCP manifest, and AllScale's multi-protocol tags, show judges value interoperability with the agent ecosystem (MCP, x402, AP2, ERC-8004).
6. **Serial, polished teams win.** Maneki AI, Helm, CoverFi and FlowLink appear to be products carried across multiple hackathons. Production polish counts toward "completeness and technical maturity".
7. **Differentiation risk in Seoul.** The "risk-guarded vault + kill switch trading agent" and "EIP-712 mandate escrow" patterns are already saturated in competitor repos. Standing out likely needs a real mainnet HSKSwap/HSP flow, a credible business user, and a distinctive mechanism.

### Gaps
- Seoul judges, Korean partner involvement (e.g., pentabase) and the official rubric weights: not found.
- Confirmation of the mainnet-required rule from the official DoraHacks page: not reachable.
