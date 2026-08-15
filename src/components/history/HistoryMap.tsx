"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Civilization,
  EventDTO,
  HistoricalLocation,
  PersonDTO,
  TerritoryDTO,
} from "@/lib/types";
import { CATEGORY_ORDER, FULL_RANGE, formatYear } from "@/lib/theme";
import { tradeRoutes } from "@/lib/geo";
import { ErrorBlock, LoadingBlock } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { createMap, mapMode, type MapController, type PersonMapPoint } from "./mapAdapters";
import { LocationModal } from "./LocationModal";
import { RouteModal } from "./RouteModal";
import { CivilizationModal } from "./CivilizationModal";
import { EventModal } from "./EventModal";

const TANG_ERA_RANGE: [number, number] = [618, 907];

/**
 * Historical Map 2.0 (V0.2).
 * Reads the global HistoryContext:
 *  ?year   → re-center the visible range around that year (Current Year header)
 *  ?civ    → filter to one civilization
 *  ?person → show the person's activity locations and pan to them
 *  ?loc    → fly to the location and open its detail
 * Layers: events, trade routes (+ clickable nodes), schematic territories.
 */
export function HistoryMap({ className = "" }: { className?: string }) {
  const { context, dispatch, selectEvent, selectLocation } = useExplorer();
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);

  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [civilizations, setCivilizations] = useState<Civilization[] | null>(null);
  const [locations, setLocations] = useState<HistoricalLocation[] | null>(null);
  const [territories, setTerritories] = useState<TerritoryDTO[]>([]);
  const [people, setPeople] = useState<PersonDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCivIds, setVisibleCivIds] = useState<Set<string> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [range, setRange] = useState<[number, number]>(TANG_ERA_RANGE);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTerritories, setShowTerritories] = useState(true);
  const [personLocations, setPersonLocations] = useState<PersonMapPoint[]>([]);
  const [focusedLocation, setFocusedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeModalId, setRouteModalId] = useState<string | null>(null);
  const [locationModalId, setLocationModalId] = useState<string | null>(null);
  const [civModalId, setCivModalId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);
  const [showEventList, setShowEventList] = useState(false);
  const [mode, setMode] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<MapController | null>(null);
  const eventsRef = useRef<EventDTO[] | null>(null);
  const prevYearRef = useRef<number | null>(null);
  const prevCivRef = useRef<string | null>(null);
  const prevPersonRef = useRef<string | null>(null);
  const prevLocRef = useRef<string | null>(null);
  const prevMapEventRef = useRef<string | null>(null);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

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
      fetch("/api/locations").then((r) => {
        if (!r.ok) throw new Error("locations");
        return r.json();
      }),
      fetch("/api/territories").then((r) => {
        if (!r.ok) throw new Error("territories");
        return r.json();
      }),
      fetch("/api/people").then((r) => {
        if (!r.ok) throw new Error("people");
        return r.json();
      }),
    ])
      .then(([evts, civs, locs, ters, ps]) => {
        if (cancelled) return;
        const civList = civs as Civilization[];
        setEvents(evts as EventDTO[]);
        setCivilizations(civList);
        setLocations(locs as HistoricalLocation[]);
        setTerritories(ters as TerritoryDTO[]);
        setPeople(ps as PersonDTO[]);
        setVisibleCivIds(new Set(civList.map((c) => c.id)));
      })
      .catch(() => !cancelled && setError("Failed to load map data."));
    return () => {
      cancelled = true;
    };
  }, []);

  /* init adapter once the container exists */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    createMap(container, {
      onEventClick: (id) => {
        const found = eventsRef.current?.find((e) => e.id === id);
        if (found) dispatch({ type: "OPEN_EVENT", id: found.id });
      },
      onRouteClick: (routeId) => setRouteModalId(routeId),
      onNodeClick: (locationId) => setLocationModalId(locationId),
      onTerritoryClick: (civilizationId) => setCivModalId(civilizationId),
    }).then(
      (controller) => {
        if (disposed) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        setMode(mapMode() === "mapbox" ? "Mapbox GL" : "D3 world map");
      },
      (err) => {
        console.error("Map init failed", err);
        setError("Failed to initialize the map.");
      },
    );
    return () => {
      disposed = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* push data + filters to the adapter */
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !events || !visibleCivIds) return;
    controller.update({
      events,
      civilizations: civilizations ?? [],
      visibleCivIds,
      activeCategory,
      range,
      showRoutes,
      territories,
      showTerritories,
      currentYear: context.year,
      personLocations,
      focusedLocation,
    });
  }, [
    events, civilizations, visibleCivIds, activeCategory, range, showRoutes,
    territories, showTerritories, context.year, personLocations, focusedLocation, mode,
  ]);

  /* ── V0.2 context responses ─────────────────────────────────────── */

  /** One-shot "fly to" request: set, then clear so updates don't re-fly. */
  const flashFocus = useCallback((latitude: number, longitude: number) => {
    setFocusedLocation({ latitude, longitude });
    window.setTimeout(() => setFocusedLocation(null), 2000);
  }, []);

  // ?year → re-center around the focused year
  useEffect(() => {
    const year = context.year;
    if (year === prevYearRef.current) return;
    prevYearRef.current = year;
    if (year !== null && (year < range[0] || year > range[1])) {
      setRange([
        Math.max(FULL_RANGE.start, year - 25),
        Math.min(FULL_RANGE.end, year + 25),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.year]);

  // ?civ → filter to that civilization only (focus)
  useEffect(() => {
    const id = context.civilizationId;
    if (id === prevCivRef.current) return;
    prevCivRef.current = id;
    if (!visibleCivIds || !civilizations) return;
    if (id) {
      setVisibleCivIds(new Set([id]));
    } else {
      setVisibleCivIds(new Set(civilizations.map((c) => c.id)));
    }
  }, [context.civilizationId, visibleCivIds, civilizations]);

  // ?person → show activity locations (participant events + civilization seat)
  useEffect(() => {
    const id = context.personId;
    if (id === prevPersonRef.current) return;
    prevPersonRef.current = id;
    if (!id) {
      setPersonLocations([]);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`/api/events?personId=${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch(`/api/locations`).then((r) => r.json()),
      fetch(`/api/people`).then((r) => r.json()),
    ])
      .then(([personEventsData, allLocs, allPeople]) => {
        if (cancelled) return;
        const evts = personEventsData as EventDTO[];
        const locs = allLocs as HistoricalLocation[];
        const ps = allPeople as PersonDTO[];
        const person = ps.find((p) => p.id === id);
        const seen = new Set<string>();
        const points: PersonMapPoint[] = [];
        for (const e of evts) {
          if (e.locationId && e.latitude !== null && e.longitude !== null && !seen.has(e.locationId)) {
            seen.add(e.locationId);
            points.push({
              id: `p-${id}-${e.locationId}`,
              name: `${person?.name ?? id} · ${e.locationName ?? e.locationId}`,
              latitude: e.latitude,
              longitude: e.longitude,
              locationId: e.locationId,
            });
          }
        }
        if (person?.civilizationId) {
          const seat = locs.find((l) => l.civilizationId === person.civilizationId);
          if (seat && !seen.has(seat.id)) {
            points.push({
              id: `p-${id}-seat`,
              name: `${person.name} · ${seat.name} (seat of ${person.civilizationName ?? ""})`,
              latitude: seat.latitude,
              longitude: seat.longitude,
              locationId: seat.id,
            });
          }
        }
        setPersonLocations(points);
        if (points.length > 0) {
          const mid = points[Math.floor(points.length / 2)];
          flashFocus(mid.latitude, mid.longitude);
        }
      })
      .catch(() => !cancelled && setPersonLocations([]));
    return () => {
      cancelled = true;
    };
  }, [context.personId, flashFocus]);

  // ?event → fly to the event location and auto-select the marker.
  // V0.3 fix: inside a Journey (?journey=) the step transition must NOT
  // auto-open the Event popup (two modals would stack and break the
  // narrative flow) — the map still flies to and highlights the marker;
  // manual marker clicks keep opening the modal as before.
  useEffect(() => {
    const id = context.eventId;
    if (!id) {
      setSelectedEvent(null);
      prevMapEventRef.current = null;
      return;
    }
    if (!events) return; // wait for data — do NOT consume the guard yet
    if (id === prevMapEventRef.current) return;
    prevMapEventRef.current = id;
    const event = events.find((e) => e.id === id);
    if (context.journeyId) {
      // journey mode: highlight only — no auto popup
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event ?? null);
    }
    if (event && event.latitude !== null && event.longitude !== null) {
      flashFocus(event.latitude, event.longitude);
    }
  }, [context.eventId, context.journeyId, events, flashFocus]);

  // ?loc → fly to the location and open its detail modal
  // (same journey-mode rule: fly + highlight, no auto popup)
  useEffect(() => {
    const id = context.locationId;
    if (!id) {
      setLocationModalId(null);
      prevLocRef.current = null;
      return;
    }
    if (!locations) return; // wait for data — do NOT consume the guard yet
    if (id === prevLocRef.current) return;
    prevLocRef.current = id;
    const loc = locations.find((l) => l.id === id);
    if (loc) {
      flashFocus(loc.latitude, loc.longitude);
      setLocationModalId(context.journeyId ? null : id);
    }
  }, [context.locationId, context.journeyId, locations, flashFocus]);

  const toggleCiv = useCallback((id: string) => {
    setVisibleCivIds((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const countVisible = useMemo(() => {
    if (!events) return 0;
    return events.filter(
      (e) =>
        visibleCivIds?.has(e.civilizationId) &&
        (activeCategory === "all" || e.category === activeCategory) &&
        e.year >= range[0] &&
        e.year <= range[1],
    ).length;
  }, [events, visibleCivIds, activeCategory, range]);

  /** Same filter as the map markers — the sidebar is a second entry point. */
  const visibleEventList = useMemo(() => {
    if (!events) return [];
    return events
      .filter(
        (e) =>
          e.latitude !== null &&
          e.longitude !== null &&
          visibleCivIds?.has(e.civilizationId) &&
          (activeCategory === "all" || e.category === activeCategory) &&
          e.year >= range[0] &&
          e.year <= range[1],
      )
      .sort((a, b) => a.year - b.year || b.significance - a.significance);
  }, [events, visibleCivIds, activeCategory, range]);

  const route = routeModalId ? tradeRoutes.find((r) => r.id === routeModalId) ?? null : null;
  const location = locationModalId
    ? locations?.find((l) => l.id === locationModalId) ?? null
    : null;
  const civilization = civModalId
    ? civilizations?.find((c) => c.id === civModalId) ?? null
    : null;

  return (
    <div className={className}>
      <div className="panel mb-4 flex flex-col gap-4 p-4">
        {/* Current Year header (V0.2) */}
        <div className="flex flex-wrap items-center gap-3 border-b border-parchment-200 pb-3">
          <span className="flex items-center gap-2 rounded-lg bg-ink px-3 py-1.5 text-sm font-bold text-parchment-50 shadow-card">
            <Icon name="clock" className="h-4 w-4 text-gold-light" />
            {t("map.currentYear")}: {context.year !== null ? `${formatYear(context.year)}` : "—"}
          </span>
          <span className="text-xs text-ink-faint">
            {context.year !== null
              ? t("map.viewing", { year: formatYear(context.year) })
              : t("map.browsing", { from: formatYear(range[0]), to: formatYear(range[1]) })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* civilization toggles */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {civilizations?.map((civ) => {
              const active = visibleCivIds?.has(civ.id) ?? false;
              return (
                <button
                  key={civ.id}
                  onClick={() => toggleCiv(civ.id)}
                  aria-pressed={active}
                  className={
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
                    (active
                      ? "border-transparent text-white shadow-sm"
                      : "border-parchment-300 bg-parchment-50 text-ink-soft hover:border-parchment-400")
                  }
                  style={active ? { backgroundColor: civ.color } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: active ? "#fff" : civ.color }}
                  />
                  {civ.name}
                </button>
              );
            })}
          </div>

          {/* category filter */}
          <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
            <Icon name="filter" className="h-3.5 w-3.5" />
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="input-field !py-1"
              aria-label={t("map.allCategories")}
            >
              <option value="all">{t("map.allCategories")}</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {t(("cat." + cat) as TranslationKey)}
                </option>
              ))}
            </select>
          </label>

          {/* year range */}
          <div className="flex items-center gap-2 text-xs font-medium text-ink-soft">
            <Icon name="clock" className="h-3.5 w-3.5" />
            <input
              type="number"
              min={FULL_RANGE.start}
              max={FULL_RANGE.end}
              value={range[0]}
              onChange={(e) => setRange([Number(e.target.value), range[1]])}
              className="input-field w-20 !py-1 font-mono"
              aria-label={t("map.fromYear")}
            />
            <span>–</span>
            <input
              type="number"
              min={FULL_RANGE.start}
              max={FULL_RANGE.end}
              value={range[1]}
              onChange={(e) => setRange([range[0], Number(e.target.value)])}
              className="input-field w-20 !py-1 font-mono"
              aria-label={t("map.toYear")}
            />
            <span className="hidden sm:inline">
              {formatYear(range[0])} – {formatYear(range[1])}
            </span>
          </div>

          {/* routes toggle */}
          <button
            onClick={() => setShowRoutes((v) => !v)}
            aria-pressed={showRoutes}
            className={
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
              (showRoutes
                ? "border-gold bg-gold/15 text-gold-dark"
                : "border-parchment-300 bg-parchment-50 text-ink-soft")
            }
          >
            <Icon name="route" className="h-3.5 w-3.5" />
            {t("map.tradeRoutes")}
          </button>

          {/* territories toggle (V0.2) */}
          <button
            onClick={() => setShowTerritories((v) => !v)}
            aria-pressed={showTerritories}
            title={t("map.territoriesBadge")}
            className={
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
              (showTerritories
                ? "border-jade bg-jade/15 text-jade-dark"
                : "border-parchment-300 bg-parchment-50 text-ink-soft")
            }
          >
            <Icon name="layers" className="h-3.5 w-3.5" />
            {t("map.territories")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-parchment-200 pt-3 text-[11px] text-ink-faint">
          <span>
            <span className="mr-1 font-semibold text-ink-soft">{countVisible}</span> {t("map.eventsShown")}
          </span>
          {tradeRoutes.map((r) => (
            <button
              key={r.id}
              onClick={() => setRouteModalId(r.id)}
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <span
                className="inline-block h-0.5 w-4 border-t-2 border-dashed"
                style={{ borderColor: r.color }}
              />
              {r.name}
            </button>
          ))}
          {showTerritories && (
            <span
              className="rounded-full bg-jade/10 px-2 py-0.5 text-jade-dark"
              title={t("map.territoriesBadge")}
            >
              {t("map.territoriesBadge")}
            </span>
          )}
          {personLocations.length > 0 && (
            <span className="flex flex-wrap items-center gap-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-gold-dark">
              <span className="h-2 w-2 rounded-full bg-gold" />
              {people?.find((p) => p.id === context.personId)?.name ?? ""} {t("map.personActivity")}:
              {personLocations.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setLocationModalId(pl.locationId)}
                  className="rounded-full border border-gold/40 bg-parchment-50 px-1.5 py-0 text-[10px] font-semibold text-gold-dark transition hover:bg-gold hover:text-white"
                  title={pl.name}
                >
                  {pl.name.split(" · ")[0]}
                </button>
              ))}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            <Icon name="layers" className="h-3.5 w-3.5" />
            Engine: <strong>{mode ?? "…"}</strong>
            {mode === "D3 world map" && (
              <span className="hidden sm:inline">{t("map.engineD3")}</span>
            )}
          </span>
          <button
            onClick={() => setShowEventList((v) => !v)}
            aria-pressed={showEventList}
            className={
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
              (showEventList
                ? "border-vermilion bg-vermilion/10 text-vermilion-dark"
                : "border-parchment-300 bg-parchment-50 text-ink-soft hover:border-parchment-400")
            }
          >
            <Icon name="calendar" className="h-3.5 w-3.5" />
            {t("map.eventsList")} ({countVisible})
          </button>
        </div>
      </div>

      {/* map + sidebar event list (second entry point besides markers) */}
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* container is always rendered so the map adapter can mount; overlays show state */}
        <div
          ref={containerRef}
          className="relative h-[540px] w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-parchment-300 bg-parchment-50 shadow-card sm:h-[600px]"
          role="application"
          aria-label="Interactive historical map"
        >
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-parchment-50/90">
              <ErrorBlock message={t("map.error")} />
            </div>
          )}
          {!events && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-parchment-50/90">
              <LoadingBlock label={t("map.loading")} />
            </div>
          )}
        </div>

        {showEventList && (
          <aside
            className="panel max-h-[540px] w-full shrink-0 overflow-y-auto p-3 sm:max-h-[600px] lg:w-72"
            aria-label={t("map.eventsList")}
          >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              {t("map.eventsInView")} · {visibleEventList.length}
            </p>
            {visibleEventList.length === 0 ? (
              <p className="px-1 text-xs text-ink-faint">{t("map.listEmpty")}</p>
            ) : (
              <ul className="space-y-1">
                {visibleEventList.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => dispatch({ type: "OPEN_EVENT", id: e.id })}
                      className="group flex w-full items-baseline gap-2 rounded-lg border border-parchment-200 bg-parchment-100/50 px-2 py-1.5 text-left transition hover:border-gold"
                    >
                      <span className="shrink-0 font-mono text-[11px] text-ink-faint">{e.year}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-vermilion-dark">
                          {zh(e.title, e.chineseTitle)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: e.civilizationColor }}
                          />
                          {e.civilizationName}
                          <span className="text-gold-dark">
                            {"★".repeat(e.significance)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          selectEvent(null);
        }}
      />
      <RouteModal
        route={route}
        onClose={() => setRouteModalId(null)}
        onSelectNode={(locationId) => {
          setRouteModalId(null);
          setLocationModalId(locationId);
        }}
      />
      <LocationModal
        location={location}
        onClose={() => {
          setLocationModalId(null);
          selectLocation(null);
        }}
      />
      <CivilizationModal civilization={civilization} onClose={() => setCivModalId(null)} />
    </div>
  );
}
