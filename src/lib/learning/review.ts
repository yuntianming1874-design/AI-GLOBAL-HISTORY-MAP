/**
 * V0.3 Phase 3A — Recall / Review engine.
 *
 * - RECALL_QUESTIONS: curated per journey (751 World: 3 questions).
 *   Every question's sourceStepIds must exist in the journey, and every
 *   expected entity must exist in the seed (fail-fast at load).
 * - evaluateRecallAnswer: retrieval-practice grading (correct / partial /
 *   needs_review). Synonym-tolerant: bilingual names, aliases, entity
 *   synonyms (entitySynonyms) and keyword groups all count as hits.
 */
import type { Locale } from "../i18n";
import { isValidEntityRef } from "./journeyRepository";
import { getJourneyBySlug, getJourneyStep } from "./journeyRepository";
import type {
  RecallAnswerResult,
  RecallGrade,
  RecallQuestion,
} from "./reviewTypes";

import {
  civilizations,
  events,
  locations,
  people,
} from "@/data/seed";
import { EXTRA_ALIASES } from "@/data/seed/aliases";

/* ── entity name registry (single source: seed) ────────────────────── */

const nameById = new Map<string, { name: string; chineseName: string }>();
for (const e of events) nameById.set(e.id, { name: e.title, chineseName: e.chineseTitle });
for (const p of people) nameById.set(p.id, { name: p.name, chineseName: p.chineseName });
for (const c of civilizations) nameById.set(c.id, { name: c.name, chineseName: c.chineseName });
for (const l of locations) nameById.set(l.id, { name: l.name, chineseName: l.chineseName });

const aliasByEntity = new Map<string, string[]>();
for (const a of EXTRA_ALIASES) {
  const list = aliasByEntity.get(a.entityId) ?? [];
  list.push(a.alias);
  aliasByEntity.set(a.entityId, list);
}

/* ── curated recall questions (751 World journey) ──────────────────── */

export const RECALL_QUESTIONS: RecallQuestion[] = [
  {
    id: "talas-751-q1",
    journeyId: "talas-751",
    question: "怛罗斯之战发生在哪一年？",
    questionEn: "In which year did the Battle of Talas take place?",
    type: "fact",
    expectedKeywords: ["751"],
    sourceStepIds: ["talas-751-step-2"],
    feedbackHint: "回忆一下：怛罗斯之战发生在 751 年（约 7–8 月，怛逻斯河畔）。",
    feedbackHintEn:
      "Recall: the Battle of Talas took place in 751 (roughly July–August, at the Talas River).",
  },
  {
    id: "talas-751-q2",
    journeyId: "talas-751",
    question: "怛罗斯之战涉及哪些主要政治力量？",
    questionEn: "Which major political forces were involved in the Battle of Talas?",
    type: "relationship",
    expectedEntities: [
      { id: "c-tang", type: "civilization" },
      { id: "c-abbasid", type: "civilization" },
    ],
    entitySynonyms: {
      "c-abbasid": ["阿拔斯", "阿拉伯", "阿拉伯帝国", "阿巴斯", "abbasid"],
    },
    sourceStepIds: ["talas-751-step-2", "talas-751-step-3"],
    feedbackHint:
      "这场战役的双方主要是唐朝（安西军）与阿拔斯王朝（及其在中亚的盟军）——想一想丝绸之路两端的两个大帝国。",
    feedbackHintEn:
      "The two main sides were Tang China (the Anxi army) and the Abbasid Caliphate (with its Central Asian allies) — think of the two great empires at the ends of the Silk Road.",
  },
  {
    id: "talas-751-q3",
    journeyId: "talas-751",
    question: "为什么 751 年对于理解唐朝与中亚的关系很重要？",
    questionEn: "Why is 751 important for understanding the relationship between Tang China and Central Asia?",
    type: "causal",
    keywordGroups: [
      ["中亚", "Central Asia"],
      ["扩张", "expansion"],
      ["丝绸之路", "Silk Road"],
    ],
    sourceStepIds: [
      "talas-751-step-1",
      "talas-751-step-2",
      "talas-751-step-5",
    ],
    feedbackHint:
      "想一想唐朝向西的扩张在哪里停下、丝绸之路上的知识交流，以及中国与伊斯兰世界在中亚的长期共存。",
    feedbackHintEn:
      "Think about where Tang westward expansion halted, the exchange of knowledge along the Silk Road, and the long coexistence of the Chinese and Islamic worlds in Central Asia.",
  },
  {
    id: "talas-751-q4",
    journeyId: "talas-751",
    question: "怛罗斯之战发生在哪条河畔？",
    questionEn: "At which river did the Battle of Talas take place?",
    type: "fact",
    keywordGroups: [
      ["怛逻斯河", "怛罗斯河", "塔拉斯河", "Talas River"],
    ],
    sourceStepIds: ["talas-751-step-2"],
    feedbackHint: "回忆一下：战役发生在怛逻斯河（今哈萨克斯坦与吉尔吉斯斯坦交界一带）畔。",
    feedbackHintEn:
      "Recall: the battle took place at the Talas River (on the modern Kyrgyzstan–Kazakhstan frontier).",
  },
  {
    id: "talas-751-q5",
    journeyId: "talas-751",
    question: "传说中，哪项技术随被俘工匠经丝绸之路传向西方？",
    questionEn: "According to legend, which craft spread westward along the Silk Road with captured artisans?",
    type: "relationship",
    keywordGroups: [
      ["造纸术", "纸", "paper"],
    ],
    sourceStepIds: ["talas-751-step-2", "talas-751-step-5"],
    feedbackHint: "想一想怛罗斯之战著名的文化后果——被俘的工匠把造纸术带到撒马尔罕，再传向伊斯兰世界与欧洲。",
    feedbackHintEn:
      "Think of Talas' famous cultural consequence — captured artisans carried paper-making to Samarkand, and from there across the Islamic world and into Europe.",
  },
  {
    id: "an-lushan-q1",
    journeyId: "an-lushan-rebellion",
    question: "安史之乱爆发于哪一年？",
    questionEn: "In which year did the An Lushan Rebellion break out?",
    type: "fact",
    expectedKeywords: ["755"],
    sourceStepIds: ["an-lushan-rebellion-step-2"],
    feedbackHint: "回忆一下：755 年 12 月，安禄山从范阳起兵。",
    feedbackHintEn: "Recall: in December 755, An Lushan rose from Fanyang.",
  },
  {
    id: "an-lushan-q2",
    journeyId: "an-lushan-rebellion",
    question: "安史之乱涉及哪些主要历史人物？",
    questionEn: "Which key historical figures were involved in the An Lushan Rebellion?",
    type: "relationship",
    expectedEntities: [
      { id: "p-an-lushan", type: "person" },
      { id: "p-xuanzong", type: "person" },
    ],
    entitySynonyms: {
      "p-an-lushan": ["安禄山", "禄山"],
      "p-xuanzong": ["唐玄宗", "玄宗", "李隆基", "明皇"],
    },
    sourceStepIds: ["an-lushan-rebellion-step-2", "an-lushan-rebellion-step-3"],
    feedbackHint: "叛乱者是安禄山；被卷入漩涡的还有唐玄宗（出逃）、杨贵妃（马嵬遇难）与平叛的郭子仪。",
    feedbackHintEn: "The rebel was An Lushan; drawn into the vortex were Xuanzong (who fled), Yang Guifei (who died at Mawei) and the loyalist general Guo Ziyi.",
  },
  {
    id: "an-lushan-q3",
    journeyId: "an-lushan-rebellion",
    question: "为什么说安史之乱是唐朝由盛转衰的转折点？",
    questionEn: "Why is the An Lushan Rebellion seen as the turning point of Tang decline?",
    type: "causal",
    keywordGroups: [
      ["由盛转衰", "转折点", "turning point"],
      ["藩镇", "军事将领", "military governors"],
      ["两京", "长安", "Chang'an"],
    ],
    sourceStepIds: ["an-lushan-rebellion-step-2", "an-lushan-rebellion-step-5"],
    feedbackHint: "想一想两京沦陷、皇权动摇，以及乱后藩镇割据与 763–907 年的衰亡长链。",
    feedbackHintEn: "Think of the fallen capitals, the shaken throne, and the long chain of decline (763–907) opened by the rebellion.",
  },
  {
    id: "li-bai-q1",
    journeyId: "li-bai-life",
    question: "李白出生于哪一年？",
    questionEn: "In which year was Li Bai born?",
    type: "fact",
    expectedKeywords: ["701"],
    sourceStepIds: ["li-bai-life-step-1"],
    feedbackHint: "回忆一下：李白生于 701 年（主流说法；一说 700 年）。",
    feedbackHintEn: "Recall: Li Bai was born in 701 (the mainstream date; some say 700).",
  },
  {
    id: "li-bai-q2",
    journeyId: "li-bai-life",
    question: "742 年李白进入长安后，担任了什么职务？",
    questionEn: "What post did Li Bai hold after entering Chang'an in 742?",
    type: "fact",
    keywordGroups: [
      ["翰林供奉", "翰林", "Hanlin"],
    ],
    sourceStepIds: ["li-bai-life-step-2"],
    feedbackHint: "回忆一下：742–744 年，李白供奉翰林——这是他距离权力中心最近的时光。",
    feedbackHintEn: "Recall: in 742–744 Li Bai served in the Hanlin Academy — the closest he ever stood to the center of power.",
  },
  {
    id: "li-bai-q3",
    journeyId: "li-bai-life",
    question: "李白与哪位诗人相遇并结为挚友，合称“李杜”？",
    questionEn: "Which poet met Li Bai and became his lifelong friend — the pair known as 'Li Du'?",
    type: "relationship",
    expectedEntities: [{ id: "p-du-fu", type: "person" }],
    entitySynonyms: {
      "p-du-fu": ["杜甫", "子美", "少陵"],
    },
    sourceStepIds: ["li-bai-life-step-3"],
    feedbackHint: "回忆一下：744 年前后，李白在洛阳一带与杜甫相遇——两位并称“李杜”。",
    feedbackHintEn: "Recall: around 744, near Luoyang, Li Bai met Du Fu — together they are known as 'Li Du'.",
  },
];

/* ── validation (fail-fast: questions must stay inside the journey) ── */

function validateQuestions(): void {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const q of RECALL_QUESTIONS) {
    if (seen.has(q.id)) problems.push(`duplicate question id ${q.id}`);
    seen.add(q.id);
    const journey = getJourneyBySlug(q.journeyId);
    if (!journey) {
      problems.push(`${q.id}: unknown journey ${q.journeyId}`);
      continue;
    }
    for (const stepId of q.sourceStepIds) {
      if (!getJourneyStep(journey, Number(stepId.split("-").pop()))) {
        problems.push(`${q.id}: sourceStepIds contains unknown step ${stepId}`);
      }
      if (!journey.steps.some((s) => s.id === stepId)) {
        problems.push(`${q.id}: sourceStepIds contains non-step id ${stepId}`);
      }
    }
    for (const ref of q.expectedEntities ?? []) {
      if (!isValidEntityRef(ref)) {
        problems.push(`${q.id}: unknown or type-mismatched entity ${ref.type}:${ref.id}`);
      }
    }
    for (const id of Object.keys(q.entitySynonyms ?? {})) {
      if (!nameById.has(id)) problems.push(`${q.id}: synonym key ${id} is not a known entity`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`Recall questions validation failed:\n- ${problems.join("\n- ")}`);
  }
}
validateQuestions();

/* ── queries ───────────────────────────────────────────────────────── */

export function getRecallQuestions(journeyId: string): RecallQuestion[] {
  return RECALL_QUESTIONS.filter((q) => q.journeyId === journeyId);
}

/* ── evaluation ────────────────────────────────────────────────────── */

interface ConceptGroup {
  label: string;
  terms: string[];
}

function entityConceptGroups(q: RecallQuestion): ConceptGroup[] {
  const out: ConceptGroup[] = [];
  for (const ref of q.expectedEntities ?? []) {
    const n = nameById.get(ref.id);
    const terms = [
      n?.name,
      n?.chineseName,
      ref.id,
      ...(aliasByEntity.get(ref.id) ?? []),
      ...(q.entitySynonyms?.[ref.id] ?? []),
    ].filter((t): t is string => Boolean(t && t.length > 0));
    out.push({
      label: n ? (q.questionEn ? n.chineseName ?? n.name : n.name) : ref.id,
      terms: [...new Set(terms)],
    });
  }
  return out;
}

function keywordConceptGroups(q: RecallQuestion): ConceptGroup[] {
  const out: ConceptGroup[] = [];
  for (const group of q.keywordGroups ?? []) {
    if (group.length > 0) out.push({ label: group[0], terms: group });
  }
  for (const kw of q.expectedKeywords ?? []) {
    out.push({ label: kw, terms: [kw] });
  }
  return out;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[。，、！？；：,.!?;:\s]+/g, " ").trim();
}

/**
 * Synonym-tolerant term matching:
 *  - Chinese terms match by substring ("唐朝" in "唐朝与阿拉伯")
 *  - English terms match by any single token ("Tang" in "Tang and the
 *    Abbasids" — "Tang Dynasty" group word counts via its token "tang")
 */
function termHit(ans: string, term: string): boolean {
  const t = normalize(term);
  if (t.length === 0) return false;
  if (/[\u4e00-\u9fff]/.test(t)) return ans.includes(t);
  const tokens = t.split(" ").filter((x) => x.length > 1);
  return tokens.some((tok) => ans.includes(tok));
}

/** concept label in the user's locale (zh → chineseName first). */
function conceptLabel(label: string, locale: Locale): string {
  return locale === "zh" ? label : label;
}

/**
 * Retrieval-practice evaluation (not an exam):
 *  - every concept group hit counts (entity names/chineseName/aliases/
 *    synonyms OR keyword-group terms — bilingual accepted)
 *  - correct = all groups hit · partial = ≥ half · needs_review = less
 *  - feedback is constructive, never a bare "wrong"
 */
export function evaluateRecallAnswer(
  question: RecallQuestion,
  answer: string,
  locale: Locale = "zh",
): RecallAnswerResult {
  const ans = normalize(answer);
  const groups = [
    ...entityConceptGroups(question),
    ...keywordConceptGroups(question),
  ];
  const matchedLabels: string[] = [];
  const missedLabels: string[] = [];
  if (ans.length === 0) {
    return {
      questionId: question.id,
      grade: "needs_review",
      feedback: locale === "zh" ? question.feedbackHint : question.feedbackHintEn,
      matchedLabels: [],
      missedLabels: groups.map((g) => conceptLabel(g.label, locale)),
    };
  }
  for (const g of groups) {
    const hit = g.terms.some((t) => termHit(ans, t));
    if (hit) matchedLabels.push(conceptLabel(g.label, locale));
    else missedLabels.push(conceptLabel(g.label, locale));
  }
  const total = groups.length;
  const hits = matchedLabels.length;
  // retrieval-practice grading: all → correct, some → partial, none → needs_review
  let grade: RecallGrade;
  if (total === 0 || hits === total) grade = "correct";
  else if (hits > 0) grade = "partial";
  else grade = "needs_review";

  let feedback: string;
  if (grade === "correct") {
    feedback =
      locale === "zh"
        ? "很好——你抓住了这个问题的核心。"
        : "Great — you have grasped the core of this question.";
  } else if (grade === "partial") {
    const missed = missedLabels.slice(0, 3).join(locale === "zh" ? "、" : ", ");
    feedback =
      locale === "zh"
        ? `你抓住了一部分（${matchedLabels.join("、")}），但还可以补充：${missed}。${question.feedbackHint}`
        : `You got part of it (${matchedLabels.join(", ")}), but you could also mention: ${missed}. ${question.feedbackHintEn}`;
  } else {
    feedback =
      locale === "zh"
        ? `${question.feedbackHint} 建议重新查看时间轴、地图与相关人物，再回来试试。`
        : `${question.feedbackHintEn} Consider revisiting the timeline, map and related people, then try again.`;
  }
  return { questionId: question.id, grade, feedback, matchedLabels, missedLabels };
}
