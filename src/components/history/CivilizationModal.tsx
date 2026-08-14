"use client";

import { useRouter } from "next/navigation";
import type { Civilization } from "@/lib/types";
import { formatYear } from "@/lib/theme";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { zhRegionNames } from "@/data/seed/zhMisc";
import { useLocale } from "./LocaleProvider";

/**
 * Civilization detail modal (V0.2) — opened by clicking a territory or a
 * civilization chip. Actions: focus on map / ask AI.
 */
export function CivilizationModal({
  civilization,
  onClose,
}: {
  civilization: Civilization | null;
  onClose: () => void;
}) {
  const { dispatch } = useExplorer();
  const router = useRouter();
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);
  if (!civilization) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={civilization.name}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-parchment-50 p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("civ.close")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-parchment-100 text-ink-soft transition hover:bg-parchment-200"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span
            className="h-4 w-4 rounded-md"
            style={{ backgroundColor: civilization.color }}
            aria-hidden="true"
          />
          {civilization.name}
          <span className="font-sans text-sm font-normal text-ink-faint">
            {civilization.chineseName}
          </span>
        </h3>
        <p className="mt-1 font-mono text-xs text-ink-faint">
          {locale === "zh" ? (zhRegionNames[civilization.region] ?? civilization.region) : civilization.region} · {formatYear(civilization.startYear)} –{" "}
          {formatYear(civilization.endYear)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{zh(civilization.summary, civilization.zhSummary)}</p>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-parchment-200 pt-3">
          <button
            onClick={() => dispatch({ type: "FOCUS_CIVILIZATION", id: civilization.id })}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            <Icon name="map" className="h-3.5 w-3.5" /> {t("civ.focusOnMap")}
          </button>
          <button
            onClick={() => {
              onClose();
              router.push(`/chat?civ=${encodeURIComponent(civilization.id)}`);
            }}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            <Icon name="bot" className="h-3.5 w-3.5" /> {t("civ.askAI")}
          </button>
        </div>
      </div>
    </div>
  );
}
