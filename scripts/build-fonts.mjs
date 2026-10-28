import { readFile, writeFile } from "node:fs/promises";
const families = [
  ["onest", "Onest"],
  ["public-sans", "Public Sans"],
  ["jetbrains-mono", "JetBrains Mono"],
];
let output =
  "/* Fontsource variable fonts aliased to the exact family names used in Paper. */\n";
for (const [slug, family] of families) {
  const css = await readFile(
    `node_modules/@fontsource-variable/${slug}/index.css`,
    "utf8",
  );
  output += css
    .replaceAll(`${family} Variable`, family)
    .replaceAll("url(./files/", `url(@fontsource-variable/${slug}/files/`);
}
await writeFile("src/fonts.css", output);
