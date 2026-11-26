import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";
import { createSimulatorWorld, grant, LocalHspSimulator, trustPolicyFor } from "../src/hsp/simulator.ts";
import { CAP } from "../src/hsp/types.ts";
import { ComplianceAgent } from "../src/compliance/agent.ts";
import { FX } from "../src/compliance/rules.ts";
import type { TransferRequest } from "../src/compliance/types.ts";
import { canonicalJson, hashCanonical } from "../src/util/canonical.ts";
import { heuristicIntent } from "../src/compliance/intent.ts";

process.env.CORRIDOR_LLM = "off";

const acct = () => privateKeyToAccount(generatePrivateKey());
const ref = keccak256(toHex("quote-1"));
const requireAll = [CAP.settlementVerified, CAP.kyc, CAP.sanctions];

test("HSP verifier ACCEPTs a compliant payment with KYC + sanctions attestations", async () => {
  const world = createSimulatorWorld();
  const payer = acct();
  const payee = acct();
  grant(world, payer.address, [CAP.kyc, CAP.sanctions]);
  grant(world, payee.address, [CAP.sanctions]);
  const hsp = new LocalHspSimulator(world, payer);
  const res = await hsp.pay({ to: payee.address, amount: 1_000_000n, reference: ref, compliance: ["kyc", "sanctions"] });
  const d = await hsp.verify(res, trustPolicyFor(world, requireAll));
  assert.equal(d.outcomeClass, "ACCEPT", d.reasons.join("; "));
  assert.deepEqual(d.missing, []);
});

test("HSP verifier REJECTs when the payee lacks a sanctions attestation", async () => {
  const world = createSimulatorWorld();
  const payer = acct();
  const payee = acct();
  grant(world, payer.address, [CAP.kyc, CAP.sanctions]);
  const hsp = new LocalHspSimulator(world, payer);
  const res = await hsp.pay({ to: payee.address, amount: 1_000_000n, reference: ref, compliance: ["kyc", "sanctions"] });
  const d = await hsp.verify(res, trustPolicyFor(world, requireAll));
  assert.equal(d.outcomeClass, "REJECT");
  assert.deepEqual(d.missing, [CAP.sanctions]);
  assert.deepEqual(await hsp.attestableCapabilities(payee.address, [CAP.sanctions]), []);
});

test("HSP verifier REJECTs a receipt from an unpinned adapter and a tampered amount", async () => {
  const world = createSimulatorWorld();
  const payer = acct();
  const payee = acct();
  grant(world, payer.address, [CAP.kyc, CAP.sanctions]);
  grant(world, payee.address, [CAP.sanctions]);
  const hsp = new LocalHspSimulator(world, payer);
  const res = await hsp.pay({ to: payee.address, amount: 1_000_000n, reference: ref, compliance: ["kyc", "sanctions"] });

  const wrongAdapter = { ...trustPolicyFor(world, requireAll), adapterAddress: acct().address };
  assert.equal((await hsp.verify(res, wrongAdapter)).outcomeClass, "REJECT");

  const tampered = { ...res, receipt: { ...res.receipt, amount: "1" } };
  const d = await hsp.verify(tampered, trustPolicyFor(world, requireAll));
  assert.equal(d.outcomeClass, "REJECT");
  assert.ok(d.missing.includes(CAP.settlementVerified));
});

test("HSP verifier ignores attestations from untrusted issuers", async () => {
  const world = createSimulatorWorld();
  const rogue = createSimulatorWorld({ chainId: world.chainId });
  const payer = acct();
  const payee = acct();
  grant(rogue, payer.address, [CAP.kyc, CAP.sanctions]);
  grant(rogue, payee.address, [CAP.sanctions]);
  const rogueHsp = new LocalHspSimulator({ ...rogue, adapter: world.adapter }, payer);
  const res = await rogueHsp.pay({ to: payee.address, amount: 5n, reference: ref, compliance: ["kyc", "sanctions"] });
  const d = await rogueHsp.verify(res, trustPolicyFor(world, requireAll));
  assert.equal(d.outcomeClass, "REJECT");
  assert.deepEqual(d.missing, [CAP.kyc, CAP.sanctions]);
});

const party = (id: string, name: string, country: string) => ({
  id,
  name,
  country,
  address: "1 Test St",
  accountRef: `ACC-${id}`,
});
const hkd = (n: number) => Math.round(n * FX.KRW_PER_HKD);
const base = 1_790_000_000;
const req = (caseId: string, krw: number, memo: string, offset = 0, from = "c1", to = "b1"): TransferRequest => ({
  caseId,
  createdAt: base + offset,
  originator: party(from, `Customer ${from}`, "KR"),
  beneficiary: party(to, "Kowloon Parts Trading Ltd", "HK"),
  amountKrw: krw,
  memo,
});

test("compliance allows an ordinary below-threshold transfer", async () => {
  const c = new ComplianceAgent();
  const r = await c.review(req("A1", hkd(3_000), "Invoice INV-2201 for spare parts"));
  assert.equal(r.decision, "ALLOW");
  assert.equal(r.travelRuleRequired, false);
});

test("compliance requires the Travel Rule above HK$8,000", async () => {
  const c = new ComplianceAgent();
  const r = await c.review(req("A2", hkd(12_000), "Invoice INV-2202"));
  assert.equal(r.decision, "ALLOW_WITH_TRAVEL_RULE");
});

test("compliance blocks structuring: three HK$7,900 transfers within 72h", async () => {
  const c = new ComplianceAgent();
  const r1 = await c.review(req("S1", hkd(7_900), "parts payment 1", 0));
  const r2 = await c.review(req("S2", hkd(7_900), "parts payment 2", 3600));
  const r3 = await c.review(req("S3", hkd(7_900), "parts payment 3", 7200));
  assert.equal(r1.decision, "ALLOW");
  assert.equal(r2.decision, "BLOCK");
  assert.equal(r3.decision, "BLOCK");
  assert.ok(r3.findings.some((f) => f.code === "STRUCTURING_ORIGINATOR"));
  assert.ok(r3.aggregateHkdInWindow > 8_000);
});

test("compliance blocks smurfing: several senders paying one beneficiary", async () => {
  const c = new ComplianceAgent();
  await c.review(req("M1", hkd(3_000), "gift", 0, "c1"));
  await c.review(req("M2", hkd(3_000), "gift", 60, "c2"));
  const r = await c.review(req("M3", hkd(3_000), "gift", 120, "c3"));
  assert.equal(r.decision, "BLOCK");
  assert.ok(r.findings.some((f) => f.code === "STRUCTURING_BENEFICIARY"));
});

test("compliance blocks a sanctions name match and holds incomplete Travel-Rule data", async () => {
  const c = new ComplianceAgent();
  const sanctioned = { ...req("X1", hkd(1_000), "freight"), beneficiary: party("b9", "Ocean Star Shipping Ltd.", "HK") };
  assert.equal((await c.review(sanctioned)).decision, "BLOCK");
  const incomplete = req("X2", hkd(9_000), "invoice INV-77");
  incomplete.originator = { id: "c7", name: "Kim", country: "KR" };
  assert.equal((await c.review(incomplete)).decision, "HOLD");
});

test("intent heuristic reads Korean evasion phrasing", () => {
  const r = heuristicIntent(req("K1", hkd(7_800), "신고 안 되게 세 번 나눠서 보내주세요"), []);
  assert.equal(r.evasionRisk, "high");
  assert.ok(r.evasionIndicators.length >= 2);
});

test("canonical hashing is independent of key order", () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2n, c: [3] } }), '{"a":{"c":[3],"d":"2"},"b":1}');
  assert.equal(hashCanonical({ x: 1, y: 2 }), hashCanonical({ y: 2, x: 1 }));
});
