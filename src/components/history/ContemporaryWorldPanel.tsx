"use client";

import { useEffect, useMemo, useState } from "react";
import type { Civilization, EventDTO } from "@/lib/types";
import { REGION_ORDER } from "@/lib/theme";
import { zhRegionNames } from "@/data/seed/zhMisc";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";

interface WorldGroup {
  region: string;
  civilizations: Civilization[];
  events: EventDTO[];
}

/**
 * V0.3 — Contemporary World Panel.
 *
 * "751 年，中国发生了什么？与此同时，世界其他地方发生了什么？"
 * All data comes from the existing seed-backed APIs — no invented facts.
 * Regions without reliable structured data show an explicit placeholder.
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
      fetch("/api/events").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/civilizations").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
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

  const groups = useMemo<WorldGroup[]>(() => {
    if (!events || !civilizations || year === null) return [];
    const civByRegion = new Map<string, Civilization[]>();
    for (const c of civilizations) {
      const list = civByRegion.get(c.region) ?? [];
      list.push(c);
      civByRegion.set(c.region, list);
    }
    const out: WorldGroup[] = [];
    for (const region of REGION_ORDER) {
      const civs = civByRegion.get(region) ?? [];
      if (civs.length === 0) continue;
      const regionEvents = events
        .filter((e) => {
          // point event within ±5 years, or range covering the year
          if (e.civilizationId && !civs.some((c) => c.id === e.civilizationId)) {
            return false;
          }
          if (e.yearEnd !== null) return e.year <= year && year <= e.yearEnd;
          return Math.abs(e.year - year) <= 5;
        })
        .sort((a, b) => a.year - b.year)
        .slice(0, 4);
      out.push({ region, civilizations: civs, events: regionEvents });
    }
    return out;
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
            className="rounded-lg border border-parchment-200 bg-parchment-50/70 p-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wide text-vermilion-dark">
              {zh ? (zhRegionNames[g.region] ?? g.region) : g.region}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {g.civilizations.map((c) => (
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
            {g.events.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {g.events.map((e) => (
                  <li key={e.id} className="text-[12px] leading-snug text-ink-soft">
                    <span className="font-mono text-[11px] text-ink-faint">
                      {e.year}
                      {e.yearEnd !== null && e.yearEnd !== e.year ? `–${e.yearEnd}` : ""}
                    </span>{" "}
                    {zh ? e.chineseTitle : e.title}
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
