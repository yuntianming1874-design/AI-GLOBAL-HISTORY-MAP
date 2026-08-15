/**
 * V0.3 Phase 3D Sprint 2 — ChatResponse / assistant / api integration.
 *
 * Proves recommendations ALWAYS come from buildRecommendations(context,
 * locale) — never from the LLM:
 *  1. Local response contains recommendations
 *  2. OpenAI path contains recommendations (success path verified by
 *     source audit; runtime fallback path exercised)
 *  3. Fake LLM recommendations are never adopted
 *  4. recommendations === buildRecommendations(context, locale)
 *  5. recommendations ≤ 3
 *  6. empty context → fallback recommendations
 *  7. invalid entities never appear
 *  8. invalid journeys never appear
 */
import { chat } from "../src/lib/assistant";
import { buildRecommendations } from "../src/lib/learning/navigator";
import { isValidEntityRef, getJourneyById, isKnownEntityId } from "../src/lib/learning/journeyRepository";
import { EMPTY_CONTEXT, type HistoryContext } from "../src/lib/explorer";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

const ctx = (patch: Partial<HistoryContext>): HistoryContext => ({ ...EMPTY_CONTEXT, ...patch });

async function ask(q: string, context: HistoryContext | undefined = undefined, locale: "en" | "zh" = "zh") {
  return chat([{ role: "user", content: q }], context, locale);
}

async function main() {
  /* 1. Local response contains recommendations */
  const local = await ask("怛罗斯之战发生了什么？", ctx({ year: 751, eventId: "e-751-talas" }));
  check("1. local source", local.source, "local");
  check("1. local has recommendations", Array.isArray(local.recommendations) && local.recommendations.length > 0, true);

  /* 2. OpenAI path — success branch carries recommendations too (source
   * audit: chat() builds recommendations BEFORE the engine branch and
   * returns it on both paths). Runtime fallback path: pretend an API key
   * exists → engine call fails (no network) → local fallback + recs. */
  const src = readFileSync(join(process.cwd(), "src/lib/assistant.ts"), "utf8");
  const openAiSuccessHasRecs =
    src.includes('return { reply, source: "openai", citations: [], links: [], actions: [], recommendations }');
  check("2. openai success path returns recommendations", openAiSuccessHasRecs, true);
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key-for-fallback-path";
  const fallback = await ask("751 年发生了什么？", ctx({ year: 751 }));
  process.env.OPENAI_API_KEY = prevKey;
  check("2. openai→fallback path has recommendations", fallback.recommendations.length > 0, true);

  /* 3. Fake LLM recommendations are never adopted:
   * parseEngineJson has no recommendations field; chat() overwrites. */
  const parseFn = src.slice(src.indexOf("function parseEngineJson"), src.indexOf("class OpenAIAssistant"));
  // skip the signature line (return type mentions the field name only)
  const parseBody = parseFn.split("\n").slice(1).join("\n");
  check(
    "3. parseEngineJson never reads a recommendations field",
    parseBody.includes(".recommendations") === false && parseBody.includes('"recommendations"') === false,
    true,
  );
  check("3. chat() never reads obj.recommendations", src.includes("obj.recommendations") === false, true);

  /* 4. recommendations === buildRecommendations(context, locale) */
  const c1 = ctx({ year: 751, eventId: "e-751-talas", journeyId: "talas-751", journeyStep: 2 });
  const r4 = await ask("解释一下怛罗斯之战", c1, "zh");
  check("4. recs equal buildRecommendations (zh)", JSON.stringify(r4.recommendations), JSON.stringify(buildRecommendations(c1, "zh", 3)));
  const c1en = ctx({ year: 751, eventId: "e-751-talas" });
  const r4en = await ask("Explain Talas", c1en, "en");
  check("4. recs equal buildRecommendations (en)", JSON.stringify(r4en.recommendations), JSON.stringify(buildRecommendations(c1en, "en", 3)));

  /* 5. ≤ 3 */
  check("5. recommendations ≤ 3", r4.recommendations.length <= 3, true);

  /* 6. empty context → fallback (featured journeys) */
  const empty = await ask("你好");
  check("6. empty context has fallback recs", empty.recommendations.length > 0, true);
  check("6. fallback journeys exist", empty.recommendations.every((r) => r.journeyId === undefined || getJourneyById(r.journeyId!) !== null), true);

  /* 7. invalid entities never appear */
  const badEv = await ask("这是什么？", ctx({ eventId: "e-fake-id", year: 751 }));
  check("7. invalid-event context recs all valid", badEv.recommendations.every((r) => r.entityRefs.every((x) => isValidEntityRef(x))), true);

  /* 8. invalid journeys never appear */
  const badJ = await ask("继续旅程", ctx({ journeyId: "not-a-journey", journeyStep: 2 }));
  check("8. invalid-journey context has no fabricated journey", badJ.recommendations.every((r) => r.journeyId === undefined || getJourneyById(r.journeyId!) !== null), true);
  check("8. invalid journey id never referenced", badJ.recommendations.every((r) => r.id.includes("not-a-journey") === false), true);

  /* extra: all rec entity ids known across contexts */
  const all = await ask("751 年世界怎么样？", ctx({ year: 751, personId: "p-li-bai", civilizationId: "c-tang" }));
  check("extra. all entity ids known", all.recommendations.every((r) => r.entityRefs.every((x) => isKnownEntityId(x.id))), true);

  console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
}

main();
