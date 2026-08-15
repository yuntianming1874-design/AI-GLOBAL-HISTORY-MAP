/**
 * V0.3 RC-2 — OpenAI success path with a LOCAL mock endpoint.
 *
 * Proves the last Phase 3D engineering gate:
 *   - OpenAI path really answers (source === "openai")
 *   - Answer comes from the (mocked) LLM
 *   - Recommendations STILL come from buildRecommendations() — even when
 *     the mock LLM injects a fake "recommendations" field, it is ignored
 *   - links/actions still pass the KNOWN_IDS whitelist
 *
 * Real-key validation stays a manual step (documented in the report).
 */
import { createServer, type Server } from "node:http";
import { chat } from "../src/lib/assistant";
import { buildRecommendations } from "../src/lib/learning/navigator";
import { EMPTY_CONTEXT, type HistoryContext } from "../src/lib/explorer";
import { isKnownEntityId } from "../src/lib/learning/journeyRepository";

let passed = 0;
let failed = 0;
const failures: string[] = [];
function check(name: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(`${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
}

/** Mock OpenAI-compatible /chat/completions endpoint.
 *  respond receives the request body so one server can switch behaviour. */
function startMockServer(
  respond: (body: string) => unknown,
): Promise<{ server: Server; port: number }> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const payload = respond(body);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
      });
    });
    server.listen(0, () => {
      const addr = server.address();
      resolve({ server, port: typeof addr === "object" && addr ? addr.port : 0 });
    });
  });
}

async function main() {
  const ctx = (patch: Partial<HistoryContext>): HistoryContext => ({ ...EMPTY_CONTEXT, ...patch });
  const c = ctx({ year: 751, eventId: "e-751-talas" });

  /* mock LLM: same server answers structured JSON (with a FAKE
   * recommendations field) OR plain text, depending on the prompt */
  const { server, port } = await startMockServer((body) => {
    if (body.includes("纯文本")) {
      return { choices: [{ message: { content: "纯文本回答，不是 JSON" } }] };
    }
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              reply: "怛罗斯之战是 751 年唐朝与阿拔斯王朝在中亚的战役。",
              links: [{ id: "e-751-talas", type: "event", label: "怛罗斯之战" }],
              actions: [{ type: "OPEN_EVENT", id: "e-751-talas" }],
              // fake LLM-injected recommendations — MUST be ignored
              recommendations: [
                {
                  id: "llm-fake:1",
                  titleZh: "AI 编造的推荐",
                  titleEn: "LLM-fabricated recommendation",
                  reasonZh: "不应出现",
                  reasonEn: "must not appear",
                  type: "deepen",
                  entityRefs: [{ id: "e-fake-id", type: "event" }],
                  actions: [{ type: "OPEN_EVENT", id: "e-fake-id" }],
                },
              ],
            }),
          },
        },
      ],
    };
  });

  process.env.OPENAI_API_KEY = "test-mock-key";
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_MODEL = "mock-model";

  const result = await chat([{ role: "user", content: "怛罗斯之战是什么？" }], c, "zh");

  /* 1. real OpenAI (mock) path answered */
  check("1. source is openai", result.source, "openai");
  check("1. reply comes from the LLM (mock)", result.reply.includes("751 年唐朝与阿拔斯王朝"), true);

  /* 2. recommendations come from the deterministic engine */
  check(
    "2. recommendations === buildRecommendations(context, locale)",
    JSON.stringify(result.recommendations),
    JSON.stringify(buildRecommendations(c, "zh", 3)),
  );

  /* 3. fake LLM recommendations ignored */
  check("3. no fake rec adopted", result.recommendations.every((r) => r.id !== "llm-fake:1"), true);
  check("3. no fabricated entity anywhere", result.recommendations.every((r) => r.entityRefs.every((x) => isKnownEntityId(x.id))), true);

  /* 4. OpenAI success path only carries reply (design: chat() does not
   * adopt LLM links/actions) — the LLM-injected action is NOT adopted */
  check("4. no LLM actions adopted (design)", result.actions.length, 0);
  check("4. no LLM links adopted (design)", result.links.length, 0);

  /* 5. deterministic across calls (same context → same recs) */
  const again = await chat([{ role: "user", content: "再问一次" }], c, "zh");
  check("5. deterministic recs", JSON.stringify(again.recommendations), JSON.stringify(buildRecommendations(c, "zh", 3)));

  /* 6. malformed LLM JSON → graceful plain-text fallback still carries recs
   * (same cached assistant instance, same baseUrl — behaviour switches on
   * the prompt content) */
  const fallback = await chat([{ role: "user", content: "纯文本" }], ctx({ year: 751 }), "zh");
  check("6. plain-text fallback source openai", fallback.source, "openai");
  check("6. fallback reply is plain text", fallback.reply.includes("纯文本回答"), true);
  check("6. fallback still has recs", fallback.recommendations.length > 0, true);

  server.close();
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_MODEL;

  console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
}

main();
