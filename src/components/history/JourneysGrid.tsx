"use client";

import Link from "next/link";
import type { Journey } from "@/lib/learning/journeyTypes";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";

/**
 * V0.3 — Journeys grid (client component: labels follow the locale).
 * Each card offers two entries: 进入旅程 (detail) and 开始复习 (recall),
 * so students/history enthusiasts can review without re-entering.
 */
export function JourneysGrid({ journeys }: { journeys: Journey[] }) {
  const { t } = useLocale();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {journeys.map((j) => (
        <div
          key={j.id}
          className="group panel flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-pop"
        >
          <Link href={`/journeys/${j.slug}`} className="block">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
              {j.startYear}–{j.endYear} · {t("journey.stepsCount", { n: j.steps.length })}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold leading-snug text-ink group-hover:text-vermilion-dark">
              {j.title}
            </h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-soft">{j.description}</p>
          </Link>
          <div className="mt-auto flex flex-wrap gap-2 border-t border-parchment-200 pt-3">
            <Link href={`/journeys/${j.slug}`} className="btn-primary !px-3 !py-1.5 text-xs">
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
              {t("journey.enter")}
            </Link>
            <Link
              href={`/journeys/${j.slug}/review`}
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              <Icon name="book" className="h-3.5 w-3.5" />
              {t("journey.reviewNow")}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
