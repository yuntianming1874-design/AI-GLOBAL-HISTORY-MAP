/**
 * V0.2 — Unified history exploration state & navigation.
 *
 * The single source of truth for "what the user is looking at" is the URL
 * search params (shareable, refresh-safe, no state library):
 *   ?year=751&civ=c-tang&event=e-751-talas&person=p-li-bai&loc=loc-changan
 *
 *  - ExplorerProvider (React context) reads params → HistoryContext,
 *    and every page/component responds via effects.
 *  - dispatchHistoryAction() is the ONLY navigation entry point used by
 *    all modules (Timeline / Map / People / Events / AI Assistant).
 */

export type HistoryEntityType =
  | "event"
  | "person"
  | "civilization"
  | "location"
  | "territory";

export interface HistoryEntityRef {
  id: string;
  type: HistoryEntityType;
}

/** Entity reference with a display label (returned by the AI assistant). */
export interface HistoryEntityLink extends HistoryEntityRef {
  label?: string;
}

export interface HistoryContext {
  year: number | null;
  /** Focus range (inclusive) — used by the timeline focus. */
  startYear: number | null;
  endYear: number | null;
  eventId: string | null;
  personId: string | null;
  civilizationId: string | null;
  locationId: string | null;
  /** V0.3: active Learning Journey (slug id, e.g. "talas-751"). */
  journeyId: string | null;
  /** V0.3: 1-based step index within the journey. */
  journeyStep: number | null;
}

export const EMPTY_CONTEXT: HistoryContext = {
  year: null,
  startYear: null,
  endYear: null,
  eventId: null,
  personId: null,
  civilizationId: null,
  locationId: null,
  journeyId: null,
  journeyStep: null,
};

export interface HistoryExplorerState {
  context: HistoryContext;
  setYear(year: number | null): void;
  setYearRange(start: number | null, end: number | null): void;
  selectCivilization(id: string | null): void;
  selectEvent(id: string | null): void;
  selectPerson(id: string | null): void;
  selectLocation(id: string | null): void;
  clearHistoryContext(): void;
}

export type HistoryNavigationAction =
  | { type: "OPEN_EVENT"; id: string }
  | { type: "OPEN_PERSON"; id: string }
  | { type: "OPEN_LOCATION"; id: string }
  | { type: "SET_YEAR"; year: number }
  | { type: "FOCUS_CIVILIZATION"; id: string }
  | {
      type: "FOCUS_TIMELINE";
      year?: number;
      startYear?: number;
      endYear?: number;
      entityId?: string;
      entityType?: "event" | "person";
    }
  | { type: "FOCUS_MAP"; locationId: string; eventId?: string; year?: number }
  | { type: "FOCUS_PERSON_GRAPH"; personId: string }
  /** V0.3: enter a Learning Journey at its first step (URL: ?journey=&step=1). */
  | { type: "START_JOURNEY"; journeyId: string }
  /** V0.3: jump to a specific journey step (URL: ?journey=&step=N). */
  | { type: "SET_JOURNEY_STEP"; journeyId: string; step: number };

/* ── URL parameter codec ───────────────────────────────────────────── */

export const CONTEXT_PARAMS: Record<keyof HistoryContext, string> = {
  year: "year",
  startYear: "start",
  endYear: "end",
  civilizationId: "civ",
  eventId: "event",
  personId: "person",
  locationId: "loc",
  journeyId: "journey",
  journeyStep: "step",
};

/** Non-context params that are allowed to survive the whitelist (i18n). */
export const EXTRA_ALLOWED_PARAMS = ["lang", "review"] as const;

/** Entity ids are slugs: [A-Za-z0-9_-]+ — anything else is dropped. */
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const YEAR_MIN = 500;
const YEAR_MAX = 1000;

export function paramsToContext(
  params: URLSearchParams | null,
): HistoryContext {
  const parseYear = (raw: string | null): number | null => {
    const n = Number.parseInt(raw ?? "", 10);
    return Number.isFinite(n) ? Math.min(YEAR_MAX, Math.max(YEAR_MIN, n)) : null;
  };
  const parseStep = (raw: string | null): number | null => {
    const n = Number.parseInt(raw ?? "", 10);
    return Number.isFinite(n) && n >= 1 && n <= 99 ? n : null;
  };
  return {
    year: parseYear(params?.get("year") ?? null),
    startYear: parseYear(params?.get("start") ?? null),
    endYear: parseYear(params?.get("end") ?? null),
    civilizationId: params?.get("civ") || null,
    eventId: params?.get("event") || null,
    personId: params?.get("person") || null,
    locationId: params?.get("loc") || null,
    journeyId: params?.get("journey") || null,
    journeyStep: parseStep(params?.get("step") ?? null),
  };
}

/** Merge a partial context patch into existing params (returns a new copy).
 *  Whitelist enforcement: only known keys are written, id values must match
 *  the slug pattern, years are clamped to the supported range. */
export function patchContextParams(
  params: URLSearchParams,
  patch: Partial<HistoryContext>,
): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  // drop anything not in the whitelist (injection guard)
  const allowed = new Set([...Object.values(CONTEXT_PARAMS), ...EXTRA_ALLOWED_PARAMS]);
  for (const key of [...next.keys()]) {
    if (!allowed.has(key)) next.delete(key);
  }
  for (const [key, value] of Object.entries(patch) as [
    keyof HistoryContext,
    string | number | null | undefined,
  ][]) {
    const param = CONTEXT_PARAMS[key];
    if (value === null || value === undefined || value === "") {
      next.delete(param);
      continue;
    }
    if (key === "year" || key === "startYear" || key === "endYear") {
      const year = Number(value);
      if (Number.isFinite(year)) {
        next.set(param, String(Math.min(YEAR_MAX, Math.max(YEAR_MIN, Math.round(year)))));
      }
      continue;
    }
    if (key === "journeyStep") {
      const step = Number(value);
      if (Number.isFinite(step) && step >= 1 && step <= 99) {
        next.set(param, String(Math.round(step)));
      }
      continue;
    }
    const str = String(value);
    if (ID_PATTERN.test(str)) next.set(param, str);
    // invalid ids are silently dropped (whitelist)
  }
  return next;
}

/** True when the URL contains params outside the context whitelist. */
export function hasUnknownParams(params: URLSearchParams | null): boolean {
  if (!params) return false;
  const allowed = new Set([...Object.values(CONTEXT_PARAMS), ...EXTRA_ALLOWED_PARAMS]);
  return [...params.keys()].some((key) => !allowed.has(key));
}

/** Keep only whitelisted, valid context params (sanitized copy).
 *  EXTRA_ALLOWED_PARAMS (lang, review) survive sanitization too —
 *  otherwise a URL-triggered clean would drop the review position. */
export function sanitizeContextParams(
  params: URLSearchParams | null,
): URLSearchParams {
  const next = patchContextParams(new URLSearchParams(), paramsToContext(params));
  if (params) {
    for (const key of EXTRA_ALLOWED_PARAMS) {
      const v = params.get(key);
      if (v) next.set(key, v);
    }
  }
  return next;
}

export function hrefWithContext(
  pathname: string,
  params: URLSearchParams,
  patch: Partial<HistoryContext>,
): string {
  const qs = patchContextParams(params, patch).toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Human label for an action button (AI assistant suggested actions). */
export function actionLabel(
  action: HistoryNavigationAction,
  locale: "en" | "zh" = "en",
): string {
  // localized via the i18n dictionary
  switch (action.type) {
    case "OPEN_EVENT":
      return locale === "zh" ? "打开事件" : "Open event";
    case "OPEN_PERSON":
      return locale === "zh" ? "打开人物" : "Open person";
    case "OPEN_LOCATION":
      return locale === "zh" ? "在地图上查看" : "View on map";
    case "SET_YEAR":
      return locale === "zh" ? `探索 ${action.year}` : `Explore ${action.year}`;
    case "FOCUS_CIVILIZATION":
      return locale === "zh" ? "聚焦文明" : "Focus civilization";
    case "FOCUS_TIMELINE":
      return locale === "zh" ? "查看时间轴" : "View timeline";
    case "FOCUS_MAP":
      return locale === "zh" ? "在地图上查看" : "View on map";
    case "FOCUS_PERSON_GRAPH":
      return locale === "zh" ? "查看人物图谱" : "View people graph";
    case "START_JOURNEY":
      return locale === "zh" ? "开始旅程" : "Start journey";
    case "SET_JOURNEY_STEP":
      return locale === "zh" ? `前往第 ${action.step} 步` : `Go to step ${action.step}`;
  }
}
