import { useState } from "react";
import * as UI from "@parya/design-system";
import guide from "../../../../design/foundation-guidance.json";
import tokenData from "../../../../design/paper-tokens.json";
import {
  contrastChecks,
  resolveToken,
  roleSnippet,
  tokenContrast,
  typeDetails,
  type PreviewTheme,
} from "./tokens";
import "./foundations.css";

type Copy = (text: string) => Promise<boolean>;
function Copy({
  text,
  label = "Copy code",
  copy,
}: {
  text: string;
  label?: string;
  copy: Copy;
}) {
  return (
    <UI.Button
      size="xs"
      variant="ghost"
      leadingIcon="copy"
      onClick={() => void copy(text)}
    >
      {label}
    </UI.Button>
  );
}
function Code({
  children,
  copy,
  language = "React · TypeScript",
}: {
  children: string;
  copy: Copy;
  language?: string;
}) {
  return (
    <div className="fd-code">
      <div>
        <span>{language}</span>
        <Copy text={children} copy={copy} />
      </div>
      <pre tabIndex={0} role="region" aria-label="Code example">
        <code>{children}</code>
      </pre>
    </div>
  );
}
function ThemeToggle({
  value,
  onChange,
}: {
  value: PreviewTheme;
  onChange: (theme: PreviewTheme) => void;
}) {
  return (
    <UI.SegmentedControl
      aria-label="Example theme"
      value={value}
      onValueChange={(next) => onChange(next as PreviewTheme)}
      options={[
        { value: "light", label: "Light", icon: "sun" },
        { value: "dark", label: "Dark", icon: "circle-dashed" },
      ]}
    />
  );
}
function Typography({ copy }: { copy: Copy }) {
  const [selected, setSelected] = useState("page-title");
  const [custom, setCustom] = useState<string | null>(null);
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [expanded, setExpanded] = useState(false);
  const role = guide.typography.find((item) => item.id === selected)!;
  const details = typeDetails(role);
  const text = custom ?? role.example;
  return (
    <div className="fd-section-stack">
      <section aria-labelledby="fd-type-title">
        <h2 id="fd-type-title">Choose text by its job.</h2>
        <p className="fd-copy">
          Start with the role: a page title names a place; body text explains; a
          label names a control. The family, size, weight and spacing come
          together as one style.
        </p>
        <div className="fd-type-controls">
          <UI.SelectField
            label="Text style"
            value={selected}
            onValueChange={(value) => {
              setSelected(value);
              setCustom(null);
            }}
            options={guide.typography.map((item) => ({
              value: item.id,
              label: `${item.label} · ${item.group}`,
            }))}
          />
          <UI.TextField
            label="Preview text"
            value={text}
            onValueChange={setCustom}
          />
        </div>
        <div className="fd-example">
          <div className="fd-example-toolbar">
            <span>Live specimen</span>
            <div>
              <UI.Switch
                label="200% text"
                checked={expanded}
                onCheckedChange={setExpanded}
              />
              <ThemeToggle value={theme} onChange={setTheme} />
            </div>
          </div>
          <div className="fd-type-surface" data-theme={theme}>
            <p
              className={role.className}
              style={
                expanded
                  ? { fontSize: `calc(${role.css.fontSize} * 2)` }
                  : undefined
              }
            >
              {text || "Your preview text"}
            </p>
            <p className="fd-specimen-note">
              The specimen is a paragraph; choose the appropriate HTML element
              in your application.
            </p>
          </div>
          <dl className="fd-type-details">
            {Object.entries({
              Font: details.family,
              Size: details.size,
              Weight: details.weight,
              "Line height": details.lineHeight,
              "Letter spacing": details.tracking,
            }).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="fd-usage">
          <div>
            <h3>Use it for</h3>
            <p>{role.use}</p>
          </div>
          <div>
            <h3>Choose another role for</h3>
            <p>{role.avoid}</p>
          </div>
        </div>
        <Code
          copy={copy}
        >{`import "@parya/design-system/styles.css";\n\n${roleSnippet(role, text)}`}</Code>
        <p className="fd-note">
          Use Button, TextField, TabBar and Money for their built-in behavior
          and formatting. Typography classes supply visual styles only. A label
          needs its matching input; a table heading belongs inside a table.
        </p>
      </section>
      <section aria-labelledby="fd-families">
        <h2 id="fd-families">Three families. Different responsibilities.</h2>
        <div className="fd-family-list">
          {guide.fonts.map((font) => (
            <div key={font.name}>
              <div
                className="fd-family-name"
                style={{ fontFamily: `var(${font.token})` }}
              >
                {font.name}
              </div>
              <div>
                <p
                  style={{ fontFamily: `var(${font.token})` }}
                  className="fd-family-sample"
                >
                  {font.example}
                </p>
                <p className="fd-copy">{font.use}</p>
                <Copy
                  label="Copy font token"
                  text={`var(${font.token})`}
                  copy={copy}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="fd-weights">
        <h2 id="fd-weights">What the weights mean.</h2>
        <p className="fd-copy">
          The number controls stroke thickness. It is not a heading level or an
          accessibility score. Use the weight defined by the role, then add
          emphasis only where it helps.
        </p>
        <div className="fd-weight-list">
          {guide.weights.map((weight) => (
            <div key={weight.value}>
              <p style={{ fontWeight: weight.value }}>
                <span>{weight.value}</span>
                {weight.name}
              </p>
              <p>{weight.use}</p>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="fd-style-reference">
        <h2 id="fd-style-reference">Text-style reference</h2>
        <p className="fd-copy">
          These are Parya’s operational roles from Paper. Compact styles serve
          dense interfaces; they are not a default for long reading.
        </p>
        <div
          className="fd-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Typography role reference"
        >
          <table className="fd-reference-table">
            <caption className="pt-sr-only">
              Typography roles and recommended uses
            </caption>
            <thead>
              <tr>
                <th scope="col">Role and specimen</th>
                <th scope="col">Specification</th>
                <th scope="col">When to use</th>
                <th scope="col">Code</th>
              </tr>
            </thead>
            <tbody>
              {guide.typography.map((item) => {
                const spec = typeDetails(item);
                return (
                  <tr key={item.id}>
                    <th scope="row">
                      <span className="fd-role-name">{item.label}</span>
                      <p className={item.className}>{item.example}</p>
                    </th>
                    <td>
                      {spec.family}
                      <br />
                      {spec.size}
                      <br />
                      {spec.weight} weight · {spec.lineHeight} line height
                    </td>
                    <td>{item.use}</td>
                    <td>
                      <Copy
                        label={`Copy ${item.label} code`}
                        text={roleSnippet(item)}
                        copy={copy}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="fd-semantics" aria-labelledby="fd-semantics-title">
        <h2 id="fd-semantics-title">
          Big text is a style. A heading is a meaning.
        </h2>
        <p className="fd-copy">
          A screen reader uses the heading structure to navigate. Choose h1, h2
          and h3 by the content outline, independently of the visual style.
        </p>
        <div className="fd-usage">
          <div>
            <h3>A page title</h3>
            <Code copy={copy}>
              {'<h1 className="pt-type-page-title">Bookings</h1>'}
            </Code>
          </div>
          <div>
            <h3>A prominent amount</h3>
            <Code copy={copy}>
              {'<p className="pt-type-page-title">₹1,45,000</p>'}
            </Code>
          </div>
        </div>
        <p className="fd-note">
          Use one descriptive h1 for the page. Nest section headings logically.
          Use strong for meaningful emphasis, th for column headings, and time
          with dateTime for a machine-readable date.
        </p>
      </section>
    </div>
  );
}
function ContrastBadge({ ratio }: { ratio: number | null }) {
  const passes = contrastChecks(ratio).normal;
  return (
    <span className="fd-contrast-badge">
      <UI.Icon name={passes ? "check-circle" : "alert-triangle"} size="sm" />
      {ratio === null
        ? "Cannot calculate"
        : `${ratio.toFixed(2)}:1 · ${passes ? "AA text" : "Below AA text"}`}
    </span>
  );
}
function Color({ copy }: { copy: Copy }) {
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [foreground, setForeground] = useState("--pt-color-text-primary");
  const [background, setBackground] = useState("--pt-color-bg-surface");
  const ratio = tokenContrast(foreground, background, theme),
    checks = contrastChecks(ratio);
  const semantic = tokenData.tokens.filter(
    (token) => token.type === "color" && token.name.startsWith("--pt-color-"),
  );
  return (
    <div className="fd-section-stack">
      <section aria-labelledby="fd-color-title">
        <h2 id="fd-color-title">Choose a meaning, then a pairing.</h2>
        <p className="fd-copy">
          Use semantic tokens such as text-primary or bg-surface. They adapt to
          light and dark themes. Raw palette values are implementation details;
          a matching hue alone does not make a usable pairing.
        </p>
        <div className="fd-color-rules">
          <p>
            <strong>Teal: actions and work.</strong> Use for primary actions and
            links.
          </p>
          <p>
            <strong>Pink: selection and people.</strong> Keep selection distinct
            from success.
          </p>
          <p>
            <strong>Status: the outcome.</strong> Add words such as Confirmed,
            Payment due or Failed; do not rely on a colored dot.
          </p>
        </div>
        <div className="fd-pair-list">
          {guide.colorPairs.map((pair) => (
            <article className="fd-pair" key={pair.id}>
              <div>
                <h3>{pair.label}</h3>
                <p>{pair.use}</p>
                <code>{pair.foreground}</code>
                <code>{pair.background}</code>
                <Copy
                  label={`Copy ${pair.label} CSS`}
                  text={`color: var(${pair.foreground});\nbackground-color: var(${pair.background});`}
                  copy={copy}
                />
              </div>
              <div className="fd-pair-themes">
                {(["light", "dark"] as const).map((mode) => (
                  <div className="fd-pair-mode" key={mode}>
                    <span>{mode === "light" ? "Light" : "Dark"}</span>
                    <div
                      data-theme={mode}
                      className="fd-pair-sample"
                      style={{
                        color: `var(${pair.foreground})`,
                        backgroundColor: `var(${pair.background})`,
                      }}
                    >
                      <span>
                        {pair.id === "action"
                          ? "Create booking"
                          : pair.id === "selected"
                            ? "✓ Selected traveler"
                            : pair.id === "success"
                              ? "✓ Booking confirmed"
                              : pair.id === "danger"
                                ? "! Payment failed"
                                : pair.id === "warning"
                                  ? "! Payment due"
                                  : "Traveler details"}
                      </span>
                    </div>
                    <ContrastBadge
                      ratio={tokenContrast(
                        pair.foreground,
                        pair.background,
                        mode,
                      )}
                    />
                    <p className="fd-color-values">
                      {resolveToken(pair.foreground, mode)} on{" "}
                      {resolveToken(pair.background, mode)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="fd-contrast-title">
        <h2 id="fd-contrast-title">Check the exact combination.</h2>
        <p className="fd-copy">
          Contrast is the difference in brightness between foreground and
          background. Pick a pair and check it in both themes. Results below use
          the unrounded ratio.
        </p>
        <div className="fd-contrast-controls">
          <UI.SelectField
            label="Foreground token"
            value={foreground}
            onValueChange={setForeground}
            options={semantic.map((token) => ({
              value: token.name,
              label: token.name.replace("--pt-color-", ""),
            }))}
          />
          <UI.SelectField
            label="Background token"
            value={background}
            onValueChange={setBackground}
            options={semantic.map((token) => ({
              value: token.name,
              label: token.name.replace("--pt-color-", ""),
            }))}
          />
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
        <div
          className="fd-contrast-preview"
          data-theme={theme}
          style={{
            color: `var(${foreground})`,
            backgroundColor: `var(${background})`,
          }}
        >
          <p className="pt-type-body">Your booking is confirmed.</p>
          <p className="pt-type-section-title">Traveler details</p>
        </div>
        <div className="fd-contrast-result" role="status">
          <strong>
            {ratio === null
              ? "Unsupported color expression"
              : `${ratio.toFixed(2)}:1 contrast`}
          </strong>
          <span>
            {checks.normal
              ? "Meets normal-text AA contrast for this pairing."
              : "Below normal-text AA contrast. Choose a different pair for body text."}
          </span>
        </div>
        <ul className="fd-check-list">
          {[
            ["Normal text", "4.5:1", checks.normal],
            ["Large text", "3:1", checks.large],
            ["Essential control or graphic", "3:1", checks.nonText],
          ].map(([label, target, passes]) => (
            <li key={String(label)}>
              <UI.Icon name={passes ? "check-circle" : "x-circle"} size="sm" />
              <span>{label}</span>
              <span>
                {target} minimum · {passes ? "Pass" : "Fail"}
              </span>
            </li>
          ))}
        </ul>
        <p className="fd-note">
          Large text means at least 24 CSS px regular or about 18.67 CSS px
          bold. Being a heading does not automatically qualify. Alpha colors are
          composited over bg-surface here; images, gradients and additional
          opacity need their own checks. Inactive controls have exceptions, but
          faint text is not a substitute for a readable hint. A contrast pass
          does not certify the component or page.
        </p>
        <Code
          copy={copy}
          language="CSS"
        >{`color: var(${foreground});\nbackground-color: var(${background});`}</Code>
      </section>
      <section aria-labelledby="fd-color-a11y">
        <h2 id="fd-color-a11y">Make the state understandable without color.</h2>
        <div className="fd-example fd-status-example">
          <UI.StatusChip tone="success">Confirmed</UI.StatusChip>
          <UI.StatusChip tone="warning">Payment due</UI.StatusChip>
          <UI.StatusChip tone="danger">Failed</UI.StatusChip>
        </div>
        <p className="fd-copy">
          Keep visible words, a meaningful icon or shape, and the appropriate
          programmatic state. Underline links in paragraphs. Preserve a visible
          focus indicator and check essential boundaries against adjacent
          colors; decorative separators are a different case.
        </p>
      </section>
    </div>
  );
}
function Layout({ copy }: { copy: Copy }) {
  return (
    <div className="fd-section-stack">
      <section>
        <h2>Space shows what belongs together.</h2>
        <p className="fd-copy">
          Use a small gap within a field, a larger gap between fields, and a
          clearer break between sections. Repeat these relationships across
          screens.
        </p>
        <div className="fd-spacing-list">
          {[
            {
              token: "--pt-space-1",
              label: "4px",
              use: "A short hint directly under its field.",
            },
            {
              token: "--pt-space-2",
              label: "8px",
              use: "An icon and its label, or related controls.",
            },
            {
              token: "--pt-space-3",
              label: "12px",
              use: "Compact repeated rows or small component padding.",
            },
            {
              token: "--pt-space-4",
              label: "16px",
              use: "Related fields and standard content padding.",
            },
            {
              token: "--pt-space-6",
              label: "24px",
              use: "Separate content groups or inset a page section.",
            },
            {
              token: "--pt-space-8",
              label: "32px",
              use: "Create a stronger break between major sections.",
            },
          ].map((space) => (
            <div key={space.token}>
              <div>
                <span
                  className="fd-space-bar"
                  style={{ width: `var(${space.token})` }}
                />
                <strong>{space.label}</strong>
              </div>
              <p>{space.use}</p>
              <Copy
                label={`Copy ${space.label} spacing`}
                text={`var(${space.token})`}
                copy={copy}
              />
            </div>
          ))}
        </div>
        <Code copy={copy}>
          {
            'import {TextField} from "@parya/design-system";\nimport "@parya/design-system/styles.css";\n\n<div style={{display: "grid", gap: "var(--pt-space-4)"}}>\n  <TextField label="Traveler name" />\n  <TextField label="Email address" type="email" />\n</div>'
          }
        </Code>
      </section>
      <section>
        <h2>Shape follows the component.</h2>
        <div className="fd-radius-list">
          {[
            {
              token: "--pt-radius-xs",
              label: "5px",
              use: "Tiny badges and small inner details.",
            },
            {
              token: "--pt-radius-sm",
              label: "8px",
              use: "Standard fields, compact cards and controls.",
            },
            {
              token: "--pt-radius-md",
              label: "10px",
              use: "Panels, menus and toolbar controls.",
            },
            {
              token: "--pt-radius-pill",
              label: "Pill",
              use: "Status pills and fully rounded elements.",
            },
          ].map((shape) => (
            <div key={shape.token}>
              <div
                className="fd-radius-sample"
                style={{ borderRadius: `var(${shape.token})` }}
              />
              <strong>{shape.label}</strong>
              <p>{shape.use}</p>
              <Copy
                label={`Copy ${shape.label} radius`}
                text={`var(${shape.token})`}
                copy={copy}
              />
            </div>
          ))}
        </div>
        <p className="fd-note">
          Prefer the component’s existing spacing and radius. These are starting
          points for compositions, not a reason to restyle every component
          independently.
        </p>
      </section>
      <section>
        <h2>Keep focus and movement usable.</h2>
        <p className="fd-copy">
          Never remove focus outlines without a visible replacement. Motion
          should explain a change, and respect prefers-reduced-motion. For
          bigger tasks, follow Parya’s overlay hierarchy: small content in a
          Popover, medium non-scrolling content in a Modal, larger tasks on a
          page.
        </p>
      </section>
    </div>
  );
}
const typeLabels: Record<string, string> = {
  color: "Colors",
  fontFamily: "Font families",
  fontSize: "Text sizes",
  fontWeight: "Font weights",
  letterSpacing: "Letter spacing",
  lineHeight: "Line heights",
  spacing: "Spacing & sizes",
  radius: "Corner radii",
};
function TokenExplorer({ copy }: { copy: Copy }) {
  const [query, setQuery] = useState(""),
    [type, setType] = useState("color"),
    [scope, setScope] = useState("semantic"),
    [theme, setTheme] = useState<PreviewTheme>("light");
  const tokens = tokenData.tokens.filter(
    (token) =>
      token.type === type &&
      (scope === "all" ||
        (!token.name.startsWith("--pt-palette-") &&
          !token.name.startsWith("--pt-dark-"))) &&
      `${token.name} ${token.value}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <section>
      <h2>The complete token reference.</h2>
      <p className="fd-copy">
        A token is a named design decision. Copy its CSS variable into a
        composition. Prefer semantic roles for product UI; use “All exported
        tokens” to inspect private palette values and fixed dark aliases.
      </p>
      <div className="fd-token-controls">
        <UI.SearchField
          placeholder="Search tokens"
          value={query}
          onValueChange={setQuery}
          shortcut=""
        />
        <UI.SelectField
          label="Token category"
          value={type}
          onValueChange={setType}
          options={[
            ...new Set(tokenData.tokens.map((token) => token.type)),
          ].map((value) => ({ value, label: typeLabels[value] ?? value }))}
        />
        <UI.SelectField
          label="Token scope"
          value={scope}
          onValueChange={setScope}
          options={[
            { value: "semantic", label: "Product roles" },
            { value: "all", label: "All exported tokens" },
          ]}
        />
        <ThemeToggle value={theme} onChange={setTheme} />
      </div>
      <p className="fd-note" role="status">
        {tokens.length} matching tokens · {tokenData.tokens.length} in the Paper
        snapshot
      </p>
      <div className="fd-token-grid" data-theme={theme}>
        {tokens.map((token) => (
          <button
            type="button"
            className="fd-token"
            key={token.name}
            aria-label={`Copy ${token.name}`}
            onClick={() => void copy(`var(${token.name})`)}
          >
            {type === "color" ? (
              <span className="fd-token-checker" aria-hidden="true">
                <span style={{ background: `var(${token.name})` }} />
              </span>
            ) : (
              <span
                className="fd-token-specimen"
                style={
                  type === "fontFamily"
                    ? { fontFamily: `var(${token.name})` }
                    : undefined
                }
              >
                {type === "fontFamily" ? "Aa" : String(token.value)}
              </span>
            )}
            <span className="fd-token-name">{token.name}</span>
            <span className="fd-token-resolved">
              {resolveToken(token.name, theme)}
            </span>
            {String(token.value) !== resolveToken(token.name, theme) ? (
              <span className="fd-token-declaration">
                Source: {String(token.value)}
              </span>
            ) : null}
            {token.name.startsWith("--pt-dark-") ? (
              <span className="fd-token-declaration">Fixed dark alias</span>
            ) : null}
            <span className="fd-token-copy">
              <UI.Icon name="copy" size="sm" />
              Copy CSS variable
            </span>
          </button>
        ))}
      </div>
      {!tokens.length ? (
        <UI.EmptyState
          title="No tokens match"
          description="Try a role name such as body, surface or space, or select another category."
        />
      ) : null}
    </section>
  );
}
export default function Foundations({
  section = "typography",
  copy,
}: {
  section?: string;
  copy: Copy;
}) {
  const valid = ["typography", "color", "layout", "tokens"];
  const tab = valid.includes(section) ? section : "typography";
  const base = import.meta.env.BASE_URL;
  return (
    <article className="ds-foundations">
      <div className="ds-breadcrumb">Foundations</div>
      <h1 className="ds-page-title">{guide.title}</h1>
      <p className="ds-lede">{guide.description}</p>
      <div className="fd-resource-row">
        <UI.Button
          variant="primary"
          size="sm"
          leadingIcon="copy"
          onClick={async () => {
            try {
              const response = await fetch(`${base}docs/foundations.md`);
              if (!response.ok) throw new Error();
              const markdown = await response.text();
              if (!markdown.startsWith("# ")) throw new Error();
              await copy(markdown);
            } catch {
              UI.toast("Foundations documentation unavailable", {
                tone: "danger",
              });
            }
          }}
        >
          Copy for LLM
        </UI.Button>
        <a href={`${base}docs/foundations.md`} target="_blank" rel="noreferrer">
          View as Markdown <UI.Icon name="external-link" size="xs" />
        </a>
        <a href={guide.paperTypography} target="_blank" rel="noreferrer">
          Paper foundations <UI.Icon name="external-link" size="xs" />
        </a>
        <a href="#/brand-assets">
          Brand assets <UI.Icon name="arrow-right" size="xs" />
        </a>
      </div>
      <UI.TabBar
        aria-label="Foundation guides"
        value={tab}
        onValueChange={(value) => {
          location.hash = `/foundations/${value}`;
        }}
        items={[
          {
            value: "typography",
            label: "Typography",
            content: <Typography copy={copy} />,
          },
          { value: "color", label: "Color", content: <Color copy={copy} /> },
          {
            value: "layout",
            label: "Spacing & shape",
            content: <Layout copy={copy} />,
          },
          {
            value: "tokens",
            label: "Token explorer",
            content: <TokenExplorer copy={copy} />,
          },
        ]}
      />
      <section className="fd-principles" aria-labelledby="fd-principles-title">
        <h2 id="fd-principles-title">Before a screen is ready</h2>
        <div>
          {guide.principles.map((principle) => (
            <div key={principle.title}>
              <UI.Icon name="check-circle" size="sm" />
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="fd-sources">
        <p>
          Values come from the Parya Paper library. The usage guidance applies
          those values to travel software; it does not claim that every
          component or combination has been approved for production.
        </p>
        <p>Reference reading</p>
        <ul>
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
