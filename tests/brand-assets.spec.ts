import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync("site/src/brand/manifest.json", "utf8"),
) as {
  variants: {
    name: string;
    files: Partial<Record<"svg" | "png", { path: string }>>;
  }[];
};

test("brand library previews original logos and serves every download", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".ds-header-links")
    .getByRole("link", { name: "Brand Assets", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Brand Assets", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Brand Assets · Parya");
  await expect(page.locator(".ba-logo-card")).toHaveCount(14);
  await expect(page.locator(".ba-file-links a")).toHaveCount(22);
  for (const logo of manifest.variants) {
    const preview = page.getByRole("img", {
      name: `Paryatech ${logo.name.toLowerCase()} logo`,
      exact: true,
    });
    await preview.scrollIntoViewIfNeeded();
    await expect(preview).toBeVisible();
    expect(
      await preview.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    ).toBe(true);
    for (const format of ["svg", "png"] as const) {
      const file = logo.files[format];
      if (!file) continue;
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page
          .getByRole("link", {
            name: `Download ${logo.name} logo as ${format.toUpperCase()}`,
            exact: true,
          })
          .click(),
      ]);
      expect(download.suggestedFilename()).toBe(file.path.split("/").at(-1));
      const path = await download.path();
      expect(path).toBeTruthy();
      expect(readFileSync(path!)).toEqual(
        readFileSync(`site/public/${file.path}`),
      );
    }
  }
  for (const [label, pack] of [
    ["Download all assets ZIP", "all"],
    ["SVG pack", "svg"],
    ["PNG pack", "png"],
  ]) {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: label, exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(`paryatech-logos-${pack}.zip`);
    expect(readFileSync((await download.path())!)).toEqual(
      readFileSync(`site/public/brand/paryatech-logos-${pack}.zip`),
    );
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/brand-assets-desktop.png",
    fullPage: true,
  });
  for (const group of ["horizontal", "stacked", "symbol", "tile"]) {
    await page
      .locator(`.ba-logo-group:has(#ba-group-${group})`)
      .screenshot({ path: `test-results/brand-assets-${group}.png` });
  }
});

test("format choices, usage guidance, header themes and mobile navigation work", async ({
  page,
}) => {
  await page.goto("/#/foundations");
  await page
    .locator("main")
    .getByRole("link", { name: "Brand assets", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/brand-assets$/);
  const formats = page.getByRole("group", {
    name: "Download format",
    exact: true,
  });
  await formats.getByRole("button", { name: "SVG", exact: true }).click();
  await expect(page.locator(".ba-file-links a")).toHaveCount(10);
  await expect(
    page.getByRole("heading", { name: "Standalone symbol", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "App tiles", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ba-file-links a").first()).toHaveAttribute(
    "href",
    /\.svg$/,
  );
  await formats.getByRole("button", { name: "PNG", exact: true }).click();
  await expect(page.locator(".ba-file-links a")).toHaveCount(12);
  await expect(
    page.getByRole("heading", { name: "App tiles", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Standalone symbol", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ba-file-links a").first()).toHaveAttribute(
    "href",
    /\.png$/,
  );
  await page.getByRole("tab", { name: "Usage guidance", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Keep the logo recognizable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download usage notes" }),
  ).toHaveAttribute("download", "");
  await expect(page.locator(".ds-brand-logo")).toHaveAttribute(
    "src",
    /teal\.svg$/,
  );
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator(".ds-brand-logo")).toHaveAttribute(
    "src",
    /white\.svg$/,
  );
  await page.getByRole("tab", { name: "Logo library", exact: true }).click();
  await page.screenshot({
    path: "test-results/brand-assets-dark.png",
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/brand-assets-mobile.png",
    fullPage: true,
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .locator(".ds-sidebar")
    .getByRole("link", { name: "Brand Assets", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Brand Assets", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Toggle navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("brand assets and guidance have no automated accessibility violations in either theme", async ({
  page,
}) => {
  await page.goto("/#/brand-assets");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    for (const section of ["Logo library", "Usage guidance"]) {
      await page.getByRole("tab", { name: section, exact: true }).click();
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
  }
});
