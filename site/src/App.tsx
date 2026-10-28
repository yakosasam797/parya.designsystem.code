import React, { useState, useEffect, useMemo, useRef } from "react";
import * as UI from "../../src/index";
import { examples } from "../../src/examples";
import components from "./generated/components.json";
import hooks from "./generated/hooks.json";
import paper from "./paper-catalog.json";
import tokenData from "../../design/paper-tokens.json";
import "../../src/styles.css";
import "./site.css";
import packageInfo from "../../package.json";

const REPO = "https://github.com/yakosasam797/parya.designsystem.code";
const STORY_REPO =
  "https://github.com/yakosasam797/parya.designsystem.storybook";
const PAPER = "https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR";
const categories = [...new Set(paper.map((c) => c.category))];
const allNames = [
  ...new Set([
    ...paper.map((c) => c.name).filter((n) => !/^0|anatomy|Template/.test(n)),
    ...components.map((c) => c.name),
  ]),
].sort();
const local = ["127.0.0.1", "localhost"].includes(location.hostname);
const storybookBase =
  import.meta.env.VITE_STORYBOOK_URL || (local ? "http://127.0.0.1:6008" : "");
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
type ComponentDoc = (typeof components)[number];

function useRoute() {
  const read = () => decodeURIComponent(location.hash.slice(1) || "/");
  const [route, set] = useState(read);
  useEffect(() => {
    const fn = () => {
      set(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}
function External({
  href,
  children,
  icon = "external-link",
}: {
  href: string;
  children: React.ReactNode;
  icon?: UI.IconName;
}) {
  return (
    <a className="ds-resource" href={href} target="_blank" rel="noreferrer">
      <UI.Icon name={icon} size="sm" />
      {children}
      <UI.Icon name="external-link" size="xs" />
    </a>
  );
}
async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    UI.toast("Copied to clipboard", { tone: "success" });
    return true;
  } catch {
    UI.toast("Clipboard unavailable", {
      description: "Select the text and use your device’s copy command.",
      tone: "danger",
    });
    return false;
  }
}
function CopyButton({
  value,
  label = "Copy code",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <UI.Button
      size="xs"
      variant="ghost"
      leadingIcon={copied ? "check" : "copy"}
      onClick={async () => {
        if (await copyText(value)) {
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2000);
        }
      }}
    >
      {copied ? "Copied" : label}
    </UI.Button>
  );
}
function Code({ code }: { code: string }) {
  return (
    <div className="ds-code">
      <div>
        <span>React · TypeScript</span>
        <CopyButton value={code} />
      </div>
      <pre tabIndex={0} role="region" aria-label="Code example">
        <code>{code}</code>
      </pre>
    </div>
  );
}
function Search({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  const results = allNames
    .filter((n) => n.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30);
  return (
    <UI.Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Search the system"
      description="Find components, foundations, and implementation references."
    >
      <UI.Stack>
        <UI.SearchField
          placeholder="Search components…"
          shortcut=""
          value={query}
          onValueChange={setQuery}
          autoFocus
        />
        <div className="ds-search-results">
          {results.map((name) => (
            <a
              key={name}
              href={`#/components/${name}`}
              onClick={() => onOpenChange(false)}
            >
              <UI.Icon name="packages" />
              <span>{name}</span>
              <small>
                {components.some((c) => c.name === name)
                  ? "React component"
                  : "Design reference"}
              </small>
              <UI.Icon name="arrow-right" size="sm" />
            </a>
          ))}
          {results.length === 0 ? (
            <UI.EmptyState
              title="No matching components"
              description="Try a shorter name or browse the categories."
            />
          ) : null}
        </div>
      </UI.Stack>
    </UI.Modal>
  );
}
function Sidebar({
  route,
  onNavigate,
}: {
  route: string;
  onNavigate: () => void;
}) {
  return (
    <aside className="ds-sidebar" aria-label="Documentation navigation">
      <div className="ds-sidebar-intro">
        <span className="ds-version">
          <span />
          {packageInfo.version} · Preview
        </span>
        <span className="ds-caption">React + TypeScript</span>
      </div>
      <nav
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onNavigate();
        }}
      >
        <p className="ds-nav-label">Get started</p>
        {[
          ["/", "Overview", "home"],
          ["/installation", "Installation", "download"],
          ["/foundations", "Foundations", "sliders"],
          ["/agents", "For AI agents", "sparkles"],
        ].map(([url, label, icon]) => (
          <a
            className="ds-nav-item"
            aria-current={route === url ? "page" : undefined}
            href={`#${url}`}
            key={url}
          >
            <UI.Icon name={icon as UI.IconName} size="sm" />
            {label}
          </a>
        ))}
        <div className="ds-nav-section">
          <span>Code references</span>
          <small>{components.length}</small>
        </div>
        {categories.map((category) => (
          <details
            key={category}
            open={
              category === "Primitives" ||
              components.find((c) => route === `/components/${c.name}`)
                ?.category === category
            }
          >
            <summary>
              {category}
              <UI.Icon name="chevron-down" size="xs" />
            </summary>
            <div>
              {[
                ...new Set([
                  ...paper
                    .filter((p) => p.category === category)
                    .map((p) => p.name),
                  ...components
                    .filter((c) => c.category === category)
                    .map((c) => c.name),
                ]),
              ]
                .filter((n) => !/^00 |06.01|Form anatomy/.test(n))
                .map((name) => (
                  <a
                    key={name}
                    href={`#/components/${name}`}
                    className="ds-component-link"
                    aria-current={
                      route === `/components/${name}` ? "page" : undefined
                    }
                  >
                    {name}
                    {components.some((c) => c.name === name) ? null : (
                      <span
                        className="ds-design-dot"
                        title="Design reference"
                      />
                    )}
                  </a>
                ))}
            </div>
          </details>
        ))}
        <div className="ds-nav-section">Resources</div>
        <a
          className="ds-nav-item"
          aria-current={route === "/hooks" ? "page" : undefined}
          href="#/hooks"
        >
          <UI.Icon name="link" size="sm" />
          Hooks
        </a>
        <a
          className="ds-nav-item"
          href="#/coverage"
          aria-current={route === "/coverage" ? "page" : undefined}
        >
          <UI.Icon name="check-circle" size="sm" />
          Design coverage
        </a>
        <a
          className="ds-nav-item"
          href="#/releases"
          aria-current={route === "/releases" ? "page" : undefined}
        >
          <UI.Icon name="history" size="sm" />
          Releases
        </a>
      </nav>
      <div className="ds-sidebar-footer">
        Made for the work
        <br />
        behind every journey.
      </div>
    </aside>
  );
}
function Overview() {
  return (
    <>
      <div className="ds-hero">
        <div className="ds-breadcrumb">Parya Design System</div>
        <h1>
          One system.
          <br />
          Every journey.
        </h1>
        <p>
          The foundations, components, and patterns for building Paryatech
          travel software. Designed in Paper. Built for the web.
        </p>
        <div className="ds-hero-actions">
          <a href="#/installation" className="ds-primary-link">
            Start building <UI.Icon name="arrow-right" />
          </a>
          <a href="#/components/Button" className="ds-quiet-link">
            Explore components
          </a>
        </div>
      </div>
      <div className="ds-feature-stage">
        <div className="ds-feature-label">
          <UI.Icon name="plane" />
          <span>Built for travel operations</span>
          <span className="ds-live-label">
            <span />
            Live components
          </span>
        </div>
        <div className="ds-booking-demo">
          <div className="ds-booking-copy">
            <span className="ds-caption">A shared language for your team</span>
            <h2>
              From the first query
              <br />
              to the final itinerary.
            </h2>
            <p>
              Consistent details. Familiar interactions.
              <br />
              More time for the journey.
            </p>
            <UI.Stack direction="row" gap="2">
              <UI.Tag tone="work" icon="hotel">
                Accommodation
              </UI.Tag>
              <UI.Tag tone="person" icon="users">
                Travelers
              </UI.Tag>
              <UI.Tag icon="credit-card">Payments</UI.Tag>
            </UI.Stack>
          </div>
          <div className="ds-booking-card">
            <UI.RecordHeader
              title="Mehta family · Bali"
              code="BK-1042"
              status={
                <UI.StatusChip tone="success" size="sm">
                  Confirmed
                </UI.StatusChip>
              }
            />
            <UI.Divider />
            <UI.DescriptionList
              items={[
                { label: "Travel dates", value: "10–15 Nov 2026" },
                { label: "Travelers", value: "2 adults, 1 child" },
                { label: "Booking value", value: <UI.Money value={248000} /> },
                {
                  label: "Deposit received",
                  value: <UI.Money value={62000} tone="success" />,
                },
              ]}
            />
            <UI.Divider />
            <div className="pt-split">
              <UI.PersonInline name="Riya Mehta" />
              <UI.Button
                variant="primary"
                trailingIcon="arrow-right"
                onClick={() => {
                  location.hash = "/components/RecordHeader";
                }}
              >
                View booking
              </UI.Button>
            </div>
          </div>
        </div>
      </div>
      <section className="ds-home-section">
        <div className="ds-section-heading">
          <h2>A toolkit that works together.</h2>
          <a href="#/coverage">
            View coverage <UI.Icon name="arrow-right" size="sm" />
          </a>
        </div>
        <div className="ds-doors">
          {[
            {
              title: "Foundations",
              description:
                "Color, typography, spacing, and the tokens that connect them.",
              icon: "sliders",
              url: "/foundations",
            },
            {
              title: "Components",
              description:
                "React building blocks with typed APIs and live examples.",
              icon: "packages",
              url: "/components/Button",
            },
            {
              title: "For AI agents",
              description:
                "Markdown, usage examples, and a machine-readable component API.",
              icon: "sparkles",
              url: "/agents",
            },
          ].map((item) => (
            <a key={item.title} href={`#${item.url}`}>
              <UI.Icon name={item.icon as UI.IconName} size="xl" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <UI.Icon name="arrow-right" />
            </a>
          ))}
        </div>
      </section>
      <section className="ds-bottom-note">
        <UI.Icon name="info" />
        <p>
          This is the first implementation release. Components are experimental;
          design-only references are clearly marked. Production adoption
          requires the checks listed in <a href="#/coverage">design coverage</a>
          .
        </p>
      </section>
    </>
  );
}
function ComponentPage({ name }: { name: string }) {
  const doc = components.find((c) => c.name === name);
  const reference = paper.find((c) => c.name === name);
  const example = examples.find((c) => c.name === name);
  const [tab, setTab] = useState("overview");
  const [previewTheme, setPreviewTheme] = useState<UI.Theme>("light");
  const [width, setWidth] = useState("full");
  useEffect(() => {
    setTab("overview");
    setPreviewTheme("light");
  }, [name]);
  useEffect(() => {
    const jump = (event: Event) => {
      setTab("overview");
      const id = (event as CustomEvent<string>).detail;
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: "start" }),
      );
    };
    window.addEventListener("ds-doc-section", jump);
    return () => window.removeEventListener("ds-doc-section", jump);
  }, []);
  if (!doc && !reference)
    return (
      <UI.EmptyState
        title="Component not found"
        description="Use search or choose a component from the sidebar."
      />
    );
  const data = doc ?? reference!;
  const copyLLM = async () => {
    try {
      const response = await fetch(asset(`docs/${name}.md`));
      if (!response.ok) throw new Error();
      await copyText(await response.text());
    } catch {
      UI.toast("Documentation unavailable", {
        description: "Build the documentation before copying this reference.",
        tone: "danger",
      });
    }
  };
  const code = doc?.usage ?? "";
  return (
    <>
      <div className="ds-component-head">
        <div className="ds-breadcrumb">
          {doc?.kind === "utility" ? "Utilities" : "Components"}{" "}
          <UI.Icon name="chevron-right" size="xs" />
          {data.category}
        </div>
        <div className="ds-title-row">
          <h1>{name}</h1>
          <span className={doc ? "ds-status" : "ds-status ds-status--design"}>
            {doc ? "Experimental" : "Design reference"}
          </span>
        </div>
        <p className="ds-description">{data.description}</p>
        <div className="ds-resource-row">
          {doc ? (
            <External
              href={`${REPO}/blob/main/${doc.sourcePath}#L${doc.sourceLine}`}
              icon="file-text"
            >
              Source
            </External>
          ) : null}
          <External href={data.paperUrl} icon="layout-grid">
            Paper
          </External>
          {doc && storybookBase ? (
            <External
              href={`${storybookBase}/?path=/docs/${`${doc.category}-${name}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")}--docs`}
              icon="bookmark"
            >
              Storybook
            </External>
          ) : doc ? (
            <a className="ds-resource" href="#/installation">
              Storybook setup <UI.Icon name="external-link" size="xs" />
            </a>
          ) : null}
          {doc ? (
            <div className="ds-ai-actions">
              <UI.Button size="sm" leadingIcon="sparkles" onClick={copyLLM}>
                Copy for LLM
              </UI.Button>
              <a
                className="ds-resource"
                href={asset(`docs/${name}.md`)}
                target="_blank"
                rel="noreferrer"
              >
                View as Markdown <UI.Icon name="external-link" size="xs" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
      {doc ? (
        <>
          <div
            className="ds-doc-tabs"
            role="tablist"
            aria-label="Component documentation"
          >
            {["overview", "api", "guidelines"].map((t) => (
              <button
                key={t}
                role="tab"
                id={`doc-tab-${t}`}
                aria-controls={`doc-panel-${t}`}
                aria-selected={tab === t}
                tabIndex={tab === t ? 0 : -1}
                onClick={() => setTab(t)}
                onKeyDown={(e) => {
                  const tabs = ["overview", "api", "guidelines"];
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 2
                          : (tabs.indexOf(t) +
                              (e.key === "ArrowRight" ? 1 : -1) +
                              3) %
                            3;
                    setTab(tabs[next]);
                    document.getElementById(`doc-tab-${tabs[next]}`)?.focus();
                  }
                }}
              >
                {t === "api"
                  ? "API reference"
                  : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`doc-panel-${tab}`}
            aria-labelledby={`doc-tab-${tab}`}
            tabIndex={0}
          >
            {tab === "overview" ? (
              <>
                <section className="ds-doc-section" id="playground">
                  <div className="ds-section-heading">
                    <h2>Playground</h2>
                    <span className="ds-caption">
                      Interactive React example
                    </span>
                  </div>
                  <div className="ds-playground">
                    <div className="ds-preview-toolbar">
                      <div className="pt-inline">
                        <UI.Icon name="devices" size="sm" />
                        <select
                          aria-label="Preview width"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                        >
                          <option value="full">Responsive</option>
                          <option value="compact">Compact · 360px</option>
                        </select>
                      </div>
                      <UI.SegmentedControl
                        aria-label="Preview theme"
                        value={previewTheme}
                        onValueChange={(v) => setPreviewTheme(v as UI.Theme)}
                        options={[
                          { value: "light", label: "Light", icon: "sun" },
                          {
                            value: "dark",
                            label: "Dark",
                            icon: "moon" as UI.IconName,
                          },
                        ].map((o) => ({
                          ...o,
                          icon: UI.iconNames.includes(o.icon as UI.IconName)
                            ? (o.icon as UI.IconName)
                            : undefined,
                        }))}
                      />
                    </div>
                    <UI.ThemeProvider theme={previewTheme}>
                      <div
                        className={`ds-preview-surface ${width === "compact" ? "ds-preview-surface--compact" : ""}`}
                      >
                        <div className="ds-preview-inner">
                          {example ? <example.Demo /> : null}
                        </div>
                      </div>
                    </UI.ThemeProvider>
                    <Code code={code} />
                  </div>
                </section>
                {name === "Button" ? <ButtonVariants /> : null}
                {name === "TextField" ? (
                  <section className="ds-doc-section">
                    <h2>States</h2>
                    <div className="ds-state-grid">
                      <UI.TextField
                        label="Default"
                        placeholder="Enter traveler name"
                      />
                      <UI.TextField
                        label="With error"
                        defaultValue=""
                        error="Traveler name is required."
                      />
                      <UI.TextField
                        label="Disabled"
                        value="Aarav Sharma"
                        disabled
                      />
                      <UI.TextField
                        label="Read only"
                        value="BK-1042"
                        readOnly
                        mono
                      />
                    </div>
                  </section>
                ) : null}
                <UsageGuidance doc={doc} />
              </>
            ) : tab === "api" ? (
              <ApiTable doc={doc} />
            ) : (
              <UsageGuidance doc={doc} detailed />
            )}
          </div>
          <div className="ds-page-footer">
            <span>Design and code, connected.</span>
            <External
              href={`${REPO}/issues/new?title=${encodeURIComponent(`${name}: `)}`}
              icon="message"
            >
              Suggest an improvement
            </External>
          </div>
        </>
      ) : (
        <section className="ds-design-reference">
          <UI.Banner title="Implementation pending" tone="info">
            This design is in Paper. It has no React implementation or Storybook
            story in this release.
          </UI.Banner>
          <h2>Design guidance</h2>
          {reference?.guidance.map((g, i) => (
            <p key={i}>{g}</p>
          ))}
          {reference?.paperApi ? <Code code={reference.paperApi} /> : null}
          <h2>Designed states</h2>
          <ul>
            {reference?.states.slice(0, 20).map((state, i) => (
              <li key={i}>{state}</li>
            ))}
          </ul>
          <a
            className="ds-primary-link"
            href={data.paperUrl}
            target="_blank"
            rel="noreferrer"
          >
            Inspect in Paper <UI.Icon name="external-link" size="sm" />
          </a>
        </section>
      )}
    </>
  );
}
function ButtonVariants() {
  const [variant, setVariant] = useState<UI.ButtonProps["variant"]>("primary");
  const [size, setSize] = useState<UI.ButtonProps["size"]>("sm");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <section className="ds-doc-section">
      <h2>Variants & controls</h2>
      <p className="ds-section-description">
        Choose the emphasis that matches the action.
      </p>
      <div className="ds-controls-layout">
        <div className="ds-control-stage">
          <UI.Button
            variant={variant}
            size={size}
            loading={loading}
            disabled={disabled}
            leadingIcon="plus"
            onClick={() => UI.toast("Create booking selected")}
          >
            Create booking
          </UI.Button>
        </div>
        <div className="ds-controls">
          <UI.SelectField
            label="Variant"
            value={variant}
            onValueChange={(v) => setVariant(v as UI.ButtonProps["variant"])}
            options={[
              "primary",
              "brand",
              "secondary",
              "tertiary",
              "ghost",
              "danger",
              "link",
            ].map((value) => ({ value, label: value }))}
          />
          <UI.SelectField
            label="Size"
            value={size}
            onValueChange={(v) => setSize(v as UI.ButtonProps["size"])}
            options={["xs", "sm", "md"].map((value) => ({
              value,
              label: value,
            }))}
          />
          <UI.Switch
            label="Loading"
            checked={loading}
            onCheckedChange={setLoading}
          />
          <UI.Switch
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </div>
      </div>
      <Code
        code={`<Button variant="${variant}" size="${size}" leadingIcon="plus"${loading ? " loading" : ""}${disabled ? " disabled" : ""}>\n  Create booking\n</Button>`}
      />
    </section>
  );
}
function ApiTable({ doc }: { doc: ComponentDoc }) {
  return (
    <section className="ds-doc-section">
      <h2>{doc.kind === "utility" ? "Parameters" : "Props"}</h2>
      <p className="ds-section-description">
        {doc.kind === "utility"
          ? "Generated from the TypeScript function signature. Call this function with your application data."
          : "Generated from the current TypeScript source. Native attributes are supported where the interface extends a native element."}
      </p>
      <div className="ds-api-scroll">
        <table className="ds-api-table">
          <thead>
            <tr>
              <th>{doc.kind === "utility" ? "Parameter" : "Prop"}</th>
              <th>Type</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code>{prop.name}</code>
                </td>
                <td>
                  <code>{prop.type}</code>
                </td>
                <td>{prop.required ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {doc.props.length === 0 ? (
        <p>See the typed source for the full signature.</p>
      ) : null}
      {doc.returnType ? (
        <p>
          Returns <code>{doc.returnType}</code>. This is a utility function.
        </p>
      ) : null}
      {doc.types.length ? (
        <>
          <h3>Referenced types</h3>
          <Code code={doc.types.map((type) => type.definition).join("\n\n")} />
        </>
      ) : null}
    </section>
  );
}
function UsageGuidance({
  doc,
  detailed = false,
}: {
  doc: ComponentDoc;
  detailed?: boolean;
}) {
  return (
    <section className="ds-doc-section" id="usage-guidelines">
      <h2>Usage guidelines</h2>
      <div className="ds-guidelines">
        {doc.guidance.map((line, i) => (
          <p key={i}>
            {line
              .replace(/^USE · /, "Use: ")
              .replace(" / AVOID · ", "\nAvoid: ")}
          </p>
        ))}
      </div>
      <h3>Accessibility</h3>
      <p>
        Keep visible labels and accessible names. Check keyboard navigation,
        focus, and error announcements in your complete workflow.
      </p>
      {detailed ? (
        <>
          <h3>Production readiness</h3>
          <p>
            This release is experimental. Automated checks and accessible
            primitives support implementation; they do not establish WCAG
            conformance or replace assistive technology testing.
          </p>
        </>
      ) : null}
    </section>
  );
}
function Installation() {
  return (
    <article className="ds-prose">
      <div className="ds-breadcrumb">Get started</div>
      <h1>Start building.</h1>
      <p className="ds-lede">One React library. A shared visual language.</p>
      <UI.Banner title="Preview release" tone="info">
        The package has not been published to npm yet. Build it from the code
        repository or install a locally packed release.
      </UI.Banner>
      <h2>1. Get the code</h2>
      <p>
        Requires Node.js 22.12 or later, React 19, and TypeScript. The code
        repository contains the library, shared examples, and this documentation
        website.
      </p>
      <Code
        code={`git clone ${REPO}.git\ncd parya.designsystem.code\nnpm ci\nnpm run build:lib\nnpm pack`}
      />
      <h2>2. Add it to your application</h2>
      <Code
        code={`npm install /path/to/parya-design-system-${packageInfo.version}.tgz`}
      />
      <p>
        The archive filename includes the package version. Use the filename
        printed by npm pack.
      </p>
      <Code
        code={
          'import {ThemeProvider, Button, Toaster} from "@parya/design-system";\nimport "@parya/design-system/styles.css";\n\nexport function App() {\n  return (\n    <ThemeProvider theme="light">\n      <Button variant="primary">Create booking</Button>\n      <Toaster />\n    </ThemeProvider>\n  );\n}'
        }
      />
      <h2>3. Run Storybook</h2>
      <p>
        Clone both repositories beside each other. Storybook uses the same
        locally built library and examples.
      </p>
      <Code
        code={`git clone ${STORY_REPO}.git\ncd parya.designsystem.storybook\nnpm ci\nnpm run storybook`}
      />
      <h2>How the pieces connect</h2>
      <div className="ds-architecture">
        <div>
          <UI.Icon name="layout-grid" />
          <strong>Paper</strong>
          <span>Design specifications & tokens</span>
        </div>
        <UI.Icon name="arrow-right" />
        <div>
          <UI.Icon name="file-text" />
          <strong>Code repository</strong>
          <span>React library & documentation</span>
        </div>
        <UI.Icon name="arrow-right" />
        <div>
          <UI.Icon name="bookmark" />
          <strong>Storybook</strong>
          <span>Executable examples & controls</span>
        </div>
      </div>
      <h2>Publishing</h2>
      <p>
        Hosting is not configured yet. The static website and Storybook can be
        hosted independently. Set VITE_STORYBOOK_URL to the final Storybook
        address when building the documentation site.
      </p>
    </article>
  );
}
function Foundations() {
  const [query, set] = useState("");
  const [type, setType] = useState("color");
  const tokens = useMemo(
    () =>
      tokenData.tokens.filter((t) => t.type === type && t.name.includes(query)),
    [type, query],
  );
  const types = [...new Set(tokenData.tokens.map((t) => t.type))];
  return (
    <>
      <div className="ds-breadcrumb">Foundations</div>
      <h1 className="ds-page-title">A common foundation.</h1>
      <p className="ds-lede">
        518 tokens exported directly from Paper. Semantic names connect design
        decisions to code.
      </p>
      <div className="ds-token-tools">
        <UI.SearchField
          placeholder="Search tokens"
          shortcut=""
          value={query}
          onValueChange={set}
        />
        <UI.SelectField
          label={<UI.VisuallyHidden>Token category</UI.VisuallyHidden>}
          value={type}
          onValueChange={setType}
          options={types.map((t) => ({ value: t, label: t }))}
        />
      </div>
      <div className="ds-token-grid">
        {tokens.map((token) => (
          <button
            className="ds-token"
            key={token.name}
            onClick={() => copyText(`var(${token.name})`)}
            aria-label={`Copy ${token.name}`}
          >
            {type === "color" ? (
              <span
                className="ds-token-swatch"
                style={{ background: `var(${token.name})` }}
              />
            ) : type === "fontFamily" ? (
              <span
                className="ds-token-type"
                style={{ fontFamily: `var(${token.name})` }}
              >
                Aa
              </span>
            ) : (
              <span className="ds-token-value">{String(token.value)}</span>
            )}
            <code>{token.name}</code>
            <span>{String(token.value)}</span>
            <UI.Icon name="copy" size="sm" />
          </button>
        ))}
      </div>
      {!tokens.length ? <UI.EmptyState title="No tokens match" /> : null}
    </>
  );
}
function Agents() {
  return (
    <article className="ds-prose">
      <div className="ds-breadcrumb">For AI agents</div>
      <h1>
        Give your agent
        <br />
        the right context.
      </h1>
      <p className="ds-lede">
        The same components and rules, in a format an AI coding assistant can
        read.
      </p>
      <div className="ds-agent-links">
        <a href={asset("llms.txt")} target="_blank" rel="noreferrer">
          <UI.Icon name="file-text" />
          <strong>llms.txt</strong>
          <span>A compact index of the system</span>
          <UI.Icon name="external-link" size="sm" />
        </a>
        <a href={asset("llms-full.txt")} target="_blank" rel="noreferrer">
          <UI.Icon name="packages" />
          <strong>Complete documentation</strong>
          <span>All component references in one file</span>
          <UI.Icon name="external-link" size="sm" />
        </a>
        <a href={asset("api/components.json")} target="_blank" rel="noreferrer">
          <UI.Icon name="devices" />
          <strong>Component API</strong>
          <span>Machine-readable props and types</span>
          <UI.Icon name="external-link" size="sm" />
        </a>
        <a href={asset("agents.md")} target="_blank" rel="noreferrer">
          <UI.Icon name="sparkles" />
          <strong>Agent instructions</strong>
          <span>Conventions and implementation boundaries</span>
          <UI.Icon name="external-link" size="sm" />
        </a>
      </div>
      <h2>Use a component with your agent</h2>
      <p>
        Open a component and select “Copy for LLM.” Paste it into your coding
        assistant with the screen or workflow you want to build. It includes the
        current API, usage example, source link, and design guidance.
      </p>
      <Code
        code={
          "Build a booking form using the Parya design system.\nUse the attached component documentation and semantic --pt-* tokens.\nUse only implemented components and their documented props.\nKeep internal supplier costs and margins out of traveler-facing views.\n\n[Paste the component reference here]"
        }
      />
      <h2>What this provides</h2>
      <p>
        Readable context for AI assistants and automation. The files do not
        generate screens on their own and this release does not include a hosted
        AI service or an MCP server.
      </p>
    </article>
  );
}
function Hooks() {
  return (
    <article className="ds-prose">
      <div className="ds-breadcrumb">Developer resources</div>
      <h1>Hooks</h1>
      <p className="ds-lede">
        Reusable React behavior, without a visual component.
      </p>
      {hooks.map((hook) => (
        <section key={hook.name} className="ds-doc-section">
          <h2>{hook.name}</h2>
          <p>{hook.description}</p>
          <Code
            code={`import {${hook.name}} from "@parya/design-system";\n\n${hook.code}`}
          />
          <External
            href={`${REPO}/blob/main/src/${hook.name === "useTheme" ? "theme.tsx" : "hooks.ts"}`}
            icon="file-text"
          >
            Source
          </External>
        </section>
      ))}
    </article>
  );
}
function Coverage() {
  return (
    <article className="ds-prose ds-prose--wide">
      <div className="ds-breadcrumb">Release readiness</div>
      <h1>Design coverage.</h1>
      <p className="ds-lede">
        An explicit view of what exists in design and what you can use in React.
      </p>
      <div className="ds-coverage-metrics">
        <div>
          <strong>17</strong>
          <span>Paper pages</span>
        </div>
        <div>
          <strong>518</strong>
          <span>Paper tokens</span>
        </div>
        <div>
          <strong>{components.length}</strong>
          <span>Live code references</span>
        </div>
        <div>
          <strong>151</strong>
          <span>SVG icons</span>
        </div>
      </div>
      <UI.Banner title="Experimental implementation" tone="warning">
        This is a working preview, not an enterprise production certification.
        Paper contains additional variants and specialized patterns that are not
        implemented yet.
      </UI.Banner>
      <h2>Before production adoption</h2>
      <ul>
        <li>
          Finish the design-only components and compare every required state
          with Paper.
        </li>
        <li>
          Review API contracts, business validation, supported locales, browser
          support, and application integration with engineering.
        </li>
        <li>
          Complete screen reader, keyboard, visual regression, and responsive
          acceptance testing.
        </li>
        <li>
          Choose package ownership, version policy, code reviewers, hosting,
          domain, and release permissions.
        </li>
        <li>
          Enable CI and published releases in GitHub, then pilot the library in
          a real travel workflow.
        </li>
      </ul>
      <h2>Design-to-code map</h2>
      <div className="ds-api-scroll">
        <table className="ds-api-table">
          <thead>
            <tr>
              <th>Design</th>
              <th>Category</th>
              <th>Code status</th>
            </tr>
          </thead>
          <tbody>
            {[...new Map(paper.map((p) => [p.name, p])).values()].map((p) => (
              <tr key={p.name}>
                <td>
                  <a href={`#/components/${p.name}`}>{p.name}</a>
                </td>
                <td>{p.category}</td>
                <td>
                  <span
                    className={
                      components.some((c) => c.name === p.name)
                        ? "ds-status"
                        : "ds-status ds-status--design"
                    }
                  >
                    {components.some((c) => c.name === p.name)
                      ? "Experimental"
                      : "Design only"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
function Releases() {
  return (
    <article className="ds-prose">
      <div className="ds-breadcrumb">Resources</div>
      <h1>Releases</h1>
      <p className="ds-lede">
        Changes to the system, with a clear adoption path.
      </p>
      <section className="ds-doc-section">
        <span className="ds-status">Preview</span>
        <h2>0.2.0 · Collection workflows</h2>
        <p>28 October 2026</p>
        <ul>
          <li>
            FilterMenu, FilterChips, SortMenu, ListToolbar, ListPageTemplate and
            IconTextCell.
          </li>
          <li>
            Controlled table sorting, selection across pages, and a complete
            vendor-list example.
          </li>
          <li>
            Five documented list utilities with parameter tables and return
            types.
          </li>
          <li>
            Referenced TypeScript definitions in API tables and AI
            documentation.
          </li>
          <li>
            Complete collection examples extracted from the live demos and
            type-checked during documentation builds.
          </li>
        </ul>
        <p>
          Adoption: filterRows now ignores groups without an accessor; paginate
          clamps pages beyond the last page. Invalid page numbers and page sizes
          still throw. sortRows keeps empty values last in both directions and
          sorts Date and ISO date values chronologically.
        </p>
      </section>
      <section className="ds-doc-section">
        <h2>0.1.0 · Initial implementation</h2>
        <p>28 October 2026</p>
        <ul>
          <li>Paper tokens and exact SVG icon inventory.</li>
          <li>React components with shared live examples.</li>
          <li>
            Source and Paper links, generated API tables, copyable code and LLM
            references.
          </li>
          <li>
            Storybook integration, theme previews, and a design coverage map.
          </li>
        </ul>
        <p>
          No npm package or hosted site has been published yet. Breaking API
          changes are possible during the preview.
        </p>
      </section>
    </article>
  );
}
export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useState<UI.Theme>(() => {
    try {
      return localStorage.getItem("parya-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("parya-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    const name = route.split("/").at(-1);
    document.title = `${route === "/" ? "Parya Design System" : name?.replace(/^./, (x) => x.toUpperCase()) + " · Parya"}`;
  }, [route]);
  return (
    <UI.ThemeProvider theme={theme} setTheme={setTheme}>
      <a className="ds-skip" href="#main-content">
        Skip to content
      </a>
      <header className="ds-topbar">
        <a className="ds-brand" href="#/" aria-label="Parya Design System home">
          <span className="ds-brand-mark">
            <UI.Icon name="brand-caret" size="xl" />
          </span>
          <strong>
            parya<span> / </span>
            <small>Design system</small>
          </strong>
        </a>
        <div className="ds-header-links">
          <a
            href="#/components/Button"
            aria-current={route.startsWith("/components") ? "page" : undefined}
          >
            Components
          </a>
          <a href="#/foundations">Foundations</a>
          <a href="#/agents">AI resources</a>
        </div>
        <div className="ds-topbar-actions">
          <button className="ds-search-trigger" onClick={() => setSearch(true)}>
            <UI.Icon name="search" />
            <span>Search documentation</span>
            <UI.Kbd>⌘ K</UI.Kbd>
          </button>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="Open code repository"
            className="ds-header-icon"
          >
            <UI.Icon name="file-text" />
          </a>
          <UI.IconButton
            variant="ghost"
            icon={theme === "light" ? "sun" : "circle-dashed"}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
          <UI.IconButton
            className="ds-menu-button"
            variant="ghost"
            icon={menu ? "x" : "menu"}
            aria-label="Toggle navigation"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
          />
        </div>
      </header>
      <div className={`ds-layout ${menu ? "ds-layout--menu-open" : ""}`}>
        <Sidebar route={route} onNavigate={() => setMenu(false)} />
        {menu ? (
          <button
            className="ds-mobile-scrim"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        ) : null}
        <main id="main-content" className="ds-main" tabIndex={-1}>
          {route === "/" ? (
            <Overview />
          ) : route === "/installation" ? (
            <Installation />
          ) : route === "/foundations" ? (
            <Foundations />
          ) : route === "/agents" ? (
            <Agents />
          ) : route === "/hooks" ? (
            <Hooks />
          ) : route === "/coverage" ? (
            <Coverage />
          ) : route === "/releases" ? (
            <Releases />
          ) : route.startsWith("/components/") ? (
            <ComponentPage name={route.slice(12)} />
          ) : (
            <UI.EmptyState title="Page not found" />
          )}
        </main>
        {route.startsWith("/components/") &&
        components.some((c) => route === `/components/${c.name}`) ? (
          <aside className="ds-on-this-page">
            <p>On this page</p>
            <a
              href="#main-content"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("main-content")?.scrollIntoView();
              }}
            >
              Overview
            </a>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("ds-doc-section", { detail: "playground" }),
                )
              }
            >
              Playground
            </button>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("ds-doc-section", {
                    detail: "usage-guidelines",
                  }),
                )
              }
            >
              Usage guidelines
            </button>
            <div>
              <UI.Icon name="layout-grid" />
              <strong>Designed in Paper</strong>
              <p>Explore anatomy, variants, and visual states.</p>
              <a href={PAPER} target="_blank" rel="noreferrer">
                Open design library <UI.Icon name="external-link" size="xs" />
              </a>
            </div>
          </aside>
        ) : null}
      </div>
      <Search open={search} onOpenChange={setSearch} />
      <UI.Toaster />
    </UI.ThemeProvider>
  );
}
