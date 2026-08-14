import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { EventDetailView } from "@/components/history/EventDetailView";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getRepository().getEventById(params.id);
  return {
    title: event ? `${event.title} — AI Global History Map` : "Event not found",
    description: event?.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const repo = getRepository();
  const event = await repo.getEventById(params.id);
  if (!event) notFound();

  const [civilizations, people, allEvents] = await Promise.all([
    repo.getCivilizations(),
    repo.getPeople(),
    repo.getEvents(),
  ]);
  const civ = civilizations.find((c) => c.id === event.civilizationId) ?? null;

  /* related civilizations: primary + any whose name appears in the description */
  const mentioned = civilizations.filter((c) => {
    if (c.id === event.civilizationId) return false;
    const token = c.name.split(" ")[0].toLowerCase();
    return (
      token.length >= 4 &&
      `${event.description} ${event.tags.join(" ")}`.toLowerCase().includes(token)
    );
  });
  const relatedCivilizations = [civ, ...mentioned].filter(
    (c): c is NonNullable<typeof c> => c !== null,
  );

  /* related events: same civilization ±25y, then world parallel ±5y */
  const sameCiv = allEvents
    .filter(
      (e) =>
        e.id !== event.id &&
        e.civilizationId === event.civilizationId &&
        Math.abs(e.year - event.year) <= 25,
    )
    .sort((a, b) => b.significance - a.significance || Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
    .slice(0, 6);
  const worldParallel = allEvents
    .filter(
      (e) =>
        e.id !== event.id &&
        e.civilizationId !== event.civilizationId &&
        Math.abs(e.year - event.year) <= 5,
    )
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 4);

  return (
    <EventDetailView
      event={event}
      related={{
        civilizations,
        relatedCivilizations,
        sameCiv,
        worldParallel,
        participants: event.participantsNames,
        people,
      }}
    />
  );
}
