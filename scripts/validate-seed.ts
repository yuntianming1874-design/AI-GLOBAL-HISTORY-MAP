/**
 * Seed data integrity check. Run: npm run validate:seed
 * Verifies FK references, year sanity, unique ids, counts and coverage.
 */
import {
  civilizations,
  events,
  locations,
  people,
  relationships,
  territories,
} from "../src/data/seed";
import { zhEventDescriptions } from "../src/data/seed/zhEvents";
import {
  zhPersonSummaries,
  zhRelationshipDescriptions,
} from "../src/data/seed/zhPeopleRelationships";
import {
  zhCivilizationSummaries,
  zhLocationDescriptions,
  zhTerritoryNames,
} from "../src/data/seed/zhMisc";
import { EXTRA_ALIASES } from "../src/data/seed/aliases";

const errors: string[] = [];
const warnings: string[] = [];

const VALID_CATEGORIES = [
  "political",
  "military",
  "cultural",
  "economic",
  "religious",
  "technological",
  "diplomatic",
];
const VALID_TYPES = [
  "family",
  "mentor",
  "student",
  "friend",
  "rival",
  "enemy",
  "patron",
  "colleague",
];

const idKind = new Map<string, string>();
function register(list: { id: string }[], kind: string) {
  for (const e of list) {
    if (idKind.has(e.id)) errors.push(`duplicate id "${e.id}" (${kind})`);
    idKind.set(e.id, kind);
  }
}

register(civilizations, "civilization");
register(locations, "location");
register(events, "event");
register(people, "person");
register(relationships, "relationship");
register(territories, "territory");

/* civilizations */
for (const c of civilizations) {
  if (c.startYear > c.endYear) errors.push(`civilization ${c.id}: startYear > endYear`);
}

/* locations */
for (const l of locations) {
  if (l.civilizationId && !idKind.has(l.civilizationId)) {
    errors.push(`location ${l.id}: unknown civilization ${l.civilizationId}`);
  }
}

/* events */
for (const e of events) {
  if (!idKind.has(e.civilizationId)) {
    errors.push(`event ${e.id}: unknown civilization ${e.civilizationId}`);
  }
  if (e.locationId && !idKind.has(e.locationId)) {
    errors.push(`event ${e.id}: unknown location ${e.locationId}`);
  }
  if (e.yearEnd !== null && e.yearEnd < e.year) {
    errors.push(`event ${e.id}: yearEnd ${e.yearEnd} < year ${e.year}`);
  }
  if (!VALID_CATEGORIES.includes(e.category)) {
    errors.push(`event ${e.id}: invalid category ${e.category}`);
  }
  if (e.significance < 1 || e.significance > 5) {
    errors.push(`event ${e.id}: significance out of range ${e.significance}`);
  }
  if (e.tags.length === 0) warnings.push(`event ${e.id}: no tags`);
  for (const p of e.participants) {
    if (!idKind.has(p)) errors.push(`event ${e.id}: unknown participant ${p}`);
  }
  for (const [pid, role] of Object.entries(e.participantRoles ?? {})) {
    if (!e.participants.includes(pid)) {
      errors.push(`event ${e.id}: participantRoles key ${pid} not in participants`);
    }
    if (role !== undefined && !(["instigator", "participant", "witness"] as string[]).includes(role)) {
      errors.push(`event ${e.id}: invalid participant role "${role}" for ${pid}`);
    }
  }
}

/* people */
for (const p of people) {
  if (p.civilizationId && !idKind.has(p.civilizationId)) {
    errors.push(`person ${p.id}: unknown civilization ${p.civilizationId}`);
  }
  if (p.birthYear !== null && p.deathYear !== null && p.birthYear > p.deathYear) {
    errors.push(`person ${p.id}: birthYear > deathYear`);
  }
  if (p.importance < 1 || p.importance > 5) {
    errors.push(`person ${p.id}: importance out of range`);
  }
}

/* relationships */
for (const r of relationships) {
  if (!idKind.has(r.sourcePersonId) || !idKind.has(r.targetPersonId)) {
    errors.push(`relationship ${r.id}: unknown person endpoint`);
  }
  if (!VALID_TYPES.includes(r.type)) {
    errors.push(`relationship ${r.id}: invalid type ${r.type}`);
  }
  if (r.startYear !== null && r.endYear !== null && r.startYear > r.endYear) {
    errors.push(`relationship ${r.id}: startYear > endYear`);
  }
}

/* territories */
const VALID_CONFIDENCE = ["high", "medium", "low", "schematic"];
function ringsOf(t: { geojson: { type: string; coordinates: unknown } }): [number, number][][] {
  if (t.geojson.type === "Polygon") return t.geojson.coordinates as [number, number][][];
  return (t.geojson.coordinates as [number, number][][][]).flat();
}
for (const t of territories) {
  if (!idKind.has(t.civilizationId)) {
    errors.push(`territory ${t.id}: unknown civilization ${t.civilizationId}`);
  }
  if (t.validFrom > t.validTo) {
    errors.push(`territory ${t.id}: validFrom > validTo`);
  }
  if (!VALID_CONFIDENCE.includes(t.confidence)) {
    errors.push(`territory ${t.id}: invalid confidence ${t.confidence}`);
  }
  const rings = ringsOf(t);
  if (rings.length === 0) {
    errors.push(`territory ${t.id}: no polygon rings`);
  }
  for (const ring of rings) {
    if (ring.length < 4) {
      errors.push(`territory ${t.id}: ring needs >= 4 points`);
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
      errors.push(`territory ${t.id}: polygon ring must be closed`);
    }
    for (const [lon, lat] of ring) {
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        errors.push(`territory ${t.id}: coordinate out of range [${lon}, ${lat}]`);
      }
    }
  }
}

/* i18n coverage: every entity must have a Simplified-Chinese text */
for (const e of events) {
  if (!zhEventDescriptions[e.id]) errors.push(`event ${e.id}: missing zhDescription`);
}
for (const p of people) {
  if (!zhPersonSummaries[p.id]) errors.push(`person ${p.id}: missing zhSummary`);
}
for (const r of relationships) {
  if (!zhRelationshipDescriptions[r.id]) errors.push(`relationship ${r.id}: missing zhDescription`);
}
for (const c of civilizations) {
  if (!zhCivilizationSummaries[c.id]) errors.push(`civilization ${c.id}: missing zhSummary`);
}
for (const l of locations) {
  if (!zhLocationDescriptions[l.id]) errors.push(`location ${l.id}: missing zhDescription`);
}
for (const t of territories) {
  if (!zhTerritoryNames[t.id]) errors.push(`territory ${t.id}: missing zhName`);
}

/* ── V0.2.2 数据质量门禁（Historical Provenance Layer）─────────────── */
import type { HistoricalDateValue } from "../src/lib/provenance";

function gateDate(
  who: string,
  v: HistoricalDateValue | undefined,
  required: boolean,
) {
  if (!v) {
    if (required) errors.push(`${who}: missing dateProvenance`);
    return;
  }
  const PRECISIONS = ["exact", "approximate", "range", "century", "unknown"];
  const CONFIDENCES = ["high", "medium", "low", "disputed", "unverified"];
  if (!PRECISIONS.includes(v.precision)) {
    errors.push(`${who}: invalid precision "${v.precision}"`);
  }
  if (!CONFIDENCES.includes(v.confidence)) {
    errors.push(`${who}: invalid confidence "${v.confidence}"`);
  }
  // disputed → 必须带 alternatives 或 note（禁止无依据地标 disputed）
  if (v.confidence === "disputed" && !(v.alternatives?.length || v.note)) {
    errors.push(`${who}: confidence=disputed 必须提供 alternatives 或 note`);
  }
  // range → yearMax >= year（无 yearMax 时与 year 相同视为点区间，允许）
  if (v.precision === "range" && v.year !== undefined && v.yearMax !== undefined && v.yearMax < v.year) {
    errors.push(`${who}: range yearMax ${v.yearMax} < year ${v.year}`);
  }
  if (
    v.precision === "range" &&
    v.year !== undefined &&
    v.yearMax === undefined &&
    !(v.alternatives && v.alternatives.length > 0)
  ) {
    warnings.push(`${who}: precision=range 无 yearMax 且无 alternatives`);
  }
  // unknown → 必须带 note 说明（禁止空置 unknown）
  if (v.precision === "unknown" && !v.note) {
    errors.push(`${who}: precision=unknown 必须提供 note 说明`);
  }
  // alternatives 必须是数字且与主年份不同
  for (const a of v.alternatives ?? []) {
    if (typeof a !== "number" || !Number.isInteger(a)) {
      errors.push(`${who}: alternative year 非整数 "${a}"`);
    }

  }
}

/* 人物 provenance */
for (const p of people) {
  const pr = p.provenance;
  if (!pr) {
    warnings.push(`person ${p.id}: 无 provenance（可选项，但建议补充）`);
    continue;
  }
  if (pr.birth) {
    gateDate(`person ${p.id} birth`, pr.birth, false);
    // duplicated facts：数值字段与 provenance 必须一致
    if (p.birthYear !== null && pr.birth.year !== undefined && pr.birth.year !== p.birthYear) {
      errors.push(`person ${p.id}: provenance.birth.year=${pr.birth.year} 与 birthYear=${p.birthYear} 不一致`);
    }
  }
  if (pr.death) {
    gateDate(`person ${p.id} death`, pr.death, false);
    if (p.deathYear !== null && pr.death.year !== undefined && pr.death.year !== p.deathYear) {
      errors.push(`person ${p.id}: provenance.death.year=${pr.death.year} 与 deathYear=${p.deathYear} 不一致`);
    }
  }
  // 角色区间有效性
  for (const r of pr.roles ?? []) {
    if (!r.role || r.role.trim().length === 0) {
      errors.push(`person ${p.id}: 角色名为空`);
    }
    const from = r.validFrom?.year;
    const to = r.validTo?.year;
    if (from !== undefined && to !== undefined && from > to) {
      errors.push(`person ${p.id} role "${r.role}": validFrom ${from} > validTo ${to}`);
    }
    if (!["high", "medium", "low", "disputed", "unverified"].includes(r.confidence)) {
      errors.push(`person ${p.id} role "${r.role}": invalid confidence "${r.confidence}"`);
    }
    if (r.validFrom) gateDate(`person ${p.id} role "${r.role}" validFrom`, r.validFrom, false);
    if (r.validTo) gateDate(`person ${p.id} role "${r.role}" validTo`, r.validTo, false);
  }
  // 来源门禁：verified → 必须 sourceTitle；URL 必须合法或 null
  for (const src of pr.sources ?? []) {
    if (!src.sourceTitle || src.sourceTitle.trim().length === 0) {
      errors.push(`person ${p.id}: source 缺 sourceTitle`);
    }
    if (src.reviewStatus === "verified" && !src.sourceTitle) {
      errors.push(`person ${p.id}: reviewStatus=verified 必须带 sourceTitle`);
    }
    if (src.sourceUrl !== undefined && src.sourceUrl !== null) {
      const u = src.sourceUrl;
      if (!/^https?:\/\//.test(u)) {
        errors.push(`person ${p.id}: sourceUrl 非法（${u}）——必须 null 或 http(s) 链接`);
      }
    }
  }
}

/* 事件 dateProvenance */
for (const e of events) {
  gateDate(`event ${e.id}`, e.dateProvenance, false);
  const dp = e.dateProvenance;
  if (dp) {
    if (dp.year !== undefined && dp.year !== e.year) {
      errors.push(`event ${e.id}: dateProvenance.year=${dp.year} 与 year=${e.year} 不一致`);
    }
    if (dp.yearMax !== undefined && e.yearEnd !== null && dp.yearMax !== e.yearEnd) {
      errors.push(`event ${e.id}: dateProvenance.yearMax=${dp.yearMax} 与 yearEnd=${e.yearEnd} 不一致`);
    }
  }
}

/* 文明名称类型 */
for (const c of civilizations) {
  if (c.nameType && !["contemporary", "modern_scholarly", "retrospective"].includes(c.nameType)) {
    errors.push(`civilization ${c.id}: invalid nameType "${c.nameType}"`);
  }
  if (c.nameType && !c.nameNote) {
    warnings.push(`civilization ${c.id}: 有 nameType 但缺 nameNote`);
  }
}

/* ── V0.2.2 → P2-12：entity_sources 数据校验 ──────────────────────────── */
import { ENTITY_SOURCES } from "../src/data/seed/entitySources";

const SOURCE_TYPES = ["primary", "peer_reviewed", "university_press", "museum", "reference", "web"];
const AUTHORITY = ["A", "B", "C", "D", "E"];
const REVIEW = ["verified", "pending"];
{
  const seenSrc = new Set<string>();
  for (const src of ENTITY_SOURCES) {
    if (!idKind.has(src.entityId)) {
      errors.push(`entity source: unknown entity ${src.entityType}:${src.entityId}`);
    }
    if (src.entityType !== idKind.get(src.entityId)) {
      errors.push(`entity source: type mismatch for ${src.entityId} (${src.entityType} vs ${idKind.get(src.entityId)})`);
    }
    if (!src.sourceTitle || src.sourceTitle.trim().length < 3) {
      errors.push(`entity source ${src.entityId}: empty sourceTitle`);
    }
    if (src.sourceUrl !== undefined && src.sourceUrl !== null) {
      if (!/^https?:\/\//.test(src.sourceUrl)) {
        errors.push(`entity source ${src.entityId}: sourceUrl 非法（必须 null 或 http(s) 链接）`);
      }
    }
    if (!SOURCE_TYPES.includes(src.sourceType)) {
      errors.push(`entity source ${src.entityId}: invalid sourceType ${src.sourceType}`);
    }
    if (!AUTHORITY.includes(src.authorityLevel)) {
      errors.push(`entity source ${src.entityId}: invalid authorityLevel ${src.authorityLevel}`);
    }
    if (!REVIEW.includes(src.reviewStatus)) {
      errors.push(`entity source ${src.entityId}: invalid reviewStatus ${src.reviewStatus}`);
    }
    const key = `${src.entityId}|${src.factKey ?? ""}|${src.sourceTitle}`;
    if (seenSrc.has(key)) errors.push(`entity source: duplicate ${key}`);
    seenSrc.add(key);
  }
  if (ENTITY_SOURCES.length < 10) warnings.push(`entity sources 仅 ${ENTITY_SOURCES.length} 条（目标 ≥10）`);
}

/* alias integrity */
const aliasIds = new Set<string>();
for (const a of EXTRA_ALIASES) {
  if (!idKind.has(a.entityId)) {
    errors.push(`alias "${a.alias}" → unknown entity ${a.entityId}`);
  }
  if (!a.alias || a.alias.trim().length < 2) {
    errors.push(`alias for ${a.entityId} is empty or too short`);
  }
  const key = `${a.entityId}|${a.alias.toLowerCase()}`;
  if (aliasIds.has(key)) errors.push(`duplicate alias "${a.alias}" for ${a.entityId}`);
  aliasIds.add(key);
}
if (EXTRA_ALIASES.length < 40) warnings.push(`only ${EXTRA_ALIASES.length} extra aliases`);

/* coverage */
const total =
  civilizations.length + locations.length + events.length + people.length +
  relationships.length + territories.length;
if (total < 100) errors.push(`total entities ${total} < 100 (requirement)`);
if (civilizations.length < 12) errors.push(`civilizations ${civilizations.length} < 12`);
if (locations.length < 15) errors.push(`locations ${locations.length} < 15`);
if (events.length < 48) errors.push(`events ${events.length} < 48`);
if (people.length !== 25) errors.push(`people ${people.length} != 25`);
if (relationships.length !== 40) errors.push(`relationships ${relationships.length} != 40`);

for (const c of civilizations) {
  if (!events.some((e) => e.civilizationId === c.id)) {
    warnings.push(`civilization ${c.id} has no events`);
  }
}
for (const p of people) {
  if (!relationships.some((r) => r.sourcePersonId === p.id || r.targetPersonId === p.id)) {
    warnings.push(`person ${p.id} has no relationships`);
  }
}

/* report */
if (warnings.length > 0) {
  console.warn(`⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}
if (errors.length > 0) {
  console.error(`✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ Seed data valid — ${civilizations.length} civilizations, ${locations.length} locations, ` +
    `${events.length} events, ${people.length} people, ${relationships.length} relationships, ` +
    `${territories.length} territories (${total} entities)`,
);
