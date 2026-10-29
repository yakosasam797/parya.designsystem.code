import ts from "typescript";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { generateFoundations } from "./generate-foundations.mjs";
const foundationsMarkdown = await generateFoundations();
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const paper = JSON.parse(await readFile("site/src/paper-catalog.json", "utf8"));
const examplesSource = await readFile("src/examples.tsx", "utf8");
const exampleFile = ts.createSourceFile(
  "examples.tsx",
  examplesSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const exampleEntries = [];
const migrationFile = ts.createSourceFile(
  "migration-examples.tsx",
  await readFile("src/migration-examples.tsx", "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
function collectExamples(node) {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(exampleFile) === "examples" &&
    node.initializer &&
    ts.isArrayLiteralExpression(node.initializer)
  ) {
    for (const element of node.initializer.elements) {
      if (!ts.isObjectLiteralExpression(element)) continue;
      const entry = {};
      for (const prop of element.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isStringLiteralLike(prop.initializer)
        )
          entry[prop.name.getText(exampleFile)] = prop.initializer.text;
      }
      if (entry.source) {
        const demo = [
          ...exampleFile.statements,
          ...migrationFile.statements,
        ].find(
          (statement) =>
            ts.isFunctionDeclaration(statement) &&
            statement.name?.text === entry.source,
        );
        if (!demo) throw new Error(`Missing example source: ${entry.source}`);
        entry.code = demo.getText().replace(/\bUI\./g, "");
      }
      if (entry.name && entry.code) exampleEntries.push(entry);
    }
  }
  ts.forEachChild(node, collectExamples);
}
collectExamples(exampleFile);
if (!exampleEntries.length)
  throw new Error(
    "No examples found; refusing to generate an empty component catalog.",
  );
const names = exampleEntries.map((e) => e.name);
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ".");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile("src/index.ts");
const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(source));
const fallbackCategory = {
  Icon: "Icons",
  DataTable: "Tables & collections",
  Heading: "Primitives",
  ListToolbar: "Tables & collections",
  pageCount: "Tables & collections",
};
const extraDescriptions = {
  ListToolbar:
    "One list control row for search, filters, sorting and actions, with applied filter chips below. Controls wrap on narrow screens.",
  pageCount:
    "Return the number of pages for a nonnegative total and a positive integer page size. Empty collections have zero pages.",
};
const supportedTypes = new Map(
  symbols
    .map((symbol) => {
      const resolved =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      return [
        symbol.name,
        resolved.declarations?.find(
          (declaration) =>
            ts.isInterfaceDeclaration(declaration) ||
            ts.isTypeAliasDeclaration(declaration),
        ),
      ];
    })
    .filter(
      ([, declaration]) =>
        declaration &&
        path
          .resolve(declaration.getSourceFile().fileName)
          .startsWith(path.resolve("src")),
    ),
);
function referencedTypes(typeTexts) {
  const collected = new Map();
  function collect(text) {
    for (const identifier of text.match(/\b[A-Za-z_]\w*/g) ?? []) {
      const declaration = supportedTypes.get(identifier);
      if (!declaration || collected.has(identifier)) continue;
      const definition = declaration.getText();
      collected.set(identifier, definition);
      collect(definition);
    }
  }
  typeTexts.forEach(collect);
  return [...collected].map(([name, definition]) => ({ name, definition }));
}
const components = names.map((name) => {
  const example = exampleEntries.find((entry) => entry.name === name);
  const kind = example.kind ?? (name === "toast" ? "utility" : "component");
  let symbol = symbols.find((s) => s.name === name);
  if (!symbol) throw new Error(`Example ${name} has no export`);
  if (symbol.flags & ts.SymbolFlags.Alias)
    symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const file = declaration.getSourceFile();
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  const param = signature?.parameters[0];
  const propsType = param
    ? checker.getTypeOfSymbolAtLocation(param, declaration)
    : null;
  const props =
    kind === "utility"
      ? (signature?.parameters ?? []).map((parameter) => {
          const declaration = parameter.declarations[0];
          return {
            name: parameter.name,
            type:
              declaration.type?.getText() ??
              checker.typeToString(
                checker.getTypeOfSymbolAtLocation(parameter, declaration),
              ),
            required: !declaration.questionToken && !declaration.initializer,
          };
        })
      : propsType
        ? checker
            .getPropertiesOfType(propsType)
            .filter((p) =>
              p.declarations?.some((d) =>
                path
                  .resolve(d.getSourceFile().fileName)
                  .startsWith(path.resolve("src")),
              ),
            )
            .map((p) => ({
              name: p.name,
              type:
                p.declarations?.find((d) => d.type)?.type.getText() ??
                checker.typeToString(
                  checker.getTypeOfSymbolAtLocation(p, declaration),
                  declaration,
                  ts.TypeFormatFlags.NoTruncation,
                ),
              required: !(p.flags & ts.SymbolFlags.Optional),
            }))
        : [];
  const design = paper.find((p) => p.name === name);
  const filePath = path.relative(".", file.fileName).replaceAll("\\", "/");
  return {
    name,
    kind,
    exampleCode: example.code,
    usage: `${example.code.includes("useState") ? 'import {useState} from "react";\n' : ""}import {${symbols
      .filter((symbol) => new RegExp(`\\b${symbol.name}\\b`).test(example.code))
      .map((symbol) => symbol.name)
      .join(
        ", ",
      )}} from "@parya/design-system";\nimport "@parya/design-system/styles.css";\n\n${example.code}`,
    types: referencedTypes(props.map((prop) => prop.type)),
    returnType:
      kind === "utility"
        ? signature
          ? checker.typeToString(checker.getReturnTypeOfSignature(signature))
          : checker.typeToString(type)
        : null,
    category:
      design?.category ?? fallbackCategory[name] ?? "Overlays & feedback",
    description:
      design?.description ??
      {
        Icon: "151 exact SVG icons from the Paper library.",
        DataTable:
          "A semantic table with sorting, controlled row selection, and responsive overflow.",
        Heading: "A heading that follows the nearest HeadingLevelProvider.",
      }[name] ??
      extraDescriptions[name] ??
      "Parya React component.",
    guidance: design?.guidance ?? [],
    paperApi: design?.paperApi ?? "",
    paperUrl:
      design?.paperUrl ??
      "https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR",
    states: design?.states ?? [],
    status: "experimental",
    sourcePath: filePath,
    sourceLine:
      file.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
    props,
  };
});
const hooks = [
  {
    name: "useDisclosure",
    description: "Control open, closed, and toggle behavior for an overlay.",
    code: "const {open, setOpen, show, hide, toggle} = useDisclosure();",
  },
  {
    name: "useControllableState",
    description:
      "Support a controlled value and an uncontrolled default with one state interface.",
    code: "const [value, setValue] = useControllableState(props.value, props.defaultValue, props.onValueChange);",
  },
  {
    name: "useMediaQuery",
    description:
      "Subscribe to a media query. Returns false on the server and updates after mounting.",
    code: 'const compact = useMediaQuery("(max-width: 620px)");',
  },
  {
    name: "useTheme",
    description:
      "Read the nearest Parya ThemeProvider and its optional theme setter.",
    code: "const {theme, setTheme} = useTheme();",
  },
];
// Validate copyable examples against the same public exports as consumers.
// Virtual files keep generated checks out of the working tree.
const exampleFiles = new Map(
  exampleEntries
    .filter((entry) => entry.source)
    .map((entry) => [
      path.resolve("src", `.docs-example-${entry.name}.tsx`),
      components
        .find((component) => component.name === entry.name)
        .usage.replaceAll('from "@parya/design-system"', 'from "./index"'),
    ]),
);
const host = ts.createCompilerHost(parsed.options);
const getSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (
  fileName,
  languageVersion,
  onError,
  shouldCreateNewSourceFile,
) => {
  const text = exampleFiles.get(path.resolve(fileName));
  return text === undefined
    ? getSourceFile(
        fileName,
        languageVersion,
        onError,
        shouldCreateNewSourceFile,
      )
    : ts.createSourceFile(
        fileName,
        text,
        languageVersion,
        true,
        ts.ScriptKind.TSX,
      );
};
const copyProgram = ts.createProgram(
  [...exampleFiles.keys()],
  parsed.options,
  host,
);
const copyErrors = ts
  .getPreEmitDiagnostics(copyProgram)
  .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
if (copyErrors.length)
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(copyErrors, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    }),
  );
await mkdir("site/src/generated", { recursive: true });
await mkdir("site/public/docs", { recursive: true });
await mkdir("site/public/api", { recursive: true });
await writeFile(
  "site/src/generated/components.json",
  JSON.stringify(components, null, 2),
);
await writeFile(
  "site/src/generated/hooks.json",
  JSON.stringify(hooks, null, 2),
);
await writeFile(
  "site/public/api/components.json",
  JSON.stringify({ version: pkg.version, components, hooks }, null, 2),
);
const blocks = [foundationsMarkdown];
for (const c of components) {
  const snippet = exampleEntries.find((e) => e.name === c.name).code;
  const usage = c.usage;
  const md = `# ${c.name}\n\n${c.description}\n\nVersion: ${pkg.version}\nStatus: experimental. Not yet approved for production.\n\n## Installation\n\nThe package is not yet published to an npm registry. Use a locally built package or the repository checkout; see README.md.\n\n## Usage\n\nProvide application data, event handlers, and any referenced application components in the example. Render components inside ThemeProvider; mount Toaster once if using toast.\n\n\`\`\`tsx\n${usage}\n\`\`\`\n\n## API\n\n${c.props.length ? "| Prop | Type | Required |\n| --- | --- | --- |\n" + c.props.map((p) => `| ${p.name} | \`${p.type.replaceAll("|", " / ").replaceAll("\n", " ")}\` | ${p.required ? "Yes" : "No"} |`).join("\n") : "See the typed source for the full signature."}\n\nNative element attributes are supported where the public interface extends them.\n\n## Design guidance\n\n${c.guidance.join("\n\n") || "Use the Paper design reference and semantic tokens."}\n\n## Accessibility\n\nPreserve visible labels and accessible names. Test the complete workflow with keyboard navigation and assistive technology. Automated checks do not establish WCAG conformance.\n\n## References\n\n- [Source](https://github.com/yakosasam797/parya.designsystem.code/blob/main/${c.sourcePath}#L${c.sourceLine})\n- [Paper](${c.paperUrl})\n- [Storybook source](https://github.com/yakosasam797/parya.designsystem.storybook)\n\n## Agent instructions\n\nUse only APIs documented above. Do not assume parity with the historical design system or invent unsupported props from Paper labels. Use --pt-* semantic tokens; preserve keyboard and screen reader behavior.\n`;
  let reference = md;
  if (c.name === "AppShell")
    reference = reference.replace(
      "mount Toaster once if using toast.",
      "AppShell mounts Toaster by default; do not mount a second one in its pages.",
    );
  if (c.kind === "utility")
    reference = reference
      .replace("| Prop |", "| Parameter |")
      .replace(
        "Native element attributes are supported where the public interface extends them.",
        `Returns: \`${c.returnType}\`. This is a function, not a React component. It returns a new array where applicable and does not mutate the input rows.`,
      );
  if (c.types.length)
    reference = reference.replace(
      "## Design guidance",
      `## Referenced types\n\n\`\`\`ts\n${c.types.map((type) => type.definition).join("\n\n")}\n\`\`\`\n\n## Design guidance`,
    );
  await writeFile(`site/public/docs/${c.name}.md`, reference);
  blocks.push(reference);
}
for (const hook of hooks)
  await writeFile(
    `site/public/docs/${hook.name}.md`,
    `# ${hook.name}\n\n${hook.description}\n\n\`\`\`tsx\nimport {${hook.name}} from "@parya/design-system";\n${hook.code}\n\`\`\`\n`,
  );
await writeFile(
  "site/public/llms.txt",
  `# Parya Design System\n\n> React and TypeScript components for travel SaaS. Version ${pkg.version}; experimental.\n\n## Start here\n\n- [Foundations: typography, color and accessibility](./docs/foundations.md)\n- [Machine-readable foundation roles](./api/foundations.json)\n- [Agent instructions](./agents.md)\n- [Complete documentation](./llms-full.txt)\n- [Machine-readable component API](./api/components.json)\n\n## Components\n\n${components.map((c) => `- [${c.name}](./docs/${c.name}.md): ${c.description.split(".")[0]}`).join("\n")}\n`,
);
await writeFile("site/public/llms-full.txt", blocks.join("\n\n---\n\n"));
await writeFile("site/public/agents.md", await readFile("AGENTS.md", "utf8"));
await writeFile(
  "site/public/design-coverage.json",
  JSON.stringify(
    paper.map((p) => ({
      ...p,
      status: components.some((c) => c.name === p.name)
        ? "experimental"
        : "design-only",
    })),
    null,
    2,
  ),
);
console.log(
  `Generated ${components.length} code references, ${hooks.length} hooks, Markdown, and LLM endpoints; ${exampleFiles.size} complete examples type-checked.`,
);
