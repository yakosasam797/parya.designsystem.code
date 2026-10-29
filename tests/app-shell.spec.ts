import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the shell uses the Paper frame and supports navigation, rail, records and search", async ({
  page,
}) => {
  await page.goto("/#/examples/app-shell");
  await expect(page.getByRole("main", { name: "Workspace" })).toBeVisible();
  await expect(page.locator(".pt-shell-sidebar")).toHaveCSS("width", "250px");
  await expect(page.locator(".pt-shell-topbar")).toHaveCSS("height", "57px");
  await expect(page.locator(".pt-shell-layout")).toHaveCSS("gap", "10px");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("button", { name: "Bookings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bookings", exact: true }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Show Bookings pages" }).click();
  await nav.getByRole("button", { name: "Departures", exact: true }).click();
  await expect(
    nav.getByRole("button", { name: "Departures", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".pt-shell-sidebar")).toHaveCSS("width", "66px");
  await nav.getByRole("button", { name: "Bookings", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Bookings pages" })
    .getByRole("button", { name: "All bookings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "All bookings", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "BK-1042", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mehta family", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to bookings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bookings", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search workspace" });
  await search.getByLabel("Search pages and bookings").fill("Aarav");
  await search
    .getByRole("button", { name: "BK-1043 · Aarav Singh", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Aarav Singh", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to bookings", exact: true })
    .click();
  await page.getByRole("button", { name: "New booking", exact: true }).click();
  await page.getByLabel("Traveler or group name").fill("Shah family");
  await page
    .getByRole("textbox", { name: /^Destination/ })
    .fill("Kyoto, Japan");
  await page
    .getByRole("button", { name: "Create booking", exact: true })
    .click();
  await expect(
    page.getByRole("table", { name: "Upcoming bookings" }),
  ).toContainText("Shah family");
  await page.screenshot({ path: "test-results/app-shell-desktop.png" });
});

test("mobile navigation closes on selection and Escape, and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/examples/app-shell");
  const trigger = page.getByRole("button", {
    name: "Open application navigation",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Application navigation",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Bookings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bookings", exact: true }),
  ).toBeVisible();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(844);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/app-shell-mobile.png" });
});

test("shell documentation exposes the live implementation and full page example", async ({
  page,
}) => {
  await page.goto("/#/components/AppShell");
  await expect(
    page.getByRole("heading", { name: "AppShell", exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator(".ds-preview-inner .pt-app-shell")).toBeVisible();
  await expect(
    page.getByText("Implementation pending", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Full-page example", exact: true }),
  ).toHaveAttribute("href", "#/examples/app-shell");
  await page.getByRole("tab", { name: "API reference", exact: true }).click();
  await expect(page.locator(".ds-api-table")).toContainText("navGroups");
  await expect(page.locator(".ds-api-table")).toContainText("onNavigate");
  const markdown = await page.request.get("/docs/AppShell.md");
  expect(await markdown.text()).toContain("AppNavGroup");
});

test("the full shell is accessible in both themes and while mobile navigation is open", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/#/examples/app-shell");
    await page.evaluate(
      (value) => localStorage.setItem("parya-theme", value),
      theme,
    );
    await page.reload();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByRole("heading", { name: "Home", exact: true }),
      ).toBeVisible();
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      if (width === 390) {
        await page
          .getByRole("button", {
            name: "Open application navigation",
            exact: true,
          })
          .click();
        const menuScan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          menuScan.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
        await page.keyboard.press("Escape");
      }
    }
  }
});
