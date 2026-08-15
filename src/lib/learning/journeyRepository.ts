/**
 * V0.3 — Journey repository.
 *
 * Single source of journey definitions + strict entity validation:
 * every entityId referenced by a journey step MUST exist in the seed
 * registry (events / people / civilizations / locations). Unknown ids
 * throw at load time — journeys must never reference fabricated entities.
 */
import { JOURNEYS } from "./journeys";
import type { Journey, JourneyStep } from "./journeyTypes";
import type { HistoryEntityRef, HistoryEntityType } from "../explorer";

/* ── seed registry: the only legitimate entity ids ─────────────────── */

import {
  civilizations as seedCivilizations,
  events as seedEvents,
  locations as seedLocations,
  people as seedPeople,
} from "@/data/seed";

const KNOWN_ENTITY_IDS = new Map<string, HistoryEntityType>();
for (const e of seedEvents) KNOWN_ENTITY_IDS.set(e.id, "event");
for (const p of seedPeople) KNOWN_ENTITY_IDS.set(p.id, "person");
for (const c of seedCivilizations) KNOWN_ENTITY_IDS.set(c.id, "civilization");
for (const l of seedLocations) KNOWN_ENTITY_IDS.set(l.id, "location");

/** Public entity whitelist (same source used by AI link validation). */
export function isKnownEntityId(id: string): boolean {
  return KNOWN_ENTITY_IDS.has(id);
}

export function isValidEntityRef(
  ref: HistoryEntityRef,
): boolean {
  return KNOWN_ENTITY_IDS.get(ref.id) === ref.type;
}

/* ── validation at module load ─────────────────────────────────────── */

function validateJourneys(): void {
  const problems: string[] = [];
  const seenSlugs = new Set<string>();
  for (const j of JOURNEYS) {
    if (seenSlugs.has(j.slug)) problems.push(`duplicate journey slug "${j.slug}"`);
    seenSlugs.add(j.slug);
    const seenSteps = new Set<number>();
    for (const s of j.steps) {
      if (seenSteps.has(s.order)) problems.push(`${j.slug}: duplicate step order ${s.order}`);
      seenSteps.add(s.order);
      const refs: HistoryEntityRef[] = [
        ...(s.eventId ? [{ id: s.eventId, type: "event" as const }] : []),
        ...(s.personId ? [{ id: s.personId, type: "person" as const }] : []),
        ...(s.civilizationId ? [{ id: s.civilizationId, type: "civilization" as const }] : []),
        ...(s.locationId ? [{ id: s.locationId, type: "location" as const }] : []),
        ...s.surroundingEntities,
      ];
      for (const ref of refs) {
        if (!isValidEntityRef(ref)) {
          problems.push(`${j.slug}/${s.id}: unknown or type-mismatched entity ${ref.type}:${ref.id}`);
        }
      }
      // V0.3 Phase 2 fields: grouped id lists + key facts must reference
      // known entities. keyFactEntityIds may mix types (event/person/civ/loc);
      // people/locations/civilizations must match their declared type.
      const grouped: [string, string[], HistoryEntityType | null][] = [
        ["keyFactEntityIds", s.keyFactEntityIds ?? [], null],
        ["people", s.people ?? [], "person"],
        ["locations", s.locations ?? [], "location"],
        ["civilizations", s.civilizations ?? [], "civilization"],
      ];
      for (const [field, ids, type] of grouped) {
        for (const id of ids) {
          const actual = KNOWN_ENTITY_IDS.get(id);
          if (actual === undefined) {
            problems.push(`${j.slug}/${s.id}: ${field} contains unknown id ${id}`);
          } else if (type !== null && actual !== type) {
            problems.push(`${j.slug}/${s.id}: ${field} id ${id} is ${actual}, expected ${type}`);
          }
        }
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(`Journey validation failed:\n- ${problems.join("\n- ")}`);
  }
}
validateJourneys();

/* ── queries ───────────────────────────────────────────────────────── */

export function getJourneys(): Journey[] {
  return JOURNEYS;
}

export function getJourneyBySlug(slug: string): Journey | null {
  return JOURNEYS.find((j) => j.slug === slug) ?? null;
}

export function getJourneyById(id: string): Journey | null {
  return JOURNEYS.find((j) => j.id === id) ?? null;
}

export function getJourneyStep(
  journey: Journey,
  stepNumber: number,
): JourneyStep | null {
  return journey.steps.find((s) => s.order === stepNumber) ?? null;
}

/** Total step count for progress display. */
export function journeyStepCount(journey: Journey): number {
  return journey.steps.length;
}

/* ── featured / homepage ordering (V0.3 Phase 3C) ────────────────────
 * Order: published → featured → difficulty → estimatedMinutes.
 * draft journeys never surface on the homepage. */

const DIFFICULTY_RANK = { beginner: 0, intermediate: 1, advanced: 2 } as const;

export function journeyOrderKey(j: Journey): [number, number, number, number] {
  return [
    (j.status ?? "published") === "published" ? 0 : 1,
    j.featured ? 0 : 1,
    DIFFICULTY_RANK[j.difficulty],
    j.estimatedMinutes,
  ];
}

/** Published journeys ordered for the homepage (featured first). */
export function getFeaturedJourneys(limit = 3): Journey[] {
  return JOURNEYS
    .filter((j) => (j.status ?? "published") === "published")
    .sort((a, b) => {
      const ka = journeyOrderKey(a);
      const kb = journeyOrderKey(b);
      for (let i = 0; i < ka.length; i++) {
        if (ka[i] !== kb[i]) return ka[i] - kb[i];
      }
      return 0;
    })
    .slice(0, limit);
}
