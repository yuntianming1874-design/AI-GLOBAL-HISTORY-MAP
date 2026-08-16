"use client";

import Link from "next/link";
import type { OverviewDTO } from "@/lib/types";
import { Section } from "@/components/ui/primitives";
import { EventCard } from "./EventCard";
import { Timeline } from "./Timeline";
import { ComparisonPanel } from "./ComparisonPanel";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";
import { JourneyExplorer } from "./JourneyExplorer";
import { JourneysGrid } from "./JourneysGrid";
import type { Journey } from "@/lib/learning/journeyTypes";

/**
 * Home overview view — client component so every label follows the
 * active locale (EN / 中文).
 */
export function HomeView({
  overview,
  mode,
  featuredJourneys,
}: {
  overview: OverviewDTO;
  mode: "postgres" | "seed";
  /** V0.3 Phase 3C — from journeyRepository (never hard-coded). */
  featuredJourneys?: Journey[];
}) {
  const { t } = useLocale();
  const { context } = useExplorer();

  // V0.3: ?journey=<slug>&step=N → Journey Explorer mode (single source:
  // the URL). Everything below stays untouched otherwise.
  if (context.journeyId) {
    return <JourneyExplorer />;
  }

  return (
    <div className="space-y-12">
      {/* hero */}
      <section className="panel relative overflow-hidden p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #b3402a 0, transparent 40%), radial-gradient(circle at 80% 20%, #c9a227 0, transparent 40%), radial-gradient(circle at 60% 80%, #2f8f6b 0, transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            {t("home.badge")}
          </p>
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            {t("home.title1")} <span className="text-vermilion">{t("home.title2")}</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("home.subtitle")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a href="#timeline" className="btn-primary">
              <Icon name="calendar" className="h-4 w-4" /> {t("home.cta.timeline")}
            </a>
            <Link href="/map" className="btn-ghost">
              <Icon name="map" className="h-4 w-4" /> {t("home.cta.map")}
            </Link>
            <Link href="/people" className="btn-ghost">
              <Icon name="users" className="h-4 w-4" /> {t("home.cta.people")}
            </Link>
            <Link href="/chat" className="btn-ghost">
              <Icon name="bot" className="h-4 w-4" /> {t("home.cta.chat")}
            </Link>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: t("home.stat.events"), value: String(overview.stats.events) },
              { label: t("home.stat.people"), value: String(overview.stats.people) },
              { label: t("home.stat.civilizations"), value: String(overview.stats.civilizations) },
              { label: t("home.stat.relationships"), value: String(overview.stats.relationships) },
              { label: t("home.stat.locations"), value: String(overview.stats.locations) },
              { label: t("home.stat.years"), value: overview.stats.yearsCovered },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-parchment-200 bg-parchment-50/80 px-3 py-2.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  {s.label}
                </dt>
                <dd className="font-display text-lg font-bold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-ink-faint">
            {mode === "postgres" ? t("home.datamode.pg") : t("home.datamode.seed")}
          </p>
        </div>
      </section>

      {/* featured journeys — 10-second "where do I start?" */}
      {featuredJourneys && featuredJourneys.length > 0 && (
        <Section
          id="journeys"
          icon="layers"
          title={t("home.featured.title")}
          subtitle={t("home.featured.subtitle")}
        >
          <JourneysGrid journeys={featuredJourneys} />
          <div className="mt-4 text-center">
            <Link href="/journeys" className="btn-ghost !px-4 !py-1.5 text-xs">
              {t("home.featured.viewAll")}
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Section>
      )}

      {/* global timeline */}
      <Section
        id="timeline"
        icon="calendar"
        title={t("sec.timeline.title")}
        subtitle={t("sec.timeline.subtitle")}
      >
        <div className="panel p-4 sm:p-5">
          <Timeline />
        </div>
      </Section>

      {/* china vs world */}
      <Section
        id="comparison"
        icon="scale"
        title={t("sec.comparison.title")}
        subtitle={t("sec.comparison.subtitle")}
      >
        <ComparisonPanel />
        <div className="mt-3 text-right">
          <Link
            href="/world?year=751"
            className="inline-flex items-center gap-1 text-xs font-semibold text-vermilion-dark hover:underline"
          >
            {t("home.worldYearLink")}
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Section>

      {/* featured events */}
      <Section
        id="events"
        icon="book"
        title={t("sec.events.title")}
        subtitle={t("sec.events.subtitle")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.featuredEvents.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="block transition hover:-translate-y-0.5"
              aria-label={`${t("common.open")}: ${e.title}`}
            >
              <EventCard event={e} className="text-sm" />
            </Link>
          ))}
        </div>
      </Section>

      {/* explore */}
      <Section icon="layers" title={t("sec.explore.title")} subtitle={t("sec.explore.subtitle")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/map",
              icon: "map" as const,
              title: t("page.map.title"),
              desc: t("home.explore.map.desc"),
            },
            {
              href: "/people",
              icon: "users" as const,
              title: t("page.people.title"),
              desc: t("home.explore.people.desc"),
            },
            {
              href: "/chat",
              icon: "bot" as const,
              title: t("page.chat.title"),
              desc: t("home.explore.chat.desc"),
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group panel flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-pop"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-vermilion/10 text-vermilion transition group-hover:bg-vermilion group-hover:text-white">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-bold text-ink">{c.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-ink-soft">{c.desc}</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-vermilion-dark">
                {t("common.open")}{" "}
                <Icon name="arrow-right" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
