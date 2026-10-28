import { useState, type ReactNode } from "react";
import { Avatar, Button, Checkbox, cx } from "./primitives";
import { Money, DateText, EmptyState, type MoneyProps } from "./content";
import { Pagination } from "./navigation";
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
  sortValue?: (row: T) => string | number;
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
}
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  selected = [],
  onSelectionChange,
  emptyTitle = "No records found",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; direction: 1 | -1 } | null>(
    null,
  );
  const column = columns.find((c) => c.id === sort?.id);
  const displayed = column?.sortValue
    ? [...rows].sort((a, b) => {
        const av = column.sortValue!(a),
          bv = column.sortValue!(b);
        return (
          (typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, {
                numeric: true,
              })) * (sort?.direction ?? 1)
        );
      })
    : rows;
  const all =
    rows.length > 0 && rows.every((r) => selected.includes(getRowId(r)));
  const some = rows.some((r) => selected.includes(getRowId(r)));
  return (
    <div className="pt-table-scroll">
      <table className="pt-table">
        <caption className="pt-sr-only">{caption}</caption>
        <thead>
          <tr>
            {onSelectionChange ? (
              <th scope="col">
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
                scope="col"
                className={cx(c.align === "right" && "pt-right")}
                aria-sort={
                  sort?.id === c.id
                    ? sort.direction === 1
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
                          sort?.id === c.id && sort.direction === 1 ? -1 : 1,
                      })
                    }
                  >
                    {c.header}
                    <span aria-hidden="true">
                      {sort?.id === c.id
                        ? sort.direction === 1
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
        <tbody>
          {displayed.length ? (
            displayed.map((row) => (
              <tr
                key={getRowId(row)}
                data-selected={selected.includes(getRowId(row))}
              >
                {onSelectionChange ? (
                  <td>
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
                    className={cx(c.align === "right" && "pt-right")}
                  >
                    {c.render(row)}
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
  return (
    <div className="pt-table-footer">
      <p className="pt-caption">
        {total === 0 ? 0 : (page - 1) * pageSize + 1}–
        {Math.min(page * pageSize, total)} of {total} records
      </p>
      <Pagination
        page={page}
        pageCount={Math.ceil(total / pageSize)}
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
      if (!accessor) throw new Error(`No accessor for filter ${key}`);
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
export function sortRows<T>(
  rows: T[],
  accessor: (row: T) => string | number,
  direction: "asc" | "desc" = "asc",
) {
  return [...rows].sort((a, b) => {
    const x = accessor(a),
      y = accessor(b);
    const order =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), undefined, { numeric: true });
    return order * (direction === "asc" ? 1 : -1);
  });
}
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  )
    throw new RangeError("Page and page size must be positive integers.");
  return rows.slice((page - 1) * pageSize, page * pageSize);
}
