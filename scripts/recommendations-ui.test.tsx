/**
 * V0.3 Phase 3D Sprint 3 — RecommendationsBlock UI tests (jsdom).
 *
 * Run: npm run test:recommendations-ui
 *
 * 1. empty → nothing rendered
 * 2. one recommendation renders
 * 3. three render
 * 4. type badges correct (zh)
 * 5. zh/en texts correct
 * 6. entity chips render
 * 7. action buttons render
 * 8. journey recommendation shows journey entry (START_JOURNEY)
 * 9. invalid recommendation is dropped, UI does not crash
 * 10. clicking an action dispatches the right navigation (router.push)
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.HTMLElement = dom.window.HTMLElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
g.MutationObserver = dom.window.MutationObserver;
g.localStorage = dom.window.localStorage;
// Node ≥21 ships a read-only global navigator; Node 20 (CI) does not.
if (typeof (globalThis as { navigator?: unknown }).navigator === "undefined") {
  g.navigator = dom.window.navigator;
}
g.IS_REACT_ACT_ENVIRONMENT = true;
class MockRO {
  constructor(private cb: (entries: { contentRect: { width: number } }[]) => void) {}
  observe() {
    this.cb([{ contentRect: { width: 900 } }]);
  }
  unobserve() {}
  disconnect() {}
}
g.ResizeObserver = MockRO;

import React from "react";
(g as Record<string, unknown>).React = React;
import { act, fireEvent, render } from "@testing-library/react";
import { LocaleProvider } from "../src/components/history/LocaleProvider";
import { ExplorerProvider } from "../src/components/history/ExplorerProvider";
import { RecommendationsBlock } from "../src/components/history/chatBlocks";
import type { NavigatorRecommendation } from "../src/lib/learning/navigatorTypes";

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

const recContinue: NavigatorRecommendation = {
  id: "continue:talas-751",
  titleZh: "进入旅程：公元 751 年：唐朝与世界的交汇",
  titleEn: "Journey: 751 CE — Tang China and the Meeting of Worlds",
  reasonZh: "把它放进完整的时空叙事。",
  reasonEn: "Place it in the full narrative.",
  type: "continue",
  entityRefs: [],
  actions: [{ type: "START_JOURNEY", journeyId: "talas-751" }],
  journeyId: "talas-751",
};

const recCause: NavigatorRecommendation = {
  id: "cause:e-745-yang-guifei",
  titleZh: "前因：唐玄宗册封杨贵妃",
  titleEn: "Cause: Yang Guifei becomes consort",
  reasonZh: "这是理解怛罗斯之战的重要前因。",
  reasonEn: "An important precondition for Talas.",
  type: "cause",
  entityRefs: [{ id: "e-745-yang-guifei", type: "event" }],
  actions: [
    { type: "OPEN_EVENT", id: "e-745-yang-guifei" },
    { type: "FOCUS_TIMELINE", year: 745, entityId: "e-745-yang-guifei", entityType: "event" },
  ],
};

const recCompare: NavigatorRecommendation = {
  id: "compare:e-750-abbasid-revolution",
  titleZh: "同期：阿拔斯革命与扎卜河战役",
  titleEn: "Meanwhile: the Abbasid Revolution",
  reasonZh: "同一时间，世界并不只有一条故事线。",
  reasonEn: "The world never had a single storyline.",
  type: "compare",
  entityRefs: [{ id: "e-750-abbasid-revolution", type: "event" }],
  actions: [{ type: "OPEN_EVENT", id: "e-750-abbasid-revolution" }],
};

const invalidRec = {
  id: "bad:1",
  titleZh: "", // missing title
  titleEn: "",
  reasonZh: "x",
  reasonEn: "x",
  type: "totally-unknown-type",
  entityRefs: [{ id: "e-fake", type: "event" }],
  actions: [],
} as unknown as NavigatorRecommendation;

function renderBlock(recs: NavigatorRecommendation[] | null | undefined, lang: "en" | "zh" = "zh") {
  window.localStorage.setItem("aghm.locale", lang);
  return render(
    <LocaleProvider>
      <ExplorerProvider>
        <RecommendationsBlock recommendations={recs} />
      </ExplorerProvider>
    </LocaleProvider>,
  );
}

async function main() {
  /* 1. empty → nothing rendered */
  const empty = renderBlock([]);
  check("1. empty block renders nothing", empty.container.children.length, 0);
  const nullBlock = renderBlock(null);
  check("1. null renders nothing", nullBlock.container.children.length, 0);
  const undef = renderBlock(undefined);
  check("1. undefined renders nothing", undef.container.children.length, 0);
  empty.unmount();

  /* 2. one recommendation renders */
  const one = renderBlock([recCause]);
  await act(async () => {});
  check("2. section label rendered", one.container.textContent?.includes("继续探索"), true);
  check("2. title rendered", one.container.textContent?.includes("前因：唐玄宗册封杨贵妃"), true);
  check("2. reason rendered", one.container.textContent?.includes("重要前因"), true);
  one.unmount();

  /* 3. three render */
  const three = renderBlock([recContinue, recCause, recCompare]);
  await act(async () => {});
  check("3. three cards", three.container.querySelectorAll("article").length, 3);
  three.unmount();

  /* 4. type badges (zh) */
  const badges = renderBlock([recContinue, recCause, recCompare]);
  await act(async () => {});
  const text = badges.container.textContent ?? "";
  check("4. continue badge", text.includes("继续旅程"), true);
  check("4. cause badge", text.includes("前因 / 背景"), true);
  check("4. compare badge", text.includes("横向比较"), true);
  badges.unmount();

  /* 5. zh/en texts */
  const zhView = renderBlock([recCause]);
  await act(async () => {});
  check("5. zh title", zhView.container.textContent?.includes("唐玄宗册封杨贵妃"), true);
  zhView.unmount();
  const enView = renderBlock([recCause], "en");
  await act(async () => {});
  check("5. en title", enView.container.textContent?.includes("Yang Guifei becomes consort"), true);
  check("5. en reason", enView.container.textContent?.includes("precondition"), true);
  enView.unmount();

  /* 6. entity chips */
  const chips = renderBlock([recCause]);
  await act(async () => {});
  check("6. entity chip rendered", chips.container.querySelectorAll("button").length >= 1, true);
  chips.unmount();

  /* 7. action buttons */
  const actions = renderBlock([recCompare]);
  await act(async () => {});
  const actionText = actions.container.textContent ?? "";
  check("7. action button text (open event)", actionText.includes("打开事件"), true);
  actions.unmount();

  /* 8. journey recommendation */
  const journey = renderBlock([recContinue]);
  await act(async () => {});
  const jText = journey.container.textContent ?? "";
  check("8. journey title shown", jText.includes("公元 751 年：唐朝与世界的交汇"), true);
  check("8. journey entry button (开始旅程)", jText.includes("开始旅程"), true);
  journey.unmount();

  /* 9. invalid recommendation dropped, no crash */
  const mixed = renderBlock([recCause, invalidRec, recCompare]);
  await act(async () => {});
  check("9. invalid dropped (2 valid cards)", mixed.container.querySelectorAll("article").length, 2);
  check("9. no crash — section still renders", mixed.container.textContent?.includes("继续探索"), true);
  const allInvalid = renderBlock([invalidRec]);
  await act(async () => {});
  check("9. all-invalid renders nothing", allInvalid.container.children.length, 0);
  mixed.unmount();

  /* 10. clicking an action dispatches navigation (router.push recorded by
   * the harness mock: OPEN_EVENT → /events/e-745-yang-guifei) */
  const clicks = renderBlock([recCause]);
  await act(async () => {});
  const openEventBtn = [...clicks.container.querySelectorAll("button")].find((b) =>
    (b.textContent ?? "").includes("打开事件"),
  );
  check("10. open-event button present", openEventBtn !== undefined, true);
  const pushes = (g as Record<string, unknown>).__pushes as string[];
  const beforeCount = pushes.length; // snapshot BEFORE the click
  await act(async () => {
    fireEvent.click(openEventBtn!);
  });
  check("10. dispatch pushed /events/e-745-yang-guifei", pushes.length, beforeCount + 1);
  check("10. pushed target correct", pushes[pushes.length - 1], "/events/e-745-yang-guifei");
  clicks.unmount();

  console.log(`\n✓ ${passed} passed · ✗ ${failed} failed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
}

main();
