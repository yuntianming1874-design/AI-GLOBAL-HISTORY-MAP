"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatResponse, EventDTO } from "@/lib/types";
import { createMap, type MapController } from "./mapAdapters";
import { ActionButtons, EntityLinks, RichText } from "./chatBlocks";
import { useLocale } from "./LocaleProvider";

/**
 * V0.2 event-page widgets:
 *  - EventMiniMap: the event on the world map, auto-focused on its location.
 *  - EventAIExplanation: context-aware AI explanation of the event.
 */

export function EventMiniMap({ event }: { event: EventDTO }) {
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<MapController | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    createMap(container, {
      onEventClick: () => {},
      onRouteClick: () => {},
      onNodeClick: () => {},
      onTerritoryClick: () => {},
    }).then(
      (controller) => {
        if (disposed) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        controller.update({
          locale,
          events: [event],
          civilizations: [],
          visibleCivIds: new Set([event.civilizationId]),
          activeCategory: "all",
          range: [event.year - 60, event.year + 60],
          showRoutes: false,
          territories: [],
          showTerritories: false,
          currentYear: event.year,
          personLocations: [],
          focusedLocation:
            event.latitude !== null && event.longitude !== null
              ? { latitude: event.latitude, longitude: event.longitude }
              : null,
        });
      },
      () => setError(true),
    );
    return () => {
      disposed = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [event, locale]);

  return (
    <div
      ref={containerRef}
      className="relative h-64 w-full overflow-hidden rounded-xl border border-parchment-300 bg-parchment-50"
      role="img"
      aria-label={`Map showing ${event.title}`}
    >
      {error && (
        <p className="absolute inset-0 flex items-center justify-center text-xs text-ink-faint">
          {t("ev.mapUnavailable")}
        </p>
      )}
    </div>
  );
}

export function EventAIExplanation({ event }: { event: EventDTO }) {
  const { locale, t } = useLocale();
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content:
              locale === "zh"
                ? "请解释这个事件为何重要、涉及哪些人物，以及同一时期世界其他地方发生了什么。"
                : "Explain why this event matters, who was involved, and what was happening elsewhere in the world at the same time.",
          },
        ],
        context: {
          year: event.year,
          eventId: event.id,
          civilizationId: event.civilizationId,
          locationId: event.locationId,
        },
        locale,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ChatResponse | null) => {
        if (cancelled) return;
        setResult(data);
        setBusy(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [event, locale]);

  if (busy) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-parchment-200 bg-parchment-100/50 px-4 py-3 text-sm text-ink-faint">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-parchment-300 border-t-vermilion" />
        {t("ev.aiLoading")}
      </div>
    );
  }
  if (failed || !result) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {t("ev.aiUnavailable")}
      </p>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border border-parchment-200 bg-parchment-100/50 p-4">
      <RichText text={result.reply} />
      <EntityLinks links={result.links} />
      <ActionButtons actions={result.actions} />
    </div>
  );
}
