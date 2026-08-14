/**
 * Timeline interaction binding test (jsdom).
 *
 * Verifies the mount-order race is fixed: after the svg renders, the d3
 * brush overlay MUST exist, the zoom transform anchor MUST be set, and
 * clicking a timeline dot MUST open the Event Detail popup.
 *
 * Run: npx tsx scripts/timeline-interaction.test.tsx
 *
 * (Gesture math — drag/wheel/pinch — cannot run under jsdom because it
 * lacks SVG layout (getScreenCTM); binding + click are the parts that were
 * actually broken, and those are asserted here.)
 */
import { JSDOM } from "jsdom";

/* ── jsdom globals ─────────────────────────────────────────────────── */
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.HTMLElement = dom.window.HTMLElement;
g.SVGGraphicsElement = dom.window.SVGGraphicsElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
g.MutationObserver = dom.window.MutationObserver;
g.localStorage = dom.window.localStorage;
g.IS_REACT_ACT_ENVIRONMENT = true;

/* ResizeObserver: fire once with a usable width */
class MockRO {
  constructor(private cb: (entries: { contentRect: { width: number } }[]) => void) {}
  observe() {
    this.cb([{ contentRect: { width: 900 } }]);
  }
  unobserve() {}
  disconnect() {}
}
g.ResizeObserver = MockRO;

/* fetch → real repository data (same DTOs the app serves) */
import { getRepository } from "../src/lib/repository";
const repo = getRepository();
g.fetch = async (url: string) => {
  let data: unknown;
  if (String(url).includes("/api/civilizations")) data = await repo.getCivilizations();
  else if (String(url).includes("/api/people")) data = await repo.getPeople();
  else data = await repo.getEvents();
  return { ok: true, json: async () => data };
};

import React from "react";
(g as Record<string, unknown>).React = React;
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { LocaleProvider } from "../src/components/history/LocaleProvider";
import { ExplorerProvider } from "../src/components/history/ExplorerProvider";
import { Timeline } from "../src/components/history/Timeline";

async function main() {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(
      <LocaleProvider>
        <ExplorerProvider>
          <Timeline />
        </ExplorerProvider>
      </LocaleProvider>,
    );
  });

  // 1) svg rendered
  await waitFor(() => {
    if (!view.container.querySelector("svg")) throw new Error("svg not rendered");
  });

  // 2) d3 brush bound: overlay rect inside the brush host group
  await waitFor(
    () => {
      const overlay = view.container.querySelector("g .overlay");
      if (!overlay) throw new Error("brush overlay missing — brush was never bound");
    },
    { timeout: 8000 },
  );
  const overlay = view.container.querySelector("g .overlay")!;
  console.log("PASS  brush overlay bound:", overlay.tagName, "class=", overlay.getAttribute("class"));

  // 3) d3 zoom anchored: __zoom transform set on the svg
  const svg = view.container.querySelector("svg") as unknown as { __zoom?: unknown };
  await waitFor(
    () => {
      if (!svg.__zoom) throw new Error("__zoom anchor missing — zoom was never bound");
    },
    { timeout: 8000 },
  );
  console.log("PASS  zoom anchor set:", JSON.stringify(svg.__zoom));

  // 4) clicking a timeline dot opens the Event Detail popup
  const dot = view.container.querySelector("g[role='button']");
  if (!dot) throw new Error("no event dot group found");
  await act(async () => {
    fireEvent.click(dot);
  });
  await waitFor(
    () => {
      const dialog = view.container.querySelector("[role='dialog']");
      if (!dialog) throw new Error("Event detail popup did not open on dot click");
    },
    { timeout: 5000 },
  );
  console.log("PASS  dot click opened event detail popup");
  console.log("ALL TIMELINE INTERACTION BINDING TESTS PASSED");
  process.exit(0);
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
