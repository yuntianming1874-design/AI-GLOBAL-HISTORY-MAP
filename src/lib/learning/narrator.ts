/**
 * V0.3 — AI Historical Narration (Phase 2: deterministic local narrator).
 *
 * Produces structured HistoricalNarration for a journey step. All facts
 * come from the seed repository (events/people/civilizations/locations +
 * provenance) — the narrator NEVER invents entity ids, dates or events.
 * If a step references no resolvable entity, keyFacts is simply empty and
 * the UI shows only the editorial narrative.
 *
 * Phase 3+ may swap this for an LLM-backed narrator with the same output
 * contract; the facts/interpretation separation and entity whitelist stay.
 */
import type { Locale } from "../i18n";
import { formatHistoricalDate, formatYearSpan } from "../provenance";
import type { Journey, JourneyStep, HistoricalNarration } from "./journeyTypes";

import {
  events,
  people,
} from "@/data/seed";

const personById = new Map(people.map((p) => [p.id, p]));
const eventById = new Map(events.map((e) => [e.id, e]));

/** Action suggestions for the step's primary entity (all whitelisted). */
function actionsForStep(step: JourneyStep): import("../explorer").HistoryNavigationAction[] {
  const actions: import("../explorer").HistoryNavigationAction[] = [];
  if (step.eventId) {
    actions.push({ type: "OPEN_EVENT", id: step.eventId });
    actions.push({
      type: "FOCUS_TIMELINE",
      year: step.year,
      entityId: step.eventId,
      entityType: "event",
    });
    if (step.locationId) {
      actions.push({
        type: "FOCUS_MAP",
        locationId: step.locationId,
        eventId: step.eventId,
        year: step.year,
      });
    }
  } else if (step.locationId) {
    actions.push({ type: "FOCUS_MAP", locationId: step.locationId, year: step.year });
  }
  if (step.civilizationId) {
    actions.push({ type: "FOCUS_CIVILIZATION", id: step.civilizationId });
  }
  return actions;
}

/**
 * Deterministic narration for a journey step.
 *
 * summary        — editorial narrative (step content)
 * keyFacts       — facts drawn from the seed repository only
 * importance     — why-it-matters framing (template + significance)
 * relatedEntities— surrounding entities (all whitelisted)
 * actions        — navigation actions for the step's entities
 * uncertaintyNotes — provenance-driven notes (disputed/unknown dates)
 */
export function narrateStep(
  _journey: Journey,
  step: JourneyStep,
  locale: Locale = "zh",
): HistoricalNarration {
  const zh = locale === "zh";
  const summary = zh ? step.narrative : step.narrativeEn;

  const keyFacts: HistoricalNarration["keyFacts"] = [];
  const uncertaintyNotes: string[] = [];

  // primary event fact
  if (step.eventId) {
    const e = eventById.get(step.eventId);
    if (e) {
      const dp = e.dateProvenance;
      keyFacts.push({
        entityId: e.id,
        entityType: "event",
        label: zh ? e.chineseTitle : e.title,
        dateDisplay: formatYearSpan(e.year, e.yearEnd, dp, locale),
      });
      if (dp?.confidence === "disputed" || dp?.precision === "unknown") {
        uncertaintyNotes.push(
          zh
            ? `${zh ? e.chineseTitle : e.title} 的日期存在不确定性（${formatHistoricalDate(dp, locale)}）。`
            : `${e.title} has an uncertain date (${formatHistoricalDate(dp, locale)}).`,
        );
      }
    }
  }
  // surrounding entity facts
  for (const ref of step.surroundingEntities) {
    if (ref.type === "event" && ref.id !== step.eventId) {
      const e = eventById.get(ref.id);
      if (e) {
        keyFacts.push({
          entityId: e.id,
          entityType: "event",
          label: zh ? e.chineseTitle : e.title,
          dateDisplay: formatYearSpan(e.year, e.yearEnd, e.dateProvenance, locale),
        });
      }
    }
  }
  // primary person fact (lifespan + role spans)
  if (step.personId) {
    const p = personById.get(step.personId);
    if (p) {
      keyFacts.push({
        entityId: p.id,
        entityType: "person",
        label: zh ? p.chineseName : p.name,
        dateDisplay:
          p.birthYear !== null || p.deathYear !== null
            ? `${p.birthYear ?? "?"}–${p.deathYear ?? "?"}`
            : undefined,
      });
      const birth = p.provenance?.birth;
      const death = p.provenance?.death;
      if (birth?.confidence === "disputed" || birth?.precision === "unknown") {
        uncertaintyNotes.push(
          zh
            ? `${zh ? p.chineseName : p.name} 的出生年份${birth?.precision === "unknown" ? "现有可靠资料无法确定" : "存在学术争议"}。`
            : `${p.name}'s birth year is ${birth?.precision === "unknown" ? "not established by reliable sources" : "scholarly disputed"}.`,
        );
      }
      if (death?.confidence === "disputed") {
        uncertaintyNotes.push(
          zh
            ? `${zh ? p.chineseName : p.name} 的卒年存在学术争议。`
            : `${p.name}'s death year is scholarly disputed.`,
        );
      }
    }
  }

  // importance: template + significance of primary event (if any)
  let importance: string;
  if (step.eventId) {
    const e = eventById.get(step.eventId);
    const sig = e?.significance ?? 3;
    importance = zh
      ? `这是理解 ${step.year ?? ""} 年世界格局的关键节点之一——事件重要性评级 ${"★".repeat(sig)}${"☆".repeat(5 - sig)}（1–5 级，基于现有数据）。`
      : `A key node for understanding the world of ${step.year ?? ""} CE — event significance ${"★".repeat(sig)}${"☆".repeat(5 - sig)} (1–5 scale, from curated data).`;
  } else {
    importance = zh
      ? "这一步帮助你建立时代框架：把单一事件放回时间与空间坐标中理解。"
      : "This step builds the era's frame: placing single events back into their time-and-space coordinates.";
  }

  return {
    summary,
    keyFacts,
    importance,
    relatedEntities: step.surroundingEntities,
    actions: actionsForStep(step),
    uncertaintyNotes: uncertaintyNotes.length > 0 ? uncertaintyNotes : undefined,
  };
}
