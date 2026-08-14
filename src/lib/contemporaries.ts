import type { HistoricalEvent, Person } from "./types";

/**
 * Contemporaneity helpers shared by the Person Drawer and the AI assistant.
 * Honest computation: lifespans must overlap; when birth/death is unknown,
 * the person's participant-event years fill the gap (never invented data).
 */

export interface YearRange {
  start: number;
  end: number;
}

/** Best-effort life range from known years + participant-event years. */
export function lifeRange(person: Person, events: HistoricalEvent[]): YearRange | null {
  const eventYears = events
    .filter((e) => e.participants.includes(person.id))
    .flatMap((e) => [e.year, e.yearEnd].filter((y): y is number => y !== null));
  const minEvent = eventYears.length > 0 ? Math.min(...eventYears) : null;
  const maxEvent = eventYears.length > 0 ? Math.max(...eventYears) : null;
  const start = person.birthYear ?? (minEvent !== null ? minEvent - 10 : null);
  const end = person.deathYear ?? (maxEvent !== null ? maxEvent + 10 : null);
  if (start === null || end === null) return null;
  return { start, end };
}

function rangesOverlap(a: YearRange, b: YearRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** People alive during `personId`'s lifetime (excluding self), sorted by closeness. */
export function computeContemporaries<T extends Person>(
  personId: string,
  people: T[],
  events: HistoricalEvent[],
): T[] {
  const person = people.find((p) => p.id === personId);
  if (!person) return [];
  const base = lifeRange(person, events);
  if (!base) return [];

  const scored: { person: T; overlap: number }[] = [];
  for (const other of people) {
    if (other.id === personId) continue;
    const otherRange = lifeRange(other, events);
    if (!otherRange || !rangesOverlap(base, otherRange)) continue;
    const overlap =
      Math.min(base.end, otherRange.end) - Math.max(base.start, otherRange.start);
    scored.push({ person: other, overlap });
  }
  return scored
    .sort((a, b) => b.overlap - a.overlap)
    .map((s) => s.person);
}

/** People alive in a specific year (both lifespan ends known). */
export function activeInYear(year: number, people: Person[]): Person[] {
  return people.filter(
    (p) =>
      p.birthYear !== null &&
      p.deathYear !== null &&
      p.birthYear <= year &&
      year <= p.deathYear,
  );
}
