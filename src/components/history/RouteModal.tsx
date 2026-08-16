"use client";

import { locations as seedLocations } from "@/data/seed";
import type { TradeRoute } from "@/lib/geo";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";

/**
 * Trade route detail modal (V0.2): description, clickable nodes
 * (→ Location Detail) and related civilizations (→ focus on map).
 */
export function RouteModal({
  route,
  onClose,
  onSelectNode,
}: {
  route: TradeRoute | null;
  onClose: () => void;
  onSelectNode: (locationId: string) => void;
}) {
  const { dispatch, context } = useExplorer();
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);
  if (!route) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={route.name}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-parchment-50 p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("route.close")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-parchment-100 text-ink-soft transition hover:bg-parchment-200"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span
            className="inline-block h-3.5 w-3.5 rounded-full border-2 border-dashed"
            style={{ borderColor: route.color }}
            aria-hidden="true"
          />
          {zh(route.name, route.chineseName)}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{zh(route.description, route.zhDescription)}</p>

        <div className="mt-4 border-t border-parchment-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("route.majorStops")}
          </p>
          <ol className="space-y-1">
            {route.nodes.map((node, i) => (
              <li key={node.locationId} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-faint">{i + 1}.</span>
                <button
                  onClick={() => onSelectNode(node.locationId)}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-ink transition hover:bg-gold/15 hover:text-gold-dark"
                >
                  {zh(node.name, seedLocations.find((l) => l.id === node.locationId)?.chineseName ?? null)}
                </button>
                {i < route.nodes.length - 1 && (
                  <Icon name="chevron-down" className="h-3 w-3 -rotate-90 text-ink-faint" />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 border-t border-parchment-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("route.connects")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {route.civIds.map((civId) => (
              <button
                key={civId}
                onClick={() => dispatch({ type: "FOCUS_CIVILIZATION", id: civId })}
                className={
                  "chip transition hover:border-gold " +
                  (context.civilizationId === civId ? "!border-gold !bg-gold/15" : "")
                }
              >
                {civId.replace("c-", "")}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-ink-faint">{t("route.schematicNote")}</p>
      </div>
    </div>
  );
}
