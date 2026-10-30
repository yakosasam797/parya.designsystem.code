import { fileURLToPath } from "node:url";
const source = (path: string) =>
  fileURLToPath(new URL(`../packages/web/src/${path}`, import.meta.url));
// Both applications render the same source during development and builds.
export const packageAliases = [
  {
    find: "@parya/design-system/examples",
    replacement: source("examples.tsx"),
  },
  {
    find: "@parya/design-system/styles.css",
    replacement: source("styles.css"),
  },
  {
    find: "@parya/design-system/tokens.css",
    replacement: source("tokens.css"),
  },
  { find: /^@parya\/design-system$/, replacement: source("index.ts") },
];
