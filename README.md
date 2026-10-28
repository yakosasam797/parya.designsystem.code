# Parya Design System

A fresh React 19 and TypeScript implementation of the Paryatech Paper library, with a documentation website and a separate connected Storybook repository. Created from Paper specifications, not copied from the historical Paryatech implementation.

**Version 0.2.0 is experimental.** It includes 92 live code references, including five list utilities, four hooks, 518 exported Paper tokens, and 151 exact SVG icons. The complete Paper inventory is documented, including designs that have not yet been implemented. A component's presence in Paper does not imply it is available in this package or that all its designed variants are implemented.

## Open locally

```sh
npm ci
npm run dev
```

Documentation: http://127.0.0.1:5190/ · Storybook: http://127.0.0.1:6008/ after starting its repository.

## Repository responsibilities

| Location                                                                             | Responsibility                                                                                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [Paper library](https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR)            | Visual design specifications, tokens, anatomy, and state specimens                                            |
| This repository                                                                      | Component implementation, typed API, shared live examples, documentation website, machine-readable references |
| [Storybook repository](https://github.com/yakosasam797/parya.designsystem.storybook) | Storybook configuration, controls, accessibility panel, story tests, and its static build                     |

Storybook consumes this library and its examples. It does not maintain a second component implementation.

## Website features

- Searchable component navigation and direct links to GitHub source, Paper, and Storybook.
- Interactive examples, light/dark previews, compact preview widths, and Button controls.
- TypeScript-generated API tables and current implementation signatures.
- A complete vendor-list workflow with search, filter groups, removable chips, shared sorting, pagination and selection across pages.
- Utility parameter tables, referenced type definitions, and complete collection snippets type-checked against the public exports.
- Copy code, Copy for LLM, standalone Markdown views, `/llms.txt`, `/llms-full.txt`, `/agents.md`, and `/api/components.json`.
- Foundations browser, hooks documentation, release notes, and a design-to-code coverage map.

The AI features provide documentation context. This version has no hosted LLM service or MCP server.

## Library usage

```tsx
import {
  ThemeProvider,
  Button,
  TextField,
  Toaster,
} from "@parya/design-system";
import "@parya/design-system/styles.css";

export function App() {
  return (
    <ThemeProvider theme="light">
      <TextField label="Traveler name" leadingIcon="user" />
      <Button variant="primary">Create booking</Button>
      <Toaster />
    </ThemeProvider>
  );
}
```

The package is not published to npm. Run `npm run build:lib` then `npm pack`; install the resulting `.tgz` in a consumer application. Package registry ownership and publishing credentials remain to be chosen.

React 19 is a peer dependency. Node.js 22.12+ is required for tooling. The package includes a client entry point for React frameworks. Supported browsers and Next.js integration still require acceptance testing in the real application.

## Foundations guidance

Open `/#/foundations` for typography roles, font and weight guidance, semantic color pairings, a theme-aware contrast calculator, spacing and shape examples, and the full token explorer. Examples use the existing Paper values. The typography specimens can be edited and enlarged to 200%.

Load `@parya/design-system/styles.css` once to use the generated typography classes:

```tsx
<h1 className="pt-type-page-title">Bookings</h1>
<h2 className="pt-type-section-title">Traveler details</h2>
<p className="pt-type-body">Confirm the passport name before issuing the ticket.</p>
```

Choose the HTML element by meaning, independently of the visual role. Use the real components for controls and data formatting. `design/foundation-guidance.json` combines the Paper role declarations with authored usage guidance; `scripts/generate-foundations.mjs` generates `src/typography.css`, `/docs/foundations.md`, and `/api/foundations.json`. The guide is included in LLM documentation and the packaged catalog. Contrast results evaluate one combination; they are not a WCAG conformance claim.

## Development

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run check` runs types, unit/interaction tests, library build, and documentation build. Playwright verifies navigation, all component previews, clipboard content, Markdown, mobile overflow, and accessibility on selected pages. Install its browser with `npx playwright install chromium` when needed.

Source is in `src/components/`. Shared examples are in `src/examples.tsx`. `scripts/generate-docs.mjs` reads TypeScript to generate API references and Markdown. `design/` contains the exact Paper token snapshot, page inventory, and representative JSX reference exports. Paper family names are preserved through font aliases generated by `scripts/build-fonts.mjs`.

## Hosting later

`npm run build:docs` produces `site/dist/`, which can be deployed to a static host. Build-time settings:

- `VITE_STORYBOOK_URL`: the final Storybook origin, including any base path.
- `DOCS_BASE`: `/` by default; set a project subpath when necessary.

The development website links to local Storybook. A public build without `VITE_STORYBOOK_URL` shows setup guidance instead of linking visitors to localhost. GitHub Actions validate changes and upload reviewable build artifacts; no deployment or npm publication is enabled.

## Production adoption

See [PRODUCTION.md](PRODUCTION.md) for the remaining work and decisions. In particular, design-only components, incomplete Paper variants, assistive technology testing, visual baselines, localization, application validation rules, ownership, versioning, package distribution, and hosting need completion or confirmation.

No open-source license has been granted. The package is marked UNLICENSED until its owner chooses licensing terms.
