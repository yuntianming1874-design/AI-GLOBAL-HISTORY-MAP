import type { ChatMessage, ChatResponse } from "./types";
import {
  EMPTY_CONTEXT,
  type HistoryContext,
  type HistoryEntityLink,
  type HistoryNavigationAction,
} from "./explorer";
import {
  t as translate,
  type Locale,
  type TranslationKey,
} from "./i18n";
import {
  civilizations,
  events,
  locations,
  people,
  relationships,
} from "@/data/seed";
import { zhEventDescriptions } from "@/data/seed/zhEvents";
import {
  zhPersonRoles,
  zhPersonSummaries,
  zhRelationshipDescriptions,
} from "@/data/seed/zhPeopleRelationships";
import {
  zhCivilizationSummaries,
  zhLocationDescriptions,
  zhRegionNames,
} from "@/data/seed/zhMisc";
import { computeContemporaries } from "./contemporaries";
import {
  formatHistoricalDate,
  formatLifespan,
  formatYearSpan,
  type HistoricalDateValue,
} from "./provenance";
import { buildRecommendations } from "./learning/navigator";
import { searchHistoryEntities } from "./search";

/**
 * Pluggable chat engines behind one contract.
 *  - LocalAssistant: offline retrieval over the seed knowledge base with
 *    intent templates (compare / year / relationship / profile) + citations,
 *    context-awareness (V0.2) and structured entity links + navigation
 *    actions in every answer.
 *  - OpenAIAssistant: OpenAI-compatible chat completions (context-aware
 *    system prompt), falls back to the local engine on any failure.
 */

export interface EngineResult {
  reply: string;
  citations: string[];
  links: HistoryEntityLink[];
  actions: HistoryNavigationAction[];
}

export interface Assistant {
  reply(
    messages: ChatMessage[],
    context?: HistoryContext,
    locale?: Locale,
  ): Promise<Omit<ChatResponse, "source" | "recommendations">>;
}

/* ── Local knowledge engine ────────────────────────────────────────── */

interface KnowledgeEntry {
  id: string;
  kind: "person" | "event" | "civilization" | "location";
  name: string;
  aliases: string[];
  year: number | null;
  text: string;
  score: number;
}

const civName = new Map(civilizations.map((c) => [c.id, c.name]));
const civZhName = new Map(civilizations.map((c) => [c.id, c.chineseName]));

/** Locale-aware name/title (zh prefers the Chinese form). */
function n(locale: Locale, en: string, zh: string | null | undefined): string {
  return locale === "zh" && zh ? zh : en;
}
/** Locale-aware body text with graceful fallback to English. */
function txt(locale: Locale, en: string, zh: string | null | undefined): string {
  return locale === "zh" && zh ? zh : en;
}
/** Civilization display name for a locale. */
function civNameOf(locale: Locale, civId: string): string {
  return n(locale, civName.get(civId) ?? civId, civZhName.get(civId));
}
/** Chinese display name of a knowledge entry (for zh answers/labels). */
function zhEntryName(entry: KnowledgeEntry): string | null {
  if (entry.kind === "event") return events.find((e) => e.id === entry.id)?.chineseTitle ?? null;
  if (entry.kind === "person") return people.find((p) => p.id === entry.id)?.chineseName ?? null;
  if (entry.kind === "civilization") return civilizations.find((c) => c.id === entry.id)?.chineseName ?? null;
  return locations.find((l) => l.id === entry.id)?.chineseName ?? null;
}

function buildIndex(): KnowledgeEntry[] {
  const index: KnowledgeEntry[] = [];
  for (const p of people) {
    const civ = p.civilizationId ? civName.get(p.civilizationId) : null;
    index.push({
      id: p.id,
      kind: "person",
      name: p.name,
      aliases: [p.name.toLowerCase(), p.chineseName, p.id, ...(civ ? [civ] : [])],
      year: p.birthYear ?? null,
      text: `${p.name} ${p.chineseName} ${p.role} ${p.summary} ${civ ?? ""} ${p.birthYear ?? ""} ${p.deathYear ?? ""}`.toLowerCase(),
      score: 0,
    });
  }
  for (const e of events) {
    index.push({
      id: e.id,
      kind: "event",
      name: e.title,
      aliases: [
        e.title.toLowerCase(),
        e.chineseTitle,
        ...(e.tags.includes("silk-road") ? ["丝绸之路", "silk road"] : []),
      ],
      year: e.year,
      text: `${e.title} ${e.chineseTitle} ${e.description} ${e.tags.join(" ")} ${civName.get(e.civilizationId) ?? ""}`.toLowerCase(),
      score: 0,
    });
  }
  for (const c of civilizations) {
    index.push({
      id: c.id,
      kind: "civilization",
      name: c.name,
      aliases: [c.name.toLowerCase(), c.chineseName, "tang china", "tang dynasty"],
      year: c.startYear,
      text: `${c.name} ${c.chineseName} ${c.region} ${c.summary} ${c.startYear} ${c.endYear}`.toLowerCase(),
      score: 0,
    });
  }
  for (const l of locations) {
    index.push({
      id: l.id,
      kind: "location",
      name: l.name,
      aliases: [l.name.toLowerCase(), l.chineseName],
      year: null,
      text: `${l.name} ${l.chineseName} ${l.description} ${l.modernCountry}`.toLowerCase(),
      score: 0,
    });
  }
  return index;
}

const KNOWLEDGE = buildIndex();

function tokens(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9\u4e00-\u9fff]+/).filter((t) => t.length > 1);
}

const GENERIC_WORDS = new Set([
  "the",
  "and",
  "of",
  "for",
  "vs",
  "caliphate",
  "dynasty",
  "empire",
  "kingdom",
  "era",
  "age",
  "period",
  "china",
  "japan",
]);

const KIND_RANK: Record<KnowledgeEntry["kind"], number> = {
  civilization: 0,
  person: 1,
  event: 2,
  location: 3,
};

function matchEntities(query: string, limit = 4): KnowledgeEntry[] {
  // V0.2.1: ordered retrieval first — exact name → alias → name contains;
  // only fall back to token full-text scoring when those miss.
  const ordered = searchHistoryEntities(query, limit);
  if (ordered.length > 0 && ordered[0].stage <= 3) {
    return ordered
      .map((hit) => {
        const entry = KNOWLEDGE.find((k) => k.id === hit.id);
        if (entry) entry.score = 1000 - hit.stage * 100;
        return entry;
      })
      .filter((e): e is KnowledgeEntry => e !== null);
  }
  const qTokens = tokens(query);
  const qText = query.toLowerCase();
  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const alias of entry.aliases) {
      if (alias.length > 1 && qText.includes(alias)) score += alias.length * 4;
    }
    for (const t of qTokens) {
      if (entry.text.includes(t)) score += t.length;
      // name bonus: significant words in the entry's own name
      if (t.length >= 4 && !GENERIC_WORDS.has(t) && entry.name.toLowerCase().includes(t)) {
        score += t.length * 6;
      }
    }
    entry.score = score;
  }
  return [...KNOWLEDGE]
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score || KIND_RANK[a.kind] - KIND_RANK[b.kind])
    .slice(0, limit);
}

function findPerson(name: string) {
  const q = name.toLowerCase();
  return people.find(
    (p) =>
      p.name.toLowerCase() === q ||
      p.chineseName === name ||
      p.name.toLowerCase().includes(q) ||
      q.includes(p.name.toLowerCase()),
  );
}

/** Civilization id of a knowledge entry (null for locations/pre-state figures). */
function civOf(entry: KnowledgeEntry): string | null {
  if (entry.kind === "civilization") return entry.id;
  if (entry.kind === "event") {
    return events.find((e) => e.id === entry.id)?.civilizationId ?? null;
  }
  if (entry.kind === "person") {
    return people.find((p) => p.id === entry.id)?.civilizationId ?? null;
  }
  return null;
}

function personLines(id: string, locale: Locale = "en"): string[] {
  const rels = relationships.filter(
    (r) => r.sourcePersonId === id || r.targetPersonId === id,
  );
  return rels.slice(0, 6).map((r) => {
    const other = r.sourcePersonId === id ? r.targetPersonId : r.sourcePersonId;
    const op = people.find((p) => p.id === other);
    const otherName = op ? n(locale, op.name, op.chineseName) : other;
    return `• ${translate(locale, `rel.${r.type}` as TranslationKey)}: ${otherName} — ${txt(locale, r.description, zhRelationshipDescriptions[r.id])}`;
  });
}

function personEvents(id: string, locale: Locale = "en"): string[] {
  return events
    .filter((e) => e.participants.includes(id))
    .sort((a, b) => a.year - b.year)
    .slice(0, 5)
    .map((e) => `• ${eventDateText(e, locale)} — ${n(locale, e.title, e.chineseTitle)}`);
}

/* ── structured links / actions builders ───────────────────────────── */

function eventLink(id: string, locale: Locale = "en"): HistoryEntityLink | null {
  const e = events.find((x) => x.id === id);
  return e ? { id, type: "event", label: n(locale, e.title, e.chineseTitle) } : null;
}

function personLink(id: string, locale: Locale = "en"): HistoryEntityLink | null {
  const p = people.find((x) => x.id === id);
  return p ? { id, type: "person", label: n(locale, p.name, p.chineseName) } : null;
}

function locationLink(id: string, locale: Locale = "en"): HistoryEntityLink | null {
  const l = locations.find((x) => x.id === id);
  return l ? { id, type: "location", label: n(locale, l.name, l.chineseName) } : null;
}

function linkFor(entry: KnowledgeEntry, locale: Locale = "en"): HistoryEntityLink {
  return { id: entry.id, type: entry.kind, label: n(locale, entry.name, zhEntryName(entry)) };
}

/** Navigation actions relevant to a single entity (V0.2.1: FOCUS_* family). */
function actionsFor(entry: KnowledgeEntry): HistoryNavigationAction[] {
  switch (entry.kind) {
    case "event": {
      const e = events.find((x) => x.id === entry.id);
      const actions: HistoryNavigationAction[] = [{ type: "OPEN_EVENT", id: entry.id }];
      if (e?.locationId) {
        actions.push({
          type: "FOCUS_MAP",
          locationId: e.locationId,
          eventId: entry.id,
          year: e.year,
        });
      }
      actions.push({
        type: "FOCUS_TIMELINE",
        year: e?.year,
        entityId: entry.id,
        entityType: "event",
      });
      return actions;
    }
    case "person": {
      const p = people.find((x) => x.id === entry.id);
      const actions: HistoryNavigationAction[] = [
        { type: "OPEN_PERSON", id: entry.id },
        { type: "FOCUS_PERSON_GRAPH", personId: entry.id },
      ];
      actions.push({
        type: "FOCUS_TIMELINE",
        startYear: p?.birthYear ?? undefined,
        endYear: p?.deathYear ?? undefined,
        entityId: entry.id,
        entityType: "person",
      });
      return actions;
    }
    case "civilization": {
      const c = civilizations.find((x) => x.id === entry.id);
      return [
        { type: "FOCUS_CIVILIZATION", id: entry.id },
        { type: "FOCUS_TIMELINE", startYear: c?.startYear, endYear: c?.endYear },
      ];
    }
    case "location":
      return [{ type: "FOCUS_MAP", locationId: entry.id }];
  }
}

function personEntry(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((k) => k.kind === "person" && k.id === id) ?? null;
}
function eventEntry(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((k) => k.kind === "event" && k.id === id) ?? null;
}
function civEntry(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((k) => k.kind === "civilization" && k.id === id) ?? null;
}
function locationEntry(id: string): KnowledgeEntry | null {
  return KNOWLEDGE.find((k) => k.kind === "location" && k.id === id) ?? null;
}

/* ── AI 不确定性措辞规则（V0.2.2）────────────────────────────────────────
 * disputed → “存在学术争议 / 通常认为 / 一些研究认为”
 * unknown → “现有可靠资料无法确定”
 * 所有年份一律经 formatHistoricalDate / formatYearSpan / formatLifespan 输出。
 */

function uncertaintySentence(
  label: string,
  v: HistoricalDateValue | undefined,
  locale: Locale,
): string | null {
  if (!v) return null;
  if (v.confidence === "disputed") {
    const alts = v.alternatives?.length
      ? `（${v.alternatives.join(" / ")}）`
      : "";
    return locale === "zh"
      ? `${label}${alts}——该说法存在学术争议：通常认为 ${v.year ?? "?"} 年，一些研究认为其他年份，现有资料无法完全确定。`
      : `${label}${alts} — scholarly consensus is disputed: commonly ${v.year ?? "?"}, though other dates have been proposed.`;
  }
  if (v.precision === "unknown") {
    return locale === "zh"
      ? `${label}——现有可靠资料无法确定，学界亦无共识。`
      : `${label} — no reliable surviving source establishes it; scholars have no consensus.`;
  }
  return null;
}

function personUncertaintyLines(p: { id: string; provenance?: { birth?: HistoricalDateValue; death?: HistoricalDateValue } }, locale: Locale): string[] {
  const out: string[] = [];
  for (const [label, v] of [
    [locale === "zh" ? "出生年份" : "Birth year", p.provenance?.birth],
    [locale === "zh" ? "卒年" : "Death year", p.provenance?.death],
  ] as const) {
    const line = uncertaintySentence(label, v, locale);
    if (line) out.push(`> ${line}`);
  }
  return out;
}

function eventDateText(e: { year: number; yearEnd: number | null; dateProvenance?: HistoricalDateValue }, locale: Locale): string {
  return formatYearSpan(e.year, e.yearEnd, e.dateProvenance, locale);
}

/* ── answer builders ───────────────────────────────────────────────── */

function profileAnswer(entry: KnowledgeEntry, locale: Locale = "en"): EngineResult {
  if (entry.kind === "person") {
    const p = people.find((x) => x.id === entry.id)!;
    const civ = p.civilizationId ? civNameOf(locale, p.civilizationId) : "early Islamic world";
    const years = formatLifespan(p.provenance?.birth, p.provenance?.death, locale);
    const lines = personLines(p.id, locale);
    const evs = personEvents(p.id, locale);
    const roleLabelZh = (role: string) => {
      // 中英混合名 "King of the Franks 法兰克国王" → 取末尾中文段
      const tokens = role.split(" ");
      const zhToken = tokens.find((tk) => /[\u4e00-\u9fff]/.test(tk));
      if (zhToken) return zhToken;
      return role;
    };
    const roles = (p.provenance?.roles ?? []).map((r) =>
      locale === "zh"
        ? `\u2022 ${roleLabelZh(r.role)}：${formatHistoricalDate(r.validFrom, locale)}${
            r.validTo ? `\u2013${formatHistoricalDate(r.validTo, locale)}` : ""
          }`
        : `\u2022 ${r.role}: ${formatHistoricalDate(r.validFrom, locale)}${
            r.validTo ? `\u2013${formatHistoricalDate(r.validTo, locale)}` : ""
          }`,
    );
    return {
      reply: [
        `**${n(locale, p.name, p.chineseName)}** — ${txt(locale, p.role, zhPersonRoles[p.id])}, ${civ}, ${years}`,
        txt(locale, p.summary, zhPersonSummaries[p.id]),
        ...personUncertaintyLines(p, locale),
        "",
        ...(roles.length ? [translate(locale, "eng.keyRoles"), ...roles] : []),
        ...(lines.length ? [translate(locale, "eng.keyRelationships"), ...lines] : []),
        ...(evs.length ? [translate(locale, "eng.keyEvents"), ...evs] : []),
      ].join("\n"),
      citations: [p.id],
      links: [linkFor(entry, locale)],
      actions: actionsFor(entry),
    };
  }
  if (entry.kind === "event") {
    const e = events.find((x) => x.id === entry.id)!;
    const civ = civNameOf(locale, e.civilizationId);
    const links: HistoryEntityLink[] = [linkFor(entry, locale)];
    const actions: HistoryNavigationAction[] = actionsFor(entry);
    if (e.locationId) {
      const loc = locationLink(e.locationId, locale);
      if (loc) links.push(loc);
    }
    for (const pid of e.participants) {
      const pl = personLink(pid, locale);
      if (pl) links.push(pl);
    }
    return {
      reply: [
        `**${n(locale, e.title, e.chineseTitle)}** — ${eventDateText(e, locale)}, ${civ}`,
        txt(locale, e.description, zhEventDescriptions[e.id]),
        "",
        translate(locale, "eng.categorySig", {
          cat: translate(locale, `cat.${e.category}` as TranslationKey),
          stars: "★".repeat(e.significance) + "☆".repeat(5 - e.significance),
        }),
      ].join("\n"),
      citations: [e.id],
      links,
      actions,
    };
  }
  if (entry.kind === "civilization") {
    const c = civilizations.find((x) => x.id === entry.id)!;
    return {
      reply: [
        `**${n(locale, c.name, c.chineseName)}** — ${txt(locale, c.region, zhRegionNames[c.region])}, ${c.startYear}–${c.endYear}`,
        txt(locale, c.summary, zhCivilizationSummaries[c.id]),
      ].join("\n"),
      citations: [c.id],
      links: [linkFor(entry, locale)],
      actions: actionsFor(entry),
    };
  }
  const l = locations.find((x) => x.id === entry.id)!;
  return {
    reply: `**${n(locale, l.name, l.chineseName)}** — ${l.modernCountry}\n${txt(locale, l.description, zhLocationDescriptions[l.id])}`,
    citations: [l.id],
    links: [linkFor(entry, locale)],
    actions: actionsFor(entry),
  };
}

function compareAnswer(
  a: KnowledgeEntry,
  b: KnowledgeEntry,
  locale: Locale = "en",
): EngineResult {
  const aPerson = findPerson(a.name);
  const bPerson = findPerson(b.name);
  const direct =
    aPerson && bPerson
      ? relationships.filter(
          (r) =>
            (r.sourcePersonId === aPerson.id && r.targetPersonId === bPerson.id) ||
            (r.sourcePersonId === bPerson.id && r.targetPersonId === aPerson.id),
        )
      : [];
  let connection: string;
  if (direct.length > 0) {
    connection = direct.map((r) => `• ${r.type}: ${r.description}`).join("\n");
  } else if (a.kind === "civilization" && b.kind === "civilization") {
    const cross = events
      .filter((e) => {
        const other = e.civilizationId === a.id ? b : a;
        const otherName = other.name.split(" ")[0].toLowerCase();
        return (
          otherName.length >= 4 &&
          (e.description + " " + e.tags.join(" ")).toLowerCase().includes(otherName)
        );
      })
      .slice(0, 4);
    connection =
      cross.length > 0
        ? cross.map((e) => `• ${eventDateText(e, locale)} — ${n(locale, e.title, e.chineseTitle)} ${locale === "zh" ? "连接了两个世界" : "connects both worlds"}`).join("\n")
        : locale === "zh"
          ? "数据集中没有记录它们之间的直接关联。"
          : "No direct connection recorded in our dataset.";
  } else {
    connection = locale === "zh"
      ? "数据集中没有记录他们之间的直接关系。"
      : "No direct relationship recorded between them in our dataset.";
  }

  return {
    reply: [
      `**${n(locale, a.name, zhEntryName(a))}** vs **${n(locale, b.name, zhEntryName(b))}**`,
      "",
      profileAnswer(a, locale).reply,
      "",
      profileAnswer(b, locale).reply,
      "",
      translate(locale, "eng.connection"),
      connection,
    ].join("\n"),
    citations: [a.id, b.id],
    links: [linkFor(a, locale), linkFor(b, locale)],
    actions: [...actionsFor(a), ...actionsFor(b)],
  };
}

const SUGGESTED = [
  "What happened in 755?",
  "Who was Li Bai?",
  "Compare Tang China and the Abbasid Caliphate",
  "Relationship between Li Bai and Du Fu",
  "Timeline of the Tang Dynasty",
  "What was the Silk Road?",
];

/**
 * Causal-chain edges (V0.2). Every link is traceable to the seed
 * descriptions themselves — no invented causation:
 *   from → to, note = the sentence/claim in the dataset that supports it.
 */
const CAUSAL_LINKS: { from: string; to: string; note: string; zhNote: string }[] = [
  {
    from: "e-632-muhammad-dies",
    to: "e-634-arab-conquests",
    note: "Abu Bakr's succession 'launch[ed] the wars of conquest' (632 description).",
    zhNote: "阿布·伯克尔继任哈里发后，发动了征服战争（632 年描述）。",
  },
  {
    from: "e-634-arab-conquests",
    to: "e-661-umayyad-founded",
    note: "The conquests consolidated the caliphate, which became the 'first hereditary Muslim empire' (661 description).",
    zhNote: "征服巩固了哈里发国家，使其成为“首个世袭穆斯林帝国”（661 年描述）。",
  },
  {
    from: "e-711-umayyad-iberia",
    to: "e-732-tours",
    note: "Tours 'halted Muslim expansion into western Europe' that began with the conquest of Iberia (732 description).",
    zhNote: "图尔战役“阻止了穆斯林向西欧的扩张”，而这场扩张始于对伊比利亚的征服（732 年描述）。",
  },
  {
    from: "e-745-yang-guifei",
    to: "e-755-anlushan",
    note: "The court corruption around Yang Guifei 'helped set the stage for the An Lushan Rebellion' (745 description).",
    zhNote: "杨贵妃周围的朝廷腐败“为安史之乱埋下了伏笔”（745 年描述）。",
  },
  {
    from: "e-755-anlushan",
    to: "e-763-tibetans-changan",
    note: "'Exploiting the chaos of the An Lushan Rebellion,' the Tibetans seized Chang'an (763 description).",
    zhNote: "吐蕃“利用安史之乱的混乱”攻占了长安（763 年描述）。",
  },
  {
    from: "e-750-abbasid-revolution",
    to: "e-762-baghdad",
    note: "The Abbasids built their new capital: Baghdad was founded by 'the Abbasid caliph al-Mansur' (762 description).",
    zhNote: "阿拔斯人营建了新都：巴格达由“阿拔斯哈里发曼苏尔”始建（762 年描述）。",
  },
  {
    from: "e-793-lindisfarne",
    to: "e-885-vikings-paris",
    note: "Lindisfarne opened the Viking Age, 'for the next three centuries' of raids culminating in the siege of Paris (793 description).",
    zhNote: "林迪斯法恩开启了维京时代，“此后三个世纪”的劫掠以围攻巴黎告终（793 年描述）。",
  },
  {
    from: "e-690-wu-zetian-zhou",
    to: "e-705-wu-zetian-abdication",
    note: "The Zhou interregnum ended when Wu Zetian was forced to abdicate (705 description).",
    zhNote: "武则天被迫退位，武周政权随之终结（705 年描述）。",
  },
  {
    from: "e-768-charlemagne-king",
    to: "e-800-charlemagne-emperor",
    note: "Charlemagne 'launched the campaigns that built the largest western European empire since Rome' — crowned in 800 (768 description).",
    zhNote: "查理曼“发动了征伐，建立起自罗马以来西欧最大的帝国”——并于 800 年加冕（768 年描述）。",
  },
  {
    from: "e-875-huang-chao",
    to: "e-907-fall-of-tang",
    note: "Huang Chao's war 'broke the Tang fiscally and militarily for good'; the dynasty fell in 907 (875 description).",
    zhNote: "黄巢之乱“在财政与军事上彻底击垮了唐朝”；907 年唐亡（875 年描述）。",
  },
];

const CAUSAL_QUERY =
  /(caus|lead to|led to|lead to|result|consequence|impact|why did|what caused|triggered|原因|导致|影响|结果|引发)/i;

/** Human-readable description of the current exploration context. */
function describeContext(context: HistoryContext | undefined, locale: Locale = "en"): string | null {
  if (!context) return null;
  const parts: string[] = [];
  if (context.year !== null && context.year !== undefined) parts.push(`year ${context.year}`);
  const entryName = (e: KnowledgeEntry | null, fallback: string) => (e ? n(locale, e.name, zhEntryName(e)) : fallback);
  if (context.eventId) parts.push(`event "${entryName(eventEntry(context.eventId), context.eventId)}"`);
  if (context.personId) parts.push(`person "${entryName(personEntry(context.personId), context.personId)}"`);
  if (context.civilizationId) parts.push(`civilization "${entryName(civEntry(context.civilizationId), context.civilizationId)}"`);
  if (context.locationId) parts.push(`location "${entryName(locationEntry(context.locationId), context.locationId)}"`);
  return parts.length > 0 ? parts.join(", ") : null;
}

const GENERIC_CONTEXT_QUERY =
  /(explain|why|about this|this event|this person|this place|here|happened|significance|significant|important|matter|tell me more|详细|为什么|这里|这个)/i;

/** Localized "try asking" suggestion list (mirrors the chat UI chips). */
function localizedSuggestions(locale: Locale): string[] {
  return [0, 1, 2, 3, 4, 5].map((i) =>
    translate(locale, (`chat.sugg.${i}`) as TranslationKey),
  );
}

class LocalAssistant implements Assistant {
  async reply(
    messages: ChatMessage[],
    context?: HistoryContext,
    locale: Locale = "en",
  ): Promise<Omit<ChatResponse, "source" | "recommendations">> {
    const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
    const q = last.trim();
    const qLower = q.toLowerCase();

    /* 0. Context-aware: user asks generically about what they're viewing */
    if (context && GENERIC_CONTEXT_QUERY.test(q) && q.length < 90) {
      if (context.eventId) {
        const entry = eventEntry(context.eventId);
        if (entry) {
          const base = profileAnswer(entry, locale);
          const e = events.find((x) => x.id === context.eventId)!;
          const world = events
            .filter((x) => x.civilizationId !== e.civilizationId && Math.abs(x.year - e.year) <= 5)
            .sort((a, b) => a.significance - b.significance)
            .slice(0, 3);
          return {
            ...base,
            reply: [
              base.reply,
              "",
              ...(world.length
                ? [translate(locale, "eng.meanwhile"), ...world.map((x) => `• ${eventDateText(x, locale)} — **${n(locale, x.title, x.chineseTitle)}** (${civNameOf(locale, x.civilizationId)})`)]
                : []),
            ].join("\n"),
          };
        }
      }
      if (context.personId && !context.eventId) {
        const entry = personEntry(context.personId);
        if (entry) {
          const p = people.find((x) => x.id === context.personId)!;
          const cons = computeContemporaries(p.id, people, events).slice(0, 6);
          const base = profileAnswer(entry, locale);
          return {
            ...base,
            reply: [
              base.reply,
              "",
              cons.length
                ? [translate(locale, "eng.contemporaries"), ...cons.map((c) => `• ${n(locale, c.name, c.chineseName)} (${c.role})`)]
                : [],
            ].join("\n"),
          };
        }
      }
      if (context.locationId && !context.eventId && !context.personId) {
        const entry = locationEntry(context.locationId);
        if (entry) {
          const here = events
            .filter((e) => e.locationId === context.locationId)
            .slice(0, 5);
          const base = profileAnswer(entry, locale);
          return {
            ...base,
            reply: [
              base.reply,
              "",
              ...(here.length ? [translate(locale, "eng.keyEventsHere"), ...here.map((e) => `• ${eventDateText(e, locale)} — **${n(locale, e.title, e.chineseTitle)}**`)] : []),
            ].join("\n"),
          };
        }
      }
      if (context.civilizationId) {
        const entry = civEntry(context.civilizationId);
        if (entry) {
          const evs = events
            .filter((e) => e.civilizationId === context.civilizationId)
            .sort((a, b) => b.significance - a.significance)
            .slice(0, 5);
          const base = profileAnswer(entry, locale);
          return {
            ...base,
            reply: [
              base.reply,
              "",
              ...(evs.length ? [translate(locale, "eng.keyEvents"), ...evs.map((e) => `• ${eventDateText(e, locale)} — **${n(locale, e.title, e.chineseTitle)}**`)] : []),
            ].join("\n"),
          };
        }
      }
    }

    /* 0b. Contemporaries question */
    if (/(contemporar|同时代|同代人)/.test(qLower)) {
      const hits = matchEntities(q, 4).filter((e) => e.kind === "person");
      const target = hits[0] ?? (context?.personId ? personEntry(context.personId) : null);
      if (target) {
        const p = people.find((x) => x.id === target.id)!;
        const cons = computeContemporaries(p.id, people, events);
        return {
          reply: [
            translate(locale, "eng.contemporariesOf", { name: n(locale, p.name, p.chineseName) }),
            ...(cons.length
              ? cons.slice(0, 12).map((c) => {
                  const civ = c.civilizationId ? civNameOf(locale, c.civilizationId) : null;
                  return `• ${n(locale, c.name, c.chineseName)}${civ ? ` (${civ})` : ""} — ${c.role}, ${formatLifespan(c.provenance?.birth, c.provenance?.death, locale)}`;
                })
              : [translate(locale, "eng.noContemporaries")]),
          ].join("\n"),
          citations: [p.id],
          links: [linkFor(target, locale), ...cons.slice(0, 6).map((c) => personLink(c.id, locale)).filter((l): l is HistoryEntityLink => l !== null)],
          actions: [{ type: "OPEN_PERSON", id: p.id }],
        };
      }
    }

    // 1. Compare intent
    if (/(\b(compare|comparison|vs\.?|versus)\b)|对比|比较/.test(qLower)) {
      const hits = matchEntities(q, 6).filter((e) => e.kind !== "location");
      const a = hits[0];
      if (a) {
        const aCiv = civOf(a);
        const b =
          hits.find((h) => h.id !== a.id && civOf(h) !== aCiv) ??
          hits.find((h) => h.id !== a.id);
        if (b) return compareAnswer(a, b, locale);
      }
    }

    // 1b. Causal chain intent (V0.2): "What caused X?" / "impact of X"
    if (CAUSAL_QUERY.test(qLower)) {
      const hits = matchEntities(q, 6).filter((e) => e.kind === "event");
      const target = hits[0];
      if (target) {
        const e = events.find((x) => x.id === target.id)!;
        // "what led to X" / "why did X" → causes (backward);
        // "impact of X" / "X led to…" → consequences (forward)
        const backward =
          /(what led to|what caused|what triggered|why did|原因|为什么|起因)/i.test(qLower);
        const forward =
          !backward &&
          /(led to|lead to|impact|result|consequence|导致|影响|结果|后果|造成了)/i.test(qLower);
        const chain = backward
          ? CAUSAL_LINKS.filter((l) => l.to === target.id)
          : forward
            ? CAUSAL_LINKS.filter((l) => l.from === target.id)
            : [];
        const linked = chain
          .map((l) => {
            const id = forward ? l.to : l.from;
            const ev = events.find((x) => x.id === id);
            return ev
              ? { event: ev, note: l.note, zhNote: l.zhNote }
              : null;
          })
          .filter(
            (x): x is { event: (typeof events)[number]; note: string; zhNote: string } =>
              x !== null,
          );
        if (chain.length > 0) {
          return {
            reply: [
              forward
                ? translate(locale, "eng.ledTo", { title: n(locale, e.title, e.chineseTitle), year: e.year })
                : translate(locale, "eng.whatLedTo", { title: n(locale, e.title, e.chineseTitle), year: e.year }),
              ...linked.map(
                (x) =>
                  `• ${eventDateText(x.event, locale)} — **${n(locale, x.event.title, x.event.chineseTitle)}**: ${locale === "zh" ? x.zhNote : x.note}`,
              ),
            ].join("\n"),
            citations: [target.id, ...linked.map((x) => x.event.id)],
            links: [
              linkFor(target, locale),
              ...linked
                .map((x) => eventLink(x.event.id, locale))
                .filter((l): l is HistoryEntityLink => l !== null),
            ],
            actions: [
              { type: "OPEN_EVENT", id: target.id },
              ...linked.slice(0, 2).map((x) => ({ type: "OPEN_EVENT" as const, id: x.event.id })),
            ],
          };
        }
      }
    }

    // 2. Year query
    const yearMatch = q.match(/\b(\d{3,4})\b/);
    if (yearMatch && /(what happened|happened|happen(ed|ing)?|events?|occurred|在|年)/.test(qLower)) {
      const year = Number(yearMatch[1]);

      // 2b. World snapshot: query mentions regions/world → one anchor event
      // per major civilization within ±25 years (Demo 3: China + Europe in 751)
      if (/(china|europe|world|across|around the world|中国|欧洲|世界|同时)/i.test(qLower)) {
        const anchors: { civId: string; label: string; zhLabel: string }[] = [
          { civId: "c-tang", label: "Tang China", zhLabel: "唐朝中国" },
          { civId: "c-abbasid", label: "Abbasid Caliphate", zhLabel: "阿拔斯王朝" },
          { civId: "c-byzantium", label: "Byzantine Empire", zhLabel: "拜占庭帝国" },
          { civId: "c-carolingian", label: "Carolingian world", zhLabel: "加洛林世界" },
        ];
        const rows: string[] = [];
        const cited: string[] = [];
        for (const anchor of anchors) {
          const best = events
            .filter(
              (e) =>
                e.civilizationId === anchor.civId && Math.abs(e.year - year) <= 25,
            )
            .sort((a, b) => b.significance - a.significance || Math.abs(a.year - year) - Math.abs(b.year - year))[0];
          if (best) {
            rows.push(
              `• **${n(locale, anchor.label, anchor.zhLabel)}** (${best.year}): ${n(locale, best.title, best.chineseTitle)} — ${
                locale === "zh"
                  ? txt(locale, best.description, zhEventDescriptions[best.id])
                  : txt(locale, best.description, zhEventDescriptions[best.id]).split(".")[0] + "."
              }`,
            );
            cited.push(best.id);
          }
        }
        if (rows.length >= 2) {
          return {
            reply: [translate(locale, "eng.worldSnapshot", { year }), ...rows].join("\n"),
            citations: cited,
            links: cited.map((id) => eventLink(id, locale)).filter((l): l is HistoryEntityLink => l !== null),
            actions: [{ type: "FOCUS_TIMELINE", year }],
          };
        }
      }

      const near = events
        .filter((e) => Math.abs(e.year - year) <= 2)
        .sort((a, b) => a.year - b.year)
        .slice(0, 7);
      if (near.length > 0) {
        return {
          reply: [
            translate(locale, "eng.eventsAround", { year }),
            ...near.map(
              (e) =>
                `• ${eventDateText(e, locale)} — **${n(locale, e.title, e.chineseTitle)}** (${civNameOf(locale, e.civilizationId)}): ${
                  locale === "zh"
                    ? txt(locale, e.description, zhEventDescriptions[e.id])
                    : txt(locale, e.description, zhEventDescriptions[e.id]).split(".")[0] + "."
                }`,
            ),
          ].join("\n"),
          citations: near.map((e) => e.id),
          links: near.map((e) => eventLink(e.id, locale)).filter((l): l is HistoryEntityLink => l !== null),
          actions: [{ type: "FOCUS_TIMELINE", year }],
        };
      }
    }

    // 3. Relationship / connection between people
    if (/(\b(relationship|relation|between|connect(ed|ion)?|linked)\b)|关系|之间|相关/.test(qLower)) {
      const hits = matchEntities(q, 8).filter((e) => e.kind === "person" && e.score >= 6);
      const a = hits[0];
      // two clearly-named people → pair answer; otherwise → "who is connected to X"
      const b =
        a && hits.find((h) => h.id !== a.id && h.score >= a.score * 0.6);
      if (a && b) {
        const pa = people.find((p) => p.id === a.id)!;
        const pb = people.find((p) => p.id === b.id)!;
        const direct = relationships.filter(
          (r) =>
            (r.sourcePersonId === pa.id && r.targetPersonId === pb.id) ||
            (r.sourcePersonId === pb.id && r.targetPersonId === pa.id),
        );
        const shared = relationships.filter(
          (r) =>
            (r.sourcePersonId === pa.id || r.targetPersonId === pa.id) &&
            (r.sourcePersonId === pb.id || r.targetPersonId === pb.id) &&
            r.sourcePersonId !== pa.id &&
            r.targetPersonId !== pa.id,
        );
        return {
          reply: [
            `**${n(locale, pa.name, pa.chineseName)}** 与 **${n(locale, pb.name, pb.chineseName)}**`,
            direct.length
              ? direct.map((r) => `• ${translate(locale, `rel.${r.type}` as TranslationKey)}: ${txt(locale, r.description, zhRelationshipDescriptions[r.id])}`).join("\n")
              : translate(locale, "eng.noConnection"),
            ...(shared.length ? ["", translate(locale, "eng.sharedConnections"), ...shared.map((r) => `• ${txt(locale, r.description, zhRelationshipDescriptions[r.id])}`)] : []),
          ].join("\n"),
          citations: [pa.id, pb.id],
          links: [linkFor(a, locale), linkFor(b, locale)],
          actions: [
            { type: "OPEN_PERSON", id: pa.id },
            { type: "OPEN_PERSON", id: pb.id },
          ],
        };
      }
      if (a) {
        const pa = people.find((p) => p.id === a.id)!;
        const rels = relationships
          .filter((r) => r.sourcePersonId === pa.id || r.targetPersonId === pa.id)
          .map((r) => {
            const oid = r.sourcePersonId === pa.id ? r.targetPersonId : r.sourcePersonId;
            return { rel: r, other: people.find((p) => p.id === oid)! };
          })
          .slice(0, 8);
        return {
          reply: [
            translate(locale, "eng.peopleConnectedTo", { name: n(locale, pa.name, pa.chineseName) }),
            ...(rels.length
              ? rels.map(
                  ({ rel, other }) =>
                    `• ${n(locale, other.name, other.chineseName)} (${translate(locale, `rel.${rel.type}` as TranslationKey)}) — ${txt(locale, rel.description, rel.zhDescription).split(".")[0]}.`,
                )
              : [locale === "zh" ? "数据集中没有记录相关人物。" : "No connections recorded in the dataset."]),
          ].join("\n"),
          citations: [pa.id, ...rels.map((r) => r.other.id)],
          links: [
            linkFor(a, locale),
            ...rels.map((r) => personLink(r.other.id, locale)).filter((l): l is HistoryEntityLink => l !== null),
          ],
          actions: [
            { type: "OPEN_PERSON", id: pa.id },
            ...rels.slice(0, 3).map((r) => ({ type: "OPEN_PERSON" as const, id: r.other.id })),
          ],
        };
      }
    }

    // 4. Timeline intent
    if (/(timeline|history of|chronicle|年表|历史)/.test(qLower)) {
      const hits = matchEntities(q, 6).filter((e) => e.kind === "civilization" || e.kind === "person");
      const target = hits[0];
      if (target?.kind === "civilization") {
        const evs = events
          .filter((e) => e.civilizationId === target.id)
          .sort((a, b) => a.year - b.year)
          .slice(0, 10);
        return {
          reply: [
            translate(locale, "eng.timelineOf", { name: n(locale, target.name, zhEntryName(target)) }),
            ...evs.map((e) => `• ${eventDateText(e, locale)} — ${n(locale, e.title, e.chineseTitle)}`),
          ].join("\n"),
          citations: [target.id, ...evs.map((e) => e.id)],
          links: [linkFor(target, locale), ...evs.map((e) => eventLink(e.id, locale)).filter((l): l is HistoryEntityLink => l !== null)],
          actions: evs[0]
            ? [{ type: "FOCUS_TIMELINE", year: evs[0].year }]
            : [],
        };
      }
    }

    // 5. Entity profile (who/what/tell me)
    if (/(who|what|tell me|about|introduce|是谁|什么是|介绍)/.test(qLower) || qLower.length > 2) {
      const hits = matchEntities(q, 4);
      if (hits[0] && hits[0].score >= 6) {
        return profileAnswer(hits[0], locale);
      }
    }

    // 6. Greeting
    if (/^(hi|hello|hey|hola)\b/.test(qLower) || /^(你好|嗨)/.test(q)) {
      return {
        reply: [
          translate(locale, "eng.greeting"),
          "",
          translate(locale, "eng.tryAsking"),
          ...localizedSuggestions(locale).map((s) => `• ${s}`),
        ].join("\n"),
        citations: [],
        links: [],
        actions: [],
      };
    }

    // 7. Fallback
    const hits = matchEntities(q, 3);
    if (hits[0]) return profileAnswer(hits[0], locale);
    return {
      reply: [
        translate(locale, "eng.fallback"),
        "",
        translate(locale, "eng.tryAsking"),
        ...localizedSuggestions(locale).map((s) => `• ${s}`),
      ].join("\n"),
      citations: [],
      links: [],
      actions: [],
    };
  }
}

/* ── OpenAI engine ─────────────────────────────────────────────────── */

const KNOWN_IDS = new Set<string>([
  ...civilizations.map((c) => c.id),
  ...events.map((e) => e.id),
  ...people.map((p) => p.id),
  ...locations.map((l) => l.id),
]);

const ENTITY_CATALOG = [
  ...civilizations.map((c) => `${c.id} | ${c.name} | civilization`),
  ...events.map((e) => `${e.id} | ${e.title} (${e.year}) | event`),
  ...people.map((p) => `${p.id} | ${p.name} | person`),
  ...locations.map((l) => `${l.id} | ${l.name} | location`),
].join("\n");

const LINK_TYPES = new Set(["event", "person", "civilization", "location", "territory"]);

/** Validate + sanitize the model's JSON answer (defensive against bad ids). */
function parseEngineJson(raw: string): Omit<ChatResponse, "source" | "recommendations"> | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const obj = data as { reply?: unknown; links?: unknown; actions?: unknown };
  if (typeof obj.reply !== "string" || obj.reply.trim() === "") return null;

  const links: HistoryEntityLink[] = [];
  if (Array.isArray(obj.links)) {
    for (const l of obj.links) {
      if (typeof l !== "object" || l === null) continue;
      const { id, type, label } = l as { id?: unknown; type?: unknown; label?: unknown };
      if (
        typeof id === "string" &&
        KNOWN_IDS.has(id) &&
        typeof type === "string" &&
        LINK_TYPES.has(type)
      ) {
        links.push({
          id,
          type: type as HistoryEntityLink["type"],
          label: typeof label === "string" && label.trim() ? label.trim() : undefined,
        });
      }
    }
  }

  const actions: HistoryNavigationAction[] = [];
  if (Array.isArray(obj.actions)) {
    for (const a of obj.actions) {
      if (typeof a !== "object" || a === null) continue;
      const { type, id, year } = a as { type?: unknown; id?: unknown; year?: unknown };
      switch (type) {
        case "OPEN_EVENT":
        case "OPEN_PERSON":
        case "OPEN_LOCATION":
        case "FOCUS_CIVILIZATION":
          if (typeof id === "string" && KNOWN_IDS.has(id)) {
            actions.push({ type, id } as HistoryNavigationAction);
          }
          break;
        case "SET_YEAR":
          if (typeof year === "number" && Number.isFinite(year)) {
            actions.push({ type: "SET_YEAR", year: Math.round(year) });
          }
          break;
        default:
          break;
      }
    }
  }

  return { reply: obj.reply.trim(), citations: [], links, actions };
}

class OpenAIAssistant implements Assistant {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY!;
    this.baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }

  async reply(
    messages: ChatMessage[],
    context?: HistoryContext,
    locale: Locale = "en",
  ): Promise<Omit<ChatResponse, "source" | "recommendations">> {
    const digest = [
      "Civilizations covered:",
      ...civilizations.map((c) => `- ${c.name} (${c.chineseName}), ${c.region}, ${c.startYear}-${c.endYear}`),
      "Sample key events:",
      ...events
        .filter((e) => e.significance >= 4)
        .slice(0, 40)
        .map((e) => `- ${e.year}: ${e.title} (${civName.get(e.civilizationId)})`),
      "People covered:",
      ...people.map((p) => `- ${p.name} (${p.chineseName}), ${p.role}`),
    ].join("\n");

    const contextNote = describeContext(context, locale);
    const system = [
      "You are an expert world-history guide inside 'AI Global History Map', an interactive atlas focused on the Tang Dynasty era (618-907) and its world contemporaries.",
      locale === "zh"
        ? "Answer in Chinese (中文) — entity names may keep their English/Chinese forms."
        : "Answer concisely (max ~160 words).",
      "Answer concisely (max ~160 words). Be accurate; if unsure, say so.",
      "Ground answers in the dataset below whenever possible.",
      ...(contextNote
        ? ["The user is currently viewing: " + contextNote + ". Answer with that context first when relevant.", ""]
        : []),
      "DATASET:",
      digest,
      "",
      "ENTITY ID CATALOG (id | name | type) — use ONLY these ids for links/actions:",
      ENTITY_CATALOG,
      "",
      "RESPONSE FORMAT — reply with STRICT JSON only, no markdown, shape:",
      '{"reply":"your answer as plain text with line breaks and **bold** for entity names","links":[{"id":"<id from catalog>","type":"event|person|civilization|location","label":"display name"}],"actions":[{"type":"OPEN_EVENT|OPEN_PERSON|OPEN_LOCATION|FOCUS_CIVILIZATION","id":"<id from catalog>"},{"type":"SET_YEAR","year":751}]}',
      "Rules: links/actions arrays may be empty ([]). Every id MUST exist in the catalog above. SET_YEAR requires a numeric year. Never invent ids.",
    ].join("\n");

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: 700,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty OpenAI response");
    // structured JSON (V0.2); graceful plain-text fallback if the model
    // does not comply or JSON mode is unsupported
    return parseEngineJson(content) ?? {
      reply: content,
      citations: [],
      links: [],
      actions: [],
    };
  }
}

/* ── resolution ────────────────────────────────────────────────────── */

let local: LocalAssistant | null = null;
let openai: OpenAIAssistant | null = null;

export function getAssistant(): Assistant {
  if (process.env.OPENAI_API_KEY) {
    openai ??= new OpenAIAssistant();
    return openai;
  }
  local ??= new LocalAssistant();
  return local;
}

export async function chat(
  messages: ChatMessage[],
  context?: HistoryContext,
  locale: Locale = "en",
): Promise<ChatResponse> {
  const assistant = getAssistant();
  // V0.3 Phase 3D: recommendations ALWAYS come from the deterministic
  // navigator (lib/learning/navigator.ts) — never from the LLM. Both
  // engines share this single exit path, so Answer and Recommendation
  // stay strictly separated regardless of who answered.
  const recommendations = buildRecommendations(context ?? EMPTY_CONTEXT, locale, 3);
  const isOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (isOpenAI) {
    try {
      const { reply } = await assistant.reply(messages, context, locale);
      return { reply, source: "openai", citations: [], links: [], actions: [], recommendations };
    } catch {
      local ??= new LocalAssistant();
      const result = await local.reply(messages, context, locale);
      return { ...result, source: "local", recommendations };
    }
  }
  const result = await assistant.reply(messages, context, locale);
  return { ...result, source: "local", recommendations };
}

export { SUGGESTED };
