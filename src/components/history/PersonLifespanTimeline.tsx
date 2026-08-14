"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventDTO, PersonDTO } from "@/lib/types";
import {
  buildPersonLifespanModel,
  lifespanRange,
  selectPeopleAliveAtYear,
  yearToPosition,
  type PersonLifespanModel,
} from "@/lib/learning/lifespan";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";

/**
 * V0.3 Phase 2 — Person Lifespan Timeline.
 *
 * Shows lifespans (birth–death), provenance PersonRole[] spans and key
 * events for people alive at the journey's current year. Clicking a person
 * opens the existing PersonDrawer (via /people?person= — OPEN_PERSON).
 * Dates use the shared provenance formatters only; disputed/approximate/
 * unknown follow history-data-policy. No second person dataset.
 */
export function PersonLifespanTimeline({
  year,
  personId,
  className = "",
}: {
  /** Journey current year (context year) — drives the marker line. */
  year: number | null;
  /** Optional fixed person (e.g. future journeys with personId steps). */
  personId?: string;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const { dispatch } = useExplorer();
  const zh = locale === "zh";
  const [people, setPeople] = useState<PersonDTO[] | null>(null);
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/people").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/events").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([ps, evts]) => {
        if (cancelled) return;
        setPeople(ps as PersonDTO[]);
        setEvents(evts as EventDTO[]);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const models = useMemo<PersonLifespanModel[]>(() => {
    if (!people || !events) return [];
    if (personId) {
      const p = people.find((x) => x.id === personId);
      return p ? [buildPersonLifespanModel(p, events, year, locale)] : [];
    }
    return selectPeopleAliveAtYear(people, year).map((p) =>
      buildPersonLifespanModel(p, events, year, locale),
    );
  }, [people, events, personId, year, locale]);

  const range = useMemo<[number, number]>(
    () => lifespanRange(models, year),
    [models, year],
  );

  const openPerson = (id: string) => dispatch({ type: "OPEN_PERSON", id });

  return (
    <section className={`panel p-5 ${className}`} aria-label={t("journey.lifespanTitle")}>
      <header className="flex items-center gap-2">
        <Icon name="users" className="h-4 w-4 text-gold-dark" />
        <h2 className="font-display text-base font-bold text-ink">
          {t("journey.lifespanTitle")}
        </h2>
        {year !== null && (
          <span className="ml-auto font-mono text-xs text-ink-faint">
            {zh ? `${year} 年` : `${year} CE`}
          </span>
        )}
      </header>
      <p className="mt-1 text-xs text-ink-faint">{t("journey.lifespanSubtitle")}</p>

      {error && (
        <p className="mt-4 text-center text-xs text-ink-faint">{t("journey.worldError")}</p>
      )}
      {!people && !error && (
        <p className="mt-4 text-center text-xs text-ink-faint">{t("common.loading")}</p>
      )}
      {people && models.length === 0 && (
        <p className="mt-4 text-center text-xs italic text-ink-faint">
          {t("journey.lifespanNoPerson")}
        </p>
      )}

      {models.length > 0 && (
        <div className="mt-4 space-y-3">
          {models.map((m) => (
            <div
              key={m.personId}
              className="grid grid-cols-[minmax(0,7fr)_minmax(0,9fr)] gap-3 rounded-lg border border-parchment-200 bg-parchment-50/60 p-3"
            >
              {/* person label */}
              <button
                onClick={() => openPerson(m.personId)}
                className="group text-left"
                aria-label={`${t("journey.lifespanOpen")}: ${m.name}`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: m.civilizationColor ?? "#8a7a66" }}
                    aria-hidden="true"
                  />
                  <span className="font-display text-sm font-bold text-ink group-hover:text-vermilion-dark">
                    {zh ? m.chineseName : m.name}
                  </span>
                </span>
                <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                  {m.lifespanDisplay}
                </span>
                {m.roles.length > 0 && (
                  <span className="mt-1 block text-[11px] leading-snug text-ink-faint">
                    {m.roles.map((r) => r.role.split(" ").slice(0, 2).join(" ")).join(" · ")}
                  </span>
                )}
              </button>

              {/* lifespan track */}
              <div className="relative min-h-[64px]">
                {/* base line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-parchment-300" />
                {/* birth–death span */}
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gold/40"
                  style={{
                    left: `${yearToPosition(m.birthYear ?? range[0], range[0], range[1]) * 100}%`,
                    width: `${Math.max(
                      0,
                      (yearToPosition(m.deathYear ?? range[1], range[0], range[1]) -
                        yearToPosition(m.birthYear ?? range[0], range[0], range[1])) *
                        100,
                    )}%`,
                  }}
                  title={m.lifespanDisplay}
                />
                {/* role spans */}
                {m.roles.map((r, i) => {
                  const from = yearToPosition(r.fromYear ?? m.birthYear ?? range[0], range[0], range[1]);
                  const to = yearToPosition(r.toYear ?? m.deathYear ?? range[1], range[0], range[1]);
                  return (
                    <div
                      key={i}
                      className="absolute top-[18%] h-2 rounded-sm bg-vermilion/70"
                      style={{
                        left: `${from * 100}%`,
                        width: `${Math.max(1.5, (to - from) * 100)}%`,
                      }}
                      title={`${r.role}: ${r.fromDisplay}–${r.toDisplay}`}
                    />
                  );
                })}
                {/* key events */}
                {m.events.map((e) => (
                  <button
                    key={e.eventId}
                    onClick={() => dispatch({ type: "OPEN_EVENT", id: e.eventId })}
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-sm transition hover:scale-125 hover:bg-vermilion"
                    style={{
                      left: `${yearToPosition(e.year, range[0], range[1]) * 100}%`,
                    }}
                    title={`${zh ? e.chineseTitle : e.title} (${e.dateDisplay})`}
                    aria-label={`${e.title} (${e.dateDisplay})`}
                  />
                ))}
                {/* current year marker (journey-linked) */}
                {year !== null && (
                  <div
                    className="absolute bottom-0 top-0 w-px bg-vermilion"
                    style={{
                      left: `${yearToPosition(year, range[0], range[1]) * 100}%`,
                    }}
                    aria-hidden="true"
                  >
                    <span className="absolute -top-1 left-1 rounded bg-vermilion px-1 font-mono text-[9px] font-bold text-white">
                      {year}
                    </span>
                  </div>
                )}
                {/* axis labels */}
                <span className="absolute -bottom-0.5 left-0 translate-y-full font-mono text-[10px] text-ink-faint">
                  {range[0]}
                </span>
                <span className="absolute -bottom-0.5 right-0 translate-y-full font-mono text-[10px] text-ink-faint">
                  {range[1]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
