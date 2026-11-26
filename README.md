# Corridor

**Compliant agent-to-agent settlement for Korea → Hong Kong transfers, on HSK Chain with HSP.**

Corridor gives licensed remittance operators AI agents that settle cross-border stablecoin transfers through the HashKey Settlement Protocol's *compliant* payment profile. Every transfer carries verified KYC and sanctions attestations, a Travel-Rule packet and a modelled Korean FX-report record. A Compliance Agent refuses transfers that were split to stay under reporting thresholds, and every decision is anchored on HSK Chain so an auditor can check it later.

> HSK Chain Horizon Hackathon · Seoul. Track 2: Agent Payments & A2A Settlement.

---

## Why

- Korea's amended FX Transactions Act brings cross-border virtual-asset transfers under registration and reporting from December 2026. Illegal crypto FX ("hwanchigi") is the main enforcement target, and stablecoins are the usual tool.
- Hong Kong applies the Travel Rule to virtual-asset transfers of HK$8,000 or more.
- HashKey, Kbank and BPMG have announced a KR↔HK stablecoin payments PoC with KYC/AML requirements.
- Operators need settlement that is fast and also produces compliance evidence at the moment of settlement. Agents are needed because a rule table can't link split transfers, read a Korean memo that says "split it so it isn't reported", run a payout auction and refuse a cheaper but unscreened counterparty, all for every transfer.

## How it works

```
Customer ──► Sender Agent (licensed KR operator)
               │ 1. Compliance Agent: sanctions screen, structuring/smurfing across linked
               │    transfers, Travel-Rule threshold, memo intent (Claude) → ALLOW / HOLD / BLOCK
               │ 2. Quote auction among Payout Agents listed in CorridorRegistry
               │ 3. HSP pre-flight: drop any payee the issuer won't attest `attests:sanctions`
               │ 4. HSP compliant payment (mandate requires kyc + sanctions) bound to the quote hash
               ▼
         Payout Agent (licensed HK operator)
               │ 5. Runs the HSP verifier itself as relying party → ACCEPT / REJECT
               ▼
         HSK Chain
           CorridorEscrow   6. lock USDC.e (mandateHash = HSP paymentId, quoteHash)
                            7. relayer anchors the ACCEPTed HSP receipt hash  ← required to release
                            8. payout operator pays HKD and calls confirmPayout → funds released
                               or the SLA lapses → anyone can refund; receipt stays attached
           EvidenceAnchor   9. keccak256(evidence pack) for every settlement, refund and block
           CorridorRegistry    licensed operators + on-chain settled/refunded track record
```

The evidence pack (canonical JSON) contains the compliance findings and narrative, the payout auction, the HSP mandate, receipt and attestation digests, the verifier decision, escrow transactions, an IVMS101-style Travel-Rule packet and a modelled BOK FX-report record. The console re-hashes a pack and checks it against `EvidenceAnchor`.

## What is real and what is simulated

| Layer | Status |
|---|---|
| `CorridorRegistry`, `CorridorEscrow`, `EvidenceAnchor` | Real Solidity, tested. Deploys to HSK Chain mainnet (177) with USDC.e `0x054e…8D0a`. The demo locks a stated fraction of the value (`CORRIDOR_VALUE_SCALE`) |
| HSP compliant payment, attestations, verifier | Uses the organisers' HSP Coordinator via `@hsp/sdk` when credentials are set (`agent/src/hsp/coordinator.ts`). Without them, a **local protocol simulator** with the same mandate/receipt/attestation model and subset rule. The console labels which one ran |
| Testnet HSP ↔ mainnet escrow link | The HSP sandbox is testnet-only, so a relayer we run anchors the ACCEPTed receipt hash on mainnet. **The relayer is trusted** |
| Compliance rules | Real code. The sanctions watch-list is a demo list; production screening comes from the HSP issuer attestation and the operator's provider |
| Memo intent and analyst narrative | Claude (`claude-opus-5-5`, structured output) when `ANTHROPIC_API_KEY` is set, otherwise a keyword heuristic. Advisory only: the deterministic rules decide |
| KRW collection, HKD payout (FPS), FX rates, operator licences | Simulated |
| Travel-Rule packet, KR FX-report record | Modelled. The official VA-transfer report schema is not public yet |

## Quick start (local, no credentials)

```bash
cd contracts && npm install && npm test        # 10 contract tests
cd ../agent && npm install && npm test         # 11 agent tests
npm run demo                                   # starts a local chain, runs the 3 cases
npm run console                                # http://localhost:4177
```

To keep the chain running for the console's on-chain re-verification, start `npx hardhat node` in `contracts/` first; the demo reuses it.

## Deploy to HSK Chain mainnet

1. Create five fresh wallets (deployer/relayer, sender, payout A, payout B). Fund each with a little HSK for gas, and the sender with ~5 USDC.e.
2. Copy `.env.example` to `.env`, fill in the keys, then `set -a; source .env; set +a`.
3. Deploy and register the operators:

```bash
cd contracts
SENDER_OPERATOR=<sender address> PAYOUT_OPERATORS=<payoutA>,<payoutB> \
  npx hardhat run scripts/deploy.js --network hashkeyMainnet
npx hardhat verify --network hashkeyMainnet <address> <constructor args…>   # Blockscout
```

4. Run the demo against mainnet and open the console. Transaction links go to `hsk.blockscout.com`:

```bash
cd ../agent && CORRIDOR_NETWORK=mainnet npm run demo
npm run console
```

## Using the real HSP Coordinator

Once the organisers share the SDK repository and sandbox details:

```bash
npm install /path/to/hsp/packages/sdk /path/to/hsp/packages/core
export HSP_COORDINATOR_URL=… HSP_API_KEY=… HSP_ISSUER_URL=… HSP_PRIVATE_KEY=… HSP_ADAPTER_ADDRESS=… HSP_TRUSTED_ISSUERS=…
```

`createWorld()` switches to the Coordinator automatically. The field mapping in `coordinator.ts` follows the HashFans HSP guide and must be checked against the SDK source.

## Repository

```
contracts/   Hardhat (solcjs) — CorridorRegistry, CorridorEscrow (EIP-3009 + approve), EvidenceAnchor, tests, deploy
agent/src/
  hsp/         HSP types, relying-party verifier, local simulator, @hsp/sdk adapter
  compliance/  rules (structuring, smurfing, Travel Rule, screening), Claude intent analysis, Compliance Agent
  agents/      Sender Agent, Payout Agent, ledger
  evidence/    evidence pack, Travel-Rule packet, FX-report record
  chain/       viem bindings, ABIs
  demo/        world setup + the three demo cases
  console/     auditor console (node:http + one HTML page)
docs/          pitch and demo script
reports/       idea research behind the project
```

## Security notes

- Escrow transfer ids hash every term and double as the EIP-3009 nonce, so a relayer can't redirect a signed authorization to different terms.
- Release requires both the anchored HSP receipt hash and the payout operator's own call before the deadline. After the deadline only a refund to the sender is possible.
- Only registered, active operators can lock or receive funds. The registry owner can deactivate an operator.
- Not audited. Hackathon code; use demo-sized amounts.
