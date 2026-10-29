# Changelog

Recorded preview versions. The component library is not published to npm; Storybook is a private application.

Templates own page spacing. Phone layouts reuse the same template slots, semantic tokens and components; smaller screens change their arrangement.

## @parya/design-system

React components, foundations, hooks and page templates.

Source: https://github.com/yakosasam797/parya.designsystem.code

### Unreleased — Phone layouts and release history

#### Improved

- Labelled table cards preserve sorting and selection in narrow containers; scrolling tables remain available.
- Phone navigation uses a focus-managed dialog. Page layouts, forms, board stage navigation and schedule week navigation adapt to smaller screens.
- The playground Phone preview renders in an actual phone viewport.

#### Added

- Package-specific version history, adoption notes and generated release documentation.
- Matching editable 390px Paper references and a release ledger.

**Adoption:** DataTable defaults to cards below 600px container width. Use mobileLayout="scroll" when comparing a wide matrix. No other public API is removed.

### 0.2.0 · 2026-10-28 — Collection workflows and practical foundations

#### Added

- FilterMenu, FilterChips, SortMenu, ListToolbar, ListPageTemplate and IconTextCell.
- Typography roles, color guidance, contrast checks and generated foundation documentation.
- Controlled table sorting and selection across pages; typed utility documentation and shared examples.

**Adoption:** filterRows ignores groups without an accessor. paginate clamps pages beyond the last page; invalid page numbers and sizes still throw. sortRows keeps empty values last in both directions.

### 0.1.0 · 2026-10-28 — Initial experimental implementation

#### Added

- Paper tokens and SVG icon inventory; React components and shared examples.
- Documentation site, source/Paper links, generated API tables, Markdown and LLM references.
- Four reusable hooks and a separate connected Storybook application.

**Adoption:** Install from the repository or a locally packed archive. This recorded preview version was not published to npm.

## parya-designsystem-storybook

Private Storybook application using @parya/design-system.

Source: https://github.com/yakosasam797/parya.designsystem.storybook

### 0.2.0 · 2026-10-28 — Shared component and foundation stories

#### Added

- Stories for the shared v0.2 collection controls, foundation roles and typed examples.
- QuantityField controls synchronized with the shared API.

**Adoption:** Run sync after changing shared examples. This is a private application, not a separately published component library.

### Source update · 2026-10-29 — Workspace stories

Package version unchanged.

- Application shell and keyboard selection examples.
- Shared workspace, content, notification, calendar, chart, pricing and template stories.
