import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await getRepository().getLocations();
    return NextResponse.json(locations);
  } catch (err) {
    console.error("GET /api/locations failed", err);
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
  }
}
