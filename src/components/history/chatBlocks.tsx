"use client";

import type { HistoryEntityLink, HistoryNavigationAction } from "@/lib/explorer";
import type { NavigatorRecommendation } from "@/lib/learning/navigatorTypes";
import { getJourneyById } from "@/lib/learning/journeyRepository";
import { Icon, type IconName } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";

/** Renders **bold** segments and • bullets from plain assistant text. */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const inline = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          ),
        );
        if (line.trimStart().startsWith("•")) {
          return (
            <p key={i} className="flex gap-1.5 text-sm leading-relaxed text-ink-soft">
              <span className="mt-0.5 text-gold-dark">•</span>
              <span>{inline}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-ink-soft">
            {inline}
          </p>
        );
      })}
    </div>
  );
}

const LINK_ICON: Record<HistoryEntityLink["type"], IconName> = {
  event: "calendar",
  person: "users",
  civilization: "globe",
  location: "map",
  territory: "layers",
};

/** Clickable history-entity chips returned by the assistant (V0.2). */
export function EntityLinks({ links }: { links: HistoryEntityLink[] }) {
  const { dispatch } = useExplorer();
  const { t } = useLocale();
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-ink-faint">{t("chat.entities")}</span>
      {links.map((link) => (
        <button
          key={`${link.type}:${link.id}`}
          onClick={() => {
            switch (link.type) {
              case "event":
                dispatch({ type: "OPEN_EVENT", id: link.id });
                break;
              case "person":
                dispatch({ type: "OPEN_PERSON", id: link.id });
                break;
              case "location":
                dispatch({ type: "OPEN_LOCATION", id: link.id });
                break;
              case "civilization":
                dispatch({ type: "FOCUS_CIVILIZATION", id: link.id });
                break;
              case "territory":
                break;
            }
          }}
          className="chip !border-gold/40 !bg-gold/10 !text-gold-dark transition hover:!border-gold"
          title={`Open ${link.type}: ${link.id}`}
        >
          <Icon name={LINK_ICON[link.type]} className="h-3 w-3" />
          {link.label ?? link.id}
        </button>
      ))}
    </div>
  );
}

/** Suggested navigation action buttons returned by the assistant (V0.2). */
export function ActionButtons({ actions }: { actions: HistoryNavigationAction[] }) {
  const { dispatch } = useExplorer();
  const { t } = useLocale();
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-ink-faint">{t("chat.actions")}</span>
      {actions.map((action, i) => (
        <button
          key={`${action.type}:${i}`}
          onClick={() => dispatch(action)}
          className="flex items-center gap-1 rounded-full border border-vermilion/40 bg-vermilion/10 px-2.5 py-1 text-xs font-semibold text-vermilion-dark transition hover:bg-vermilion hover:text-white"
        >
          <Icon
            name={
              action.type === "OPEN_LOCATION" || action.type === "FOCUS_MAP"
                ? "map"
                : action.type === "FOCUS_TIMELINE" || action.type === "SET_YEAR"
                  ? "clock"
                  : action.type === "FOCUS_PERSON_GRAPH"
                    ? "users"
                    : "arrow-right"
            }
            className="h-3 w-3"
          />
          {action.type === "OPEN_EVENT"
            ? t("act.openEvent")
            : action.type === "OPEN_PERSON"
              ? t("act.openPerson")
              : action.type === "OPEN_LOCATION"
                ? t("act.viewMap")
                : action.type === "FOCUS_TIMELINE"
                  ? t("act.focusTimeline")
                  : action.type === "FOCUS_MAP"
                    ? t("act.viewMap")
                    : action.type === "FOCUS_PERSON_GRAPH"
                      ? t("act.personGraph")
                      : action.type === "SET_YEAR"
                        ? t("act.exploreYear", { year: action.year })
                        : action.type === "START_JOURNEY"
                          ? t("journey.start")
                          : action.type === "SET_JOURNEY_STEP"
                            ? t("journey.stepN", { n: action.step })
                            : t("act.focusCiv")}
        </button>
      ))}
    </div>
  );
}

/* ── V0.3 Phase 3D: Navigator recommendations ──────────────────────── */

const REC_TYPES = new Set(["deepen", "cause", "compare", "continue"]);
const REF_TYPES = new Set(["event", "person", "civilization", "location", "territory"]);

/** fail-closed: drop malformed recommendations instead of crashing. */
function isValidRecommendation(r: NavigatorRecommendation | null | undefined): r is NavigatorRecommendation {
  if (!r || typeof r !== "object") return false;
  if (typeof r.id !== "string" || r.id.length === 0) return false;
  if (typeof r.titleZh !== "string" || r.titleZh.length === 0) return false;
  if (typeof r.titleEn !== "string" || r.titleEn.length === 0) return false;
  if (typeof r.reasonZh !== "string" || typeof r.reasonEn !== "string") return false;
  if (!REC_TYPES.has(r.type)) return false;
  if (!Array.isArray(r.entityRefs) || !Array.isArray(r.actions)) return false;
  for (const ref of r.entityRefs) {
    if (!ref || typeof ref.id !== "string" || !REF_TYPES.has(ref.type)) return false;
  }
  return true;
}

/** V0.3 — next-step exploration cards, rendered AFTER the AI answer.
 *  Entity chips + action buttons reuse EntityLinks / ActionButtons —
 *  navigation always goes through dispatchHistoryAction. */
export function RecommendationsBlock({
  recommendations,
}: {
  recommendations: NavigatorRecommendation[] | null | undefined;
}) {
  const { locale, t } = useLocale();
  if (!recommendations || recommendations.length === 0) return null;
  const valid = recommendations.filter(isValidRecommendation);
  if (valid.length === 0) return null;
  const zh = locale === "zh";

  const badgeFor = (type: NavigatorRecommendation["type"]) =>
    type === "deepen"
      ? t("chat.rec.deepen")
      : type === "cause"
        ? t("chat.rec.cause")
        : type === "compare"
          ? t("chat.rec.compare")
          : t("chat.rec.continue");

  return (
    <div className="mt-4 border-t border-parchment-200 pt-3" aria-label={t("chat.recommendations")}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-dark">
        <Icon name="sparkles" className="h-3.5 w-3.5" />
        {t("chat.recommendations")}
      </p>
      <div className="mt-2.5 space-y-2.5">
        {valid.map((r) => {
          const journey = r.journeyId ? getJourneyById(r.journeyId) : null;
          return (
            <article
              key={r.id}
              className="rounded-lg border border-parchment-200 bg-parchment-50/70 p-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                  {badgeFor(r.type)}
                </span>
                {journey && (
                  <span className="rounded-full bg-vermilion/10 px-2 py-0.5 text-[10px] font-semibold text-vermilion-dark">
                    {t("chat.rec.journey")}
                  </span>
                )}
              </div>
              <h4 className="mt-1.5 font-display text-sm font-bold leading-snug text-ink">
                {zh ? r.titleZh : r.titleEn}
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                {zh ? r.reasonZh : r.reasonEn}
              </p>
              {journey && (
                <p className="mt-1 text-[11px] font-medium text-ink-faint">
                  {t("chat.rec.journeyTitle", { title: zh ? journey.title : journey.titleEn })}
                </p>
              )}
              <div className="mt-2.5 space-y-2">
                <EntityLinks
                  links={r.entityRefs.map((ref) => ({
                    id: ref.id,
                    type: ref.type,
                  }))}
                />
                <ActionButtons actions={r.actions} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
