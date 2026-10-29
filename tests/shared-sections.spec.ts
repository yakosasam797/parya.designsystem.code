import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("notes stay scoped to the module or booking, and record communication preserves drafts", async ({
  page,
}) => {
  await page.goto("/#/examples/app-shell");
  await page.getByRole("button", { name: /^Module notes,/ }).click();
  await page.getByLabel("New note").fill("Home handover");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await expect(page.getByText("Home handover", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close notes" }).click();
  await page.getByRole("button", { name: "BK-1042", exact: true }).click();
  await page.getByRole("button", { name: /^Booking notes,/ }).click();
  await expect(page.getByText("Home handover", { exact: true })).toHaveCount(0);
  await page.getByLabel("New note").fill("Confirm adjoining rooms");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await expect(
    page.getByText("Confirm adjoining rooms", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/booking-notes.png" });
  await page.getByRole("button", { name: "Close notes" }).click();
  await page.getByRole("tab", { name: "Communication", exact: true }).click();
  await page
    .getByRole("button", { name: "Compose email", exact: true })
    .click();
  await page.getByRole("textbox", { name: /^To / }).fill("guest@example.com");
  await page
    .getByRole("textbox", { name: /^Subject/ })
    .fill("Transfer confirmation");
  await page
    .getByRole("textbox", { name: /^Message/ })
    .fill("Your transfer is confirmed.");
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await page.getByRole("tab", { name: "Communication", exact: true }).click();
  await page
    .getByRole("button", { name: "Compose email", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: /^Subject/ })).toHaveValue(
    "Transfer confirmation",
  );
  await page.getByRole("button", { name: "Send email", exact: true }).click();
  await expect(page.getByRole("form", { name: "Compose email" })).toHaveCount(
    0,
  );
  await expect(
    page.getByText("Transfer confirmation", { exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/booking-communication.png" });
  await page.getByRole("tab", { name: "Recent activity", exact: true }).click();
  await expect(
    page.getByText("Payment received", { exact: true }),
  ).toBeVisible();
});

test("notifications open from the shell and Escape restores bell focus", async ({
  page,
}) => {
  await page.goto("/#/examples/app-shell");
  const bell = page.getByRole("button", { name: /^Notifications/ });
  await bell.click();
  await expect(
    page.getByRole("dialog", { name: "Notifications", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Notifications", exact: true }),
  ).toHaveCount(0);
  await expect(bell).toBeFocused();
});

for (const name of [
  "NotesPanel",
  "EmailCommunication",
  "ActivityTimeline",
  "ActivityTable",
  "KpiStrip",
  "MiniCalendar",
  "RateMatrix",
  "LineChart",
  "KanbanBoard",
]) {
  test(`${name} renders in both themes and fits the mobile page`, async ({
    page,
  }) => {
    await page.goto(`/#/components/${name}`);
    const preview = page.locator(".ds-preview-inner");
    await expect(preview).toBeVisible();
    for (const theme of ["light", "dark"]) {
      await page
        .getByRole("button", {
          name: theme === "light" ? "Light" : "Dark",
          exact: true,
        })
        .click();
      const results = await new AxeBuilder({ page })
        .include(".ds-preview-inner")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await preview.screenshot({ path: `test-results/${name}-mobile.png` });
  });
}
