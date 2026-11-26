import { keccak256, toHex } from "viem";

/**
 * Deterministic JSON (RFC 8785-style key ordering): object keys sorted, no whitespace,
 * bigint rendered as decimal string, undefined fields dropped. Used for every hash that an
 * auditor must be able to recompute from the evidence pack.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = normalize(v);
    }
    return out;
  }
  return value;
}

export function hashCanonical(value: unknown): `0x${string}` {
  return keccak256(toHex(canonicalJson(value)));
}
