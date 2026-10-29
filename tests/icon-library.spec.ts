import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("all 151 icons are discoverable, searchable and copy their actual usage", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/components/Icon");
  await page.getByRole("link", { name: "Browse all 151 icons" }).click();
  await expect(page).toHaveURL(/#\/icons$/);
  await expect(page.locator(".ds-icon-library-grid button")).toHaveCount(151);
  await expect(page.getByRole("status")).toContainText("151 of 151 icons");
  const search = page.getByRole("searchbox", { name: "Find an icon" });
  await search.fill("plane");
  await expect(page.locator(".ds-icon-library-grid button")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Copy plane icon usage", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('<Icon name="plane" />');
  await search.fill("not-an-icon");
  await expect(page.locator(".ds-icon-library-grid button")).toHaveCount(0);
  await expect(
    page.getByText("No matching icons.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator(".ds-icon-library-grid button")).toHaveCount(151);
});

test("the icon library works with a keyboard and fits phones in both themes", async ({
  page,
}) => {
  await page.goto("/#/icons");
  await page.getByRole("searchbox", { name: "Find an icon" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Copy home icon usage", exact: true }),
  ).toBeFocused();
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.setViewportSize({ width: 320, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
