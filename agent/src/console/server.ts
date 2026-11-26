// Auditor console: live agent activity, evidence packs, and one-click re-verification of a
// pack against its hash on HSK Chain.  npm run console  →  http://localhost:4177
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { keccak256, toHex, type Hex } from "viem";
import { chainById, CorridorChain } from "../chain/corridor.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.CORRIDOR_DATA_DIR ?? path.resolve(here, "..", "..", "..", ".corridor-data");
const port = Number(process.env.PORT ?? 4177);
const html = fs.readFileSync(path.join(here, "index.html"));

const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
const readEvents = () => {
  const f = path.join(dataDir, "events.jsonl");
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

let chainCache: { key: string; chain: CorridorChain } | null = null;
function chain(): CorridorChain {
  const meta = readJson("meta.json");
  const key = JSON.stringify(meta.deployment);
  if (chainCache?.key !== key) chainCache = { key, chain: new CorridorChain(chainById(meta.chainId), meta.deployment) };
  return chainCache.chain;
}

function send(res: http.ServerResponse, status: number, body: unknown, type = "application/json") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : (body as Buffer | string));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  try {
    if (url.pathname === "/") return send(res, 200, html, "text/html; charset=utf-8");
    if (url.pathname === "/api/meta") return send(res, 200, fs.existsSync(path.join(dataDir, "meta.json")) ? readJson("meta.json") : null);
    if (url.pathname === "/api/events") return send(res, 200, readEvents());
    const pack = url.pathname.match(/^\/api\/packs\/(0x[0-9a-fA-F]{64})$/);
    if (pack) {
      const f = path.join(dataDir, "packs", `${pack[1]}.json`);
      if (!fs.existsSync(f)) return send(res, 404, { error: "pack not found" });
      return send(res, 200, JSON.parse(fs.readFileSync(f, "utf8")));
    }
    const verify = url.pathname.match(/^\/api\/verify\/(0x[0-9a-fA-F]{64})$/);
    if (verify) {
      const f = path.join(dataDir, "packs", `${verify[1]}.json`);
      if (!fs.existsSync(f)) return send(res, 404, { error: "pack not found" });
      const recomputed = keccak256(toHex(fs.readFileSync(f, "utf8")));
      let anchored: boolean | null = null;
      let error: string | null = null;
      try {
        anchored = await chain().isAnchored(recomputed as Hex);
      } catch (e) {
        error = (e as Error).message.split("\n")[0] ?? "chain unreachable";
      }
      return send(res, 200, { expected: verify[1], recomputed, hashMatches: recomputed === verify[1], anchored, error });
    }
    send(res, 404, { error: "not found" });
  } catch (e) {
    send(res, 500, { error: (e as Error).message });
  }
});

server.listen(port, () => console.log(`Corridor console on http://localhost:${port} (data: ${dataDir})`));
