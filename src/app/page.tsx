import { getRepository, repositoryMode } from "@/lib/repository";
import { HomeView } from "@/components/history/HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const overview = await getRepository().getOverview();
  const mode = repositoryMode();
  return <HomeView overview={overview} mode={mode} />;
}
