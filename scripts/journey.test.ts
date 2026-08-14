/**
 * V0.3 Phase 2 — Journey vertical slice tests.
 * Run: npm run test:journey
 *
 * Covers (spec §21):
 *  1. journey URL parse          6. Step → History Context
 *  2. journey step parse         7. Talas event ID correctness
 *  3. URL sanitizer keeps journey/step   8. No fabricated entity ids
 *  4. START_JOURNEY              9. refresh state preservation
 *  5. SET_JOURNEY_STEP          10. browser navigation (URL round-trip)
 */
import {
  paramsToContext,
  sanitizeContextParams,
  hrefWithContext,
  EMPTY_CONTEXT,
  type HistoryContext,
} from "../src/lib/explorer";
import {
  getJourneyBySlug,
  getJourneyStep,
  isKnownEntityId,
  isValidEntityRef,
} from "../src/lib/learning/journeyRepository";
import {
  journeyStepPatch,
  startJourneyPatch,
  stepContextPatch,
} from "../src/lib/learning/journeyEngine";

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

const journey = getJourneyBySlug("talas-751");
check("journey exists", journey !== null, true);
if (!journey) {
  console.log(`✗ journey "talas-751" missing — aborting`);
  process.exit(1);
}

/* 1. journey URL parse */
const ctx1 = paramsToContext(new URLSearchParams("journey=talas-751&step=2"));
check("1. journeyId parsed", ctx1.journeyId, "talas-751");
check("2. journeyStep parsed", ctx1.journeyStep, 2);
check("non-journey params untouched", paramsToContext(new URLSearchParams("year=751&event=e-751-talas")).eventId, "e-751-talas");

/* 2. step parse: invalid/absent → null, clamped range 1..99 */
check("step absent → null", paramsToContext(new URLSearchParams("")).journeyStep, null);
check("step invalid → null", paramsToContext(new URLSearchParams("step=abc")).journeyStep, null);
check("step zero → null", paramsToContext(new URLSearchParams("step=0")).journeyStep, null);
check("step 100 → null", paramsToContext(new URLSearchParams("step=100")).journeyStep, null);
check("step 5 → 5", paramsToContext(new URLSearchParams("step=5")).journeyStep, 5);

/* 3. URL sanitizer keeps journey / step */
const dirty = new URLSearchParams("journey=talas-751&step=3&evil=<script>&year=751");
const clean = sanitizeContextParams(dirty);
check("3. sanitizer keeps journey", clean.get("journey"), "talas-751");
check("3. sanitizer keeps step", clean.get("step"), "3");
check("3. sanitizer keeps year", clean.get("year"), "751");
check("3. sanitizer drops unknown", clean.get("evil"), null);

/* 4. START_JOURNEY → first step full context patch */
const startPatch = startJourneyPatch(journey);
check("4. start patch present", startPatch !== null, true);
check("4. journeyId set", startPatch?.journeyId, "talas-751");
check("4. step = 1", startPatch?.journeyStep, 1);
check("4. year = 618", startPatch?.year, 618);
check("4. startYear = 618", startPatch?.startYear, 618);
check("4. endYear = 751", startPatch?.endYear, 751);
check("4. civ = c-tang", startPatch?.civilizationId, "c-tang");
check("4. loc = loc-changan", startPatch?.locationId, "loc-changan");

/* 5. SET_JOURNEY_STEP → step 2 patch (single full context) */
const step2Patch = journeyStepPatch(journey, 2);
check("5. step-2 patch present", step2Patch !== null, true);
check("5. step = 2", step2Patch?.journeyStep, 2);
check("5. year = 751", step2Patch?.year, 751);
check("5. event = e-751-talas", step2Patch?.eventId, "e-751-talas");
check("5. loc = loc-talas", step2Patch?.locationId, "loc-talas");
check("5. start = 751", step2Patch?.startYear, 751);
check("5. end = 751", step2Patch?.endYear, 751);
check("5. person cleared (null)", step2Patch?.personId, null);

/* 6. Step → History Context via URL (full round-trip) */
const step3Patch = journeyStepPatch(journey, 3);
const url3 = hrefWithContext("/", new URLSearchParams("lang=zh"), step3Patch!);
const parsed3 = paramsToContext(new URLSearchParams(url3.split("?")[1] ?? ""));
check("6. step3 journey in URL", parsed3.journeyId, "talas-751");
check("6. step3 step in URL", parsed3.journeyStep, 3);
check("6. step3 civ = c-abbasid", parsed3.civilizationId, "c-abbasid");
check("6. step3 loc = loc-samarkand", parsed3.locationId, "loc-samarkand");
check("6. step3 year = 751", parsed3.year, 751);

/* 7. Talas event ID correctness (reuse e-751-talas, no second id) */
const step2 = getJourneyStep(journey, 2);
check("7. step2 exists", step2 !== null, true);
check("7. step2.eventId === e-751-talas", step2?.eventId, "e-751-talas");
check("7. no fabricated id e-talas in journey", isKnownEntityId("e-talas"), false);
const step2Refs = [
  ...(step2?.surroundingEntities ?? []),
  ...(step2?.eventId ? [{ id: step2.eventId, type: "event" as const }] : []),
  ...(step2?.locationId ? [{ id: step2.locationId, type: "location" as const }] : []),
];
check("7. step2 refs all valid", step2Refs.every((r) => isValidEntityRef(r)), true);

/* 8. No fabricated entity ids anywhere in the journey */
const allRefs: { id: string; type: string }[] = [];
for (const j of [journey]) {
  for (const s of j.steps) {
    if (s.eventId) allRefs.push({ id: s.eventId, type: "event" });
    if (s.personId) allRefs.push({ id: s.personId, type: "person" });
    if (s.civilizationId) allRefs.push({ id: s.civilizationId, type: "civilization" });
    if (s.locationId) allRefs.push({ id: s.locationId, type: "location" });
    allRefs.push(...s.surroundingEntities);
  }
}
check("8. Gao Xianzhi id is NOT a known entity", isKnownEntityId("p-gao-xianzhi"), false);
check("8. no fabricated person id", allRefs.filter((r) => r.type === "person").every((r) => isKnownEntityId(r.id)), true);
check("8. every referenced id known", allRefs.every((r) => isKnownEntityId(r.id)), true);
check("8. every ref type matches", allRefs.every((r) => isValidEntityRef(r as never)), true);

/* 9. refresh state preservation: context → URL → context round-trip */
function roundTrip(c: Partial<HistoryContext>): HistoryContext {
  const u = hrefWithContext("/", new URLSearchParams(), c);
  return paramsToContext(new URLSearchParams(u.split("?")[1] ?? ""));
}
const rt = roundTrip(step3Patch!);
check("9. round-trip journey", rt.journeyId, "talas-751");
check("9. round-trip step", rt.journeyStep, 3);
check("9. round-trip year", rt.year, 751);
check("9. round-trip loc", rt.locationId, "loc-samarkand");
const rt2 = roundTrip(step2Patch!);
check("9. round-trip event (step2)", rt2.eventId, "e-751-talas");
check("9. round-trip loc (step2)", rt2.locationId, "loc-talas");

/* 10. browser navigation: back/forward restores from URL only */
// simulate: user at step1 → forward to step2 → back to step1 (URL-only state)
const backUrl = hrefWithContext("/", new URLSearchParams("journey=talas-751&step=2&event=e-751-talas&year=751"), {
  journeyStep: 1,
  eventId: null,
});
const backCtx = paramsToContext(new URLSearchParams(backUrl.split("?")[1] ?? ""));
check("10. back restores step 1", backCtx.journeyStep, 1);
check("10. back clears event", backCtx.eventId, null);
check("10. back keeps journey", backCtx.journeyId, "talas-751");
const fwdUrl = hrefWithContext("/", new URLSearchParams(backUrl.split("?")[1] ?? ""), step2Patch!);
const fwdCtx = paramsToContext(new URLSearchParams(fwdUrl.split("?")[1] ?? ""));
check("10. forward restores step 2", fwdCtx.journeyStep, 2);
check("10. forward restores event", fwdCtx.eventId, "e-751-talas");

/* helper API stability */
check("EMPTY_CONTEXT has journey keys", EMPTY_CONTEXT.journeyId === null && EMPTY_CONTEXT.journeyStep === null, true);
check("stepContextPatch full keys", Object.keys(stepContextPatch(journey, step2!)).sort(), [
  "civilizationId", "endYear", "eventId", "journeyId", "journeyStep", "locationId", "personId", "startYear", "year",
]);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
