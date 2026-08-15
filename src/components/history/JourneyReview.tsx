"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Journey } from "@/lib/learning/journeyTypes";
import {
  evaluateRecallAnswer,
  getRecallQuestions,
} from "@/lib/learning/review";
import type { RecallAnswerResult } from "@/lib/learning/reviewTypes";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";

/**
 * V0.3 Phase 3A — Journey Review / Recall.
 *
 * Retrieval-practice, NOT an exam: grading is correct / partial /
 * needs_review with constructive feedback and review shortcuts
 * (timeline / map / people). The current question index lives in the URL
 * (?review=N) so refresh, back and forward keep the review position.
 */
export function JourneyReview({ journey }: { journey: Journey }) {
  const { locale, t } = useLocale();
  const { dispatch } = useExplorer();
  const router = useRouter();
  const searchParams = useSearchParams();

  const questions = useMemo(() => getRecallQuestions(journey.id), [journey.id]);

  // URL is the source of truth for the current question (1-based);
  // "done" is a terminal state (survives refresh/back/forward)
  const rawReview = searchParams?.get("review") ?? "1";
  const isDone = rawReview === "done";
  const rawIndex = Number.parseInt(rawReview, 10);
  const currentIndex = Number.isFinite(rawIndex) && rawIndex >= 1 ? rawIndex : 1;

  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<Record<string, RecallAnswerResult>>({});
  const [justSubmitted, setJustSubmitted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const question = questions[currentIndex - 1] ?? null;
  const done = questions.length > 0 && (isDone || currentIndex > questions.length);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && justSubmitted) {
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, justSubmitted]);

  const goTo = (index: number) => {
    setAnswer("");
    setJustSubmitted(false);
    router.replace(
      index > questions.length
        ? `/journeys/${journey.slug}/review?review=done`
        : `/journeys/${journey.slug}/review?review=${index}`,
    );
  };
  const goNext = () => goTo(currentIndex + 1);

  const submit = () => {
    if (!question || answer.trim().length === 0) return;
    const result = evaluateRecallAnswer(question, answer, locale);
    setResults((r) => ({ ...r, [question.id]: result }));
    setJustSubmitted(true);
  };

  /* review shortcuts from the question's source steps */
  const reviewActions = useMemo(() => {
    const firstStep = question
      ? journey.steps.find((s) => s.id === question.sourceStepIds[0])
      : null;
    const personStep = question
      ? journey.steps.find((s) => s.id === question.sourceStepIds[0])
      : null;
    const personRef = personStep?.surroundingEntities.find((r) => r.type === "person");
    return {
      year: firstStep?.year ?? journey.startYear,
      eventId: firstStep?.eventId ?? undefined,
      locationId: firstStep?.locationId ?? undefined,
      personId: personStep?.personId ?? personRef?.id ?? undefined,
    };
  }, [question, journey]);

  if (questions.length === 0) {
    return (
      <div className="panel p-6 text-center text-sm text-ink-faint">
        {t("review.noQuestions")}
      </div>
    );
  }

  /* ── done state ── */
  if (done) {
    const graded = questions.map((q) => results[q.id]).filter(Boolean);
    const correctCount = graded.filter((r) => r.grade === "correct").length;
    const partialCount = graded.filter((r) => r.grade === "partial").length;
    return (
      <div className="panel mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
            {t("review.badge")}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {t("review.doneTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {t("review.doneSummary", {
              total: questions.length,
              correct: correctCount,
              partial: partialCount,
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button onClick={() => goTo(1)} className="btn-primary !px-4 !py-2 text-sm">
            <Icon name="arrow-right" className="h-4 w-4" />
            {t("review.redo")}
          </button>
          <button
            onClick={() => dispatch({ type: "START_JOURNEY", journeyId: journey.id })}
            className="btn-ghost !px-4 !py-2 text-sm"
          >
            <Icon name="layers" className="h-4 w-4" />
            {t("review.reExplore")}
          </button>
          <a href="/" className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="map" className="h-4 w-4" />
            {t("review.backToAtlas")}
          </a>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="panel p-6 text-center text-sm text-ink-faint">
        {t("review.notFound")}
      </div>
    );
  }

  const result = results[question.id];
  const typeLabel =
    question.type === "fact"
      ? t("review.type.fact")
      : question.type === "relationship"
        ? t("review.type.relationship")
        : t("review.type.causal");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* progress */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-ink-faint">
          {t("review.progress", {
            n: currentIndex,
            total: questions.length,
          })}
        </span>
        <div className="flex flex-1 gap-1.5">
          {questions.map((q, i) => {
            const r = results[q.id];
            return (
              <span
                key={q.id}
                className={`h-1.5 flex-1 rounded-full ${
                  i + 1 === currentIndex
                    ? "bg-vermilion"
                    : r?.grade === "correct"
                      ? "bg-jade"
                      : r?.grade === "partial"
                        ? "bg-gold"
                        : r
                          ? "bg-parchment-400"
                          : "bg-parchment-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* question card */}
      <section className="panel p-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-vermilion/10 px-2.5 py-0.5 text-[11px] font-semibold text-vermilion-dark">
            {typeLabel}
          </span>
          <span className="ml-auto font-mono text-[11px] text-ink-faint">
            {question.id}
          </span>
        </div>
        <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink">
          {locale === "zh" ? question.question : question.questionEn}
        </h2>

        <textarea
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={3}
          placeholder={t("review.placeholder")}
          aria-label={locale === "zh" ? question.question : question.questionEn}
          className="mt-4 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={submit}
            disabled={answer.trim().length === 0 || justSubmitted}
            className="btn-primary !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
            {t("review.submit")}
          </button>
          <span className="text-[11px] text-ink-faint">{t("review.submitHint")}</span>
        </div>
      </section>

      {/* feedback */}
      {justSubmitted && result && (
        <section
          className={`panel border-l-4 p-5 ${
            result.grade === "correct"
              ? "!border-l-jade"
              : result.grade === "partial"
                ? "!border-l-gold"
                : "!border-l-vermilion"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${
                result.grade === "correct"
                  ? "bg-jade"
                  : result.grade === "partial"
                    ? "bg-gold"
                    : "bg-vermilion"
              }`}
            >
              {result.grade === "correct"
                ? t("review.grade.correct")
                : result.grade === "partial"
                  ? t("review.grade.partial")
                  : t("review.grade.needsReview")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{result.feedback}</p>

          {/* review shortcuts */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-parchment-200 pt-3">
            <button
              onClick={() =>
                dispatch({
                  type: "FOCUS_TIMELINE",
                  year: reviewActions.year,
                  startYear: journey.startYear,
                  endYear: journey.endYear,
                  entityId: reviewActions.eventId,
                  entityType: reviewActions.eventId ? "event" : undefined,
                })
              }
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              <Icon name="clock" className="h-3.5 w-3.5" />
              {t("review.seeTimeline")}
            </button>
            <button
              onClick={() =>
                reviewActions.locationId
                  ? dispatch({
                      type: "FOCUS_MAP",
                      locationId: reviewActions.locationId,
                      eventId: reviewActions.eventId,
                      year: reviewActions.year,
                    })
                  : dispatch({
                      type: "FOCUS_TIMELINE",
                      year: reviewActions.year,
                      startYear: journey.startYear,
                      endYear: journey.endYear,
                      entityId: reviewActions.eventId,
                      entityType: reviewActions.eventId ? "event" : undefined,
                    })
              }
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              <Icon name="map" className="h-3.5 w-3.5" />
              {t("review.seeMap")}
            </button>
            {reviewActions.personId && (
              <button
                onClick={() => dispatch({ type: "OPEN_PERSON", id: reviewActions.personId! })}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                <Icon name="users" className="h-3.5 w-3.5" />
                {t("review.seePeople")}
              </button>
            )}
          </div>

          <div className="mt-4 flex justify-end border-t border-parchment-200 pt-3">
            <button onClick={goNext} className="btn-primary !px-4 !py-1.5 text-xs">
              {currentIndex >= questions.length
                ? t("review.finish")
                : t("review.nextQuestion")}
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
