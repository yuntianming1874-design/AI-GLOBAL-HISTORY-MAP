import type { Metadata } from "next";
import { headers } from "next/headers";
import { events } from "@/data/seed";
import { PageHeader } from "@/components/history/PageHeader";
import { ContemporaryWorldPanel } from "@/components/history/ContemporaryWorldPanel";
import { WorldYearPicker } from "@/components/history/WorldYearPicker";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { year?: string; lang?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh
      ? "按年看世界同期 — AI 全球历史地图"
      : "World by Year — AI Global History Map",
    description: isZh
      ? "同一年，世界不同地区发生了什么？按年份查看唐朝时期（618–907）的世界同期事件。"
      : "What was happening across the world in the same year? Year-by-year world context for the Tang era (618–907).",
  };
}

const YEAR_MIN = 500;
const YEAR_MAX = 1000;

/** 关键年份（来自 seed 中 significance ≥ 4 的事件，去重排序）。 */
const keyYears = [
  ...new Set(
    events
      .filter((e) => e.significance >= 4)
      .map((e) => e.year)
      .sort((a, b) => a - b),
  ),
];

export default function WorldPage({ searchParams }: Props) {
  const raw = Number.parseInt(searchParams.year ?? "", 10);
  const year =
    Number.isFinite(raw) && raw >= YEAR_MIN && raw <= YEAR_MAX
      ? raw
      : 751; // default: the flagship year

  return (
    <div className="space-y-6">
      <PageHeader
        icon="globe"
        titleKey="world.pageTitle"
        subtitleKey="world.pageSubtitle"
      />
      <WorldYearPicker years={keyYears} currentYear={year} />
      <ContemporaryWorldPanel year={year} />
    </div>
  );
}
