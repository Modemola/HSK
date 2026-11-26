// Deterministic compliance rules. These decide; the LLM never does.
import type { Finding, Party, TransferRequest } from "./types.ts";

/** Reference rates (MOCKED — a production operator plugs in its own licensed FX source). */
export const FX = { KRW_PER_HKD: 176.5, KRW_PER_USD: 1378.0 } as const;

export const toHkd = (krw: number) => krw / FX.KRW_PER_HKD;
export const toUsd = (krw: number) => krw / FX.KRW_PER_USD;

export const RULES = {
  /** HK AMLO Travel Rule threshold for virtual-asset transfers (HK$8,000). */
  travelRuleHkd: 8_000,
  /** A transfer this close to the threshold (as a fraction) counts as "near threshold". */
  nearThresholdRatio: 0.85,
  /** Look-back window for linked transfers. */
  windowSeconds: 72 * 3600,
  /** Distinct originators paying one beneficiary in the window that indicates smurfing. */
  smurfOriginators: 3,
} as const;

export interface HistoryEntry {
  request: TransferRequest;
  decision: string;
}

/**
 * Structuring: splitting what is economically one transfer into several below-threshold
 * transfers. Flags (a) one originator sending ≥2 near-threshold transfers in the window whose
 * sum crosses the threshold, and (b) ≥3 originators paying one beneficiary in the window
 * whose sum crosses the threshold.
 */
export function detectStructuring(req: TransferRequest, history: HistoryEntry[]) {
  const findings: Finding[] = [];
  const since = req.createdAt - RULES.windowSeconds;
  const recent = history.filter((h) => h.request.createdAt >= since && h.request.caseId !== req.caseId);
  const near = (krw: number) => {
    const hkd = toHkd(krw);
    return hkd < RULES.travelRuleHkd && hkd >= RULES.travelRuleHkd * RULES.nearThresholdRatio;
  };

  const sameOriginator = recent.filter((h) => h.request.originator.id === req.originator.id);
  const aggregateHkd = toHkd(req.amountKrw + sameOriginator.reduce((s, h) => s + h.request.amountKrw, 0));
  const nearCount = [req, ...sameOriginator.map((h) => h.request)].filter((r) => near(r.amountKrw)).length;

  if (near(req.amountKrw)) {
    findings.push({
      code: "NEAR_THRESHOLD",
      severity: "medium",
      detail: `HK$${toHkd(req.amountKrw).toFixed(0)} is within ${Math.round((1 - RULES.nearThresholdRatio) * 100)}% below the HK$${RULES.travelRuleHkd.toLocaleString()} Travel-Rule threshold`,
    });
  }
  if (nearCount >= 2 && aggregateHkd >= RULES.travelRuleHkd && toHkd(req.amountKrw) < RULES.travelRuleHkd) {
    findings.push({
      code: "STRUCTURING_ORIGINATOR",
      severity: "high",
      detail: `${nearCount} near-threshold transfers from ${req.originator.name} within ${RULES.windowSeconds / 3600}h total HK$${aggregateHkd.toFixed(0)}, above the HK$${RULES.travelRuleHkd.toLocaleString()} threshold`,
      relatedCaseIds: sameOriginator.map((h) => h.request.caseId),
    });
  }

  const sameBeneficiary = recent.filter((h) => h.request.beneficiary.id === req.beneficiary.id);
  const originators = new Set([req.originator.id, ...sameBeneficiary.map((h) => h.request.originator.id)]);
  const benAggregateHkd = toHkd(req.amountKrw + sameBeneficiary.reduce((s, h) => s + h.request.amountKrw, 0));
  if (originators.size >= RULES.smurfOriginators && benAggregateHkd >= RULES.travelRuleHkd) {
    findings.push({
      code: "STRUCTURING_BENEFICIARY",
      severity: "high",
      detail: `${originators.size} different senders paid ${req.beneficiary.name} HK$${benAggregateHkd.toFixed(0)} within ${RULES.windowSeconds / 3600}h, each below threshold`,
      relatedCaseIds: sameBeneficiary.map((h) => h.request.caseId),
    });
  }
  return { findings, aggregateHkd };
}

// DEMO watch-list. Production screening comes from the HSP issuer's `attests:sanctions`
// attestation and the operator's licensed screening provider.
const WATCHLIST = ["KIM JONG CHOL", "OCEAN STAR SHIPPING LTD", "LAZARUS TRADING", "GOLDEN TRIANGLE LOGISTICS"];

const normalizeName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function screenNames(parties: Party[]): Finding[] {
  const out: Finding[] = [];
  for (const p of parties) {
    const n = normalizeName(p.name);
    // Whole-token containment of the full listed name (so "Kim" alone never matches "Kim Jong Chol").
    const tokens = new Set(n.split(" "));
    const hit = WATCHLIST.find((w) => w.split(" ").every((t) => tokens.has(t)));
    if (hit) {
      out.push({ code: "SANCTIONS_NAME_MATCH", severity: "critical", detail: `${p.name} matches watch-list entry "${hit}"` });
    }
  }
  return out;
}

/** Fields an IVMS101-style Travel-Rule message needs for originator and beneficiary. */
export function travelRuleGaps(req: TransferRequest): string[] {
  const gaps: string[] = [];
  const o = req.originator;
  const b = req.beneficiary;
  if (!o.name) gaps.push("originator.name");
  if (!o.accountRef && !o.wallet) gaps.push("originator.accountRef");
  if (!o.address && !o.dateOfBirth && !o.nationalIdRef) gaps.push("originator.address|dateOfBirth|nationalId");
  if (!b.name) gaps.push("beneficiary.name");
  if (!b.accountRef && !b.wallet) gaps.push("beneficiary.accountRef");
  return gaps;
}
