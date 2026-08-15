/**
 * V0.3 Phase 3D — Deterministic Historical Navigator engine.
 *
 * Builds next-step recommendations from the CURRENT HistoryContext
 * (which already carries LearningContext: journeyId / journeyStep).
 * Everything is grounded in the seed registry + journey repository:
 *   - entityRefs validated with isValidEntityRef
 *   - journeyId validated with getJourneyById
 *   - actions built from validated entities only
 * Invalid candidates are DROPPED (fail-closed). No LLM involvement.
 *
 * Branch rules:
 *   journey step          → continue (next step) / end → continue (featured)
 *   eventId               → deepen (participants/same-civ) + cause (earlier
 *                           same-civ) + compare (other civs, ±10y) + continue
 *   personId              → deepen (their events) + compare (contemporaries)
 *   civilizationId        → deepen (civ events)
 *   year                  → deepen (events of that year) + continue (journey)
 *   empty                 → continue (featured journeys)
 */
import type {
  HistoryContext,
  HistoryEntityRef,
  HistoryNavigationAction,
} from "../explorer";
import {
  civilizations,
  events,
  locations,
  people,
} from "@/data/seed";
import {
  getFeaturedJourneys,
  getJourneyById,
  getJourneyStep,
  isValidEntityRef,
} from "./journeyRepository";
import type { NavigatorRecommendation, RecommendationType } from "./navigatorTypes";

/* ── entity lookups (seed only) ────────────────────────────────────── */

const eventById = new Map(events.map((e) => [e.id, e]));
const personById = new Map(people.map((p) => [p.id, p]));
const civById = new Map(civilizations.map((c) => [c.id, c]));
const locById = new Map(locations.map((l) => [l.id, l]));

function ref(type: "event" | "person" | "civilization" | "location", id: string): HistoryEntityRef {
  return { id, type };
}

/* ── action builders (validated ids only) ──────────────────────────── */

function eventActions(id: string): HistoryNavigationAction[] {
  const e = eventById.get(id);
  const actions: HistoryNavigationAction[] = [
    { type: "OPEN_EVENT", id },
    { type: "FOCUS_TIMELINE", year: e?.year, entityId: id, entityType: "event" },
  ];
  if (e?.locationId) {
    actions.push({ type: "FOCUS_MAP", locationId: e.locationId, eventId: id, year: e.year });
  }
  return actions;
}

function personActions(id: string): HistoryNavigationAction[] {
  return [
    { type: "OPEN_PERSON", id },
    { type: "FOCUS_PERSON_GRAPH", personId: id },
  ];
}

function journeyActions(journeyId: string, step?: number): HistoryNavigationAction[] {
  return step !== undefined
    ? [{ type: "SET_JOURNEY_STEP", journeyId, step }]
    : [{ type: "START_JOURNEY", journeyId }];
}

/* ── recommendation factory with fail-closed validation ────────────── */

function make(
  type: RecommendationType,
  id: string,
  titleZh: string,
  titleEn: string,
  reasonZh: string,
  reasonEn: string,
  entityRefs: HistoryEntityRef[],
  actions: HistoryNavigationAction[],
  journeyId?: string,
): NavigatorRecommendation | null {
  // fail-closed: every entity ref must exist with matching type
  for (const r of entityRefs) {
    if (!isValidEntityRef(r)) return null;
  }
  // journeyId must exist in the repository (never a fabricated slug)
  if (journeyId !== undefined && !getJourneyById(journeyId)) return null;
  // actions must reference only known ids
  for (const a of actions) {
    const idToCheck =
      "id" in a ? a.id : "personId" in a ? a.personId : "locationId" in a ? a.locationId : undefined;
    if (idToCheck !== undefined && !isKnownAny(idToCheck)) return null;
  }
  return {
    id: `${type}:${id}`,
    type,
    titleZh,
    titleEn,
    reasonZh,
    reasonEn,
    entityRefs,
    actions,
    journeyId,
  };
}

function isKnownAny(id: string): boolean {
  return eventById.has(id) || personById.has(id) || civById.has(id) || locById.has(id);
}

/* ── candidate helpers ─────────────────────────────────────────────── */

/**
 * RC-3 人工审计：cause 推荐只允许出现在此表中（每条经历史真实性核对）。
 * 被删除的自动候选（如 怛罗斯→杨贵妃、金刚经→黄巢 等"同文明最近更早"
 * 的伪因果）不再产出 cause —— 宁缺毋滥。
 */
const CURATED_CAUSES: Record<string, string> = {
  "e-626-xuanwu-gate": "e-618-tang-founded", // 唐朝建立 → 玄武门（建国背景）
  "e-632-muhammad-dies": "e-622-hijra", // 希吉拉 → 穆罕默德逝世
  "e-634-arab-conquests": "e-632-muhammad-dies", // 逝世 → 继任者征服
  "e-638-jerusalem-siege": "e-634-arab-conquests", // 征服黎凡特 → 耶路撒冷
  "e-661-umayyad-founded": "e-638-jerusalem-siege", // 征服巩固 → 倭马亚王朝
  "e-705-wu-zetian-abdication": "e-690-wu-zetian-zhou", // 称帝 → 退位
  "e-711-umayyad-iberia": "e-661-umayyad-founded", // 王朝建立 → 伊比利亚
  "e-726-iconoclasm": "e-717-siege-constantinople", // 君堡之围危机 → 圣像破坏（学界关联）
  "e-762-baghdad": "e-750-abbasid-revolution", // 革命 → 建都巴格达
  "e-768-charlemagne-king": "e-732-tours", // 图尔战役 → 加洛林崛起背景
  "e-786-harun-caliph": "e-762-baghdad", // 建都 → 哈伦宫廷
  "e-786-translation-movement": "e-762-baghdad", // 建都 → 翻译运动中心
  "e-800-charlemagne-emperor": "e-768-charlemagne-king", // 继位 → 加冕
  "e-810-maya-collapse": "e-741-tikal-temple-iv", // 古典期 → 崩溃（长时段过程）
  "e-820-khwarizmi-algebra": "e-786-harun-caliph", // 哈伦赞助 → 代数学
  "e-885-vikings-paris": "e-793-lindisfarne", // 维京时代开启 → 围攻巴黎
  "e-907-fall-of-tang": "e-875-huang-chao", // 黄巢之乱 → 唐朝灭亡（强因果）
};

function compareEventCandidates(year: number, excludeCivId: string, limit: number) {
  // significant events of other civilizations within ±10 years
  return events
    .filter(
      (x) =>
        x.civilizationId !== excludeCivId &&
        Math.abs(x.year - year) <= 10 &&
        x.significance >= 3,
    )
    .sort(
      (a, b) =>
        b.significance - a.significance ||
        Math.abs(a.year - year) - Math.abs(b.year - year),
    )
    .slice(0, limit);
}

/* ── engine ────────────────────────────────────────────────────────── */

export function buildRecommendations(
  context: HistoryContext,
  locale: "en" | "zh" = "zh",
  limit = 3,
): NavigatorRecommendation[] {
  const zh = locale === "zh";
  const out: NavigatorRecommendation[] = [];
  const seen = new Set<string>();
  const push = (r: NavigatorRecommendation | null) => {
    if (!r) return;
    // dedupe by stable id (e.g. the same featured journey can be picked
    // by both the event branch and the year branch — keep one)
    if (seen.has(r.id)) return;
    seen.add(r.id);
    if (out.length < limit) out.push(r);
  };

  /* 1. Journey context: continue to next step */
  if (context.journeyId && context.journeyStep !== null) {
    const journey = getJourneyById(context.journeyId);
    if (journey) {
      const next = getJourneyStep(journey, context.journeyStep + 1);
      if (next) {
        push(
          make(
            "continue",
            `${journey.id}-step-${next.order}`,
            zh ? `继续：${next.title}` : `Continue: ${next.titleEn}`,
            zh ? `Continue: ${next.titleEn}` : `Continue: ${next.title}`,
            zh
              ? `你正在探索「${journey.title}」——下一步是「${next.title}」。`
              : `You are exploring "${journey.titleEn}" — next step: "${next.titleEn}".`,
            zh ? `Next: ${next.titleEn}` : `Next: ${next.title}`,
            [
              ...(next.eventId ? [ref("event", next.eventId)] : []),
              ...(next.personId ? [ref("person", next.personId)] : []),
              ...(next.civilizationId ? [ref("civilization", next.civilizationId)] : []),
              ...(next.locationId ? [ref("location", next.locationId)] : []),
            ],
            journeyActions(journey.id, next.order),
            journey.id,
          ),
        );
      }
      // end of journey → featured journey as the next exploration
      const featured = getFeaturedJourneys(2).find((j) => j.id !== journey.id);
      if (featured) {
        push(
          make(
            "continue",
            featured.id,
            zh ? featured.title : featured.titleEn,
            zh ? featured.titleEn : featured.title,
            zh
              ? `你完成了「${journey.title}」。下一个可以探索：「${featured.title}」。`
              : `You finished "${journey.titleEn}". Next up: "${featured.titleEn}".`,
            zh ? `Next: ${featured.titleEn}` : `Next: ${featured.title}`,
            [],
            journeyActions(featured.id),
            featured.id,
          ),
        );
      }
    }
  }

  /* 2. Event context: deepen + cause + compare */
  if (context.eventId) {
    const e = eventById.get(context.eventId);
    if (e) {
      // deepen: participants as people refs
      const participantRefs = e.participants
        .slice(0, 2)
        .map((pid) => ref("person", pid));
      if (participantRefs.length > 0) {
        push(
          make(
            "deepen",
            `people:${e.id}`,
            zh ? "看看参与这场事件的人物" : "Meet the people behind this event",
            zh ? "Meet the people behind this event" : "看看参与这场事件的人物",
            zh
              ? `「${e.chineseTitle}」的参与者可以帮你理解事件的推动者。`
              : `The participants of "${e.title}" help you understand who drove it.`,
            zh ? "People behind this event" : "事件背后的参与者",
            participantRefs,
            participantRefs.flatMap((r) => personActions(r.id)),
          ),
        );
      }
      // cause: RC-3 curated pairs only (human-audited, see CURATED_CAUSES)
      const causeId = CURATED_CAUSES[e.id];
      const cause = causeId ? eventById.get(causeId) : undefined;
      if (cause) {
        push(
          make(
            "cause",
            cause.id,
            zh ? `前因：${cause.chineseTitle}` : `Cause: ${cause.title}`,
            zh ? `Cause: ${cause.title}` : `前因：${cause.chineseTitle}`,
            zh
              ? `在「${e.chineseTitle}」之前，同属${civById.get(e.civilizationId)?.chineseName ?? ""}的「${cause.chineseTitle}」（${cause.year} 年）是理解它的重要前因。`
              : `Before "${e.title}", "${cause.title}" (${cause.year}) in the same civilization is an important precondition.`,
            zh ? `Earlier in the same civilization` : `同文明更早的事件`,
            [ref("event", cause.id)],
            eventActions(cause.id),
          ),
        );
      }
      // compare: other-civ events around the same year
      const others = compareEventCandidates(e.year, e.civilizationId, 1);
      for (const o of others) {
        push(
          make(
            "compare",
            o.id,
            zh ? `同期：${o.chineseTitle}` : `Meanwhile: ${o.title}`,
            zh ? `Meanwhile: ${o.title}` : `同期：${o.chineseTitle}`,
            zh
              ? `${o.year} 年，${civById.get(o.civilizationId)?.chineseName ?? ""}的「${o.chineseTitle}」正在发生——同一时间，世界并不只有一条故事线。`
              : `In ${o.year}, "${o.title}" was unfolding in ${civById.get(o.civilizationId)?.name ?? ""} — the world never had a single storyline.`,
            zh ? `Same time, other world` : `同一时间的其他世界`,
            [ref("event", o.id)],
            eventActions(o.id),
          ),
        );
      }
      // continue: journey covering this event (talas-751 step2 covers e-751-talas)
      const covering = getFeaturedJourneys(3).find((j) =>
        j.steps.some((s) => s.eventId === e.id || (s.keyFactEntityIds ?? []).includes(e.id)),
      );
      if (covering) {
        push(
          make(
            "continue",
            covering.id,
            zh ? `进入旅程：${covering.title}` : `Journey: ${covering.titleEn}`,
            zh ? `Journey: ${covering.titleEn}` : `进入旅程：${covering.title}`,
            zh
              ? `「${covering.title}」把这件事件放进了完整的时空叙事。`
              : `"${covering.titleEn}" places this event in a full spatial-temporal narrative.`,
            zh ? `Start this journey` : `开始这段旅程`,
            [],
            journeyActions(covering.id),
            covering.id,
          ),
        );
      }
    }
  }

  /* 3. Person context: deepen (their events) */
  if (context.personId && out.length < limit) {
    const p = personById.get(context.personId);
    if (p) {
      const theirEvents = events
        .filter((e) => e.participants.includes(p.id))
        .sort((a, b) => a.year - b.year)
        .slice(0, 1);
      for (const ev of theirEvents) {
        push(
          make(
            "deepen",
            ev.id,
            zh ? `参与事件：${ev.chineseTitle}` : `Key event: ${ev.title}`,
            zh ? `Key event: ${ev.title}` : `参与事件：${ev.chineseTitle}`,
            zh
              ? `${p.chineseName} 参与了「${ev.chineseTitle}」（${ev.year} 年）——从事件看人物，从人物看时代。`
              : `${p.name} took part in "${ev.title}" (${ev.year}) — see the person through the event, and the era through the person.`,
            zh ? `An event they took part in` : `其参与的事件`,
            [ref("event", ev.id)],
            eventActions(ev.id),
          ),
        );
      }
    }
  }

  /* 4. Year context: deepen (that year's events) + continue (featured journey) */
  if (context.year !== null && out.length < limit) {
    const yearEvents = events
      .filter(
        (e) =>
          e.year === context.year &&
          e.significance >= 4 &&
          e.id !== context.eventId, // never recommend the event itself
      )
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 1);
    for (const ev of yearEvents) {
      push(
        make(
          "deepen",
          ev.id,
          zh ? `${ev.chineseTitle}（${ev.year} 年）` : `${ev.title} (${ev.year})`,
          zh ? `${ev.title} (${ev.year})` : `${ev.chineseTitle}（${ev.year} 年）`,
          zh
            ? `${ev.year} 年是理解这段历史的关键节点——「${ev.chineseTitle}」值得深入。`
            : `${ev.year} is a key node for this era — "${ev.title}" deserves a closer look.`,
            zh ? `A key event of ${ev.year}` : `${ev.year} 年的关键事件`,
          [ref("event", ev.id)],
          eventActions(ev.id),
        ),
      );
    }
    // continue: featured journey matching the year window
    const featured = getFeaturedJourneys(3).find(
      (j) => j.startYear <= (context.year ?? 0) && (context.year ?? 0) <= j.endYear,
    );
    if (featured && out.length < limit) {
      push(
        make(
          "continue",
          featured.id,
          zh ? `进入旅程：${featured.title}` : `Journey: ${featured.titleEn}`,
          zh ? `Journey: ${featured.titleEn}` : `进入旅程：${featured.title}`,
          zh
            ? `「${featured.title}」覆盖了 ${featured.startYear}–${featured.endYear} 年——正好包含你现在看的 ${context.year} 年。`
            : `"${featured.titleEn}" covers ${featured.startYear}–${featured.endYear} — right where you are looking (${context.year}).`,
          zh ? `A journey covering this year` : `覆盖这一年的旅程`,
          [],
          journeyActions(featured.id),
          featured.id,
        ),
      );
    }
  }

  /* 5. Empty context: featured journeys only */
  if (out.length === 0) {
    const featured = getFeaturedJourneys(limit);
    for (const j of featured) {
      push(
        make(
          "continue",
          j.id,
          zh ? j.title : j.titleEn,
          zh ? j.titleEn : j.title,
          zh
            ? `还没有明确的探索方向？从「${j.title}」开始——它会带你走进一个完整的历史世界。`
            : `Not sure where to start? Begin with "${j.titleEn}" — it walks you through a complete historical world.`,
          zh ? `Recommended starting point` : `推荐起点`,
          [],
          journeyActions(j.id),
          j.id,
        ),
      );
    }
  }

  return out.slice(0, limit);
}
