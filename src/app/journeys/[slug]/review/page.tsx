import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJourneyBySlug } from "@/lib/learning/journeyRepository";
import { JourneyReview } from "@/components/history/JourneyReview";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) return { title: "Review not found" };
  return {
    title: `${journey.title} · Review — AI Global History Map`,
    description: `Recall and review what you learned in “${journey.title}”.`,
    alternates: { canonical: `/journeys/${journey.slug}/review` },
  };
}

export default function JourneyReviewPage({ params }: Props) {
  const journey = getJourneyBySlug(params.slug);
  if (!journey) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        icon="layers"
        titleKey="review.pageTitle"
        subtitleKey="review.pageSubtitle"
      />
      <JourneyReview journey={journey} />
    </div>
  );
}
