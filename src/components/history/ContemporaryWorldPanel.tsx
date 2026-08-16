"use client";

import { useEffect, useMemo, useState } from "react";
import type { Civilization, EventDTO } from "@/lib/types";
import {
  groupCivilizationsByRegion,
  selectEventsForYear,
  worldRegionLabel,
  type WorldRegion,
} from "@/lib/learning/worldContext";
import { formatYearSpan } from "@/lib/provenance";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { cachedFetchJson } from "./fetchCache";

/**
 * V0.3 Phase 2 — World Context (enhanced).
 *
 * "同一年，世界不同地区发生了什么？" organized by region:
 *   East Asia · Central Asia · Middle East · Europe · Japan · Southeast Asia · Americas
 * Each region shows: civilization(s), key event(s), short explanation,
 * date (provenance formatter) and confidence. Regions without reliable
 * structured data show an explicit placeholder — nothing is invented.
 */
export function ContemporaryWorldPanel({ year }: { year: number | null }) {
  const { locale, t } = useLocale();
  const zh = locale === "zh";
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [civilizations, setCivilizations] = useState<Civilization[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cachedFetchJson("/api/events"),
      cachedFetchJson("/api/civilizations"),
    ])
      .then(([evts, civs]) => {
        if (cancelled) return;
        setEvents(evts as EventDTO[]);
        setCivilizations(civs as Civilization[]);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    if (!civilizations || year === null) return [];
    return groupCivilizationsByRegion(civilizations.map((c) => c.id)).map((g) => {
      const civs = civilizations.filter((c) => g.civilizationIds.includes(c.id));
      const rows = events ? selectEventsForYear(events, g.civilizationIds, year) : [];
      return { ...g, civs, rows };
    });
  }, [events, civilizations, year]);

  if (year === null) {
    return (
      <div className="panel p-5 text-center text-xs text-ink-faint">
        {t("journey.worldNoYear")}
      </div>
    );
  }
  if (error) {
    return (
      <div className="panel p-5 text-center text-xs text-ink-faint">
        {t("journey.worldError")}
      </div>
    );
  }
  if (!events || !civilizations) {
    return (
      <div className="panel p-5 text-center text-xs text-ink-faint">
        {t("journey.worldLoading")}
      </div>
    );
  }

  const confidenceBadge = (row: { confidence: string }) => {
    const c = row.confidence;
    if (c === "disputed") {
      return (
        <span className="rounded-full bg-vermilion/10 px-1.5 py-0.5 text-[10px] font-semibold text-vermilion-dark">
          {t("world.confidence.disputed")}
        </span>
      );
    }
    if (c === "unverified" || c === "low") {
      return (
        <span className="rounded-full bg-parchment-300/40 px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">
          {t("world.confidence.unverified")}
        </span>
      );
    }
    return null; // high/medium — no badge needed
  };

  return (
    <section className="panel p-5" aria-label={t("journey.worldTitle")}>
      <header className="flex items-center gap-2">
        <Icon name="globe" className="h-4 w-4 text-gold-dark" />
        <h2 className="font-display text-base font-bold text-ink">
          {t("journey.worldTitle")}
        </h2>
        <span className="ml-auto font-mono text-xs text-ink-faint">
          {zh ? `${year} 年` : `${year} CE`}
        </span>
      </header>
      <p className="mt-1 text-xs text-ink-faint">{t("journey.worldSubtitle")}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.region}
            className="rounded-lg border border-parchment-200 bg-parchment-50/70 p-3.5"
          >
            <h3 className="text-xs font-bold uppercase tracking-wide text-vermilion-dark">
              {worldRegionLabel(g.region as WorldRegion, locale)}
            </h3>

            {/* civilizations */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {g.civs.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-full border border-parchment-300 bg-parchment-100 px-2 py-0.5 text-[11px] font-medium text-ink"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  {zh ? c.chineseName : c.name}
                  <span className="font-mono text-[10px] text-ink-faint">
                    {c.startYear}–{c.endYear}
                  </span>
                </span>
              ))}
            </div>

            {/* key events with explanation + provenance */}
            {g.rows.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {g.rows.map((row) => (
                  <li key={row.eventId} className="text-[12px] leading-snug text-ink-soft">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] text-ink-faint">
                        {formatYearSpan(
                          row.year,
                          row.yearEnd,
                          {
                            year: row.year,
                            yearMax: row.yearEnd ?? undefined,
                            precision: row.precision,
                            confidence: row.confidence,
                          },
                          locale,
                        )}
                      </span>
                      <span className="font-semibold text-ink">
                        {zh ? row.chineseTitle : row.title}
                      </span>
                      {confidenceBadge(row)}
                    </span>
                    <span className="mt-0.5 block text-[11px] italic text-ink-faint">
                      {zh ? row.zhExplanation : row.shortExplanation}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11px] italic text-ink-faint">
                {t("journey.worldNoData")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
