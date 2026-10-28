import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("vendor list combines filtering, global sorting, pagination and selection across pages", async ({
  page,
}) => {
  await page.goto("/#/components/ListPageTemplate");
  const preview = page.locator(".ds-preview-inner");
  const table = preview.getByRole("table", { name: "Vendors" });
  await expect(table).toBeVisible();
  await preview.getByRole("checkbox", { name: "Select all rows" }).click();
  await expect(preview.getByText("3 selected", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Next", exact: true }).click();
  await preview.getByRole("checkbox", { name: "Select all rows" }).click();
  await expect(preview.getByText("6 selected", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Sort: Name" }).click();
  await page
    .getByRole("menuitemradio", { name: "Balance", exact: true })
    .click();
  await page.getByRole("menuitemradio", { name: "Descending" }).click();
  await page.keyboard.press("Escape");
  await expect(preview.getByText("Page 1 of 2", { exact: true })).toBeVisible();
  await expect(table.getByRole("row").nth(1)).toContainText(
    "Kumarakom Lake Resort",
  );
  await expect(
    table.getByRole("columnheader", { name: /Balance/ }),
  ).toHaveAttribute("aria-sort", "descending");
  await preview.getByRole("searchbox").fill("Kochi");
  await expect(
    preview.getByText("1–3 of 3 records", { exact: true }),
  ).toBeVisible();
  const filters = preview.getByRole("button", { name: /^Filters/ });
  await filters.click();
  await page.getByRole("checkbox", { name: "Accommodation" }).click();
  await page.keyboard.press("Escape");
  await expect(filters).toBeFocused();
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(table).toContainText("Brunton Boatyard");
  await preview.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(preview.getByRole("searchbox")).toHaveValue("");
  await expect(
    preview.getByText("1–3 of 6 records", { exact: true }),
  ).toBeVisible();
  await expect(preview.getByText("6 selected", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Clear selection" }).click();
  await expect(
    preview.getByText("6 selected", { exact: true }),
  ).not.toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/collections-desktop.png",
    fullPage: true,
  });
});

test("filter radios work with arrow keys and overlays remain accessible in both themes", async ({
  page,
}) => {
  await page.goto("/#/components/FilterMenu");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Dark", exact: true }).click();
    await page
      .locator(".ds-preview-inner")
      .getByRole("button", { name: /Filters/ })
      .click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await dialog.getByRole("radio", { name: "Active", exact: true }).click();
    await page.keyboard.press("ArrowDown", { delay: 20 });
    await expect(dialog.getByRole("radio", { name: "Inactive" })).toBeChecked();
    const scan = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/filters-${theme}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
  }
});

test("collection controls fit a mobile screen and utility docs contain real function signatures", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/ListPageTemplate");
  await expect(
    page.locator(".ds-preview-inner").getByRole("table"),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page
    .locator(".ds-preview-inner")
    .getByRole("button", { name: "Filters", exact: true })
    .click();
  const bounds = await page
    .getByRole("dialog", { name: "Filters" })
    .boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/collections-mobile.png",
    fullPage: true,
  });
  await page.goto("/#/components/filterRows");
  await page.getByRole("tab", { name: "API reference" }).click();
  await expect(
    page.getByRole("heading", { name: "Parameters", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ds-api-table")).toContainText("accessors");
  const doc = await page.request.get("/docs/FilterMenu.md");
  const markdown = await doc.text();
  expect(markdown).toContain("export interface FilterGroup");
  expect(markdown).toContain("function FilterControlsDemo()");
  expect(markdown).not.toContain("UI.");
});
