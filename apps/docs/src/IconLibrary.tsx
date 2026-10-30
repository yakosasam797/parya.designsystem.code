import { useState } from "react";
import { Icon, iconNames } from "@parya/design-system";
import { SearchField } from "@parya/design-system";
import "./icon-library.css";

export default function IconLibrary({
  copy,
}: {
  copy: (text: string) => Promise<boolean>;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase().replaceAll("-", " ");
  const matches = iconNames.filter((name) =>
    name.replaceAll("-", " ").includes(normalized),
  );
  return (
    <article className="ds-icon-library">
      <div className="ds-breadcrumb">Foundations</div>
      <h1 className="ds-page-title">Icons</h1>
      <p className="ds-lede">
        All {iconNames.length} icons from the Paper library. Select an icon to
        copy its React usage.
      </p>
      <div className="ds-icon-library-search">
        <label htmlFor="icon-library-query">Find an icon</label>
        <SearchField
          id="icon-library-query"
          aria-label="Find an icon"
          placeholder="Search icons, e.g. plane"
          value={query}
          onValueChange={setQuery}
          shortcut=""
        />
      </div>
      <p className="ds-caption" role="status">
        {matches.length} of {iconNames.length} icons
      </p>
      <div className="ds-icon-library-grid">
        {matches.map((name) => (
          <button
            type="button"
            key={name}
            aria-label={`Copy ${name} icon usage`}
            onClick={() => void copy(`<Icon name="${name}" />`)}
          >
            <Icon name={name} size="xl" />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {!matches.length ? (
        <p className="ds-icon-library-empty">
          No matching icons. Try a shorter name or clear the search.
        </p>
      ) : null}
      <p className="ds-icon-library-guide">
        Use the documented <a href="#/components/Icon">Icon component</a> for
        sizes, labels and API details. Decorative icons inherit the surrounding
        text color; meaningful icons need an accessible label.
      </p>
    </article>
  );
}
