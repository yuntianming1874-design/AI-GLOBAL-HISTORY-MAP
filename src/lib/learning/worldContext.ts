/**
 * V0.3 Phase 2 — World Context logic (pure, testable).
 *
 * "同一年，世界不同地区发生了什么？"
 * Display regions are a fixed UI grouping of the 12 seed civilizations —
 * NOT historical claims. Events are selected from the seed repository only;
 * regions without reliable data show an explicit placeholder.
 */
import type {
  HistoricalConfidence,
  HistoricalDateValue,
  HistoricalPrecision,
} from "../provenance";

export const WORLD_REGIONS = [
  "East Asia",
  "Central Asia",
  "Middle East",
  "Europe",
  "Japan",
  "Southeast Asia",
  "Americas",
] as const;

export type WorldRegion = (typeof WORLD_REGIONS)[number];

/** Fixed civilization → display region mapping (UI grouping, not a fact). */
export const CIV_TO_REGION: Record<string, WorldRegion> = {
  "c-tang": "East Asia",
  "c-silla": "East Asia",
  "c-tibet": "Central Asia",
  "c-khazars": "Central Asia",
  "c-abbasid": "Middle East",
  "c-umayyad": "Middle East",
  "c-byzantium": "Europe",
  "c-carolingian": "Europe",
  "c-vikings": "Europe",
  "c-japan": "Japan",
  "c-srivijaya": "Southeast Asia",
  "c-maya": "Americas",
};

/** Region label (zh/en) for display. */
export function worldRegionLabel(region: WorldRegion, locale: "en" | "zh"): string {
  const zh: Record<WorldRegion, string> = {
    "East Asia": "东亚",
    "Central Asia": "中亚",
    "Middle East": "中东",
    Europe: "欧洲",
    Japan: "日本",
    "Southeast Asia": "东南亚",
    Americas: "美洲",
  };
  return locale === "zh" ? zh[region] : region;
}

export interface WorldRegionGroup {
  region: WorldRegion;
  /** Civilizations grouped into this region (all seed-known). */
  civilizationIds: string[];
}

/** Group the seed civilizations into display regions. */
export function groupCivilizationsByRegion(
  civilizationIds: string[],
): WorldRegionGroup[] {
  const groups = new Map<WorldRegion, string[]>();
  for (const id of civilizationIds) {
    const region = CIV_TO_REGION[id];
    if (!region) continue; // unknown id — never invent a region for it
    const list = groups.get(region) ?? [];
    list.push(id);
    groups.set(region, list);
  }
  return WORLD_REGIONS.filter((r) => groups.has(r)).map((r) => ({
    region: r,
    civilizationIds: groups.get(r) ?? [],
  }));
}

export interface WorldEventRow {
  eventId: string;
  /** Provenance-aware date display (formatYearSpan). */
  dateDisplay: string;
  /** Raw year range for sorting. */
  year: number;
  yearEnd: number | null;
  title: string;
  chineseTitle: string;
  /** Short explanation — first sentence of the curated description. */
  shortExplanation: string;
  zhExplanation: string;
  /** provenance confidence of the date. */
  confidence: HistoricalConfidence;
  /** precision of the date. */
  precision: HistoricalPrecision;
}

/**
 * Events relevant to a year for a region: point events within ±5 years or
 * range events covering the year. Pure selection — no invented facts.
 */
export function selectEventsForYear(
  events: {
    id: string;
    year: number;
    yearEnd: number | null;
    title: string;
    chineseTitle: string;
    description: string;
    zhDescription?: string | null;
    civilizationId: string;
    dateProvenance?: HistoricalDateValue | null;
  }[],
  regionCivIds: string[],
  year: number,
): WorldEventRow[] {
  const rows: WorldEventRow[] = [];
  for (const e of events) {
    if (!regionCivIds.includes(e.civilizationId)) continue;
    const relevant =
      e.yearEnd !== null
        ? e.year <= year && year <= e.yearEnd
        : Math.abs(e.year - year) <= 5;
    if (!relevant) continue;
    const dp = e.dateProvenance;
    rows.push({
      eventId: e.id,
      dateDisplay: `${e.year}${e.yearEnd !== null && e.yearEnd !== e.year ? `–${e.yearEnd}` : ""}`,
      year: e.year,
      yearEnd: e.yearEnd,
      title: e.title,
      chineseTitle: e.chineseTitle,
      shortExplanation: e.description.split(".")[0] + ".",
      zhExplanation: (e.zhDescription ?? e.description).split("。")[0] + "。",
      confidence: dp?.confidence ?? "high",
      precision: dp?.precision ?? "exact",
    });
  }
  return rows.sort((a, b) => a.year - b.year);
}
