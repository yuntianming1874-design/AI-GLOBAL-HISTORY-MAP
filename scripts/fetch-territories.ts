/**
 * Fetch + generate territory seed data from the open "historical-basemaps"
 * dataset (aourednik/historical-basemaps, GPL-3.0).
 *
 *   npm run fetch:territories
 *
 * Extracts the civilizations we cover from the world_800.geojson snapshot,
 * simplifies rings (2-decimal rounding, top-3 rings per feature, dedupe),
 * maps BORDERPRECISION → confidence (1 → low, 2 → medium, 3 → high), and
 * writes src/data/seed/territories.ts with full attribution.
 *
 * NOTE: the dataset's own README states borders are approximate and should
 * be verified before academic use — every generated territory carries
 * `confidence` accordingly. CHGIS-grade data can be dropped into this
 * pipeline later with a better BORDERPRECISION mapping.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { TerritoryGeometry } from "../src/lib/types";

const SNAPSHOT_YEAR = 800;
const VALID_WINDOW = 100; // ±years around the snapshot (indicative)

const SOURCE =
  "aourednik/historical-basemaps (GPL-3.0) world_800.geojson, snapshot year 800 CE; " +
  "BORDERPRECISION=1 (approximate — verify before academic use). " +
  "Rings simplified to 2-decimal precision; validity window ±" + VALID_WINDOW + "y is indicative.";

/** dataset NAME aliases → our civilization + display name + valid window */
const TARGETS: Record<string, { civ: string; name: string; window: [number, number] }> = {
  "Tang Empire": { civ: "c-tang", name: "Tang Empire", window: [700, 900] },
  "Abbasid Caliphate": { civ: "c-abbasid", name: "Abbasid Caliphate", window: [750, 900] },
  "Carolingian Empire": { civ: "c-carolingian", name: "Carolingian Empire", window: [800, 888] },
  "Byzantine Empire": { civ: "c-byzantium", name: "Byzantine Empire", window: [700, 900] },
  "Tibetan Empire": { civ: "c-tibet", name: "Tibetan Empire", window: [700, 842] },
  Khazars: { civ: "c-khazars", name: "Khazar Khaganate", window: [700, 900] },
  "Srivijaya Empire": { civ: "c-srivijaya", name: "Srivijaya", window: [700, 900] },
  Japan: { civ: "c-japan", name: "Nara & Heian Japan", window: [700, 900] },
  Northmen: { civ: "c-vikings", name: "Viking Age Scandinavia", window: [793, 900] },
  "Maya city-states": { civ: "c-maya", name: "Classic Maya lowlands", window: [700, 900] },
  // the dataset spells it "Silia" in the 800 CE snapshot
  Silia: { civ: "c-silla", name: "Unified Silla", window: [700, 900] },
  Silla: { civ: "c-silla", name: "Unified Silla", window: [700, 900] },
};

const MAX_RINGS = 3;

interface GeneratedTerritory {
  id: string;
  name: string;
  civilizationId: string;
  validFrom: number;
  validTo: number;
  geojson: TerritoryGeometry;
  source: string;
  confidence: "low" | "medium" | "high";
}

function ringsOfGeo(geo: TerritoryGeometry): [number, number][][] {
  if (geo.type === "Polygon") return geo.coordinates;
  return geo.coordinates.flat();
}

function simplifyRing(raw: [number, number][]): [number, number][] | null {
  const out: [number, number][] = [];
  for (const [lon, lat] of raw) {
    const p: [number, number] = [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100];
    const prev = out[out.length - 1];
    if (prev && prev[0] === p[0] && prev[1] === p[1]) continue;
    out.push(p);
  }
  // close ring
  const first = out[0];
  const last = out[out.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) out.push([first[0], first[1]]);
  return out.length >= 4 ? out : null;
}

async function fetchGeoJson(): Promise<{
  type: string;
  features: {
    properties: { NAME?: string; BORDERPRECISION?: number };
    geometry?: { type: string; coordinates: unknown };
  }[];
}> {
  const urls = [
    `https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_${SNAPSHOT_YEAR}.geojson`,
    `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${SNAPSHOT_YEAR}.geojson`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return (await res.json()) as Awaited<ReturnType<typeof fetchGeoJson>>;
      console.warn(`  ${url} → ${res.status}`);
    } catch (err) {
      console.warn(`  ${url} → ${String(err)}`);
    }
  }
  throw new Error("Could not fetch world_800.geojson from any mirror");
}

function main() {
  console.log(`Fetching historical-basemaps world_${SNAPSHOT_YEAR}.geojson…`);
  fetchGeoJson()
    .then((gj) => {
      const territories: GeneratedTerritory[] = [];

      let matched = 0;
      // group features per civilization (some civs span multiple features)
      const byCiv = new Map<string, (typeof gj.features)[number][]>();
      for (const f of gj.features) {
        const name = f.properties.NAME;
        const target = name ? TARGETS[name] : undefined;
        if (!target || !f.geometry) continue;
        const list = byCiv.get(target.civ) ?? [];
        list.push(f);
        byCiv.set(target.civ, list);
      }

      for (const [civId, features] of byCiv) {
        matched += 1;
        const target = TARGETS[features[0].properties.NAME!];
        const rings: [number, number][][] = [];
        for (const f of features) {
          if (f.geometry!.type === "Polygon") {
            for (const ring of (f.geometry!.coordinates as [number, number][][])) {
              const s = simplifyRing(ring);
              if (s) rings.push(s);
            }
          } else if (f.geometry!.type === "MultiPolygon") {
            for (const poly of (f.geometry!.coordinates as [number, number][][][])) {
              for (const ring of poly) {
                const s = simplifyRing(ring);
                if (s) rings.push(s);
              }
            }
          }
        }
        rings.sort((a, b) => b.length - a.length);
        const top = rings.slice(0, MAX_RINGS);

        const precision = features[0].properties.BORDERPRECISION ?? 1;
        const confidence = precision >= 3 ? "high" : precision === 2 ? "medium" : "low";

        territories.push({
          id: `t-${civId.replace("c-", "")}-${SNAPSHOT_YEAR}`,
          name: target.name,
          civilizationId: civId,
          validFrom: target.window[0],
          validTo: target.window[1],
          geojson:
            top.length === 1
              ? { type: "Polygon", coordinates: [top[0]] }
              : { type: "MultiPolygon", coordinates: top.map((ring) => [ring]) },
          source: SOURCE,
          confidence,
        });
      }

      if (territories.length === 0) {
        console.error("No target features found — aborting (keep current seed).");
        process.exit(1);
      }

      const file = [
        "import type { Territory } from \"../../lib/types\";",
        "",
        "/**",
        " * Territory seed — generated by `npm run fetch:territories`.",
        " * Source: aourednik/historical-basemaps (GPL-3.0), world_800.geojson snapshot.",
        " * BORDERPRECISION=1 → confidence \"low\" (approximate borders — verify before",
        " * academic use). Do not edit by hand; re-run the fetch script instead.",
        " */",
        `export const territories: Territory[] = [`,
        ...territories.map((t) => {
          const geojson =
            t.geojson.type === "Polygon"
              ? `{ type: "Polygon", coordinates: ${JSON.stringify(t.geojson.coordinates)} as [number, number][][] }`
              : `{ type: "MultiPolygon", coordinates: ${JSON.stringify(t.geojson.coordinates)} as [number, number][][][] }`;
          return [
            "  {",
            `    id: ${JSON.stringify(t.id)},`,
            `    name: ${JSON.stringify(t.name)},`,
            `    civilizationId: ${JSON.stringify(t.civilizationId)},`,
            `    validFrom: ${t.validFrom},`,
            `    validTo: ${t.validTo},`,
            `    geojson: ${geojson},`,
            `    source: ${JSON.stringify(t.source)},`,
            `    confidence: ${JSON.stringify(t.confidence)},`,
            "  },",
          ].join("\n");
        }),
        "];",
        "",
      ].join("\n");

      writeFileSync(join(process.cwd(), "src", "data", "seed", "territories.ts"), file);
      const pts = territories.reduce(
        (n, t) => n + ringsOfGeo(t.geojson).reduce((a, r) => a + r.length, 0),
        0,
      );
      console.log(
        `✓ Wrote ${territories.length} territories (${matched} features matched, ~${pts} points total) → src/data/seed/territories.ts`,
      );
      console.log("  " + territories.map((t) => `${t.name}[${t.validFrom}-${t.validTo}]`).join(", "));
    })
    .catch((err) => {
      console.error("fetch:territories failed:", err);
      process.exit(1);
    });
}

main();
