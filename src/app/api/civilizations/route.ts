import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const civilizations = await getRepository().getCivilizations();
    return NextResponse.json(civilizations);
  } catch (err) {
    console.error("GET /api/civilizations failed", err);
    return NextResponse.json(
      { error: "Failed to load civilizations" },
      { status: 500 },
    );
  }
}
