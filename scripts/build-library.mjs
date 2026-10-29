import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await copyFile("src/tokens.css", "dist/tokens.css");
await copyFile("src/fonts.css", "dist/fonts.css");
await copyFile("src/typography.css", "dist/typography.css");
for (const file of [
  "sections.css",
  "advanced-overlays.css",
  "shell-sections.css",
  "domain.css",
  "templates.css",
  "calendar.css",
  "charts.css",
  "workflow.css",
  "rates.css",
  "phone.css",
])
  await copyFile(`src/${file}`, `dist/${file}`);
// Ship unbundled CSS so font asset URLs resolve from the consumer's bundler.
await copyFile("src/styles.css", "dist/styles.css");
const schema = JSON.parse(
  await readFile("site/public/api/components.json", "utf8"),
);
const designCoverage = JSON.parse(
  await readFile("site/public/design-coverage.json", "utf8"),
);
await writeFile(
  "dist/catalog.json",
  JSON.stringify(
    {
      ...schema,
      designCoverage,
      foundations: JSON.parse(
        await readFile("site/public/api/foundations.json", "utf8"),
      ),
    },
    null,
    2,
  ),
);
