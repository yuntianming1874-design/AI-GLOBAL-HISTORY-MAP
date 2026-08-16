"use client";

import { useMemo } from "react";
import type { Journey, JourneyStep } from "@/lib/learning/journeyTypes";
import { narrateStep } from "@/lib/learning/narrator";
import { entityDisplayLabel, entityTypeLabel } from "@/lib/learning/entityLabels";
import { formatYearSpan } from "@/lib/provenance";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";

/**
 * V0.3 Phase 2 — Historical Story Panel (Narrative Story Engine).
 *
 * Continuous, readable editorial narrative — NOT fragmented cards:
 *
 *   [Step 标题] [Step 序号]
 *   [核心历史问题]          ← question
 *   [历史叙述]             ← narrative
 *   [为什么重要]           ← whyImportant (data-driven)
 *   [关键事实]             ← narrator keyFacts (repository-backed)
 *   [为什么接下来会发生什么] ← nextStepReason
 *   [相关人物 / 文明 / 地点] ← grouped entity chips
 *   [← Previous | Continue →]
 *
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

  /* grouped related entities — explicit grouped ids win, otherwise derived
   * from surroundingEntities by type (single data source). */
  const groups = useMemo(() => {
    const byType = new Map<string, { id: string; type: "event" | "person" | "civilization" | "location" | "territory" }[]>();
    for (const ref of step.surroundingEntities) {
      const list = byType.get(ref.type) ?? [];
      list.push({ id: ref.id, type: ref.type });
      byType.set(ref.type, list);
    }
    const pick = (
      type: "event" | "person" | "civilization" | "location" | "territory",
      explicit: string[] | undefined,
    ) => {
      const ids = explicit && explicit.length > 0 ? explicit : (byType.get(type) ?? []).map((x) => x.id);
      return ids.map((id) => ({ id, type }));
    };
    return {
      people: pick("person", step.people),
      civilizations: pick("civilization", step.civilizations),
      locations: pick("location", step.locations),
      events: byType.get("event") ?? [],
    };
  }, [step]);

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

  const renderChips = (list: { id: string; type: "event" | "person" | "civilization" | "location" | "territory" }[]) =>
    list.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {list.map((ref) => (
          <button
            key={`${ref.type}:${ref.id}`}
            onClick={() => chipAction(ref.type, ref.id)}
            className="chip transition hover:border-gold hover:shadow-sm"
            aria-label={t("journey.openEntity", {
              id: entityDisplayLabel(ref, locale),
            })}
            title={ref.id}
          >
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              {entityTypeLabel(ref.type, locale)}
            </span>
            {entityDisplayLabel(ref, locale)}
          </button>
        ))}
      </div>
    ) : (
      <p className="text-[12px] italic text-ink-faint">{t("journey.noRelated")}</p>
    );

  return (
    <article className="panel flex flex-col gap-5 p-5 sm:p-6">
      {/* step header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
          {zh ? journey.title : journey.titleEn}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <h2 className="font-display text-xl font-bold leading-snug text-ink">
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

      {/* core historical question */}
      <p className="rounded-lg border-l-4 border-gold bg-gold/5 px-4 py-3 font-display text-base font-semibold leading-relaxed text-ink">
        {zh ? step.question : step.questionEn}
      </p>

      {/* narrative — continuous prose */}
      <div className="space-y-3 text-sm leading-relaxed text-ink-soft">
        <p>{zh ? step.narrative : step.narrativeEn}</p>
      </div>

      {/* why it matters (data-driven) */}
      <section className="rounded-lg border border-parchment-200 bg-parchment-100/60 p-4">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-vermilion-dark">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
          {t("journey.whyItMatters")}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {zh ? step.whyImportant : step.whyImportantEn}
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

      {/* why next happens (causal bridge) */}
      <section className="rounded-lg border border-parchment-200 bg-parchment-50/70 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          {t("journey.nextStepReason")}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {zh ? step.nextStepReason : step.nextStepReasonEn}
        </p>
      </section>

      {/* grouped related entities */}
      <section className="space-y-3">
        {groups.people.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {t("journey.relatedPeople")}
            </h3>
            <div className="mt-1.5">{renderChips(groups.people)}</div>
          </div>
        )}
        {groups.civilizations.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {t("journey.relatedCivilizations")}
            </h3>
            <div className="mt-1.5">{renderChips(groups.civilizations)}</div>
          </div>
        )}
        {groups.locations.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {t("journey.relatedLocations")}
            </h3>
            <div className="mt-1.5">{renderChips(groups.locations)}</div>
          </div>
        )}
        {groups.events.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {t("journey.relatedEvents")}
            </h3>
            <div className="mt-1.5">{renderChips(groups.events)}</div>
          </div>
        )}
      </section>

      {/* prev / next */}
      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-parchment-200 pt-4">
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
          className="btn-primary !px-4 !py-1.5 text-xs"
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
