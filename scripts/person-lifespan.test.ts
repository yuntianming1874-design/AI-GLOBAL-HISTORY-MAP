/**
 * V0.3 Phase 2 — Person Lifespan Timeline tests.
 *
 * 2. Person lifespan rendering test (logic layer):
 *   - birth–death span + provenance-aware display
 *   - PersonRole[] spans (Charlemagne: 3 roles with correct years)
 *   - key events joined from the single participant source
 *   - year linkage (activeAtYear) + selectPeopleAliveAtYear
 *   - disputed/unknown dates follow policy (never rewritten to exact)
 */
import { people, events } from "../src/data/seed";
import {
  buildPersonLifespanModel,
  lifespanRange,
  selectPeopleAliveAtYear,
  yearToPosition,
} from "../src/lib/learning/lifespan";

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

/* seed → DTO shim (same shape the repository returns) */
const dto = (p: (typeof people)[number]) => ({
  ...p,
  civilizationName: null,
  civilizationColor: null,
  zhSummary: null,
});
const evts: import("../src/lib/types").EventDTO[] = events.map((e) => ({
  ...e,
  civilizationName: "?",
  civilizationColor: "#8a7a66",
  locationName: null,
  latitude: null,
  longitude: null,
  zhDescription: null,
  participantsNames: [],
  participantRoles: {},
}));

/* Charlemagne: disputed birth, 3 roles */
const ch = buildPersonLifespanModel(dto(people.find((p) => p.id === "p-charlemagne")!), evts, 751, "zh");
check("Charlemagne birthDisplay disputed", ch.birthDisplay, "747–748 年（存在学术争议）");
check("Charlemagne deathDisplay", ch.deathDisplay, "814 年");
check("Charlemagne roles count", ch.roles.length, 3);
check("Charlemagne role1 name", ch.roles[0]?.role, "King of the Franks 法兰克国王");
check("Charlemagne role1 from", ch.roles[0]?.fromYear, 768);
check("Charlemagne role1 to", ch.roles[0]?.toYear, 814);
check("Charlemagne role2 from", ch.roles[1]?.fromYear, 774);
check("Charlemagne role3 from", ch.roles[2]?.fromYear, 800);
check("Charlemagne role3 to", ch.roles[2]?.toYear, 814);
check("Charlemagne active at 751", ch.activeAtYear, true);
check("Charlemagne not active at 700", buildPersonLifespanModel(dto(people.find((p) => p.id === "p-charlemagne")!), evts, 700, "zh").activeAtYear, false);

/* Oleg: unknown birth → 年代不详, never invented */
const oleg = buildPersonLifespanModel(dto(people.find((p) => p.id === "p-oleg")!), evts, 900, "zh");
check("Oleg birthDisplay unknown", oleg.birthDisplay, "年代不详");
check("Oleg deathDisplay disputed", oleg.deathDisplay, "912 年（存在学术争议）");
check("Oleg raw birthYear null (unknown — never invented)", oleg.birthYear, null);
check("Oleg provenance birth year 850 retained as source", people.find((p) => p.id === "p-oleg")?.provenance?.birth?.year, 850);

/* Wu Zetian: disputed birth */
const wz = buildPersonLifespanModel(dto(people.find((p) => p.id === "p-wu-zetian")!), evts, 700, "zh");
check("Wu Zetian birthDisplay disputed", wz.birthDisplay, "624 年（存在学术争议）");

/* Xuanzang: two role spans + events joined from participants */
const xz = buildPersonLifespanModel(dto(people.find((p) => p.id === "p-xuanzang")!), evts, 640, "zh");
check("Xuanzang roles count", xz.roles.length, 2);
check("Xuanzang role1 from", xz.roles[0]?.fromYear, 629);
check("Xuanzang role2 from", xz.roles[1]?.fromYear, 645);
check("Xuanzang joined e-629 event", xz.events.some((e) => e.eventId === "e-629-xuanzang-india"), true);
check("Xuanzang event date display", xz.events.find((e) => e.eventId === "e-629-xuanzang-india")?.dateDisplay, "629–645 年");

/* selectPeopleAliveAtYear: 751 年活跃人物（importance 排序） */
const alive751 = selectPeopleAliveAtYear(people.map(dto), 751);
check("alive at 751 non-empty", alive751.length > 0, true);
check("alive at 751 sorted by importance", alive751.every((p, i, arr) => i === 0 || arr[i - 1].importance >= p.importance), true);
const charlemagneAlive = alive751.some((p) => p.id === "p-charlemagne");
check("Charlemagne alive at 751", charlemagneAlive, true);
const taizongDead = !alive751.some((p) => p.id === "p-taizong");
check("Taizong (d.649) NOT alive at 751", taizongDead, true);
const olegAlive900 = selectPeopleAliveAtYear(people.map(dto), 900);
check("Oleg alive at 900 (912 death)", olegAlive900.some((p) => p.id === "p-oleg"), true);

/* yearToPosition + lifespanRange */
check("yearToPosition mid", yearToPosition(750, 500, 1000), 0.5);
check("yearToPosition clamp", yearToPosition(1100, 500, 1000), 1);
const rng = lifespanRange([{ birthYear: 598, deathYear: 907 }], 751);
check("lifespanRange covers anchor", rng[0] <= 751 && 751 <= rng[1], true);
check("lifespanRange clamps to fallback", rng[0] >= 500 && rng[1] <= 1000, true);

/* model shape stability */
const modelKeys = Object.keys(ch).sort();
check(
  "model shape",
  modelKeys,
  ["activeAtYear", "birthDisplay", "birthYear", "chineseName", "civilizationColor", "civilizationName", "deathDisplay", "deathYear", "events", "importance", "lifespanDisplay", "name", "personId", "roles"],
);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
