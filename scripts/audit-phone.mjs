import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(process.argv[2] ?? 390), height: 844 },
});
const names = [
  "AppShell",
  "DataTable",
  "ListPageTemplate",
  "RecordPageTemplate",
  "RecordOverviewLayout",
  "DashboardPageTemplate",
  "FormPageTemplate",
  "SettingsPageTemplate",
  "OpenRecordsSwitcher",
  "NotificationsDrawer",
  "KanbanBoard",
  "Agenda",
  "MiniCalendar",
];
try {
  for (const name of names) {
    await page.goto("http://127.0.0.1:5190/#/preview/" + name + "?theme=light");
    await page.locator(".ds-standalone-preview").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      overflow: [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect(),
            c = getComputedStyle(e);
          return (
            r.right > innerWidth + 2 &&
            c.position !== "absolute" &&
            c.position !== "fixed" &&
            c.display !== "none" &&
            !e.closest(
              ".pt-table-scroll,.pt-board-lanes,.pt-agenda-kinds,.pt-segmented",
            )
          );
        })
        .slice(0, 4)
        .map((e) => ({
          tag: e.tagName,
          cls: e.className,
          text: e.textContent?.slice(0, 60),
        })),
    }));
    console.log(name, JSON.stringify(metrics));
    await page.screenshot({ path: "test-results/phone-" + name + ".png" });
  }
  await page.goto("http://127.0.0.1:5190/#/releases");
  await page.getByRole("heading", { name: "Releases", exact: true }).waitFor();
  await page.screenshot({ path: "test-results/phone-releases.png" });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("dialog", { name: "Navigation", exact: true }).waitFor();
  await page.screenshot({ path: "test-results/phone-doc-navigation.png" });
} finally {
  await browser.close();
}
