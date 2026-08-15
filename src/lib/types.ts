import type {
  HistoryContext,
  HistoryEntityLink,
  HistoryNavigationAction,
} from "./explorer";
import type { NavigatorRecommendation } from "./learning/navigatorTypes";
import type {
  HistoricalDateValue,
  HistoricalNameType,
  PersonProvenance,
} from "./provenance";

/**
 * Domain types for the AI Global History Map.
 * These mirror the PostgreSQL schema (see db/schema.sql) 1:1 so the
 * repository adapters (Postgres / in-memory seed) share one contract.
 */

export type Region =
  | "East Asia"
  | "West Asia"
  | "Europe"
  | "South Asia"
  | "Southeast Asia"
  | "Americas";

export type EventCategory =
  | "political"
  | "military"
  | "cultural"
  | "economic"
  | "religious"
  | "technological"
  | "diplomatic";

export type RelationshipType =
  | "family"
  | "mentor"
  | "student"
  | "friend"
  | "rival"
  | "enemy"
  | "patron"
  | "colleague";

export interface Civilization {
  id: string;
  name: string;
  chineseName: string;
  region: Region;
  /** Full lifespan, used for timeline era bands and map regions. */
  startYear: number;
  endYear: number;
  /** V0.2.2: 名称类型（contemporary / modern_scholarly / retrospective）。 */
  nameType?: HistoricalNameType;
  /** 名称备注（如“现代历史学常用的描述性名称”）。 */
  nameNote?: string;
  /** Hex color shared across all visualizations. */
  color: string;
  summary: string;
  /** Simplified-Chinese summary (i18n). */
  zhSummary?: string | null;
}

export interface HistoricalLocation {
  id: string;
  name: string;
  chineseName: string;
  latitude: number;
  longitude: number;
  civilizationId: string | null;
  modernCountry: string;
  description: string;
  /** Simplified-Chinese description (i18n). */
  zhDescription?: string | null;
}

export type EventParticipantRole = "instigator" | "participant" | "witness";

export interface HistoricalEvent {
  id: string;
  title: string;
  chineseTitle: string;
  /** Point event if yearEnd is null, otherwise a span. */
  year: number;
  yearEnd: number | null;
  category: EventCategory;
  /** 1 (minor) – 5 (world-historical). */
  significance: number;
  civilizationId: string;
  locationId: string | null;
  tags: string[];
  description: string;
  /** Person ids involved (normalized form lives in events_people). */
  participants: string[];
  /** Optional per-participant role; defaults to "participant". */
  participantRoles?: Partial<Record<string, EventParticipantRole>>;
  /** Simplified-Chinese description (i18n). */
  zhDescription?: string | null;
  /** V0.2.2: 事件日期精度/不确定性（近似/争议事件必填；exact 事件可省略）。 */
  dateProvenance?: HistoricalDateValue;
}

export interface Person {
  id: string;
  name: string;
  chineseName: string;
  birthYear: number | null;
  deathYear: number | null;
  role: string;
  /** 1 – 5, drives graph node radius. */
  importance: number;
  /** null for figures predating the seed's civilizations (e.g. Muhammad). */
  civilizationId: string | null;
  summary: string;
  /** Simplified-Chinese summary (i18n). */
  zhSummary?: string | null;
  /** V0.3 provenance metadata — optional, filled only after human review. */
  provenance?: PersonProvenance;
}

export interface Relationship {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  type: RelationshipType;
  description: string;
  startYear: number | null;
  endYear: number | null;
  /** Simplified-Chinese description (i18n). */
  zhDescription?: string | null;
}

export interface EventFilters {
  civilizationId?: string;
  category?: EventCategory;
  from?: number;
  to?: number;
  q?: string;
  personId?: string;
  locationId?: string;
  limit?: number;
}

/* ── Territories (V0.2) ────────────────────────────────────────────── */

export type TerritoryConfidence = "high" | "medium" | "low" | "schematic";

/** Simplified polygon in [longitude, latitude] rings (Polygon or MultiPolygon). */
export type TerritoryGeometry =
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

export interface Territory {
  id: string;
  /** Display name, e.g. "Tang Empire". */
  name: string;
  civilizationId: string;
  validFrom: number;
  validTo: number;
  geojson: TerritoryGeometry;
  source: string;
  confidence: TerritoryConfidence;
  /** Simplified-Chinese display name (i18n). */
  zhName?: string | null;
}

export interface TerritoryDTO extends Territory {
  civilizationName: string;
  civilizationColor: string;
}

/* ── API DTOs (enriched views served by the route handlers) ───────── */

export interface EventDTO extends HistoricalEvent {
  civilizationName: string;
  civilizationColor: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  participantsNames: string[];
  /** personId → role, always populated (default "participant"). */
  participantRoles: Record<string, EventParticipantRole>;
}

export interface PersonDTO extends Person {
  civilizationName: string | null;
  civilizationColor: string | null;
}

export interface RelationshipDTO extends Relationship {
  sourceName: string;
  targetName: string;
}

export interface CenturyComparison {
  /** e.g. "7th century" */
  century: string;
  startYear: number;
  china: number;
  world: number;
}

export interface ParallelEvent {
  year: number;
  china: EventDTO | null;
  world: EventDTO | null;
}

export interface OverviewDTO {
  stats: {
    events: number;
    people: number;
    civilizations: number;
    locations: number;
    relationships: number;
    yearsCovered: string;
  };
  comparison: CenturyComparison[];
  parallelEvents: ParallelEvent[];
  featuredEvents: EventDTO[];
  civilizations: Civilization[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** V0.2: what the user is currently viewing (from URL context). */
  context?: HistoryContext;
  /** i18n: engine templates follow the active UI locale. */
  locale?: "en" | "zh";
}

export interface ChatResponse {
  reply: string;
  /** Which engine answered: "openai" | "local" */
  source: "openai" | "local";
  /** Entity ids the local engine grounded the answer on. */
  citations: string[];
  /** V0.2: clickable history-entity links embedded in the reply. */
  links: HistoryEntityLink[];
  /** V0.2: suggested navigation actions (Timeline / Map / People / Events). */
  actions: HistoryNavigationAction[];
  /**
   * V0.3 Phase 3D: next-step recommendations from the DETERMINISTIC
   * navigator (lib/learning/navigator.ts) — never from the LLM.
   * Always [] for old clients (they simply ignore it).
   */
  recommendations: NavigatorRecommendation[];
}
