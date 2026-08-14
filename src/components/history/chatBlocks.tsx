"use client";

import type { HistoryEntityLink, HistoryNavigationAction } from "@/lib/explorer";
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
                        : t("act.focusCiv")}
        </button>
      ))}
    </div>
  );
}
