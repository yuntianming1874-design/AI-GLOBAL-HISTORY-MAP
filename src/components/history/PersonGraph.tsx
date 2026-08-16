"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type {
  EventDTO,
  HistoricalLocation,
  PersonDTO,
  RelationshipDTO,
} from "@/lib/types";
import { RELATIONSHIP_META, RELATIONSHIP_ORDER } from "@/lib/theme";
import { activeInYear } from "@/lib/contemporaries";
import type { TranslationKey } from "@/lib/i18n";
import { ErrorBlock, LoadingBlock } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";
import { PersonDrawer } from "./PersonDrawer";
import { cachedFetchJson } from "./fetchCache";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  chineseName: string;
  role: string;
  importance: number;
  color: string;
  civName: string | null;
  civId: string | null;
  birthYear: number | null;
  deathYear: number | null;
  summary: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  type: RelationshipDTO["type"];
  description: string;
}

const NEUTRAL = "#8a7a66";

/**
 * Character relationship graph (V0.2):
 *  - global context: ?person → auto-select (drawer opens),
 *    ?event → highlights people active in the event's year.
 *  - Person Detail Drawer with biography / events / relationships /
 *    locations / contemporaries and cross-page actions.
 */
export function PersonGraph({ className = "" }: { className?: string }) {
  const { context, selectPerson } = useExplorer();
  const { locale, t } = useLocale();

  const [people, setPeople] = useState<PersonDTO[] | null>(null);
  const [relationships, setRelationships] = useState<RelationshipDTO[] | null>(null);
  const [allEvents, setAllEvents] = useState<EventDTO[]>([]);
  const [locations, setLocations] = useState<HistoricalLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(context.personId);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [civFilter, setCivFilter] = useState<string>("all");
  const [width, setWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevPersonRef = useRef<string | null>(null);
  const prevEventRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cachedFetchJson("/api/people"),
      cachedFetchJson("/api/relationships"),
      cachedFetchJson("/api/events"),
      cachedFetchJson("/api/locations"),
    ])
      .then(([ps, rs, evts, locs]) => {
        if (cancelled) return;
        setPeople(ps as PersonDTO[]);
        setRelationships(rs as RelationshipDTO[]);
        setAllEvents(evts as EventDTO[]);
        setLocations(locs as HistoricalLocation[]);
      })
      .catch(() => !cancelled && setError("Failed to load person graph data."));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ?person → select + open drawer */
  useEffect(() => {
    const id = context.personId;
    if (id === prevPersonRef.current) return;
    prevPersonRef.current = id;
    setSelectedId(id);
  }, [context.personId]);

  /* ?event → highlight people active in the event's year */
  useEffect(() => {
    const id = context.eventId;
    if (!id) {
      setHighlightIds(new Set());
      prevEventRef.current = null;
      return;
    }
    if (!people) return; // wait for data — do NOT consume the guard yet
    if (id === prevEventRef.current) return;
    prevEventRef.current = id;
    let cancelled = false;
    fetch(`/api/events/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((event: EventDTO | null) => {
        if (cancelled || !event) return;
        setHighlightIds(new Set(activeInYear(event.year, people).map((p) => p.id)));
      })
      .catch(() => !cancelled && setHighlightIds(new Set()));
    return () => {
      cancelled = true;
    };
  }, [context.eventId, people]);

  const allNodes = useMemo<GraphNode[]>(
    () =>
      (people ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        chineseName: p.chineseName,
        role: p.role,
        importance: p.importance,
        color: p.civilizationColor ?? NEUTRAL,
        civName: p.civilizationName,
        civId: p.civilizationId,
        birthYear: p.birthYear,
        deathYear: p.deathYear,
        summary: p.summary,
      })),
    [people],
  );

  const allLinks = useMemo<GraphLink[]>(
    () =>
      (relationships ?? []).map((r) => ({
        id: r.id,
        type: r.type,
        description: r.description,
        source: r.sourcePersonId,
        target: r.targetPersonId,
      })),
    [relationships],
  );

  const { nodes, links } = useMemo(() => {
    if (civFilter === "all") return { nodes: allNodes, links: allLinks };
    const ids = new Set(allNodes.filter((n) => n.civId === civFilter).map((n) => n.id));
    return {
      nodes: allNodes.filter((n) => ids.has(n.id)),
      links: allLinks.filter(
        (l) =>
          typeof l.source === "string" &&
          typeof l.target === "string" &&
          ids.has(l.source) &&
          ids.has(l.target),
      ),
    };
  }, [allNodes, allLinks, civFilter]);

  const civOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people ?? []) {
      if (p.civilizationId && p.civilizationName) {
        map.set(p.civilizationId, p.civilizationName);
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [people]);

  /* force simulation render */
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || width < 120 || nodes.length === 0) return;
    const height = 620;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 6])
      .on("zoom", (ev) => g.attr("transform", ev.transform.toString()));
    svg.call(zoom).on("dblclick.zoom", null);

    const linkSel = g
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links, (d) => d.id)
      .join("line")
      .attr("stroke", (d) => RELATIONSHIP_META[d.type].color)
      .attr("stroke-opacity", 0.55)
      .attr("stroke-width", 1.2);

    const nodeSel = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g.node")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", "node cursor-pointer")
      .style("cursor", "pointer");

    nodeSel
      .append("circle")
      .attr("r", (d) => 6 + d.importance * 2.1)
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeSel
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => 6 + d.importance * 2.1 + 13)
      .attr("fill", "#5c4f40")
      .style("font-size", "10px")
      .style("font-weight", 600)
      .attr("display", (d) => (d.importance >= 4 ? null : "none"))
      .text((d) => (locale === "zh" ? d.chineseName : d.name));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(70)
          .strength(0.5),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => 12 + d.importance * 3))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);
      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (ev, d) => {
        if (!ev.active) simulation.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (ev, d) => {
        d.fx = ev.x;
        d.fy = ev.y;
      })
      .on("end", (ev, d) => {
        if (!ev.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    nodeSel.call(drag);

    nodeSel
      .on("click", (ev, d) => {
        ev.stopPropagation();
        selectPerson(d.id);
        setSelectedId(d.id);
      })
      .on("mouseenter", function () {
        d3.select(this).select("text.node-label").attr("display", null);
        d3.select(this).select("circle").attr("stroke", "#b3402a").attr("stroke-width", 2.5);
      })
      .on("mouseleave", function (_, d) {
        const isSelected = d3.select(this).attr("data-selected") === "1";
        const isHighlighted = d3.select(this).attr("data-highlight") === "1";
        d3.select(this)
          .select("text.node-label")
          .attr("display", isSelected || d.importance >= 4 ? null : "none");
        d3.select(this)
          .select("circle")
          .attr("stroke", isSelected ? "#b3402a" : isHighlighted ? "#c9a227" : "#fff")
          .attr("stroke-width", isSelected || isHighlighted ? 2.5 : 1.5);
      });

    svg.on("click", () => {
      selectPerson(null);
      setSelectedId(null);
    });

    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links, width, locale]);

  /* highlight the selected / event-active nodes without re-running the simulation */
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    d3.select(svgEl)
      .selectAll<SVGGElement, GraphNode>("g.node")
      .each(function (d) {
        const g = d3.select(this);
        const isSelected = d.id === selectedId;
        const isHighlighted = highlightIds.has(d.id);
        g.select("circle")
          .attr("stroke", isSelected ? "#b3402a" : isHighlighted ? "#c9a227" : "#fff")
          .attr("stroke-width", isSelected || isHighlighted ? 2.5 : 1.5);
        g.select("text.node-label")
          .attr("display", isSelected || d.importance >= 4 ? null : "none");
        g.attr("data-selected", isSelected ? "1" : "0");
        g.attr("data-highlight", isHighlighted ? "1" : "0");
      });
  }, [selectedId, highlightIds]);

  const selected = useMemo(
    () => (people ?? []).find((p) => p.id === selectedId) ?? null,
    [people, selectedId],
  );
  const eventsByPerson = useMemo(() => {
    if (!selectedId) return null;
    return allEvents.filter((e) => e.participants.includes(selectedId));
  }, [selectedId, allEvents]);

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
          <Icon name="filter" className="h-3.5 w-3.5" />
          <select
            value={civFilter}
            onChange={(e) => setCivFilter(e.target.value)}
            className="input-field !py-1"
            aria-label={t("pg.filterBy")}
          >
            <option value="all">{t("pg.allCivs")}</option>
            {civOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
          {RELATIONSHIP_ORDER.map((type) => (
            <span key={type} className="flex items-center gap-1">
              <span
                className="h-1.5 w-3 rounded-full"
                style={{ backgroundColor: RELATIONSHIP_META[type].color }}
              />
              {t(("rel." + type) as TranslationKey)}
            </span>
          ))}
          {highlightIds.size > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-medium text-gold-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {t("pg.activeIn", { id: context.eventId?.replace("e-", "") ?? "" })}
            </span>
          )}
        </div>
        <span className="ml-auto text-xs text-ink-faint">
          {t("pg.counts", { people: nodes.length, links: links.length })}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div
          ref={containerRef}
          className="min-w-0 flex-1 overflow-hidden rounded-xl border border-parchment-300 bg-parchment-50 shadow-card"
        >
          {error ? (
            <ErrorBlock message={t("pg.error")} />
          ) : !people || !relationships ? (
            <LoadingBlock label={t("pg.loading")} />
          ) : (
            <svg
              ref={svgRef}
              width="100%"
              height="620"
              role="img"
              aria-label="Character relationship graph"
              className="block"
            />
          )}
          <p className="border-t border-parchment-200 px-4 py-2 text-xs text-ink-faint">
            {t("pg.hint")}
          </p>
        </div>
      </div>

      <PersonDrawer
        person={selected}
        relationships={relationships ?? []}
        eventsByPerson={eventsByPerson}
        allEvents={allEvents}
        locations={locations}
        people={people ?? []}
        onClose={() => {
          setSelectedId(null);
          selectPerson(null);
        }}
        onSelectPerson={(id) => {
          setSelectedId(id);
          selectPerson(id);
        }}
      />
    </div>
  );
}
