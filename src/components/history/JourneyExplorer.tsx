"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";
import { getJourneyBySlug, getJourneyStep } from "@/lib/learning/journeyRepository";
import { StoryPanel } from "./StoryPanel";
import { Timeline } from "./Timeline";
import { HistoryMap } from "./HistoryMap";
import { PersonLifespanTimeline } from "./PersonLifespanTimeline";
import { ContemporaryWorldPanel } from "./ContemporaryWorldPanel";

/**
 * V0.3 — Journey Explorer.
 *
 * Reads journeyId / journeyStep from the URL (single source of truth),
 * resolves the journey definition, and drives Timeline / Map / Story
 * through the SAME ExplorerProvider navigation mechanism. It never keeps
 * its own history state — every transition is one URL update.
 */
export function JourneyExplorer({ className = "" }: { className?: string }) {
  const { context, dispatch } = useExplorer();
  const router = useRouter();
  const { t } = useLocale();

  const journey = useMemo(
    () => (context.journeyId ? getJourneyBySlug(context.journeyId) : null),
    [context.journeyId],
  );

  const step = useMemo(
    () =>
      journey && context.journeyStep !== null
        ? getJourneyStep(journey, context.journeyStep)
        : null,
    [journey, context.journeyStep],
  );

  if (!journey || !step) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-sm text-ink-faint">{t("journey.notFound")}</p>
        <a href="/" className="btn-ghost mt-3 !px-4 !py-1.5 text-xs">
          {t("journey.backToAtlas")}
        </a>
      </div>
    );
  }

  const goTo = (target: number) => {
    if (target < 1) return;
    // last step → Journey Complete page (Phase 3B)
    if (target > journey.steps.length) {
      router.push(`/journeys/${journey.slug}/complete`);
      return;
    }
    // single URL transition — full step context in one dispatch
    dispatch({ type: "SET_JOURNEY_STEP", journeyId: journey.id, step: target });
  };

  const exit = () => {
    dispatch({
      type: "SET_JOURNEY_STEP",
      journeyId: journey.id,
      step: 1,
    });
  };

  const progress = `${step.order} / ${journey.steps.length}`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* journey header */}
      <section className="panel relative overflow-hidden p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
              {t("journey.badge")}
            </p>
            <h1 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
              {journey.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{journey.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-xs font-semibold text-gold-dark">
              {t("journey.progress", { p: progress })}
            </span>
            <button
              onClick={exit}
              className="text-[11px] text-ink-faint underline-offset-2 hover:underline"
            >
              {t("journey.exit")}
            </button>
          </div>
        </div>

        {/* step dots */}
        <nav className="mt-4 flex flex-wrap items-center gap-1.5" aria-label={t("journey.stepsAria")}>
          {journey.steps.map((s) => (
            <button
              key={s.id}
              onClick={() => goTo(s.order)}
              aria-label={`${s.title} (${s.order}/${journey.steps.length})`}
              aria-current={s.order === step.order ? "step" : undefined}
              className={`h-2.5 w-8 rounded-full transition ${
                s.order === step.order
                  ? "bg-vermilion"
                  : s.order < step.order
                    ? "bg-gold/60"
                    : "bg-parchment-300"
              }`}
              title={s.title}
            />
          ))}
        </nav>
      </section>

      {/* story + timeline */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <StoryPanel
          journey={journey}
          step={step}
          onNavigate={goTo}
        />
        <Timeline className="min-w-0" />
      </div>

      {/* map */}
      <HistoryMap className="min-w-0" />

      {/* people alive at this step's year (lifespan + roles + events) */}
      <PersonLifespanTimeline
        year={step.year ?? null}
        personId={step.personId ?? undefined}
      />

      {/* contemporary world (data-driven, current step year) */}
      <ContemporaryWorldPanel year={step.year ?? null} />
    </div>
  );
}
