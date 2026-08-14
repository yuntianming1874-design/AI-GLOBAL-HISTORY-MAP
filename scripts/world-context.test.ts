/**
 * V0.3 Phase 2 — World Context tests.
 *
 * 3. World context rendering test (logic layer):
 *   - every seed civilization maps to a display region (no orphans)
 *   - region grouping is stable and total
 *   - event selection for a year: point ±5 / range covering
 *   - explanation comes from curated description (first sentence)
 *   - provenance confidence/precision surfaced, never invented
 */
import {
  CIV_TO_REGION,
  WORLD_REGIONS,
  groupCivilizationsByRegion,
  selectEventsForYear,
  worldRegionLabel,
} from "../src/lib/learning/worldContext";
import { civilizations, events } from "../src/data/seed";

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

/* all 12 civilizations mapped — no orphan */
const mapped = civilizations.map((c) => CIV_TO_REGION[c.id]);
check("all civilizations mapped", mapped.every((r) => r !== undefined), true);
check("mapping is total (12/12)", Object.keys(CIV_TO_REGION).length, 12);
check("all regions valid", Object.values(CIV_TO_REGION).every((r) => (WORLD_REGIONS as readonly string[]).includes(r)), true);

/* grouping: regions in canonical order, ids preserved */
const groups = groupCivilizationsByRegion(civilizations.map((c) => c.id));
check("group count", groups.length, 7);
check("first region East Asia", groups[0]?.region, "East Asia");
check("East Asia has tang+silla", groups[0]?.civilizationIds, ["c-tang", "c-silla"]);
check("Central Asia has tibet+khazars", groups.find((g) => g.region === "Central Asia")?.civilizationIds, ["c-tibet", "c-khazars"]);
check("Middle East abbasid+umayyad", groups.find((g) => g.region === "Middle East")?.civilizationIds, ["c-abbasid", "c-umayyad"]);
check("Japan has c-japan", groups.find((g) => g.region === "Japan")?.civilizationIds, ["c-japan"]);
check("Americas has c-maya", groups.find((g) => g.region === "Americas")?.civilizationIds, ["c-maya"]);

/* region labels */
check("region label zh", worldRegionLabel("Central Asia", "zh"), "中亚");
check("region label en", worldRegionLabel("Middle East", "en"), "Middle East");

/* event selection for 751 */
const tangIds = ["c-tang"];
const rows751 = selectEventsForYear(events, tangIds, 751);
check("751 tang events non-empty", rows751.length > 0, true);
const talas = rows751.find((r) => r.eventId === "e-751-talas");
check("751 includes Talas", talas !== undefined, true);
check("751 Talas confidence high", talas?.confidence, "high");
check("751 Talas precision exact", talas?.precision, "exact");
check("751 Talas explanation non-empty", (talas?.shortExplanation.length ?? 0) > 10, true);

/* range event covering the year */
const anlushan = selectEventsForYear(events, tangIds, 755).find((r) => r.eventId === "e-755-anlushan");
check("755 includes An Lushan (range 755–763)", anlushan !== undefined, true);
/* range does NOT cover 751 (755–763) */
const talasOnly = selectEventsForYear(events, tangIds, 751).some((r) => r.eventId === "e-755-anlushan");
check("751 does not include An Lushan (range not covering)", talasOnly, false);

/* approximate event provenance surfaces precision */
const khazar = selectEventsForYear(events, ["c-khazars"], 740).find((r) => r.eventId === "e-740-khazar-judaism");
check("740 Khazar event found", khazar !== undefined, true);
check("740 Khazar precision approximate", khazar?.precision, "approximate");
check("740 Khazar confidence medium", khazar?.confidence, "medium");

/* region without data at a year → empty rows (UI shows placeholder) */
const americas751 = selectEventsForYear(events, ["c-maya"], 751);
check("Americas 751 rows empty (placeholder shown)", americas751.length, 0);

/* explanations come from curated description only */
check(
  "explanation starts from description",
  talas?.shortExplanation.startsWith("In 751 Tang forces under Gao Xianzhi met an Abbasid army") ?? false,
  true,
);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
