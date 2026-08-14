import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const relationships = await getRepository().getRelationships();
    return NextResponse.json(relationships);
  } catch (err) {
    console.error("GET /api/relationships failed", err);
    return NextResponse.json(
      { error: "Failed to load relationships" },
      { status: 500 },
    );
  }
}
