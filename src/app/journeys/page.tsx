import type { Metadata } from "next";
import { getJourneys } from "@/lib/learning/journeyRepository";
import { PageHeader } from "@/components/history/PageHeader";
import { JourneysGrid } from "@/components/history/JourneysGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning Journeys — AI Global History Map",
  description:
    "Guided historical explorations connecting timeline, map, events, people and AI narration.",
};

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
