import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("packages/web/package.json", "utf8"));
const docs = JSON.parse(
  readFileSync("apps/docs/src/generated/components.json", "utf8"),
);
const buttonDoc = docs.find((doc: { name: string }) => doc.name === "Button");
const controls = (page: Page) =>
  page.locator(".ds-controls-layout--button").locator("..");
const preview = (page: Page) =>
  page.getByRole("region", { name: "Configured Button preview" });
async function choose(page: Page, label: string, value: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test("package badge explains the shared release and follows the selected component", async ({
  page,
}) => {
  for (const name of ["Button", "TextField"]) {
    await page.goto(`/#/components/${name}`);
    const badge = page.getByRole("button", {
      name: `Package ${pkg.name}, version ${pkg.version}`,
      exact: true,
    });
    await expect(badge).toHaveText(`${pkg.name}@${pkg.version}`);
    await badge.click();
    const popup = page.getByRole("dialog", { name: "Package information" });
    await expect(popup).toContainText(
      "Components in the package share the release version",
    );
    await expect(popup.locator("dd")).toHaveText([
      "@parya",
      "design-system",
      pkg.version,
    ]);
    await expect(
      popup.getByRole("link", { name: "Installation and package setup" }),
    ).toHaveAttribute("href", "#/installation");
    await page.keyboard.press("Escape");
    await expect(badge).toBeFocused();
  }
});

test("icon slots, label and full width update the actual button and copied code", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/components/Button");
  const section = controls(page);
  const button = preview(page).getByRole("button");
  await choose(page, "Leading icon", "None");
  await expect(button.locator("svg")).toHaveCount(0);
  await choose(page, "Trailing icon", "arrow right");
  await expect(button.locator("svg")).toHaveCount(1);
  await choose(page, "Leading icon", "plus");
  await expect(button.locator("svg")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Button label", exact: true })
    .fill('Save "booking" <today>');
  await expect(button).toHaveAccessibleName('Save "booking" <today>');
  const before = (await button.boundingBox())!.width;
  await page.getByRole("switch", { name: "Full width", exact: true }).click();
  expect((await button.boundingBox())!.width).toBeGreaterThan(before);
  await expect(section.locator("pre")).toContainText(
    'trailingIcon="arrow-right" fullWidth',
  );
  await expect(section.locator("pre")).toContainText(
    '{"Save \\"booking\\" <today>"}',
  );
  await section.getByRole("button", { name: "Copy code", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('trailingIcon="arrow-right" fullWidth');
  await page
    .getByRole("button", { name: "Reset controls", exact: true })
    .click();
  await expect(button).toHaveAccessibleName("Create booking");
  await expect(button.locator("svg")).toHaveCount(1);
  await expect(
    page.getByRole("switch", { name: "Full width", exact: true }),
  ).not.toBeChecked();
  await page
    .getByRole("textbox", { name: "Button label", exact: true })
    .fill("   ");
  await expect(button).toHaveAccessibleName("Create booking");
});

test("typography guidance agrees with rendered font tokens for all Button sizes", async ({
  page,
}) => {
  await page.goto("/#/components/Button");
  const button = preview(page).getByRole("button");
  for (const item of buttonDoc.details.typography.sizes) {
    await choose(page, "Size", item.size);
    await expect(button).toHaveCSS("font-size", item.value);
    await expect(button).toHaveCSS(
      "font-weight",
      buttonDoc.details.typography.weight,
    );
    await expect(button).toHaveCSS("font-family", /Onest/);
    await expect(
      page.locator(".ds-button-type-table tr[data-selected]"),
    ).toContainText(item.value);
  }
  await page
    .getByRole("link", { name: "Foundations typography guide" })
    .click();
  await expect(page).toHaveURL(/#\/foundations\/typography$/);
});

test("keyboard activation works and loading or disabled prevents repeat actions", async ({
  page,
}) => {
  await page.goto("/#/components/Button");
  const button = preview(page).getByRole("button");
  await button.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("type", "button");
  for (const key of ["Enter", "Space"]) {
    await button.press(key);
    await expect(
      page.getByText("Create booking selected", { exact: true }).first(),
    ).toBeVisible();
  }
  await page.getByRole("switch", { name: "Loading", exact: true }).click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await page.getByRole("switch", { name: "Loading", exact: true }).click();
  await page.getByRole("switch", { name: "Disabled", exact: true }).click();
  await expect(button).toBeDisabled();
  await expect(button).not.toHaveAttribute("aria-busy");
});

test("Markdown and LLM copies contain the same package and component-specific guidance", async ({
  page,
  request,
  context,
}) => {
  const response = await request.get("/docs/Button.md");
  expect(response.ok()).toBeTruthy();
  const markdown = await response.text();
  expect(markdown).toContain(`Package: ${pkg.name}\nVersion: ${pkg.version}`);
  for (const line of buttonDoc.details.accessibility)
    expect(markdown).toContain(line);
  for (const item of buttonDoc.details.typography.sizes)
    expect(markdown).toContain(item.value);
  expect(markdown).toContain('type="submit"');
  expect(markdown).toContain('aria-label="Close booking details"');
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/components/Button");
  await page.getByRole("button", { name: "Copy for LLM", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await navigator.clipboard.readText()).replaceAll("\r\n", "\n"),
      ),
    )
    .toBe(markdown);
  await page.getByRole("tab", { name: "API reference", exact: true }).click();
  await page
    .locator(".ds-on-this-page")
    .getByRole("button", { name: "Accessibility", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Accessibility for Button" }),
  ).toBeInViewport();
});

for (const theme of ["light", "dark"])
  test(`Button documentation fits small screens and has no automated accessibility violations in ${theme}`, async ({
    page,
  }) => {
    await page.goto("/#/components/Button");
    await page.evaluate(
      (value) => localStorage.setItem("parya-theme", value),
      theme,
    );
    await page.reload();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page
        .getByRole("switch", { name: "Full width", exact: true })
        .check();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const box = (await preview(page).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await page
      .getByRole("button", {
        name: `Package ${pkg.name}, version ${pkg.version}`,
        exact: true,
      })
      .click();
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await controls(page).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/button-guidance-desktop-${theme}.png`,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await controls(page).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/button-guidance-phone-${theme}.png`,
    });
  });
