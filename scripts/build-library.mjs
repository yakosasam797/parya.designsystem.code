import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
await mkdir("packages/web/dist", { recursive: true });
await copyFile("CHANGELOG.md", "packages/web/CHANGELOG.md");
await copyFile("packages/web/src/tokens.css", "packages/web/dist/tokens.css");
await copyFile("packages/web/src/fonts.css", "packages/web/dist/fonts.css");
await copyFile("packages/web/src/typography.css", "packages/web/dist/typography.css");
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
  await copyFile(`packages/web/src/${file}`, `packages/web/dist/${file}`);
// Ship unbundled CSS so font asset URLs resolve from the consumer's bundler.
await copyFile("packages/web/src/styles.css", "packages/web/dist/styles.css");
const schema = JSON.parse(
  await readFile("apps/docs/public/api/components.json", "utf8"),
);
const designCoverage = JSON.parse(
  await readFile("apps/docs/public/design-coverage.json", "utf8"),
);
await writeFile(
  "packages/web/dist/catalog.json",
  JSON.stringify(
    {
      ...schema,
      designCoverage,
      foundations: JSON.parse(
        await readFile("apps/docs/public/api/foundations.json", "utf8"),
      ),
    },
    null,
    2,
  ),
);
// ESM declaration imports need explicit extensions for NodeNext consumers.
// TypeScript's Bundler resolution accepts extensionless imports in source,
// but those paths must point at .js when the declarations are published.
async function fixDeclarationImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await fixDeclarationImports(file);
    else if (entry.name.endsWith(".d.ts")) {
      const text = await readFile(file, "utf8");
      await writeFile(
        file,
        text.replace(
          /(from\s*|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g,
          (match, prefix, quote, specifier) =>
            /\.[a-z]+$/i.test(specifier)
              ? match
              : `${prefix}${quote}${specifier}.js${quote}`,
        ),
      );
    }
  }
}
await fixDeclarationImports("packages/web/dist");
