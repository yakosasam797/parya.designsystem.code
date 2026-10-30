import { readFile, writeFile, mkdir } from "node:fs/promises";
const history = JSON.parse(
  await readFile("design/release-history.json", "utf8"),
);
const pkg = JSON.parse(await readFile("packages/web/package.json", "utf8"));
if (
  history.packages[0].name !== pkg.name ||
  history.packages[0].version !== pkg.version
)
  throw new Error(
    "Update design/release-history.json for the current package version.",
  );
for (const item of history.packages) {
  if (!item.releases.some((release) => release.version === item.version))
    throw new Error(`Missing recorded version for ${item.name}`);
}
const markdown = [
  "# Changelog",
  "",
  history.publication,
  "",
  history.templateNote,
];
for (const item of history.packages) {
  markdown.push(
    "",
    `## ${item.name}`,
    "",
    item.description,
    "",
    `Source: ${item.source}`,
  );
  for (const release of item.releases) {
    markdown.push(
      "",
      `### ${release.version}${release.date ? " · " + release.date : ""} — ${release.title}`,
    );
    for (const group of release.changes)
      markdown.push(
        "",
        `#### ${group.type}`,
        "",
        ...group.items.map((line) => "- " + line),
      );
    markdown.push("", "**Adoption:** " + release.adoption);
  }
  for (const update of item.updates ?? [])
    markdown.push(
      "",
      `### Source update · ${update.date} — ${update.title}`,
      "",
      "Package version unchanged.",
      "",
      ...update.items.map((line) => "- " + line),
    );
}
const content = markdown.join("\n") + "\n";
await mkdir("apps/docs/src/generated", { recursive: true });
await mkdir("apps/docs/public/api", { recursive: true });
await mkdir("apps/docs/public/docs", { recursive: true });
await writeFile(
  "apps/docs/src/generated/releases.json",
  JSON.stringify(history, null, 2) + "\n",
);
await writeFile(
  "apps/docs/public/api/releases.json",
  JSON.stringify(history, null, 2) + "\n",
);
await writeFile("apps/docs/public/docs/releases.md", content);
await writeFile("CHANGELOG.md", content);
