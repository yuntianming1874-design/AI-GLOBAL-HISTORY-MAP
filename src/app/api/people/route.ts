import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  civilizationId: z.string().min(1).optional(),
  q: z.string().min(1).optional(),
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
    const people = await getRepository().getPeople(parsed.data);
    return NextResponse.json(people);
  } catch (err) {
    console.error("GET /api/people failed", err);
    return NextResponse.json({ error: "Failed to load people" }, { status: 500 });
  }
}
