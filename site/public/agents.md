# Building with Parya

This is a new React 19 / TypeScript implementation of the Paryatech Paper library. All components are experimental at version 0.2.0. Do not claim production readiness, WCAG conformance, or parity with historical Paryatech code.

## Consumer instructions

- Import components from `@parya/design-system` and load `@parya/design-system/styles.css` once.
- Wrap the application in `ThemeProvider`. AppShell mounts `Toaster` by default; mount it yourself only outside AppShell, or disable the shell toaster with `withToaster={false}` when sharing one host toaster.
- Use AppShell for the primary sidebar, workspace topbar, and page content. Pass router state through `activeNavId` and `onNavigate`; render PageHeader and business content in children. Use `embedded` and an explicit `height` for nested previews. Sidebar and Topbar are exported building blocks; AppShell composes their responsive behavior.
- Use the generated `catalog.json`, `/api/components.json`, `/llms.txt`, and `/docs/<Component>.md` to discover supported components and exact props.
- Read `/docs/foundations.md` or `/api/foundations.json` for typography roles, semantic color pairings and usage guidance. Typography classes are visual only: choose semantic HTML independently and use real components for controls.
- Reuse NotesPanel for internal module/record notes, EmailCommunication for threads/composer, and ActivityTimeline or ActivityTable for history. Keep draft state keyed by record in the application; supply async callbacks and application navigation guards. RateMatrix uses major units. MinorRateMatrix is not implemented. NotesPanel review directions are not frozen. Sheet and RecordPreviewPanel are compatibility surfaces; prefer full pages for larger tasks.
- Paper contains more designs than this release implements. A design-only entry is not an importable React component.
- List utilities are functions, not components. Apply search, filters and global sorting before pagination. Reset the page when search/filter/sort changes. Use the same SortState for SortMenu and DataTable.
- Use semantic `--pt-*` tokens. Teal means actions/work; pink means selection/person-related emphasis.
- Use visible field labels. Icon buttons need an accessible name. Preserve Radix keyboard and focus behavior.
- Default formats: `en-IN`, `INR`, `Asia/Kolkata`. Keep monetary calculations and booking business rules in application code.
- Customer-facing surfaces must not reveal internal costs, margins, supplier notes, or operations notes.
- Use a Popover for very small content, Modal for medium content that fits without scrolling, and a full page for larger tasks. Reserve drawers for notifications.
- Pass application data and callbacks. The library does not call booking services, upload files, or persist records on its own.

## Maintainer instructions

The user requested this implementation from scratch using Paper. Do not copy implementation from other local Paryatech repositories.

Visual design references are in `design/paper-inventory.json`, `design/paper-tokens.json`, and the linked Paper file. Export exact values with Paper tools; screenshots are for review only. Source code lives in `src/components/`; shared live examples live in `src/examples.tsx`. Documentation APIs are generated from TypeScript, not manually duplicated.

Run `npm run check` before submitting changes. Run `npm run test:e2e` for interaction or accessibility changes. Update Storybook stories after adding shared examples. All tests must pass; do not weaken tests to hide failures. Keep generated Markdown and component schema synchronized via `npm run build:docs`.
