import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the shell and collapsed rail stories use the shared frame in both themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    for (const state of ["default", "collapsed"]) {
      await page.goto(
        `/iframe.html?id=shell-navigation-appshell--${state}&viewMode=story&globals=theme:${theme};a11y.manual:!true`,
      );
      await expect(page.locator(".pt-app-shell")).toBeVisible();
      await expect(page.locator(".pt-shell-sidebar")).toHaveCSS(
        "width",
        state === "collapsed" ? "66px" : "250px",
      );
      await page
        .getByRole("button", {
          name: state === "collapsed" ? "Expand sidebar" : "Collapse sidebar",
          exact: true,
        })
        .click();
      await expect(page.locator(".pt-shell-sidebar")).toHaveCSS(
        "width",
        state === "collapsed" ? "250px" : "66px",
      );
      const scan = await new AxeBuilder({ page })
        .include("#storybook-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
});
