import { readFile, writeFile, mkdir } from "node:fs/promises";

export async function generateFoundations() {
  const guide = JSON.parse(
    await readFile("design/foundation-guidance.json", "utf8"),
  );
  const snapshot = JSON.parse(
    await readFile("design/paper-tokens.json", "utf8"),
  );
  const styles = await readFile("packages/web/src/styles.css", "utf8");
  const values = new Map(
    snapshot.tokens.map((token) => [token.name, String(token.value)]),
  );
  for (const match of styles.matchAll(
    /(--pt-type-(?:page|record)-title-size):\s*([^;]+);/g,
  ))
    values.set(match[1], match[2]);
  function resolve(value, seen = new Set()) {
    return value.replace(/var\((--[\w-]+)\)/g, (expression, name) => {
      if (seen.has(name) || !values.has(name))
        throw new Error(`Unknown or cyclic foundation token: ${name}`);
      return resolve(values.get(name), new Set(seen).add(name));
    });
  }
  const kebab = (value) =>
    value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const css =
    "/* Generated from design/foundation-guidance.json. Paper typography roles; do not edit by hand. */\n" +
    guide.typography
      .map(
        (role) =>
          `.${role.className} {\n${Object.entries(role.css)
            .map(([property, value]) => `  ${kebab(property)}: ${value};`)
            .join("\n")}\n}`,
      )
      .join("\n\n") +
    "\n";
  const definitions = guide.typography.map((role) => ({
    ...role,
    resolved: Object.fromEntries(
      Object.entries(role.css).map(([key, value]) => [key, resolve(value)]),
    ),
  }));
  const md = `# Parya foundations\n\n${guide.description}\n\n## Start with meaning\n\n${guide.principles.map((principle) => `- **${principle.title}:** ${principle.text}`).join("\n")}\n\n## Typography roles\n\nImport \`@parya/design-system/styles.css\` once. These classes only style text; choose semantic HTML independently. Use Button, TextField, TabBar and Money for their built-in interaction, labeling and formatting.\n\n| Role / CSS class | Family | Size | Weight | When to use | Avoid |\n| --- | --- | --- | --- | --- | --- |\n${definitions.map((role) => `| ${role.label} / \`${role.className}\` | ${role.resolved.fontFamily.replaceAll('"', "")} | ${role.resolved.fontSize} | ${role.resolved.fontWeight} | ${role.use} | ${role.avoid} |`).join("\n")}\n\nFluid title sizes use container units. The Paper token snapshot excludes those expressions; styles.css restores the exact formulas from the typography specimens.\n\n### Font weight\n\n${guide.weights.map((weight) => `- ${weight.value} ${weight.name}: ${weight.use}`).join("\n")}\n\n### Semantics\n\nUse one descriptive h1 for the page; nest section headings logically. A large value can be a paragraph. A field label needs an associated input; a column header belongs in a table.\n\n\`\`\`tsx\nimport "@parya/design-system/styles.css";\n\n<h1 className="pt-type-page-title">Bookings</h1>\n<h2 className="pt-type-section-title">Traveler details</h2>\n<p className="pt-type-body">Confirm the passport name before issuing the ticket.</p>\n<p className="pt-type-page-title">₹1,45,000</p>\n\`\`\`\n\n### Complete typography declarations\n\n${guide.typography
    .map(
      (role) =>
        `#### ${role.label}\n\n\`\`\`css\n.${role.className} {\n${Object.entries(
          role.css,
        )
          .map(([key, value]) => `  ${kebab(key)}: ${value};`)
          .join("\n")}\n}\n\`\`\``,
    )
    .join(
      "\n\n",
    )}\n\n## Semantic color pairings\n\nTeal identifies work and actions; pink identifies selection and person-related emphasis. Status meanings are independent. Always include readable words or another cue. Use semantic variables; ThemeProvider maps light and dark values.\n\n| Role | Foreground | Background | Use |\n| --- | --- | --- | --- |\n${guide.colorPairs.map((pair) => `| ${pair.label} | \`${pair.foreground}\` | \`${pair.background}\` | ${pair.use} |`).join("\n")}\n\n## Contrast and readability\n\nNormal text needs at least 4.5:1 contrast. Large text (at least 24 CSS px regular or approximately 18.67 CSS px bold) needs 3:1. Essential control boundaries and graphics need 3:1 against adjacent colors; decorative separators are a different case. Do not round a failing ratio into a pass. Inactive controls have exceptions. A named token or passing contrast calculation is not a WCAG conformance claim.\n\nThe website calculator uses sRGB relative luminance. Alpha colors are composited over the selected theme's bg-surface. Images, gradients, overlays and extra opacity require checking the real rendered background.\n\n## Spacing and shape\n\nUse --pt-space-1 (4px) for a closely attached hint; --pt-space-2 (8px) for an icon and label; --pt-space-4 (16px) for related fields; --pt-space-6 (24px) for content groups; --pt-space-8 (32px) for stronger section separation. Prefer each component's existing spacing and radius.\n\n## Sources\n\n- [Paper typography](${guide.paperTypography})\n${guide.sources.map((source) => `- [${source.label}](${source.url})`).join("\n")}\n\nValues come from the Parya Paper library. Usage guidance applies those values to travel software; components and combinations remain experimental.\n`;
  await Promise.all([
    mkdir("apps/docs/public/docs", { recursive: true }),
    mkdir("apps/docs/public/api", { recursive: true }),
  ]);
  await writeFile("packages/web/src/typography.css", css);
  await writeFile("apps/docs/public/docs/foundations.md", md);
  await writeFile(
    "apps/docs/public/api/foundations.json",
    JSON.stringify(
      {
        ...guide,
        typography: definitions,
        tokenHash: snapshot.hash,
        tokenCount: snapshot.tokens.length,
      },
      null,
      2,
    ),
  );
  return md;
}
