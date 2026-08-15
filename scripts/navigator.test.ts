/**
 * V0.3 Phase 3D Sprint 1 — deterministic navigator engine tests.
 *
 *  - entityRefs all valid (seed registry)
 *  - journeyId all valid (journey repository)
 *  - actions all valid (known ids, known types)
 *  - recommendations ≤ limit
 *  - event/person/year/journey context branches produce the right types
 *  - fail-closed: invalid context produces only valid recommendations
 *  - no LLM involvement: engine is pure + deterministic
 */
import { buildRecommendations } from "../src/lib/learning/navigator";
import { getJourneyById, isValidEntityRef, isKnownEntityId } from "../src/lib/learning/journeyRepository";
import { EMPTY_CONTEXT, type HistoryContext } from "../src/lib/explorer";

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

function ctx(patch: Partial<HistoryContext>): HistoryContext {
  return { ...EMPTY_CONTEXT, ...patch };
}

/* ── 全局不变式：全部推荐有效 ─────────────────────────────────────── */

const allContexts: HistoryContext[] = [
  ctx({}),
  ctx({ year: 751 }),
  ctx({ year: 751, eventId: "e-751-talas" }),
  ctx({ year: 751, eventId: "e-751-talas", locationId: "loc-talas" }),
  ctx({ personId: "p-li-bai" }),
  ctx({ civilizationId: "c-abbasid", year: 751 }),
  ctx({ journeyId: "talas-751", journeyStep: 1 }),
  ctx({ journeyId: "talas-751", journeyStep: 3, year: 751 }),
  ctx({ journeyId: "talas-751", journeyStep: 5, year: 751 }),
  ctx({ year: 700, eventId: "e-755-anlushan" }), // invalid-ish combo → still valid output
  ctx({ journeyId: "not-a-journey", journeyStep: 2 }), // unknown journey → fail-closed
  ctx({ eventId: "e-fake-id" }), // unknown event → fail-closed
];

for (const c of allContexts) {
  const recs = buildRecommendations(c, "zh", 3);
  check(`ctx ${JSON.stringify(c).slice(0, 60)} ≤ 3`, recs.length <= 3, true);
  for (const r of recs) {
    check(`rec ${r.id} entityRefs valid`, r.entityRefs.every((x) => isValidEntityRef(x)), true);
    if (r.journeyId !== undefined) {
      check(`rec ${r.id} journey exists`, getJourneyById(r.journeyId) !== null, true);
    }
    for (const a of r.actions) {
      const idToCheck =
        "id" in a ? a.id : "personId" in a ? a.personId : "locationId" in a ? a.locationId : undefined;
      if (idToCheck !== undefined) {
        check(`rec ${r.id} action id known`, isKnownEntityId(idToCheck), true);
      }
    }
    check(`rec ${r.id} has title`, r.titleZh.length > 0 && r.titleEn.length > 0, true);
    check(`rec ${r.id} has reason`, r.reasonZh.length > 0 && r.reasonEn.length > 0, true);
    check(`rec ${r.id} type valid`, ["deepen", "cause", "compare", "continue"].includes(r.type), true);
  }
}

/* ── 分支正确性 ───────────────────────────────────────────────────── */

// empty context → continue + featured journey
const empty = buildRecommendations(ctx({}), "zh", 3);
check("empty context non-empty", empty.length > 0, true);
check("empty context all continue", empty.every((r) => r.type === "continue"), true);
check("empty context journeys exist", empty.every((r) => r.journeyId !== undefined && getJourneyById(r.journeyId!) !== null), true);

// event context (Talas): RC-3 — pseudo-causes removed, compare/continue stay
const ev = buildRecommendations(ctx({ year: 751, eventId: "e-751-talas" }), "zh", 3);
const evTypes = ev.map((r) => r.type);
check("RC-3: Talas has NO curated cause (e-745 removed)", evTypes.includes("cause"), false);
check("event context has compare", evTypes.includes("compare"), true);
check("event context has continue journey", evTypes.includes("continue"), true);
check("RC-3: Talas never recommends itself as deepen", ev.some((r) => r.type === "deepen" && r.entityRefs.some((x) => x.id === "e-751-talas")), false);

// event context (Tang fall): curated cause exists and is historically sound
const evFall = buildRecommendations(ctx({ year: 907, eventId: "e-907-fall-of-tang" }), "zh", 3);
const causeRec = evFall.find((r) => r.type === "cause");
check("curated cause present (907 → 875)", causeRec !== undefined, true);
check("curated cause targets Huang Chao revolt", causeRec?.entityRefs[0]?.id, "e-875-huang-chao");
check("curated cause is earlier", (eventYear(causeRec!) ?? Infinity) < 907, true);
const compareRec = ev.find((r) => r.type === "compare");
const compareEvRef = compareRec?.entityRefs.find((x) => x.type === "event");
check("compare ref is an event", compareEvRef !== undefined, true);
check(
  "compare event is from another civ",
  compareEvRef !== undefined && compareRec !== undefined && eventCiv(compareEvRef.id) !== "c-tang",
  true,
);

// event context (An Lushan: has participants) → deepen
const ev2 = buildRecommendations(ctx({ year: 755, eventId: "e-755-anlushan" }), "zh", 3);
check("event with participants has deepen", ev2.some((r) => r.type === "deepen"), true);

function eventYear(r: { entityRefs: { id: string; type: string }[] }): number | null {
  const evRef = r.entityRefs.find((x) => x.type === "event");
  if (!evRef) return null;
  const seed = require("../src/data/seed").events as { id: string; year: number }[];
  return seed.find((e) => e.id === evRef.id)?.year ?? null;
}
function eventCiv(id: string): string | null {
  const seed = require("../src/data/seed").events as { id: string; civilizationId: string }[];
  return seed.find((e) => e.id === id)?.civilizationId ?? null;
}

// person context → deepen with their event
const person = buildRecommendations(ctx({ personId: "p-li-bai" }), "zh", 3);
check("person context has deepen", person.some((r) => r.type === "deepen"), true);

// year context → deepen + continue
const yearOnly = buildRecommendations(ctx({ year: 751 }), "zh", 3);
check("year context non-empty", yearOnly.length > 0, true);

// journey step 1 → continue to step 2 (SET_JOURNEY_STEP)
const j1 = buildRecommendations(ctx({ journeyId: "talas-751", journeyStep: 1 }), "zh", 3);
const continueNext = j1.find((r) => r.type === "continue" && r.actions.some((a) => a.type === "SET_JOURNEY_STEP"));
check("journey step1 → continue next", continueNext !== undefined, true);
const setStepAction = continueNext?.actions.find((a) => a.type === "SET_JOURNEY_STEP");
check("continue targets step 2", setStepAction !== undefined && "step" in setStepAction && setStepAction.step === 2, true);

// journey last step → no SET_JOURNEY_STEP beyond end; safe
const j5 = buildRecommendations(ctx({ journeyId: "talas-751", journeyStep: 5 }), "zh", 3);
check("last step recs all valid", j5.every((r) => r.actions.every((a) => a.type !== "SET_JOURNEY_STEP" || ("step" in a && a.step <= 5))), true);

/* ── fail-closed ───────────────────────────────────────────────────── */

const badJourney = buildRecommendations(ctx({ journeyId: "not-a-journey", journeyStep: 2 }), "zh", 3);
check("unknown journey → no fabricated journey rec", badJourney.every((r) => r.journeyId === undefined || getJourneyById(r.journeyId!) !== null), true);

const badEvent = buildRecommendations(ctx({ eventId: "e-fake-id", year: 751 }), "zh", 3);
check("unknown event → no fabricated entity", badEvent.every((r) => r.entityRefs.every((x) => isValidEntityRef(x))), true);

/* ── 确定性 + 无 AI ───────────────────────────────────────────────── */

const a = buildRecommendations(ctx({ year: 751, eventId: "e-751-talas" }), "zh", 3);
const b = buildRecommendations(ctx({ year: 751, eventId: "e-751-talas" }), "zh", 3);
check("deterministic (same input → same output)", JSON.stringify(a), JSON.stringify(b));

// engine source contains no fetch/API/LLM calls
import { readFileSync } from "node:fs";
import { join } from "node:path";
const src = readFileSync(join(process.cwd(), "src/lib/learning/navigator.ts"), "utf8");
check("no fetch in navigator", src.includes("fetch(") === false, true);
check("no process.env in navigator", src.includes("process.env") === false, true);

// limit respected
check("limit=1", buildRecommendations(ctx({}), "zh", 1).length <= 1, true);
check("limit=5", buildRecommendations(ctx({ year: 751, eventId: "e-751-talas" }), "zh", 5).length <= 5, true);

// dedupe: same journey must not appear twice even with a larger limit
const wide = buildRecommendations(ctx({ year: 751, eventId: "e-751-talas" }), "zh", 6);
const ids = wide.map((r) => r.id);
check("no duplicate recommendation ids (limit=6)", new Set(ids).size, ids.length);
check("talas-751 continue appears once", ids.filter((i) => i === "continue:talas-751").length, 1);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
