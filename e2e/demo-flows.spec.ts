import { expect, test, type Page } from "@playwright/test";

/**
 * Hydration / console-error guards shared by every test.
 * Any console error (hydration mismatch included) fails the test.
 */

export async function trackErrors(page: Page): Promise<() => void> {
  const errors: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  };
  const onPageError = (err: Error) => errors.push(`pageerror: ${err.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  return () => {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    expect(errors, errors.join("\n")).toEqual([]);
  };
}

export async function expectNoHydrationErrors(page: Page): Promise<void> {
  const errors: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => {
    if (/hydration/i.test(msg.text())) errors.push(msg.text());
  };
  page.on("console", onConsole);
  await page.reload();
  await page.waitForLoadState("networkidle");
  page.off("console", onConsole);
  expect(errors, errors.join("\n")).toEqual([]);
}

test.describe("V0.2 demo flows", () => {
  test("Demo 1 — Timeline → Map → Event → People → AI context", async ({ page }) => {
    const finish = await trackErrors(page);

    // Timeline focused on 751 via URL context
    await page.goto("/?year=751");
    await expect(
      page.locator('svg[aria-label="Global history timeline 500–1000 CE"]'),
    ).toBeVisible();

    // Map reads the same context: Current Year header
    await page.goto("/map?year=751");
    await expect(page.getByText("Current Year: 751 CE")).toBeVisible();

    // Map → Event Detail
    await page.goto("/events/e-751-talas");
    await expect(
      page.getByRole("heading", { level: 1, name: /Battle of Talas/ }),
    ).toBeVisible();
    await expect(page.getByText("怛罗斯之战")).toBeVisible();

    // Event → People: year-active nodes are highlighted (d3 data-highlight)
    await page.goto("/people?event=e-751-talas");
    await expect(page.locator('g[data-highlight="1"]').first()).toBeAttached({ timeout: 15_000 });

    // AI knows the context (event + year + location)
    await page.goto("/chat?event=e-751-talas&year=751");
    await page
      .getByPlaceholder(/Ask about the Tang era/)
      .fill("Why does this event matter?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Battle of Talas").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Open event" })).toBeVisible();

    await finish();
  });

  test("Demo 2 — People drawer → Timeline → Map location", async ({ page }) => {
    const finish = await trackErrors(page);

    await page.goto("/people?person=p-li-bai");
    const drawer = page.getByRole("dialog", { name: "Li Bai profile" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Contemporaries")).toBeVisible();
    // shared events with Xuanzong (Li Bai's 742 Hanlin Academy event)
    await expect(drawer.getByText(/Shared events/)).toBeVisible();
    await expect(drawer.getByText(/With Li Longji \(Xuanzong\)/)).toBeVisible();

    // Person → Timeline: lifetime focus
    await drawer.getByRole("button", { name: /View on Timeline/ }).click();
    await page.waitForURL("**/?person=p-li-bai&start=701&end=762");
    await expect(
      page.locator('svg[aria-label="Global history timeline 500–1000 CE"]'),
    ).toBeVisible();

    // Map: fly to Chang'an and open Location Detail
    await page.goto("/map?loc=loc-changan");
    await expect(page.getByRole("dialog", { name: "Chang'an" })).toBeVisible();
    await expect(page.getByText("Events here")).toBeVisible();

    await finish();
  });

  test("Demo 3 — AI world snapshot with navigation actions", async ({ page }) => {
    const finish = await trackErrors(page);

    await page.goto("/chat");
    await page
      .getByPlaceholder(/Ask about the Tang era/)
      .fill("What was happening in China and Europe in 751?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("World snapshot around 751:")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Tang China").first()).toBeVisible();
    await expect(page.getByText("Carolingian world").first()).toBeVisible();
    await expect(page.getByText("Byzantine Empire").first()).toBeVisible();

    // AI → Timeline
    await page.getByRole("button", { name: "View timeline" }).click();
    await page.waitForURL("**/?year=751");

    await finish();
  });

  test("Causal chain intent (local engine)", async ({ page }) => {
    await page.goto("/chat");
    await page
      .getByPlaceholder(/Ask about the Tang era/)
      .fill("What led to the An Lushan Rebellion?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/What led to An Lushan Rebellion/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Yang Guifei/).first()).toBeVisible();
  });
});

test.describe("i18n (language setting)", () => {
  test("zh locale renders Chinese UI and survives navigation", async ({ page }) => {
    const finish = await trackErrors(page);
    await page.goto("/?lang=zh");
    await expect(page.getByRole("link", { name: /总览/ })).toBeVisible();
    await expect(page.getByText("全球时间轴").first()).toBeVisible();

    // language toggle switches to English and persists in the URL
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();
    await expect(page).toHaveURL(/lang=en/);
    await finish();
  });

  test("zh map shows Current Year in Chinese", async ({ page }) => {
    await page.goto("/map?lang=zh&year=751");
    await expect(page.getByText("当前年份")).toBeVisible();
    await expect(page.getByText("751 CE").first()).toBeVisible();
  });
});

test.describe("hydration & console hygiene", () => {
  for (const path of ["/", "/map", "/people", "/chat", "/events/e-751-talas"]) {
    test(`no console errors on ${path}`, async ({ page }) => {
      const finish = await trackErrors(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await finish();
    });
  }

  test("no hydration mismatch after reload", async ({ page }) => {
    await page.goto("/map");
    await expectNoHydrationErrors(page);
  });
});
