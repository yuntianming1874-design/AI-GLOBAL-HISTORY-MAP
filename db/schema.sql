-- =====================================================================
-- AI Global History Map — PostgreSQL schema (Phase 1 MVP)
-- Apply:  psql "$DATABASE_URL" -f db/schema.sql
-- Seed:   npm run seed:db  (upserts src/data/seed/* into these tables)
-- =====================================================================

CREATE TABLE IF NOT EXISTS civilizations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  chinese_name TEXT NOT NULL,
  region       TEXT NOT NULL,
  start_year   INTEGER NOT NULL,
  end_year     INTEGER NOT NULL,
  color        TEXT NOT NULL,
  summary      TEXT NOT NULL,
  summary_zh   TEXT,
  CHECK (start_year <= end_year)
);

CREATE TABLE IF NOT EXISTS locations (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  chinese_name    TEXT NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  civilization_id TEXT REFERENCES civilizations(id) ON DELETE SET NULL,
  modern_country  TEXT NOT NULL,
  description     TEXT NOT NULL,
  description_zh  TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  chinese_title   TEXT NOT NULL,
  year            INTEGER NOT NULL,
  year_end        INTEGER,
  category        TEXT NOT NULL CHECK (
                    category IN ('political','military','cultural','economic',
                                 'religious','technological','diplomatic')),
  significance    SMALLINT NOT NULL CHECK (significance BETWEEN 1 AND 5),
  civilization_id TEXT NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
  location_id     TEXT REFERENCES locations(id) ON DELETE SET NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  description     TEXT NOT NULL,
  description_zh  TEXT,
  -- denormalized participant ids (normalized form lives in events_people)
  participants    TEXT[] NOT NULL DEFAULT '{}',
  -- person_id → role (instigator | participant | witness); normalized in events_people.role
  participant_roles JSONB NOT NULL DEFAULT '{}'::jsonb,
  CHECK (year_end IS NULL OR year_end >= year)
);

CREATE TABLE IF NOT EXISTS people (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  chinese_name    TEXT NOT NULL,
  birth_year      INTEGER,
  death_year      INTEGER,
  role            TEXT NOT NULL,
  importance      SMALLINT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  civilization_id TEXT REFERENCES civilizations(id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  summary_zh      TEXT,
  CHECK (birth_year IS NULL OR death_year IS NULL OR birth_year <= death_year)
);

CREATE TABLE IF NOT EXISTS relationships (
  id               TEXT PRIMARY KEY,
  source_person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  target_person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (
                     type IN ('family','mentor','student','friend','rival',
                              'enemy','patron','colleague')),
  description      TEXT NOT NULL,
  description_zh   TEXT,
  start_year       INTEGER,
  end_year         INTEGER,
  CHECK (source_person_id <> target_person_id)
);

-- Normalized many-to-many: which people participated in which events.
CREATE TABLE IF NOT EXISTS events_people (
  event_id  TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'participant',
  PRIMARY KEY (event_id, person_id)
);

-- V0.2: schematic/historical territory outlines (GeoJSON polygons).
-- Only shown when valid_from <= currentYear <= valid_to. Seed data is
-- explicitly `schematic` confidence — no fabricated precise borders.
CREATE TABLE IF NOT EXISTS territories (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  civilization_id TEXT NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
  valid_from      INTEGER NOT NULL,
  valid_to        INTEGER NOT NULL,
  geojson         JSONB NOT NULL,
  source          TEXT NOT NULL,
  confidence      TEXT NOT NULL CHECK (
                    confidence IN ('high','medium','low','schematic')),
  name_zh         TEXT,
  CHECK (valid_from <= valid_to)
);

-- V0.3: 事实级来源表（provenance & audit）。只新增表，不改动现有表。
CREATE TABLE IF NOT EXISTS entity_sources (
  id            UUID PRIMARY KEY,
  entity_id     TEXT NOT NULL,
  entity_type   VARCHAR(30) NOT NULL,
  -- 绑定到具体事实（如 'birth' / 'death' / 'role:King of the Franks'）
  fact_key      TEXT,
  source_title  TEXT NOT NULL,
  -- 未经人工确认必须为 NULL（禁止 AI/代码猜测 URL）
  source_url    TEXT,
  source_type   VARCHAR(50) CHECK (
                  source_type IN ('primary','peer_reviewed','university_press',
                                  'museum','reference','web')),
  authority_level VARCHAR(10) CHECK (
                  authority_level IN ('A','B','C','D','E')),
  -- verified = 人工复核过；pending = 待人工复核（默认）
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
                  review_status IN ('verified','pending')),
  note          TEXT,
  reviewed_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_entity_sources_entity ON entity_sources (entity_id, entity_type);

-- i18n upgrade path: add *_zh columns to pre-existing databases
ALTER TABLE civilizations ADD COLUMN IF NOT EXISTS summary_zh TEXT;
ALTER TABLE locations      ADD COLUMN IF NOT EXISTS description_zh TEXT;
ALTER TABLE events         ADD COLUMN IF NOT EXISTS description_zh TEXT;
ALTER TABLE people         ADD COLUMN IF NOT EXISTS summary_zh TEXT;
ALTER TABLE relationships  ADD COLUMN IF NOT EXISTS description_zh TEXT;
ALTER TABLE territories    ADD COLUMN IF NOT EXISTS name_zh TEXT;

-- V0.2.2: Historical Provenance Layer —— 只加列，不改动现有数据/约束。
ALTER TABLE people ADD COLUMN IF NOT EXISTS provenance JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS date_provenance JSONB;
ALTER TABLE civilizations ADD COLUMN IF NOT EXISTS name_type TEXT CHECK (
  name_type IN ('contemporary','modern_scholarly','retrospective'));
ALTER TABLE civilizations ADD COLUMN IF NOT EXISTS name_note TEXT;
-- 兼容旧库：V0.3 已建 entity_sources 后补列
ALTER TABLE entity_sources ADD COLUMN IF NOT EXISTS fact_key TEXT;
ALTER TABLE entity_sources ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
  review_status IN ('verified','pending'));

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_year      ON events (year);
CREATE INDEX IF NOT EXISTS idx_events_civ       ON events (civilization_id);
CREATE INDEX IF NOT EXISTS idx_events_location  ON events (location_id);
CREATE INDEX IF NOT EXISTS idx_events_category  ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_tags_gin  ON events USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_people_civ       ON people (civilization_id);
CREATE INDEX IF NOT EXISTS idx_locations_civ    ON locations (civilization_id);
CREATE INDEX IF NOT EXISTS idx_relationships_src ON relationships (source_person_id);
CREATE INDEX IF NOT EXISTS idx_relationships_dst ON relationships (target_person_id);
CREATE INDEX IF NOT EXISTS idx_territories_civ   ON territories (civilization_id);
CREATE INDEX IF NOT EXISTS idx_territories_years ON territories (valid_from, valid_to);
