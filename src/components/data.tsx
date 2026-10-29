import { useId, type ReactNode } from "react";
import { Avatar, Button, Checkbox, cx } from "./primitives";
import { Money, DateText, EmptyState, type MoneyProps } from "./content";
import { Pagination } from "./navigation";
import { Icon, type IconName } from "./Icon";
import { useControllableState } from "../hooks";
export interface IconTextCellProps {
  icon: IconName;
  children: ReactNode;
  tone?: "default" | "muted" | "danger";
  href?: string;
}
export function IconTextCell({
  icon,
  children,
  tone = "default",
  href,
}: IconTextCellProps) {
  const content = (
    <>
      <Icon name={icon} size="sm" />
      <span>{children}</span>
    </>
  );
  const className = cx(
    "pt-icon-text-cell",
    tone !== "default" && `pt-text--${tone}`,
  );
  return href ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}
export function EntityCell({
  name,
  description,
  icon,
  href,
}: {
  name: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
}) {
  return (
    <div className="pt-cell-entity">
      {icon}
      <div>
        {href ? (
          <a href={href} className="pt-link">
            {name}
          </a>
        ) : (
          <strong>{name}</strong>
        )}
        {description ? <p className="pt-caption">{description}</p> : null}
      </div>
    </div>
  );
}
export function PersonCell({
  name,
  src,
  description,
}: {
  name: string;
  src?: string;
  description?: string;
}) {
  return (
    <EntityCell
      name={name}
      description={description}
      icon={<Avatar name={name} src={src} />}
    />
  );
}
export function StackCell({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div>
      {primary}
      {secondary ? <p className="pt-caption">{secondary}</p> : null}
    </div>
  );
}
export function MoneyCell({ due, ...props }: MoneyProps & { due?: number }) {
  return (
    <div className="pt-money-cell">
      <Money {...props} />
      {due !== undefined ? (
        <p className="pt-caption">
          <Money value={due} currency={props.currency} /> due
        </p>
      ) : null}
    </div>
  );
}
export function DateCell({ value, note }: { value: string; note?: string }) {
  return <StackCell primary={<DateText value={value} />} secondary={note} />;
}
export interface TableColumn<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
  align?: "left" | "right";
}
export interface DataTableProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  caption: string;
  selected?: string[];
  onSelectionChange?: (selected: string[]) => void;
  emptyTitle?: string;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Stack labelled record cards in narrow containers, or retain a scrolling table. */
  mobileLayout?: "cards" | "scroll";
}
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  selected = [],
  onSelectionChange,
  emptyTitle = "No records found",
  sort: controlledSort,
  onSortChange,
  mobileLayout = "cards",
}: DataTableProps<T>) {
  const tableId = useId();
  const [sort, setSort] = useControllableState<SortState | null>(
    controlledSort,
    null,
    (next) => {
      if (next) onSortChange?.(next);
    },
  );
  const column = columns.find((c) => c.id === sort?.id);
  const displayed = column?.sortValue
    ? sortRows(rows, column.sortValue, sort?.direction)
    : rows;
  const all =
    rows.length > 0 && rows.every((r) => selected.includes(getRowId(r)));
  const some = rows.some((r) => selected.includes(getRowId(r)));
  return (
    <div
      className="pt-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table
        className={cx("pt-table", `pt-table--${mobileLayout}`)}
        role="table"
      >
        <caption className="pt-sr-only">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            {onSelectionChange ? (
              <th
                scope="col"
                role="columnheader"
                className="pt-table-selection"
              >
                <Checkbox
                  aria-label="Select all rows"
                  checked={all ? true : some ? "indeterminate" : false}
                  onCheckedChange={(checked) => {
                    const pageIds = rows.map(getRowId);
                    onSelectionChange(
                      checked
                        ? [...new Set([...selected, ...pageIds])]
                        : selected.filter((id) => !pageIds.includes(id)),
                    );
                  }}
                />
              </th>
            ) : null}
            {columns.map((c) => (
              <th
                key={c.id}
                id={`${tableId}-${c.id}`}
                scope="col"
                role="columnheader"
                className={cx(c.align === "right" && "pt-right")}
                aria-sort={
                  sort?.id === c.id
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {c.sortValue ? (
                  <button
                    type="button"
                    className="pt-sort-button"
                    onClick={() =>
                      setSort({
                        id: c.id,
                        direction:
                          sort?.id === c.id && sort.direction === "asc"
                            ? "desc"
                            : "asc",
                      })
                    }
                  >
                    {c.header}
                    <span aria-hidden="true">
                      {sort?.id === c.id
                        ? sort.direction === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {displayed.length ? (
            displayed.map((row) => (
              <tr
                key={getRowId(row)}
                role="row"
                data-selected={selected.includes(getRowId(row))}
              >
                {onSelectionChange ? (
                  <td role="cell" className="pt-table-selection">
                    <Checkbox
                      aria-label={`Select row ${getRowId(row)}`}
                      checked={selected.includes(getRowId(row))}
                      onCheckedChange={(checked) =>
                        onSelectionChange(
                          checked
                            ? [...selected, getRowId(row)]
                            : selected.filter((v) => v !== getRowId(row)),
                        )
                      }
                    />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td
                    key={c.id}
                    role="cell"
                    headers={`${tableId}-${c.id}`}
                    className={cx(c.align === "right" && "pt-right")}
                  >
                    <span className="pt-mobile-cell-label" aria-hidden="true">
                      {c.header}
                    </span>
                    <div className="pt-table-cell-value">{c.render(row)}</div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onSelectionChange ? 1 : 0)}>
                <EmptyState title={emptyTitle} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export interface TableFooterProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}
export function TableFooter({
  page,
  pageSize,
  total,
  onPageChange,
}: TableFooterProps) {
  const count = pageCount(total, pageSize);
  const current = Math.max(1, Math.min(count || 1, page));
  return (
    <div className="pt-table-footer">
      <p className="pt-caption">
        {total === 0 ? 0 : (current - 1) * pageSize + 1}–
        {Math.min(current * pageSize, total)} of {total} records
      </p>
      <Pagination
        page={current}
        pageCount={count}
        onPageChange={onPageChange}
      />
    </div>
  );
}
export function BulkActionBar({
  count,
  children,
  onClear,
}: {
  count: number;
  children: ReactNode;
  onClear: () => void;
}) {
  return count ? (
    <div className="pt-bulk-bar">
      <strong>{count} selected</strong>
      {children}
      <Button variant="ghost" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  ) : null;
}
export type FilterValue = Record<string, string[]>;
export function filterRows<T>(
  rows: T[],
  value: FilterValue,
  accessors: Record<string, (row: T) => string | string[]>,
) {
  return rows.filter((row) =>
    Object.entries(value).every(([key, selected]) => {
      if (!selected.length) return true;
      const accessor = accessors[key];
      if (!accessor) return true;
      const val = accessor(row);
      return selected.some((s) =>
        Array.isArray(val) ? val.includes(s) : val === s,
      );
    }),
  );
}
export function searchRows<T>(
  rows: T[],
  query: string,
  accessors: ((row: T) => string)[],
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    const text = accessors
      .map((fn) => fn(row))
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
export type SortValue = string | number | Date | null | undefined;
export interface SortState {
  id: string;
  direction: "asc" | "desc";
}
const listCollator = new Intl.Collator("en-IN", {
  numeric: true,
  sensitivity: "base",
});
function comparable(value: SortValue): string | number | null {
  if (value == null || value === "") return null;
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    const time = Date.parse(value);
    if (Number.isFinite(time)) return time;
  }
  return value;
}
export function sortRows<T>(
  rows: T[],
  accessor: (row: T) => SortValue,
  direction: "asc" | "desc" = "asc",
) {
  return rows
    .map((row, index) => ({ row, index, value: comparable(accessor(row)) }))
    .sort((a, b) => {
      const x = a.value,
        y = b.value;
      if (x === null) return y === null ? a.index - b.index : 1;
      if (y === null) return -1;
      const order =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : listCollator.compare(String(x), String(y));
      return order * (direction === "asc" ? 1 : -1) || a.index - b.index;
    })
    .map(({ row }) => row);
}
export function pageCount(total: number, pageSize: number) {
  if (
    !Number.isInteger(total) ||
    total < 0 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  )
    throw new RangeError(
      "Total must be a nonnegative integer and page size a positive integer.",
    );
  return Math.ceil(total / pageSize);
}
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  )
    throw new RangeError("Page and page size must be positive integers.");
  const current = Math.min(page, pageCount(rows.length, pageSize) || 1);
  return rows.slice((current - 1) * pageSize, current * pageSize);
}
