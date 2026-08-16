import type { Metadata } from "next";
import { headers } from "next/headers";
import { HistoryMap } from "@/components/history/HistoryMap";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh ? "历史地图 — AI 全球历史地图" : "Historical Map — AI Global History Map",
    description: isZh ? "欧亚大陆唐朝时期（618–907）事件的交互式地图：丝绸之路、海上航线与世界文明。" : "Interactive historical atlas of the Tang Dynasty era (618–907) and its world.",
  };
}

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="map" titleKey="page.map.title" subtitleKey="page.map.subtitle" />
      <HistoryMap />
    </div>
  );
}
