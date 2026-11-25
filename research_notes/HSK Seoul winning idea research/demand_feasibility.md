# Demand and Feasibility of Candidate Ideas, HSK Chain Horizon Hackathon Seoul

Scope: candidate ideas 1–5, plus proposed alternatives. Research date: 2026-11-25. Deadline: Dec 3 2026, 13:00 KST (about 7 build days). Requirement: deploy on HashKey Chain mainnet (chain 177).

Method note: WebSearch worked. Direct access to the HSKSwap subgraph (graphnode.hashkeychain.net) was blocked by this session's egress proxy (HTTP 403), so I could not pull live pool TVL or volume. The local HSP docs mirror was read directly.

## Cross-cutting constraint: HSP sandbox is testnet, the hackathon wants mainnet

### Takeaway
The HSP developer guide describes only an organizer-hosted sandbox Coordinator on `hashkey-testnet`, with testnet USDC from a faucet. Mainnet token addresses are documented, but nothing in the mirror shows a chain-177 Coordinator or adapter. Every HSP-track idea therefore needs a hybrid plan: HSP flows on the testnet Coordinator, plus mainnet-177 contracts that settle or record the same objects. Teams should confirm this with the organizers on day 1.

### Cited Findings
- The organizer hosts a shared sandbox. The Coordinator URL, API key, faucet and SDK repo "are shared once the sandbox has been deployed". The example code uses `resolveChain('hashkey-testnet')` with "pinned testnet USDC". — local mirror `Shivangi-Sharma06_hsk/docs/02-hashfans/HSP.md` (source hashfans.io/docs/HSP, retrieved 2026-10-29)
- HSP supports 4 scenarios end to end: public evm-transfer, public x402 (real Coinbase x402 v2), compliant evm-transfer (KYC and sanctions attestations), and compliant x402. — same file, §2
- The trust rule: a verifier ACCEPTs a payment iff `requiredCapabilities ⊆ satisfiedCapabilities`. Attestations come from an issuer (`attests:kyc`, `attests:sanctions`). HSP is zero-custody, and the Coordinator only signs observations. — HSP.md §1, §5, §10
- Custom adapters: `@hsp/devkit` provides a template and a conformance runner. A team must submit `(adapterId, instanceKey, signing address, reorgPolicy)` to the organizer "to be registered in the sandbox Coordinator's trust set". — HSP.md §7
- The MCP server includes a server-side SpendGuard (per-tx cap, daily cap, optional recipient allowlist). — HSP.md §8
- Mainnet 177 tokens: USDC `0x054ed45810DbBAb8B27668922D110669c9D88D0a` (EIP-3009) and USDT `0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029` (Permit2). Testnet 133 tokens: USDC `0x79AEc4…C9e` and USDT `0x3723…CC6`. — local mirror `FWangZil_safeflow-hashkey/docs/hashkey-hsp-research.md`
- HashKey Merchant supports HashKey Chain on mainnet, and its QA environment is testnet (merchant-qa.hashkeymerchant.com). It offers one-time and reusable orders (reusable means "device rental, vending, subscription charges — multiple independent payments under one mandate"). — `03-merchant/README.md`; `hashkey-hsp-research.md`

### Inferences
- A custom adapter (idea 4) depends on the organizer adding it to the trust set. That is a human-in-the-loop dependency with an unknown turnaround, which is risky with 7 days left.
- The strongest compliance story uses attestations that are already supported (kyc, sanctions). Inventing new capability types needs an issuer the team does not control.

### Gaps
- Whether a chain-177 Coordinator or adapter exists. I found no evidence of one. Ask the organizers.
- Who runs the KYC/sanctions issuer in the sandbox, and whether teams can get attestations for arbitrary test addresses.

## Idea 1: Corridor (compliant A2A remittance settlement for Korea to Vietnam, Philippines and Nepal)

### Takeaway
This idea has the strongest real-world demand story: a large, measurable migrant-remittance outflow from Korea, high costs, and a live regulatory change in December 2026. But crypto or stablecoin remittance out of Korea sits in a regulatory grey zone that is changing right now, and the "agents bid in a reverse auction" mechanism is the part a judge will see as bolted on.

### Cited Findings
- Korea had more than 1.1 million foreign workers in 2025, a record. Many are from Vietnam and China. — [Korea JoongAng Daily](https://www.koreajoongangdaily.com/business/korea-sees-record-11-million-foreign-workers-in-2025/12233482); [The Star](https://www.thestar.com.my/aseanplus/aseanplus-news/2025/12/20/number-of-foreign-workers-in-south-korea-rises-to-a-record-11-million-in-2025-many-of-them-are-from-vietnam-and-china)
- Migrant workers' remittances home over the last 5 years totalled about USD 17.63B (about KRW 25 trillion). This is Bank of Korea data released via lawmaker Yoon Sang-hyun's office. — [The Fact (Korean)](https://news.tf.co.kr/read/economy/2252761.htm)
- A separate headline reports about KRW 6 trillion per year sent by foreign workers. I could not see the article body, so this figure is unverified. — [Daum/news](https://v.daum.net/v/20260724175748384)
- Employment Permit System (EPS) workers send 56.5% of total income abroad, against 25.5% for all foreigners (2025 survey by the Ministry of Data and Statistics and the Ministry of Justice). — [fnnews](https://en.fnnews.com/news/202512180936186790) (via search summary)
- From 2026, the government will allow overseas remittances of up to USD 100,000 through all financial institutions. — [Korea Times](https://www.koreatimes.co.kr/economy/20251208/govt-to-allow-overseas-remittances-of-up-to-100000-through-all-financial-institutions-from-2026)
- Korean startups such as SentBe are expanding remittance services for foreign residents. UNCDF notes that costly and inconvenient transfers push some migrants toward illegal channels. — [Korea Times](https://www.koreatimes.co.kr/amp/business/companies/20250916/korean-startups-expand-overseas-remittance-services-for-foreign-residents); [UNCDF](https://migrantmoney.uncdf.org/?p=351)
- The global average cost of sending USD 200 was 6.49% in Q1 2025 (up from 6.26% in Q4 2024). The G20 target is 3% by 2030, with no corridor above 5%. — [World Bank RPW](https://remittanceprices.worldbank.org); [RPW Q1 2025 report](https://remittanceprices.worldbank.org/sites/default/files/rpw_main_report_and_annex_q125_1_0.pdf)
- Regulation:
  - A Foreign Exchange Transactions Act amendment reportedly passed on May 7, 2026. It creates registration for cross-border virtual-asset transfer businesses and requires reporting through the BOK FX network, reportedly from December 2026. — [DEV Community](https://dev.to/denniskim/what-koreas-foreign-exchange-transactions-act-amendment-means-for-offshore-foundations-and-3m56); [CoinGape](https://coingape.com/south-korea-to-impose-fx-controls-on-crypto-transfers-from-december/)
  - Korea plans to amend the forex law to treat stablecoins as payment instruments. — [The Block, 2026-10-23](https://theblock.co/news/regulation/2026-10-23-south-korea-stablecoins-payment-instruments-424028)
  - Small-sum remittance businesses still need a minimum equity capital of KRW 1B. — [BKL](https://www.bkl.co.kr/en/law/insight/newsletter/6819)
  - A 2025 law-firm view held that cross-border payments in dollar stablecoins were then illegal under the FX Act. — [Mondaq](https://www.mondaq.com/new-technology/1668858/stablecoins-and-the-foreign-exchange-transactions-act)
- Kbank is testing a Ripple wallet for remittances while Korea weighs stablecoin rules. Incumbents are actively piloting. — [Cointelegraph](https://cointelegraph.com/news/kbank-tests-ripple-wallet-for-remittances-as-south-korea-weighs-stablecoin-rules)
- The Digital Asset Basic Act (won stablecoins) was still stalled as of May 2026. — [Asia Business Daily](https://www.asiae.co.kr/en/article/2026051213034015903)

### Inferences
- Market size: USD 17.63B over 5 years is about USD 3.5B per year (about USD 4.3B if the KRW 6T figure holds). Cutting the cost from about 6.5% to about 3% would save roughly USD 120–150M per year in fees. Named buyers: licensed Korean small-sum remitters (SentBe, GME, Hanpass) and the new "digital asset transfer business" registrants. (Korea-specific corridor costs were not found. The 6.49% figure is the global average.)
- Why A2A: the plausible agent role is the payout side. Competing off-ramp agents in VN/PH/NP quote FX plus fee, and the sender-side agent picks a quote and settles with a compliant mandate. KYC and sanctions attestations map directly to remittance AML/Travel Rule needs, which makes this the single best fit for HSP's compliant-payment feature. The reverse auction is defensible, because payout liquidity really is fragmented, but it is not necessary. A judge may ask "why not a quote API?"
- Timing hook: the FX Act registration regime arrives in December 2026, the same month as the hackathon. Framing the project as "compliance rails for the new digital-asset-transfer registrants, with HSP receipts exported as BOK FX reports" is timely and Korea-specific.
- 7-day feasibility: medium-high. Build on HSP compliant evm-transfer and an on-chain reputation/registry contract on chain 177. Payout agents can be simulated. Real fiat off-ramps are impossible, so they must be mocked.
- Demo impact: high (human story, real numbers, Korea relevance).
- Biggest risks: (1) regulatory honesty. A real deployment needs a registered entity, so the pitch must be "infrastructure for licensees". (2) Mocked fiat legs. (3) HSP being testnet-only. (4) Incumbents like Kbank/Ripple are already piloting.

### Gaps
- Corridor-specific RPW costs for Korea to Vietnam/Nepal/Philippines. Not retrieved.
- Annual BOK breakdown by destination country.

## Idea 2: Tidepool (AI LP/market-making agent for HSKSwap V3 thin pools)

### Takeaway
Technically the easiest idea to put on mainnet, and it is the natural fit for track 1. Real-world demand on this chain, however, is close to nil: chain DeFi TVL is reported in the low thousands of USD. LP-agent value depends on volume, and the academic evidence says naive V3 LPing loses money roughly half the time.

### Cited Findings
- DefiLlama shows HashKey Chain DeFi TVL of about USD 1,342 (undated snapshot), with a second "key metrics" figure of USD 1.89M. CoinGecko shows about USD 1,322, ranked #195 by TVL. — [DefiLlama chain page](https://defillama.com/chain/hashkey-chain); [CoinGecko](https://www.coingecko.com/no/chains/hashkey-chain)
- HyperInDex (a DEX on HashKey Chain) had about USD 876 TVL on Nov 6 2026, against an ATH of USD 1.6M (Jun 2025). — [DefiLlama HyperInDex](https://defillama.com/protocol/hyperindex)
- The Topaz Blue/Bancor study of 17 Uniswap V3 pools (about 43% of V3 TVL) found USD 260.1M of impermanent loss against USD 199.3M of fees, and 49.5% of LPs with negative returns. Caveat: Bancor, a competitor, commissioned it. — [Cointelegraph](https://cointelegraph.com/news/half-of-uniswap-v3-liquidity-providers-are-losing-money-new-research); [Loesch et al., arXiv 2111.09192](https://arxiv.org/pdf/2111.09192)
- Counterpoint: with appropriate strategy, V3 LPing can be profitable, and the 50% analysis has shortcomings. — [arXiv 2205.08904](https://arxiv.org/pdf/2205.08904)
- Recent work on more profitable LP strategies. — [arXiv 2501.07828](https://arxiv.org/pdf/2501.07828)

### Inferences
- In a pool with only thousands of USD of TVL and little organic flow, fee income is close to zero. The agent's real edge would be arbitraging the CEX reference price (MEXC HSKUSDT) against a stale on-chain pool. That is arbitrage, not market making.
- Pitch it honestly as "bootstrapping liquidity for a new chain" (a buyer could be the HashKey ecosystem fund or token projects needing an MM). Professional MMs are paid retainers, so the buyer exists, but the pitch is generic and replicable on any chain.
- Feasibility: high. Use NonfungiblePositionManager plus SwapRouter02 on 177 with a small amount of capital. Logging LVR/IL against fees on a dashboard is doable.
- Demo impact: medium. Real mainnet txs are impressive, but the PnL will be tiny or negative and the novelty is low. Many hackathon teams build "AI LP bots".
- Risks: thin pools mean the team's own trades move the price. Stale APRO oracle. The subgraph may lag. There is a real-money loss risk, and the project is undifferentiated.

### Gaps
- Live WHSK/USDT 0.3% pool TVL and 7-day volume (subgraph blocked from this session; teams should query it themselves).
- MEXC HSKUSDT depth and volume.

## Idea 3: Agent credit lines underwritten by verified HSP receipt history

### Takeaway
The concept is interesting (receipts as verifiable cash-flow data), but in 7 days the receipt history will be synthetic. A credit product with no real default data is hard to make credible. The closest real-world analogue is merchant cash advance (Stripe Capital/Shopify Capital-style) for agent sellers, but the agent economy is still micro-payment-sized.

### Cited Findings
- x402 volume peaked at about USD 20.5M across about 52.6M transactions in Nov 2025 (Chainalysis, via secondary reporting). Value fell about 77% to about USD 1.19M by May 2026 (Artemis). Average payments are tiny: about USD 0.12 in Dec 2025, about USD 0.05 in Q3 2026 (Allium). — [Cointelegraph](https://cointelegraph.com/news/coinbases-x402-transactions-rise-10000-percent); [Nevermined stats roundup](https://nevermined.ai/blog/x402-protocol-adoption-statistics); [CryptoSlate](https://cryptoslate.com/tiny-x402-payments-expose-gap-holding-ai-agents-back/)
- TRM Labs: most x402 volume is not demonstrably from AI agents, because a script produces the same on-chain record. — [TRM Labs](https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain); [PYMNTS](https://www.pymnts.com/?p=4193315)
- Google AP2 (Sept 2025, 60+ partners) is the authorization/mandate layer and has an A2A x402 extension. Visa launched the Trusted Agent Protocol (Oct 2025) and Intelligent Commerce Connect (Apr 2026). — [Coinbase](https://www.coinbase.com/developer-platform/discover/launches/google_x402); [AP2 and x402](https://ap2-protocol.org/topics/ap2-and-x402); [Visa TAP](https://corporate.visa.com/en/sites/visa-perspectives/newsroom/visa-unveils-trusted-agent-protocol-for-ai-commerce.html)

### Inferences
- Demand: agents with x402 revenue at about USD 0.05 per call have little need for credit lines today. Credit needs volume. The named buyer would be an agent-platform treasury or a DeFi lender, both speculative.
- Why A2A: genuine, because HSP receipts are adapter-signed and independently verifiable, which is better underwriting data than self-reported revenue. That is the one strong point.
- Feasibility: medium. A credit-line contract on 177 plus a score from receipts is buildable. Underwriting realism is weak.
- Risks: synthetic data, no default history, and lending-regulation optics in Korea/HK. Judges may call it premature.

### Gaps
- No found sources on existing "agent credit" products. The search returned none.

## Idea 4: Custom HSP settlement adapter (conditional/escrow/streaming) via devkit

### Takeaway
It shows protocol depth and aligns with what HSP organizers explicitly invite (§7). But it depends on the organizer registering the adapter in the Coordinator trust set, and an adapter alone has no end user. It works best as the engine inside a user-facing product, not as the product.

### Cited Findings
- The devkit template, conformance runner, and organizer registration step are described in the local mirror `HSP.md` §7 (see the cross-cutting section above).
- HashKey Merchant "reusable orders" already cover subscription and rental-style repeated payments under one mandate, so a "streaming" adapter partly overlaps an existing product. — `03-merchant/README.md`

### Inferences
- An escrow or conditional-release adapter (the receipt only ACCEPTs when a delivery proof or oracle condition holds) is the most valuable variant. It underpins any A2A service marketplace and remittance (idea 1: release on payout confirmation).
- Feasibility: medium. Writing the adapter is fine, but the trust-set registration timeline is unknown. The fallback is to self-verify with the pinned adapter address locally.
- Demo impact: low on its own (infra), high when embedded.
- Risks: organizer dependency. Judges who are not protocol engineers may not appreciate it.

### Gaps
- The organizer's SLA for registering adapters.

## Idea 5: Tourist payments in Korea (foreign tourists pay merchants in stablecoins via an agent)

### Takeaway
Big, well-documented market, but weak crypto pull. Tourists already pay by card (record card spend), and Korean law does not yet allow won stablecoins, nor clearly allow merchants to accept USD stablecoins for domestic payments. The agent element is bolted on.

### Cited Findings
- 18.94M foreign arrivals in 2025 (a record), and the 2026 record was surpassed with about 2 months still left. — [The Star](https://www.thestar.com.my/aseanplus/aseanplus-news/2026/10/28/south-korea-sets-new-record-for-foreign-tourist-arrivals); [Korea Times](https://www.koreatimes.co.kr/lifestyle/travel-food/20251223/visitors-to-korea-to-hit-record-187-million-outpacing-pre-pandemic-high)
- 2025 tourism revenue was USD 27.2B, and foreign card spending was a record USD 14.1B (BOK). The average stay is 6.5 days at USD 177.8 per day. — [Korea JoongAng Daily](https://www.koreajoongangdaily.com/business/foreign-visitor-card-spending-in-korea-climbs-to-record-high/12856039); [Korea Herald](https://www.koreaherald.com/article/10886302)
- Foreign tourist spending was KRW 15.94T (USD 11.9B) through Sept 2026, up 47.7% YoY. — [The Star](https://www.thestar.com.my/aseanplus/aseanplus-news/2026/10/28/south-korea-sets-new-record-for-foreign-tourist-arrivals)
- Foreign spending was 1.17% of Korean GDP in 2025. — [Korea Times](https://www.koreatimes.co.kr/economy/20260805/foreign-spending-accounts-for-117-of-korean-gdp-in-2025-report)
- The won-stablecoin law (Digital Asset Basic Act) was stalled as of May 2026. — [Asia Business Daily](https://www.asiae.co.kr/en/article/2026051213034015903)

### Inferences
- Demand for paying, yes. Demand for paying in stablecoins via an agent is unproven. Pain points (foreign-card rejection on Korean sites, Naver/Kakao requiring a Korean phone) exist but are being solved by fintechs (Alipay+, WOWPASS-style cards).
- Why A2A: weak. One merchant gateway call (HashKey Merchant cart mandate) suffices, and no second agent is needed.
- Feasibility: high (HashKey Merchant QA plus cart mandates, and registration by email). Demo is visually nice.
- Risks: regulatory (merchant KRW settlement), "why not a card?", and a generic pitch.

### Gaps
- Data on foreign-card failure rates at Korean merchants. Not searched.

## Proposed stronger original ideas

### Takeaway
The strongest ideas pair HSP's unique feature (verifiable KYC and sanctions attestations on payments) with HashKey's institutional/RWA positioning, or fuse both tracks so that HSP payments feed a mainnet HSKSwap trading agent. Five proposals follow, ranked.

### Cited Findings (context used for the proposals)
- HashKey adopted Standard Chartered's institutional tokenised-deposit solution for treasury and settlement (Nov 2, 2026). — [SCMP (sponsored)](https://www.scmp.com/presented/business/banking-finance/topics/hashkey-standard-chartered-cooperation/article/3372964/hashkey-adopts-tokenised-deposit-cross-market-treasury-and-liquidity-management-standard-chartereds)
- HashKey launched a one-stop RWA issuance platform supporting ERC-3643 with HashKey Chain interoperability (Feb 2026). — [SCMP (sponsored)](https://www.scmp.com/presented/business/topics/one-stop-hk-rwa-solution/article/3344523/hashkey-group-unveils-one-stop-rwa-solution-support-positioning-hong-kong-global-rwa-innovation); [CoinGape](https://coingape.com/crypto-exchange-hashkey-launches-rwa-issuance-for-institutions-amid-tokenization-boom)
- HSK White Paper 2.0 claims 11 tokenized products and about HK$2B of on-chain RWA on HashKey Chain. This is a self-reported figure. — [KuCoin news](https://www.kucoin.com/news/flash/hashkey-releases-hsk-white-paper-2-0-outlines-on-chain-financial-infrastructure)
- HashKey Chain hosted HK's first regulated silver-backed RWA tokens (Mar 2026). — [AAP/Cision](https://www.aap.com.au/aapreleases/cision20260324ae17719)
- HKMA granted the first stablecoin issuer licences to HSBC and Anchorpoint (StanChart/Animoca/HKT) on Apr 10, 2026, from 36 applicants. HSBC plans an HKD stablecoin in H2 2026. — [HKMA press release](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2026/04/20260410-4/); [Caixin](https://www.caixinglobal.com/2026-04-10/hong-kong-grants-first-stablecoin-licenses-to-hsbc-standard-charteredbacked-venture-102432744.html)
- Korea's FX Act cross-border virtual-asset transfer registration regime reportedly starts December 2026, and Korea plans to classify stablecoins as payment instruments. — [CoinGape](https://coingape.com/south-korea-to-impose-fx-controls-on-crypto-transfers-from-december/); [The Block](https://theblock.co/news/regulation/2026-10-23-south-korea-stablecoins-payment-instruments-424028)
- The APRO HSK/USD oracle is often stale (from the task brief). The chain's DeFi TVL is about USD 1.3K (DefiLlama, above).

### Inferences (proposals)

**P1. "Fresh Feed": a compliant x402 price-and-signal market feeding an HSKSwap trading agent (fuses both tracks). Rank 1 for feasibility times demo.**
- Oracle/signal agents sell signed, fresh HSK/USD quotes per call via x402. Quotes are aggregated from CEX references and the HSKSwap TWAP, which fills the stale-APRO gap. A trading agent pays per quote through HSP and executes real swaps on mainnet SwapRouter02 only when the paid quote and the pool price diverge beyond a fee/slippage threshold.
- The compliant x402 variant means an institutional desk can prove that it bought data only from KYC'd, sanctions-screened providers.
- Why agents: the per-call micropayment is native machine-to-machine pricing, which is exactly x402's purpose, and the trading decision is autonomous.
- Feasibility: high. It uses x402Gate/fetchWithX402 from the SDK, plus mainnet swaps with small size and an on-chain log contract on 177.
- Demo: a live dashboard (quote purchased, receipt ACCEPT, mainnet swap tx). This hits both tracks' judging criteria.
- Risk: the trading PnL is tiny because the pool is thin, so frame it as a data market plus execution, not alpha. The x402 facilitator may only be available on testnet.

**P2. "Corridor-lite / ReportReady": compliant A2A remittance settlement plus automatic BOK FX-reporting records from HSP receipts (a refined idea 1). Rank 2 for real-world demand.**
- Keep idea 1, but drop the heavy reverse auction in favour of quote-and-escrow. Add the Korea-specific killer feature: every ACCEPTed compliant receipt (mandate, receipt, KYC and sanctions attestations) is transformed into the reporting record the December 2026 FX Act regime requires.
- Buyer: newly registering digital-asset-transfer businesses and the roughly KRW 1B-capital small-sum remitters.
- Demand evidence: about USD 3.5B per year of migrant outflows and 6.49% average costs.
- Risk: the report format is not public, so it would have to be modelled, not copied.

**P3. "Attested RWA subscription agent": HSP compliant payment linked to an ERC-3643 whitelist on chain 177.**
- An investor's agent subscribes to a tokenized MMF or deposit. The issuer-side agent mints or transfers the RWA token only if the HSP verifier ACCEPTs a compliant payment, mapping HSP `attests:kyc`/`attests:sanctions` onto ERC-3643 identity claims. Redemption runs in reverse, as an agent-to-agent DvP.
- Buyer: HashKey's own RWA issuance platform and its issuers (HK$2B claimed on-chain RWA, Franklin Templeton/CPIC-type funds). It aligns tightly with HashKey's institutional narrative and with judges from HashKey.
- Feasibility: medium-high. Deploy a minimal ERC-3643-style token plus a DvP contract on 177, with HSP on testnet. A cross-chain proof (testnet receipt to mainnet mint) needs an off-chain relayer agent; be explicit about that.
- Risk: it looks like a demo of compliance plumbing, with no real fund participating.

**P4. "Compliant RFQ desk": institutional agents trade HSK/stablecoins via signed RFQ settled through HSP, with HSKSwap as the fallback/reference (fuses both tracks).**
- With about USD 1.3K of chain DeFi TVL, an AMM cannot absorb institutional size. Agent market makers quote off-chain, and the taker's agent settles both legs with compliant mandates (only KYC'd counterparties). The agent falls back to HSKSwap for small size and uses the pool price as a sanity bound.
- Buyer: OTC desks, including HashKey's own OTC business.
- Feasibility: medium (two-leg atomicity is hard; use an escrow contract on 177).
- Risk: complexity, and settlement on HSP rather than atomically on-chain means counterparty risk.

**P5. "SpendGuard for enterprises": a policy-attested agent procurement wallet.**
- A corporate AI agent buys paid APIs/data via x402, with the MCP SpendGuard (caps, allowlists) extended by a "only pay sanctions-screened, KYC'd vendors" policy and auto-generated audit packs.
- Buyer: compliance teams at regulated firms deploying agents.
- Feasibility: high, since it is mostly built from existing SDK pieces.
- Risks: novelty is low, and many hackathon entrants will build a spend-control wallet.

Overall ranking for winning likelihood:
1. P1 (both tracks, easiest mainnet story).
2. P2 (the best real-world demand and Korea hook).
3. P3 (best HashKey institutional alignment).
4. Idea 1 as given.
5. Idea 2.
6. Idea 4 (as embedded engine only).
7. Idea 3.
8. Idea 5.

A strong combination: P2 or P3 as the product, with idea 4's escrow adapter as the engine, and a small P1-style HSKSwap leg (for example, converting the payout to USDT on mainnet) to also qualify for track 1.

### Gaps
- Whether judges weigh "mainnet" over HSP depth, given that HSP itself is testnet. This needs organizer confirmation.
- Live HSKSwap WHSK/USDT pool depth and volume (subgraph blocked here).
- The exact December 2026 FX-reporting data schema in Korea.
- Whether the HSP sandbox issuer can attest arbitrary addresses, and whether ERC-3643 identity-claim mapping is acceptable to the organizers.
