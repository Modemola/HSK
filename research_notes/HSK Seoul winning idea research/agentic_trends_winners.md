# Agentic Payments and AI Trading Agents in 2026: Standards, Hackathon Winners, Real Demand, Open Problems

Method note: These notes come from WebSearch (extended) result summaries plus a GitHub repo search. WebFetch was blocked by the session network for fireblocks.com, algorand.co, coindesk.com, cryptonomist.ch and arxiv.org, so most figures are taken from search-result snippets, not full pages. Many of the sources are secondary trade or vendor blogs. Treat exact figures as approximate. Conflicts are flagged where they appear.

## (a) 2026 agentic-commerce standards and adoption: what is live and at what volume?

### Takeaway
Every major payment player now has an agent-payment protocol. x402 has won crypto-native mindshare and has Linux Foundation governance, AP2 has moved to FIDO, and the card networks each run their own agent-token schemes. Real economic volume is still tiny, though. Adjusted x402 commerce is about $15–19M lifetime, and much of the headline transaction count is wash or self-dealing traffic. The card-rail consumer checkout experiments (OpenAI Instant Checkout) largely flopped.

### Cited Findings
**x402 (Coinbase, now Linux Foundation)**
- Headline lifetime counts range from about 165M to over 200M transactions. One tracker gives 196M as of 1 Nov 2026, about 45% of them on Base. Another reported 69k active agents, 165M transactions and about $50M cumulative volume in late April 2026. — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/x402-foundation-activated-27-old-152440828.html); [Fireblocks](https://www.fireblocks.com/blog/agent-economy-numbers-x402-data); [web3trackers dashboard](https://www.web3trackers.com/x402-dashboard); [presenc.ai tracker](https://presenc.ai/research/x402-protocol-adoption-tracker-2026)
- Visa and Artemis adjusted volume to about $15M across about 109.6M transactions through 21 Apr 2026. A later Visa estimate (Jul 2026) gives about $19M across about 134M transactions. Artemis data cited by CoinDesk put real daily commerce at about $28k/day, with about half of all transactions judged artificial. — [qatom.ai summary](https://www.qatom.ai/learn/x402-in-2026); [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/x402-foundation-activated-27-old-152440828.html)
- Chainalysis reports that payments of $1 or more grew from 49% of x402 value on Base in the earliest months to 95% by early 2026. The November 2025 peak was $20.5M across 52.6M transactions. — [nevermined stats roundup](https://nevermined.ai/blog/stablecoin-payments-ai-agents-statistics); [Sherlock](https://sherlock.xyz/post/x402-explained-the-http-402-payment-protocol)
- One analysis says settlement volume was down 93% YTD as of Aug 2026. It attributes the fall to the collapse of sub-$1 speculative or memecoin traffic. — [payzum](https://payzum.com/blog/x402-volume-decline-2026/)
- The Linux Foundation announced the x402 Foundation in April 2026 and held its operational launch on 14 Jul 2026 with 40 member organizations. The premier tier includes Adyen, AWS, AmEx, Circle, Cloudflare, Coinbase, Fiserv, Google, Mastercard, Monad, MoonPay, Ripple, Shopify, Solana Foundation, Stellar, Stripe and Visa. A later count (15 Nov) gives 19 premier, 26 general and 13 associate members. — [Linux Foundation PR](https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications); [Daniel McGlynn](https://www.danielmcglynn.com/your-ai-assistant-can-spend-your-money-before-anyone-decides-who-refunds-you/)
- x402 v2 shipped in Dec 2025 with multi-chain support, wallet-based sessions (authenticate once, then use session tokens instead of an on-chain payment per call) and an extensible scheme architecture. — [Alchemy](https://www.alchemy.com/blog/how-x402-brings-real-time-crypto-payments-to-the-web)
- x402 is a push payment and is irreversible. A refund means the seller sends a new transfer back. No formal dispute or refund mechanism was found in v2. — [eSEOspace](https://eseospace.com/blog/what-is-x402/); [qatom citing Four Pillars](https://www.qatom.ai/learn/x402-in-2026)

**AP2 (Google Agent Payments Protocol) and A2A**
- Google donated AP2 to the FIDO Alliance in late April 2026. AP2 v0.2 (28 Apr 2026) added "Human Not Present" flows, in which an agent completes a purchase under a pre-authorized Intent Mandate. — [FIDO Alliance](https://fidoalliance.org/google-donates-agent-payments-protocol-to-fido-alliance/); [mintive](https://www.mintive.com/blog/ap2-agent-payments-protocol)
- Named deployments: Mastercard's Agent Pay pilot inside PayPal, the A2A x402 extension for crypto, and Google's Universal Commerce Protocol (UCP). Gemini reportedly checks out through AP2 with Google Pay and Visa/Mastercard tokens. — [deepinspect](https://www.deepinspect.ai/blog/agent-payments-protocol-ap2); [Wikipedia: Agentic commerce](https://en.wikipedia.org/wiki/Agentic_commerce)
- The reference repo google-agentic-commerce/a2a-x402 has about 572 GitHub stars. Solana Foundation's `pay` CLI supports x402, MPP and AP2 together (about 1.8k stars). — GitHub search (repos [a2a-x402](https://github.com/google-agentic-commerce/a2a-x402), [solana-foundation/pay](https://github.com/solana-foundation/pay))

**ERC-8004 (Trustless Agents)**
- Mainnet deployment came on 29 Jan 2026. The standard was still at Draft status on the EIP registry as of 6 Oct 2026. — [datawallet](https://www.datawallet.com/crypto/erc-8004-explained); [eco.com](https://eco.com/support/en/articles/13221214-what-is-erc-8004-the-ethereum-standard-enabling-trustless-ai-agents)
- One tracker reports 618,776 registered agents across 24 chains (7 Oct 2026). An earlier snapshot gives 519,333 across 30 networks. — [agenteconomy.to](https://agenteconomy.to/erc-8004)
- An empirical arXiv study found that only 3% (Ethereum), 4% (BSC) and 15% (Base) of registered agents expose both a valid registration file and a declared service. Only 0.4% (629 of 173,473) declare registration on two or more mainnets. BSC has the most agents (90k), followed by Base (51k) and Ethereum (32k). — [arXiv 2606.26028](https://arxiv.org/html/2606.26028)

**Stripe / OpenAI ACP and Stripe–Tempo MPP**
- OpenAI retired ChatGPT Instant Checkout in March 2026. Reportedly only about a dozen Shopify merchants plus Etsy ever went live, with near-zero sales. ACP continues as a protocol for discovery and product feeds, with checkout kept on the merchant side (24 Mar 2026). — [digitalapplied](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide); [paymentreview](https://paymentreview.com/blog/agentic-commerce-merchants-2026/)
- Stripe's ACP surfaces also include Copilot Checkout (Jan 2026; Etsy, Urban Outfitters) and Facebook ads checkout. — [bankingnewsai](https://www.bankingnewsai.com/fintech/stripe/agentic-commerce)
- Stripe and Tempo launched the Machine Payments Protocol (MPP) on about 18 Mar 2026, alongside Tempo mainnet. It is rail-agnostic: stablecoins on Tempo, plus cards and BNPL through Shared Payment Tokens. More than 100 services were listed in its directory at launch. — [Stripe blog](https://stripe.com/it/blog/machine-payments-protocol); [Techstrong.ai](https://techstrong.ai/features/stripes-machine-payments-protocol-gives-ai-agents-a-way-to-spend-money-without-human-help/)

**Card networks**
- Visa Intelligent Commerce Connect (Apr 2026) is one merchant integration that accepts agent payments across four protocols. It is in pilot with Aldar, AWS, Highnote, Mesh, Payabli and others. Visa predicted that "millions" of consumers would buy through agents by the 2026 holidays. A Visa–OpenAI integration was announced in Jun 2026 with no launch date. — [TechInformed](https://techinformed.com/visa-opens-one-integration-for-ai-agent-payments/); [Visa PR](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21961.html); [DigitalCommerce360](https://www.digitalcommerce360.com/2026/06/12/visa-openai-agent-led-payments/)
- Mastercard Agent Pay ran live authenticated agent transactions in Hong Kong and Thailand, and completed Europe's first end-to-end agent payment with Santander (Mar 2026). It launched Verifiable Intent on 5 Mar 2026 and Agent Pay for Machines (M2M and microtransactions) on 10 Jun 2026. — [elogic](https://elogic.co/blog/agentic-payments/); [agentcard.ai](https://agentcard.ai/blog/visa-intelligent-commerce-mastercard-agent-pay)

**Cloudflare Pay-per-Crawl**
- Pay-per-Crawl was still a closed beta as of Nov 2026. Price examples are $0.01 per crawl (one source says the minimum is $0.001). It uses Cloudflare crawler headers plus Web Bot Auth and bills through Cloudflare/Stripe, so it is separate from x402. Reports say a stablecoin "Monetization Gateway" over x402 is in US-only closed beta. No adoption numbers were found. — [proxyops](https://proxyops.dev/artiklar/cloudflare-pay-per-crawl-402-web-bot-auth-ai-labyrinth-guide/); [aeogodmode](https://aeogodmode.io/cloudflare-pay-per-crawl-wordpress/); [digitalapplied](https://www.digitalapplied.com/blog/ai-crawl-economics-pay-per-crawl-referral-data-2026)

**Investor framing**
- a16z (Noah Levine): cards will dominate agentic commerce for existing merchants, and stablecoins will power the merchants that do not exist yet. Stablecoins lack a network-level fraud layer. — [a16z Frontier](https://a16zfrontier.substack.com/p/agentic-commerce-wont-kill-cards)
- a16z (Sam Broner): stablecoins will win autonomous B2B agent purchases, but they still lack arbitration, statement generation, credit facilities and batch approval. — [blockchain.news](https://blockchain.news/news/a16z-stablecoins-ai-agent-b2b-payments)

### Inferences
- The industry has converged on "an intent or mandate signed by the human, a token or stablecoin, then settlement". EIP-712 mandate projects therefore reproduce what AP2, Verifiable Intent and x402 already standardize. The gap is what happens after settlement: proof of delivery, refunds, disputes, statements and reconciliation.
- Protocol fragmentation (x402, MPP, AP2, ACP, UCP, Visa TAP, Mastercard Agent Pay) is itself a pain point. Visa Connect and Solana `pay` exist only to bridge it. An HSP adapter that accepts or normalizes several protocols, for example AP2 mandate in and x402 or MPP out, plus compliance attestation, fits the custom-settlement-adapter feature well.
- Hackathon judges increasingly know that x402 volume is mostly wash traffic. A project that settles real, verifiable usage on mainnet, or that detects and filters synthetic volume, would answer the most visible criticism.

### Gaps
- No primary Coinbase or Chainalysis 2026 x402 dashboard could be fetched (fetch blocked). The figures come from secondary trackers.
- No official ACP merchant counts or Visa/Mastercard agent transaction volumes were found.
- No HashKey/HSP-specific adoption data was researched; it is outside this scope.
- MCP-native payment standards beyond x402-over-MCP integrations (for example nirholas/agenti, ClawRouter) were not specifically researched.

## (b) What won 2026 hackathons with agent-payment or AI-trading tracks, and why?

### Takeaway
Winners in 2026 share three traits. They (1) move real money on mainnet for a concrete, boring service such as pay-per-call data, (2) put a verification or guard step between the agent and the money (pay only after the response is verified, or let a guard allow, deny or downsize trades), or (3) score well on risk-adjusted rather than raw returns. Generic "AI trader" and "mandate + escrow" builds are everywhere. Placings went to projects with a sharp, verifiable trust mechanism or a real customer.

### Cited Findings
**Agent-payment hackathons**
- **Consensus Miami 2026 (EasyA, about 1,000 developers, almost all building AI agents):** 1st place was the *Dairy Price API x402*, a pay-per-call commodity price and forecast API for agents with no API keys, settled in USDC on Base. 2nd was *AgentPay*, one-tap human approval of agent transactions; one source is low quality. 3rd was *Giggy*, a marketplace to hire research agents. A notable runner-up, *Chainlens*, was an x402 layer that releases payment only after the API response is authenticated. — [CoinDesk](https://www.coindesk.com/tech/2026/05/08/ai-agents-fueled-a-frenzy-of-startup-building-at-the-consensus-miami-easya-hackathon); [syndicated copy](https://bitcoinethereumnews.com/tech/ai-agents-fueled-a-frenzy-of-startup-building-at-the-consensus-miami-easya-hackathon/)
- **Algorand Global x402 Challenge (winners 22 Oct 2026):** There were 115 qualifying projects. Each had to put a paid x402 endpoint live on Algorand MainNet and settle real USDC through the GoPlausible facilitator. 20 winners shared 500k ALGO and 10 finalists pitched for $100k USDC. Named winners: Moltworld (pay-per-request AI models), GATEWAY, Earnest, SiteLenz, Validex and SELO. GoPlausible published a synthetic-volume analysis behind the leaderboard. — [blockchain.news](https://blockchain.news/news/algorand-global-x402-challenge-winners-2026); [Algorand blog](https://algorand.co/blog/the-global-x402-challenge-winners-are-here); [GitHub report repo](https://github.com/Ganainmtech/x402-global-challenge-report)
- **ETHGlobal HackMoney 2026, Arc track:** Winners included *Mand(ate)*, an AI invoice escrow where agents manage milestones and release funds, and *SmartRenovate*, an AI-verified construction milestone escrow. — [arc.io](https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned)
- **ETHGlobal Lisbon 2026:** *ColdProof* won The Graph's Best AI Use Case; it settles escrow from a signed event log. Finalists included *Glassbox402* (an x402 payment-tracking dashboard) and the *ethui agentic wallet*. — [The Graph](https://thegraph.com/blog/ethglobal-lisbon-2026-winners/); [Bitget](https://www.bitget.com/news/detail/12560605546777)
- **ETHGlobal New York 2026:** The showcase includes *Clawback* (agent escrow on Arc with AI-adjudicated disputes) and *Agentbook.eth* (an agent reputation network on ENS and Hedera). Their placements are unconfirmed. The sponsor bounty "Best On-Chain Agent Economy Application" was $5k. ETHGlobal Cannes 2026 finalists featured agent-safety projects such as *ENShell*, which guards agents against malicious transactions. — [ETHGlobal showcase](https://ethglobal.com/showcase?events=newyork2026); [ETHGlobal NY prizes](https://ethglobal.com/events/newyork2026/prizes); [Bitget Cannes](https://www.bitget.com/news/detail/12560605341062)
- **Colosseum Solana Frontier (Jun 2026):** The Grand Champion was CrowdBrain (robotics DePIN). Payment winners: *DashX* (compliant cross-border stablecoin payments for India and emerging markets), *Flovia* (analytics and intelligence for machine-paid APIs), *KinnectFi* (stablecoin neobank) and *Stablecorp*. The Crypto World's Fair sidetrack winner *Commish* adds commission holdbacks and refund windows to x402 payments. — [Colosseum blog](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/); [solanacompass](https://solanacompass.com/news/colosseum-announces-26-winners-of-the-solana-frontier-hackathon-the-largest-crypto-hackathon-ever); [RPC Fast](https://rpcfast.com/blog/colosseum-crypto-worlds-fair-rpc-fast-sidetrack-winners-2026)
- **Other repos labeled as winners (GitHub search):**
  - *x402-Triton-Gateway* (pay-per-query historical Solana data)
  - *x402-zkid* (ZK identity for x402 negotiation; won Coinbase's Agentic Payments track at a MongoDB hackathon)
  - *faktory* (AI B2B invoice treasury; won Cronos x402 PayTech)
  - *FairCam* (proof-of-human camera; 3rd at Coinbase x402 AgentKit hackathon)

  — GitHub: [praptisharma28/x402-Triton-Gateway](https://github.com/praptisharma28/x402-Triton-Gateway), [jayyu23/x402-zkid](https://github.com/jayyu23/x402-zkid), [Yonkoo11/faktory](https://github.com/Yonkoo11/faktory), [fairnomics/faircam](https://github.com/fairnomics/faircam)

**AI-trading hackathons**
- **BNB Hack: AI Trading Agent Edition (BNB Chain, CoinMarketCap and Trust Wallet; $36k; 21 winners; Jul 2026):** Track 1 1st place ($10k) was *Neural Alpha by ClipX*. The other track winners were Genesis, Gridora, Guarded Alpha (4th) and Superagente007. Track 1 was judged on **real PnL subject to a max-drawdown limit**. The Strategy Skills track (Narrative Alpha, RotorEdge, Undertow) was judged on technical execution, originality, real-world value and presentation. — [Bitget](https://www.bitget.com/news/detail/12560605495649); [BNB Chain blog](https://www.bnbchain.org/en/blog/build-and-compete-for-36-000-in-bnb-hack-ai-trading-agents-by-bnb-chain-coinmarketcap-and-trust-wallet); [Cryptonomist](https://en.cryptonomist.ch/2026/07/08/bnb-hack-winners/)
- **lablab.ai Alpaca AI Trading Agents Hackathon (about 3,600 participants, 425 projects):** 1st place was *Autobelay* by RazorsEdge (an options agent). The organizers' summary: "The best ones had one rule: the AI never pulls the trigger." — [lablab on X](https://x.com/lablabai/status/2105583053867495711); [lablab event](https://lablab.ai/ai-hackathons/alpaca-ai-trading-agents-hackathon/live)
- **lablab AI Trading Agents with ERC-8004:** Prize categories included Best Trustless Trading Agent ($10k), Best Risk-Adjusted Return ($5k) and Best Validation & Trust Model ($2.5k); this list comes from a participant README. *Vartovii Sentinel-8004* won Validation & Trust. In it, the agent proposes a trade, Sentinel returns allow, deny or downsize, and the result is signed as an auditable trace. A leaderboard ranked agents by ERC-8004 validation and reputation scores. — [lablab article](https://lablab.ai/ai-articles/lablab-hackathon-success-stories-part-2); [arishhh README](https://github.com/arishhh/ai-trading-agents); [judyailab write-up](https://judyailab.com/en/posts/hackathon-trading-agent-journey/)
- lablab's "Seven builders who won by making AI agents safer" frames safety and guardrails as the common winning theme. — [lablab](https://lablab.ai/ai-articles/lablab-hackathon-success-stories-part-2)

### Inferences
- **Winning pattern for payments:** pick a specific vertical service with real buyers (dairy prices, historical chain data, B2B invoices, cross-border remittance), get it live on mainnet with real settlement, and add one novel trust primitive, such as pay-after-verification, refund windows or holdbacks. Generic "agent wallet + mandate + escrow" builds placed only when tied to a concrete vertical (construction milestones, invoices).
- **Winning pattern for trading:** judges reward risk-adjusted, guarded, explainable agents (drawdown caps, a human or guard that "pulls the trigger", signed decision traces), not raw alpha claims. Risk-vault projects are saturated, so freshness has to come from verifiable track records (signed and replayable decisions, ERC-8004 validation) or market-structure ideas rather than another LLM signal bot.
- Escrow with disputes is already crowded too: Clawback, Mand(ate), Commish, and internet-court-skill (about 7.2k stars, combining mandates, ERC-7710, x402, escrow and disputes). A dispute layer alone is not fresh unless it adds something specific, for example compliance-aware refunds or reversals that preserve KYC and sanctions attestations, or settlement reconciliation output.

### Gaps
- Official ETHGlobal 2026 prize lists for agent tracks could not be confirmed (showcase pages were not fetched). The placements of Clawback and Agentbook are unknown.
- The Algorand Challenge's final $100k ranking (30 Oct 2026 final) was not confirmed.
- No 2026 Google AP2-branded, Hedera, Casper or NEAR agent-payment hackathon winner lists were found in the searches that were run.
- No HashKey or prior HSK hackathon winner data was researched here.

## (c) Which agent-payment use cases have genuine demand, and which are hype?

### Takeaway
Real, repeatable demand exists for machine-to-machine pay-per-call: LLM inference, data APIs and crawl access, where API-key and subscription friction is the pain. Demand is also emerging for B2B invoice and treasury automation. Consumer "agent buys your shopping" is mostly hype for now. Speculative micro-payment volume (memecoin mints, wash loops) inflated x402 numbers and has since collapsed.

### Cited Findings
- About half of x402 transactions are judged artificial, and real commerce is about $28k/day. Self-dealing and wash loops account for a substantial share. — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/x402-foundation-activated-27-old-152440828.html); [qatom](https://www.qatom.ai/learn/x402-in-2026)
- Payments of $1 or more rose to 95% of x402 value on Base by early 2026, a shift toward real service payments. — [nevermined](https://nevermined.ai/blog/stablecoin-payments-ai-agents-statistics)
- OpenAI Instant Checkout was shut down after about 5 months with near-zero sales. This is the strongest negative signal on consumer agent shopping. — [paymentreview](https://paymentreview.com/blog/agentic-commerce-merchants-2026/); [digitalapplied](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide)
- Most analysts still put mass consumer adoption 2–3 years out. — [itechguides](https://www.itechguides.com/visa-and-mastercard-unveil-ai-powered-shopping-what-their-agent-payment-systems-actually-do/)
- Traction signals for pay-per-call infrastructure:
  - ClawRouter (agent LLM router with x402 USDC payments) has about 6.7k stars.
  - MPP listed more than 100 paid services at launch.
  - Algorand drew 115 live mainnet paid endpoints, and its x402 daily settlements reportedly jumped 30x to about 40.6k.

  — GitHub [BlockRunAI/ClawRouter](https://github.com/BlockRunAI/ClawRouter); [Techstrong](https://techstrong.ai/features/stripes-machine-payments-protocol-gives-ai-agents-a-way-to-spend-money-without-human-help/); [pluang](https://pluang.com/en/news-feed/lonjakan-pembayaran-x402-algorand-30x-hingga-40600-settlement-harian)
- Mastercard launched "Agent Pay for Machines" for M2M, microtransactions and digital services (Jun 2026). This shows incumbents see M2M as the nearer-term market. — [agentcard.ai](https://agentcard.ai/blog/visa-intelligent-commerce-mastercard-agent-pay)
- a16z argues B2B agent purchasing (from compute streaming to $50k vendor invoices) is where stablecoins win, and that cards keep consumer checkout. — [blockchain.news](https://blockchain.news/news/a16z-stablecoins-ai-agent-b2b-payments); [a16z Frontier](https://a16zfrontier.substack.com/p/agentic-commerce-wont-kill-cards)
- Publishers monetizing AI crawlers (Cloudflare Pay-per-Crawl) is a real demand driver, but it is still a closed beta with no published numbers. — [proxyops](https://proxyops.dev/artiklar/cloudflare-pay-per-crawl-402-web-bot-auth-ai-labyrinth-guide/)
- Compliant cross-border stablecoin payments for emerging markets won at Colosseum Frontier (DashX). — [solanacompass](https://solanacompass.com/news/colosseum-announces-26-winners-of-the-solana-frontier-hackathon-the-largest-crypto-hackathon-ever)

### Inferences
- For an HSK pitch, the most credible demand story is B2B or regulated M2M: agents paying for data, inference or compliance services, or settling invoices between businesses, under HashKey's compliance posture (KYC and sanctions attestations). Consumer shopping agents are not a credible story.
- HashKey's regulated, Hong Kong-centric positioning matches the "compliant cross-border stablecoin" and "regulated bank agent payment" pilots (Mastercard in Hong Kong, Santander). A compliant A2A payment with auditable records is more defensible here than on Base.

### Gaps
- No reliable breakdown of x402 volume by use-case category was found. Chainalysis may have one, but it was not fetched.
- No data was found on agent-payment adoption specifically in Korea or Hong Kong.

## (d) Which problems does the industry still call unsolved?

### Takeaway
The industry consistently names disputes and chargebacks, refunds on irreversible push payments, intent verification (a verified agent can still buy the wrong thing), liability allocation, agent identity spam and sybil registrations, fraud layers for stablecoin rails, credit, statements and reconciliation, and fragmented governance as open. Identity (KYA) is being built. What happens after payment (disputes, refunds, accounting) is mostly not.

### Cited Findings
- No card network has agent-specific chargeback reason codes. Agent disputes use the existing Visa and Mastercard codes. — [chargeflow](https://www.chargeflow.io/blog/agentic-commerce-chargebacks-liability); [winningchargebacks](https://www.winningchargebacks.com/blog/agentic-commerce-chargebacks.html)
- **Authorization does not prove intent.** A verified, authenticated, cryptographically signed agent can still buy the wrong thing, exceed an implied budget, misinterpret a preference or act on stale instructions. — [fraudbeat](https://www.fraudbeat.com/agentic-commerce-disputes-friendly-fraud/); [swell](https://www.swell.is/content/ai-agent-orders-fraud-chargebacks)
- **"Know Your Agent won't solve the chargeback problem."** The industry will need interoperability for disputes, not just for identity. — [Chargebacknerd](https://chargebacknerd.substack.com/p/knowing-your-agent-wont-solve-the)
- **Liability is contested.** Reportedly, a CFPB Jan 2026 advisory says consumer dispute rights survive delegation, while Visa Core Rules make the cardholder responsible for the agent's actions. Neither was verified against primary documents. — [chargeflow regulation](https://www.chargeflow.io/blog/agentic-commerce-regulation-what-merchants-need-to-know); [chargemate](https://www.chargemate.tech/articles/agentic-commerce-chargebacks)
- **Merchant best practice today** is to keep the delegation, the approved cart and the agent ID, and to tag agent orders so their dispute rates are tracked separately. This is manual, so it is a tooling gap. — [chargeflow fraud](https://www.chargeflow.io/blog/preventing-fraud-and-chargebacks-in-agentic-commerce)
- **x402 refunds** are a new push transfer, and refunds and disputes "have no clear owner" under the protocol. Governance commentary asks "who refunds you". — [eSEOspace](https://eseospace.com/blog/what-is-x402/); [Daniel McGlynn](https://www.danielmcglynn.com/your-ai-assistant-can-spend-your-money-before-anyone-decides-who-refunds-you/)
- **Stablecoins lack** a network-level fraud layer, arbitration, statement generation, credit facilities and batch approval. — [a16z Frontier](https://a16zfrontier.substack.com/p/agentic-commerce-wont-kill-cards); [blockchain.news on Broner](https://blockchain.news/news/a16z-stablecoins-ai-agent-b2b-payments)
- **Agent identity quality:** most ERC-8004 registrations are non-functional (3–15% have a valid file plus a service), and cross-chain portability is 0.4%. Registration count does not equal trust. — [arXiv 2606.26028](https://arxiv.org/html/2606.26028)
- **Wash and synthetic volume** undermines reputation and leaderboards. GoPlausible had to publish a synthetic-volume analysis for the Algorand leaderboard. — [GitHub report](https://github.com/Ganainmtech/x402-global-challenge-report); [qatom](https://www.qatom.ai/learn/x402-in-2026)
- **Agent authentication standards** from the card networks are still in development, with "nothing live as of 2026" per one merchant guide. This conflicts with Mastercard's live Agent Pay transactions; the guide likely means a dispute-grade standard. — [chargeflow fraud](https://www.chargeflow.io/blog/preventing-fraud-and-chargebacks-in-agentic-commerce); [agentcard.ai](https://agentcard.ai/blog/visa-intelligent-commerce-mastercard-agent-pay)

### Inferences (fresh angles for HSK, based on the gaps above)
1. **Intent-to-outcome proof and dispute evidence packs.** Many projects sign mandates. Few produce a standardized, machine-verifiable evidence bundle (mandate, quote or cart, delivery proof, response hash, compliance attestations) that a dispute resolver or chargeback system can consume. This targets the "authorization ≠ intent" and "no dispute interop" gaps directly.
2. **Compliance-preserving refunds and reversals.** Refunds on HSP that carry the original KYC and sanctions attestations, plus partial refunds, holdback windows (Commish-style) and SLA-based auto-refunds. x402 v2 has none of this.
3. **Agent statements, reconciliation and tax.** An accounting layer that turns A2A settlements into per-principal statements, cost-centre allocation and invoice or receipt matching (Broner's "statement generation" gap). This is a boring B2B pain that judges with a TradFi background (HashKey) will recognize.
4. **Agent credit and batch approval.** Pre-funded credit lines or net settlement between agents, with periodic netting and batch human approval instead of per-transaction signatures. This combines a16z's "credit facilities" and "batch approval" gaps.
5. **Wash-volume and sybil-resistant reputation.** Agent reputation weighted by counterparty diversity and attested KYC rather than raw transaction count, which answers the ERC-8004 and x402 wash critiques.
6. **Trading track.** A signed, replayable decision trace plus a guard (allow, deny or downsize) plus risk-adjusted scoring matches what won at lablab and BNB. To be fresh, combine it with payments: for example, a trading agent that buys signals or data from other agents via HSP/x402 and pays only if the signal is verified or performs (pay-for-performance), with the payment refunded or clawed back on a miss. This links Track 1 and Track 2 and uses the runner-up pattern of paying after verification.

### Gaps
- Primary texts of the CFPB advisory and Visa Core Rules agent clauses were not verified.
- No published research quantifying agent-payment fraud losses in 2026 was found.
- Tax and accounting treatment of agent micro-payments got no dedicated coverage in these searches.
