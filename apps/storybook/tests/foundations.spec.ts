import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("foundation role controls render the shipped typography styles", async ({
  page,
}) => {
  await page.goto("/?path=/story/get-started-foundations--typography");
  const frame = page.frameLocator("#storybook-preview-iframe");
  await expect(frame.locator(".pt-type-body")).toBeVisible();
  await page
    .locator("#control-role")
    .selectOption({ label: "Money" }, { timeout: 10000 });
  await expect(frame.locator(".pt-type-mono-money")).toHaveCSS(
    "font-family",
    /JetBrains Mono/,
  );
  await expect(frame.locator(".pt-type-mono-money")).toHaveCSS(
    "font-weight",
    "600",
  );
  await expect(frame.locator(".pt-type-mono-money")).toHaveCSS(
    "font-variant-numeric",
    "tabular-nums",
  );
});
test("foundation stories stay accessible in both themes", async ({ page }) => {
  for (const theme of ["light", "dark"])
    for (const story of ["typography", "color-pairs"]) {
      await page.goto(
        `/iframe.html?id=get-started-foundations--${story}&viewMode=story&globals=theme:${theme};a11y.manual:!true`,
      );
      await expect(
        page.locator("#storybook-root .pt-theme").first(),
      ).toBeVisible();
      const scan = await new AxeBuilder({ page })
        .include("#storybook-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
});
