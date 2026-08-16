/**
 * V0.2.2 → P2-12 — entity_sources 数据测试。
 *
 * 政策门禁：
 *  - 5 个 Journey 关键实体全部覆盖；
 *  - sourceTitle 真实非空；
 *  - sourceUrl 一律 null（禁止猜测）+ reviewStatus = "pending"（人工确认后
 *    才允许 verified）；
 *  - entityId/entityType 与 seed 注册表一致；authority/sourceType 合法。
 */
import { ENTITY_SOURCES } from "../src/data/seed/entitySources";
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

/* ── 覆盖：5 个关键实体 ───────────────────────────────────────────── */

const required = ["c-tang", "c-abbasid", "e-751-talas", "p-abu-muslim", "loc-talas"];
for (const id of required) {
  check(`${id} has sources`, ENTITY_SOURCES.filter((s) => s.entityId === id).length >= 1, true);
}
check("total sources >= 10", ENTITY_SOURCES.length >= 10, true);

/* ── 每条来源的政策门禁 ───────────────────────────────────────────── */

const SOURCE_TYPES = ["primary", "peer_reviewed", "university_press", "museum", "reference", "web"];
const AUTHORITY = ["A", "B", "C", "D", "E"];

for (const src of ENTITY_SOURCES) {
  check(`${src.entityId} sourceTitle non-empty`, src.sourceTitle.trim().length >= 3, true);
  check(`${src.entityId} URL is null (no guessing)`, src.sourceUrl === null || src.sourceUrl === undefined, true);
  check(`${src.entityId} reviewStatus pending`, src.reviewStatus, "pending");
  check(`${src.entityId} entity known`, isKnownEntityId(src.entityId), true);
  check(`${src.entityId} sourceType valid`, SOURCE_TYPES.includes(src.sourceType), true);
  check(`${src.entityId} authority valid`, AUTHORITY.includes(src.authorityLevel), true);
}

/* ── factKey 绑定 ─────────────────────────────────────────────────── */

const talasFacts = ENTITY_SOURCES.filter((s) => s.entityId === "e-751-talas").map((s) => s.factKey);
check("talas date fact present", talasFacts.includes("date"), true);
const abuFacts = ENTITY_SOURCES.filter((s) => s.entityId === "p-abu-muslim").map((s) => s.factKey);
check("abu-muslim birth fact", abuFacts.includes("birth"), true);
check("abu-muslim death fact", abuFacts.includes("death"), true);

/* ── 真实史料名抽查（学术事实，非捏造） ───────────────────────────── */

const titles = ENTITY_SOURCES.map((s) => s.sourceTitle).join(" · ");
check("旧唐书 referenced", titles.includes("《旧唐书》"), true);
check("资治通鉴 referenced", titles.includes("《资治通鉴》"), true);
check("al-Tabari referenced", titles.includes("al-Tabari"), true);
check("Kennedy referenced", titles.includes("Kennedy"), true);
check("Shaban referenced", titles.includes("Shaban"), true);

/* ── 无重复 ───────────────────────────────────────────────────────── */

const keys = new Set(ENTITY_SOURCES.map((s) => `${s.entityId}|${s.factKey ?? ""}|${s.sourceTitle}`));
check("no duplicate source rows", keys.size, ENTITY_SOURCES.length);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
