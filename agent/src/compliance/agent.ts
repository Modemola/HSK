// Compliance Agent: combines deterministic rules with the intent analysis and returns the
// decision the Sender Agent must obey.
import { analyzeIntent } from "./intent.ts";
import { RULES, detectStructuring, screenNames, toHkd, toUsd, travelRuleGaps, type HistoryEntry } from "./rules.ts";
import type { ComplianceResult, Decision, Finding, TransferRequest } from "./types.ts";

export class ComplianceAgent {
  private readonly history: HistoryEntry[] = [];

  async review(req: TransferRequest): Promise<ComplianceResult> {
    const findings: Finding[] = [];
    findings.push(...screenNames([req.originator, req.beneficiary]));
    const { findings: structuring, aggregateHkd } = detectStructuring(req, this.history);
    findings.push(...structuring);

    const amountHkd = toHkd(req.amountKrw);
    const travelRuleRequired = amountHkd >= RULES.travelRuleHkd;
    if (travelRuleRequired) {
      const gaps = travelRuleGaps(req);
      if (gaps.length) {
        findings.push({ code: "TRAVEL_RULE_INCOMPLETE", severity: "high", detail: `missing ${gaps.join(", ")}` });
      }
    }

    const intent = await analyzeIntent(req, findings);
    if (intent.evasionRisk === "high" || intent.evasionRisk === "medium") {
      findings.push({
        code: "INTENT_EVASION",
        severity: intent.evasionRisk === "high" ? "high" : "medium",
        detail: intent.evasionIndicators.join("; ") || "no memo indicators; risk raised by the linked-transfer pattern",
      });
    }

    const has = (code: Finding["code"]) => findings.some((f) => f.code === code);
    let decision: Decision;
    let remediation: string | undefined;
    if (has("SANCTIONS_NAME_MATCH")) {
      decision = "BLOCK";
      remediation = "Do not process. Escalate to the MLRO for sanctions review.";
    } else if (has("STRUCTURING_ORIGINATOR") || has("STRUCTURING_BENEFICIARY")) {
      decision = "BLOCK";
      remediation =
        "Refuse the split transfer. If the payment is legitimate, resubmit as one aggregated transfer with a full Travel-Rule packet; record an internal suspicious-activity note.";
    } else if (intent.evasionRisk === "high") {
      decision = "HOLD";
      remediation = "Hold for manual review: the memo states intent to evade reporting.";
    } else if (has("TRAVEL_RULE_INCOMPLETE")) {
      decision = "HOLD";
      remediation = "Collect the missing originator/beneficiary data before releasing.";
    } else {
      decision = travelRuleRequired ? "ALLOW_WITH_TRAVEL_RULE" : "ALLOW";
    }

    this.history.push({ request: req, decision });
    return {
      caseId: req.caseId,
      decision,
      findings,
      amountHkd: Math.round(amountHkd * 100) / 100,
      amountUsd: Math.round(toUsd(req.amountKrw) * 100) / 100,
      travelRuleRequired,
      aggregateHkdInWindow: Math.round(aggregateHkd * 100) / 100,
      intent,
      remediation,
    };
  }
}
