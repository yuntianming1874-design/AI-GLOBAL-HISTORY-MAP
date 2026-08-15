/**
 * V0.3 Phase 3D — AI Historical Navigator types.
 *
 * A NavigatorRecommendation is ALWAYS built by the deterministic local
 * engine (lib/learning/navigator.ts) — never by the LLM. Every entityRef
 * and journeyId is validated against the seed / journey repository
 * (fail-closed). The LLM only produces the Answer; recommendations are
 * the Navigator's separate output.
 */
import type {
  HistoryEntityRef,
  HistoryNavigationAction,
} from "../explorer";

export type RecommendationType = "deepen" | "cause" | "compare" | "continue";

export interface NavigatorRecommendation {
  /** Stable id (e.g. "deepen:e-751-talas", "continue:talas-751-step-3"). */
  id: string;
  titleZh: string;
  titleEn: string;
  /** Why this next step — grounded in the current context. */
  reasonZh: string;
  reasonEn: string;
  type: RecommendationType;
  /** All refs validated against the seed registry (fail-closed). */
  entityRefs: HistoryEntityRef[];
  /** Only present when the journey exists in the repository. */
  journeyId?: string;
  /** Actions built from validated entities only. */
  actions: HistoryNavigationAction[];
}
