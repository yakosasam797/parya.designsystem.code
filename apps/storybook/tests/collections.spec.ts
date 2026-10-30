import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("filter and sort stories update their controlled values", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=tables-collections-filtermenu--default&viewMode=story",
  );
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByRole("checkbox", { name: "Transport" }).click();
  await expect(page.getByRole("checkbox", { name: "Transport" })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Filters, 2 active" }),
  ).toBeFocused();
  await page.goto(
    "/iframe.html?id=tables-collections-sortmenu--default&viewMode=story",
  );
  await page.getByRole("button", { name: "Sort: Name" }).click();
  await page
    .getByRole("menuitemradio", { name: "Balance", exact: true })
    .click();
  await page.getByRole("menuitemradio", { name: "Descending" }).click();
  await expect(
    page.getByRole("menuitemradio", { name: "Descending" }),
  ).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Sort: Balance" }),
  ).toBeFocused();
});

test("collection stories are accessible and compact variants keep a name", async ({
  page,
}) => {
  for (const id of [
    "tables-collections-filtermenu--compact",
    "tables-collections-filterchips--default",
    "tables-collections-sortmenu--compact",
    "templates-recipes-listpagetemplate--default",
  ]) {
    // Playwright owns this scan; avoid a competing automatic addon scan.
    await page.goto(
      `/iframe.html?id=${id}&viewMode=story&globals=a11y.manual:!true`,
    );
    await expect(
      page.locator("#storybook-root .pt-theme").first(),
    ).toBeVisible();
    if (id.includes("filtermenu"))
      await expect(
        page.getByRole("button", { name: "Filters, 1 active" }),
      ).toBeVisible();
    if (id.includes("sortmenu"))
      await expect(
        page.getByRole("button", { name: "Sort: Name, Ascending" }),
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
