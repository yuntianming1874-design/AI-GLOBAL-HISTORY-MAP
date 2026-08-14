import { Pool } from "pg";
import {
  civilizations as seedCivilizations,
  events as seedEvents,
  locations as seedLocations,
  people as seedPeople,
  relationships as seedRelationships,
  territories as seedTerritories,
} from "@/data/seed";
import { buildEventsPeople } from "@/data/seed/eventsPeople";
import {
  zhCivilizationSummaries,
  zhLocationDescriptions,
  zhTerritoryNames,
} from "@/data/seed/zhMisc";
import {
  zhEventDescriptions,
} from "@/data/seed/zhEvents";
import {
  zhPersonSummaries,
  zhRelationshipDescriptions,
} from "@/data/seed/zhPeopleRelationships";
import type {
  CenturyComparison,
  Civilization,
  EventDTO,
  EventFilters,
  EventParticipantRole,
  HistoricalEvent,
  HistoricalLocation,
  OverviewDTO,
  ParallelEvent,
  Person,
  PersonDTO,
  Relationship,
  RelationshipDTO,
  Territory,
  TerritoryDTO,
} from "./types";

export type { EventFilters };

/**
 * Repository pattern: one interface, two adapters.
 *  - PostgresRepository  → used when DATABASE_URL is set
 *  - SeedRepository      → in-memory seed data (zero-config demo)
 */

export interface Repository {
  getCivilizations(): Promise<Civilization[]>;
  getLocations(): Promise<HistoricalLocation[]>;
  getEvents(filters?: EventFilters): Promise<EventDTO[]>;
  getEventById(id: string): Promise<EventDTO | null>;
  getPeople(filters?: { civilizationId?: string; q?: string }): Promise<PersonDTO[]>;
  getRelationships(): Promise<RelationshipDTO[]>;
  getTerritories(year?: number): Promise<TerritoryDTO[]>;
  getOverview(): Promise<OverviewDTO>;
}

/* ── shared enrichment helpers ─────────────────────────────────────── */

const civById = new Map(seedCivilizations.map((c) => [c.id, c]));
const locById = new Map(seedLocations.map((l) => [l.id, l]));
const personById = new Map(seedPeople.map((p) => [p.id, p]));
const personName = new Map(seedPeople.map((p) => [p.id, p.name]));

/**
 * events_people join rows — the single normalized source for participant
 * lookups in the seed path (the Postgres path queries the same table).
 */
const eventsPeople = buildEventsPeople(seedEvents);
const joinByEvent = new Map<string, { personId: string; role: EventParticipantRole }[]>();
for (const row of eventsPeople) {
  const list = joinByEvent.get(row.eventId) ?? [];
  list.push({ personId: row.personId, role: row.role });
  joinByEvent.set(row.eventId, list);
}

function enrichEvent(e: HistoricalEvent): EventDTO {
  const civ = civById.get(e.civilizationId);
  const loc = e.locationId ? locById.get(e.locationId) : undefined;
  const rows = joinByEvent.get(e.id) ?? [];
  const participantRoles: Record<string, EventParticipantRole> = {};
  for (const row of rows) participantRoles[row.personId] = row.role;
  return {
    ...e,
    civilizationName: civ?.name ?? "Unknown",
    civilizationColor: civ?.color ?? "#8a7a66",
    locationName: loc?.name ?? null,
    latitude: loc?.latitude ?? null,
    longitude: loc?.longitude ?? null,
    zhDescription: zhEventDescriptions[e.id] ?? null,
    participantsNames: rows
      .map((row) => personName.get(row.personId))
      .filter((n): n is string => Boolean(n)),
    participantRoles,
  };
}

function enrichPerson(p: Person): PersonDTO {
  const civ = p.civilizationId ? civById.get(p.civilizationId) : undefined;
  return {
    ...p,
    civilizationName: civ?.name ?? null,
    civilizationColor: civ?.color ?? null,
    zhSummary: zhPersonSummaries[p.id] ?? null,
  };
}

function enrichRelationship(r: Relationship): RelationshipDTO {
  return {
    ...r,
    sourceName: personById.get(r.sourcePersonId)?.name ?? r.sourcePersonId,
    targetName: personById.get(r.targetPersonId)?.name ?? r.targetPersonId,
    zhDescription: zhRelationshipDescriptions[r.id] ?? null,
  };
}

function enrichTerritory(t: Territory): TerritoryDTO {
  const civ = civById.get(t.civilizationId);
  return {
    ...t,
    civilizationName: civ?.name ?? "Unknown",
    civilizationColor: civ?.color ?? "#8a7a66",
    zhName: zhTerritoryNames[t.id] ?? null,
  };
}

/* ── Seed (in-memory) repository ───────────────────────────────────── */

class SeedRepository implements Repository {
  async getCivilizations(): Promise<Civilization[]> {
    return seedCivilizations.map((c) => ({
      ...c,
      zhSummary: zhCivilizationSummaries[c.id] ?? null,
    }));
  }

  async getLocations(): Promise<HistoricalLocation[]> {
    return seedLocations.map((l) => ({
      ...l,
      zhDescription: zhLocationDescriptions[l.id] ?? null,
    }));
  }

  async getEvents(filters: EventFilters = {}): Promise<EventDTO[]> {
    const q = filters.q?.toLowerCase().trim();
    let out = seedEvents.filter((e) => {
      if (filters.civilizationId && e.civilizationId !== filters.civilizationId) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.from !== undefined && (e.year < filters.from)) return false;
      if (filters.to !== undefined && e.year > filters.to) return false;
      if (filters.personId && !eventsPeople.some((r) => r.personId === filters.personId && r.eventId === e.id)) return false;
      if (filters.locationId && e.locationId !== filters.locationId) return false;
      if (q) {
        const hay = `${e.title} ${e.chineseTitle} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => a.year - b.year);
    const limit = filters.limit ?? 200;
    return out.slice(0, limit).map(enrichEvent);
  }

  async getEventById(id: string): Promise<EventDTO | null> {
    const event = seedEvents.find((e) => e.id === id);
    return event ? enrichEvent(event) : null;
  }

  async getPeople(filters: { civilizationId?: string; q?: string } = {}): Promise<PersonDTO[]> {
    const q = filters.q?.toLowerCase().trim();
    const out = seedPeople.filter((p) => {
      if (filters.civilizationId && p.civilizationId !== filters.civilizationId) return false;
      if (q) {
        const hay = `${p.name} ${p.chineseName} ${p.role} ${p.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return out
      .sort((a, b) => b.importance - a.importance)
      .map(enrichPerson);
  }

  async getRelationships(): Promise<RelationshipDTO[]> {
    return seedRelationships.map(enrichRelationship);
  }

  async getTerritories(year?: number): Promise<TerritoryDTO[]> {
    let out = seedTerritories;
    if (year !== undefined) {
      out = out.filter((t) => t.validFrom <= year && year <= t.validTo);
    }
    return out.map(enrichTerritory);
  }

  async getOverview(): Promise<OverviewDTO> {
    const events = seedEvents.map(enrichEvent);

    const buckets: { start: number; end: number }[] = [
      { start: 600, end: 699 },
      { start: 700, end: 799 },
      { start: 800, end: 899 },
      { start: 900, end: 999 },
    ];
    const comparison: CenturyComparison[] = buckets.map((b) => {
      const inRange = events.filter((e) => e.year >= b.start && e.year <= b.end);
      return {
        century: centuryLabel(b.start),
        startYear: b.start,
        china: inRange.filter((e) => e.civilizationId === "c-tang").length,
        world: inRange.filter((e) => e.civilizationId !== "c-tang").length,
      };
    });

    const parallelEvents: ParallelEvent[] = buckets.map((b) => {
      const inRange = events.filter((e) => e.year >= b.start && e.year <= b.end);
      const bySig = (list: EventDTO[]) =>
        [...list].sort((a, z) => z.significance - a.significance || a.year - z.year)[0] ?? null;
      return {
        year: b.start,
        china: bySig(inRange.filter((e) => e.civilizationId === "c-tang")),
        world: bySig(inRange.filter((e) => e.civilizationId !== "c-tang")),
      };
    });

    const featuredEvents = [...events]
      .filter((e) => e.year >= 600 && e.year <= 950)
      .sort((a, b) => b.significance - a.significance || a.year - b.year)
      .slice(0, 8);

    const years = events.map((e) => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      stats: {
        events: events.length,
        people: seedPeople.length,
        civilizations: seedCivilizations.length,
        locations: seedLocations.length,
        relationships: seedRelationships.length,
        yearsCovered: `${minYear} – ${maxYear}`,
      },
      comparison,
      parallelEvents,
      featuredEvents,
      civilizations: seedCivilizations,
    };
  }
}

/* ── Postgres repository ───────────────────────────────────────────── */

class PostgresRepository implements Repository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  private async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.pool.query(text, params);
    return res.rows as T[];
  }

  async getCivilizations(): Promise<Civilization[]> {
    return this.query<Civilization>(
      `SELECT id, name, chinese_name AS "chineseName", region,
              start_year AS "startYear", end_year AS "endYear", color, summary,
              summary_zh AS "zhSummary", name_type AS "nameType", name_note AS "nameNote"
       FROM civilizations ORDER BY start_year`,
    );
  }

  async getLocations(): Promise<HistoricalLocation[]> {
    return this.query<HistoricalLocation>(
      `SELECT id, name, chinese_name AS "chineseName", latitude, longitude,
              civilization_id AS "civilizationId", modern_country AS "modernCountry",
              description, description_zh AS "zhDescription"
       FROM locations ORDER BY name`,
    );
  }

  async getEvents(filters: EventFilters = {}): Promise<EventDTO[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    const push = (clause: string, value: unknown) => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };
    if (filters.civilizationId) push("e.civilization_id = ?", filters.civilizationId);
    if (filters.category) push("e.category = ?", filters.category);
    if (filters.from !== undefined) push("e.year >= ?", filters.from);
    if (filters.to !== undefined) push("e.year <= ?", filters.to);
    if (filters.q) push("(e.title ILIKE ? OR e.description ILIKE ?)", `%${filters.q}%`);
    if (filters.personId)
      push("EXISTS (SELECT 1 FROM events_people ep WHERE ep.event_id = e.id AND ep.person_id = ?)", filters.personId);
    if (filters.locationId) push("e.location_id = ?", filters.locationId);

    const limit = filters.limit ?? 200;
    params.push(limit);
    const sql = `
      SELECT e.id, e.title, e.chinese_title AS "chineseTitle", e.year, e.year_end AS "yearEnd",
             e.category, e.significance, e.civilization_id AS "civilizationId",
             e.location_id AS "locationId", e.tags, e.description,
             e.description_zh AS "zhDescription", e.participants,
             e.participant_roles AS "participantRoles",
             e.date_provenance AS "dateProvenance",
             c.name AS "civilizationName", c.color AS "civilizationColor",
             l.name AS "locationName", l.latitude, l.longitude,
             COALESCE((
               SELECT array_agg(p.name ORDER BY array_position(e.participants, p.id))
               FROM events_people ep JOIN people p ON p.id = ep.person_id
               WHERE ep.event_id = e.id
             ), '{}') AS "participantsNames"
      FROM events e
      JOIN civilizations c ON c.id = e.civilization_id
      LEFT JOIN locations l ON l.id = e.location_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY e.year
      LIMIT $${params.length}`;
    return this.query<EventDTO>(sql, params);
  }

  async getEventById(id: string): Promise<EventDTO | null> {
    const rows = await this.query<EventDTO>(
      `SELECT e.id, e.title, e.chinese_title AS "chineseTitle", e.year, e.year_end AS "yearEnd",
              e.category, e.significance, e.civilization_id AS "civilizationId",
              e.location_id AS "locationId", e.tags, e.description,
              e.description_zh AS "zhDescription", e.participants,
              e.participant_roles AS "participantRoles",
              e.date_provenance AS "dateProvenance",
              c.name AS "civilizationName", c.color AS "civilizationColor",
              l.name AS "locationName", l.latitude, l.longitude,
              COALESCE((
                SELECT array_agg(p.name ORDER BY array_position(e.participants, p.id))
                FROM events_people ep JOIN people p ON p.id = ep.person_id
                WHERE ep.event_id = e.id
              ), '{}') AS "participantsNames"
       FROM events e
       JOIN civilizations c ON c.id = e.civilization_id
       LEFT JOIN locations l ON l.id = e.location_id
       WHERE e.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async getPeople(filters: { civilizationId?: string; q?: string } = {}): Promise<PersonDTO[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filters.civilizationId) {
      params.push(filters.civilizationId);
      where.push(`p.civilization_id = $${params.length}`);
    }
    if (filters.q) {
      params.push(`%${filters.q}%`);
      where.push(`(p.name ILIKE $${params.length} OR p.role ILIKE $${params.length})`);
    }
    return this.query<PersonDTO>(
      `SELECT p.id, p.name, p.chinese_name AS "chineseName", p.birth_year AS "birthYear",
              p.death_year AS "deathYear", p.role, p.importance,
              p.civilization_id AS "civilizationId", p.summary,
              p.summary_zh AS "zhSummary", p.provenance AS "provenance",
              c.name AS "civilizationName", c.color AS "civilizationColor"
       FROM people p LEFT JOIN civilizations c ON c.id = p.civilization_id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY p.importance DESC`,
      params,
    );
  }

  async getRelationships(): Promise<RelationshipDTO[]> {
    return this.query<RelationshipDTO>(
      `SELECT r.id, r.source_person_id AS "sourcePersonId", r.target_person_id AS "targetPersonId",
              r.type, r.description, r.description_zh AS "zhDescription",
              r.start_year AS "startYear", r.end_year AS "endYear",
              s.name AS "sourceName", t.name AS "targetName"
       FROM relationships r
       JOIN people s ON s.id = r.source_person_id
       JOIN people t ON t.id = r.target_person_id`,
    );
  }

  async getTerritories(year?: number): Promise<TerritoryDTO[]> {
    const where = year !== undefined ? "WHERE t.valid_from <= $1 AND $1 <= t.valid_to" : "";
    const params = year !== undefined ? [year] : [];
    return this.query<TerritoryDTO>(
      `SELECT t.id, t.name, t.civilization_id AS "civilizationId",
              t.valid_from AS "validFrom", t.valid_to AS "validTo",
              t.geojson, t.source, t.confidence, t.name_zh AS "zhName",
              c.name AS "civilizationName", c.color AS "civilizationColor"
       FROM territories t
       JOIN civilizations c ON c.id = t.civilization_id
       ${where}
       ORDER BY t.valid_from`,
      params,
    );
  }

  async getOverview(): Promise<OverviewDTO> {
    const [civilizations, events, people, relationships, locations] = await Promise.all([
      this.getCivilizations(),
      this.getEvents(),
      this.getPeople(),
      this.getRelationships(),
      this.getLocations(),
    ]);
    const buckets = [600, 700, 800, 900];
    const comparison: CenturyComparison[] = [];
    const parallelEvents: ParallelEvent[] = [];
    for (const start of buckets) {
      const inRange = events.filter((e) => e.year >= start && e.year <= start + 99);
      const china = inRange.filter((e) => e.civilizationId === "c-tang");
      const world = inRange.filter((e) => e.civilizationId !== "c-tang");
      const top = (list: EventDTO[]) =>
        [...list].sort((a, z) => z.significance - a.significance || a.year - z.year)[0] ?? null;
      comparison.push({
        century: centuryLabel(start),
        startYear: start,
        china: china.length,
        world: world.length,
      });
      parallelEvents.push({ year: start, china: top(china), world: top(world) });
    }
    const years = events.map((e) => e.year);
    return {
      stats: {
        events: events.length,
        people: people.length,
        civilizations: civilizations.length,
        locations: locations.length,
        relationships: relationships.length,
        yearsCovered: `${Math.min(...years)} – ${Math.max(...years)}`,
      },
      comparison,
      parallelEvents,
      featuredEvents: [...events]
        .filter((e) => e.year >= 600 && e.year <= 950)
        .sort((a, b) => b.significance - a.significance || a.year - b.year)
        .slice(0, 8),
      civilizations,
    };
  }
}

/* ── singleton resolution ──────────────────────────────────────────── */

let seedRepo: SeedRepository | null = null;
let pgRepo: PostgresRepository | null = null;

export function getRepository(): Repository {
  if (process.env.DATABASE_URL) {
    pgRepo ??= new PostgresRepository();
    return pgRepo;
  }
  seedRepo ??= new SeedRepository();
  return seedRepo;
}

export function repositoryMode(): "postgres" | "seed" {
  return process.env.DATABASE_URL ? "postgres" : "seed";
}

/** "600-699" → "7th century" (years 601–700 belong to the 7th century). */
export function centuryLabel(startYear: number): string {
  return `${Math.ceil((startYear + 1) / 100)}th century`;
}
