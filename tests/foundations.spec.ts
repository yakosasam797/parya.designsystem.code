import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { contrastRatio } from "../site/src/foundations/tokens";

test("typography shows actual role values, editable specimens, enlargement and copyable code", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/foundations");
  await expect(
    page.getByRole("heading", { name: "Choose text by its job." }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await page.screenshot({ path: "test-results/foundations-entry-desktop.png" });
  const specimen = page.locator(".fd-type-surface > p").first();
  await expect(specimen).toHaveCSS("font-weight", "700");
  expect(
    await specimen.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(20);
  await page.getByLabel("Text style", { exact: true }).selectOption("body");
  await expect(specimen).toHaveCSS("font-size", "14px");
  await expect(specimen).toHaveCSS("font-weight", "400");
  await expect(specimen).toHaveCSS("line-height", "21px");
  await page
    .getByLabel("Text style", { exact: true })
    .selectOption("mono-money");
  await expect(specimen).toHaveCSS("font-variant-numeric", "tabular-nums");
  await page.getByRole("switch", { name: "200% text" }).click();
  await expect(specimen).toHaveCSS("font-size", "27px");
  await page
    .getByLabel("Preview text", { exact: true })
    .fill("₹1,45,000 due before departure");
  await expect(specimen).toHaveText("₹1,45,000 due before departure");
  await page
    .locator(".fd-code")
    .first()
    .getByRole("button", { name: "Copy code", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('className="pt-type-mono-money"');
  await page
    .getByRole("group", { name: "Example theme" })
    .getByRole("button", { name: "Dark", exact: true })
    .click();
  await expect(page.locator(".fd-type-surface")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page
    .locator(".fd-example")
    .first()
    .screenshot({ path: "test-results/foundations-specimen.png" });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/foundations-typography-desktop.png",
    fullPage: true,
  });
});

test("color guidance calculates the real rendered pairs and reports failing combinations", async ({
  page,
}) => {
  await page.goto("/#/foundations/color");
  const samples = page.locator(".fd-pair-sample");
  await expect(samples).toHaveCount(22);
  await page
    .locator(".fd-pair")
    .first()
    .screenshot({ path: "test-results/foundations-color-pair.png" });
  const colors = await samples.evaluateAll((elements) =>
    elements.map((element) => ({
      foreground: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
    })),
  );
  for (const pair of colors)
    expect(
      contrastRatio(pair.foreground, pair.background),
    ).toBeGreaterThanOrEqual(4.5);
  await page
    .getByLabel("Foreground token", { exact: true })
    .selectOption("--pt-color-text-disabled");
  await expect(page.locator(".fd-contrast-result")).toContainText(
    "Below normal-text AA contrast",
  );
  await page
    .getByLabel("Foreground token", { exact: true })
    .selectOption("--pt-color-text-primary");
  await page
    .getByRole("group", { name: "Example theme" })
    .getByRole("button", { name: "Dark", exact: true })
    .click();
  await expect(page.locator(".fd-contrast-result")).toContainText(
    "Meets normal-text AA contrast",
  );
  await expect(page.locator(".fd-check-list")).toContainText(
    "4.5:1 minimum · Pass",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/foundations-color-desktop.png",
    fullPage: true,
  });
});

test("token explorer has human labels, theme-aware values, working copy and empty states", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/foundations/tokens");
  await page.getByRole("searchbox").fill("--pt-color-text-primary");
  const token = page.getByRole("button", {
    name: "Copy --pt-color-text-primary",
    exact: true,
  });
  await expect(token).toContainText("#16181D");
  await page
    .getByRole("group", { name: "Example theme" })
    .getByRole("button", { name: "Dark", exact: true })
    .click();
  await expect(token).toContainText("#EEF0F3");
  await token.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("var(--pt-color-text-primary)");
  await page.getByRole("searchbox").fill("unknown-token-name");
  await expect(
    page.getByRole("heading", { name: "No tokens match" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page
    .getByLabel("Token category", { exact: true })
    .selectOption("fontWeight");
  await expect(page.locator(".fd-token").first()).toBeVisible();
  await page.getByRole("button", { name: "Copy for LLM", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("# Parya foundations");
  const markdown = await page.request.get("/docs/foundations.md");
  expect(await markdown.text()).toContain("pt-type-page-title");
  const api = await (await page.request.get("/api/foundations.json")).json();
  expect(api.typography).toHaveLength(20);
  expect(api.tokenCount).toBe(518);
});

test("all foundation guides work on mobile in both themes without automated accessibility violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"]) {
    await page.goto("/#/foundations");
    if (theme === "dark")
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    for (const section of ["typography", "color", "layout", "tokens"]) {
      await page.goto(`/#/foundations/${section}`);
      await expect(page.locator(".ds-foundations h1")).toBeVisible();
      await expect(page.getByRole("tabpanel")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${theme}/${section} overflow`,
      ).toBeLessThanOrEqual(390);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
  }
  await page.goto("/#/foundations/typography");
  await page.getByRole("switch", { name: "200% text" }).click();
  await page
    .getByLabel("Preview text", { exact: true })
    .fill(
      "A very long booking title that must wrap instead of getting clipped",
    );
  expect(
    await page
      .locator(".fd-type-surface")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await page.addStyleTag({
    content:
      ".ds-foundations p {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;margin-bottom:2em !important;}",
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/foundations-typography-mobile.png",
    fullPage: true,
  });
});
