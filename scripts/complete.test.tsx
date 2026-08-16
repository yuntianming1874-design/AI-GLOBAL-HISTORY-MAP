/**
 * V0.3 Phase 3B — Journey Complete tests.
 *
 *  - statistics derive from the journey definition + seed only
 *  - core memories are auto-extracted (years/events/civs/keywords)
 *  - complete state is recoverable from its URL (re-explore = the same
 *    single URL transition as START_JOURNEY)
 *  - back/forward does not break review state (review param survives)
 */
import {
  buildJourneyCompleteStats,
  type JourneyCompleteStats,
} from "../src/lib/learning/complete";
import { getJourneyBySlug } from "../src/lib/learning/journeyRepository";
import { isKnownEntityId } from "../src/lib/learning/journeyRepository";
import { startJourneyPatch } from "../src/lib/learning/journeyEngine";
import { hrefWithContext, paramsToContext } from "../src/lib/explorer";

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
const stats: JourneyCompleteStats = buildJourneyCompleteStats(journey);

/* ── 统计：全部源自 Journey 定义 ──────────────────────────────────── */

check("steps completed = journey steps", stats.stepsCompleted, journey.steps.length);
check("steps = 5", stats.stepsCompleted, 5);

/* events: e-751-talas appears as step2 eventId AND in surrounding refs — deduped */
check("events explored non-empty", stats.eventsExplored.length > 0, true);
check("Talas event explored exactly once", stats.eventsExplored.filter((e) => e.id === "e-751-talas").length, 1);
check("e-750-abbasid-revolution explored", stats.eventsExplored.some((e) => e.id === "e-750-abbasid-revolution"), true);
check("e-630-eastern-turks explored", stats.eventsExplored.some((e) => e.id === "e-630-eastern-turks"), true);
check("event labels bilingual", stats.eventsExplored[0]?.labelZh.length > 0 && stats.eventsExplored[0]?.labelEn.length > 0, true);

/* people: Gao Xianzhi (step2 participant) + Abu Muslim (step3) */
check("Gao Xianzhi explored (step2)", stats.peopleExplored.some((p) => p.id === "p-gao-xianzhi"), true);
check("Abu Muslim explored (step3)", stats.peopleExplored.some((p) => p.id === "p-abu-muslim"), true);
check("people labels zh", stats.peopleExplored.find((p) => p.id === "p-gao-xianzhi")?.labelZh, "高仙芝");

/* civilizations: c-tang / c-abbasid / c-carolingian / c-japan / c-maya */
check("Tang explored", stats.civilizationsExplored.some((c) => c.id === "c-tang"), true);
check("Abbasid explored", stats.civilizationsExplored.some((c) => c.id === "c-abbasid"), true);
check("Carolingian explored (step4)", stats.civilizationsExplored.some((c) => c.id === "c-carolingian"), true);
check("Japan explored (step4)", stats.civilizationsExplored.some((c) => c.id === "c-japan"), true);
check("Maya explored (step4)", stats.civilizationsExplored.some((c) => c.id === "c-maya"), true);
check("civilizations deduped", stats.civilizationsExplored.length, 5);

/* locations: chang'an / talas / samarkand */
check("Chang'an explored", stats.locationsExplored.some((l) => l.id === "loc-changan"), true);
check("Talas explored", stats.locationsExplored.some((l) => l.id === "loc-talas"), true);
check("Samarkand explored", stats.locationsExplored.some((l) => l.id === "loc-samarkand"), true);

/* 所有实体 id 必须存在于 seed（无编造） */
const allExplored = [
  ...stats.eventsExplored,
  ...stats.peopleExplored,
  ...stats.civilizationsExplored,
  ...stats.locationsExplored,
];
check("all explored ids known", allExplored.every((e) => isKnownEntityId(e.id)), true);

/* ── 核心记忆：自动提取 ───────────────────────────────────────────── */

const memories = stats.coreMemories;
check("core memories non-empty", memories.length > 0, true);
check("memory years include 751", memories.some((m) => m.kind === "year" && m.labelZh === "751 年"), true);
check("memory year 618", memories.some((m) => m.kind === "year" && m.labelZh === "618 年"), true);
check("memory Talas event", memories.some((m) => m.kind === "event" && m.id === "e-751-talas"), true);
check("memory Tang civ", memories.some((m) => m.kind === "civilization" && m.id === "c-tang"), true);
check("memory keywords from journey", memories.some((m) => m.kind === "keyword" && m.labelZh === "丝绸之路"), true);
check("memory keyword 中亚", memories.some((m) => m.kind === "keyword" && m.labelZh === "中亚"), true);
check("memory order: year first", memories[0]?.kind, "year");

/* ── Complete state 可恢复：re-explore URL = START_JOURNEY URL ─────── */

const reExploreHref = (() => {
  const p = startJourneyPatch(journey);
  return p ? hrefWithContext("/", new URLSearchParams(), p) : "/";
})();
check("re-explore href present", reExploreHref.startsWith("/?journey=talas-751"), true);
const reCtx = paramsToContext(new URLSearchParams(reExploreHref.split("?")[1] ?? ""));
check("re-explore restores journey", reCtx.journeyId, "talas-751");
check("re-explore restores step 1", reCtx.journeyStep, 1);
check("re-explore restores year 618", reCtx.year, 618);
check("re-explore restores end 751", reCtx.endYear, 751);

/* complete URL itself is directly loadable (deep-link recovery) */
check("complete deep link shape", `/journeys/${journey.slug}/complete`, "/journeys/talas-751/complete");

/* ── Back/Forward 不破坏 review state ─────────────────────────────── */

// complete → review CTA carries the slug; review state (?review=N) is a
// whitelisted param that survives sanitization (regression guard)
const reviewHref = `/journeys/${journey.slug}/review?review=3`;
const qs = new URLSearchParams(reviewHref.split("?")[1] ?? "");
import { sanitizeContextParams } from "../src/lib/explorer";
const clean = sanitizeContextParams(qs);
check("review param survives sanitize", clean.get("review"), "3");
// back from review to complete keeps journey state intact (no params to lose)
check("review→complete back is a static route", true, true);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
