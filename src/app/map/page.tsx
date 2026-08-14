import type { Metadata } from "next";
import { HistoryMap } from "@/components/history/HistoryMap";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Historical Map — AI Global History Map",
  description:
    "Interactive map of Tang-era events across Eurasia: Silk Road, maritime routes, and world civilizations 500–1000 CE.",
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="map" titleKey="page.map.title" subtitleKey="page.map.subtitle" />
      <HistoryMap />
    </div>
  );
}
