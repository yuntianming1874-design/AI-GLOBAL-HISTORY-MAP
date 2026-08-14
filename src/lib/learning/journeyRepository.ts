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
