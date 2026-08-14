"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { EventDTO, OverviewDTO } from "@/lib/types";
import { formatYear } from "@/lib/theme";
import { EventModal } from "./EventModal";
import { useLocale } from "./LocaleProvider";
import { useExplorer } from "./ExplorerProvider";
import { ErrorBlock, LoadingBlock } from "@/components/ui/primitives";

/**
 * China vs World comparison: grouped bar chart of event counts per century
 * plus the top parallel event on each side per century.
 */
export function ComparisonPanel({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const { context } = useExplorer();
  const [overview, setOverview] = useState<OverviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/overview")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => !cancelled && setOverview(data as OverviewDTO))
      .catch(() => !cancelled && setError("Failed to load comparison data."));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** century bucket containing the globally focused year (if any) */
  const activeCentury = useMemo(() => {
    if (context.year === null || context.year === undefined) return null;
    return Math.floor(context.year / 100) * 100;
  }, [context.year]);

  const chart = useMemo(() => {
    if (!overview || width < 320) return null;
    const data = overview.comparison;
    const H = 220;
    const pad = { top: 26, right: 8, bottom: 28, left: 8 };
    const innerW = Math.max(40, width - pad.left - pad.right);
    const x0 = d3.scaleBand<string>().domain(data.map((d) => d.century)).range([0, innerW]).padding(0.35);
    const x1 = d3.scaleBand<string>().domain(["china", "world"]).range([0, x0.bandwidth()]).padding(0.12);
    const maxVal = Math.max(1, ...data.flatMap((d) => [d.china, d.world]));
    const y = d3.scaleLinear().domain([0, maxVal * 1.2]).range([H - pad.bottom, pad.top]);
    return { data, H, pad, innerW, x0, x1, y };
  }, [overview, width]);

  if (error) return <ErrorBlock message={error} />;
  if (!overview) return <LoadingBlock label={t("common.loading")} />;

  return (
    <div className={className}>
      <div className="panel overflow-hidden p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
          {activeCentury !== null && (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 font-semibold text-gold-dark">
              {t("cmp.century", { n: activeCentury / 100 + 1 })} · {formatYear(context.year ?? 0)}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-medium text-ink-soft">
            <span className="h-3 w-3 rounded-sm bg-vermilion" /> {t("cmp.china")}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-ink-soft">
            <span className="h-3 w-3 rounded-sm bg-jade" /> {t("cmp.world")}
          </span>
          <span className="ml-auto hidden text-ink-faint sm:block">{t("cmp.legendNote")}</span>
        </div>

        <div ref={containerRef} className="overflow-x-auto">
          {chart && (
            <svg viewBox={`0 0 ${width} ${chart.H}`} width="100%" role="img" aria-label="China vs world events per century" className="block min-w-[420px]">
              {chart.data.map((d) => {
                const cx = chart.x0(d.century) ?? 0;
                const cw = chart.x0.bandwidth();
                const chinaH = chart.H - chart.pad.bottom - chart.y(d.china);
                const worldH = chart.H - chart.pad.bottom - chart.y(d.world);
                return (
                  <g key={d.century}>
                    <line
                      x1={0}
                      y1={chart.y(0)}
                      x2={chart.innerW}
                      y2={chart.y(0)}
                      className="stroke-parchment-300"
                    />
                    {activeCentury === d.startYear && (
                      <rect
                        x={cx - 4}
                        y={chart.pad.top - 10}
                        width={cw + 8}
                        height={chart.H - chart.pad.top - chart.pad.bottom + 10}
                        rx={6}
                        fill="none"
                        stroke="#c9a227"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        className="pointer-events-none"
                      />
                    )}
                    <rect
                      x={cx + (chart.x1("china") ?? 0)}
                      y={chart.y(d.china)}
                      width={chart.x1.bandwidth()}
                      height={Math.max(2, chinaH)}
                      rx={3}
                      className="fill-vermilion"
                    >
                      <title>{`${d.century}: Tang China ${d.china} events`}</title>
                    </rect>
                    <rect
                      x={cx + (chart.x1("world") ?? 0)}
                      y={chart.y(d.world)}
                      width={chart.x1.bandwidth()}
                      height={Math.max(2, worldH)}
                      rx={3}
                      className="fill-jade"
                    >
                      <title>{`${d.century}: World ${d.world} events`}</title>
                    </rect>
                    <text x={cx + (chart.x1("china") ?? 0) + chart.x1.bandwidth() / 2} y={chart.y(d.china) - 5} textAnchor="middle" className="fill-ink-soft" style={{ fontSize: 11, fontWeight: 700 }}>
                      {d.china}
                    </text>
                    <text x={cx + (chart.x1("world") ?? 0) + chart.x1.bandwidth() / 2} y={chart.y(d.world) - 5} textAnchor="middle" className="fill-ink-soft" style={{ fontSize: 11, fontWeight: 700 }}>
                      {d.world}
                    </text>
                    <text x={cx + cw / 2} y={chart.H - 8} textAnchor="middle" className="fill-ink-faint" style={{ fontSize: 11 }}>
                      {d.century}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {overview.parallelEvents.map((p) => (
          <div
            key={p.year}
            className={
              "panel p-4 transition " +
              (activeCentury === p.year ? "!border-gold shadow-pop" : "")
            }
          >
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {t("cmp.around", {
                century: t("cmp.century", { n: Math.ceil((p.year + 1) / 100) }),
                year: formatYear(p.year),
              })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ParallelCell
                label={t("cmp.china")}
                color="#b3402a"
                event={p.china}
                onSelect={setSelected}
              />
              <ParallelCell
                label={t("cmp.world")}
                color="#2f8f6b"
                event={p.world}
                onSelect={setSelected}
              />
            </div>
          </div>
        ))}
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ParallelCell({
  label,
  color,
  event,
  onSelect,
}: {
  label: string;
  color: string;
  event: EventDTO | null;
  onSelect: (e: EventDTO) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <div className="rounded-lg border border-parchment-200 bg-parchment-100/50 p-2.5">
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </p>
      {event ? (
        <button
          onClick={() => onSelect(event)}
          className="text-left transition hover:text-vermilion-dark"
          title="Open event details"
        >
          <p className="font-mono text-xs text-ink-faint">{formatYear(event.year)}</p>
          <p className="font-display text-sm font-bold leading-snug text-ink">
            {locale === "zh" ? event.chineseTitle : event.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
            {locale === "zh" && event.zhDescription ? event.zhDescription : event.description}
          </p>
        </button>
      ) : (
        <p className="text-xs text-ink-faint">{t("cmp.noEvent")}</p>
      )}
    </div>
  );
}
