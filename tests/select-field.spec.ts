import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("token categories use a styled menu with keyboard navigation and focus return", async ({
  page,
}) => {
  await page.goto("/#/foundations/tokens");
  const trigger = page.getByRole("combobox", {
    name: "Token category",
    exact: true,
  });
  const triggerBounds = (await trigger.boundingBox())!;
  await trigger.click();
  const menu = page.getByRole("listbox", {
    name: "Token category",
    exact: true,
  });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("border-radius", "10px");
  await expect(
    menu.getByRole("option", { name: "Colors", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(menu.getByRole("option", { name: /Select/ })).toHaveCount(0);
  const menuBounds = (await menu.boundingBox())!;
  expect(Math.abs(menuBounds.x - triggerBounds.x)).toBeLessThan(2);
  expect(Math.abs(menuBounds.width - triggerBounds.width)).toBeLessThan(2);
  await page.screenshot({ path: "test-results/select-tokens-desktop.png" });
  await page.keyboard.press("Home");
  await expect(
    menu.getByRole("option", { name: "Colors", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    menu.getByRole("option", { name: "Font families", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Font families");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".fd-token").first()).toContainText("font");
  await trigger.press("ArrowDown");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText("Font families");
  await trigger.click();
  await page.keyboard.type("corner");
  await expect(
    menu.getByRole("option", { name: "Corner radii", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Corner radii");
});

test("select menus fit mobile screens and stay accessible in both themes", async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const theme of ["light", "dark"]) {
      await page.goto("/#/foundations/tokens");
      await page.evaluate(
        (value) => localStorage.setItem("parya-theme", value),
        theme,
      );
      await page.reload();
      const trigger = page.getByRole("combobox", {
        name: "Token category",
        exact: true,
      });
      await trigger.click();
      const menu = page.getByRole("listbox", {
        name: "Token category",
        exact: true,
      });
      await expect(menu).toHaveAttribute("data-theme", theme);
      const bounds = (await menu.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(11);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 11);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      if (width === 390)
        await page.screenshot({
          path: `test-results/select-tokens-mobile-${theme}.png`,
        });
      await page
        .getByRole("option", { name: "Font weights", exact: true })
        .click();
      await expect(trigger).toHaveText("Font weights");
    }
  }
});
