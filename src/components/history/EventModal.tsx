"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EventDTO } from "@/lib/types";
import { EventCard } from "./EventCard";
import { zhEventTags } from "@/data/seed/zhTags";
import { people as seedPeople } from "@/data/seed";

const personZh = new Map(seedPeople.map((p) => [p.id, p.chineseName]));
import { Icon } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";

/** Modal wrapper around EventCard; closes on Escape / backdrop click. */
export function EventModal({
  event,
  onClose,
}: {
  event: EventDTO | null;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-parchment-50 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("em.close")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-parchment-100 text-ink-soft shadow-sm transition hover:bg-parchment-200 hover:text-ink"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="p-5">
          <EventCard event={event} />
          {event.participantsNames.length > 0 && (
            <div className="mt-4 border-t border-parchment-200 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                <Icon name="users" className="h-3.5 w-3.5" /> {t("em.keyPeople")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {event.participants.map((pid, i) => (
                  <span key={pid} className="chip">
                    {locale === "zh"
                      ? personZh.get(pid) ?? event.participantsNames[i] ?? pid
                      : event.participantsNames[i] ?? pid}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 border-t border-parchment-200 pt-3">
            <button
              onClick={() => router.push(`/events/${event.id}`)}
              className="flex items-center gap-1 text-xs font-semibold text-vermilion-dark hover:underline"
            >
              {t("act.openEvent")} <Icon name="arrow-right" className="h-3 w-3" />
            </button>
          </div>

          {event.tags.length > 0 && (
            <div className="mt-3 border-t border-parchment-200 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">{t("em.tags")}</p>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span key={tag} className="chip !text-ink-faint">
                    #{locale === "zh" ? (zhEventTags[tag] ?? tag) : tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
