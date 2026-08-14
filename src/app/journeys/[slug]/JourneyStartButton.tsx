"use client";

import { useExplorer } from "@/components/history/ExplorerProvider";
import { useLocale } from "@/components/history/LocaleProvider";
import { Icon } from "@/components/ui/icons";

/**
 * V0.3 — Start Journey button. Fires START_JOURNEY through the unified
 * navigation mechanism (one URL transition to ?journey=&step=1&…).
 */
export function JourneyStartButton({ journeyId }: { journeyId: string }) {
  const { dispatch } = useExplorer();
  const { t } = useLocale();
  return (
    <button
      onClick={() => dispatch({ type: "START_JOURNEY", journeyId })}
      className="btn-primary !px-5 !py-2.5 text-sm"
    >
      <Icon name="arrow-right" className="h-4 w-4" />
      {t("journey.start")}
    </button>
  );
}
