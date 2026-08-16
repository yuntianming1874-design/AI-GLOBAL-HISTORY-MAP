/**
 * Historical Data Provenance & Accuracy Audit（只读审计，不改 seed）。
 *
 * 运行：npm run audit:history
 * 输出：docs/history-data-audit.md（完整报告）+ 控制台摘要。
 *
 * 审计知识库（AUDIT_KNOWLEDGE）来自通用史学共识（Cambridge/Oxford 级别，
 * authority = B/C）；每条发现给出 status: PASS / WARN / CONFLICT / UNVERIFIED。
 * 本脚本不修改任何 seed 数据——修正项须经人工确认后才进入正式数据。
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  civilizations,
  events,
  locations,
  people,
  relationships,
} from "../src/data/seed";
import {
  AUTHORITY_LEVELS,
  type AuditFinding,
  type AuditStatus,
  type HistoricalAuthorityLevel,
} from "../src/lib/provenance";

/* ── 1. 审计知识库（外部史学共识，不来自 seed）────────────────────── */

interface PersonKnowledge {
  birth?: { year: number; max?: number; precision: string; confidence: string; alternatives?: string[]; note?: string; authority: HistoricalAuthorityLevel };
  death?: { year: number; precision: string; confidence: string; alternatives?: string[]; note?: string; authority: HistoricalAuthorityLevel };
  roles?: { role: string; from?: number; to?: number; confidence: string }[];
  notes?: string[];
}

const PERSON_KNOWLEDGE: Record<string, PersonKnowledge> = {
  "p-taizong": {
    birth: { year: 598, precision: "range", confidence: "medium", alternatives: ["599"], note: "《旧唐书》《新唐书》生年记载略有出入，学界常用 598 或 599。", authority: "B" },
    death: { year: 649, precision: "exact", confidence: "high", authority: "A" },
    roles: [{ role: "Emperor of Tang 皇帝", from: 626, to: 649, confidence: "high" }],
  },
  "p-wu-zetian": {
    birth: { year: 624, precision: "range", confidence: "disputed", alternatives: ["623", "625"], note: "武曌生年有 623/624/625 三说。", authority: "B" },
    death: { year: 705, precision: "exact", confidence: "high", authority: "A" },
    roles: [{ role: "Empress Regnant 皇帝（武周）", from: 690, to: 705, confidence: "high" }],
  },
  "p-xuanzong": {
    birth: { year: 685, precision: "range", confidence: "medium", alternatives: ["686"], note: "685 或 686 两说。", authority: "B" },
    death: { year: 762, precision: "exact", confidence: "high", authority: "A" },
    roles: [{ role: "Emperor of Tang 皇帝", from: 712, to: 756, confidence: "high" }],
  },
  "p-li-bai": {
    birth: { year: 701, precision: "range", confidence: "medium", alternatives: ["700"], note: "701 年为主流；一说 700。", authority: "B" },
    death: { year: 762, precision: "exact", confidence: "high", note: "762 年（11 月）为通行说。", authority: "B" },
    roles: [{ role: "Hanlin Academician 翰林供奉", from: 742, to: 744, confidence: "medium" }],
  },
  "p-du-fu": {
    birth: { year: 712, precision: "exact", confidence: "high", authority: "B" },
    death: { year: 770, precision: "exact", confidence: "high", authority: "B" },
  },
  "p-an-lushan": {
    birth: { year: 703, precision: "approximate", confidence: "medium", note: "约 703 年（另有 705 说）。", authority: "B" },
    death: { year: 757, precision: "exact", confidence: "high", note: "757 年初为其子安庆绪所杀。", authority: "B" },
  },
  "p-guo-ziyi": {
    birth: { year: 697, precision: "exact", confidence: "medium", note: "697 年（或有 696 说）。", authority: "C" },
    death: { year: 781, precision: "exact", confidence: "high", authority: "B" },
  },
  "p-xuanzang": {
    birth: { year: 602, precision: "range", confidence: "medium", alternatives: ["600", "603"], note: "生年有 600/602/603 诸说。", authority: "B" },
    death: { year: 664, precision: "exact", confidence: "high", authority: "A" },
    roles: [{ role: "Buddhist translator 译经师", from: 645, to: 664, confidence: "high" }],
  },
  "p-han-yu": { birth: { year: 768, precision: "exact", confidence: "high", authority: "B" }, death: { year: 824, precision: "exact", confidence: "high", authority: "B" } },
  "p-huang-chao": {
    birth: { year: 835, precision: "approximate", confidence: "low", note: "生年无确载，约 820–835 年间，835 为常用推定。", authority: "C" },
    death: { year: 884, precision: "exact", confidence: "medium", note: "884 年（一说 883 年末），虎狼谷之死。", authority: "B" },
  },
  "p-yang-guifei": {
    birth: { year: 719, precision: "exact", confidence: "medium", note: "719 年为通行推定。", authority: "C" },
    death: { year: 756, precision: "exact", confidence: "high", note: "756 年马嵬驿赐死。", authority: "B" },
  },
  "p-muhammad": {
    birth: { year: 570, precision: "range", confidence: "medium", alternatives: ["571"], note: "传统记载 570 或 571 年（象年）。", authority: "B" },
    death: { year: 632, precision: "exact", confidence: "high", note: "632 年 6 月 8 日（伊斯兰历 11 年）。", authority: "B" },
  },
  "p-abu-bakr": { birth: { year: 573, precision: "approximate", confidence: "medium", note: "约 573 年。", authority: "C" }, death: { year: 634, precision: "exact", confidence: "high", authority: "B" } },
  "p-harun-al-rashid": {
    birth: { year: 766, precision: "range", confidence: "medium", alternatives: ["763"], note: "766 或 763 年两说。", authority: "B" },
    death: { year: 809, precision: "exact", confidence: "high", authority: "B" },
    roles: [{ role: "Abbasid Caliph 哈里发", from: 786, to: 809, confidence: "high" }],
  },
  "p-charlemagne": {
    birth: { year: 747, max: 748, precision: "range", confidence: "disputed", alternatives: ["742", "747", "748"], note: "艾因哈德《查理大帝传》记 742；现代研究多取 747/748（由加冕年龄反推）。生年存在学术争议。", authority: "B" },
    death: { year: 814, precision: "exact", confidence: "high", note: "814 年 1 月 28 日，亚琛。", authority: "A" },
    roles: [
      { role: "King of the Franks 法兰克国王", from: 768, to: 814, confidence: "high" },
      { role: "King of the Lombards 伦巴第国王", from: 774, to: 814, confidence: "high" },
      { role: "Emperor 皇帝（罗马人的皇帝）", from: 800, to: 814, confidence: "high" },
    ],
  },
  "p-alcuin": { birth: { year: 735, precision: "approximate", confidence: "medium", note: "约 735 年。", authority: "C" }, death: { year: 804, precision: "exact", confidence: "high", authority: "B" } },
  "p-al-khwarizmi": {
    birth: { year: 780, precision: "range", confidence: "medium", alternatives: ["783"], note: "约 780 或 783 年。", authority: "B" },
    death: { year: 850, precision: "approximate", confidence: "medium", note: "卒年约 850（另有 840 前后说）。", authority: "B" },
  },
  "p-genmei": { birth: { year: 660, precision: "approximate", confidence: "medium", note: "约 660 年（661 说）。", authority: "C" }, death: { year: 721, precision: "exact", confidence: "high", authority: "B" } },
  "p-kukai": { birth: { year: 774, precision: "exact", confidence: "high", authority: "B" }, death: { year: 835, precision: "exact", confidence: "high", authority: "B" } },
  "p-abu-muslim": {
    birth: { year: 700, precision: "range", confidence: "disputed", alternatives: ["718", "723"], note: "生年分歧大：约 700（或 718/723）。", authority: "C" },
    death: { year: 755, precision: "exact", confidence: "high", note: "755 年为曼苏尔所杀。", authority: "B" },
    roles: [{ role: "Revolutionary general 革命将领（呼罗珊）", from: 747, to: 755, confidence: "medium" }],
  },
  "p-abd-al-rahman-i": { birth: { year: 731, precision: "exact", confidence: "high", authority: "B" }, death: { year: 788, precision: "exact", confidence: "high", authority: "B" } },
  "p-cyril": {
    birth: { year: 826, precision: "range", confidence: "medium", alternatives: ["827"], note: "826 或 827 年。", authority: "B" },
    death: { year: 869, precision: "exact", confidence: "high", note: "869 年 2 月 14 日。", authority: "B" },
  },
  "p-methodius": {
    birth: { year: 815, precision: "range", confidence: "medium", alternatives: ["816"], note: "约 815/816 年。", authority: "B" },
    death: { year: 885, precision: "exact", confidence: "high", authority: "B" },
  },
  "p-oleg": {
    birth: { year: 850, precision: "unknown", confidence: "unverified", note: "生年无任何可靠记载。", authority: "D" },
    death: { year: 912, precision: "range", confidence: "disputed", alternatives: ["911", "922"], note: "《往年纪事》记 912；另有 911/922 说，且死因（蛇咬）属传说层。", authority: "B" },
  },
};

interface EventKnowledge {
  year: number;
  yearEnd?: number;
  precision: string;
  confidence: string;
  alternatives?: string[];
  note?: string;
  authority: HistoricalAuthorityLevel;
}

const EVENT_KNOWLEDGE: Record<string, EventKnowledge> = {
  "e-618-tang-founded": { year: 618, precision: "exact", confidence: "high", authority: "A" },
  "e-622-hijra": { year: 622, precision: "exact", confidence: "high", note: "622 年（伊斯兰历元年）。", authority: "B" },
  "e-626-xuanwu-gate": { year: 626, precision: "exact", confidence: "high", note: "626 年 7 月 2 日（武德九年六月初四）。", authority: "A" },
  "e-629-xuanzang-india": { year: 629, yearEnd: 645, precision: "range", confidence: "medium", note: "玄奘西行出发年有 627/629 两说；629 为主流。", authority: "B" },
  "e-630-eastern-turks": { year: 630, precision: "exact", confidence: "high", authority: "A" },
  "e-632-muhammad-dies": { year: 632, precision: "exact", confidence: "high", note: "632 年 6 月 8 日。", authority: "A" },
  "e-634-arab-conquests": { year: 634, yearEnd: 651, precision: "range", confidence: "high", note: "终点取耶兹德戈尔德三世之死（651；亦有 652 说）。", authority: "B" },
  "e-638-jerusalem-siege": { year: 638, precision: "exact", confidence: "high", note: "637/638 两说，638 常用。", authority: "B" },
  "e-649-taizong-dies": { year: 649, precision: "exact", confidence: "high", authority: "A" },
  "e-651-islam-china": { year: 651, precision: "exact", confidence: "medium", note: "依《旧唐书》永徽二年遣使记载；学界对“首次官方接触”的解读有讨论。", authority: "B" },
  "e-661-umayyad-founded": { year: 661, precision: "exact", confidence: "high", authority: "B" },
  "e-668-silla-unifies": { year: 668, precision: "exact", confidence: "high", authority: "B" },
  "e-671-yijing-srivijaya": { year: 671, yearEnd: 695, precision: "range", confidence: "medium", authority: "C" },
  "e-690-wu-zetian-zhou": { year: 690, precision: "exact", confidence: "high", note: "690 年 10 月（载初元年九月）。", authority: "A" },
  "e-705-wu-zetian-abdication": { year: 705, precision: "exact", confidence: "high", authority: "A" },
  "e-710-nara-capital": { year: 710, precision: "exact", confidence: "high", authority: "B" },
  "e-711-umayyad-iberia": { year: 711, precision: "exact", confidence: "high", authority: "B" },
  "e-712-kojiki": { year: 712, precision: "exact", confidence: "high", authority: "B" },
  "e-717-siege-constantinople": { year: 717, yearEnd: 718, precision: "range", confidence: "high", authority: "B" },
  "e-726-iconoclasm": { year: 726, precision: "exact", confidence: "medium", note: "726 或 730 年诏令之争议；726 常用。", authority: "B" },
  "e-732-tours": { year: 732, precision: "exact", confidence: "high", note: "732 年 10 月。", authority: "B" },
  "e-740-khazar-judaism": { year: 740, precision: "approximate", confidence: "medium", note: "约 740 年，或 8 世纪中叶；可萨改宗时间本身存在争议。", authority: "C" },
  "e-741-tikal-temple-iv": { year: 741, precision: "approximate", confidence: "medium", note: "约 741 年（基于纪年铭文推算）。", authority: "C" },
  "e-742-libai-court": { year: 742, yearEnd: 744, precision: "range", confidence: "medium", note: "742 年应召入翰林（天宝元年/二年说）。", authority: "B" },
  "e-745-yang-guifei": { year: 745, precision: "range", confidence: "medium", alternatives: ["744"], note: "745（天宝四载）或 744 年。", authority: "B" },
  "e-750-abbasid-revolution": { year: 750, precision: "exact", confidence: "high", note: "扎卜河之战 750 年 1 月。", authority: "B" },
  "e-751-talas": { year: 751, precision: "exact", confidence: "high", note: "751 年 7–8 月（怛逻斯河）；具体日期无载。", authority: "B" },
  "e-755-anlushan": { year: 755, yearEnd: 763, precision: "range", confidence: "high", note: "755 年 12 月起兵（天宝十四载十一月）。", authority: "A" },
  "e-762-baghdad": { year: 762, precision: "exact", confidence: "high", authority: "B" },
  "e-763-tibetans-changan": { year: 763, precision: "exact", confidence: "high", note: "763 年 11 月。", authority: "A" },
  "e-768-charlemagne-king": { year: 768, precision: "exact", confidence: "high", authority: "B" },
  "e-781-nestorian-stele": { year: 781, precision: "exact", confidence: "high", note: "781 年（建中二年）立碑。", authority: "A" },
  "e-786-harun-caliph": { year: 786, precision: "exact", confidence: "high", authority: "B" },
  "e-786-translation-movement": { year: 786, yearEnd: 830, precision: "range", confidence: "medium", note: "翻译运动为长时段现象（约 750–900）；取 786–830 为高峰期。", authority: "B" },
  "e-793-lindisfarne": { year: 793, precision: "exact", confidence: "high", note: "793 年 6 月 8 日（盎格鲁-撒克逊编年史）。", authority: "B" },
  "e-794-heiankyo": { year: 794, precision: "exact", confidence: "high", authority: "B" },
  "e-800-charlemagne-emperor": { year: 800, precision: "exact", confidence: "high", note: "800 年 12 月 25 日。", authority: "A" },
  "e-804-kukai-china": { year: 804, precision: "exact", confidence: "high", authority: "B" },
  "e-810-maya-collapse": { year: 810, yearEnd: 900, precision: "range", confidence: "medium", note: "古典期崩溃为长时段过程；起止为学术分期。", authority: "B" },
  "e-820-khwarizmi-algebra": { year: 820, precision: "approximate", confidence: "medium", note: "约 820（一说 813–833 年间）。", authority: "B" },
  "e-828-jang-bogo": { year: 828, precision: "exact", confidence: "medium", authority: "C" },
  "e-845-buddhist-persecution": { year: 845, precision: "exact", confidence: "high", note: "会昌五年（845）诏令。", authority: "A" },
  "e-851-sulayman-china": { year: 851, precision: "approximate", confidence: "medium", note: "约 851 年成书。", authority: "C" },
  "e-863-cyril-methodius": { year: 863, precision: "exact", confidence: "high", authority: "B" },
  "e-868-diamond-sutra": { year: 868, precision: "exact", confidence: "high", note: "868 年 5 月 11 日（咸通九年四月十五日）刊记。", authority: "A" },
  "e-875-huang-chao": { year: 875, yearEnd: 884, precision: "range", confidence: "high", note: "875 年起兵（乾符二年）。", authority: "A" },
  "e-882-oleg-kiev": { year: 882, precision: "exact", confidence: "medium", note: "依《往年纪事》；882 为编年记载。", authority: "B" },
  "e-885-vikings-paris": { year: 885, yearEnd: 886, precision: "range", confidence: "high", authority: "B" },
  "e-907-fall-of-tang": { year: 907, precision: "exact", confidence: "high", note: "907 年（天祐四年）。", authority: "A" },
};

/** 文明名称类型判定（当代自称 / 现代学界标签 / 回溯性标签）。 */
const CIV_NAME_TYPES: Record<string, { nameType: string; note: string; authority: HistoricalAuthorityLevel }> = {
  "c-tang": { nameType: "modern_scholarly", note: "当代自称“唐/大唐”；“Tang Dynasty”为现代学界标签。", authority: "B" },
  "c-tibet": { nameType: "modern_scholarly", note: "当代称“吐蕃”；“Tibetan Empire”为现代标签。", authority: "B" },
  "c-silla": { nameType: "modern_scholarly", note: "当代称“新罗”；“Unified Silla”为现代史学分期标签。", authority: "B" },
  "c-japan": { nameType: "retrospective", note: "“奈良·平安”为后世对时代的回溯性分期，非当时自称。", authority: "B" },
  "c-abbasid": { nameType: "modern_scholarly", note: "当代自称“达瓦拉/阿拔斯家族之政”；“Abbasid Caliphate”为现代标签。", authority: "B" },
  "c-umayyad": { nameType: "modern_scholarly", note: "当代称“穆阿维叶之政”；“Umayyad”为现代史学称谓。", authority: "B" },
  "c-byzantium": { nameType: "modern_scholarly", note: "帝国当代自称“罗马/罗马尼亚”；“Byzantine Empire”为后世史学标签。", authority: "B" },
  "c-carolingian": { nameType: "modern_scholarly", note: "查理曼时代不存在“Carolingian Empire”国名；为现代史学/回溯性标签。", authority: "B" },
  "c-vikings": { nameType: "retrospective", note: "“维京时代”为后世分期概念，当时无此自称。", authority: "B" },
  "c-maya": { nameType: "retrospective", note: "“Classic Maya”为考古学分期标签；“玛雅”为后世称谓。", authority: "B" },
  "c-srivijaya": { nameType: "contemporary", note: "中文/阿拉伯史料称室利佛逝/三佛齐；本土自称无直接记载。", authority: "C" },
  "c-khazars": { nameType: "modern_scholarly", note: "当代称可萨（哈扎尔）；“Khazar Khaganate”为现代标签。", authority: "B" },
};

/** 关键人物首批审计名单（规格 §十三）。 */
const KEY_PEOPLE = [
  "p-taizong", "p-wu-zetian", "p-xuanzong", "p-li-bai", "p-du-fu",
  "p-an-lushan", "p-xuanzang", "p-charlemagne", "p-harun-al-rashid",
  "p-abu-muslim", "p-muhammad",
];
/** 关键事件首批审计名单（规格 §十四）。 */
const KEY_EVENTS = [
  "e-618-tang-founded", "e-630-eastern-turks", "e-742-libai-court",
  "e-755-anlushan", "e-751-talas", "e-750-abbasid-revolution",
  "e-634-arab-conquests", "e-800-charlemagne-emperor", "e-868-diamond-sutra",
  "e-907-fall-of-tang",
];

/* ── 2. 审计执行 ───────────────────────────────────────────────────── */

const findings: AuditFinding[] = [];
const personById = new Map(people.map((p) => [p.id, p]));

function add(f: AuditFinding) {
  findings.push(f);
}

/* 2.1 People：关键人物事实级审计 */
for (const pid of KEY_PEOPLE) {
  const p = personById.get(pid);
  const k = PERSON_KNOWLEDGE[pid];
  if (!p || !k) continue;
  const label = `${p.name}（${p.chineseName}）`;
  const details: string[] = [];
  let worst: AuditStatus = "PASS";

  if (k.birth) {
    const seed = p.birthYear;
    const y = k.birth.year;
    const inRange = seed !== null && (seed === y || (k.birth.max !== undefined && seed >= y && seed <= (k.birth.max as number)));
    const pfx = `birth: seed=${seed ?? "null"} 知识库=${y}${k.birth.max ? `–${k.birth.max}` : ""}`;
    if (k.birth.confidence === "disputed") {
      details.push(`${pfx} — 存在学术争议（${k.birth.alternatives?.join(" / ")}）；${k.birth.note ?? ""}`);
      worst = "WARN";
    } else if (!inRange) {
      details.push(`${pfx} — 与知识库不一致（precision=${k.birth.precision}，${k.birth.note ?? ""}）`);
      worst = "WARN";
    } else if (k.birth.precision !== "exact") {
      details.push(`${pfx} — 日期非精确（precision=${k.birth.precision}；${k.birth.note ?? ""}）`);
      worst = "WARN";
    } else {
      details.push(`${pfx} — PASS`);
    }
  }
  if (k.death) {
    const seed = p.deathYear;
    const inRange = seed !== null && seed === k.death.year;
    const pfx = `death: seed=${seed ?? "null"} 知识库=${k.death.year}`;
    if (!inRange) {
      details.push(`${pfx} — 与知识库不一致（${k.death.note ?? ""}）`);
      worst = "WARN";
    } else if (k.death.precision !== "exact") {
      details.push(`${pfx} — 日期非精确（${k.death.note ?? ""}）`);
      worst = "WARN";
    } else {
      details.push(`${pfx} — PASS`);
    }
  }
  if (k.roles && k.roles.length > 0) {
    const roleStr = k.roles.map((r) => `${r.role} ${r.from}–${r.to ?? "?"}`).join("；");
    details.push(`roles(知识库): ${roleStr} — 角色随时间变化，不应作为静态身份`);
  }
  add({
    status: worst,
    entityId: pid,
    entityType: "person",
    label,
    code: worst === "WARN" ? "PRECISION_WARN" : undefined,
    details,
    authority: k.birth?.authority ?? k.death?.authority ?? "B",
  });
}

/* 2.2 其余人物：年份区间 + 争议抽查（知识库有则查，无则跳过） */
for (const p of people) {
  if (KEY_PEOPLE.includes(p.id)) continue;
  const k = PERSON_KNOWLEDGE[p.id];
  if (!k) continue;
  const details: string[] = [];
  let worst: AuditStatus = "PASS";
  if (k.birth && p.birthYear !== k.birth.year) {
    details.push(`birth: seed=${p.birthYear} 知识库=${k.birth.year}${k.birth.max ? `–${k.birth.max}` : ""}（${k.birth.note ?? ""}）`);
    worst = "WARN";
  }
  if (k.death && p.deathYear !== k.death.year) {
    details.push(`death: seed=${p.deathYear} 知识库=${k.death.year}（${k.death.note ?? ""}）`);
    worst = "WARN";
  }
  if (k.birth?.confidence === "unverified" || k.death?.confidence === "unverified") {
    worst = "UNVERIFIED";
  }
  if (details.length > 0 || worst === "UNVERIFIED") {
    add({
      status: worst,
      entityId: p.id,
      entityType: "person",
      label: `${p.name}（${p.chineseName}）`,
      code: worst === "WARN" ? "PRECISION_WARN" : worst === "UNVERIFIED" ? "UNVERIFIED_FACT" : undefined,
      details,
      authority: k.birth?.authority ?? k.death?.authority,
    });
  }
}

/* 2.3 Events：关键事件 + 近似日期标注 */
for (const e of events) {
  const k = EVENT_KNOWLEDGE[e.id];
  if (!k) continue;
  const isKey = KEY_EVENTS.includes(e.id);
  const details: string[] = [];
  let worst: AuditStatus = "PASS";
  if (e.year !== k.year || e.yearEnd !== k.yearEnd) {
    details.push(`year: seed=${e.year}${e.yearEnd ? `–${e.yearEnd}` : ""} 知识库=${k.year}${k.yearEnd ? `–${k.yearEnd}` : ""}（${k.note ?? ""}）`);
    worst = "WARN";
  } else if (k.precision !== "exact") {
    details.push(`year=${e.year}${e.yearEnd ? `–${e.yearEnd}` : ""} — 日期非精确（precision=${k.precision}；${k.note ?? ""}）`);
    worst = "WARN";
  } else {
    details.push(`year=${e.year} — PASS${k.note ? `（${k.note}）` : ""}`);
  }
  add({
    status: worst,
    entityId: e.id,
    entityType: "event",
    label: `${e.title}（${e.chineseTitle}）${isKey ? " ★关键" : ""}`,
    code: worst === "WARN" ? "PRECISION_WARN" : undefined,
    details,
    authority: k.authority,
  });
}

/* 2.4 Civilizations：名称类型 + 年代 */
for (const c of civilizations) {
  const nt = CIV_NAME_TYPES[c.id];
  if (!nt) continue;
  add({
    status: "WARN",
    entityId: c.id,
    entityType: "civilization",
    label: `${c.name}（${c.chineseName}）`,
    code: "NAME_TYPE",
    details: [
      `名称“${c.name}”为 ${nt.nameType}（${nt.note}）`,
      `年代 seed=${c.startYear}–${c.endYear}（学界分期，边界为约定）`,
    ],
    authority: nt.authority,
  });
}

/* 2.5 Locations：现代坐标 + 历史对应 */
for (const l of locations) {
  add({
    status: "PASS",
    entityId: l.id,
    entityType: "location",
    label: `${l.name}（${l.chineseName}）`,
    details: [
      `现代坐标 ${l.latitude.toFixed(2)}, ${l.longitude.toFixed(2)}（现代城址/河谷，精度 approximate）`,
      `历史对应：${l.description.split("。")[0]}。`,
      l.id === "loc-talas"
        ? "注意：怛罗斯战场具体位置在学界仍有讨论（塔拉斯河谷一带）。"
        : undefined,
    ].filter(Boolean) as string[],
    authority: "C",
  });
}

/* 2.6 Relationships：时间一致性 + 类型覆盖 */
for (const r of relationships) {
  const ok = r.startYear === null || r.endYear === null || r.startYear <= r.endYear;
  add({
    status: ok ? "PASS" : "CONFLICT",
    entityId: r.id,
    entityType: "relationship",
    label: `${personById.get(r.sourcePersonId)?.name ?? r.sourcePersonId} —${r.type}→ ${personById.get(r.targetPersonId)?.name ?? r.targetPersonId}`,
    code: ok ? undefined : "CHRONOLOGY_CONFLICT",
    details: [
      ok
        ? `时间窗口 ${r.startYear ?? "?"}–${r.endYear ?? "?"} 一致`
        : `时间窗口 ${r.startYear}–${r.endYear} 倒置`,
      r.description.includes("never met") || r.description.includes("从未谋面")
        ? "比较性关联（二人从未谋面）已显式注明"
        : undefined,
    ].filter(Boolean) as string[],
    authority: "B",
  });
}

/* 2.7 自动矛盾检测：TEMPORAL_CONFLICT / ROLE_TIMELINE_CONFLICT */
let temporalConflicts = 0;
for (const e of events) {
  for (const pid of e.participants) {
    const p = personById.get(pid);
    if (!p) continue;
    const spanEnd = e.yearEnd ?? e.year;
    if (p.birthYear !== null && p.birthYear > spanEnd) {
      temporalConflicts += 1;
      add({
        status: "CONFLICT",
        entityId: e.id,
        entityType: "event",
        label: `${e.title} × ${p.name}`,
        code: "TEMPORAL_CONFLICT",
        details: [`participant ${p.name} 出生 ${p.birthYear} 晚于事件 ${e.year}${e.yearEnd ? `–${e.yearEnd}` : ""}`, "出生晚于事件——不可能参与"],
        authority: "A",
      });
    }
    if (p.deathYear !== null && p.deathYear < e.year) {
      temporalConflicts += 1;
      add({
        status: "CONFLICT",
        entityId: e.id,
        entityType: "event",
        label: `${e.title} × ${p.name}`,
        code: "TEMPORAL_CONFLICT",
        details: [`participant ${p.name} 卒于 ${p.deathYear}，早于事件 ${e.year}`, "去世早于事件——不可能参与"],
        authority: "A",
      });
    }
    if (p.birthYear !== null && p.birthYear + 15 > spanEnd) {
      add({
        status: "WARN",
        entityId: e.id,
        entityType: "event",
        label: `${e.title} × ${p.name}`,
        code: "TEMPORAL_WARN",
        details: [`participant ${p.name} 事件时仅约 ${spanEnd - p.birthYear} 岁`, "年龄异常年轻（<15），需人工核对"],
        authority: "B",
      });
    }
  }
}

/* ROLE_TIMELINE_CONFLICT：参与事件时人物知识库角色是否覆盖 */
for (const e of events) {
  for (const pid of e.participants) {
    const k = PERSON_KNOWLEDGE[pid];
    if (!k?.roles || k.roles.length === 0) continue;
    const p = personById.get(pid);
    const covered = k.roles.some(
      (r) => (r.from === undefined || e.year >= r.from) && (r.to === undefined || e.year <= r.to),
    );
    if (!covered) {
      add({
        status: "WARN",
        entityId: e.id,
        entityType: "event",
        label: `${e.title} × ${p?.name ?? pid}`,
        code: "ROLE_TIMELINE_CONFLICT",
        details: [
          `事件年 ${e.year} 不在该人物已知角色区间内：${k.roles.map((r) => `${r.role} ${r.from}–${r.to ?? "?"}`).join("；")}`,
          "可能角色缺失或事件年份存疑——需人工核对",
        ],
        authority: "B",
      });
    }
  }
}

/* 2.8 V0.2.2 Provenance 深度检查（precision / confidence / 角色时间线 /
 *       missing sources / duplicated facts / 无效角色区间 / 无效 alternative 年份）
 *       知识库期望值（PERSON_KNOWLEDGE / EVENT_KNOWLEDGE）仍是史学共识参照；
 *       seed 的 provenance 字段是运行时单一事实源——审计校验两者一致。 */
let provChecks = 0;
const provMismatch: string[] = [];

/* 2.8.1 人物：provenance ↔ 知识库 一致性 */
for (const pid of KEY_PEOPLE) {
  const p = personById.get(pid);
  const k = PERSON_KNOWLEDGE[pid];
  if (!p || !k) continue;
  const pr = p.provenance;
  const problems: string[] = [];
  if (!pr) {
    problems.push("缺 provenance（V0.2.2 要求关键人物必须携带）");
  } else {
    for (const side of ["birth", "death"] as const) {
      const kv = k[side];
      const pv = pr[side];
      if (!kv) continue;
      if (!pv) { problems.push(`${side}: 知识库有值但 provenance 缺失`); continue; }
      if (pv.year !== kv.year) problems.push(`${side}: year=${pv.year} 知识库=${kv.year}`);
      if (pv.precision !== kv.precision) problems.push(`${side}: precision=${pv.precision} 知识库=${kv.precision}`);
      if (pv.confidence !== kv.confidence) problems.push(`${side}: confidence=${pv.confidence} 知识库=${kv.confidence}`);
      const kMax = (kv as { max?: number }).max;
      if ((pv.yearMax ?? null) !== (kMax ?? null)) problems.push(`${side}: yearMax=${pv.yearMax ?? null} 知识库=${kMax ?? null}`);
      const kAlts = (kv.alternatives ?? []).map(Number).sort((a, b) => a - b);
      const pAlts = (pv.alternatives ?? []).slice().sort((a, b) => a - b);
      if (JSON.stringify(kAlts) !== JSON.stringify(pAlts)) problems.push(`${side}: alternatives=${JSON.stringify(pAlts)} 知识库=${JSON.stringify(kAlts)}`);
    }
    /* 角色区间 ↔ 知识库角色 */
    const kRoles = k.roles ?? [];
    for (const kr of kRoles) {
      const match = pr.roles?.find((r) => r.role === kr.role);
      if (!match) { problems.push(`角色 "${kr.role}" 未进入 provenance.roles`); continue; }
      if (match.validFrom?.year !== kr.from) problems.push(`角色 "${kr.role}" validFrom=${match.validFrom?.year} 知识库=${kr.from}`);
      if (match.validTo?.year !== kr.to) problems.push(`角色 "${kr.role}" validTo=${match.validTo?.year} 知识库=${kr.to}`);
    }
    /* invalid role intervals：validFrom > validTo */
    for (const r of pr.roles ?? []) {
      if (r.validFrom?.year !== undefined && r.validTo?.year !== undefined && r.validFrom.year > r.validTo.year) {
        problems.push(`角色 "${r.role}" 区间倒置 ${r.validFrom.year} > ${r.validTo.year}`);
      }
    }
    /* duplicated facts：数值字段 ↔ provenance */
    if (p.birthYear !== null && pr.birth?.year !== undefined && p.birthYear !== pr.birth.year) {
      problems.push(`birthYear=${p.birthYear} 与 provenance.birth.year=${pr.birth.year} 不一致`);
    }
    if (p.deathYear !== null && pr.death?.year !== undefined && p.deathYear !== pr.death.year) {
      problems.push(`deathYear=${p.deathYear} 与 provenance.death.year=${pr.death.year} 不一致`);
    }
  }
  provChecks += 1;
  if (problems.length > 0) {
    provMismatch.push(`${p.name}（${p.chineseName}）`);
    add({
      status: "WARN",
      entityId: p.id,
      entityType: "person",
      label: `${p.name}（${p.chineseName}）`,
      code: "PROVENANCE_MISMATCH",
      details: problems,
      authority: "B",
    });
  } else {
    add({
      status: "PASS",
      entityId: p.id,
      entityType: "person",
      label: `${p.name}（${p.chineseName}） provenance 与知识库一致`,
      details: ["birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致"],
      authority: "B",
    });
  }
}

/* 2.8.2 事件：dateProvenance ↔ 知识库 一致性 + invalid alternative years */
for (const eid of KEY_EVENTS) {
  const e = events.find((x) => x.id === eid);
  const k = EVENT_KNOWLEDGE[eid];
  if (!e || !k) continue;
  const dp = e.dateProvenance;
  const problems: string[] = [];
  if (!dp) {
    problems.push("缺 dateProvenance（关键事件必须携带）");
  } else {
    if (dp.year !== k.year) problems.push(`year=${dp.year} 知识库=${k.year}`);
    if ((dp.yearMax ?? null) !== (k.yearEnd ?? null)) problems.push(`yearMax=${dp.yearMax ?? null} 知识库=${k.yearEnd ?? null}`);
    if (dp.precision !== k.precision) problems.push(`precision=${dp.precision} 知识库=${k.precision}`);
    if (dp.confidence !== k.confidence) problems.push(`confidence=${dp.confidence} 知识库=${k.confidence}`);
    const kAlts = (k.alternatives ?? []).map(Number).sort((a, b) => a - b);
    const pAlts = (dp.alternatives ?? []).slice().sort((a, b) => a - b);
    if (JSON.stringify(kAlts) !== JSON.stringify(pAlts)) problems.push(`alternatives=${JSON.stringify(pAlts)} 知识库=${JSON.stringify(kAlts)}`);
    for (const a of dp.alternatives ?? []) {
      if (!Number.isInteger(a) || a < -1000 || a > 3000) problems.push(`invalid alternative year ${a}`);
    }
    if (dp.year !== e.year) problems.push(`dateProvenance.year=${dp.year} 与 event.year=${e.year} 不一致`);
  }
  provChecks += 1;
  if (problems.length > 0) {
    provMismatch.push(`${e.title}`);
    add({
      status: "WARN",
      entityId: e.id,
      entityType: "event",
      label: `${e.title}（${e.chineseTitle}）`,
      code: "PROVENANCE_MISMATCH",
      details: problems,
      authority: "B",
    });
  } else {
    add({
      status: "PASS",
      entityId: e.id,
      entityType: "event",
      label: `${e.title}（${e.chineseTitle}） dateProvenance 与知识库一致`,
      details: ["year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致"],
      authority: "B",
    });
  }
}

/* 2.8.3 全库覆盖：missing sources（V0.2.2 来源层尚未人工填充） */
add({
  status: "UNVERIFIED",
  entityId: "*",
  entityType: "system",
  label: "entity_sources 填充状态（V0.2.2）",
  code: "MISSING_SOURCES",
  details: [
    `provenance 深度检查实体 ${provChecks} 个：${provMismatch.length} 个不一致`,
    provMismatch.length > 0 ? `不一致清单：${provMismatch.join("、")}` : "全部一致——precision/confidence/角色时间线/年份与知识库吻合",
    "entity_sources 第一批已建：5 个 Journey 关键实体（c-tang、c-abbasid、e-751-talas、p-abu-muslim、loc-talas）携带真实史料/学术著作名（《旧唐书》《资治通鉴》、al-Tabari、Kennedy、Shaban 等），sourceUrl 一律 null + reviewStatus=pending（禁止猜测 URL）",
    "待人工复核：Charlemagne 出生（742/747/748）、武曌生年（623/624/625）、Abu Muslim 生年（700/718/723）、Oleg 生年（unknown）",
  ],
  authority: "E",
});

/* 2.8 Charlemagne 专项 */
{
  add({
    status: "WARN",
    entityId: "p-charlemagne",
    entityType: "person",
    label: `Charlemagne 专项（查理曼）`,
    code: "DISPUTED_BIRTH",
    details: [
      `Birth: 742 / 747 / 748 disputed（艾因哈德记 742；现代研究由 800 年加冕年龄反推多取 747/748）`,
      `Death: 814 exact（814-01-28，亚琛）`,
      `King of the Franks 768–814（非整个生命周期的静态身份）`,
      `King of the Lombards 774–814`,
      `Emperor 800–814`,
      `“Carolingian Empire / 法兰克皇帝”为现代史学/回溯性标签，非当时唯一正式国名`,
    ],
    authority: "B",
  });
}

/* 2.9 系统级：来源覆盖 */
add({
  status: "UNVERIFIED",
  entityId: "*",
  entityType: "system",
  label: "来源覆盖（全库）",
  code: "UNVERIFIED_FACT",
  details: [
    `当前 seed 未携带事实级来源字段（entity_sources 表已建、未填充）`,
    `本轮审计基于内置史学共识知识库抽查 ${KEY_PEOPLE.length} 位关键人物与 ${KEY_EVENTS.length} 个关键事件 + 全部 49 事件/20 地点/40 关系的结构性检查`,
    `人工确认后的来源与修正将写入 entity_sources 与 provenance 字段`,
  ],
  authority: "E",
});

/* ── 3. 统计与报告 ──────────────────────────────────────────────────── */

const counts = { PASS: 0, WARN: 0, CONFLICT: 0, UNVERIFIED: 0 } as Record<AuditStatus, number>;
for (const f of findings) counts[f.status] += 1;

const now = new Date().toISOString().slice(0, 10);
const lines: string[] = [];
lines.push("# AI Global History Map — Historical Data Provenance & Accuracy Audit");
lines.push("");
lines.push(`> 生成日期：${now} · 范围：Functional Alpha 全量 157 实体（重点：关键人物/事件） · 模式：只读审计（未修改任何 seed 数据）`);
lines.push("");
lines.push("## 来源等级定义");
lines.push("");
lines.push("| 等级 | 定义 |");
lines.push("|---|---|");
for (const [k, desc] of Object.entries(AUTHORITY_LEVELS)) {
  lines.push(`| ${k} | ${desc} |`);
}
lines.push("");
lines.push(`## Summary`);
lines.push("");
lines.push(`| 状态 | 数量 |`);
lines.push("|---|---|");
for (const s of ["PASS", "WARN", "CONFLICT", "UNVERIFIED"] as AuditStatus[]) {
  lines.push(`| ${s} | ${counts[s]} |`);
}
lines.push("");
lines.push(`自动矛盾检测：**TEMPORAL_CONFLICT = ${temporalConflicts}**；ROLE_TIMELINE_CONFLICT（角色区间未覆盖）见下。`);
lines.push("");
lines.push("## People（关键人物首批）");
lines.push("");
for (const f of findings.filter((x) => x.entityType === "person")) {
  lines.push(`### ${f.status} ${f.label}`);
  if (f.code) lines.push(`\`${f.code}\``);
  for (const d of f.details) lines.push(`- ${d}`);
  lines.push(`- authority: ${f.authority}`);
  lines.push("");
}
lines.push("## Events（关键事件 + 近似/争议日期标注）");
lines.push("");
for (const f of findings.filter((x) => x.entityType === "event")) {
  lines.push(`- ${f.status} ${f.label}：${f.details.join("；")}${f.authority ? `（authority ${f.authority}）` : ""}`);
}
lines.push("");
lines.push("## Civilizations（名称类型）");
lines.push("");
for (const f of findings.filter((x) => x.entityType === "civilization")) {
  lines.push(`- ${f.status} ${f.label}：${f.details.join("；")}`);
}
lines.push("");
lines.push("## Locations");
lines.push("");
for (const f of findings.filter((x) => x.entityType === "location")) {
  lines.push(`- ${f.status} ${f.label}：${f.details.join("；")}`);
}
lines.push("");
lines.push("## Relationships");
lines.push("");
for (const f of findings.filter((x) => x.entityType === "relationship")) {
  lines.push(`- ${f.status} ${f.label}：${f.details.join("；")}`);
}
lines.push("");
lines.push("## 自动矛盾检测");
lines.push("");
for (const f of findings.filter((x) => x.code === "TEMPORAL_CONFLICT" || x.code === "TEMPORAL_WARN" || x.code === "ROLE_TIMELINE_CONFLICT")) {
  lines.push(`- ${f.status} ${f.code} ${f.label}：${f.details.join("；")}`);
}
if (temporalConflicts === 0) {
  lines.push("- TEMPORAL_CONFLICT：无（所有 participant 的出生/卒年与事件年份一致）");
}
lines.push("");
lines.push("## Charlemagne 专项");
lines.push("");
for (const f of findings.filter((x) => x.label.startsWith("Charlemagne 专项"))) {
  for (const d of f.details) lines.push(`- ${d}`);
}
lines.push("");
lines.push("## V0.2.2 Provenance 深度检查");
lines.push("");
lines.push(`- 检查实体 ${provChecks} 个（关键人物 ${KEY_PEOPLE.length} + 关键事件 ${KEY_EVENTS.length}）：${provMismatch.length === 0 ? "全部 PASS" : provMismatch.length + " 个 WARN"}`);
for (const f of findings.filter((x) => x.code === "PROVENANCE_MISMATCH" || x.code === "MISSING_SOURCES")) {
  lines.push(`- ${f.status} ${f.code} ${f.label}：${f.details.join("；")}`);
}
lines.push("");
lines.push("## 修正建议（待人工确认后才进入 seed）");
lines.push("");
lines.push("1. **Charlemagne 出生年**：seed `747` → 建议标注 `birthYear: 747, birthYearMax: 748, birthPrecision: \"range\", confidence: \"disputed\"`，alternatives 记录 742/747/748；显示“约 747–748，存在学术争议”。");
lines.push("2. **角色字段**：为关键人物引入 `PersonRole[]`（如 Charlemagne 三段角色 768/774/800），UI 与 AI 展示角色时按时间区间呈现，而非静态“Emperor”。");
lines.push("3. **近似日期事件**（`PRECISION_WARN`）：Tikal 741、可萨改宗 740、花拉子米代数学 820、Sulayman 851、玄奘西行 629、杨贵妃入宫 745 等 → 补充 precision 标注，显示“约 X”。");
lines.push("4. **有争议生年**（Wu Zetian 623/624/625、Abu Muslim 700/718/723、Oleg 无载）→ 标注 `disputed/unverified` 与 alternatives。");
lines.push("5. **来源填充**：将本轮知识库的 authority 引用写入 `entity_sources` 表与各实体 provenance 字段。");
lines.push("6. **AI 措辞**：AI 回答涉及 disputed/approximate 事实时使用“存在争议/约/学界普遍认为”等限定语（见 policy 文档第 5 节）。");
lines.push("");
lines.push("## 附注");
lines.push("");
lines.push("- 非关键实体（未列入首批名单者）本轮仅做结构性检查；待下一轮审计扩展。");
lines.push("- 本轮审计未修改任何 seed 数据；全部修正项需人工确认后进入正式数据。");
lines.push("");

const report = lines.join("\n");
writeFileSync(join(process.cwd(), "docs", "history-data-audit.md"), report);

console.log(`✓ audit report → docs/history-data-audit.md`);
console.log(`  PASS ${counts.PASS} · WARN ${counts.WARN} · CONFLICT ${counts.CONFLICT} · UNVERIFIED ${counts.UNVERIFIED}`);
console.log(`  TEMPORAL_CONFLICT: ${temporalConflicts} · Charlemagne 专项: included`);
