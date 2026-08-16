import * as d3 from "d3";
import { civilizations as seedCivilizations, locations as seedLocations } from "@/data/seed";
import type { GeoJSONSource } from "mapbox-gl";
import type { Civilization, EventDTO, TerritoryDTO } from "@/lib/types";
import { CATEGORY_META } from "@/lib/theme";
import { tradeRoutes, worldCountries } from "@/lib/geo";

/**
 * Map adapter contract + two implementations:
 *  - createD3Map: SVG world map (equirectangular, Natural Earth 110m) —
 *    zero-config fallback with pan/zoom, tooltips and click handlers.
 *  - createMapboxMap: Mapbox GL with the same data layers.
 *
 * V0.2 layers: events, trade routes (+ clickable nodes), schematic
 * territories (year-validity filtered), person activity locations,
 * and focusPoint() for "fly to" navigation.
 */

export interface MapHandlers {
  onEventClick(eventId: string): void;
  onRouteClick(routeId: string): void;
  /** Route node or person activity marker → Location Detail. */
  onNodeClick(locationId: string): void;
  onTerritoryClick(civilizationId: string): void;
}

export interface PersonMapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  locationId: string;
}

export interface MapData {
  /** UI locale — tooltips prefer Chinese titles when zh. */
  locale?: "en" | "zh";
  events: EventDTO[];
  civilizations: Civilization[];
  visibleCivIds: Set<string>;
  /** "all" or an EventCategory */
  activeCategory: string;
  range: [number, number];
  showRoutes: boolean;
  territories: TerritoryDTO[];
  showTerritories: boolean;
  /** When set, only territories valid at this year are drawn. */
  currentYear: number | null;
  personLocations: PersonMapPoint[];
  /** When set, the map flies to this point. */
  focusedLocation: { latitude: number; longitude: number } | null;
}

export interface MapController {
  update(data: MapData): void;
  focusPoint(latitude: number, longitude: number): void;
  destroy(): void;
}

const MAPBOX_CSS_HREF = "mapbox-gl/dist/mapbox-gl.css";

function visibleEvents(data: MapData): EventDTO[] {
  return data.events.filter(
    (e) =>
      e.latitude !== null &&
      e.longitude !== null &&
      data.visibleCivIds.has(e.civilizationId) &&
      (data.activeCategory === "all" || e.category === data.activeCategory) &&
      e.year >= data.range[0] &&
      e.year <= data.range[1],
  );
}

function visibleTerritories(data: MapData): TerritoryDTO[] {
  return data.territories.filter((t) => {
    if (data.currentYear !== null) {
      return t.validFrom <= data.currentYear && data.currentYear <= t.validTo;
    }
    return t.validFrom <= data.range[1] && t.validTo >= data.range[0];
  });
}

function ringsOfTerritory(t: TerritoryDTO): [number, number][][] {
  if (t.geojson.type === "Polygon") return t.geojson.coordinates;
  return t.geojson.coordinates.flat();
}

function ringToPath(
  ring: [number, number][],
  projection: d3.GeoProjection,
): string {
  const pts = ring
    .map(([lon, lat]) => projection([lon, lat]))
    .filter((p): p is [number, number] => p !== null);
  if (pts.length === 0) return "";
  // valid closed SVG path: "M x,y L x,y … Z" (bare pairs were invalid)
  return `M ${pts.map((p) => `${p[0]},${p[1]}`).join(" L ")} Z `;
}

/* ── D3 SVG fallback adapter ───────────────────────────────────────── */

export function createD3Map(
  container: HTMLElement,
  handlers: MapHandlers,
): MapController {
  const width = Math.max(container.clientWidth || 900, 320);
  const height = Math.max(container.clientHeight || 540, 320);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Historical world map");

  const g = svg.append("g");

  const projection = d3
    .geoEquirectangular()
    .fitSize([width, height], worldCountries() as never);
  const path = d3.geoPath(projection);

  g.append("g")
    .selectAll("path")
    .data(worldCountries().features)
    .join("path")
    .attr("d", path as never)
    .attr("fill", "#efe6d2")
    .attr("stroke", "#cfb882")
    .attr("stroke-width", 0.4);

  const territoriesLayer = g.append("g");
  const routesLayer = g.append("g");
  const personLayer = g.append("g");
  const eventsLayer = g.append("g");

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 14])
    .on("zoom", (ev) => {
      g.attr("transform", ev.transform.toString());
    });
  svg.call(zoom).call(
    zoom.transform,
    d3.zoomIdentity.translate(width * 0.05, height * 0.01),
  );

  const locZhName = new Map(seedLocations.map((l) => [l.id, l.chineseName]));
const civZhName = new Map(seedCivilizations.map((c) => [c.id, c.chineseName]));

  const tooltip = d3
    .select(container)
    .append("div")
    .attr(
      "class",
      "pointer-events-none absolute z-20 max-w-xs rounded-md bg-ink/90 px-2.5 py-1.5 text-xs text-parchment-50 shadow-pop",
    )
    .style("opacity", 0);

  function showTooltip(name: string, clientX: number, clientY: number) {
    tooltip.text(name).style("opacity", 1);
    const rect = container.getBoundingClientRect();
    tooltip
      .style("left", `${clientX - rect.left + 12}px`)
      .style("top", `${clientY - rect.top - 12}px`);
  }
  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  function update(data: MapData) {
    /* territories */
    territoriesLayer.selectAll("*").remove();
    if (data.showTerritories) {
      const vis = visibleTerritories(data);
      territoriesLayer
        .selectAll("path")
        .data(vis, (t) => (t as TerritoryDTO).id)
        .join("path")
        .attr("d", (t) =>
          ringsOfTerritory(t)
            .map((ring) => ringToPath(ring, projection))
            .join(""),
        )
        .attr("fill", (t) => t.civilizationColor)
        .attr("fill-opacity", 0.13)
        .attr("stroke", (t) => t.civilizationColor)
        .attr("stroke-opacity", 0.55)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3")
        .style("cursor", "pointer")
        .on("click", (_, t) => handlers.onTerritoryClick(t.civilizationId))
        .on("mouseenter", (ev, t) => {
          showTooltip(`${data.locale === "zh" && t.zhName ? t.zhName : t.name} (${t.validFrom}–${t.validTo}) · ${t.confidence}`, ev.clientX, ev.clientY);
        })
        .on("mousemove", (ev) => {
          const rect = container.getBoundingClientRect();
          tooltip
            .style("left", `${ev.clientX - rect.left + 12}px`)
            .style("top", `${ev.clientY - rect.top - 12}px`);
        })
        .on("mouseleave", hideTooltip);
    }

    /* routes + clickable nodes */
    routesLayer.selectAll("*").remove();
    if (data.showRoutes) {
      routesLayer
        .selectAll("path.route")
        .data(tradeRoutes)
        .join("path")
        .attr("class", "route")
        .attr("d", (r) => {
          const pts = r.points
            .map(([lon, lat]) => projection([lon, lat]))
            .filter((p): p is [number, number] => p !== null);
          // valid SVG path: "M x,y L x,y …" (bare coordinate pairs were
          // invalid — surfaced by the browser as console errors)
          return pts.length > 0
            ? `M ${pts.map((p) => p.join(",")).join(" L ")}`
            : "";
        })
        .attr("fill", "none")
        .attr("stroke", (r) => r.color)
        .attr("stroke-width", 1.6)
        .attr("stroke-dasharray", "5 4")
        .attr("opacity", 0.75);

      // wide invisible hit area → route detail
      routesLayer
        .selectAll("path.hit")
        .data(tradeRoutes)
        .join("path")
        .attr("class", "hit")
        .attr("d", (r) => {
          const pts = r.points
            .map(([lon, lat]) => projection([lon, lat]))
            .filter((p): p is [number, number] => p !== null);
          return pts.length > 0
            ? `M ${pts.map((p) => p.join(",")).join(" L ")}`
            : "";
        })
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 12)
        .style("cursor", "pointer")
        .on("click", (_, r) => handlers.onRouteClick(r.id));

      // route nodes → Location Detail
      const nodes = tradeRoutes.flatMap((r) =>
        r.nodes.map((n) => ({ ...n, routeId: r.id, color: r.color })),
      );
      routesLayer
        .selectAll("circle.node")
        .data(nodes)
        .join("circle")
        .attr("class", "node")
        .attr("cx", (n) => {
          const p = projection([n.longitude, n.latitude]);
          return p ? p[0] : 0;
        })
        .attr("cy", (n) => {
          const p = projection([n.longitude, n.latitude]);
          return p ? p[1] : 0;
        })
        .attr("r", 3.5)
        .attr("fill", "#fff")
        .attr("stroke", (n) => n.color)
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("click", (_, n) => handlers.onNodeClick(n.locationId))
        .on("mouseenter", (ev, n) =>
          showTooltip(
            data.locale === "zh" ? (locZhName.get(n.locationId) ?? n.name) : n.name,
            ev.clientX,
            ev.clientY,
          ),
        )
        .on("mousemove", (ev) => {
          const rect = container.getBoundingClientRect();
          tooltip
            .style("left", `${ev.clientX - rect.left + 12}px`)
            .style("top", `${ev.clientY - rect.top - 12}px`);
        })
        .on("mouseleave", hideTooltip);
    }

    /* person activity markers */
    personLayer.selectAll("*").remove();
    personLayer
      .selectAll("circle")
      .data(data.personLocations, (p) => (p as PersonMapPoint).id)
      .join("circle")
      .attr("cx", (p) => {
        const pt = projection([p.longitude, p.latitude]);
        return pt ? pt[0] : 0;
      })
      .attr("cy", (p) => {
        const pt = projection([p.longitude, p.latitude]);
        return pt ? pt[1] : 0;
      })
      .attr("r", 5.5)
      .attr("fill", "#c9a227")
      .attr("fill-opacity", 0.95)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("click", (_, p) => handlers.onNodeClick(p.locationId))
      .on("mouseenter", (ev, p) => showTooltip(p.name, ev.clientX, ev.clientY))
      .on("mousemove", (ev) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", `${ev.clientX - rect.left + 12}px`)
          .style("top", `${ev.clientY - rect.top - 12}px`);
      })
      .on("mouseleave", hideTooltip);

    /* events */
    const visible = visibleEvents(data);
    const dots = eventsLayer
      .selectAll<SVGCircleElement, EventDTO>("circle.dot")
      .data(visible, (d) => (d as EventDTO).id);
    dots.exit().remove();
    const entered = dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 0)
      .style("cursor", "pointer");
    entered
      .merge(dots)
      .attr("cx", (d) => {
        const p = projection([d.longitude as number, d.latitude as number]);
        return p ? p[0] : 0;
      })
      .attr("cy", (d) => {
        const p = projection([d.longitude as number, d.latitude as number]);
        return p ? p[1] : 0;
      })
      .attr("r", (d) => 3 + d.significance * 1.4)
      .attr("fill", (d) => CATEGORY_META[d.category].color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("click", (_, d) => handlers.onEventClick(d.id))
      .on("mouseenter", (ev, d) => {
        showTooltip(
          `${data.locale === "zh" ? d.chineseTitle : d.title} (${d.year}) · ${
            data.locale === "zh"
              ? (civZhName.get(d.civilizationId) ?? d.civilizationName)
              : d.civilizationName
          }`,
          ev.clientX,
          ev.clientY,
        );
      })
      .on("mousemove", (ev) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", `${ev.clientX - rect.left + 12}px`)
          .style("top", `${ev.clientY - rect.top - 12}px`);
      })
      .on("mouseleave", hideTooltip);

    /* fly to focused location */
    if (data.focusedLocation) {
      focusPoint(data.focusedLocation.latitude, data.focusedLocation.longitude);
    }
  }

  function focusPoint(latitude: number, longitude: number) {
    const p = projection([longitude, latitude]);
    if (!p) return;
    const scale = 4;
    const t = d3.zoomIdentity
      .translate(width / 2 - p[0] * scale, height / 2 - p[1] * scale)
      .scale(scale);
    svg
      .transition()
      .duration(650)
      .call(zoom.transform as never, t as never);
  }

  function destroy() {
    svg.remove();
    tooltip.remove();
  }

  return { update, focusPoint, destroy };
}

/* ── Mapbox GL adapter ─────────────────────────────────────────────── */

export async function createMapboxMap(
  container: HTMLElement,
  handlers: MapHandlers,
): Promise<MapController> {
  if (!document.querySelector(`link[href="${MAPBOX_CSS_HREF}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MAPBOX_CSS_HREF;
    document.head.appendChild(link);
  }
  const mapboxgl = (await import("mapbox-gl")).default;
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

  const map = new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/light-v11",
    center: [60, 35],
    zoom: 1.4,
    attributionControl: false,
  });
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

  await new Promise<void>((resolve) => map.on("load", () => resolve()));

  map.addSource("countries", {
    type: "geojson",
    data: worldCountries() as never,
  });
  map.addLayer({
    id: "countries-fill",
    type: "fill",
    source: "countries",
    paint: { "fill-color": "#efe6d2", "fill-outline-color": "#cfb882" },
  });
  map.addLayer({
    id: "countries-line",
    type: "line",
    source: "countries",
    paint: { "line-color": "#cfb882", "line-width": 0.5 },
  });

  /* territories */
  map.addSource("territories", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "territories-fill",
    type: "fill",
    source: "territories",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.13,
      "fill-outline-color": ["get", "color"],
    },
  });
  map.addLayer({
    id: "territories-line",
    type: "line",
    source: "territories",
    paint: {
      "line-color": ["get", "color"],
      "line-opacity": 0.55,
      "line-width": 1,
      "line-dasharray": [4, 3],
    },
  });
  map.on("click", "territories-fill", (e) => {
    const civId = e.features?.[0]?.properties?.civId;
    if (typeof civId === "string") handlers.onTerritoryClick(civId);
  });
  map.on("mouseenter", "territories-fill", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "territories-fill", () => {
    map.getCanvas().style.cursor = "";
  });

  /* routes + nodes */
  map.addSource("routes", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "routes-line",
    type: "line",
    source: "routes",
    paint: {
      "line-color": ["get", "color"],
      "line-width": 1.6,
      "line-dasharray": [4, 3],
      "line-opacity": 0.8,
    },
  });
  map.addSource("route-nodes", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "route-nodes-circle",
    type: "circle",
    source: "route-nodes",
    paint: {
      "circle-radius": 4,
      "circle-color": "#ffffff",
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 1.5,
    },
  });
  map.on("click", "routes-line", (e) => {
    const id = e.features?.[0]?.properties?.id;
    if (typeof id === "string") handlers.onRouteClick(id);
  });
  map.on("click", "route-nodes-circle", (e) => {
    const loc = e.features?.[0]?.properties?.locationId;
    if (typeof loc === "string") handlers.onNodeClick(loc);
  });

  /* events */
  map.addSource("events", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "events-circle",
    type: "circle",
    source: "events",
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["get", "r"],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
    },
  });
  map.on("click", "events-circle", (e) => {
    const id = e.features?.[0]?.properties?.id;
    if (typeof id === "string") handlers.onEventClick(id);
  });
  map.on("mouseenter", "events-circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "events-circle", () => {
    map.getCanvas().style.cursor = "";
  });

  /* person activity locations */
  map.addSource("person-locations", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "person-locations-circle",
    type: "circle",
    source: "person-locations",
    paint: {
      "circle-radius": 5.5,
      "circle-color": "#c9a227",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.5,
    },
  });
  map.on("click", "person-locations-circle", (e) => {
    const loc = e.features?.[0]?.properties?.locationId;
    if (typeof loc === "string") handlers.onNodeClick(loc);
  });

  function update(data: MapData) {
    const routesSource = map.getSource("routes") as GeoJSONSource | undefined;
    routesSource?.setData({
      type: "FeatureCollection",
      features: data.showRoutes
        ? tradeRoutes.map((r) => ({
            type: "Feature",
            properties: { color: r.color, id: r.id, name: r.name },
            geometry: { type: "LineString", coordinates: r.points },
          }))
        : [],
    });

    const nodesSource = map.getSource("route-nodes") as GeoJSONSource | undefined;
    nodesSource?.setData({
      type: "FeatureCollection",
      features: data.showRoutes
        ? tradeRoutes.flatMap((r) =>
            r.nodes.map((n) => ({
              type: "Feature",
              properties: { locationId: n.locationId, name: n.name, color: r.color },
              geometry: { type: "Point", coordinates: [n.longitude, n.latitude] },
            })),
          )
        : [],
    });

    const territoriesSource = map.getSource("territories") as GeoJSONSource | undefined;
    territoriesSource?.setData({
      type: "FeatureCollection",
      features: data.showTerritories
        ? visibleTerritories(data).map((t) => ({
            type: "Feature",
            properties: { civId: t.civilizationId, color: t.civilizationColor, name: t.name },
            geometry: t.geojson,
          }))
        : [],
    });

    const personSource = map.getSource("person-locations") as GeoJSONSource | undefined;
    personSource?.setData({
      type: "FeatureCollection",
      features: data.personLocations.map((p) => ({
        type: "Feature",
        properties: { locationId: p.locationId, name: p.name },
        geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      })),
    });

    const eventsSource = map.getSource("events") as GeoJSONSource | undefined;
    const visible = visibleEvents(data);
    eventsSource?.setData({
      type: "FeatureCollection",
      features: visible.map((e) => ({
        type: "Feature",
        properties: {
          id: e.id,
          color: CATEGORY_META[e.category].color,
          r: 3 + e.significance * 1.8,
          title: e.title,
          year: e.year,
          civ: e.civilizationName,
        },
        geometry: {
          type: "Point",
          coordinates: [e.longitude as number, e.latitude as number],
        },
      })),
    });

    if (data.focusedLocation) {
      focusPoint(data.focusedLocation.latitude, data.focusedLocation.longitude);
    }
  }

  function focusPoint(latitude: number, longitude: number) {
    map.flyTo({ center: [longitude, latitude], zoom: 4, essential: true });
  }

  function destroy() {
    map.remove();
  }

  return { update, focusPoint, destroy };
}

/* ── factory ───────────────────────────────────────────────────────── */

export type MapMode = "mapbox" | "d3";

export function mapMode(): MapMode {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "mapbox" : "d3";
}

export async function createMap(
  container: HTMLElement,
  handlers: MapHandlers,
): Promise<MapController> {
  if (mapMode() === "mapbox") {
    try {
      return await createMapboxMap(container, handlers);
    } catch (err) {
      console.error("Mapbox init failed, falling back to D3 map", err);
    }
  }
  return createD3Map(container, handlers);
}
