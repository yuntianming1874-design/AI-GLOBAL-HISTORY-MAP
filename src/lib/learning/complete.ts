/**
 * V0.3 Phase 3B — Journey Complete statistics (pure, testable).
 *
 * ALL numbers and core memories are derived from the journey definition
 * + seed entities — nothing is invented by AI. "Explored" means "shown
 * by this journey's steps" (eventId/personId/civilizationId/locationId
 * + surroundingEntities, deduplicated). No user tracking.
 */
import type { Journey } from "./journeyTypes";
import {
  civilizations,
  events,
  locations,
  people,
} from "@/data/seed";

export interface ExploredEntity {
  id: string;
  labelZh: string;
  labelEn: string;
}

export interface CoreMemory {
  kind: "year" | "event" | "person" | "civilization" | "location" | "keyword";
  labelZh: string;
  labelEn: string;
  id?: string;
}

export interface JourneyCompleteStats {
  stepsCompleted: number;
  eventsExplored: ExploredEntity[];
  peopleExplored: ExploredEntity[];
  civilizationsExplored: ExploredEntity[];
  locationsExplored: ExploredEntity[];
  coreMemories: CoreMemory[];
}

const eventLabel = (id: string) => {
  const e = events.find((x) => x.id === id);
  return e ? { id, labelZh: e.chineseTitle, labelEn: e.title } : null;
};
const personLabel = (id: string) => {
  const p = people.find((x) => x.id === id);
  return p ? { id, labelZh: p.chineseName, labelEn: p.name } : null;
};
const civLabel = (id: string) => {
  const c = civilizations.find((x) => x.id === id);
  return c ? { id, labelZh: c.chineseName, labelEn: c.name } : null;
};
const locLabel = (id: string) => {
  const l = locations.find((x) => x.id === id);
  return l ? { id, labelZh: l.chineseName, labelEn: l.name } : null;
};

function dedupe<T extends { id: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of list) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** Learning statistics + core memories for a completed journey. */
export function buildJourneyCompleteStats(journey: Journey): JourneyCompleteStats {
  const eventsExplored: ExploredEntity[] = [];
  const peopleExplored: ExploredEntity[] = [];
  const civilizationsExplored: ExploredEntity[] = [];
  const locationsExplored: ExploredEntity[] = [];

  for (const s of journey.steps) {
    if (s.eventId) {
      const l = eventLabel(s.eventId);
      if (l) eventsExplored.push(l);
    }
    if (s.personId) {
      const l = personLabel(s.personId);
      if (l) peopleExplored.push(l);
    }
    if (s.civilizationId) {
      const l = civLabel(s.civilizationId);
      if (l) civilizationsExplored.push(l);
    }
    if (s.locationId) {
      const l = locLabel(s.locationId);
      if (l) locationsExplored.push(l);
    }
    for (const ref of s.surroundingEntities) {
      switch (ref.type) {
        case "event": {
          const l = eventLabel(ref.id);
          if (l) eventsExplored.push(l);
          break;
        }
        case "person": {
          const l = personLabel(ref.id);
          if (l) peopleExplored.push(l);
          break;
        }
        case "civilization": {
          const l = civLabel(ref.id);
          if (l) civilizationsExplored.push(l);
          break;
        }
        case "location": {
          const l = locLabel(ref.id);
          if (l) locationsExplored.push(l);
          break;
        }
        case "territory":
          break;
      }
    }
  }

  // core memories: years + key entities + journey keywords (in order)
  const coreMemories: CoreMemory[] = [];
  const years = [...new Set(journey.steps.map((s) => s.year).filter((y): y is number => y !== undefined))].sort((a, b) => a - b);
  for (const y of years) {
    coreMemories.push({ kind: "year", labelZh: `${y} 年`, labelEn: `${y} CE` });
  }
  for (const e of dedupe(eventsExplored).slice(0, 4)) {
    coreMemories.push({ kind: "event", id: e.id, labelZh: e.labelZh, labelEn: e.labelEn });
  }
  for (const c of dedupe(civilizationsExplored).slice(0, 4)) {
    coreMemories.push({ kind: "civilization", id: c.id, labelZh: c.labelZh, labelEn: c.labelEn });
  }
  for (const k of journey.keywords ?? []) {
    coreMemories.push({ kind: "keyword", labelZh: k.labelZh, labelEn: k.labelEn });
  }

  return {
    stepsCompleted: journey.steps.length,
    eventsExplored: dedupe(eventsExplored),
    peopleExplored: dedupe(peopleExplored),
    civilizationsExplored: dedupe(civilizationsExplored),
    locationsExplored: dedupe(locationsExplored),
    coreMemories,
  };
}
