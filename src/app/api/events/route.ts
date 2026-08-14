import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/repository";
import type { EventFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "political",
  "military",
  "cultural",
  "economic",
  "religious",
  "technological",
  "diplomatic",
] as const;

const querySchema = z.object({
  civilizationId: z.string().min(1).optional(),
  category: z.enum(CATEGORIES).optional(),
  from: z.coerce.number().int().optional(),
  to: z.coerce.number().int().optional(),
  q: z.string().min(1).optional(),
  personId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const filters: EventFilters = { ...parsed.data };
    const events = await getRepository().getEvents(filters);
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events failed", err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}
