/**
 * V0.3 Phase 2 — Journey integration tests.
 *
 * 4. Journey → person → timeline 联动
 * 5. Journey → event → map 联动
 * 6. F5 recovery
 * 7. Back/Forward regression
 *
 * All state comes from the URL (single source of truth) — these tests
 * prove the URL contract alone restores every linked view.
 */
import {
  paramsToContext,
  patchContextParams,
  hrefWithContext,
  type HistoryContext,
} from "../src/lib/explorer";
import {
  getJourneyBySlug,
  getJourneyStep,
} from "../src/lib/learning/journeyRepository";
import { journeyStepPatch } from "../src/lib/learning/journeyEngine";

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

const journey = getJourneyBySlug("talas-751")!;

/* 4. Journey → person → timeline 联动：
 *    a step that carries personId must produce ?person= so the Timeline
 *    focuses the person's lifespan; other steps must clear it. */
// future-proof: simulate a personId step via patch semantics (same code path
// as journeyStepPatch — personId comes from the step definition)
const patchWithPerson: Partial<HistoryContext> = {
  journeyId: "talas-751",
  journeyStep: 3,
  personId: "p-abu-muslim",
  year: 751,
  startYear: 751,
  endYear: 751,
};
const urlWithPerson = hrefWithContext("/", new URLSearchParams(), patchWithPerson);
const ctxWithPerson = paramsToContext(new URLSearchParams(urlWithPerson.split("?")[1] ?? ""));
check("4. personId lands in URL", ctxWithPerson.personId, "p-abu-muslim");
check("4. Timeline person focus (person param)", ctxWithPerson.personId !== null, true);
check("4. year preserved", ctxWithPerson.year, 751);
check("4. start/end preserved", ctxWithPerson.startYear === 751 && ctxWithPerson.endYear === 751, true);

// step 2 has no personId → the transition clears it (single patch)
const s2 = getJourneyStep(journey, 2)!;
check("4. step2 has no personId", s2.personId === undefined, true);
const s2Patch = journeyStepPatch(journey, 2)!;
check("4. step2 patch clears person", s2Patch.personId, null);

/* 5. Journey → event → map 联动：
 *    step2 patch must carry event+loc+year so the map flies to Talas. */
check("5. step2 eventId", s2Patch.eventId, "e-751-talas");
check("5. step2 locationId", s2Patch.locationId, "loc-talas");
check("5. step2 year", s2Patch.year, 751);
const url2 = hrefWithContext("/", new URLSearchParams(), s2Patch);
const ctx2 = paramsToContext(new URLSearchParams(url2.split("?")[1] ?? ""));
check("5. map event param", ctx2.eventId, "e-751-talas");
check("5. map loc param", ctx2.locationId, "loc-talas");
check("5. map year param", ctx2.year, 751);

/* 6. F5 recovery: full URL → context → identical URL (round-trip) */
const full = "/?journey=talas-751&step=3&year=751&start=751&end=751&civ=c-abbasid&loc=loc-samarkand&event=e-751-talas";
const ctxFull = paramsToContext(new URLSearchParams(full.split("?")[1] ?? ""));
check("6. F5 journey", ctxFull.journeyId, "talas-751");
check("6. F5 step", ctxFull.journeyStep, 3);
check("6. F5 civ", ctxFull.civilizationId, "c-abbasid");
check("6. F5 loc", ctxFull.locationId, "loc-samarkand");
check("6. F5 event", ctxFull.eventId, "e-751-talas");
// sanitize round-trip: no param loss
const clean = hrefWithContext("/", new URLSearchParams(full.split("?")[1] ?? ""), {});
const cleanQs = new URLSearchParams(clean.split("?")[1] ?? "");
check("6. sanitize keeps journey", cleanQs.get("journey"), "talas-751");
check("6. sanitize keeps step", cleanQs.get("step"), "3");
check("6. sanitize keeps civ", cleanQs.get("civ"), "c-abbasid");
check("6. sanitize keeps loc", cleanQs.get("loc"), "loc-samarkand");
check("6. sanitize keeps event", cleanQs.get("event"), "e-751-talas");

/* 7. Back/Forward regression: URL-only state transitions */
// forward: step2 → step3 (one transition, all context keys updated)
const fwd = hrefWithContext("/", new URLSearchParams(full.split("?")[1] ?? ""), journeyStepPatch(journey, 3)!);
const fwdCtx = paramsToContext(new URLSearchParams(fwd.split("?")[1] ?? ""));
check("7. fwd journey", fwdCtx.journeyId, "talas-751");
check("7. fwd step", fwdCtx.journeyStep, 3);
check("7. fwd event kept (step3 patch keeps talas? no — cleared)", fwdCtx.eventId, null);
check("7. fwd civ", fwdCtx.civilizationId, "c-abbasid");
// back: step3 → step2 (restores Talas event + loc)
const back = hrefWithContext("/", new URLSearchParams(fwd.split("?")[1] ?? ""), journeyStepPatch(journey, 2)!);
const backCtx = paramsToContext(new URLSearchParams(back.split("?")[1] ?? ""));
check("7. back step", backCtx.journeyStep, 2);
check("7. back event restored", backCtx.eventId, "e-751-talas");
check("7. back loc restored", backCtx.locationId, "loc-talas");
check("7. back civ = c-tang (step2 definition)", backCtx.civilizationId, "c-tang");
// back again: step2 → step1 (start of journey)
const back1 = hrefWithContext("/", new URLSearchParams(back.split("?")[1] ?? ""), journeyStepPatch(journey, 1)!);
const back1Ctx = paramsToContext(new URLSearchParams(back1.split("?")[1] ?? ""));
check("7. back1 step", back1Ctx.journeyStep, 1);
check("7. back1 year", back1Ctx.year, 618);
check("7. back1 end 751", back1Ctx.endYear, 751);
check("7. back1 event cleared", back1Ctx.eventId, null);

/* patchContextParams direct: journeyStep clamp + journey id pattern */
const patched = patchContextParams(
  new URLSearchParams(),
  { journeyId: "bad id!", journeyStep: 500 } as Partial<HistoryContext>,
);
check("7. bad journey id dropped", patched.get("journey"), null);
check("7. step 500 dropped (clamp 1..99)", patched.get("step"), null);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
