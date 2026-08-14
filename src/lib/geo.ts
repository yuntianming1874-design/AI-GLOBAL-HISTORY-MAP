import worldTopo from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

/**
 * World geometry + schematic trade routes shared by BOTH map adapters
 * (Mapbox GL and the D3 fallback), so the two render the same layers.
 */

export interface TradeRoute {
  id: string;
  name: string;
  chineseName: string;
  zhDescription: string;
  /** [longitude, latitude][] polyline (GeoJSON order). */
  points: [number, number][];
  color: string;
  dashed?: boolean;
}

/** Country polygons (Natural Earth 110m via world-atlas). */
export function worldCountries(): FeatureCollection<Geometry> {
  const topo = worldTopo as unknown as Topology;
  const countries = topo.objects.countries as GeometryCollection;
  return feature(topo, countries) as unknown as FeatureCollection<Geometry>;
}

export interface TradeRouteNode {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface TradeRoute {
  id: string;
  name: string;
  chineseName: string;
  zhDescription: string;
  /** [longitude, latitude][] polyline (GeoJSON order). */
  points: [number, number][];
  color: string;
  dashed?: boolean;
  description: string;
  /** Major stops — every node opens a Location Detail. */
  nodes: TradeRouteNode[];
  /** Civilizations the route connects (highlighted on focus). */
  civIds: string[];
}

export const tradeRoutes: TradeRoute[] = [
  {
    id: "route-silk-road",
    name: "Silk Road",
    chineseName: "丝绸之路",
    color: "#b3402a",
    dashed: true,
    description:
      "The overland highway of the Tang era: silk, paper, horses, religions and ideas flowed between Chang'an and the Mediterranean through oasis cities of Central Asia.",
    zhDescription:
      "唐代的陆上大动脉：丝绸、纸张、马匹、宗教与思想，经中亚绿洲城市在长安与地中海之间流动。",
    civIds: ["c-tang", "c-tibet", "c-abbasid", "c-umayyad", "c-byzantium"],
    nodes: [
      { locationId: "loc-changan", name: "Chang'an", latitude: 34.34, longitude: 108.94 },
      { locationId: "loc-dunhuang", name: "Dunhuang", latitude: 40.14, longitude: 94.66 },
      { locationId: "loc-kucha", name: "Kucha", latitude: 41.72, longitude: 82.95 },
      { locationId: "loc-samarkand", name: "Samarkand", latitude: 39.65, longitude: 66.96 },
      { locationId: "loc-baghdad", name: "Baghdad", latitude: 33.31, longitude: 44.37 },
      { locationId: "loc-damascus", name: "Damascus", latitude: 33.51, longitude: 36.29 },
      { locationId: "loc-constantinople", name: "Constantinople", latitude: 41.01, longitude: 28.98 },
    ],
    points: [
      [108.94, 34.34], // Chang'an
      [104.5, 35.5],
      [94.66, 40.14], // Dunhuang
      [86, 40.5],
      [82.95, 41.72], // Kucha
      [75.99, 39.47], // Kashgar
      [66.96, 39.65], // Samarkand
      [58, 36.5],
      [44.37, 33.31], // Baghdad
      [36.29, 33.51], // Damascus
      [36, 36.5],
      [28.98, 41.01], // Constantinople
    ],
  },
  {
    id: "route-maritime",
    name: "Maritime Silk Road",
    chineseName: "海上丝绸之路",
    color: "#0e7490",
    dashed: true,
    description:
      "The southern sea route: Tang porcelains and silks sailed from Guangzhou through the Strait of Malacca — the domain of Srivijaya — to the Persian Gulf and Baghdad.",
    zhDescription:
      "南方海上航线：唐朝的瓷器与丝绸自广州出发，经室利佛逝掌控的马六甲海峡，抵达波斯湾与巴格达。",
    civIds: ["c-tang", "c-srivijaya", "c-abbasid"],
    nodes: [
      { locationId: "loc-guangzhou", name: "Guangzhou", latitude: 23.13, longitude: 113.26 },
      { locationId: "loc-palembang", name: "Palembang", latitude: -2.99, longitude: 104.76 },
      { locationId: "loc-baghdad", name: "Baghdad", latitude: 33.31, longitude: 44.37 },
    ],
    points: [
      [113.26, 23.13], // Guangzhou
      [108, 8],
      [104.76, -2.99], // Palembang
      [88, 7],
      [62, 20],
      [52, 26],
      [44.37, 33.31], // Baghdad
    ],
  },
  {
    id: "route-varangian",
    name: "Varangian Route",
    chineseName: "瓦良格人商路",
    color: "#557a95",
    dashed: true,
    description:
      "The Rus' river highway from the Baltic to Byzantium: furs, wax and slaves southward; silver and silk northward — through Kiev, the 'mother of Rus' cities'.",
    zhDescription:
      "罗斯人的河流商道，自波罗的海通往拜占庭：毛皮、蜂蜡与奴隶南下，白银与丝绸北上——途经“罗斯诸城之母”基辅。",
    civIds: ["c-vikings", "c-khazars", "c-byzantium"],
    nodes: [
      { locationId: "loc-kiev", name: "Kiev", latitude: 50.45, longitude: 30.52 },
      { locationId: "loc-constantinople", name: "Constantinople", latitude: 41.01, longitude: 28.98 },
    ],
    points: [
      [18.5, 60.5], // Baltic head
      [30.52, 50.45], // Kiev
      [32, 46],
      [28.98, 41.01], // Constantinople
    ],
  },
];

export function projectPoint(
  lon: number,
  lat: number,
  width: number,
  height: number,
): [number, number] {
  // Equirectangular projection centered on 50°E (Eurasia focus).
  const lon0 = 50;
  const x = ((lon - lon0 + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}
