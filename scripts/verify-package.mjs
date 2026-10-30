import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const artifactRoot = path.resolve("artifacts/package-consumer");
await mkdir(artifactRoot, { recursive: true });
const output = await mkdtemp(path.join(artifactRoot, "run-"));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run this check with npm run test:package.");
function run(args, cwd = root) {
  const result = spawnSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0)
    throw new Error(
      `${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`,
    );
  return result.stdout;
}
const packOutput = run([
  "pack",
  "--workspace",
  "@parya/design-system",
  "--ignore-scripts",
  "--json",
  "--pack-destination",
  output,
]);
// Some npm versions include prepare output before their JSON payload.
const packed = JSON.parse(
  packOutput.slice(packOutput.lastIndexOf("\n[") + 1),
)[0];
const version = JSON.parse(
  await readFile("node_modules/react/package.json", "utf8"),
).version;
const typesVersion = JSON.parse(
  await readFile("node_modules/@types/react/package.json", "utf8"),
).version;
await writeFile(
  path.join(output, "package.json"),
  JSON.stringify(
    {
      private: true,
      type: "module",
      dependencies: {
        "@parya/design-system": `file:./${packed.filename}`,
        react: version,
        "react-dom": version,
        "@types/react": typesVersion,
      },
    },
    null,
    2,
  ),
);
console.log("Installing the actual package archive in an isolated consumer…");
console.log(
  run(["install", "--ignore-scripts", "--no-audit", "--no-fund"], output),
);
const catalog = JSON.parse(
  await readFile(
    path.join(output, "node_modules/@parya/design-system/dist/catalog.json"),
    "utf8",
  ),
);
const files = [];
for (const component of catalog.components) {
  const file = path.join(output, `${component.name}.tsx`);
  await writeFile(file, component.usage);
  files.push(file);
}
for (const hook of catalog.hooks) {
  const file = path.join(output, `${hook.name}.tsx`);
  await writeFile(
    file,
    `import {${hook.name}} from "@parya/design-system";\n${hook.code}`,
  );
  files.push(file);
}
const errors = [];
for (const [module, moduleResolution] of [
  [ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
  [ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler],
]) {
  const program = ts.createProgram(files, {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    verbatimModuleSyntax: true,
    target: ts.ScriptTarget.ES2022,
    module,
    moduleResolution,
    jsx: ts.JsxEmit.ReactJSX,
  });
  errors.push(
    ...ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.category === ts.DiagnosticCategory.Error),
  );
}
if (errors.length) {
  await writeFile(
    path.join(output, "type-errors.txt"),
    ts.formatDiagnosticsWithColorAndContext(errors, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (n) => n,
      getNewLine: () => "\n",
    }),
  );
  throw new Error(
    `${errors.length} consumer TypeScript errors. First: ${ts.flattenDiagnosticMessageText(errors[0].messageText, " ")}. See artifacts/package-consumer/type-errors.txt.`,
  );
}
await writeFile(
  path.join(output, "smoke.mjs"),
  `import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import * as UI from '@parya/design-system';
const expected=${JSON.stringify(catalog.components.map((c) => c.name))};
for(const name of expected) if(!(name in UI)) throw new Error('Missing runtime export: '+name);
const html=renderToString(createElement(UI.ThemeProvider,{},createElement(UI.Button,{variant:'primary'},'Create booking')));
if(!html.includes('Create booking') || !html.includes('pt-button--primary')) throw new Error('Consumer render failed');
console.log('Runtime exports and server rendering passed');`,
);
const runtime = spawnSync(process.execPath, [path.join(output, "smoke.mjs")], {
  cwd: output,
  encoding: "utf8",
});
if (runtime.status !== 0) throw new Error(runtime.stderr);
console.log(runtime.stdout);
const visited = new Set();
async function css(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/@import\s+["']([^"']+)["']/g)) {
    const target = match[1].startsWith(".")
      ? path.resolve(path.dirname(file), match[1])
      : path.resolve(output, "node_modules", match[1]);
    await css(target);
  }
  for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (!/^(data:|https?:)/.test(match[1]))
      await stat(
        match[1].startsWith("@")
          ? path.resolve(output, "node_modules", match[1])
          : path.resolve(path.dirname(file), match[1]),
      );
  }
}
await css(
  path.join(output, "node_modules/@parya/design-system/dist/styles.css"),
);
await writeFile(
  path.join(output, "index.html"),
  '<!doctype html><html><head><title>Package consumer</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  path.join(output, "main.tsx"),
  'import {createRoot} from "react-dom/client"; import {ThemeProvider,Button} from "@parya/design-system"; import "@parya/design-system/styles.css"; createRoot(document.getElementById("root")!).render(<ThemeProvider><Button>Create booking</Button></ThemeProvider>);',
);
const { build } = await import("vite");
await build({
  configFile: false,
  root: output,
  logLevel: "error",
  build: { outDir: path.join(output, "build") },
});
const result = {
  archive: packed.filename,
  examples: files.length,
  typeModes: ["NodeNext", "Bundler"],
  verbatimModuleSyntax: true,
  runtimeExports: catalog.components.length,
  cssFiles: visited.size,
  consumerBuild: "passed",
  status: "passed",
};
await writeFile(
  path.join(output, "result.json"),
  JSON.stringify(result, null, 2),
);
await writeFile(
  path.join(artifactRoot, "result.json"),
  JSON.stringify({ ...result, consumerDirectory: output }, null, 2),
);
console.log(JSON.stringify(result));
