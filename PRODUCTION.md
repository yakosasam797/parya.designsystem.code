# Production adoption checklist

This is a working first release of the platform, not full parity with the Paper library or an enterprise readiness certification.

## Implementation coverage

The website's Design coverage page is the current map. In this release, the complete Paper navigation is visible; 151 code references have live examples, while other entries are explicitly design-only. Existing implementations also need state-by-state comparison with Paper. Examples include:

- SelectField uses a styled Radix listbox, including descriptions, icons, optional media, native form values, keyboard selection, and focus return. Confirm the supported option content and application validation rules with consumers.
- DateRangeField implements native date inputs and ordering validation; Paper's compact, inline, presets, and endpoints layouts are not implemented.
- PaxSelector implements adults, children, infants, and child ages. Configurable rooms, extra beds, renamed labels, and all design variants remain to be implemented.
- PhoneField has a short default country list. Applications can provide their supported country list.
- FileDropzone returns selected files and performs client-side type/size checks. Upload, virus scanning, storage, server validation, and authorization belong to the application.
- Shell sections, rate matrix, charts, calendars, boards, domain labels, and page templates now have fresh experimental implementations. Their APIs and supported states require consumer acceptance; they are not drop-in equivalents of the old Studio APIs.
- MinorRateMatrix remains absent from Paper and code. NotesPanel has four review directions in Paper; its final visual direction is not frozen.
- EmailCommunication, notes, notifications, and open records receive application data and callbacks. Mail delivery, uploads, persistence, authorization, audit logging, and unsaved-work protection during application navigation require integration in the host application.
- The collection controls and list helpers now have working examples and generated documentation. The vendor-list recipe verifies their combined behavior using local sample data; application data-loading, server pagination, permissions and business rules remain application responsibilities.

## Engineering acceptance

1. Agree the public APIs and supported variants with the production application team. The API tables describe the new implementation; historical Paper API labels are reference material.
2. Test React framework integration, server rendering, bundling, tree shaking, supported browser versions, reduced motion, zoom, and high contrast settings.
3. Build visual regression baselines against Paper for each required variant and state at agreed breakpoints in both themes.
4. Complete keyboard and screen reader testing with the target devices. Automated accessibility scans are not a conformance claim.
5. Agree localization, RTL requirements, time zones, supported currencies, financial precision, phone validation, traveler age rules, booking limits, permissions, and data-loading/error patterns.
6. Pilot one complete product workflow and resolve acceptance findings.

## Ownership and releases

- Confirm brand name, maintainers, reviewers, and contribution policy.
- Choose the npm/GitHub Packages scope and account ownership; keep tokens in CI secrets, never in source files.
- Use semantic versioning. During the experimental 0.x stage, document breaking changes before consumers upgrade. After 1.0, breaking changes require a major version, migration guidance, and a deprecation policy.
- Choose the public documentation and Storybook domains and hosting provider. Configure the final Storybook URL in documentation builds.
- Enable GitHub CI, required checks, branch protection, dependency updates, and the agreed release process.
- Choose licensing terms before external distribution.

## Inputs needed from the team

No additional input is required to run or review this release locally. Production delivery needs the decisions above, the target application repository, and a named reviewer for visual and behavior acceptance. Hosting and registry access are needed only when publishing is requested.
