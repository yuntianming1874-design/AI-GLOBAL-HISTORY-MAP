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
  /** 核心历史问题（Story Panel 以问题开头）。 */
  question: string;
  questionEn: string;
  /** Editorial narrative (zh). May name figures (e.g. 高仙芝) but never
   *  reference them as clickable entities unless they exist in the seed. */
  narrative: string;
  narrativeEn: string;
  /** 为什么重要——数据驱动（narrator 模板仅作 fallback）。 */
  whyImportant: string;
  whyImportantEn: string;
  /** 为什么接下来会发生什么（step N → step N+1 的因果衔接）。 */
  nextStepReason: string;
  nextStepReasonEn: string;
  /** 关键事实实体（必须存在于 seed；缺省时 narrator 从 step 实体派生）。 */
  keyFactEntityIds?: string[];
  /** 分组展示：相关人物 / 文明 / 地点（必须存在于 seed；缺省回退
   *  surroundingEntities 按 type 派生——不建立第二套数据源）。 */
  people?: string[];
  locations?: string[];
  civilizations?: string[];
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
