import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const components = JSON.parse(
  readFileSync("apps/docs/src/generated/components.json", "utf8"),
) as {
  name: string;
  kind: string;
  category: string;
  sourcePath: string;
  sourceLine: number;
  usage: string;
}[];
const paper = JSON.parse(
  readFileSync("apps/docs/src/paper-catalog.json", "utf8"),
) as { name: string }[];
const output = "artifacts/workflow-audit";
mkdirSync(output, { recursive: true });

test("the installed package runs in its separately built consumer", async ({
  page,
}) => {
  const { existsSync } = await import("node:fs");
  const path = await import("node:path");
  const resultPath = "artifacts/package-consumer/result.json";
  test.skip(
    !existsSync(resultPath),
    "Run npm run test:package before the consumer browser check.",
  );
  const { consumerDirectory } = JSON.parse(readFileSync(resultPath, "utf8"));
  const root = path.resolve(consumerDirectory, "build");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://parya-consumer.local/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const file = path.resolve(
      root,
      pathname === "/" ? "index.html" : pathname.slice(1),
    );
    if (!file.startsWith(root + path.sep)) return route.abort();
    const extension = path.extname(file);
    await route.fulfill({
      body: readFileSync(file),
      contentType:
        (
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".woff2": "font/woff2",
          } as Record<string, string>
        )[extension] ?? "application/octet-stream",
    });
  });
  await page.goto("http://parya-consumer.local/");
  await expect(
    page.getByRole("button", { name: "Create booking" }),
  ).toBeVisible();
  await expect(page.getByRole("button")).toHaveClass(/pt-button--secondary/);
  await expect(page.getByRole("button")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.getByRole("button")).toHaveCSS("font-family", /Onest/);
  await page.evaluate(() => document.fonts.ready);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `${output}/12-package-consumer.png` });
});

test("skip navigation preserves the current component and moves keyboard focus", async ({
  page,
}) => {
  await page.goto("/#/components/Button");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/components\/Button$/);
  await expect(page.locator("main")).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible();
});

test("search discovers design resources, hooks and utilities with keyboard entry", async ({
  page,
}) => {
  for (const [query, destination] of [
    ["token explorer", "foundations/tokens"],
    ["Brand Assets", "brand-assets"],
    ["useDisclosure", "hooks"],
    ["pageCount", "components/pageCount"],
  ]) {
    await page.goto("/");
    await page.getByRole("button", { name: "Search documentation" }).click();
    const input = page.getByRole("searchbox");
    await input.fill(query);
    await input.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#/${destination}$`));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Search documentation" }).click();
  await page.getByRole("searchbox").fill("xyz-no-such-reference");
  await expect(
    page.getByText("No matching documentation", { exact: true }),
  ).toBeVisible();
});

test("unavailable clipboard offers selectable documentation and failed requests show recovery", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    }),
  );
  await page.goto("/#/components/Button");
  await page.getByRole("button", { name: "Copy for LLM", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Copy this text" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Text to copy" })).toHaveValue(
    /^# Button\n/,
  );
  await page.screenshot({ path: `${output}/03-clipboard-recovery.png` });
  await page.keyboard.press("Escape");
  await page.route("**/docs/Button.md", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: '<!doctype html><div id="root"></div>',
    }),
  );
  await page.getByRole("button", { name: "Copy for LLM", exact: true }).click();
  await expect(
    page.getByText("Documentation unavailable", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a malformed route recovers without crashing and unknown pages retain navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/%E0%A4%A");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Parya Design System home" }).click();
  await expect(
    page.getByRole("heading", { name: "One system. Every journey." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("component documentation tabs support keyboard navigation and useful content", async ({
  page,
}) => {
  await page.goto("/#/components/Button");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "API reference" })).toBeFocused();
  await expect(page.locator(".ds-api-table")).toContainText("leadingIcon");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Guidelines", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Usage guidelines");
});

test("menu copy and download perform the advertised actions", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/preview/Menu?theme=light");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Copy reference", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("BK-1042");
  await expect(
    page.getByText("Reference copied", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("menuitem", { name: "Download sample itinerary", exact: true })
      .click(),
  ]);
  expect(download.suggestedFilename()).toBe("BK-1042-itinerary.txt");
  expect(readFileSync((await download.path())!, "utf8")).toContain(
    "Mehta family",
  );
});

test("phone toast examples show feedback and can be dismissed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/preview/Toaster?theme=dark");
  await page.getByRole("button", { name: "Show notification" }).click();
  await expect(
    page.getByText("Booking confirmed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss Booking confirmed" }).click();
  await expect(
    page.getByText("Booking confirmed", { exact: true }),
  ).toHaveCount(0);
});

test("file selection accepts a real document and reports unsupported and oversized files", async ({
  page,
}) => {
  await page.goto("/#/preview/FileDropzone?theme=light");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "passport.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("sample document"),
  });
  await expect(
    page.getByText("1 file selected: passport.pdf", { exact: true }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "installer.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("invalid"),
  });
  await expect(
    page.getByText("This file type is not accepted.", { exact: true }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "large.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(
    page.getByText("A file exceeds the size limit.", { exact: true }),
  ).toBeVisible();
});

test("traveler controls update, respect bounds, and validate reversed dates", async ({
  page,
}) => {
  await page.goto("/#/preview/QuantityField?theme=light");
  const remove = page.getByRole("button", { name: "Remove room" });
  await remove.click();
  await expect(remove).toBeDisabled();
  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Add room" }).click();
  await expect(page.getByRole("button", { name: "Add room" })).toBeDisabled();
  await page.goto("/#/preview/DateRangeField?theme=light");
  await page.getByLabel("Start date").fill("2026-12-20");
  await expect(page.getByLabel("End date")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("End date").fill("2026-12-25");
  await expect(page.getByLabel("End date")).not.toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.goto("/#/preview/Checklist?theme=light");
  const payment = page.getByRole("checkbox", { name: "Deposit received" });
  await payment.click();
  await expect(payment).toBeChecked();
  await payment.click();
  await expect(payment).not.toBeChecked();
});

test("overlay examples support actual selection, dismissal and keyboard focus return", async ({
  page,
}) => {
  await page.goto("/#/preview/CommandPalette?theme=light");
  const search = page.getByRole("button", {
    name: "Search workspace",
    exact: true,
  });
  await search.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("option", { name: /Bookings/ }).click();
  await expect(page.getByRole("status")).toHaveText("Bookings opened");
  await expect(search).toBeFocused();
  for (const name of ["Open notifications drawer", "Compatibility sheet"]) {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test("Storybook has a docs target for all documented components", async ({
  request,
}) => {
  const { existsSync } = await import("node:fs");
  const indexPath =
    "apps/storybook/storybook-static/index.json";
  test.skip(
    !existsSync(indexPath),
    "Build Storybook with npm run build:storybook before this integration check.",
  );
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  for (const component of components) {
    const id = `${component.category}-${component.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    expect(index.entries[`${id}--docs`], component.name).toBeTruthy();
  }
});

test("every component has genuine Markdown, matching API, and a valid source location", async ({
  request,
}) => {
  const api = await (await request.get("/api/components.json")).json();
  expect(api.components).toHaveLength(components.length);
  for (const component of components) {
    const response = await request.get(`/docs/${component.name}.md`);
    expect(response.ok(), component.name).toBe(true);
    const markdown = await response.text();
    expect(markdown.startsWith(`# ${component.name}\n`), component.name).toBe(
      true,
    );
    expect(markdown).toContain(component.usage);
    const line = readFileSync(component.sourcePath, "utf8").split(/\r?\n/)[
      component.sourceLine - 1
    ];
    expect(line, component.name).toContain(component.name);
  }
  for (const file of [
    "llms.txt",
    "llms-full.txt",
    "agents.md",
    "docs/foundations.md",
    "docs/releases.md",
    "api/foundations.json",
    "design-coverage.json",
  ]) {
    const response = await request.get(`/${file}`);
    expect(response.ok(), file).toBe(true);
    expect(await response.text(), file).not.toContain('<div id="root">');
  }
});

test("constant and hook references describe how developers can actually use them", async ({
  page,
  request,
}) => {
  await page.goto("/#/components/EVENT_KINDS");
  await page.getByRole("tab", { name: "API reference" }).click();
  await expect(
    page.getByRole("heading", { name: "Constant value" }),
  ).toBeVisible();
  const markdown = await (await request.get("/docs/EVENT_KINDS.md")).text();
  expect(markdown).toContain("constant lookup value");
  for (const name of [
    "useDisclosure",
    "useControllableState",
    "useMediaQuery",
    "useTheme",
  ]) {
    const hook = await (await request.get(`/docs/${name}.md`)).text();
    expect(hook).toContain("Call hooks inside a React component");
    expect(hook).toContain("export function");
    expect(await (await request.get("/llms.txt")).text()).toContain(
      `./docs/${name}.md`,
    );
  }
});

test("all design-only routes explain their implementation status", async ({
  page,
}) => {
  const names = [...new Set(paper.map((p) => p.name))].filter(
    (name) => !components.some((c) => c.name === name),
  );
  for (const name of names) {
    await page.goto(`/#/components/${encodeURIComponent(name)}`);
    await expect(
      page.getByRole("heading", { name, exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Implementation pending", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy for LLM", exact: true }),
    ).toHaveCount(0);
  }
});

// Split the full inventory into bounded batches so CI reports actionable names.
for (let start = 0; start < components.length; start += 20) {
  const batch = components.slice(start, start + 20);
  test(`all preview accessibility and phone reflow: ${start + 1}–${start + batch.length}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    const findings: unknown[] = [];
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const component of batch) {
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(`/#/preview/${component.name}?theme=${theme}`);
        await expect(page.locator(".ds-standalone-preview")).toBeVisible();
        // Measure the settled state, after font loading and finite CSS transitions.
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          await Promise.all(
            document
              .getAnimations()
              .filter(
                (animation) =>
                  animation.effect?.getTiming().iterations !== Infinity,
              )
              .map((animation) => animation.finished.catch(() => undefined)),
          );
        });
        const scan = await new AxeBuilder({ page })
          .include(".ds-standalone-preview")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        for (const violation of scan.violations)
          findings.push({
            name: component.name,
            theme,
            rule: violation.id,
            nodes: violation.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          });
        for (const width of [320, 390, 768]) {
          await page.setViewportSize({ width, height: 844 });
          const scrollWidth = await page.evaluate(
            () => document.documentElement.scrollWidth,
          );
          if (scrollWidth > width)
            findings.push({ name: component.name, theme, width, scrollWidth });
        }
      }
    }
    writeFileSync(
      `${output}/preview-batch-${start}.json`,
      JSON.stringify({ findings, errors }, null, 2),
    );
    expect(errors).toEqual([]);
    expect(findings).toEqual([]);
  });
}
