"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { useLocale } from "@/components/history/LocaleProvider";

/** V0.3 — Review entry button (client: label follows the locale). */
export function JourneyReviewButton({ slug }: { slug: string }) {
  const { t } = useLocale();
  return (
    <Link href={`/journeys/${slug}/review`} className="btn-ghost !px-5 !py-2.5 text-sm">
      <Icon name="book" className="h-4 w-4" />
      {t("journey.reviewNow")}
    </Link>
  );
}
