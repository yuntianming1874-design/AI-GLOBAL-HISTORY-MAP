/**
 * V0.3 Phase 3A — Recall / Review tests.
 *
 *  - Recall questions come from the journey (sourceStepIds valid)
 *  - expected entities all exist in the seed (no fabricated ids)
 *  - evaluator is synonym-tolerant (bilingual, aliases, paraphrases):
 *    correct / partial / needs_review — never a bare "wrong"
 */
import {
  evaluateRecallAnswer,
  getRecallQuestions,
  RECALL_QUESTIONS,
} from "../src/lib/learning/review";
import { getJourneyBySlug } from "../src/lib/learning/journeyRepository";
import { isKnownEntityId } from "../src/lib/learning/journeyRepository";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(`${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
}

const journey = getJourneyBySlug("talas-751")!;
const questions = getRecallQuestions("talas-751");

/* ── 数据完整性：问题来自 Journey ─────────────────────────────────── */

check("5 questions for talas-751", questions.length, 5);
for (const q of questions) {
  check(`${q.id} journeyId`, q.journeyId, "talas-751");
  check(`${q.id} question non-empty`, q.question.length > 0, true);
  check(`${q.id} questionEn non-empty`, q.questionEn.length > 0, true);
  check(`${q.id} sourceStepIds non-empty`, q.sourceStepIds.length > 0, true);
  // sourceStepIds must be real steps of THIS journey
  for (const sid of q.sourceStepIds) {
    check(`${q.id} source ${sid} is a journey step`, journey.steps.some((s) => s.id === sid), true);
  }
  // expected entities must exist in the seed
  for (const ref of q.expectedEntities ?? []) {
    check(`${q.id} entity ${ref.id} known`, isKnownEntityId(ref.id), true);
  }
  // synonyms keys must be known entities
  for (const id of Object.keys(q.entitySynonyms ?? {})) {
    check(`${q.id} synonym key ${id} known`, isKnownEntityId(id), true);
  }
}
check("questions carry feedback hints", questions.every((q) => q.feedbackHint.length > 0 && q.feedbackHintEn.length > 0), true);

/* ── Q1 (fact): 751 ───────────────────────────────────────────────── */

const q1 = questions[0]!;
check("Q1 type fact", q1.type, "fact");
check("Q1 zh correct (751)", evaluateRecallAnswer(q1, "751", "zh").grade, "correct");
check("Q1 zh correct (751 年)", evaluateRecallAnswer(q1, "怛罗斯之战发生在 751 年", "zh").grade, "correct");
check("Q1 zh correct (公元751年)", evaluateRecallAnswer(q1, "公元751年", "zh").grade, "correct");
check("Q1 en correct (751)", evaluateRecallAnswer(q1, "751", "en").grade, "correct");
check("Q1 needs_review (750)", evaluateRecallAnswer(q1, "750", "zh").grade, "needs_review");
check("Q1 needs_review (empty)", evaluateRecallAnswer(q1, "", "zh").grade, "needs_review");
check("Q1 needs_review (irrelevant)", evaluateRecallAnswer(q1, "在长安发生了政变", "zh").grade, "needs_review");
check("Q1 feedback constructive (no bare 错误)", evaluateRecallAnswer(q1, "750", "zh").feedback.includes("错误") === false, true);

/* ── Q2 (relationship): Tang + Abbasid ────────────────────────────── */

const q2 = questions[1]!;
check("Q2 type relationship", q2.type, "relationship");
check("Q2 entities both civilizations", q2.expectedEntities?.length, 2);
check("Q2 zh correct (唐朝与阿拔斯王朝)", evaluateRecallAnswer(q2, "唐朝与阿拔斯王朝", "zh").grade, "correct");
check("Q2 zh correct (唐朝和阿拉伯帝国)", evaluateRecallAnswer(q2, "唐朝和阿拉伯帝国", "zh").grade, "correct");
check("Q2 zh correct (大唐与阿拉伯)", evaluateRecallAnswer(q2, "大唐与阿拉伯", "zh").grade, "correct");
check("Q2 en correct (Tang and the Abbasids)", evaluateRecallAnswer(q2, "Tang and the Abbasids", "en").grade, "correct");
check("Q2 partial (只提唐朝)", evaluateRecallAnswer(q2, "唐朝", "zh").grade, "partial");
check("Q2 partial (只提阿拔斯)", evaluateRecallAnswer(q2, "阿拔斯", "zh").grade, "partial");
check("Q2 needs_review (无关)", evaluateRecallAnswer(q2, "日本奈良", "zh").grade, "needs_review");
check("Q2 feedback mentions missing concept", evaluateRecallAnswer(q2, "唐朝", "zh").missedLabels.length, 1);

/* ── Q4 (fact): 怛逻斯河 ──────────────────────────────────────────── */

const q4 = questions[3]!;
check("Q4 type fact", q4.type, "fact");
check("Q4 zh correct (怛逻斯河)", evaluateRecallAnswer(q4, "怛逻斯河", "zh").grade, "correct");
check("Q4 zh correct (塔拉斯河)", evaluateRecallAnswer(q4, "塔拉斯河", "zh").grade, "correct");
check("Q4 en correct (Talas River)", evaluateRecallAnswer(q4, "the Talas River", "en").grade, "correct");
check("Q4 needs_review (黄河)", evaluateRecallAnswer(q4, "黄河", "zh").grade, "needs_review");

/* ── Q5 (relationship): 造纸术西传 ────────────────────────────────── */

const q5 = questions[4]!;
check("Q5 type relationship", q5.type, "relationship");
check("Q5 zh correct (造纸术)", evaluateRecallAnswer(q5, "造纸术", "zh").grade, "correct");
check("Q5 zh correct (纸)", evaluateRecallAnswer(q5, "纸的技术", "zh").grade, "correct");
check("Q5 en correct (paper-making)", evaluateRecallAnswer(q5, "paper-making", "en").grade, "correct");
check("Q5 partial (丝绸)", evaluateRecallAnswer(q5, "丝绸", "zh").grade, "needs_review");
check("Q5 feedback constructive", evaluateRecallAnswer(q5, "丝绸", "zh").feedback.includes("错误") === false, true);

/* ── Q3 (causal): 中亚 / 扩张 / 丝绸之路 ─────────────────────────── */

const q3 = questions[2]!;
check("Q3 type causal", q3.type, "causal");
check("Q3 zh correct (全命中)", evaluateRecallAnswer(q3, "唐朝在中亚的扩张止步，丝绸之路上的知识交流持续", "zh").grade, "correct");
check("Q3 zh partial (丝绸之路)", evaluateRecallAnswer(q3, "丝绸之路上的交流", "zh").grade, "partial");
check("Q3 en partial (Silk Road)", evaluateRecallAnswer(q3, "Silk Road exchange", "en").grade, "partial");
check("Q3 en correct", evaluateRecallAnswer(q3, "Tang expansion into Central Asia and Silk Road exchange", "en").grade, "correct");
check("Q3 needs_review (不知道)", evaluateRecallAnswer(q3, "我不知道", "zh").grade, "needs_review");

/* ── evaluator 宽容性 ─────────────────────────────────────────────── */

// partial feedback is constructive + includes the hint, never "错误"
const partial = evaluateRecallAnswer(q2, "唐朝", "zh");
check("partial feedback contains hint", partial.feedback.includes("这场战役的双方"), true);
check("partial feedback is constructive", partial.feedback.includes("你抓住了一部分"), true);
// correct feedback never punishes
check("correct feedback gentle", evaluateRecallAnswer(q1, "751", "zh").feedback.includes("很好"), true);
// zh/en names interchangeable for entities
check("en name accepted in zh answer", evaluateRecallAnswer(q2, "Tang Dynasty and Abbasid Caliphate", "zh").grade, "correct");
// alias from the alias registry counts (怛罗斯之战 → e-751-talas is an event alias;
// here we test a civilization synonym via entitySynonyms)
check("synonym 阿巴斯 accepted", evaluateRecallAnswer(q2, "唐朝与阿巴斯", "zh").grade, "correct");

/* ── 问题不引用 Journey 之外的事实 ─────────────────────────────────── */

for (const q of RECALL_QUESTIONS) {
  const qJourney = getJourneyBySlug(q.journeyId);
  const qStepIds = new Set(qJourney?.steps.map((s) => s.id) ?? []);
  check(
    `all sources inside journey (${q.id})`,
    q.sourceStepIds.every((id) => qStepIds.has(id)),
    true,
  );
}

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
