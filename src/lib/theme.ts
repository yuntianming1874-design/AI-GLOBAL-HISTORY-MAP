import type { EventCategory, RelationshipType } from "./types";

/**
 * Single source of truth for colors & labels shared by every visualization
 * (timeline, map, graph, cards, charts).
 */

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; color: string; dot: string }
> = {
  political: { label: "Politics", color: "#b3402a", dot: "#b3402a" },
  military: { label: "Military", color: "#3b6ea5", dot: "#3b6ea5" },
  cultural: { label: "Culture", color: "#c9a227", dot: "#c9a227" },
  economic: { label: "Economy", color: "#2f8f6b", dot: "#2f8f6b" },
  religious: { label: "Religion", color: "#7d5ba6", dot: "#7d5ba6" },
  technological: { label: "Technology", color: "#d97706", dot: "#d97706" },
  diplomatic: { label: "Diplomacy", color: "#0e7490", dot: "#0e7490" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META) as EventCategory[];

export const RELATIONSHIP_META: Record<
  RelationshipType,
  { label: string; color: string }
> = {
  family: { label: "Family", color: "#b3402a" },
  mentor: { label: "Mentor", color: "#3b6ea5" },
  student: { label: "Student", color: "#5b8fc9" },
  friend: { label: "Friend", color: "#2f8f6b" },
  rival: { label: "Rival", color: "#d97706" },
  enemy: { label: "Enemy", color: "#7f1d1d" },
  patron: { label: "Patron", color: "#c9a227" },
  colleague: { label: "Colleague", color: "#0e7490" },
};

export const RELATIONSHIP_ORDER = Object.keys(
  RELATIONSHIP_META,
) as RelationshipType[];

/** Tang-era focus window used as the default view everywhere. */
export const TANG_ERA = { start: 618, end: 907 } as const;
export const FULL_RANGE = { start: 500, end: 1000 } as const;

export const REGION_ORDER = [
  "East Asia",
  "West Asia",
  "Europe",
  "South Asia",
  "Southeast Asia",
  "Americas",
] as const;

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export function formatYearSpan(start: number, end: number | null): string {
  if (end === null || end === start) return formatYear(start);
  return `${formatYear(start)} – ${formatYear(end)}`;
}
