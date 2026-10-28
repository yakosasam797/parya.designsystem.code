import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => console.error(error.stack));
await page.goto("http://127.0.0.1:5190/");
await page.locator("main h1").first().waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: "test-results/home-desktop.png",
  fullPage: true,
});
console.log(await page.locator("main h1").allTextContents());
await page.goto("http://127.0.0.1:5190/#/components/Button");
await page.locator(".ds-playground").waitFor();
await page.screenshot({
  path: "test-results/button-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "test-results/button-mobile.png",
  fullPage: true,
});
console.log({
  mobileWidth: await page.evaluate(() => document.documentElement.scrollWidth),
});
await browser.close();
