"use client";

import type { EventDTO } from "@/lib/types";
import { CATEGORY_META } from "@/lib/theme";
import { formatYearSpan } from "@/lib/provenance";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";

/**
 * Presentational event card — renders year, category, significance,
 * description, civilization, location and participant chips.
 */
export function EventCard({
  event,
  onSelect,
  className = "",
}: {
  event: EventDTO;
  onSelect?: (event: EventDTO) => void;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);
  const category = CATEGORY_META[event.category];
  return (
    <article
      className={
        "group flex h-full flex-col gap-2 rounded-xl border border-parchment-300 bg-parchment-50 p-4 shadow-card transition " +
        (onSelect
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-gold hover:shadow-pop "
          : "") +
        className
      }
      onClick={onSelect ? () => onSelect(event) : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(event);
              }
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Open event: ${event.title}` : undefined}
    >
      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-vermilion px-2 py-0.5 font-mono text-xs font-bold text-white">
          {formatYearSpan(event.year, event.yearEnd, event.dateProvenance, locale)}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: category.color }}
        >
          {category.label}
        </span>
        <span
          className="ml-auto flex items-center gap-0.5 text-gold-dark"
          aria-label={t("ec.significance", { n: event.significance })}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Icon
              key={i}
              name="star"
              className="h-3.5 w-3.5"
              fill={i < event.significance ? "currentColor" : "none"}
            />
          ))}
        </span>
      </header>

      <div>
        <h3 className="font-display text-base font-bold leading-snug text-ink">
          {zh(event.title, event.chineseTitle)}
          <span className="ml-2 font-sans text-sm font-normal text-ink-faint">
            {locale === "zh" ? event.title : event.chineseTitle}
          </span>
        </h3>
      </div>

      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {zh(event.description, event.zhDescription)}
      </p>

      <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-parchment-200 pt-2.5 text-xs text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: event.civilizationColor }}
            aria-hidden="true"
          />
          {event.civilizationName}
        </span>
        {event.locationName && (
          <span className="inline-flex items-center gap-1">
            <Icon name="map" className="h-3.5 w-3.5" />
            {event.locationName}
          </span>
        )}
        {event.participants.length > 0 && (
          <span className="inline-flex flex-wrap items-center gap-1">
            <Icon name="users" className="h-3.5 w-3.5" />
            {event.participants.slice(0, 3).map((pid, i) => {
              const role = event.participantRoles?.[pid];
              return (
                <span
                  key={pid}
                  className="chip !border-parchment-200 !bg-parchment-100 !px-1.5 !py-0"
                  title={role ? t("ec.role", { role }) : undefined}
                >
                  {event.participantsNames[i] ?? pid}
                  {role ? <span className="ml-0.5 text-[10px] italic opacity-70">·{role}</span> : null}
                </span>
              );
            })}
            {event.participants.length > 3 && (
              <span>+{event.participants.length - 3}</span>
            )}
          </span>
        )}
      </footer>
    </article>
  );
}
