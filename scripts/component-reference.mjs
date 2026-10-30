import { readFileSync, readdirSync } from "node:fs";

const css = readdirSync("packages/web/src")
  .filter(
    (name) =>
      name.endsWith(".css") && !["tokens.css", "fonts.css"].includes(name),
  )
  .flatMap((name) => {
    const text = readFileSync(`packages/web/src/${name}`, "utf8");
    return [...text.matchAll(/([^{}]+)\{([^{}]+)\}/g)].map((match) => ({
      selector: match[1].trim(),
      body: match[2],
      file: `packages/web/src/${name}`,
    }));
  });
const special = {
  Checkbox: [
    "Use Tab to reach the checkbox and Space to change it. The label should describe the selected choice, not the result of pressing a button.",
  ],
  Switch: [
    "Use Tab to focus and Space to toggle. Keep a stable setting label; use a switch for a setting that takes effect when changed.",
  ],
  RadioGroup: [
    "Give the group a name using aria-label. Use arrow keys to move between available choices; keep every option's visible label meaningful.",
  ],
  SelectField: [
    "Keep a visible field label. Test arrow-key navigation, Enter selection and Escape dismissal; focus should return to the trigger.",
  ],
  Combobox: [
    "Keep the search field and option names meaningful. Test typing, arrow-key navigation, Enter selection, Escape dismissal and the empty-results message.",
  ],
  MultiSelect: [
    "Name the field and retain named remove actions for selected items. Test keyboard selection and removal, and explain any application selection limit.",
  ],
  ChoiceChips: [
    "Give the group an aria-label. Each choice is a button with aria-pressed; use Tab and Enter or Space to change selection.",
  ],
  SegmentedControl: [
    "Give the group an aria-label. These are pressed-state buttons: use Tab and Enter or Space, rather than assuming radio-group arrow-key behavior.",
  ],
  Menu: [
    "Keep an accessible name on the trigger. Use arrow keys to move between menu items, Enter to activate and Escape to dismiss.",
  ],
  IconButton: [
    "Provide an aria-label that names the action, such as Edit booking. A glyph alone does not supply an accessible action name.",
    "Keep the icon-only target reachable by keyboard; loading and disabled prevent activation.",
  ],
  Icon: [
    "Use label for an informative standalone icon. Omit it for a decorative icon beside text that already explains its meaning.",
    "Keep action names on Button or IconButton rather than attaching a click handler to an SVG.",
  ],
  TextLink: [
    "Use a meaningful destination label and a real href. Use Button for an action that does not navigate.",
    "Keep the focus indicator visible and tell users when a link opens a new context.",
  ],
  Heading: [
    "Choose the semantic heading level using HeadingLevelProvider. Visual size does not determine document order.",
  ],
  HeadingLevelProvider: [
    "Set the starting level to fit the surrounding document. Nest providers when a composed section introduces a deeper heading.",
  ],
  VisuallyHidden: [
    "Use this for text that assistive technology should read while the visual interface omits it. Do not hide focusable controls inside it.",
  ],
  Tooltip: [
    "Use tooltip text as supplementary help. Keep an accessible name on the trigger and put essential instructions in visible text.",
  ],
  Spinner: [
    "Supply a label that identifies the operation in progress. Keep surrounding content stable and provide success or error feedback in the application.",
  ],
  Skeleton: [
    "Provide a meaningful loading message in the surrounding region. Placeholder shapes do not explain what is loading.",
  ],
  Meter: [
    "Supply a meaningful label and a positive max. Keep the visible numeric value and units understandable outside the colored bar.",
  ],
  Avatar: [
    "Use the person's name to identify them when the avatar carries information. Avoid repeating that name in an adjacent accessible label unnecessarily.",
  ],
  FileDropzone: [
    "Retain keyboard access to the file input as an alternative to dragging. Explain accepted types and size limits before selection.",
    "Announce validation errors and keep file names visible. Server validation, uploads and progress feedback belong to the host application.",
  ],
  DataTable: [
    "Keep column headings and row identities meaningful. Name row selection controls and action buttons.",
    "Test keyboard sorting and selection with the supplied data. Retain a usable table or labeled mobile cards when space is limited.",
  ],
  AppShell: [
    "Use one main landmark in the page. Set embedded when nesting a shell preview inside an existing main region.",
    "Pass the current navigation state and real routing callbacks. Verify focus return after mobile navigation closes.",
    "The shell mounts Toaster by default; avoid adding a duplicate live announcer.",
  ],
  DateRangeField: [
    "Label both date endpoints and provide feedback when the end date precedes the start. Apply booking eligibility rules in the application.",
  ],
  PhoneField: [
    "Provide the supported country list and country-code change handler when controlling the prefix. Validate the complete number in the application.",
  ],
  MoneyField: [
    "State the currency and use major-unit values. Explain amount limits and validate financial rules in the application.",
  ],
  Money: [
    "Supply major-unit values and the intended currency and locale. Keep positive, negative and missing amounts understandable without color.",
  ],
  DateText: [
    "Supply a valid date and the intended locale and time zone. Explain dates in the context of the trip or operation.",
  ],
  PaxSelector: [
    "Keep traveler categories and child ages understandable. Apply maxTotal and validate the booking's age and occupancy rules in the application.",
  ],
  RateMatrix: [
    "Use major-unit amounts and retain season, room and occupancy labels when editing. Associate validation feedback with the relevant rate.",
    "Apply business rules and persistence in the application. This component is not a minor-unit rate matrix.",
  ],
  NotesPanel: [
    "Keep drafts scoped to the current record and provide save feedback. Protect unsaved work when the application changes route.",
    "Keep internal notes out of customer-facing views.",
  ],
  EmailCommunication: [
    "Name recipient, subject and composer controls clearly. Retain drafts and expose sending, success and failure feedback.",
    "Delivery, attachment upload and authorization belong to the application.",
  ],
  ConfirmDialog: [
    "Name the destructive action clearly in the title and confirmation label. Include enough context to distinguish the affected record.",
  ],
  RecordPreviewPanel: [
    "This is a compatibility surface. Prefer a full record page for larger workflows; keep dismiss and navigation actions clearly named.",
  ],
  Sheet: [
    "This is a compatibility surface. Prefer Modal for bounded content and a full page for larger tasks.",
  ],
  toast: [
    "Use brief feedback that explains the outcome. Keep essential errors or required actions visible in the page as well as in a transient toast.",
  ],
  Toaster: [
    "Mount one toast host for the application. AppShell already provides one unless withToaster is disabled.",
  ],
  MiniCalendar: [
    "Keep selected dates and month navigation understandable without relying on color. Pair the calendar with visible date context.",
  ],
  KanbanBoard: [
    "Give each stage a clear name and preserve a keyboard-accessible route to every record. Do not make dragging the only way to change a stage.",
  ],
};

export function componentReference(doc, implementation, exports, tokenValues) {
  const props = new Set(doc.props.map((prop) => prop.name));
  const isVisual = doc.kind === "component";
  const classes = [
    ...new Set(implementation.match(/pt-[a-z0-9-]+/g) ?? []),
  ].map((value) => value.replace(/-+$/, ""));
  const rules = isVisual
    ? css.filter((rule) =>
        rule.selector.split(",").some((selector) => {
          // Do not attribute a calendar's descendant button overrides to every Button.
          const first = selector.match(/\.(pt-[\w-]+)/)?.[1];
          return (
            first &&
            classes.some(
              (name) => first === name || first.startsWith(`${name}--`),
            )
          );
        }),
      )
    : [];
  const tokens = [
    ...new Set(
      rules.flatMap((rule) =>
        [...rule.body.matchAll(/var\((--pt-[\w-]+)/g)].map((match) => match[1]),
      ),
    ),
  ];
  const entries = (pattern) =>
    tokens
      .filter((name) => pattern.test(name))
      .map((name) => ({
        name,
        value: tokenValues.get(name) ?? "See the shared CSS definition",
      }));
  const composition = [
    ...new Set(
      [...implementation.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map(
        (match) => match[1],
      ),
    ),
  ].filter((name) => name !== doc.name && exports.includes(name));
  const icons = doc.props
    .filter((prop) => prop.type.includes("IconName"))
    .map((prop) => ({ name: prop.name, required: prop.required }));
  let accessibility = [...(special[doc.name] ?? [])];
  if (isVisual) {
    if (props.has("label"))
      accessibility.push(
        `Give ${doc.name} a meaningful label that explains its purpose in the surrounding workflow.`,
      );
    if (props.has("aria-label"))
      accessibility.push(
        `Set aria-label to identify this ${doc.name} control or group. Keep that name consistent with the visible action or legend.`,
      );
    if (props.has("error"))
      accessibility.push(
        "Provide a specific error message and a way to correct the value. A colored border alone is insufficient.",
      );
    if (props.has("onValueChange") || props.has("onCheckedChange"))
      accessibility.push(
        "When supplying controlled state, update it in the matching change callback. Verify keyboard interaction and preserve the visible focus indicator.",
      );
    if (props.has("disabled"))
      accessibility.push(
        "Explain why an action is unavailable in visible surrounding text. Keep the enabled and disabled states consistent with application permissions.",
      );
    if (/Modal|Dialog|Popover|Drawer|Sheet|CommandPalette|Menu/.test(doc.name))
      accessibility.push(
        "Give the overlay a meaningful title or label using its documented API. Test keyboard opening, dismissal and focus return to the trigger in the complete workflow.",
      );
    if (/Chart|BarList|Sparkline/.test(doc.name))
      accessibility.push(
        "Describe the metric, units and period. Supply an accessible label where the API supports it and an adjacent data summary or table when the visual alone cannot communicate the result.",
      );
    if (/Chip|Badge|Label|Dot|Legend|Signal/.test(doc.name))
      accessibility.push(
        "Keep a text explanation of the status or category; color and icon shape must not be the only way to distinguish meaning.",
      );
    if (/Template|Layout|Panel|Section|Stack|Grid|Divider/.test(doc.name))
      accessibility.push(
        "Choose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.",
      );
    if (
      /Cell|Money|DateText|List|Timeline|Summary|Header|Season|EventRow/.test(
        doc.name,
      )
    )
      accessibility.push(
        "Keep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.",
      );
    if (!accessibility.length)
      accessibility.push(
        `Keep ${doc.name}'s content meaningful in the surrounding page and preserve semantic labels and reading order. Verify any supplied actions with a keyboard.`,
      );
  } else {
    accessibility.push(
      doc.kind === "constant"
        ? `${doc.name} is a data lookup, not a rendered control. Use its values in labeled components; it does not supply typography, focus or announcements.`
        : `${doc.name} is a utility. It does not render interface semantics; present its result using labeled components and announce relevant loading or error feedback in the application.`,
    );
  }
  if (doc.details?.accessibility) accessibility = doc.details.accessibility;
  return {
    overview: isVisual
      ? `${doc.name} uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.`
      : `${doc.name} belongs to the shared package and is used by components and application code. It has no independent visual style.`,
    typography: entries(/--pt-(?:font-|type-)/),
    colors: entries(/--pt-color-/),
    layout: entries(/--pt-(?:space-|size-|radius-|motion-)/),
    styleSources: [...new Set(rules.map((rule) => rule.file))],
    composition,
    icons,
    accessibility: [...new Set(accessibility)],
    states: doc.props
      .filter((prop) =>
        /(?:disabled|loading|checked|selected|value|error|readOnly|open|variant|size|tone|compact|fullWidth)/.test(
          prop.name,
        ),
      )
      .map((prop) => ({ name: prop.name, type: prop.type })),
  };
}
