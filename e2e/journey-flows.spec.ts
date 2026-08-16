import { expect, test, type Page } from "@playwright/test";

/**
 * V0.3 Phase 3D/RC — Journey closed-loop E2E flows (P1-7).
 * Covers the spec's four core flows end to end:
 *   Flow 1  Home → Journey → 751 → Talas → Map → Event
 *   Flow 2  Journey → Person → Person Drawer → Timeline
 *   Flow 3  Journey → AI → Recommendation → Map
 *   Flow 4  Journey → Complete → Recall
 */

async function trackErrors(page: Page): Promise<() => void> {
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

test.describe("V0.3 journey flows", () => {
  test("Flow 1 — Home → Journey → 751 → Talas → Map → Event", async ({ page }) => {
    const finish = await trackErrors(page);

    // Journey detail (featured journey entry lives on the homepage too)
    await page.goto("/journeys/talas-751");
    await expect(
      page.getByRole("heading", { level: 1, name: /Tang China and the Meeting of Worlds/ }),
    ).toBeVisible();

    // Start → one URL transition to step 1
    await page.getByRole("button", { name: /Start Journey/ }).click();
    await page.waitForURL(/journey=talas-751&step=1/);
    await expect(page.getByText("The Tang Empire Moves into Central Asia").first()).toBeVisible();

    // Step 2 → Talas: timeline + map respond to the shared context
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.waitForURL(/journey=talas-751&step=2/);
    await expect(page.getByText("The Battle of Talas").first()).toBeVisible();
    await expect(page).toHaveURL(/event=e-751-talas/);
    // Timeline (journey page) and Map both mounted
    await expect(
      page.locator('svg[aria-label="Global history timeline 500–1000 CE"]'),
    ).toBeVisible();
    await expect(page.locator('svg[aria-label*="Historical world map"]')).toBeVisible();

    // Related-entity chip → Event Detail deep link
    await page.getByRole("button", { name: /Open Battle of Talas/ }).click();
    await page.waitForURL(/events\/e-751-talas/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Battle of Talas/ }),
    ).toBeVisible();

    await finish();
  });

  test("Flow 2 — Journey → Person → Person Drawer → Timeline", async ({ page }) => {
    const finish = await trackErrors(page);

    // Step 3 surfaces Abu Muslim as a related person
    await page.goto("/?journey=talas-751&step=3&year=751&start=751&end=751&civ=c-abbasid&loc=loc-samarkand");
    await expect(page.getByText("Tang, the Abbasids and the Central Asian World").first()).toBeVisible();

    // Person chip → People page with the drawer open
    await page.getByRole("button", { name: /Open Abu Muslim/ }).click();
    await page.waitForURL(/people\?person=p-abu-muslim/);
    const drawer = page.getByRole("dialog", { name: /Abu Muslim/ });
    await expect(drawer).toBeVisible();

    // Drawer → Timeline (lifetime focus in the URL)
    await drawer.getByRole("button", { name: /View on Timeline/ }).click();
    await page.waitForURL(/\?person=p-abu-muslim&start=700&end=755/);
    await expect(
      page.locator('svg[aria-label="Global history timeline 500–1000 CE"]'),
    ).toBeVisible();

    await finish();
  });

  test("Flow 3 — Journey → AI → Recommendation → Map", async ({ page }) => {
    const finish = await trackErrors(page);

    // Ask the assistant about the Talas context
    await page.goto("/chat?event=e-751-talas&year=751");
    await page
      .getByPlaceholder(/Ask about the Tang era/)
      .fill("What happened at the Battle of Talas?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Battle of Talas").first()).toBeVisible({ timeout: 15_000 });

    // Navigator recommendations appear (deterministic engine)
    await expect(page.getByText("Continue exploring")).toBeVisible({ timeout: 15_000 });

    // A recommendation action navigates to the map
    await page.getByRole("button", { name: "View on map" }).first().click();
    await page.waitForURL(/\/map\?loc=/);
    await expect(page.getByText("Current Year: 751 CE")).toBeVisible();

    await finish();
  });

  test("Flow 4 — Journey → Complete → Recall", async ({ page }) => {
    const finish = await trackErrors(page);

    // Complete page with learning stats
    await page.goto("/journeys/talas-751/complete");
    await expect(page.getByText("Journey Complete").first()).toBeVisible();
    await expect(page.getByText("Core memories")).toBeVisible();

    // Recall quiz
    await page.getByRole("link", { name: /Recall quiz/ }).click();
    await page.waitForURL(/journeys\/talas-751\/review/);
    await expect(page.getByText(/In which year did the Battle of Talas/)).toBeVisible();

    // Answer all 5 questions
    const answers = [
      ["751", "Correct"],
      ["Tang and the Abbasids", "Correct"],
      ["Silk Road exchange", "Partially correct"],
      ["the Talas River", "Correct"],
      ["paper", "Correct"],
    ];
    for (const [answer, grade] of answers) {
      await page.getByPlaceholder(/Type your answer/).fill(answer);
      await page.getByRole("button", { name: /Check my answer/ }).click();
      await expect(page.getByText(grade).first()).toBeVisible({ timeout: 10_000 });
      await page.getByRole("button", { name: /Next question|Finish review/ }).click();
    }
    await expect(page.getByText("Review complete")).toBeVisible();

    await finish();
  });
});
