"use client";

import Link from "next/link";
import type {
  Civilization,
  EventDTO,
  PersonDTO,
} from "@/lib/types";
import { CATEGORY_META, formatYear } from "@/lib/theme";
import { zhRegionNames } from "@/data/seed/zhMisc";
import { zhEventTags } from "@/data/seed/zhTags";
import { civilizations as seedCivs } from "@/data/seed";

const civZh = new Map(seedCivs.map((c) => [c.id, c.chineseName]));
import { formatYearSpan } from "@/lib/provenance";
import { Icon } from "@/components/ui/icons";
import { EventAIExplanation, EventMiniMap } from "./EventPageWidgets";
import { useLocale } from "./LocaleProvider";

export interface EventDetailRelated {
  civilizations: Civilization[];
  relatedCivilizations: Civilization[];
  sameCiv: EventDTO[];
  worldParallel: EventDTO[];
  participants: string[];
  people: PersonDTO[];
}

/**
 * Event Detail view — client component so every label follows the
 * active locale (EN / 中文).
 */
export function EventDetailView({
  event,
  related,
}: {
  event: EventDTO;
  related: EventDetailRelated;
}) {
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);
  const category = CATEGORY_META[event.category];
  const { relatedCivilizations, sameCiv, worldParallel, participants, people } = related;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="btn-ghost !px-3 !py-1.5 text-xs">
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" /> {t("ev.back")}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/map?event=${encodeURIComponent(event.id)}&year=${event.year}`}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            <Icon name="map" className="h-3.5 w-3.5" /> {t("ev.openMap")}
          </Link>
          <Link
            href={`/people?event=${encodeURIComponent(event.id)}`}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            <Icon name="users" className="h-3.5 w-3.5" /> {t("ev.openPeople")}
          </Link>
          <Link
            href={`/?event=${encodeURIComponent(event.id)}&year=${event.year}`}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            <Icon name="calendar" className="h-3.5 w-3.5" /> {t("ev.viewTimeline")}
          </Link>
          <Link
            href={`/chat?event=${encodeURIComponent(event.id)}&year=${event.year}`}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            <Icon name="bot" className="h-3.5 w-3.5" /> {t("ev.askAI")}
          </Link>
        </div>
      </div>

      {/* header */}
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-vermilion px-2.5 py-1 font-mono text-sm font-bold text-white">
            {formatYearSpan(event.year, event.yearEnd, event.dateProvenance, locale)}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: category.color }}
          >
            {locale === "zh" ? t(`cat.${event.category}` as never) : category.label}
          </span>
          <span
            className="ml-auto flex items-center gap-0.5 text-gold-dark"
            aria-label={t("ev.significance", { n: event.significance })}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name="star"
                className="h-4 w-4"
                fill={i < event.significance ? "currentColor" : "none"}
              />
            ))}
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
          {zh(event.title, event.chineseTitle)}
          <span className="ml-3 font-sans text-lg font-normal text-ink-faint">

          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
          {zh(event.description, event.zhDescription)}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span key={tag} className="chip !text-ink-faint">
              #{locale === "zh" ? (zhEventTags[tag] ?? tag) : tag}
            </span>
          ))}
        </div>
      </section>

      {/* map */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Icon name="map" className="h-4 w-4 text-vermilion" /> {t("ev.map")}
        </h2>
        <EventMiniMap event={event} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* timeline of related events */}
          <section className="panel p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Icon name="calendar" className="h-4 w-4 text-vermilion" /> {t("ev.onTimeline")}
            </h2>
            {sameCiv.length === 0 && worldParallel.length === 0 ? (
              <p className="text-sm text-ink-faint">{t("cmp.noEvent")}</p>
            ) : (
              <ul className="space-y-2">
                {sameCiv.slice(0, 4).map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/events/${e.id}`}
                      className="flex items-baseline gap-3 rounded-lg border border-parchment-200 bg-parchment-100/50 px-3 py-2 transition hover:border-gold"
                    >
                      <span className="shrink-0 font-mono text-xs text-ink-faint">
                        {formatYear(e.year)}
                      </span>
                      <span className="text-sm font-semibold text-ink">{zh(e.title, e.chineseTitle)}</span>
                      <span className="ml-auto hidden text-[11px] text-ink-faint sm:block">
                        {locale === "zh" ? (civZh.get(e.civilizationId) ?? e.civilizationName) : e.civilizationName}
                      </span>
                    </Link>
                  </li>
                ))}
                {worldParallel.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/events/${e.id}`}
                      className="flex items-baseline gap-3 rounded-lg border border-dashed border-parchment-300 px-3 py-2 transition hover:border-gold"
                    >
                      <span className="shrink-0 font-mono text-xs text-ink-faint">
                        {formatYear(e.year)}
                      </span>
                      <span className="text-sm font-semibold text-ink">{zh(e.title, e.chineseTitle)}</span>
                      <span className="ml-auto hidden text-[11px] text-ink-faint sm:block">
                        🌍 {locale === "zh" ? (civZh.get(e.civilizationId) ?? e.civilizationName) : e.civilizationName}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-ink-faint">{t("ev.timelineNote")}</p>
          </section>

          {/* AI explanation */}
          <section>
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Icon name="bot" className="h-4 w-4 text-vermilion" /> {t("ev.whyMatters")}
              <span className="text-xs font-normal text-ink-faint">{t("ev.aiExplain")}</span>
            </h2>
            <EventAIExplanation event={event} />
          </section>
        </div>

        {/* sidebar */}
        <aside className="space-y-6">
          {/* related people */}
          <section className="panel p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Icon name="users" className="h-4 w-4 text-vermilion" /> {t("ev.relatedPeople")}
            </h2>
            {participants.length === 0 ? (
              <p className="text-sm text-ink-faint">{t("ev.noParticipants")}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {participants.map((name) => {
                  const person = people.find((p) => p.name === name);
                  return person ? (
                    <Link
                      key={name}
                      href={`/people?person=${encodeURIComponent(person.id)}`}
                      className="chip !border-vermilion/30 !bg-vermilion/5 transition hover:!border-vermilion"
                      title={t("dr.openProfile")}
                    >
                      <Icon name="users" className="h-3 w-3 text-vermilion" />
                      {zh(person.name, person.chineseName)}
                    </Link>
                  ) : (
                    <span key={name} className="chip">
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            <Link
              href={`/people?event=${encodeURIComponent(event.id)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-vermilion-dark hover:underline"
            >
              {t("ev.seeActive", { year: formatYear(event.year) })}{" "}
              <Icon name="arrow-right" className="h-3 w-3" />
            </Link>
          </section>

          {/* related civilizations */}
          <section className="panel p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Icon name="globe" className="h-4 w-4 text-vermilion" /> {t("ev.relatedCivs")}
            </h2>
            <div className="space-y-2">
              {relatedCivilizations.map((c) => (
                <Link
                  key={c.id}
                  href={`/map?civ=${encodeURIComponent(c.id)}&year=${event.year}`}
                  className="flex items-start gap-2.5 rounded-lg border border-parchment-200 bg-parchment-100/50 p-3 transition hover:border-gold"
                >
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink">
                      {zh(c.name, c.chineseName)}
                    </span>
                    <span className="block text-xs text-ink-faint">
                      {locale === "zh" ? (zhRegionNames[c.region] ?? c.region) : c.region} ·{" "}
                      {formatYear(c.startYear)}–{formatYear(c.endYear)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* location */}
          {event.locationName && (
            <section className="panel p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Icon name="map" className="h-4 w-4 text-vermilion" /> {t("ev.location")}
              </h2>
              <Link
                href={`/map?loc=${encodeURIComponent(event.locationId ?? "")}`}
                className="block rounded-lg border border-parchment-200 bg-parchment-100/50 p-3 transition hover:border-gold"
              >
                <span className="block text-sm font-bold text-ink">{event.locationName}</span>
                <span className="mt-1 block text-[11px] text-ink-faint">{t("ev.openOnMap")}</span>
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
