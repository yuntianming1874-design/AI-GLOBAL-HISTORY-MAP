import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchHistoryEntities } from "@/lib/search";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).optional(),
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
  const hits = searchHistoryEntities(parsed.data.q, parsed.data.limit ?? 6);
  return NextResponse.json(hits);
}
