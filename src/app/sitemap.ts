import type { MetadataRoute } from "next";
import { getJourneys } from "@/lib/learning/journeyRepository";

/**
 * V0.3 P1-8 — sitemap: static pages + dynamic journey routes.
 * Base URL follows SITE_URL (defaults to the Vercel project URL pattern).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/people`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/chat`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/journeys`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const journeyRoutes: MetadataRoute.Sitemap = getJourneys().flatMap((j) => [
    {
      url: `${base}/journeys/${j.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/journeys/${j.slug}/review`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  return [...staticRoutes, ...journeyRoutes];
}
