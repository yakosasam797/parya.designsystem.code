import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await copyFile("src/tokens.css", "dist/tokens.css");
await copyFile("src/fonts.css", "dist/fonts.css");
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
  JSON.stringify({ ...schema, designCoverage }, null, 2),
);
