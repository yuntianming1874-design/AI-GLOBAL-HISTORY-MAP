# AI Global History Map — Database Design

Full DDL lives in `db/schema.sql`. This document explains the model.

## 1. Entity–Relationship Overview

```
civilizations 1───* events
civilizations 1───* people
civilizations 1───* locations
locations     1───* events          (event happened at a location)
people        1───* relationships   (source_person_id)
people        1───* relationships   (target_person_id)
events        *───* people          via events_people (participants)
```

## 2. Tables

### civilizations
Historical states/eras used as timeline bands, map regions, and graph node colors.

| column | type | notes |
|---|---|---|
| id | `text PK` | stable slug, e.g. `c-tang` |
| name / chinese_name | `text` | bilingual display |
| region | `text` | East Asia, West Asia, Europe, South Asia, Southeast Asia, Americas |
| start_year / end_year | `int` | full lifespan (e.g. Tang 618–907) |
| color | `text` | hex, used by every visualization via `lib/theme.ts` |
| summary | `text` | 1–3 sentence description |

### locations
Geographic anchors for events and people (modern coordinates).

| column | type | notes |
|---|---|---|
| id | `text PK` | e.g. `loc-changan` |
| name / chinese_name | `text` | |
| latitude / longitude | `double` | decimal degrees |
| civilization_id | `text FK` | usually the seat of that civilization |
| modern_country | `text` | for map context |
| description | `text` | |

### events
The core timeline entity. Supports point-in-time and ranged events.

| column | type | notes |
|---|---|---|
| id | `text PK` | e.g. `e-755-anlushan` |
| title / chinese_title | `text` | |
| year / year_end | `int nullable` | `year_end` null ⇒ point event; else span |
| category | `text` | political · military · cultural · economic · religious · technological · diplomatic |
| significance | `smallint 1–5` | drives dot size / star rating |
| civilization_id | `text FK` | primary actor |
| location_id | `text FK` | primary setting |
| tags | `text[]` | filterable keywords (e.g. `rebellion`, `silk-road`) |
| participants | `text[]` | denormalized person ids (normalized in events_people) |
| description | `text` | 2–4 sentences |

### people
Historical figures for the relationship graph.

| column | type | notes |
|---|---|---|
| id | `text PK` | e.g. `p-taizong` |
| name / chinese_name | `text` | |
| birth_year / death_year | `int nullable` | |
| role | `text` | emperor, poet, general, scholar, monk, caliph, … |
| importance | `smallint 1–5` | drives node radius |
| civilization_id | `text FK nullable` | null for pre-era figures (e.g. Muhammad) |
| summary | `text` | |

### relationships
Directed edges between people (rendered as undirected edges).

| column | type | notes |
|---|---|---|
| id | `text PK` | |
| source_person_id / target_person_id | `text FK` | |
| type | `text` | family · mentor · student · friend · rival · enemy · patron · colleague |
| description | `text` | evidence sentence |
| start_year / end_year | `int nullable` | active window |

### events_people
Normalized join table (schema-ready; participants already flow through the seed).

| column | type | notes |
|---|---|---|
| event_id | `text FK` | |
| person_id | `text FK` | |
| role | `text` | instigator, participant, witness |

## 3. Indexes

```sql
CREATE INDEX idx_events_year        ON events (year);
CREATE INDEX idx_events_civ         ON events (civilization_id);
CREATE INDEX idx_events_location    ON events (location_id);
CREATE INDEX idx_events_category    ON events (category);
CREATE INDEX idx_people_civ         ON people (civilization_id);
CREATE INDEX idx_locations_civ      ON locations (civilization_id);
CREATE INDEX idx_relationships_src  ON relationships (source_person_id);
CREATE INDEX idx_relationships_dst  ON relationships (target_person_id);
CREATE INDEX idx_events_tags_gin    ON events USING GIN (tags);
```

## 4. Seed Strategy

- **Source of truth**: `src/data/seed/*.ts` — 142 hand-curated entities with stable
  string IDs that cross-reference each other (events → civilizations/locations/people,
  relationships → people).
- **Postgres path**: `scripts/seed-db.ts` (`npm run seed:db`) upserts the TS seed into
  the tables via `ON CONFLICT (id) DO UPDATE`, so re-seeding is idempotent; pass
  `-- --schema` to apply `db/schema.sql` first.
- **Fallback path**: `SeedRepository` serves the same TS modules directly from memory.
- **Integrity**: `scripts/validate-seed.ts` (`npm run validate:seed`) verifies that every
  FK reference resolves, years are sane (start ≤ end), ids are unique, counts meet the
  MVP bar (≥100 entities), and every civilization/person has coverage.

## 5. Example Queries

```sql
-- Events in the Tang capital during the An Lushan era
SELECT e.title, e.year FROM events e
JOIN locations l ON l.id = e.location_id
WHERE e.year BETWEEN 755 AND 763 AND l.name = 'Chang''an';

-- People connected to Taizong, with relation type
SELECT p2.name, r.type FROM relationships r
JOIN people p1 ON p1.id = r.source_person_id
JOIN people p2 ON p2.id = r.target_person_id
WHERE p1.id = 'p-taizong';
```
