"use client";

import { useMemo } from "react";
import type { Journey, JourneyStep } from "@/lib/learning/journeyTypes";
import { narrateStep } from "@/lib/learning/narrator";
import { formatYearSpan } from "@/lib/provenance";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";

/**
 * V0.3 — Historical Story Panel.
 *
 * Editorial magazine/exhibit style (NOT a chat window):
 * journey title · step index · step title · time · narrative ·
 * why-it-matters (narrator) · related entity chips · prev/next.
 * Facts come from the seed repository via narrateStep — no fabrication.
 */
export function StoryPanel({
  journey,
  step,
  onNavigate,
}: {
  journey: Journey;
  step: JourneyStep;
  /** Called with the target step number (already clamped by caller). */
  onNavigate: (stepNumber: number) => void;
}) {
  const { locale, t } = useLocale();
  const { dispatch } = useExplorer();
  const zh = locale === "zh";

  const narration = useMemo(
    () => narrateStep(journey, step, locale),
    [journey, step, locale],
  );

  const timeLabel = useMemo(() => {
    if (step.startYear !== undefined && step.endYear !== undefined) {
      return formatYearSpan(step.startYear, step.endYear, undefined, locale);
    }
    if (step.year !== undefined) {
      return zh ? `${step.year} 年` : `${step.year} CE`;
    }
    return zh ? "年代不限" : "Across time";
  }, [step, locale, zh]);

  const chipAction = (type: string, id: string) => {
    switch (type) {
      case "event":
        dispatch({ type: "OPEN_EVENT", id });
        break;
      case "person":
        dispatch({ type: "OPEN_PERSON", id });
        break;
      case "civilization":
        dispatch({ type: "FOCUS_CIVILIZATION", id });
        break;
      case "location":
        dispatch({ type: "OPEN_LOCATION", id });
        break;
    }
  };

  return (
    <article className="panel flex flex-col gap-4 p-5">
      {/* journey + step header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
          {zh ? journey.title : journey.titleEn}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold leading-snug text-ink">
            {zh ? step.title : step.titleEn}
          </h2>
          <span className="ml-auto shrink-0 font-mono text-xs text-ink-faint">
            {t("journey.stepOf", {
              step: step.order,
              total: journey.steps.length,
            })}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-ink-faint">{timeLabel}</p>
      </header>

      {/* narrative */}
      <div className="space-y-3 text-sm leading-relaxed text-ink-soft">
        <p>{zh ? step.narrative : step.narrativeEn}</p>
      </div>

      {/* why it matters (narrator importance) */}
      <section className="rounded-lg border border-parchment-200 bg-parchment-100/60 p-3.5">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-vermilion-dark">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
          {t("journey.whyItMatters")}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {narration.importance}
        </p>
        {narration.uncertaintyNotes && narration.uncertaintyNotes.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-parchment-200 pt-2">
            {narration.uncertaintyNotes.map((n, i) => (
              <p key={i} className="text-[12px] italic text-ink-faint">
                {n}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* key facts (from repository only) */}
      {narration.keyFacts.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            {t("journey.keyFacts")}
          </h3>
          <ul className="mt-1.5 space-y-1">
            {narration.keyFacts.map((f) => (
              <li
                key={`${f.entityType}:${f.entityId}`}
                className="flex items-baseline gap-2 text-[13px] text-ink-soft"
              >
                <span className="font-semibold text-ink">{f.label}</span>
                {f.dateDisplay && (
                  <span className="font-mono text-xs text-ink-faint">
                    {f.dateDisplay}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* related entities */}
      {narration.relatedEntities.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            {t("journey.relatedEntities")}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {narration.relatedEntities.map((ref) => (
              <button
                key={`${ref.type}:${ref.id}`}
                onClick={() => chipAction(ref.type, ref.id)}
                className="chip transition hover:border-gold hover:shadow-sm"
                aria-label={t("journey.openEntity", { id: ref.id })}
              >
                {ref.id}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* prev / next */}
      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-parchment-200 pt-3">
        <button
          onClick={() => step.order > 1 && onNavigate(step.order - 1)}
          disabled={step.order <= 1}
          className="btn-ghost !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />
          {t("journey.previous")}
        </button>
        <button
          onClick={() => onNavigate(step.order + 1)}
          disabled={step.order >= journey.steps.length}
          className="btn-primary !px-4 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step.order >= journey.steps.length
            ? t("journey.complete")
            : t("journey.continue")}
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </button>
      </footer>
    </article>
  );
}
