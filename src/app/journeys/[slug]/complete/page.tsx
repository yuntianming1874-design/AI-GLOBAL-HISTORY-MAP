import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getJourneyBySlug } from "@/lib/learning/journeyRepository";
import { buildJourneyCompleteStats } from "@/lib/learning/complete";
import { startJourneyPatch } from "@/lib/learning/journeyEngine";
import { hrefWithContext } from "@/lib/explorer";
import { PageHeader } from "@/components/history/PageHeader";
import { Icon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams: { lang?: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) return { title: "Journey not found" };
  return {
    title: `${journey.title} · Complete — AI Global History Map`,
    description: `You completed “${journey.title}”. Review what you learned.`,
    alternates: { canonical: `/journeys/${journey.slug}/complete` },
  };
}

export default function JourneyCompletePage({ params, searchParams }: Props) {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) notFound();
  const locale = searchParams.lang === "zh" ? "zh" : "en";
  const zh = locale === "zh";

  // ALL stats come from the journey definition + seed (no invented facts)
  const stats = buildJourneyCompleteStats(journey);

  // re-explore = same single URL transition as START_JOURNEY
  const reExploreHref = (() => {
    const p = startJourneyPatch(journey);
    return p ? hrefWithContext("/", new URLSearchParams(), p) : "/";
  })();

  const statCards = [
    { label: "complete.statSteps", value: stats.stepsCompleted },
    { label: "complete.statEvents", value: stats.eventsExplored.length },
    { label: "complete.statPeople", value: stats.peopleExplored.length },
    { label: "complete.statCivs", value: stats.civilizationsExplored.length },
    { label: "complete.statLocations", value: stats.locationsExplored.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon="layers"
        titleKey="complete.pageTitle"
        subtitleKey="complete.pageSubtitle"
      />

      <section className="panel relative overflow-hidden p-6 text-center sm:p-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
            {t(locale, "complete.badge")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            {t(locale, "complete.title")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {t(locale, "complete.subtitle", { title: journey.title })}
          </p>

          {/* learning statistics (from journey steps) */}
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-parchment-200 bg-parchment-50/80 px-2 py-3"
              >
                <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">
                  {t(locale, s.label as never)}
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold text-ink">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* core memories (auto-extracted from journey steps) */}
      <section className="panel p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <Icon name="sparkles" className="h-4 w-4 text-gold-dark" />
          {t(locale, "complete.memories")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stats.coreMemories.map((m, i) => (
            <span key={i} className="chip !border-gold/40 !bg-gold/10 !text-gold-dark">
              {zh ? m.labelZh : m.labelEn}
              <span className="ml-1 font-mono text-[10px] text-ink-faint">
                {zh ? m.labelEn : m.labelZh}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* next steps */}
      <section className="panel p-6">
        <h2 className="font-display text-base font-bold text-ink">
          {t(locale, "complete.nextTitle")}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href={reExploreHref} className="btn-primary !px-4 !py-2 text-sm">
            <Icon name="arrow-right" className="h-4 w-4" />
            {t(locale, "complete.reExplore")}
          </Link>
          <Link href="/" className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="map" className="h-4 w-4" />
            {t(locale, "complete.backToAtlas")}
          </Link>
          <Link href="/journeys" className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="layers" className="h-4 w-4" />
            {t(locale, "complete.moreJourneys")}
          </Link>
          <Link href={`/journeys/${journey.slug}/review`} className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="book" className="h-4 w-4" />
            {t(locale, "complete.recall")}
          </Link>
          <Link href={`/chat?journey=${encodeURIComponent(journey.id)}`} className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="bot" className="h-4 w-4" />
            {t(locale, "complete.askAI")}
          </Link>
        </div>
      </section>
    </div>
  );
}
