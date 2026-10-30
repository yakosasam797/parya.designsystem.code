# Hosting Parya

One GitHub repository contains the library and both applications. The repository keeps its existing name, `parya.designsystem.code`. No second checkout or Git submodule is needed.

## Vercel

Import this repository twice, creating two Vercel projects. Set their Root Directory as follows and allow the build to include files outside that directory so each application can use the shared workspace.

| Setting | Documentation project | Storybook project |
| --- | --- | --- |
| Root Directory | `apps/docs` | `apps/storybook` |
| Framework | Other | Other |
| Install | `cd ../.. && npm ci` | `cd ../.. && npm ci` |
| Build | `cd ../.. && npm run build:docs` | `cd ../.. && npm run build:storybook` |
| Output, relative to app | `dist` | `storybook-static` |

The app-level `vercel.json` files contain these commands. Use Node.js 22.12 or newer. The root lockfile installs every workspace, and its prepare step builds the library and shared catalog. Builds run from the same repository commit. `storybook-static/` and `dist/` are generated output, so Git does not store them.

Deploy Storybook first, then set `VITE_STORYBOOK_URL` in the documentation project's Production and Preview environments to the Storybook origin, for example `https://your-storybook-domain.example`. Rebuild documentation after changing this value. This connects component links to the published Storybook. An unset value shows setup guidance in a public build. Local development automatically uses port 6008.

For a local override, copy the root `.env.example` to `.env.local` and edit it there. The documentation app loads environment files from the repository root. Keep local environment files and Vercel's `.vercel/` project links out of Git.

Each project receives its own URL. Connect the final domains in Vercel's project settings. Documentation uses hash routes, so component URLs such as `/#/components/Button` need no SPA rewrite that might swallow `/docs/*.md` or `/api/*.json`.

No Vercel project or deployment has been created by this migration. Configure the projects after reviewing and pushing the repository changes.

Vercel references: [Monorepos](https://vercel.com/docs/monorepos), [project configuration](https://vercel.com/docs/project-configuration).

## Component distribution

Hosting the websites does not publish the library. Your SaaS consumes `@parya/design-system` as a separate versioned package:

```sh
npm run build:lib
npm run pack:lib
```

Install the archive path printed by npm into the SaaS. A future registry release can use the same package name and exports. The root workspace and both applications are private; only `packages/web` is the distributable library. No registry publication is enabled.

## Moving from two repositories

Use this repository for future component, documentation and Storybook changes. The old Storybook repository is no longer a dependency. Its existing history can remain available for reference; archiving or redirecting it is a separate repository administration action.
