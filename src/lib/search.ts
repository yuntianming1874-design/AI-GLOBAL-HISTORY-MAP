import {
  civilizations,
  events,
  locations,
  people,
} from "@/data/seed";
import { EXTRA_ALIASES, type HistoryEntityAlias } from "@/data/seed/aliases";
import type { HistoryEntityType } from "./explorer";
import type { Locale } from "./i18n";

/**
 * V0.2.1 — ordered history-entity search.
 *
 * searchHistoryEntities(query) matches in strict priority order:
 *   1. exact entity name / chineseName / id / alias
 *   2. alias embedded in the query (e.g. "怛罗斯之战为什么重要？" → Battle of Talas)
 *   3. entity title/name contains the query
 *   4. full-text token scoring (fallback)
 */

export interface SearchableEntity {
  id: string;
  type: "event" | "person" | "civilization" | "location";
  name: string;
  chineseName: string;
  aliases: string[];
}

export interface SearchHit {
  id: string;
  type: SearchableEntity["type"];
  name: string;
  chineseName: string;
  /** 1 = exact · 2 = alias · 3 = name contains · 4 = full-text */
  stage: 1 | 2 | 3 | 4;
  score: number;
}

function buildRegistry(): SearchableEntity[] {
  const out: SearchableEntity[] = [];
  for (const e of events) {
    out.push({ id: e.id, type: "event", name: e.title, chineseName: e.chineseTitle, aliases: [] });
  }
  for (const p of people) {
    out.push({ id: p.id, type: "person", name: p.name, chineseName: p.chineseName, aliases: [] });
  }
  for (const c of civilizations) {
    out.push({ id: c.id, type: "civilization", name: c.name, chineseName: c.chineseName, aliases: [] });
  }
  for (const l of locations) {
    out.push({ id: l.id, type: "location", name: l.name, chineseName: l.chineseName, aliases: [] });
  }
  // attach aliases: id + extra aliases (name/chineseName are matched directly)
  const byId = new Map(out.map((e) => [e.id, e]));
  for (const alias of EXTRA_ALIASES) {
    byId.get(alias.entityId)?.aliases.push(alias.alias);
  }
  return out;
}

const REGISTRY = buildRegistry();

const TEXT: Map<string, string> = new Map();
for (const e of REGISTRY) {
  TEXT.set(
    e.id,
    `${e.name} ${e.chineseName} ${e.aliases.join(" ")}`.toLowerCase(),
  );
}

function tokens(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9\u4e00-\u9fff]+/).filter((t) => t.length > 1);
}

/**
 * Ordered search. Returns [] when nothing matches even by full-text.
 */
export function searchHistoryEntities(
  query: string,
  limit = 6,
): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const hits: SearchHit[] = [];

  // stage 1: exact match
  for (const e of REGISTRY) {
    const names = [e.name.toLowerCase(), e.chineseName, e.id, ...e.aliases.map((a) => a.toLowerCase())];
    if (names.some((n) => n === qLower)) {
      hits.push({ id: e.id, type: e.type, name: e.name, chineseName: e.chineseName, stage: 1, score: 1000 });
    }
  }
  if (hits.length > 0) return hits.slice(0, limit);

  // stage 2: alias embedded in query
  for (const e of REGISTRY) {
    for (const alias of e.aliases) {
      const a = alias.toLowerCase();
      if (a.length >= 2 && (qLower.includes(a) || a.includes(qLower))) {
        hits.push({ id: e.id, type: e.type, name: e.name, chineseName: e.chineseName, stage: 2, score: 500 + a.length });
        break;
      }
    }
  }
  if (hits.length > 0) return hits.slice(0, limit);

  // stage 3: entity name contains the query (kind order: event, person, civilization, location)
  const KIND_ORDER: Record<SearchableEntity["type"], number> = {
    event: 0,
    person: 1,
    civilization: 2,
    location: 3,
  };
  const contains: SearchHit[] = [];
  for (const e of REGISTRY) {
    if (e.name.toLowerCase().includes(qLower) || e.chineseName.toLowerCase().includes(qLower)) {
      contains.push({
        id: e.id, type: e.type, name: e.name, chineseName: e.chineseName,
        stage: 3, score: 100 + (10 - KIND_ORDER[e.type]),
      });
    }
  }
  if (contains.length > 0) return contains.sort((a, b) => b.score - a.score).slice(0, limit);

  // stage 4: full-text token scoring
  const qTokens = tokens(q);
  const scored: SearchHit[] = [];
  for (const e of REGISTRY) {
    const text = TEXT.get(e.id) ?? "";
    let score = 0;
    for (const t of qTokens) {
      if (text.includes(t)) score += t.length;
      if (e.name.toLowerCase().includes(t)) score += t.length * 4;
      if (e.chineseName.includes(t)) score += t.length * 4;
    }
    if (score > 0) {
      scored.push({ id: e.id, type: e.type, name: e.name, chineseName: e.chineseName, stage: 4, score });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Display label of a hit for the current locale. */
export function searchHitLabel(hit: SearchHit, locale: Locale = "en"): string {
  return locale === "zh" ? hit.chineseName || hit.name : hit.name;
}

export { REGISTRY as SEARCH_REGISTRY };
export type { HistoryEntityAlias, HistoryEntityType };
