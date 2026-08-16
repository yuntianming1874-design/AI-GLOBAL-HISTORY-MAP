import type { Metadata } from "next";
import { headers } from "next/headers";
import { getJourneys } from "@/lib/learning/journeyRepository";
import { PageHeader } from "@/components/history/PageHeader";
import { JourneysGrid } from "@/components/history/JourneysGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh ? "学习旅程 — AI 全球历史地图" : "Learning Journeys — AI Global History Map",
    description: isZh ? "串联时间轴、地图、事件、人物与 AI 叙事的引导式历史探索。" : "Interactive historical atlas of the Tang Dynasty era (618–907) and its world.",
  };
}

export default function JourneysPage() {
  const journeys = getJourneys();
  return (
    <div className="space-y-6">
      <PageHeader
        icon="layers"
        titleKey="journey.listTitle"
        subtitleKey="journey.listSubtitle"
      />
      <JourneysGrid journeys={journeys} />
    </div>
  );
}
