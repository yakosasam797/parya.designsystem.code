import { useState } from "react";
import { Icon } from "../../../src/components/Icon";
import { SegmentedControl } from "../../../src/components/forms";
import { TabBar } from "../../../src/components/navigation";
import manifest from "./manifest.json";
import "./brand-assets.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
type Format = "all" | "svg" | "png";
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

function LogoLibrary() {
  const [format, setFormat] = useState<Format>("all");
  const formats = format === "all" ? (["svg", "png"] as const) : [format];
  return (
    <>
      <div className="ba-library-toolbar">
        <div>
          <h2>Logo variations</h2>
          <p>
            One logo, four colors. Choose the version that fits your background.
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
            ? "Transparent PNG files at 1200 × 450 px. Ready for presentations and documents."
            : "Every variation includes an original SVG and a transparent PNG at 1200 × 450 px."}
      </p>
      <div className="ba-logo-grid">
        {manifest.variants.map((logo) => (
          <article
            className="ba-logo-card"
            key={logo.id}
            aria-labelledby={`ba-${logo.id}`}
          >
            <div
              className={`ba-logo-preview ba-logo-preview--${logo.background}`}
            >
              <img
                src={asset(logo.files.svg.path)}
                alt={`Paryatech ${logo.name.toLowerCase()} logo`}
                width={manifest.width}
                height={manifest.height}
              />
              <span>
                {logo.background === "dark"
                  ? "Dark background"
                  : "Light background"}
              </span>
            </div>
            <div className="ba-logo-details">
              <div className="ba-logo-heading">
                <h3 id={`ba-${logo.id}`}>{logo.name}</h3>
                <span className="ba-color">
                  <span style={{ backgroundColor: logo.color }} />
                  {logo.color}
                </span>
              </div>
              <p>{logo.usage}</p>
              <div className="ba-file-links">
                {formats.map((extension) => {
                  const file = logo.files[extension];
                  return (
                    <Download
                      key={extension}
                      path={file.path}
                      label={`Download ${logo.name} logo as ${extension.toUpperCase()}`}
                    >
                      {extension.toUpperCase()}{" "}
                      <span>{(file.bytes / 1024).toFixed(1)} KB</span>
                    </Download>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
      <section className="ba-packs" aria-labelledby="ba-packs-title">
        <div>
          <h2 id="ba-packs-title">Take the whole set</h2>
          <p>
            All four color variations, grouped by file type. Usage notes are
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
              Each file is 1200 × 450 px with a transparent background. Avoid
              enlarging it beyond that size.
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
            white or pale pink for dark backgrounds.
          </li>
          <li>
            Keep the symbol and wordmark together, with enough surrounding space
            to stay clear of nearby text and controls.
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
            The Paryatech logo, ready for your next project. Find the right
            color and download the original files.
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
        4 color variations · 8 original files · Transparent backgrounds
      </footer>
    </article>
  );
}
