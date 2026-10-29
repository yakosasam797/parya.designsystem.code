import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, IconButton, cx } from "./primitives";
import { Icon } from "./Icon";
import { Money } from "./content";
import { StatusBadge } from "./domain";
import { SelectField } from "./forms";
import { civilDate, formatCivil } from "./calendar";
import { Menu } from "./overlays";
export interface RateRow {
  id: string;
  label: string;
  group?: string;
}
export interface RateColumn {
  id: string;
  label: string;
}
export interface RateSeason {
  id: string;
  name: string;
  from?: string;
  to?: string;
  ranges?: { from: string; to: string }[];
  columns: RateColumn[];
  rule?: string;
  blackouts?: { from: string; to: string; reason: string }[];
}
export type RateValue =
  number | null | { cost: number | null; sell?: number | null };
export type RateValues = Record<string, RateValue>;
export interface RateIssue {
  key: string;
  rowId: string;
  groupId: string;
  columnId: string;
  severity: "error" | "warning";
  message: string;
}
export function rateCellKey(rowId: string, groupId: string, columnId: string) {
  return JSON.stringify([rowId, groupId, columnId]);
}
export function rateCost(value: RateValue | undefined) {
  return typeof value === "object" && value !== null
    ? value.cost
    : (value ?? null);
}
export function rateSell(value: RateValue | undefined, markupPercent = 0) {
  const cost = rateCost(value);
  return value && typeof value === "object" && value.sell !== undefined
    ? value.sell
    : cost === null
      ? null
      : Math.round(cost * (1 + markupPercent / 100) * 100) / 100;
}
export function validateRateMatrix(
  rows: RateRow[],
  groups: RateSeason[],
  values: RateValues,
  {
    display = "cost",
    markupPercent = 0,
  }: { display?: "cost" | "sell"; markupPercent?: number } = {},
): RateIssue[] {
  const issues: RateIssue[] = [];
  for (const row of rows)
    for (const group of groups)
      for (const column of group.columns) {
        const key = rateCellKey(row.id, group.id, column.id),
          value = values[key],
          cost = rateCost(value),
          sell = rateSell(value, markupPercent);
        const issue = (severity: RateIssue["severity"], message: string) =>
          issues.push({
            key,
            rowId: row.id,
            groupId: group.id,
            columnId: column.id,
            severity,
            message,
          });
        if (
          (cost !== null && (!Number.isFinite(cost) || cost < 0)) ||
          (sell !== null && (!Number.isFinite(sell) || sell < 0))
        )
          issue("error", "Amounts must be finite and nonnegative.");
        else if (
          display === "sell" &&
          sell !== null &&
          cost !== null &&
          sell < cost
        )
          issue("warning", "Sell price is below cost.");
      }
  return issues;
}
export function parseRateInput(text: string): number | null | undefined {
  const value = text.trim();
  if (!value || value === "—") return null;
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
export interface RateMatrixProps {
  label: string;
  rows: RateRow[];
  groups: RateSeason[];
  values: RateValues;
  onValueChange?: (values: RateValues) => void;
  mode?: "view" | "edit";
  display?: "cost" | "sell";
  markupPercent?: number;
  baseline?: RateValues;
  currency?: string;
}
export function RateMatrix({
  label,
  rows,
  groups,
  values,
  onValueChange,
  mode = "view",
  display = "cost",
  markupPercent = 0,
  baseline,
  currency = "INR",
}: RateMatrixProps) {
  const columns = groups.flatMap((group) =>
    group.columns.map((column) => ({ ...column, group })),
  );
  const [active, setActive] = useState({ row: 0, column: 0 }),
    [anchor, setAnchor] = useState({ row: 0, column: 0 });
  const [editing, setEditing] = useState<{
      row: number;
      column: number;
      text: string;
    } | null>(null),
    [message, setMessage] = useState("");
  const editFinished = useRef(false);
  const root = useRef<HTMLDivElement>(null),
    editable = mode === "edit" && !!onValueChange;
  const issues = validateRateMatrix(rows, groups, values, {
    display,
    markupPercent,
  });
  const keyAt = (row: number, col: number) =>
    rateCellKey(rows[row].id, columns[col].group.id, columns[col].id);
  const valueAt = (row: number, col: number) =>
    display === "sell"
      ? rateSell(values[keyAt(row, col)], markupPercent)
      : rateCost(values[keyAt(row, col)]);
  const inside = (row: number, column: number) =>
    row >= Math.min(anchor.row, active.row) &&
    row <= Math.max(anchor.row, active.row) &&
    column >= Math.min(anchor.column, active.column) &&
    column <= Math.max(anchor.column, active.column);
  const focus = (row: number, column: number, extend = false) => {
    const next = {
      row: Math.max(0, Math.min(rows.length - 1, row)),
      column: Math.max(0, Math.min(columns.length - 1, column)),
    };
    setActive(next);
    if (!extend) setAnchor(next);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(`[data-cell="${next.row}-${next.column}"]`)
        ?.focus(),
    );
  };
  const withValue = (next: RateValues, key: string, value: number | null) => {
    next[key] =
      display === "sell"
        ? { cost: rateCost(values[key]), sell: value }
        : values[key] && typeof values[key] === "object"
          ? { ...values[key], cost: value }
          : value;
  };
  const commit = (direction?: "next" | "previous" | "down") => {
    if (!editing || !onValueChange || editFinished.current) return;
    const value = parseRateInput(editing.text);
    if (value === undefined) {
      setMessage(
        "Enter a decimal amount without currency symbols or grouping separators.",
      );
      return;
    }
    const next = { ...values };
    editFinished.current = true;
    withValue(next, keyAt(editing.row, editing.column), value);
    onValueChange(next);
    setEditing(null);
    setMessage("Price updated.");
    const index =
      editing.row * columns.length +
      editing.column +
      (direction === "next"
        ? 1
        : direction === "previous"
          ? -1
          : direction === "down"
            ? columns.length
            : 0);
    focus(
      Math.floor(
        Math.max(0, Math.min(rows.length * columns.length - 1, index)) /
          columns.length,
      ),
      Math.max(0, Math.min(rows.length * columns.length - 1, index)) %
        columns.length,
    );
  };
  const clipboardText = () =>
    rows
      .map((_, ri) =>
        columns
          .map((_, ci) => (inside(ri, ci) ? (valueAt(ri, ci) ?? "") : null))
          .filter((value) => value !== null)
          .join("\t"),
      )
      .filter(
        (_, ri) =>
          ri >= Math.min(anchor.row, active.row) &&
          ri <= Math.max(anchor.row, active.row),
      )
      .join("\n");
  const keyDown = (
    event: KeyboardEvent<HTMLElement>,
    row: number,
    column: number,
  ) => {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    if (event.key in directions) {
      event.preventDefault();
      const [r, c] = directions[event.key];
      focus(row + r, column + c, event.shiftKey);
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focus(
        event.ctrlKey || event.metaKey
          ? event.key === "Home"
            ? 0
            : rows.length - 1
          : row,
        event.key === "Home" ? 0 : columns.length - 1,
        event.shiftKey,
      );
    }
    if (event.key === "Escape") {
      setEditing(null);
      setAnchor(active);
    }
    if (event.key === "Delete" && editable) {
      event.preventDefault();
      const next = { ...values };
      rows.forEach((_, ri) =>
        columns.forEach((_, ci) => {
          if (inside(ri, ci)) withValue(next, keyAt(ri, ci), null);
        }),
      );
      onValueChange?.(next);
    }
    if (
      editable &&
      (event.key === "Enter" ||
        event.key === "F2" ||
        (!event.ctrlKey && !event.metaKey && /^[0-9.+-]$/.test(event.key)))
    ) {
      event.preventDefault();
      editFinished.current = false;
      const current = valueAt(row, column);
      setEditing({
        row,
        column,
        text: /^[0-9.+-]$/.test(event.key)
          ? event.key
          : current === null
            ? ""
            : String(current),
      });
    }
  };
  if (!rows.length || !columns.length)
    return (
      <p className="pt-section-empty">No rate rows or seasons configured.</p>
    );
  return (
    <div className="pt-rates">
      <p className="pt-rates-warning">
        Internal pricing · {display === "cost" ? "Cost" : "Sell"} · {currency}
      </p>
      <p className="pt-sr-only" role="status">
        {message}
      </p>
      {issues.length ? (
        <p className="pt-field-error" role="status">
          {issues.filter((issue) => issue.severity === "error").length} errors ·{" "}
          {issues.filter((issue) => issue.severity === "warning").length}{" "}
          warnings
        </p>
      ) : null}
      <div
        ref={root}
        className="pt-rates-scroll"
        tabIndex={editable ? -1 : 0}
        role="region"
        aria-label={label}
        onCopy={(event) => {
          if (editing || !editable) return;
          event.preventDefault();
          event.clipboardData.setData("text/plain", clipboardText());
          setMessage("Selected prices copied.");
        }}
        onPaste={(event) => {
          if (!editable || editing || !onValueChange) return;
          event.preventDefault();
          const block = event.clipboardData
            .getData("text/plain")
            .replace(/\r/g, "")
            .replace(/\n$/, "")
            .split("\n")
            .map((row) => row.split("\t").map(parseRateInput));
          if (block.some((row) => row.some((value) => value === undefined))) {
            setMessage(
              "Paste rejected: use decimal prices, blank cells or an em dash for unpriced cells.",
            );
            return;
          }
          const next = { ...values };
          if (block.length === 1 && block[0].length === 1) {
            rows.forEach((_, ri) =>
              columns.forEach((_, ci) => {
                if (inside(ri, ci))
                  withValue(next, keyAt(ri, ci), block[0][0] as number | null);
              }),
            );
          } else
            block.forEach((row, ri) =>
              row.forEach((value, ci) => {
                if (
                  active.row + ri < rows.length &&
                  active.column + ci < columns.length
                )
                  withValue(
                    next,
                    keyAt(active.row + ri, active.column + ci),
                    value as number | null,
                  );
              }),
            );
          onValueChange(next);
          setMessage("Prices pasted.");
        }}
      >
        <table
          role={editable ? "grid" : undefined}
          aria-label={label}
          aria-readonly={editable ? false : undefined}
        >
          <thead>
            <tr>
              <th rowSpan={2} scope="col">
                Rate item
              </th>
              {groups.map((group) => (
                <th
                  key={group.id}
                  scope="colgroup"
                  colSpan={group.columns.length}
                >
                  <strong>{group.name}</strong>
                  {group.from && group.to ? (
                    <small>
                      {formatCivil(group.from)}–{formatCivil(group.to)}
                    </small>
                  ) : null}
                </th>
              ))}
              {editable ? (
                <th rowSpan={2} scope="col">
                  Actions
                </th>
              ) : null}
            </tr>
            <tr>
              {columns.map((column) => (
                <th key={`${column.group.id}-${column.id}`} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id}>
                <th scope="row">
                  {row.group ? <small>{row.group}</small> : null}
                  {row.label}
                </th>
                {columns.map((column, ci) => {
                  const key = keyAt(ri, ci),
                    value = valueAt(ri, ci),
                    issue = issues.find((issue) => issue.key === key),
                    edit = editing?.row === ri && editing.column === ci;
                  const changed =
                    baseline &&
                    JSON.stringify(values[key] ?? null) !==
                      JSON.stringify(baseline[key] ?? null);
                  return (
                    <td
                      key={key}
                      data-cell={`${ri}-${ci}`}
                      role={editable ? "gridcell" : undefined}
                      tabIndex={
                        editable
                          ? active.row === ri && active.column === ci && !edit
                            ? 0
                            : -1
                          : undefined
                      }
                      aria-selected={editable ? inside(ri, ci) : undefined}
                      aria-invalid={issue?.severity === "error" || undefined}
                      className={cx(
                        changed && "pt-rate-changed",
                        issue?.severity === "error" && "pt-rate-error",
                      )}
                      title={issue?.message}
                      onFocus={() => {
                        if (!editing) setActive({ row: ri, column: ci });
                      }}
                      onClick={(event) => {
                        if (!edit && editable) focus(ri, ci, event.shiftKey);
                      }}
                      onDoubleClick={() => {
                        if (editable) {
                          editFinished.current = false;
                          setEditing({
                            row: ri,
                            column: ci,
                            text: value === null ? "" : String(value),
                          });
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!edit) keyDown(event, ri, ci);
                      }}
                    >
                      {edit ? (
                        <input
                          autoFocus
                          aria-label={`${row.label}, ${column.group.name}, ${column.label}`}
                          inputMode="decimal"
                          value={editing.text}
                          onChange={(event) =>
                            setEditing({ ...editing, text: event.target.value })
                          }
                          onBlur={() => commit()}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              event.stopPropagation();
                              editFinished.current = true;
                              setEditing(null);
                              focus(ri, ci);
                            } else if (
                              event.key === "Enter" ||
                              event.key === "Tab"
                            ) {
                              event.preventDefault();
                              commit(
                                event.key === "Tab"
                                  ? event.shiftKey
                                    ? "previous"
                                    : "next"
                                  : "down",
                              );
                            }
                          }}
                        />
                      ) : (
                        <>
                          <span className="pt-mono">
                            {value === null ? (
                              "—"
                            ) : (
                              <Money
                                value={value}
                                currency={currency}
                                decimals={value % 1 ? 2 : 0}
                              />
                            )}
                          </span>
                          {changed ? (
                            <span className="pt-sr-only">
                              {" "}
                              Changed from baseline.
                            </span>
                          ) : null}
                          {issue ? (
                            <span className="pt-sr-only"> {issue.message}</span>
                          ) : null}
                        </>
                      )}
                    </td>
                  );
                })}
                {editable ? (
                  <td>
                    <Menu
                      label={`Rate actions for ${row.label}`}
                      trigger={
                        <IconButton
                          icon="more-vertical"
                          aria-label={`Rate actions for ${row.label}`}
                          variant="ghost"
                          size="xs"
                        />
                      }
                      items={[
                        {
                          id: "copy",
                          label: "Copy row",
                          onSelect: () => {
                            void navigator.clipboard
                              .writeText(
                                columns
                                  .map((_, ci) => valueAt(ri, ci) ?? "")
                                  .join("\t"),
                              )
                              .then(
                                () => setMessage("Row copied."),
                                () =>
                                  setMessage(
                                    "Copy failed. Select cells and use Ctrl+C instead.",
                                  ),
                              );
                          },
                        },
                        {
                          id: "clear",
                          label: "Clear row",
                          onSelect: () => {
                            const next = { ...values };
                            columns.forEach((_, ci) =>
                              withValue(next, keyAt(ri, ci), null),
                            );
                            onValueChange?.(next);
                          },
                        },
                        {
                          id: "fill",
                          label: "Copy first season to all seasons",
                          onSelect: () => {
                            const first = groups[0],
                              next = { ...values };
                            for (const group of groups.slice(1))
                              for (const column of group.columns) {
                                const origin = first.columns.find(
                                  (c) => c.id === column.id,
                                );
                                if (origin)
                                  next[
                                    rateCellKey(row.id, group.id, column.id)
                                  ] =
                                    values[
                                      rateCellKey(row.id, first.id, origin.id)
                                    ] ?? null;
                              }
                            onValueChange?.(next);
                          },
                        },
                      ]}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export interface SeasonLegendProps {
  seasons: Omit<RateSeason, "columns">[];
  durationUnit?: "nights" | "days";
}
export function SeasonLegend({
  seasons,
  durationUnit = "nights",
}: SeasonLegendProps) {
  return (
    <ul className="pt-season-legend">
      {seasons.map((season, index) => {
        const ranges =
          season.ranges ??
          (season.from && season.to
            ? [{ from: season.from, to: season.to }]
            : []);
        return (
          <li key={season.id}>
            <span
              className="pt-season-swatch"
              style={{ background: `var(--pt-color-chart-${(index % 8) + 1})` }}
            />
            <div>
              <strong>{season.name}</strong>
              {ranges.map((range, i) => {
                const start = civilDate(range.from),
                  end = civilDate(range.to);
                const count =
                  start && end
                    ? Math.max(
                        0,
                        Math.round(
                          (end.getTime() - start.getTime()) / 86400000,
                        ) + (durationUnit === "days" ? 1 : 0),
                      )
                    : null;
                return (
                  <p key={i}>
                    {formatCivil(range.from)}–{formatCivil(range.to)}
                    {count !== null ? ` · ${count} ${durationUnit}` : ""}
                  </p>
                );
              })}
              {season.rule ? <small>{season.rule}</small> : null}
              {season.blackouts?.map((blackout, i) => (
                <p key={i}>
                  <Icon name="ban" size="sm" />
                  {formatCivil(blackout.from)}–{formatCivil(blackout.to)} ·{" "}
                  {blackout.reason}
                </p>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
export interface RateVersion {
  id: string;
  label: string;
  status: string;
  dateLabel?: string;
  note?: string;
}
export interface RateVersionBarProps {
  versions: RateVersion[];
  value: string;
  onValueChange: (id: string) => void;
  changes?: number;
  errorCount?: number;
  warningCount?: number;
  onDiscard?: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  actions?: ReactNode;
}
export function RateVersionBar({
  versions,
  value,
  onValueChange,
  changes = 0,
  errorCount = 0,
  warningCount = 0,
  onDiscard,
  onPublish,
  publishing,
  actions,
}: RateVersionBarProps) {
  const current = versions.find((version) => version.id === value);
  return (
    <div className="pt-rate-version">
      <SelectField
        label="Version"
        value={value}
        onValueChange={onValueChange}
        disabled={publishing}
        options={versions.map((version) => ({
          value: version.id,
          label: version.label,
          description: [version.status, version.dateLabel, version.note]
            .filter(Boolean)
            .join(" · "),
        }))}
      />
      {current ? (
        <StatusBadge domain="rateCard" status={current.status} />
      ) : null}
      <p>
        {changes
          ? `${changes} unsaved changes`
          : [current?.dateLabel, current?.note].filter(Boolean).join(" · ")}
      </p>
      <span role="status" className="pt-caption">
        {errorCount} errors · {warningCount} warnings
      </span>
      {changes && onDiscard ? (
        <Button disabled={publishing} onClick={onDiscard}>
          Discard changes
        </Button>
      ) : null}
      {onPublish ? (
        <Button
          variant="primary"
          disabled={errorCount > 0}
          loading={publishing}
          onClick={onPublish}
        >
          Publish
        </Button>
      ) : null}
      {actions}
    </div>
  );
}
