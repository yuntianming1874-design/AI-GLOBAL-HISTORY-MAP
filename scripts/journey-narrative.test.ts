/**
 * V0.3 Phase 2 — Narrative Story Engine tests.
 *
 * 1. Journey narrative rendering test:
 *   - every step carries title/question/narrative/whyImportant/nextStepReason
 *   - keyFacts resolve to KNOWN entities only (no fabricated ids)
 *   - grouped ids (people/locations/civilizations) validate
 *   - narrator output contract (summary/keyFacts/importance/actions)
 */
import { getJourneyBySlug } from "../src/lib/learning/journeyRepository";
import { narrateStep } from "../src/lib/learning/narrator";
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

const journey = getJourneyBySlug("talas-751");
check("journey found", journey !== null, true);
if (!journey) process.exit(1);

/* every step: full narrative fields in both languages */
for (const s of journey.steps) {
  const tag = `step${s.order}`;
  check(`${tag} title`, typeof s.title === "string" && s.title.length > 0, true);
  check(`${tag} titleEn`, typeof s.titleEn === "string" && s.titleEn.length > 0, true);
  check(`${tag} question`, typeof s.question === "string" && s.question.length > 0, true);
  check(`${tag} questionEn`, typeof s.questionEn === "string" && s.questionEn.length > 0, true);
  check(`${tag} narrative`, typeof s.narrative === "string" && s.narrative.length > 20, true);
  check(`${tag} narrativeEn`, typeof s.narrativeEn === "string" && s.narrativeEn.length > 20, true);
  check(`${tag} whyImportant`, typeof s.whyImportant === "string" && s.whyImportant.length > 10, true);
  check(`${tag} whyImportantEn`, typeof s.whyImportantEn === "string" && s.whyImportantEn.length > 10, true);
  check(`${tag} nextStepReason`, typeof s.nextStepReason === "string" && s.nextStepReason.length > 5, true);
  check(`${tag} nextStepReasonEn`, typeof s.nextStepReasonEn === "string" && s.nextStepReasonEn.length > 5, true);
}

/* grouped ids: people/locations/civilizations are all KNOWN entities */
const allGrouped = journey.steps.flatMap((s) => [
  ...(s.people ?? []),
  ...(s.locations ?? []),
  ...(s.civilizations ?? []),
]);
check("grouped ids all known", allGrouped.every((id) => isKnownEntityId(id)), true);
check("some grouped ids exist", allGrouped.length > 10, true);

/* keyFactEntityIds: known + narrator resolves each to a fact */
for (const s of journey.steps) {
  const ids = s.keyFactEntityIds ?? [];
  check(`step${s.order} keyFactEntityIds known`, ids.every((id) => isKnownEntityId(id)), true);
  const narration = narrateStep(journey, s, "zh");
  check(`step${s.order} narration has summary`, narration.summary.length > 0, true);
  check(`step${s.order} keyFacts non-empty`, narration.keyFacts.length > 0, true);
  check(
    `step${s.order} keyFacts entities known`,
    narration.keyFacts.every((f) => isKnownEntityId(f.entityId)),
    true,
  );
  check(`step${s.order} importance non-empty`, narration.importance.length > 0, true);
}

/* key facts for step 2 = the Talas event first */
const s2 = narrateStep(journey, journey.steps[1], "zh");
check("step2 first key fact = e-751-talas", s2.keyFacts[0]?.entityId, "e-751-talas");
check("step2 fact label zh", s2.keyFacts[0]?.label, "怛罗斯之战");
check("step2 fact date display", s2.keyFacts[0]?.dateDisplay, "751 年");

/* en narration works */
const s2en = narrateStep(journey, journey.steps[1], "en");
check("step2 en label", s2en.keyFacts[0]?.label, "Battle of Talas");

/* actions: step2 offers OPEN_EVENT + FOCUS_TIMELINE + FOCUS_MAP */
const actions = s2.actions.map((a) => a.type);
check("step2 has OPEN_EVENT", actions.includes("OPEN_EVENT"), true);
check("step2 has FOCUS_TIMELINE", actions.includes("FOCUS_TIMELINE"), true);
check("step2 has FOCUS_MAP", actions.includes("FOCUS_MAP"), true);
check("step2 OPEN_EVENT id", s2.actions.find((a) => a.type === "OPEN_EVENT")?.id, "e-751-talas");

/* step 5 (review) — narrative renders, no fabricated facts */
const s5 = narrateStep(journey, journey.steps[4], "zh");
check("step5 keyFacts non-empty", s5.keyFacts.length > 0, true);
check("step5 uncertaintyNotes undefined", s5.uncertaintyNotes === undefined, true);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
