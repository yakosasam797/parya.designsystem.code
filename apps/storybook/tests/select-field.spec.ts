import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("shared select menu supports keyboard selection and both themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=forms-validation-selectfield--default&viewMode=story&globals=theme:${theme};a11y.manual:!true`,
    );
    const trigger = page.getByRole("combobox", {
      name: "Service type",
      exact: true,
    });
    await expect(trigger).toHaveText("Hotel");
    await trigger.click();
    const menu = page.getByRole("listbox", {
      name: "Service type",
      exact: true,
    });
    await expect(menu).toHaveAttribute("data-theme", theme);
    await page.getByRole("option", { name: "Transport", exact: true }).click();
    await expect(trigger).toHaveText("Transport");
    await trigger.press("ArrowDown");
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("option", { name: "Transport", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("End");
    await expect(
      menu.getByRole("option", { name: "Activity", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveText("Activity");
    await trigger.click();
    await expect(menu).toBeVisible();
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
    await expect(trigger).toBeFocused();
  }
});
