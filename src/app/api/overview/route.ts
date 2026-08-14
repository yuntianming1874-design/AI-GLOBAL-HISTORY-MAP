import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const overview = await getRepository().getOverview();
    return NextResponse.json(overview);
  } catch (err) {
    console.error("GET /api/overview failed", err);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
