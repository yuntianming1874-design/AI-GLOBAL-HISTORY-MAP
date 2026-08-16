/**
 * Seed the PostgreSQL database from src/data/seed/*.ts (idempotent upserts).
 *
 * Usage:
 *   DATABASE_URL=postgres://... npm run seed:db            # requires existing schema
 *   DATABASE_URL=postgres://... npm run seed:db -- --schema # also applies db/schema.sql
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import {
  civilizations,
  events,
  locations,
  people,
  relationships,
  territories,
} from "../src/data/seed";
import { ENTITY_SOURCES } from "../src/data/seed/entitySources";
import { zhCivilizationSummaries } from "../src/data/seed/zhMisc";
import { zhLocationDescriptions } from "../src/data/seed/zhMisc";
import { zhTerritoryNames } from "../src/data/seed/zhMisc";
import { zhEventDescriptions } from "../src/data/seed/zhEvents";
import { zhPersonSummaries, zhRelationshipDescriptions } from "../src/data/seed/zhPeopleRelationships";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — nothing to seed.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });

  if (process.argv.includes("--schema")) {
    const schema = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
    console.log("Applying db/schema.sql…");
    await pool.query(schema);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const c of civilizations) {
      await client.query(
        `INSERT INTO civilizations (id, name, chinese_name, region, start_year, end_year, color, summary, summary_zh, name_type, name_note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, chinese_name=EXCLUDED.chinese_name,
           region=EXCLUDED.region, start_year=EXCLUDED.start_year, end_year=EXCLUDED.end_year,
           color=EXCLUDED.color, summary=EXCLUDED.summary, summary_zh=EXCLUDED.summary_zh,
           name_type=EXCLUDED.name_type, name_note=EXCLUDED.name_note`,
        [c.id, c.name, c.chineseName, c.region, c.startYear, c.endYear, c.color, c.summary, zhCivilizationSummaries[c.id] ?? null, c.nameType ?? null, c.nameNote ?? null],
      );
    }
    console.log(`✓ civilizations: ${civilizations.length}`);

    for (const l of locations) {
      await client.query(
        `INSERT INTO locations (id, name, chinese_name, latitude, longitude, civilization_id, modern_country, description, description_zh)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, chinese_name=EXCLUDED.chinese_name,
           latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
           civilization_id=EXCLUDED.civilization_id, modern_country=EXCLUDED.modern_country,
           description=EXCLUDED.description, description_zh=EXCLUDED.description_zh`,
        [l.id, l.name, l.chineseName, l.latitude, l.longitude, l.civilizationId, l.modernCountry, l.description, zhLocationDescriptions[l.id] ?? null],
      );
    }
    console.log(`✓ locations: ${locations.length}`);

    for (const e of events) {
      await client.query(
        `INSERT INTO events (id, title, chinese_title, year, year_end, category, significance,
                             civilization_id, location_id, tags, description, description_zh,
                             participants, participant_roles, date_provenance)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, chinese_title=EXCLUDED.chinese_title,
           year=EXCLUDED.year, year_end=EXCLUDED.year_end, category=EXCLUDED.category,
           significance=EXCLUDED.significance, civilization_id=EXCLUDED.civilization_id,
           location_id=EXCLUDED.location_id, tags=EXCLUDED.tags, description=EXCLUDED.description,
           description_zh=EXCLUDED.description_zh,
           participants=EXCLUDED.participants, participant_roles=EXCLUDED.participant_roles,
           date_provenance=EXCLUDED.date_provenance`,
        [
          e.id, e.title, e.chineseTitle, e.year, e.yearEnd, e.category, e.significance,
          e.civilizationId, e.locationId, e.tags, e.description, zhEventDescriptions[e.id] ?? null,
          e.participants, JSON.stringify(e.participantRoles ?? {}),
          e.dateProvenance ? JSON.stringify(e.dateProvenance) : null,
        ],
      );
    }
    console.log(`✓ events: ${events.length}`);

    for (const p of people) {
      await client.query(
        `INSERT INTO people (id, name, chinese_name, birth_year, death_year, role, importance, civilization_id, summary, summary_zh, provenance)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, chinese_name=EXCLUDED.chinese_name,
           birth_year=EXCLUDED.birth_year, death_year=EXCLUDED.death_year, role=EXCLUDED.role,
           importance=EXCLUDED.importance, civilization_id=EXCLUDED.civilization_id,
           summary=EXCLUDED.summary, summary_zh=EXCLUDED.summary_zh,
           provenance=EXCLUDED.provenance`,
        [p.id, p.name, p.chineseName, p.birthYear, p.deathYear, p.role, p.importance, p.civilizationId, p.summary, zhPersonSummaries[p.id] ?? null, p.provenance ? JSON.stringify(p.provenance) : null],
      );
    }
    console.log(`✓ people: ${people.length}`);

    for (const r of relationships) {
      await client.query(
        `INSERT INTO relationships (id, source_person_id, target_person_id, type, description, description_zh, start_year, end_year)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET source_person_id=EXCLUDED.source_person_id,
           target_person_id=EXCLUDED.target_person_id, type=EXCLUDED.type,
           description=EXCLUDED.description, description_zh=EXCLUDED.description_zh,
           start_year=EXCLUDED.start_year, end_year=EXCLUDED.end_year`,
        [r.id, r.sourcePersonId, r.targetPersonId, r.type, r.description, zhRelationshipDescriptions[r.id] ?? null, r.startYear, r.endYear],
      );
    }
    console.log(`✓ relationships: ${relationships.length}`);

    for (const t of territories) {
      await client.query(
        `INSERT INTO territories (id, name, civilization_id, valid_from, valid_to, geojson, source, confidence, name_zh)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,
           civilization_id=EXCLUDED.civilization_id, valid_from=EXCLUDED.valid_from,
           valid_to=EXCLUDED.valid_to, geojson=EXCLUDED.geojson,
           source=EXCLUDED.source, confidence=EXCLUDED.confidence, name_zh=EXCLUDED.name_zh`,
        [t.id, t.name, t.civilizationId, t.validFrom, t.validTo, JSON.stringify(t.geojson), t.source, t.confidence, zhTerritoryNames[t.id] ?? null],
      );
    }
    console.log(`✓ territories: ${territories.length}`);

    // V0.2.2 → P2-12: 实体来源层（URL 一律 null + pending，待人工确认）
    for (const src of ENTITY_SOURCES) {
      await client.query(
        `INSERT INTO entity_sources (id, entity_id, entity_type, fact_key, source_title, source_url, source_type, authority_level, review_status, note)
         VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [
          src.entityId, src.entityType, src.factKey ?? null, src.sourceTitle,
          src.sourceUrl ?? null, src.sourceType, src.authorityLevel,
          src.reviewStatus, src.note ?? null,
        ],
      );
    }
    console.log(`✓ entity_sources: ${ENTITY_SOURCES.length}`);

    // normalized join table (idempotent rebuild) with roles
    await client.query("DELETE FROM events_people");
    let joins = 0;
    for (const e of events) {
      for (const personId of e.participants) {
        await client.query(
          "INSERT INTO events_people (event_id, person_id, role) VALUES ($1,$2,$3)",
          [e.id, personId, e.participantRoles?.[personId] ?? "participant"],
        );
        joins += 1;
      }
    }
    console.log(`✓ events_people: ${joins} participant links`);

    await client.query("COMMIT");
    console.log("Seed complete ✓");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
