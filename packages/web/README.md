# @parya/design-system

Experimental React 19 component library, version 0.3.1. Its source, documentation and Storybook share one repository. See the root README.md and DEPLOYMENT.md for maintainer commands.

Build and pack from the repository root with `npm run build:lib` and `npm run pack:lib`. Install the printed archive path into the consuming application. The library has not been published to npm.

```tsx
import {ThemeProvider, Button} from "@parya/design-system";
import "@parya/design-system/styles.css";

export function App() {
  return <ThemeProvider><Button variant="primary">Create booking</Button></ThemeProvider>;
}
```

The public exports, CSS, examples and catalog are in `dist/`. Both documentation applications use these same component APIs. Typography, semantic colors, icons, spacing and shape are shared foundations. Keep their token bindings when composing product screens. Automated checks do not establish WCAG conformance or production readiness.
