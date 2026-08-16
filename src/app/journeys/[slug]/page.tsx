import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getJourneyBySlug } from "@/lib/learning/journeyRepository";
import { PageHeader } from "@/components/history/PageHeader";
import { JourneyStartButton } from "./JourneyStartButton";
import { JourneyReviewButton } from "./JourneyReviewButton";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams: { lang?: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) return { title: "Journey not found" };
  return {
    title: `${journey.title} — AI Global History Map`,
    description: journey.description.slice(0, 160),
    openGraph: {
      title: journey.title,
      description: journey.description.slice(0, 200),
    },
    alternates: { canonical: `/journeys/${journey.slug}` },
  };
}

export default function JourneyDetailPage({ params, searchParams }: Props) {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) notFound();
  const locale = searchParams.lang === "zh" ? "zh" : "en";

  return (
    <div className="space-y-6">
      <PageHeader
        icon="layers"
        titleKey="journey.listTitle"
        subtitleKey="journey.listSubtitle"
      />

      <section className="panel relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
              {journey.startYear}–{journey.endYear} · {t(locale, "journey.stepsCount", { n: journey.steps.length })} ·{" "}
              {t(locale, "journey.minutes", { m: journey.estimatedMinutes })} ·{" "}
              {t(locale, `journey.difficulty.${journey.difficulty}` as never)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
              {journey.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{journey.description}</p>
          </div>
          <div className="flex flex-col items-stretch gap-2">
            <JourneyStartButton journeyId={journey.id} />
            <JourneyReviewButton slug={journey.slug} />
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-base font-bold text-ink">{t(locale, "journey.steps")}</h2>
        <ol className="mt-4 space-y-3">
          {journey.steps.map((s) => (
            <li key={s.id} className="flex gap-3 rounded-lg border border-parchment-200 bg-parchment-50/70 p-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vermilion font-mono text-xs font-bold text-white">
                {s.order}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-ink">{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  {s.startYear !== undefined && s.endYear !== undefined
                    ? `${s.startYear}–${s.endYear}`
                    : s.year !== undefined
                      ? `${s.year} CE`
                      : "—"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
