"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";

/**
 * V0.3 P2-15 — year picker for the "world by year" page.
 * Key years come from the seed (significance ≥ 4 events) — the picker
 * only writes the whitelisted ?year= URL param.
 */
export function WorldYearPicker({
  years,
  currentYear,
}: {
  years: number[];
  currentYear: number;
}) {
  const router = useRouter();
  const { locale, t } = useLocale();
  return (
    <nav
      className="panel flex flex-wrap items-center gap-1.5 p-3"
      aria-label={t("world.yearPicker")}
    >
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {t("world.pickYear")}
      </span>
      {years.map((y) => (
        <button
          key={y}
          onClick={() => router.push(`/world?year=${y}&lang=${locale}`)}
          aria-current={y === currentYear ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold transition ${
            y === currentYear
              ? "bg-vermilion text-white shadow-sm"
              : "bg-parchment-100 text-ink-soft hover:bg-gold/20 hover:text-gold-dark"
          }`}
        >
          {y}
        </button>
      ))}
    </nav>
  );
}
