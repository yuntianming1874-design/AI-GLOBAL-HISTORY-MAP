"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { Civilization, EventCategory, EventDTO, PersonDTO } from "@/lib/types";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  FULL_RANGE,
  REGION_ORDER,
  formatYear,
} from "@/lib/theme";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/primitives";
import { EventModal } from "./EventModal";

const LABEL_W = 116;
const ROW_H = 26;
const MAIN_H = 440;
const CONTEXT_H = 62;
const GAP = 22;

const TANG_ERA_RANGE: [number, number] = [618, 907];

/**
 * Global timeline (V0.2): reads the global HistoryContext —
 *  ?year → focus around that year; ?person → focus the person's lifetime
 *  and ring their events; ?event → locate + highlight the event.
 * Clicking a dot dispatches OPEN_EVENT (Event Detail deep link).
 */
export function Timeline({ className = "" }: { className?: string }) {
  const { context, setYear } = useExplorer();
  const { locale, t } = useLocale();

  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [people, setPeople] = useState<PersonDTO[] | null>(null);
  const [civilizations, setCivilizations] = useState<Civilization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<[number, number]>(TANG_ERA_RANGE);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(CATEGORY_ORDER),
  );
  const [focusPersonId, setFocusPersonId] = useState<string | null>(null);
  const [highlightEventId, setHighlightEventId] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  /** true while the user is actively dragging the overview brush — the
   *  range-sync effect must not rewrite the brush mid-gesture */
  const draggingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  /** DOM nodes as state — d3 bindings key off these, so they are applied
   *  deterministically the moment the svg mounts (no mount-order race). */
  const [svgNode, setSvgNode] = useState<SVGSVGElement | null>(null);
  const [axisNode, setAxisNode] = useState<SVGGElement | null>(null);
  const [contextAxisNode, setContextAxisNode] = useState<SVGGElement | null>(null);
  const [brushHost, setBrushHost] = useState<SVGGElement | null>(null);
  const brushInst = useRef<d3.BrushBehavior<unknown> | null>(null);
  const programmaticBrush = useRef(false);
  const prevYearRef = useRef<number | null>(null);
  const prevStartRef = useRef<number | null>(null);
  const prevEndRef = useRef<number | null>(null);
  const prevPersonRef = useRef<string | null>(null);
  const prevEventRef = useRef<string | null>(null);
  const [width, setWidth] = useState(0);



  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/events").then((r) => {
        if (!r.ok) throw new Error("events");
        return r.json();
      }),
      fetch("/api/civilizations").then((r) => {
        if (!r.ok) throw new Error("civilizations");
        return r.json();
      }),
      fetch("/api/people").then((r) => {
        if (!r.ok) throw new Error("people");
        return r.json();
      }),
    ])
      .then(([evts, civs, ps]) => {
        if (cancelled) return;
        setEvents(evts as EventDTO[]);
        setCivilizations(civs as Civilization[]);
        setPeople(ps as PersonDTO[]);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load timeline data.");
      });
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

  /* ── V0.2 context responses ─────────────────────────────────────── */

  // ?start/?end → explicit focus range (wins over ?year)
  useEffect(() => {
    const start = context.startYear;
    const end = context.endYear;
    if (start === null || end === null) return;
    if (start === prevStartRef.current && end === prevEndRef.current) return;
    prevStartRef.current = start;
    prevEndRef.current = end;
    if (start <= end) setRange([start, end]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.startYear, context.endYear]);

  // ?year → ensure the focused year is visible (center the view on it)
  useEffect(() => {
    const year = context.year;
    if (year === prevYearRef.current) return;
    prevYearRef.current = year;
    if (
      year !== null &&
      context.startYear === null &&
      context.endYear === null &&
      (year < range[0] || year > range[1])
    ) {
      setRange([
        Math.max(FULL_RANGE.start, year - 40),
        Math.min(FULL_RANGE.end, year + 40),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.year, context.startYear, context.endYear]);

  // ?person → focus their lifetime and ring their events
  useEffect(() => {
    const id = context.personId;
    if (id === prevPersonRef.current) return;
    prevPersonRef.current = id;
    if (!id || !people) {
      setFocusPersonId(id);
      return;
    }
    const person = people.find((p) => p.id === id);
    setFocusPersonId(id);
    if (context.startYear !== null && context.endYear !== null) {
      setRange([context.startYear, context.endYear]);
    } else if (person?.birthYear !== null && person?.birthYear !== undefined) {
      setRange([
        Math.max(FULL_RANGE.start, person.birthYear - 2),
        Math.min(FULL_RANGE.end, (person.deathYear ?? person.birthYear + 30) + 2),
      ]);
    }
  }, [context.personId, people, context.startYear, context.endYear]);

  // ?event → locate + highlight the event
  useEffect(() => {
    const id = context.eventId;
    if (id === prevEventRef.current) return;
    prevEventRef.current = id;
    setHighlightEventId(id);
    if (id && events) {
      const event = events.find((e) => e.id === id);
      if (
        event &&
        context.startYear === null &&
        context.endYear === null &&
        (event.year < range[0] || event.year > range[1])
      ) {
        setRange([
          Math.max(FULL_RANGE.start, event.year - 35),
          Math.min(FULL_RANGE.end, event.year + 35),
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.eventId, events, context.startYear, context.endYear]);

  /* auto-scroll to the timeline when a focus (person/event/range) arrives */
  useEffect(() => {
    const focused =
      context.personId !== null ||
      context.eventId !== null ||
      context.startYear !== null ||
      context.endYear !== null;
    if (!focused) return;
    const t = window.setTimeout(() => {
      containerRef.current
        ?.closest("section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.personId, context.eventId, context.startYear, context.endYear]);

  const rows = useMemo(() => {
    if (!civilizations) return [];
    return [...civilizations].sort((a, b) => {
      const ra = REGION_ORDER.indexOf(a.region);
      const rb = REGION_ORDER.indexOf(b.region);
      return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb) || a.startYear - b.startYear;
    });
  }, [civilizations]);

  const x = useMemo(
    () => d3.scaleLinear().domain([range[0], range[1]]).range([LABEL_W + 14, width - 10]),
    [range, width],
  );
  const xFull = useMemo(
    () =>
      d3.scaleLinear()
        .domain([FULL_RANGE.start, FULL_RANGE.end])
        .range([LABEL_W + 14, width - 10]),
    [width],
  );

  const visibleEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(
      (e) => activeCategories.has(e.category) && e.year >= range[0] - 30 && e.year <= range[1] + 30,
    );
  }, [events, activeCategories, range]);

  const rowIndex = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [rows]);

  /* main + context axes */
  useEffect(() => {
    if (!axisNode) return;
    const axis = d3
      .axisBottom(x)
      .ticks(Math.max(4, Math.floor(width / 140)))
      .tickFormat((d) => formatYear(Number(d)));
    (d3.select(axisNode) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>)
      .call(axis as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
  }, [axisNode, x, width]);

  useEffect(() => {
    if (!contextAxisNode) return;
    const axis = d3
      .axisBottom(xFull)
      .ticks(6)
      .tickFormat((d) => formatYear(Number(d)));
    (d3.select(contextAxisNode) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>)
      .call(axis as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
  }, [contextAxisNode, xFull, width]);

  /* brush behavior (context strip) */
  useEffect(() => {
    const g = brushHost;
    if (!g) return;
    const brush = d3.brushX().extent([
      [LABEL_W + 14, 0],
      [width - 10, CONTEXT_H],
    ]) as d3.BrushBehavior<unknown>;
    brush.on("start", () => {
      draggingRef.current = true;
    });
    // live updates while dragging (no URL writes during the gesture)
    brush.on("brush", (event) => {
      if (!event.selection || programmaticBrush.current) return;
      const [x0, x1] = event.selection as [number, number];
      const from = Math.max(FULL_RANGE.start, Math.round(xFull.invert(x0)));
      const to = Math.min(FULL_RANGE.end, Math.round(xFull.invert(x1)));
      if (to - from >= 10) setRange([from, to]);
    });
    brush.on("end", (event) => {
      draggingRef.current = false;
      if (!event.selection || programmaticBrush.current) return;
      const [x0, x1] = event.selection as [number, number];
      const from = Math.max(FULL_RANGE.start, Math.round(xFull.invert(x0)));
      const to = Math.min(FULL_RANGE.end, Math.round(xFull.invert(x1)));
      if (to - from >= 10) {
        setRange([from, to]);
        // publish the focused year to the global context (URL)
        setYear(Math.round((from + to) / 2));
      }
    });
    brushInst.current = brush;
    d3.select(g).call(brush);
    return () => {
      d3.select(g).on(".brush", null);
    };
  }, [brushHost, width, xFull, setYear]);

  /* sync brush thumb with external range changes — skipped while the
     user is dragging (rewriting the brush mid-gesture breaks the drag) */
  useEffect(() => {
    const g = brushHost;
    const brush = brushInst.current;
    if (!g || !brush) return;
    const [x0, x1] = [xFull(range[0]), xFull(range[1])];
    if (!draggingRef.current) {
      programmaticBrush.current = true;
      (d3.select(g).call(brush.move as never, [x0, x1] as never) as unknown as void);
      queueMicrotask(() => {
        programmaticBrush.current = false;
      });
    }
    // keep the pinch/wheel zoom transform anchored on the current range
    if (svgNode) {
      const k = width / Math.max(1, x1 - x0);
      (svgNode as unknown as { __zoom?: unknown }).__zoom =
        d3.zoomIdentity.translate(-k * x0, 0).scale(k);
    }
  }, [svgNode, brushHost, range, xFull, width]);

  /* pinch / wheel zoom (V0.2): transforms the visible range, keeps the
     brush strip and axes consistent because range is the single state */
  useEffect(() => {
    const svgEl = svgNode;
    if (!svgEl) return;
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 60])
      .filter((ev) => {
        // only wheel and touch gestures — mouse drag stays with the brush
        return ev.type === "wheel" || ev.type === "touchstart" || ev.type === "touchmove";
      })
      .on("zoom", (ev) => {
        const t = ev.transform as d3.ZoomTransform;
        const yearAt = (sx: number) => {
          const localX = (sx - t.x) / t.k;
          return xFull.invert(localX);
        };
        let from = yearAt(0);
        let to = yearAt(width);
        if (to < from) {
          const tmp = from;
          from = to;
          to = tmp;
        }
        const span = Math.max(10, (FULL_RANGE.end - FULL_RANGE.start) / t.k);
        let fromY = Math.max(FULL_RANGE.start, Math.round(from));
        let toY = Math.min(FULL_RANGE.end, Math.round(to));
        if (toY - fromY < span) {
          const mid = (fromY + toY) / 2;
          fromY = Math.max(FULL_RANGE.start, Math.round(mid - span / 2));
          toY = Math.min(FULL_RANGE.end, Math.round(mid + span / 2));
        }
        if (toY - fromY >= 10) setRange([fromY, toY]);
        // reset transform state; range state now owns the view
        (svgEl as unknown as { __zoom?: unknown }).__zoom = d3.zoomIdentity;
      });
    d3.select(svgEl).call(zoom);
    return () => {
      d3.select(svgEl).on(".zoom", null);
    };
  }, [svgNode, width, xFull]);

  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const svgHeight = MAIN_H + GAP + CONTEXT_H;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("tl.filter")}
        </span>
        {CATEGORY_ORDER.map((cat) => {
          const active = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              aria-pressed={active}
              className={
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
                (active
                  ? "border-transparent text-white shadow-sm"
                  : "border-parchment-300 bg-parchment-50 text-ink-soft hover:border-parchment-400")
              }
              style={active ? { backgroundColor: CATEGORY_META[cat].color } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? "#fff" : CATEGORY_META[cat].color }}
              />
              {t(("cat." + cat) as TranslationKey)}
            </button>
          );
        })}
        <button
          onClick={() => setRange(TANG_ERA_RANGE)}
          className="btn-ghost !px-3 !py-1 text-xs"
        >
          {t("tl.reset")}
        </button>
        <span className="ml-auto flex items-center gap-3 font-mono text-xs text-ink-faint">
          {focusPersonId && (
            <span className="flex items-center gap-1 text-vermilion-dark">
              <span className="h-2 w-2 rounded-full border-2 border-vermilion" />
              {people?.find((p) => p.id === focusPersonId)?.name ?? ""} {t("tl.life")}
            </span>
          )}
          {formatYear(range[0])} – {formatYear(range[1])}
        </span>
      </div>

      <div ref={containerRef} className="relative">
        {error ? (
          <ErrorBlock message={t("tl.error")} />
        ) : !events || !civilizations ? (
          <LoadingBlock label={t("tl.loading")} />
        ) : visibleEvents.length === 0 ? (
          <EmptyBlock message={t("tl.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <svg
              ref={setSvgNode}
              viewBox={`0 0 ${width} ${svgHeight}`}
              width="100%"
              height={svgHeight}
              role="img"
              aria-label="Global history timeline 500–1000 CE"
              className="block min-w-[640px] touch-none"
            >
              {/* era bands + labels */}
              {rows.map((civ, i) => {
                const y0 = yFor(i);
                const x0 = Math.max(x(0), x(civ.startYear));
                const x1 = Math.min(x(3000), x(civ.endYear));
                return (
                  <g key={civ.id}>
                    <rect
                      x={x0}
                      y={y0 - ROW_H / 2}
                      width={Math.max(0, x1 - x0)}
                      height={ROW_H - 5}
                      rx={4}
                      fill={civ.color}
                      opacity={0.14}
                    />
                    <circle cx={LABEL_W - 14} cy={y0} r={3} fill={civ.color} />
                    <text
                      x={LABEL_W - 8}
                      y={y0 + 3.5}
                      textAnchor="end"
                      className="fill-ink-soft"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      {civ.name}
                    </text>
                  </g>
                );
              })}

              {/* events */}
              {visibleEvents.map((e) => {
                const i = rowIndex.get(e.civilizationId);
                if (i === undefined) return null;
                const y0 = yFor(i);
                const color = CATEGORY_META[e.category].color;
                const r = 2.5 + e.significance * 0.85;
                const cx = Math.max(x(0), Math.min(x(3000), x(e.year)));
                const spanX2 = e.yearEnd
                  ? Math.max(cx + 2, Math.min(x(3000), x(e.yearEnd)))
                  : null;
                const isFocusedEvent = highlightEventId === e.id;
                const isPersonEvent =
                  focusPersonId !== null && e.participants.includes(focusPersonId);
                return (
                  /* interactions live on the group: clicking the visible dot
                     (topmost circle) must hit the handler — a handler on the
                     lower hit-circle alone would never receive the click */
                  <g
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(e)}
                    onMouseEnter={() =>
                      setTooltip({
                        x: cx,
                        y: y0 - 14,
                        text: `${locale === "zh" ? e.chineseTitle : e.title} · ${formatYear(e.year)} · ${e.civilizationName}`,
                      })
                    }
                    onMouseMove={(ev) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) setTooltip({ x: ev.clientX - rect.left, y: ev.clientY - rect.top - 16, text: tooltip?.text ?? "" });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    role="button"
                    aria-label={`${e.title}, ${e.year}`}
                  >
                    {spanX2 !== null && (
                      <line
                        x1={cx}
                        y1={y0}
                        x2={spanX2}
                        y2={y0}
                        stroke={color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        opacity={0.55}
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={y0}
                      r={r}
                      fill={color}
                      stroke={isFocusedEvent ? "#c9a227" : isPersonEvent ? "#b3402a" : "#fff"}
                      strokeWidth={isFocusedEvent || isPersonEvent ? 2.5 : 1}
                      className="transition-opacity hover:opacity-80"
                    />
                    <circle cx={cx} cy={y0} r={12} fill="transparent">
                      <title>{`${e.title} (${e.year}) — ${e.civilizationName}`}</title>
                    </circle>
                  </g>
                );
              })}

              {/* range guides */}
              <line
                x1={x(range[0])}
                y1={6}
                x2={x(range[0])}
                y2={MAIN_H}
                stroke="#b3402a"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <line
                x1={x(range[1])}
                y1={6}
                x2={x(range[1])}
                y2={MAIN_H}
                stroke="#b3402a"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />

              {/* main axis */}
              <g
                ref={setAxisNode}
                transform={`translate(0, ${MAIN_H})`}
                className="fill-ink-faint [&_.tick_line]:hidden [&_.domain]:stroke-parchment-400"
                style={{ fontSize: 11 }}
              />

              {/* context strip */}
              <rect
                x={LABEL_W + 14}
                y={MAIN_H + GAP}
                width={Math.max(0, width - LABEL_W - 24)}
                height={CONTEXT_H}
                rx={6}
                className="fill-parchment-200/70"
              />
              {events.map((e) => (
                <circle
                  key={e.id}
                  cx={xFull(e.year)}
                  cy={MAIN_H + GAP + CONTEXT_H / 2 - 2}
                  r={1.8}
                  fill={CATEGORY_META[e.category].color}
                  opacity={0.6}
                />
              ))}
              <g
                ref={setBrushHost}
                transform={`translate(0, ${MAIN_H + GAP})`}
              />
              <g
                ref={setContextAxisNode}
                transform={`translate(0, ${MAIN_H + GAP + CONTEXT_H})`}
                className="fill-ink-faint [&_.tick_line]:hidden [&_.domain]:stroke-parchment-400"
                style={{ fontSize: 10 }}
              />
            </svg>
          </div>
        )}

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 max-w-xs rounded-md bg-ink/90 px-2.5 py-1.5 text-xs text-parchment-50 shadow-pop"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />

      <p className="mt-3 text-xs text-ink-faint">{t("tl.hint")}</p>
    </div>
  );

  function yFor(index: number): number {
    return 22 + index * ROW_H;
  }
}
