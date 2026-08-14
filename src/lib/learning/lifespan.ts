/**
 * V0.3 Phase 2 — Person Lifespan logic (pure, testable).
 *
 * Uses the EXISTING person data source (seed → repository DTO) and the
 * EXISTING provenance PersonRole[]. All dates render through the shared
 * provenance formatters — disputed/approximate/unknown follow
 * history-data-policy. No second person dataset.
 */
import type { PersonDTO, EventDTO } from "../types";
import {
  formatHistoricalDate,
  formatLifespan,
  formatYearSpan,
  type HistoricalDateValue,
  type PersonRole,
} from "../provenance";

export interface LifespanRoleSpan {
  role: string;
  /** Display years (from provenance formatter — may be "约 742" etc.). */
  fromDisplay: string;
  toDisplay: string;
  fromYear: number | null;
  toYear: number | null;
  confidence: string;
}

export interface LifespanEventPoint {
  eventId: string;
  title: string;
  chineseTitle: string;
  year: number;
  yearEnd: number | null;
  /** Provenance-aware date display. */
  dateDisplay: string;
}

export interface PersonLifespanModel {
  personId: string;
  name: string;
  chineseName: string;
  civilizationName: string | null;
  civilizationColor: string | null;
  importance: number;
  /** Raw years (null = unknown → "年代不详", never invented). */
  birthYear: number | null;
  deathYear: number | null;
  /** Provenance-aware display (disputed → 存在学术争议 etc.). */
  birthDisplay: string;
  deathDisplay: string;
  lifespanDisplay: string;
  roles: LifespanRoleSpan[];
  events: LifespanEventPoint[];
  /** True when the person's lifespan covers the given year. */
  activeAtYear: boolean;
}

/** Map a year into a [0,1] position within a display range. */
export function yearToPosition(
  year: number,
  rangeStart: number,
  rangeEnd: number,
): number {
  if (rangeEnd <= rangeStart) return 0;
  return Math.min(1, Math.max(0, (year - rangeStart) / (rangeEnd - rangeStart)));
}

/** Display range covering all persons' lifespans (clamped to FULL_RANGE). */
export function lifespanRange(
  persons: Pick<PersonLifespanModel, "birthYear" | "deathYear">[],
  anchorYear: number | null,
  fallbackStart = 500,
  fallbackEnd = 1000,
): [number, number] {
  const years = persons.flatMap((p) =>
    [p.birthYear, p.deathYear].filter((y): y is number => y !== null),
  );
  if (anchorYear !== null) years.push(anchorYear);
  if (years.length === 0) return [fallbackStart, fallbackEnd];
  const min = Math.min(...years);
  const max = Math.max(...years);
  const pad = Math.max(5, Math.round((max - min) * 0.08));
  return [
    Math.max(fallbackStart, min - pad),
    Math.min(fallbackEnd, max + pad),
  ];
}

function formatDateShort(
  year: number | null,
  precision: string,
  locale: "en" | "zh",
): string {
  if (year === null) return locale === "zh" ? "年代不详" : "unknown";
  if (precision === "approximate") return locale === "zh" ? `约 ${year}` : `c. ${year}`;
  return String(year);
}

function roleSpanDisplay(role: PersonRole, locale: "en" | "zh"): LifespanRoleSpan {
  const from = role.validFrom;
  const to = role.validTo;
  return {
    role: role.role,
    fromDisplay: from
      ? formatDateShort(from.year ?? null, from.precision, locale)
      : locale === "zh"
        ? "不详"
        : "unknown",
    toDisplay: to
      ? formatDateShort(to.year ?? null, to.precision, locale)
      : locale === "zh"
        ? "至今"
        : "present",
    fromYear: from?.year ?? null,
    toYear: to?.year ?? null,
    confidence: role.confidence,
  };
}

/**
 * Build a lifespan model for one person, joining their participation in
 * events (single source: event.participants) and their provenance roles.
 */
export function buildPersonLifespanModel(
  person: PersonDTO,
  events: EventDTO[],
  year: number | null,
  locale: "en" | "zh" = "zh",
): PersonLifespanModel {
  const birth = person.provenance?.birth as HistoricalDateValue | undefined;
  const death = person.provenance?.death as HistoricalDateValue | undefined;

  const personEvents: LifespanEventPoint[] = events
    .filter((e) => e.participants.includes(person.id))
    .map((e) => ({
      eventId: e.id,
      title: e.title,
      chineseTitle: e.chineseTitle,
      year: e.year,
      yearEnd: e.yearEnd,
      dateDisplay: formatYearSpan(e.year, e.yearEnd, e.dateProvenance, locale),
    }))
    .sort((a, b) => a.year - b.year);

  const birthYear = birth?.year ?? person.birthYear;
  const deathYear = death?.year ?? person.deathYear;
  const active =
    year !== null &&
    birthYear !== null &&
    deathYear !== null &&
    birthYear <= year &&
    year <= deathYear;

  return {
    personId: person.id,
    name: person.name,
    chineseName: person.chineseName,
    civilizationName: person.civilizationName,
    civilizationColor: person.civilizationColor,
    importance: person.importance,
    birthYear: person.birthYear,
    deathYear: person.deathYear,
    birthDisplay: formatHistoricalDate(birth, locale),
    deathDisplay: formatHistoricalDate(death, locale),
    lifespanDisplay: formatLifespan(birth, death, locale),
    roles: (person.provenance?.roles ?? []).map((r) => roleSpanDisplay(r, locale)),
    events: personEvents,
    activeAtYear: active,
  };
}

/** People alive at `year` (lifespan covers it), by importance desc. */
export function selectPeopleAliveAtYear(
  people: PersonDTO[],
  year: number | null,
  limit = 8,
): PersonDTO[] {
  if (year === null) return [];
  return people
    .filter((p) => {
      const b = p.provenance?.birth?.year ?? p.birthYear;
      const d = p.provenance?.death?.year ?? p.deathYear;
      return b !== null && d !== null && b <= year && year <= d;
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}
