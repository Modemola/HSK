// Reads the customer's free-text memo (Korean or English) for purpose and evasion intent,
// and writes the analyst narrative for the evidence pack. Uses Claude when credentials are
// available; otherwise a keyword heuristic. The output is ADVISORY: it adds findings, but the
// decision is made by the deterministic rules in agent.ts.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Finding, IntentAnalysis, TransferRequest } from "./types.ts";

const MODEL = process.env.CORRIDOR_MODEL ?? "claude-opus-5-5";

const IntentSchema = z.object({
  purposeCategory: z.enum([
    "trade_goods_payment",
    "services_payment",
    "family_support",
    "education",
    "salary_or_payroll",
    "investment",
    "loan_or_repayment",
    "unclear",
  ]),
  evasionIndicators: z.array(z.string()),
  evasionRisk: z.enum(["none", "low", "medium", "high"]),
  narrative: z.string(),
});

const SYSTEM = `You are the compliance analyst agent of a licensed Korea→Hong Kong remittance operator.
For one transfer request you receive the memo, the declared purpose, the amount and the deterministic rule findings.
Classify the payment purpose. List concrete evasion indicators found in the memo or the pattern (e.g. stated intent to split
payments, to stay under a reporting limit, to avoid the bank, mismatch between declared purpose and memo, third-party
instructions). Memos may be in Korean; quote indicators in the original language with an English gloss.
Then write a 2–4 sentence narrative for the auditor: what happened, why it matters, what the operator did.
Be factual. Do not speculate beyond the evidence. Rule findings are authoritative; do not contradict them.`;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (process.env.CORRIDOR_LLM === "off") return null;
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  client ??= new Anthropic();
  return client;
}

export async function analyzeIntent(req: TransferRequest, ruleFindings: Finding[]): Promise<IntentAnalysis> {
  const c = getClient();
  if (c) {
    try {
      return await analyzeWithClaude(c, req, ruleFindings);
    } catch (err) {
      console.warn(`[intent] Claude analysis failed, using heuristic: ${(err as Error).message}`);
    }
  }
  return heuristicIntent(req, ruleFindings);
}

async function analyzeWithClaude(c: Anthropic, req: TransferRequest, ruleFindings: Finding[]): Promise<IntentAnalysis> {
  const response = await c.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: zodOutputFormat(IntentSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          memo: req.memo,
          declaredPurpose: req.declaredPurpose ?? null,
          amountKrw: req.amountKrw,
          originatorCountry: req.originator.country,
          beneficiaryCountry: req.beneficiary.country,
          beneficiaryIsBusiness: /ltd|limited|co\.|company|trading|corp/i.test(req.beneficiary.name),
          ruleFindings,
        }),
      },
    ],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`no structured output (stop_reason=${response.stop_reason})`);
  }
  return { source: "llm", ...response.parsed_output };
}

const EVASION_PATTERNS: [RegExp, string][] = [
  [/split|in (two|three|parts)|separate (payments|transfers)|break (it )?up/i, "states intent to split the payment"],
  [/under (the )?(limit|threshold)|below (the )?(limit|threshold)|avoid (the )?(report|limit|bank|kyc)/i, "states intent to stay under a reporting limit"],
  [/나눠|나누어|분할/, "나눠서 보내기 (split into parts)"],
  [/신고\s*(안|않|피)|한도\s*(이하|아래|안)|안 걸리/, "신고 회피 (avoid reporting)"],
  [/cash|현금/i, "cash-origin funds mentioned"],
  [/on behalf of|for my friend|대신/i, "third-party instruction"],
];

const PURPOSE_PATTERNS: [RegExp, string][] = [
  [/invoice|inv[-\s]?\d|supplier|goods|order|PO\b|인보이스|대금|물품/i, "trade_goods_payment"],
  [/tuition|school|university|학비|등록금/i, "education"],
  [/mom|mother|dad|father|family|parents|엄마|어머니|가족|부모/i, "family_support"],
  [/salary|payroll|wage|급여|월급/i, "salary_or_payroll"],
  [/service|consulting|fee|용역|수수료/i, "services_payment"],
];

export function heuristicIntent(req: TransferRequest, ruleFindings: Finding[]): IntentAnalysis {
  const text = `${req.memo} ${req.declaredPurpose ?? ""}`;
  const evasionIndicators = EVASION_PATTERNS.filter(([re]) => re.test(text)).map(([, label]) => label);
  const purposeCategory = PURPOSE_PATTERNS.find(([re]) => re.test(text))?.[1] ?? "unclear";
  const structuring = ruleFindings.some((f) => f.code.startsWith("STRUCTURING"));
  const evasionRisk: IntentAnalysis["evasionRisk"] =
    evasionIndicators.length >= 2 || (structuring && evasionIndicators.length >= 1)
      ? "high"
      : evasionIndicators.length === 1 || structuring
        ? "medium"
        : "none";
  const parts = [
    `${req.originator.name} asked to send ₩${req.amountKrw.toLocaleString()} to ${req.beneficiary.name} (${req.beneficiary.country}), purpose read as ${purposeCategory.replaceAll("_", " ")}.`,
  ];
  if (evasionIndicators.length) parts.push(`The memo contains evasion indicators: ${evasionIndicators.join("; ")}.`);
  if (structuring) parts.push("Linked recent transfers indicate structuring below the Travel-Rule threshold.");
  return { source: "heuristic", purposeCategory, evasionIndicators, evasionRisk, narrative: parts.join(" ") };
}
