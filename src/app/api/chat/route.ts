import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chat } from "@/lib/assistant";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

/** V0.2: the user's current exploration context (from URL params). */
const contextSchema = z
  .object({
    year: z.coerce.number().int().nullable().optional(),
    startYear: z.coerce.number().int().nullable().optional(),
    endYear: z.coerce.number().int().nullable().optional(),
    civilizationId: z.string().min(1).nullable().optional(),
    eventId: z.string().min(1).nullable().optional(),
    personId: z.string().min(1).nullable().optional(),
    locationId: z.string().min(1).nullable().optional(),
    journeyId: z.string().min(1).nullable().optional(),
    journeyStep: z.coerce.number().int().nullable().optional(),
  })
  .optional();

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
  context: contextSchema,
  locale: z.enum(["en", "zh"]).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const ctx = parsed.data.context;
    const result = await chat(
      parsed.data.messages,
      {
        year: ctx?.year ?? null,
        startYear: ctx?.startYear ?? null,
        endYear: ctx?.endYear ?? null,
        civilizationId: ctx?.civilizationId ?? null,
        eventId: ctx?.eventId ?? null,
        personId: ctx?.personId ?? null,
        locationId: ctx?.locationId ?? null,
        journeyId: ctx?.journeyId ?? null,
        journeyStep: ctx?.journeyStep ?? null,
      },
      parsed.data.locale ?? "en",
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/chat failed", err);
    return NextResponse.json({ error: "Chat engine failed" }, { status: 500 });
  }
}
