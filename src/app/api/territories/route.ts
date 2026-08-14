import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  year: z.coerce.number().int().optional(),
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
    const territories = await getRepository().getTerritories(parsed.data.year);
    return NextResponse.json(territories);
  } catch (err) {
    console.error("GET /api/territories failed", err);
    return NextResponse.json({ error: "Failed to load territories" }, { status: 500 });
  }
}
