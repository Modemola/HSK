# Competitor Landscape: HSK Chain Horizon Hackathon · Seoul (Nov 20 – Dec 3 2026)

Method note: GitHub repository search (about 55 queries, including `created:>2026-11-12` sweeps) plus GitHub code search (`HSP_COORDINATOR_URL`, `HSKSwap`, `HashKey Settlement Protocol`, `hsk.xyz`, `chainId: 177`, ...). I downloaded READMEs for 105 candidates and keyword-scanned them. I read the heads and HSP-related lines of every Seoul repo. I did not run any competitor code. A README tells you what a team claims, not what the code does, so the quality ratings below come from README evidence only: verified addresses, test counts, live links and an honest-status section. Unless noted, the source for a row is its repo, at `https://github.com/<owner>/<repo>`. Repos created between Oct 23 and Nov 5 2026 belong to the Horizon **Mumbai/India** edition (Oct 23 – Nov 5). Repos from April and July 2026 belong to earlier Horizon editions (PayFi Demo Day April 22; Japan edition July). These are listed only as context.

## Q1. Who is competing in Seoul, and how complete is each entry?

### Takeaway
I found about 40 public Seoul-edition repos: about 26 in Track 1 (trading) and about 15 in Track 2 (HSP / A2A). Track 1 is almost a monoculture: "LLM or rule-based agent + an owner-controlled vault contract with caps, daily loss limits, a pause or kill switch, and a decision log." Track 2 is mostly "EIP-712 mandate + escrow + on-chain receipt." Only about 5 Track 2 entries call a real HSP endpoint, and all of them use HSP's **Agentic Payment MCP gateway** (`create_order` / `prepare_payment` / `submit_payment`, QA allowlist). None of them uses the Coordinator `@hsp/sdk`, compliant (KYC/sanctions) payments, HSP x402 or a custom adapter.

### Cited Findings

**Track 1: AI Agent Trading on HSKSwap (Seoul)**

| Repo | One-line pitch | Target user | HSP | Mainnet (177)? | Quality / completeness |
|---|---|---|---|---|---|
| [SuperPhant/leash-hsk](https://github.com/SuperPhant/leash-hsk) | Agent trades HSK/BTC/ETH only inside an on-chain mandate vault: caps, frequency, stop-loss, drawdown breaker. Chat changes rules by owner-signed tx. Uses APRO feeds | Retail owner delegating to a bot | n/a | **Yes**, live vault with real USDT since Nov 22; "5 attacks blocked" | High |
| [yayguru/keel-hsk](https://github.com/yayguru/keel-hsk) | WHSK/USDT agent with APRO oracle, KeelVault, chat approval UI | Retail | n/a | **Yes**, verified vault, 2:16 video recorded on mainnet | High |
| [Tharun2075/glassbox](https://github.com/Tharun2075/glassbox) | Paper-first: commits each prediction on-chain, Brier-scores it, and `setLive` reverts until the score passes | Retail / allocators | n/a | **Yes**, verified guard plus HSKSwap quote adapter | High (novel "earn the right to trade") |
| [Pras454/SayTrade](https://github.com/Pras454/SayTrade) | Natural-language strategies (Indonesian/English) become guarded trades | Indonesian retail | n/a | **Yes**, StrategyVault (Sourcify) and first live trade on Nov 21 | High |
| [2010180016y-netizen/sentinel-vault-hsk](https://github.com/2010180016y-netizen/sentinel-vault-hsk) | Vault limits plus the agent's *claims* settled on-chain; Coinbase x402 v2 paywall (paper settlement by default) | Retail / signal buyers | none (x402 only) | Mainnet fork, 49 tx; 74 tests | High |
| [yhoyoex/preflight-hsk](https://github.com/yhoyoex/preflight-hsk) | Pre-trade cost check plus on-chain revert if limits are exceeded; infrastructure for *other* agents; playground and leaderboard | Agent developers | n/a | Fork tests at a pinned mainnet block; Vercel app | High (infra angle) |
| [rmndkyl/hsk-guardrail](https://github.com/rmndkyl/hsk-guardrail) (Kharon) | Agent that *refuses* to trade and proves the refusal was right; measured that the HSKSwap pool tracks the world price, so there is no edge | Risk-averse owners | n/a | 26/26 tests on mainnet fork | Medium-high |
| [Hajrajadoon/quorum-hsk](https://github.com/Hajrajadoon/quorum-hsk) | Three LLM agents debate each trade; vault enforces limits; reasoning committed on-chain | Retail | n/a | No (testnet + MockAdapter; mainnet "after hackathon") | Medium-high (site, deck) |
| [lala1224488686/mandate-trader](https://github.com/lala1224488686/mandate-trader) | WETH/USDT agent with cost gate plus owner-signed mandate (BUIDL #51770) | Retail | n/a | Not yet (6/6 mainnet-fork tests) | Medium |
| [unaboss/oil-desk-agent](https://github.com/unaboss/oil-desk-agent) | WTI oil agent using CFTC/EIA signals and Polymarket odds; paper oil book held in MandateVault | Signal buyers | n/a | Claims a mainnet MandateVault | Medium (only RWA-flavoured T1 entry) |
| [Godson-droid/clerk-it](https://github.com/Godson-droid/clerk-it) | Four paper "clerks" compete on one pool; only the leader may trade | Retail | n/a | No | Medium |
| [GHEA12/sentinel-hsk](https://github.com/GHEA12/sentinel-hsk) | SentinelGuard vault (per-trade cap, daily volume, kill switch) | Retail | n/a | No (testnet live on Nov 25; mainnet "pending") | Medium |
| [666Crypro/hsk-horizon-agent](https://github.com/666Crypro/hsk-horizon-agent) | "HSK Sentinel": vault limits, fork tests against the real pool | Retail | n/a | Fork only | Medium |
| [AndreyJackKali/hsk-basisflow-agent](https://github.com/AndreyJackKali/hsk-basisflow-agent) | Basis/EMA plus Monte Carlo; non-custodial vault; deck and video | Retail | n/a | Reads mainnet; MockPool on testnet | Medium (template-like) |
| [alphonshhhomenicmtu/horizonquant-hsk](https://github.com/alphonshhhomenicmtu/horizonquant-hsk) | EIP-712 session-key vault, TWAP guard, decision ledger | Retail | n/a | Reads mainnet | Medium (template-like, same style as BasisFlow) |
| [azkamahvin88/arunika-hsk](https://github.com/azkamahvin88/arunika-hsk) | Guard-railed WHSK/WETH/WBTC agent | Retail | n/a | No ("intentionally NOT done") | Medium |
| [Thabiiey411beta/hsk-agent](https://github.com/Thabiiey411beta/hsk-agent) | Paper-first verifiable agent; Supra oracle plus TWAP; JSONL journal | Retail | n/a | No | Medium |
| [ZQ051031/hsk-chain-horizon](https://github.com/ZQ051031/hsk-chain-horizon) | Python multi-signal agent with paper fills | Retail | n/a | No | Medium |
| [pinkfunsolana/horizon-agent-trader](https://github.com/pinkfunsolana/horizon-agent-trader) | Rule-bound vault agent | Retail | n/a | No (testnet) | Medium |
| [sandi215/hsk-chain-agent](https://github.com/sandi215/hsk-chain-agent) | Reference-peg mean reversion; Telegram UI; own V2 pool with mUSDC | Retail | n/a | No (testnet) | Medium-low |
| [tanglangbc/trendpilot-hsk](https://github.com/tanglangbc/trendpilot-hsk) | EMA trend-follower; mocks; paper | Retail | n/a | No | Medium-low |
| [ferly7/hsk-horizon-sentinel](https://github.com/ferly7/hsk-horizon-sentinel) | Agent that proves it never broke its rules (trade journal anchoring) | Retail | n/a | Pending | Medium-low |
| [danielamodu/Tranche](https://github.com/danielamodu/Tranche) | **LPs** commit inventory to time-bounded execution offers (ERC-721 tickets); includes an "HSP adapter" for EIP-712 compliance attestation, mandate and receipt | LPs / large traders / execution agents | HSP-style adapter (not the real SDK) | No (fork only); 61 tests | Medium-high; **closest to the LP white space** |
| [VB-Blue/horizonguard-hsk](https://github.com/VB-Blue/horizonguard-hsk) | Risk guard vault plus mandate escrow (spans both tracks) | — | mock | No | Low |
| whiteholic-beep/rowan-trade, Vendhan1512/Al-Trading-Automation | Paper trading (no README) | — | — | — | Low/unknown |

**Track 2: Agent Payments & A2A Settlement (HSP) (Seoul)**

| Repo | One-line pitch | Target user | Real HSP or mock | Mainnet? | Quality |
|---|---|---|---|---|---|
| [swiftbotlabs/caremandate](https://github.com/swiftbotlabs/caremandate) | Pays a mother's carer in Busan per *confirmed* visit. The mother taps Yes on a tablet (EIP-712); the daughter's agent pays via HSP; won-to-USDC rate is encoded in the mandate | Korean families / care agencies | **Real**: HSP Agentic Payment MCP client with a "signing firewall", tests on real HSP QA replies, testnet e2e | Mainnet fork rehearsal | **High**. Same team built India's hsk-meter. Strongest Korea-localised entry |
| [k58v2hbzkk-del/Tandem](https://github.com/k58v2hbzkk-del/Tandem) | One HSP payment split across an agent team (the `pay_to` is a counterfactual split address) | Multi-agent teams | **Real** HSP MCP flow (`create_order` → `prepare_payment` → `submit_payment`), QA allowlist; local stand-in for demo | Testnet | Medium-high (sharp insight: "an HSP order has one `pay_to`") |
| [phee24/mandatesettle](https://github.com/phee24/mandatesettle) | Two rails behind one adapter: HSP MCP (EIP-3009, `cart_hash`, `flow_id`) and its own delivery-gated escrow | Agent builders | **Real** HSP MCP (Mode 1) plus own escrow | Testnet/mainnet-ready | Medium-high |
| [Tharun2075/leash](https://github.com/Tharun2075/leash) | Per-agent budget contract (daily allowance, per-payment cap, shop allowlist, cooldown) in front of the HSP Gateway | Agent owners | HSP MCP `live\|mock`; **defaults to mock, "QA access pending"** | **Yes**, budget contract on mainnet | High |
| [aan192/agentpay-escrow](https://github.com/aan192/agentpay-escrow) | Job escrow released with an HSP mandate reference | Agent marketplaces | Client for `hsp-mcp.hashkey.com/mcp`; the mandate reference looks synthetic | Testnet (+ mainnet claim) | Medium |
| [kustantograndius/agentmandate-hsk](https://github.com/kustantograndius/agentmandate-hsk) | Capped EIP-712 mandates, A2ASettlement plus service registry, x402 seller (paid wallet report) | Agent API sellers | **No real HSP** ("payment shape published for HSP") | **Yes**, but settles MockUSDC on mainnet | Medium |
| [cocvn157/mandaterail-hsp](https://github.com/cocvn157/mandaterail-hsp) | x402 gatekeeper plus fail-closed mandate vault | Agent builders | HSP in name only (native HSK / Sepolia USDC) | No (testnet 133; claims organizer accepts testnet) | Medium |
| [rezimx-btc/hsk-proof-gated-payee](https://github.com/rezimx-btc/hsk-proof-gated-payee) | Autonomous verifier agent gates escrow release | Payers | **Explicitly no HSP** ("could not verify any public HSP developer API") | No | Medium |
| [0xvikram/landed](https://github.com/0xvikram/landed) | Airline agent pays flight-delay compensation via HSP; receipts on HSK | Travellers / airlines | Claims HSP | Unknown (README not at root) | Unknown |
| [emiliotecnologias/hsk-horizon-agent-settlement](https://github.com/emiliotecnologias/hsk-horizon-agent-settlement) | Buyer/worker/watcher agents; "HSP-style" mandate escrow | Agent builders | Mock | Not deployed | Medium-low |
| [tungdeptrai07/hsk-agent-settle](https://github.com/tungdeptrai07/hsk-agent-settle) | Escrow, 1-hour dispute window, reputation; simulator console | Agent builders | Mock | No | Low-medium |
| [devbox-zero-ops/agentsettle-hsk](https://github.com/devbox-zero-ops/agentsettle-hsk) | Mandate caps plus execution-log hash | — | Mock | Testnet | Low |
| [Devinricho22/settlebridge](https://github.com/Devinricho22/settlebridge), [VexorHQ/settletable](https://github.com/VexorHQ/settletable) | Payer hires worker and settles via HSP / negotiation table | — | Not built yet ("In development" / "plan only") | No | Stub |
| [elon00/qmoosa-horizonpay-ai](https://github.com/elon00/qmoosa-horizonpay-ai) | Generic "AI-agent payments". The same account mass-created about 20 "HashKey X AI" repos on Oct 26 | — | — | — | Spam-like |

**India/Mumbai edition context (Oct 23 – Nov 5; required mainnet + HSP API)** — [TechFlow event page](https://www.techflowpost.com/en-US/events/3332)
- Track 2 strongest: [swiftbotlabs/hsk-meter](https://github.com/swiftbotlabs/hsk-meter) (per-request API metering, x402, mainnet contract, 14 real HSP payments, KYC-SBT compliant mode, adapter-signed receipts, MCP buyer); [theyuvan/Sealed](https://github.com/theyuvan/Sealed) (sealed-budget buying, HSP coordinator); [rohan911438/Nundina](https://github.com/rohan911438/Nundina) (pay-if-right trading signals, x402 via HSP facilitator, KYC badges on the roadmap); [0xultravioleta/agentsettle-hsk](https://github.com/0xultravioleta/agentsettle-hsk) (its own open-source x402 facilitator on HashKey mainnet plus HSP); [Caerlower/charter](https://github.com/Caerlower/charter); [RaYYeR220/proviso](https://github.com/RaYYeR220/proviso) (escrow whose address is the deal's terms); [vipinraj32/a2a-influencer-settlement](https://github.com/vipinraj32/a2a-influencer-settlement); [thebunnygoyal/bountypilot-hsp](https://github.com/thebunnygoyal/bountypilot-hsp) (the only README mentioning `@hsp/sdk`/`HSPClient`); [SatyamDev803/risklayer](https://github.com/SatyamDev803/risklayer); [devx-agent/devx-agenttab](https://github.com/devx-agent/devx-agenttab) (vouchers + batch settlement); [Eshan276/concord-a2a](https://github.com/Eshan276/concord-a2a); [NeelShah1505/hsk-a2a-settlement](https://github.com/NeelShah1505/hsk-a2a-settlement); [astra-tc/hsp-a2a-settlement](https://github.com/astra-tc/hsp-a2a-settlement); [codewithpradeep14/AgentBazaar](https://github.com/codewithpradeep14/AgentBazaar); [hari-hara-sudharsan/Credence-Clear](https://github.com/hari-hara-sudharsan/Credence-Clear); [queenellis2026-hash/lamplight-pay-hsk](https://github.com/queenellis2026-hash/lamplight-pay-hsk); [mesh-pch/leash-hashkey](https://github.com/mesh-pch/leash-hashkey); [kanakagarwal0901/HashKey-Chain-Horizon](https://github.com/kanakagarwal0901/HashKey-Chain-Horizon); [sidsri14/agentpay-hsk](https://github.com/sidsri14/agentpay-hsk); [eres0045/hashkey-hsp](https://github.com/eres0045/hashkey-hsp).
- Track 1: RohanGlitched/avow, Sandesh13fr/vyuh, mesh-pch/sentinel-hashkey, Eshan276/omeswap-hsk, GETOfinance/Clodds-HSK, monickverma/holdfast, n1shanthb/Nalvis-HSK, AceVikings/horizon-hack-flow, divyyyam/zethos (prices swaps from CEX order books and settles signed quotes, i.e. RFQ market-maker style), 9xj89gzrtw-hue/hsk-perps-trading-agent, sreenivasivbieb/automatic-trading-agent (Krono), dddgzeth/waypoint-hashkey, swarnnim/horizon-agent, ansu555/omega-ai-app, tmanas06/omnivalut-ai, fokrulanthro16-eng/veriquant-hsk-terminal.
- Earlier editions (April PayFi / July Japan), relevant to "already taken": [tang-vu/tessera](https://github.com/tang-vu/tessera) (on-chain credit bureau for AI agents with under-collateralised lending), [hari-hara-sudharsan/credence-ai](https://github.com/hari-hara-sudharsan/credence-ai) (AI credit infrastructure), [himanshu-sugha/StreamYield](https://github.com/himanshu-sugha/StreamYield) (AI payroll streaming), [ZhenYan1214/NullGate](https://github.com/ZhenYan1214/NullGate) (ZK RWA compliance), [capinhoooo/complibot](https://github.com/capinhoooo/complibot) (AI compliance agent), [Kodark220/ZKRemit](https://github.com/Kodark220/ZKRemit) (ZK remittance with HSPSettlement.sol, April), [Akasxh/flowlink](https://github.com/Akasxh/flowlink) ("compliance-first payment layer"), [flip18731/SplitSettl](https://github.com/flip18731/SplitSettl) (AI invoice/contribution splits), [dolepee/slaa](https://github.com/dolepee/slaa), [KanishJebaMathewM/SentryPay-HashKey](https://github.com/KanishJebaMathewM/SentryPay-HashKey), [nickthelegend/molfi-predict-hashkey-monorepo](https://github.com/nickthelegend/molfi-predict-hashkey-monorepo) (prediction markets with HSP settlement and MCP).
- The official HSP developer guide describes the Coordinator stack: `@hsp/sdk` `pay()`/`verify()`, `@hsp/mcp` (`hsp_quote/pay/status/verify` with SpendGuard), `skills/hsp-pay`, `@hsp/devkit` for custom adapters plus a conformance suite, and four scenarios: public evm-transfer, public x402, **compliant** evm-transfer (`attests:kyc` + `attests:sanctions`), and **compliant** x402. ACCEPT iff requiredCapabilities ⊆ satisfiedCapabilities — [HashkeyHSK/documentation HSP guide](https://raw.githubusercontent.com/HashkeyHSK/documentation/HEAD/contents/docs/HSP/index.mdx)
- Seoul entries with real integrations instead use the "HSP Agentic Payment" MCP gateway (`create_order`/`prepare_payment`/`submit_payment`/`get_chain_config`, egress-IP QA allowlist, QA test token) — [Tandem](https://github.com/k58v2hbzkk-del/Tandem), [caremandate](https://github.com/swiftbotlabs/caremandate), [Tharun2075/leash](https://github.com/Tharun2075/leash), [phee24/mandatesettle](https://github.com/phee24/mandatesettle)
- Seoul prize pool claims: 12,000 USDT total, 6,000 per track, split 3,000/2,000/1,000. Deadline Dec 3 13:00 KST; Demo Day Dec 5; winners Dec 6 — [tanglangbc/trendpilot-hsk README](https://github.com/tanglangbc/trendpilot-hsk), [VexorHQ/settletable](https://github.com/VexorHQ/settletable). This is unverified against DoraHacks, which is blocked.
- The mainnet requirement is disputed among Seoul teams. Some say "testnet accepted, winners migrate with an organizer gas grant" ([cocvn157](https://github.com/cocvn157/mandaterail-hsp), [Hajrajadoon](https://github.com/Hajrajadoon/quorum-hsk)); others say "mainnet deployment required for demo eligibility" ([Thabiiey411beta](https://github.com/Thabiiey411beta/hsk-agent), [azkamahvin88](https://github.com/azkamahvin88/arunika-hsk)). The Mumbai edition did require mainnet ([TechFlow](https://www.techflowpost.com/en-US/events/3332)).

### Inferences
- The visible Seoul field (about 40 repos) is larger than DoraHacks' roughly 25–28 submissions, because stubs, plan-only repos and repos for future submissions are included. Expect about 15–18 serious Track 1 entries and about 8–10 Track 2 entries.
- The top of Track 1 is crowded with well-built, mainnet-verified vault agents: Leash, Keel, Glassbox, SayTrade, Sentinel-vault, Preflight. One more "vault + caps + chat" entry will not stand out.
- Track 2 is less crowded at the high end. Only caremandate, Tandem, mandatesettle and Tharun's leash have credible HSP calls, and Tharun's defaults to mock.
- Several README-heavy, low-substance repos look auto-generated (BasisFlow, HorizonQuant, MandateRail, elon00 series). Judges will likely discount them.

### Gaps
- I could not see the DoraHacks BUIDL list (blocked), so private and unsubmitted repos are missing. 0xultravioleta notes "Private until submit."
- I could not confirm whether the Seoul organizers distributed the Coordinator `@hsp/sdk` sandbox or only the MCP gateway; READMEs suggest the MCP gateway is the live surface.
- India/Japan winners were not found in search results.

## Q2. How do the projects cluster?

### Takeaway
Six clusters. More than 80% of Seoul entries fall into two templates: guarded trading vaults and mandate escrows.

### Cited Findings
| Cluster | Seoul count | India (context) | Examples |
|---|---|---|---|
| A. Guarded trading vault agent (caps, kill switch, stop-loss, decision log, chat) | ~20 | ~12 | leash-hsk, keel, sentinel-hsk, quorum, SayTrade, arunika, trendpilot |
| A′. "Prove-yourself" variants: paper-first scoring, refusal proofs, claims settlement, tournaments, cost preflight | 6 (inside A) | avow, holdfast | glassbox, Kharon, sentinel-vault, clerk-it, preflight, mandate-trader |
| B. EIP-712 mandate + escrow + receipt (A2A jobs) | ~9 | ~12 | mandatesettle, agentpay-escrow, agentmandate, mandaterail, proof-gated-payee, hsk-agent-settle |
| C. Agent spend budget / allowance contract | 1–2 | mesh-pch/leash | Tharun2075/leash |
| D. Vertical real-world payment use case | 2 (eldercare in Korea; airline delay compensation) | influencer deals, compute bounties, signals | caremandate, landed |
| E. Payment primitives (splits, metering, x402) | 1–2 (Tandem splits; sentinel-vault x402) | hsk-meter, agenttab, ultravioleta facilitator | Tandem |
| F. LP / liquidity / market structure | 1 (Tranche) | zethos (RFQ) | Tranche |

### Inferences
- The judging differentiator in Track 1 has shifted from "has risk limits" to "proves something," such as forecast skill or the correctness of a refusal. Several entries also found that the HSKSwap WHSK/USDT pool is thin and tracks the external price, so directional agents mostly find no edge ([rmndkyl/hsk-guardrail](https://github.com/rmndkyl/hsk-guardrail), [lala1224488686/mandate-trader](https://github.com/lala1224488686/mandate-trader)).

### Gaps
- Counts are approximate; several repos have no README.

## Q3. What white space does no one cover?

### Takeaway
Nobody in Seoul uses HSP's distinctive features: compliant payments with KYC/sanctions attestations, x402 via the HSP facilitator, the `@hsp/devkit` custom adapter, or independent `HSPVerifier` verification. Nobody targets merchants, institutions, LPs, remitters or Korean tourism. Track 1 has no liquidity-provision or market-making agent.

### Cited Findings
- Keyword scan of 105 READMEs: `attests:` / "compliant payment" / KYC appear only in India's hsk-meter (KYC-SBT mode), Nundina (roadmap), vyuh (KYC tier field), lamplight ("No KYC"), and proof-of-field. **No Seoul entry** uses them — [hsk-meter](https://github.com/swiftbotlabs/hsk-meter), [Nundina](https://github.com/rohan911438/Nundina)
- `@hsp/devkit` / custom adapter: only hsk-meter's own "adapter-signed receipt," which is HSP-style and not registered with the Coordinator — [hsk-meter](https://github.com/swiftbotlabs/hsk-meter)
- `payX402` / HSP facilitator: India only (ultravioleta, Nundina); 0 in Seoul — [0xultravioleta/agentsettle-hsk](https://github.com/0xultravioleta/agentsettle-hsk)
- These capabilities are first-class in the official guide: compliant evm-transfer and compliant x402, issuer attestations, and an adapter conformance suite with registration in the Coordinator trust set — [HSP guide](https://raw.githubusercontent.com/HashkeyHSK/documentation/HEAD/contents/docs/HSP/index.mdx)

### Inferences (white space list)
- **HSP capabilities:** (1) compliant payments where the policy requires `attests:kyc` + `attests:sanctions` and a merchant or relying party runs `HSPVerifier` itself; (2) compliant x402 paywalls; (3) a new settlement adapter built and conformance-tested with `@hsp/devkit`, for example one for HSKSwap swap-then-pay, batched settlement, or an FX/corridor rail; (4) a relying-party, auditor or regulator view of decision traces (`/explain`).
- **User segments:** merchants and PSPs; licensed institutions and VASPs (HashKey's own regulated positioning); LPs; remittance senders and migrant workers; tourists in Korea; payroll and HR. None of these are targeted in Seoul. Nearly every entry targets "retail bot owner" or "generic agent developer."
- **Track 1 features:** a fee-earning agent that manages concentrated HSKSwap V3 liquidity ranges; inventory and hedging; MEV-aware execution; a cross-pool router; an agent that uses its trading P&L to pay for its own data via HSP (combining both tracks).

### Gaps
- I cannot see whether private DoraHacks submissions cover these ideas.

## Q4. Are specific ideas already taken?

### Takeaway
Most of the proposed ideas are open in Seoul. Dispute resolution and data/API marketplaces are partially taken. Credit/underwriting and payroll were taken in earlier editions but not in Seoul.

### Cited Findings
| Idea | Seoul status | Prior editions / nearest |
|---|---|---|
| Compliant remittance / corridor settlement | **Open** (0 hits for remittance/corridor/cross-border) | [Kodark220/ZKRemit](https://github.com/Kodark220/ZKRemit) (April; ZK remittance). [caremandate](https://github.com/swiftbotlabs/caremandate) uses a won→USDC rate, but for domestic family payments |
| AI LP / market-making agent on HSKSwap | **Open as an agent** | [Tranche](https://github.com/danielamodu/Tranche) is an LP-commitment *protocol*, not an agent, and is not deployed. India's [zethos](https://github.com/divyyyam/zethos) prices from CEX order books (RFQ) |
| Agent credit / underwriting | **Open in Seoul** | Taken earlier: [tessera](https://github.com/tang-vu/tessera) (agent credit bureau + under-collateralised lending, July), [credence-ai](https://github.com/hari-hara-sudharsan/credence-ai), [Credence-Clear](https://github.com/hari-hara-sudharsan/Credence-Clear) (India) |
| RWA-related agent payments | **Mostly open**. Only [oil-desk-agent](https://github.com/unaboss/oil-desk-agent) (paper oil book, Track 1) | [NullGate](https://github.com/ZhenYan1214/NullGate) (RWA compliance, April) |
| Tourism / merchant payments in Korea | **Open** (no tourist/merchant/KRW entries; caremandate is the only Korea-localised one) | Tharun's leash has a "shops allowlist" but is generic |
| Agent payroll | **Open** (0 hits) | [StreamYield](https://github.com/himanshu-sugha/StreamYield) (April). [Tandem](https://github.com/k58v2hbzkk-del/Tandem) splits for agent teams, which is adjacent |
| Data / API marketplace | **Partially taken**: [agentmandate-hsk](https://github.com/kustantograndius/agentmandate-hsk) has an x402 paid wallet-report endpoint | India: [hsk-meter](https://github.com/swiftbotlabs/hsk-meter) (strong), [AgentBazaar](https://github.com/codewithpradeep14/AgentBazaar), [devx-agenttab](https://github.com/devx-agent/devx-agenttab) |
| Dispute resolution | **Partially taken** as escrow dispute windows: [hsk-agent-settle](https://github.com/tungdeptrai07/hsk-agent-settle), [emiliotecnologias](https://github.com/emiliotecnologias/hsk-horizon-agent-settlement), [proof-gated-payee](https://github.com/rezimx-btc/hsk-proof-gated-payee) (verifier agent) | India: proviso, lamplight, hsk-a2a-settlement. Off-HSK: [a2a-settlement-mediator](https://github.com/a2a-settlement/a2a-settlement-mediator) (AI dispute mediation) |

### Inferences
- The least-contested combination in Seoul uses the HSP features nobody uses (compliant payments, attestations, verifier, x402) to serve a segment nobody targets (merchants or remitters, Korea-localised). Caremandate is the main Korea-localised rival to differentiate from; it already uses won→USDC and real HSP QA.
- In Track 1, an LP or market-making agent is uncontested and fits the evidence from several entries that the pool is thin and tracks the external price: earning fees beats directional trading in a thin, efficient pool.

### Gaps
- Whether HSP QA or the Coordinator sandbox supports KYC/sanctions issuers on HSK testnet for Seoul teams is unverified.
- Whether organizers favour HSP Coordinator usage over MCP gateway usage in judging is unknown.
