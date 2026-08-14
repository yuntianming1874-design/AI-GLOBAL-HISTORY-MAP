/**
 * V0.2.2 — Historical Provenance Layer tests.
 * Run: npm run test:provenance
 *
 * Covers: unified formatters (exact/approximate/range/century/unknown/
 * disputed), Charlemagne birth & roles, Wu Zetian / Abu Muslim disputed
 * births, Oleg unknown birth, approximate events, and AI wording rules
 * (disputed → “存在学术争议”, unknown → “现有可靠资料无法确定”).
 */
import { events, people } from "../src/data/seed";
import {
  formatDateCore,
  formatHistoricalDate,
  formatLifespan,
  formatYearSpan,
} from "../src/lib/provenance";
import { getAssistant } from "../src/lib/assistant";

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

/* ── 1. formatter 统一性 ──────────────────────────────────────────── */

check("exact zh", formatHistoricalDate({ year: 618, precision: "exact", confidence: "high" }, "zh"), "618 年");
check("exact en", formatHistoricalDate({ year: 618, precision: "exact", confidence: "high" }, "en"), "618");
check("approximate zh", formatHistoricalDate({ year: 741, precision: "approximate", confidence: "medium" }, "zh"), "约 741 年");
check("approximate en", formatHistoricalDate({ year: 741, precision: "approximate", confidence: "medium" }, "en"), "c. 741");
check("range zh", formatHistoricalDate({ year: 747, yearMax: 748, precision: "range", confidence: "high" }, "zh"), "747–748 年");
check("range en", formatHistoricalDate({ year: 747, yearMax: 748, precision: "range", confidence: "high" }, "en"), "747–748");
check("century zh", formatHistoricalDate({ year: 800, precision: "century", confidence: "medium" }, "zh"), "8 世纪");
check("century en", formatHistoricalDate({ year: 800, precision: "century", confidence: "medium" }, "en"), "8th century");
check("unknown zh", formatHistoricalDate({ year: 850, precision: "unknown", confidence: "unverified" }, "zh"), "年代不详");
check("unknown en", formatHistoricalDate({ year: 850, precision: "unknown", confidence: "unverified" }, "en"), "unknown");
check("undefined", formatHistoricalDate(undefined, "zh"), "年代不详");
check("disputed zh", formatHistoricalDate({ year: 624, precision: "range", confidence: "disputed", alternatives: [623, 625] }, "zh"), "624 年（存在学术争议）");
check("disputed en", formatHistoricalDate({ year: 624, precision: "range", confidence: "disputed", alternatives: [623, 625] }, "en"), "624 (disputed)");
check("formatDateCore never appends dispute", formatDateCore({ year: 624, precision: "range", confidence: "disputed" }, "zh"), "624 年");

/* formatYearSpan：无 provenance 的 span + approximate 起点 */
check("span plain", formatYearSpan(755, 763, undefined, "zh"), "755–763 年");
check("span with provenance", formatYearSpan(755, 763, { year: 755, yearMax: 763, precision: "range", confidence: "high" }, "zh"), "755–763 年");
check("span approximate start", formatYearSpan(741, null, { year: 741, precision: "approximate", confidence: "medium" }, "zh"), "约 741 年");

/* formatLifespan */
check("lifespan clean", formatLifespan({ year: 712, precision: "exact", confidence: "high" }, { year: 770, precision: "exact", confidence: "high" }, "zh"), "712 年–770 年");
check("lifespan disputed", formatLifespan({ year: 624, precision: "range", confidence: "disputed", alternatives: [623, 625] }, { year: 705, precision: "exact", confidence: "high" }, "zh"), "624 年–705 年（存在学术争议）");
check("lifespan unknown", formatLifespan({ year: 850, precision: "unknown", confidence: "unverified" }, { year: 912, precision: "range", confidence: "disputed", alternatives: [911, 922] }, "zh"), "年代不详–912 年（存在学术争议）");

/* ── 2. seed 集成：Charlemagne 专项 ───────────────────────────────── */

const charlemagne = people.find((p) => p.id === "p-charlemagne")!;
check("Charlemagne birth year", charlemagne.provenance?.birth?.year, 747);
check("Charlemagne birth yearMax", charlemagne.provenance?.birth?.yearMax, 748);
check("Charlemagne birth precision", charlemagne.provenance?.birth?.precision, "range");
check("Charlemagne birth confidence", charlemagne.provenance?.birth?.confidence, "disputed");
check("Charlemagne birth alternatives", charlemagne.provenance?.birth?.alternatives, [742, 747, 748]);
check("Charlemagne death", charlemagne.provenance?.death?.year, 814);
check(
  "Charlemagne birth display zh",
  formatHistoricalDate(charlemagne.provenance?.birth, "zh"),
  "747–748 年（存在学术争议）",
);
check(
  "Charlemagne birth display en",
  formatHistoricalDate(charlemagne.provenance?.birth, "en"),
  "747–748 (disputed)",
);
check("Charlemagne roles count", charlemagne.provenance?.roles?.length, 3);
check("Charlemagne role 1", charlemagne.provenance?.roles?.[0]?.role, "King of the Franks 法兰克国王");
check("Charlemagne role 1 from", charlemagne.provenance?.roles?.[0]?.validFrom?.year, 768);
check("Charlemagne role 1 to", charlemagne.provenance?.roles?.[0]?.validTo?.year, 814);
check("Charlemagne role 2", charlemagne.provenance?.roles?.[1]?.role, "King of the Lombards 伦巴第国王");
check("Charlemagne role 2 from", charlemagne.provenance?.roles?.[1]?.validFrom?.year, 774);
check("Charlemagne role 3", charlemagne.provenance?.roles?.[2]?.role, "Emperor 皇帝（罗马人的皇帝）");
check("Charlemagne role 3 from", charlemagne.provenance?.roles?.[2]?.validFrom?.year, 800);
check("Charlemagne role 3 to", charlemagne.provenance?.roles?.[2]?.validTo?.year, 814);
check("Charlemagne lifespan", formatLifespan(charlemagne.provenance?.birth, charlemagne.provenance?.death, "zh"), "747–748 年–814 年（存在学术争议）");

/* ── 3. 其他争议/未知人物 ─────────────────────────────────────────── */

const wu = people.find((p) => p.id === "p-wu-zetian")!;
check("Wu Zetian birth confidence", wu.provenance?.birth?.confidence, "disputed");
check("Wu Zetian birth alternatives", wu.provenance?.birth?.alternatives, [623, 625]);
check("Wu Zetian birth display", formatHistoricalDate(wu.provenance?.birth, "zh"), "624 年（存在学术争议）");

const abu = people.find((p) => p.id === "p-abu-muslim")!;
check("Abu Muslim birth confidence", abu.provenance?.birth?.confidence, "disputed");
check("Abu Muslim birth alternatives", abu.provenance?.birth?.alternatives, [718, 723]);
check("Abu Muslim birth display", formatHistoricalDate(abu.provenance?.birth, "zh"), "700 年（存在学术争议）");

const oleg = people.find((p) => p.id === "p-oleg")!;
check("Oleg birth precision", oleg.provenance?.birth?.precision, "unknown");
check("Oleg birth display", formatHistoricalDate(oleg.provenance?.birth, "zh"), "年代不详");
check("Oleg death confidence", oleg.provenance?.death?.confidence, "disputed");

/* ── 4. approximate 事件 ──────────────────────────────────────────── */

const tikal = events.find((e) => e.id === "e-741-tikal-temple-iv")!;
check("Tikal event dateProvenance", tikal.dateProvenance?.precision, "approximate");
check("Tikal display", formatYearSpan(tikal.year, tikal.yearEnd, tikal.dateProvenance, "zh"), "约 741 年");

const xuanzang = events.find((e) => e.id === "e-629-xuanzang-india")!;
check("Xuanzang journey precision", xuanzang.dateProvenance?.precision, "range");
check("Xuanzang journey display", formatYearSpan(xuanzang.year, xuanzang.yearEnd, xuanzang.dateProvenance, "zh"), "629–645 年");

/* ── 5. AI 措辞规则（LocalAssistant）──────────────────────────────── */

async function aiAsk(q: string, locale: "en" | "zh" = "zh") {
  const assistant = getAssistant();
  const res = await assistant.reply(
    [{ role: "user", content: q }],
    undefined,
    locale,
  );
  return res.reply;
}

async function runAI() {
  const zhBirth = await aiAsk("查理曼出生于哪一年？", "zh");
  check(
    "AI zh: Charlemagne birth mentions dispute",
    zhBirth.includes("存在学术争议") || zhBirth.includes("通常认为"),
    true,
  );
  check(
    "AI zh: Charlemagne birth shows 747",
    /747/.test(zhBirth) && /748/.test(zhBirth),
    true,
  );

  const enBirth = await aiAsk("When was Charlemagne born?", "en");
  check(
    "AI en: Charlemagne birth mentions dispute",
    /disputed|commonly|scholarly/i.test(enBirth),
    true,
  );

  const olegAsk = await aiAsk("奥列格（Oleg）出生于哪一年？", "zh");
  check(
    "AI zh: Oleg unknown → 现有可靠资料无法确定",
    olegAsk.includes("现有可靠资料无法确定") || olegAsk.includes("年代不详"),
    true,
  );

  const wuAsk = await aiAsk("武则天是什么时候出生的？", "zh");
  check(
    "AI zh: Wu Zetian dispute",
    wuAsk.includes("存在学术争议") || wuAsk.includes("通常认为"),
    true,
  );
}

async function main() {
  await runAI();

  /* ── 报告 ─────────────────────────────────────────────────────── */
  console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
}

main();

