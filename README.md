# Parya Design System

A fresh React 19 and TypeScript implementation of the Paryatech Paper library, with a documentation website and a separate connected Storybook repository. Created from Paper specifications, not copied from the historical Paryatech implementation.

**Version 0.2.0 is experimental.** It includes 151 live code references, including collection and domain utilities, four hooks, 518 exported Paper tokens, and 151 exact SVG icons. The live inventory of 219 Paper artboards is documented, including designs that have not yet been implemented. A component's presence in Paper does not imply it is available in this package or that all its designed variants are implemented.

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
- Brand Assets with four Paryatech logo colors, original SVG/transparent PNG downloads, format-specific ZIP packs, and usage guidance. The header uses the supplied logo in teal for light mode and white for dark mode.

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

## Application shell

Use `AppShell` as the application frame: primary navigation stays in the left card, while each page renders inside the right workspace. The shell provides collapse, child destinations, breadcrumbs, search and account action slots, a mobile navigation dialog, and independent sidebar/workspace scrolling. It uses the exact Paper sidebar width, topbar height, gap, and surface tokens. It does not supply authentication or business services.

Open `/#/components/AppShell` for the live example and API, or `/#/examples/app-shell` for the full-page travel workspace. `Sidebar` and `Topbar` have their own reference pages and Storybook stories. The shell mounts `Toaster` by default; avoid mounting a second one. Use `embedded` when nesting it in an existing main landmark.

```tsx
const [activeNavId, setActiveNavId] = useState("bookings");

<ThemeProvider theme="light">
  <AppShell
    navGroups={[
      {
        id: "travel",
        items: [{ id: "bookings", label: "Bookings", icon: "bookings" }],
      },
    ]}
    activeNavId={activeNavId}
    onNavigate={setActiveNavId}
    breadcrumbs={[{ label: "Bookings" }]}
  >
    <PageHeader title="Bookings" />
    {/* Render the active page here. */}
  </AppShell>
</ThemeProvider>;
```

## Shared workspace sections

Use `NotesPanel` for internal notes scoped to a module or record, `EmailCommunication` for mailbox threads and an inline composer, and `ActivityTimeline` / `ActivityTable` for recent updates and searchable history. Each has a live documentation page and a shared Storybook example. The full-page AppShell example connects notes, communication, activity, credits, open records, account controls, and notifications.

Applications supply records, draft state, permissions, and async save/send callbacks. Examples keep data in memory; they do not deliver email, upload attachments, or persist changes. Keep internal notes out of customer-facing views. Paper currently offers four NotesPanel review directions; the final direction remains unfrozen.

The Studio inventory audit covers all 150 non-guideline names. This package now has 149 matching names plus `Heading` and `pageCount`. `MinorRateMatrix` is the only Studio entry absent from live Paper and is intentionally awaiting its design. `RateMatrix` uses major-unit amounts; it must not be substituted for a minor-unit matrix. Same-name coverage does not establish API, behavior, or visual parity with Studio. See `design/studio-inventory-audit.json` for the full reconciliation.

Open `design/studio-inventory-audit.html` for the searchable matrix. After building the library and synchronizing Storybook, run `node scripts/reconcile-studio-inventory.mjs` to refresh it from the captured Studio names, current Paper catalog, runtime exports, and generated stories. The original Studio inventory is a reference for names and guidance, not component implementation.

## Foundations guidance

Open `/#/foundations` for typography roles, font and weight guidance, semantic color pairings, a theme-aware contrast calculator, spacing and shape examples, and the full token explorer. Examples use the existing Paper values. The typography specimens can be edited and enlarged to 200%.

Load `@parya/design-system/styles.css` once to use the generated typography classes:

```tsx
<h1 className="pt-type-page-title">Bookings</h1>
<h2 className="pt-type-section-title">Traveler details</h2>
<p className="pt-type-body">Confirm the passport name before issuing the ticket.</p>
```

Choose the HTML element by meaning, independently of the visual role. Use the real components for controls and data formatting. `design/foundation-guidance.json` combines the Paper role declarations with authored usage guidance; `scripts/generate-foundations.mjs` generates `src/typography.css`, `/docs/foundations.md`, and `/api/foundations.json`. The guide is included in LLM documentation and the packaged catalog. Contrast results evaluate one combination; they are not a WCAG conformance claim.

## Phone layouts and release history

The playground's **Phone · 390px** option uses a separate browser viewport. Tables default to labelled cards below a 600px container width while retaining sorting and selection; pass `mobileLayout="scroll"` for wide comparison tables. Forms, record rails and dashboard panels stack within narrow containers. Board stages and schedule weeks use compact navigation. The same components and semantic tokens serve both sizes.

Open `/#/releases` for history by package and version. Edit `design/release-history.json`; `npm run build:docs` generates `CHANGELOG.md`, the Releases page data, `/docs/releases.md` and `/api/releases.json`. Unreleased work stays separate from recorded package versions. The matching Paper references are on **17 · Phone layouts**, with the release ledger on **16 · Coverage & handoff**.

`node scripts/audit-phone.mjs` captures the local phone examples (optionally pass a viewport width). With the documentation server running, `node scripts/export-phone-paper.mjs` exports measured editable visual groups and screenshots to `artifacts/paper-phone/`, using `design/paper-tokens.json`. Pass component case IDs, such as `agenda`, to limit the capture. These are static design references; code remains the source for interactions.

`design/phone-references.json` maps the 22 editable phone artboards, guide and release ledger to their Paper pages. The older desktop-width captures are labelled as historical references and point to page 17.

## Development

The logo library is available at `/#/brand-assets`. Original downloads live in `site/public/brand/svg/` and `site/public/brand/png/`; descriptive filenames preserve the supplied file bytes. `site/src/brand/manifest.json` drives previews, colors, filenames, and file sizes. Keep it synchronized with `site/public/brand/manifest.json` and the three ZIP packs when updating assets. Header SVG copies have a tighter viewBox for legibility; their paths and colors are unchanged. Usage notes are in `site/public/brand/README.md`.

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
