import { getRepository, repositoryMode } from "@/lib/repository";
import { getFeaturedJourneys } from "@/lib/learning/journeyRepository";
import { HomeView } from "@/components/history/HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const overview = await getRepository().getOverview();
  const mode = repositoryMode();
  // V0.3 Phase 3C: featured journeys come from the repository (never
  // hard-coded in the view) — published → featured → difficulty → minutes
  const featuredJourneys = getFeaturedJourneys(3);
  return <HomeView overview={overview} mode={mode} featuredJourneys={featuredJourneys} />;
}
