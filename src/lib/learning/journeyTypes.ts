/**
 * V0.3 — Learning Journey types.
 *
 * Journey steps reference ONLY existing seed entities via HistoryEntityRef
 * (reused from lib/explorer — no second entity system). Every entityId is
 * validated against the seed registry by JourneyRepository at load time;
 * unknown ids fail fast instead of being silently ignored.
 */
import type {
  HistoryEntityRef,
  HistoryNavigationAction,
} from "../explorer";

export interface JourneyStep {
  /** Stable id inside the journey (e.g. "talas-751-step-2"). */
  id: string;
  /** 1-based order within the journey. */
  order: number;
  title: string;
  titleEn: string;
  /** Editorial narrative (zh). May name figures (e.g. 高仙芝) but never
   *  reference them as clickable entities unless they exist in the seed. */
  narrative: string;
  narrativeEn: string;
  /** History-context patch this step applies when entered. */
  year?: number;
  startYear?: number;
  endYear?: number;
  eventId?: string;
  personId?: string;
  civilizationId?: string;
  locationId?: string;
  /** Related entities rendered as chips / links in the Story Panel. */
  surroundingEntities: HistoryEntityRef[];
}

export interface Journey {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  startYear: number;
  endYear: number;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: JourneyStep[];
}

/** Structured AI narration (V0.3 §19) — facts separated from interpretation. */
export interface HistoryFactReference {
  entityId: string;
  entityType: string;
  label: string;
  /** Provenance-aware display of the fact's date (formatHistoricalDate). */
  dateDisplay?: string;
}

export interface HistoricalNarration {
  summary: string;
  keyFacts: HistoryFactReference[];
  importance: string;
  relatedEntities: HistoryEntityRef[];
  actions: HistoryNavigationAction[];
  uncertaintyNotes?: string[];
}
