import { useState } from "react";
import { Icon } from "../../../src/components/Icon";
import { SegmentedControl } from "../../../src/components/forms";
import { TabBar } from "../../../src/components/navigation";
import manifest from "./manifest.json";
import "./brand-assets.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
type Format = "all" | "svg" | "png";
type Extension = Exclude<Format, "all">;
type Logo = {
  id: string;
  name: string;
  color: string;
  background: string;
  usage: string;
  group: string;
  width: number;
  height: number;
  transparent: boolean;
  files: Partial<
    Record<
      Extension,
      { path: string; bytes: number; width?: number; height?: number }
    >
  >;
};
const logos: Logo[] = manifest.variants;
const fileCount = logos.reduce(
  (count, logo) => count + Object.keys(logo.files).length,
  0,
);
const formatNames = { all: "All formats", svg: "SVG", png: "PNG" };

function Download({
  path,
  children,
  label,
  primary = false,
}: {
  path: string;
  children: React.ReactNode;
  label?: string;
  primary?: boolean;
}) {
  return (
    <a
      className={`ba-download${primary ? " ba-download--primary" : ""}`}
      href={asset(path)}
      download
      aria-label={label}
    >
      <Icon name="download" size="sm" />
      {children}
    </a>
  );
}

function LogoCard({
  logo,
  formats,
}: {
  logo: Logo;
  formats: readonly Extension[];
}) {
  const preview = logo.files.svg ?? logo.files.png!;
  return (
    <article className="ba-logo-card" aria-labelledby={`ba-${logo.id}`}>
      <div className={`ba-logo-preview ba-logo-preview--${logo.background}`}>
        <img
          src={asset(preview.path)}
          alt={`Paryatech ${logo.name.toLowerCase()} logo`}
          width={logo.width}
          height={logo.height}
          loading="lazy"
        />
        <span>
          {logo.transparent
            ? logo.background === "dark"
              ? "Dark background"
              : "Light background"
            : "Supplied background"}
        </span>
      </div>
      <div className="ba-logo-details">
        <div className="ba-logo-heading">
          <h4 id={`ba-${logo.id}`}>{logo.name}</h4>
          <span className="ba-color">
            <span style={{ backgroundColor: logo.color }} />
            {logo.color}
          </span>
        </div>
        <p>{logo.usage}</p>
        <div className="ba-file-meta">
          {logo.files.png?.width ?? logo.width} ×{" "}
          {logo.files.png?.height ?? logo.height}
          {logo.files.png ? " px PNG" : " SVG artboard"} ·{" "}
          {logo.transparent ? "Transparent" : "Background included"}
        </div>
        <div className="ba-file-links">
          {formats.map((extension) => {
            const file = logo.files[extension];
            return file ? (
              <Download
                key={extension}
                path={file.path}
                label={`Download ${logo.name} logo as ${extension.toUpperCase()}`}
              >
                {extension.toUpperCase()}{" "}
                <span>{(file.bytes / 1024).toFixed(1)} KB</span>
              </Download>
            ) : null;
          })}
        </div>
      </div>
    </article>
  );
}

function LogoLibrary() {
  const [format, setFormat] = useState<Format>("all");
  const formats = format === "all" ? (["svg", "png"] as const) : [format];
  return (
    <>
      <div className="ba-library-toolbar">
        <div>
          <h2>Logo variations</h2>
          <p>
            Horizontal, stacked, symbol and app-tile versions. Choose the form
            that fits your space.
          </p>
        </div>
        <SegmentedControl
          aria-label="Download format"
          value={format}
          onValueChange={(value) => setFormat(value as Format)}
          options={Object.entries(formatNames).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
      <p className="ba-format-note" aria-live="polite">
        {format === "svg"
          ? "SVG files stay sharp at any size. Best for websites, design tools, and print."
          : format === "png"
            ? "Transparent PNG files in their original sizes, listed on each card."
            : "Original supplied files. Each card shows its available formats and dimensions."}
      </p>
      {manifest.groups.map((group) => {
        const entries = logos.filter(
          (logo) =>
            logo.group === group.id &&
            formats.some((extension) => logo.files[extension]),
        );
        return entries.length ? (
          <section
            className="ba-logo-group"
            key={group.id}
            aria-labelledby={`ba-group-${group.id}`}
          >
            <div className="ba-group-heading">
              <h3 id={`ba-group-${group.id}`}>{group.name}</h3>
              <p>{group.description}</p>
            </div>
            <div className="ba-logo-grid">
              {entries.map((logo) => (
                <LogoCard logo={logo} formats={formats} key={logo.id} />
              ))}
            </div>
          </section>
        ) : null;
      })}
      <section className="ba-packs" aria-labelledby="ba-packs-title">
        <div>
          <h2 id="ba-packs-title">Take the whole set</h2>
          <p>
            Every supplied logo form, grouped by file type. Usage notes are
            included.
          </p>
        </div>
        <div className="ba-pack-links">
          <Download path="brand/paryatech-logos-svg.zip">SVG pack</Download>
          <Download path="brand/paryatech-logos-png.zip">PNG pack</Download>
        </div>
      </section>
    </>
  );
}

function UsageGuidance() {
  return (
    <div className="ba-guidance">
      <section>
        <h2>Choose a file type</h2>
        <div className="ba-format-guide">
          <div>
            <h3>SVG</h3>
            <p>
              Use for websites, Paper and other design tools, or print. It stays
              sharp when resized and has no fixed pixel resolution.
            </p>
          </div>
          <div>
            <h3>PNG</h3>
            <p>
              Use for slides, documents, email, and tools that need an image.
              Horizontal logos are 2385 × 517 px, stacked logos are 1200 × 700
              px, and symbols are 840 × 840 px. These PNGs have transparent
              backgrounds. Use them at their native size or smaller.
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2>Keep the logo recognizable</h2>
        <ul>
          <li>
            Keep the original proportions. Resize width and height together.
          </li>
          <li>
            Use the supplied colors. Choose teal or black for light backgrounds;
            white or pale pink for dark backgrounds. The stacked deep-teal
            export uses #154442; the horizontal logo and symbol use #115553.
          </li>
          <li>
            Keep horizontal and stacked logo lockups intact. Use the supplied
            standalone symbol or app tile where a compact mark is needed, with
            enough surrounding space to remain clear.
          </li>
          <li>
            Keep the artwork upright and free of shadows, outlines, or other
            effects.
          </li>
          <li>
            Check legibility at the final size. On photography, place the logo
            over a calm area with enough contrast.
          </li>
        </ul>
      </section>
      <section>
        <h2>Use the supplied formats</h2>
        <p>
          The standalone symbols were supplied as PNG only. App tiles were
          supplied as SVG only, with their own pink or teal background. Download
          links show only the formats provided.
        </p>
      </section>
      <aside className="ba-guidance-note">
        <Icon name="info" size="sm" />
        <p>
          These are practical usage notes for the supplied logos. An approved
          minimum size and clear-space specification have not been provided.
        </p>
      </aside>
      <a className="ba-text-link" href={asset("brand/README.md")} download>
        Download usage notes <Icon name="download" size="sm" />
      </a>
    </div>
  );
}

export default function BrandAssets() {
  const [section, setSection] = useState("logos");
  return (
    <article className="ba-page">
      <div className="ds-breadcrumb">Brand Assets</div>
      <div className="ba-page-heading">
        <div>
          <h1 className="ds-page-title">Brand Assets</h1>
          <p className="ds-lede">
            The Paryatech logo, ready for your next project. Find the right form
            and color, then download the original files.
          </p>
        </div>
        <Download path="brand/paryatech-logos-all.zip" primary>
          Download all assets <span className="ba-zip-label">ZIP</span>
        </Download>
      </div>
      <TabBar
        aria-label="Brand asset sections"
        value={section}
        onValueChange={setSection}
        items={[
          { value: "logos", label: "Logo library", content: <LogoLibrary /> },
          {
            value: "guidance",
            label: "Usage guidance",
            content: <UsageGuidance />,
          },
        ]}
      />
      <footer className="ba-footer">
        {manifest.groups.length} logo forms · {logos.length} variants ·{" "}
        {fileCount} original files
      </footer>
    </article>
  );
}
