/**
 * V0.3 Phase 3A — Recall / Review types.
 *
 * Recall questions are CURATED against the journey definition: every
 * question must be answerable from facts the journey already showed
 * (sourceStepIds reference journey steps). Evaluator grading is a
 * retrieval-practice style (correct / partial / needs_review), NOT an
 * exam — synonyms, bilingual names and reasonable paraphrases all count.
 */
import type { HistoryEntityRef } from "../explorer";

export type RecallQuestionType = "fact" | "relationship" | "causal";

export type RecallGrade = "correct" | "partial" | "needs_review";

export interface RecallQuestion {
  id: string;
  journeyId: string;
  question: string;
  questionEn: string;
  type: RecallQuestionType;
  /** Entities the answer should mention (all must exist in the seed). */
  expectedEntities?: HistoryEntityRef[];
  /** Per-entity accepted synonyms (e.g. c-abbasid → 阿拉伯/阿拔斯). */
  entitySynonyms?: Record<string, string[]>;
  /** Keyword groups: each group = one concept, any term in it counts.
   *  (expectedKeywords kept for spec compatibility — each keyword is
   *  treated as its own single-term group.) */
  keywordGroups?: string[][];
  expectedKeywords?: string[];
  /** Journey steps that contain the knowledge this question tests. */
  sourceStepIds: string[];
  /** Constructive hint shown on partial/needs_review (never "错误"). */
  feedbackHint: string;
  feedbackHintEn: string;
}

export interface RecallAnswerResult {
  questionId: string;
  grade: RecallGrade;
  /** Constructive feedback for the user. */
  feedback: string;
  /** Human labels of concepts that were hit (for feedback). */
  matchedLabels: string[];
  /** Human labels of concepts that were missed (for feedback). */
  missedLabels: string[];
}
