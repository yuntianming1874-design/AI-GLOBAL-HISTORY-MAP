import type { Metadata } from "next";
import Link from "next/link";
import { getJourneys } from "@/lib/learning/journeyRepository";
import { PageHeader } from "@/components/history/PageHeader";
import { Icon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning Journeys — AI Global History Map",
  description:
    "Guided historical explorations connecting timeline, map, events, people and AI narration.",
};

export default function JourneysPage() {
  const journeys = getJourneys();
  return (
    <div className="space-y-6">
      <PageHeader
        icon="layers"
        titleKey="journey.listTitle"
        subtitleKey="journey.listSubtitle"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journeys.map((j) => (
          <Link
            key={j.id}
            href={`/journeys/${j.slug}`}
            className="group panel flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-pop"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
              {j.startYear}–{j.endYear} · {j.steps.length} steps
            </p>
            <h2 className="font-display text-lg font-bold leading-snug text-ink">
              {j.title}
            </h2>
            <p className="flex-1 text-sm leading-relaxed text-ink-soft">{j.description}</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-vermilion-dark">
              <Icon name="arrow-right" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
