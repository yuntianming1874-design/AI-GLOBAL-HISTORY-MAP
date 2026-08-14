"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDTO, HistoricalLocation } from "@/lib/types";
import { formatYear } from "@/lib/theme";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";

/**
 * Location Detail modal (V0.2): place info + events that happened there +
 * "Ask AI" / "Focus on map" actions.
 */
export function LocationModal({
  location,
  onClose,
}: {
  location: HistoricalLocation | null;
  onClose: () => void;
}) {
  const { dispatch } = useExplorer();
  const router = useRouter();
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);
  const [eventsHere, setEventsHere] = useState<EventDTO[] | null>(null);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    fetch(`/api/events?locationId=${encodeURIComponent(location.id)}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setEventsHere(data as EventDTO[]))
      .catch(() => !cancelled && setEventsHere([]));
    return () => {
      cancelled = true;
    };
  }, [location]);

  useEffect(() => {
    if (!location) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [location, onClose]);

  if (!location) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={location.name}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-parchment-50 p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("loc.close")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-parchment-100 text-ink-soft transition hover:bg-parchment-200"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Icon name="map" className="h-5 w-5 text-vermilion" />
          {location.name}
          <span className="font-sans text-sm font-normal text-ink-faint">{location.chineseName}</span>
        </h3>
        <p className="mt-1 text-xs text-ink-faint">
          {location.modernCountry} · {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{zh(location.description, location.zhDescription)}</p>

        <div className="mt-4 border-t border-parchment-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("loc.eventsHere")} · {eventsHere?.length ?? "…"}
          </p>
          {eventsHere === null ? (
            <p className="text-xs text-ink-faint">{t("common.loading")}</p>
          ) : eventsHere.length === 0 ? (
            <p className="text-xs text-ink-faint">{t("loc.noEvents")}</p>
          ) : (
            <ul className="space-y-1.5">
              {eventsHere.slice(0, 6).map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => dispatch({ type: "OPEN_EVENT", id: e.id })}
                    className="group flex w-full items-baseline gap-2 rounded-lg border border-parchment-200 bg-parchment-100/50 px-2.5 py-1.5 text-left transition hover:border-gold"
                  >
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {formatYear(e.year)}
                    </span>
                    <span className="text-sm font-semibold text-ink group-hover:text-vermilion-dark">
                      {zh(e.title, e.chineseTitle)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-parchment-200 pt-3">
          <button
            onClick={() =>
              dispatch({ type: "OPEN_LOCATION", id: location.id })
            }
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            <Icon name="map" className="h-3.5 w-3.5" /> {t("loc.focusOnMap")}
          </button>
          <button
            onClick={() => {
              onClose();
              router.push(`/chat?loc=${encodeURIComponent(location.id)}`);
            }}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            <Icon name="bot" className="h-3.5 w-3.5" /> {t("loc.askAI")}
          </button>
        </div>
      </div>
    </div>
  );
}
