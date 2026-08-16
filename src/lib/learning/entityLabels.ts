/**
 * V0.3 P0-1 — human-friendly entity labels for UI chips.
 *
 * Journey steps reference entities by id (e-751-talas / c-tang / …);
 * chips must show the CURATED names instead. Single mapping built from
 * the seed (already in the client bundle via journeyRepository).
 */
import {
  civilizations,
  events,
  locations,
  people,
} from "@/data/seed";
import type { HistoryEntityRef } from "../explorer";

const labelById = new Map<string, { zh: string; en: string }>();
for (const e of events) labelById.set(e.id, { zh: e.chineseTitle, en: e.title });
for (const p of people) labelById.set(p.id, { zh: p.chineseName, en: p.name });
for (const c of civilizations) labelById.set(c.id, { zh: c.chineseName, en: c.name });
for (const l of locations) labelById.set(l.id, { zh: l.chineseName, en: l.name });

export function entityDisplayLabel(
  ref: HistoryEntityRef,
  locale: "en" | "zh",
): string {
  const l = labelById.get(ref.id);
  if (!l) return ref.id; // unknown id → fall back (never invent a name)
  return locale === "zh" ? l.zh : l.en;
}

/** Type tag used by chips/aria ("事件" / "人物" / …). */
export function entityTypeLabel(
  type: HistoryEntityRef["type"],
  locale: "en" | "zh",
): string {
  const zh: Record<HistoryEntityRef["type"], string> = {
    event: "事件",
    person: "人物",
    civilization: "文明",
    location: "地点",
    territory: "疆域",
  };
  return locale === "zh" ? zh[type] : type;
}
