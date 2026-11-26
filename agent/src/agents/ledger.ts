// Append-only local log of agent events and evidence packs, read by the auditor console.
import fs from "node:fs";
import path from "node:path";
import type { Hex } from "viem";
import { canonicalJson } from "../util/canonical.ts";
import type { LedgerEvent } from "./types.ts";

export class Ledger {
  readonly dir: string;
  private readonly listeners = new Set<(e: LedgerEvent) => void>();

  constructor(dir = process.env.CORRIDOR_DATA_DIR ?? path.resolve(process.cwd(), "..", ".corridor-data")) {
    this.dir = dir;
    fs.mkdirSync(path.join(dir, "packs"), { recursive: true });
  }

  emit(e: LedgerEvent) {
    fs.appendFileSync(path.join(this.dir, "events.jsonl"), canonicalJson(e) + "\n");
    for (const l of this.listeners) l(e);
  }

  onEvent(fn: (e: LedgerEvent) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  savePack(packHash: Hex, pack: unknown) {
    // Stored byte-exact so an auditor can re-hash the file and compare with the chain.
    fs.writeFileSync(path.join(this.dir, "packs", `${packHash}.json`), canonicalJson(pack));
  }

  writeMeta(meta: unknown) {
    fs.writeFileSync(path.join(this.dir, "meta.json"), JSON.stringify(meta, null, 2));
  }

  reset() {
    fs.rmSync(path.join(this.dir, "events.jsonl"), { force: true });
    fs.rmSync(path.join(this.dir, "packs"), { recursive: true, force: true });
    fs.mkdirSync(path.join(this.dir, "packs"), { recursive: true });
  }
}
