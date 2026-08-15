/**
 * V0.3 Phase 3C — Featured Journeys tests.
 *
 *  - featured/status fields exist on the journey model
 *  - homepage list comes from the repository (never hard-coded)
 *  - ordering: published → featured → difficulty → estimatedMinutes
 *  - draft journeys never surface
 */
import {
  getFeaturedJourneys,
  getJourneys,
  journeyOrderKey,
} from "../src/lib/learning/journeyRepository";
import type { Journey } from "../src/lib/learning/journeyTypes";

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

/* ── 字段存在 ─────────────────────────────────────────────────────── */

const all = getJourneys();
check("at least one journey", all.length >= 1, true);
check("talas-751 present", all.some((j) => j.id === "talas-751"), true);
const talas = all.find((j) => j.id === "talas-751")!;
check("talas status published", talas.status, "published");
check("talas featured", talas.featured, true);
check("default status published (undefined → published)", (talas.status ?? "published"), "published");

/* ── 排序键：published → featured → difficulty → minutes ─────────── */

// explicit candidates (not part of seed — pure ordering check)
const draftFeatured: Journey = {
  ...talas, id: "draft-featured", slug: "draft-featured", status: "draft", featured: true,
} as Journey;
const publishedNotFeatured: Journey = {
  ...talas, id: "pub-not-featured", slug: "pub-not-featured", featured: false,
} as Journey;
const publishedFeaturedHard: Journey = {
  ...talas, id: "pub-featured-hard", slug: "pub-featured-hard", difficulty: "advanced", estimatedMinutes: 20,
} as Journey;
const publishedFeaturedEasy2: Journey = {
  ...talas, id: "pub-featured-easy2", slug: "pub-featured-easy2", estimatedMinutes: 15,
} as Journey;

const keys = [draftFeatured, publishedFeaturedHard, publishedNotFeatured, publishedFeaturedEasy2]
  .map((j) => ({ id: j.id, key: journeyOrderKey(j) }))
  .sort((a, b) => {
    for (let i = 0; i < 4; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i];
    return 0;
  });
// expected order: [pub-featured-easy2, pub-featured-hard, pub-not-featured, draft-featured]
check("order[0] featured+easy", keys[0]?.id, "pub-featured-easy2");
check("order[1] featured+advanced", keys[1]?.id, "pub-featured-hard");
check("order[2] published not featured", keys[2]?.id, "pub-not-featured");
check("order[3] draft last", keys[3]?.id, "draft-featured");

/* ── getFeaturedJourneys：从 repository 读取 ──────────────────────── */

const featured = getFeaturedJourneys(3);
check("featured list non-empty", featured.length >= 1, true);
check("featured contains talas-751", featured.some((j) => j.id === "talas-751"), true);
check("featured list is sorted by order key", featured.every((j, i, arr) => {
  if (i === 0) return true;
  const a = journeyOrderKey(arr[i - 1]);
  const b = journeyOrderKey(j);
  for (let k = 0; k < 4; k++) if (a[k] !== b[k]) return a[k] < b[k];
  return true;
}), true);
check("draft never surfaces", featured.every((j) => (j.status ?? "published") === "published"), true);
check("limit respected", getFeaturedJourneys(1).length, 1);

/* ── 组件不硬编码：repository 是唯一来源 ─────────────────────────── */

// JourneysGrid receives data via props — verify no hard-coded journey
// content lives in the homepage grid component
import { readFileSync } from "node:fs";
import { join } from "node:path";
const gridSrc = readFileSync(join(process.cwd(), "src/components/history/JourneysGrid.tsx"), "utf8");
check("grid has no hard-coded journey id", gridSrc.includes("talas-751") === false, true);
const homeSrc = readFileSync(join(process.cwd(), "src/components/history/HomeView.tsx"), "utf8");
check("HomeView reads featured via props", homeSrc.includes("featuredJourneys"), true);
check("HomeView no hard-coded journey id", homeSrc.includes("talas-751") === false, true);

console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
