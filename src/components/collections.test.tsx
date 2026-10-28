import { describe, expect, it, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  FilterMenu,
  FilterChips,
  SortMenu,
  DataTable,
  ThemeProvider,
  filterRows,
  searchRows,
  sortRows,
  paginate,
  pageCount,
  TableFooter,
  type FilterGroup,
  type FilterValue,
  type SortState,
} from "../index";

const groups: FilterGroup[] = [
  {
    id: "service",
    label: "Service",
    options: [
      { value: "hotel", label: "Accommodation", count: 3 },
      { value: "car", label: "Transport" },
      { value: "flight", label: "Flights", disabled: true },
    ],
  },
  {
    id: "status",
    label: "Status",
    mode: "single",
    options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    id: "balance",
    label: "Balance",
    mode: "toggle",
    options: [{ value: "due", label: "Outstanding balance" }],
  },
];
describe("collection controls", () => {
  it("applies checkbox, radio and toggle filters immediately and restores focus on Escape", async () => {
    function App() {
      const [value, setValue] = useState<FilterValue>({});
      return (
        <ThemeProvider>
          <FilterMenu groups={groups} value={value} onValueChange={setValue} />
          <FilterChips groups={groups} value={value} onValueChange={setValue} />
        </ThemeProvider>
      );
    }
    render(<App />);
    // Radix moves radio focus on the next task; model a held hardware key.
    const user = userEvent.setup({ delay: 10 });
    const trigger = screen.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    await user.click(screen.getByRole("checkbox", { name: "Accommodation" }));
    await user.click(screen.getByRole("checkbox", { name: "Transport" }));
    expect(screen.getByRole("checkbox", { name: "Flights" })).toBeDisabled();
    const active = screen.getByRole("radio", { name: "Active" });
    await user.click(active);
    await user.keyboard("{ArrowDown>}");
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Archived" })).toBeChecked(),
    );
    await user.keyboard("{/ArrowDown}");
    await user.click(
      screen.getByRole("switch", { name: "Outstanding balance" }),
    );
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(
      screen.getByRole("button", {
        name: "Remove Service filter: Accommodation, Transport",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Status filter: Archived" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Remove Balance filter: Outstanding balance",
      }),
    ).toBeInTheDocument();
  });
  it("removes one group without losing the others and clear-all also notifies the application", async () => {
    const onClear = vi.fn();
    function App() {
      const [value, setValue] = useState<FilterValue>({
        service: ["hotel", "car"],
        status: ["active"],
      });
      return (
        <FilterChips
          groups={groups}
          value={value}
          onValueChange={setValue}
          maxVisible={1}
          onClearAll={onClear}
        />
      );
    }
    render(<App />);
    expect(
      screen.getByRole("button", {
        name: "Remove Service filter: Accommodation, Transport",
      }),
    ).toHaveTextContent("Accommodation +1");
    await userEvent.click(
      screen.getByRole("button", {
        name: "Remove Service filter: Accommodation, Transport",
      }),
    );
    expect(
      screen.getByRole("button", { name: "Remove Status filter: Active" }),
    ).toBeVisible();
    expect(onClear).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(
      screen.queryByRole("group", { name: "Applied filters" }),
    ).not.toBeInTheDocument();
    expect(onClear).toHaveBeenCalledOnce();
  });
  it("exposes selected sort fields and directions as radio items", async () => {
    function App() {
      const [value, setValue] = useState<SortState>({
        id: "name",
        direction: "asc",
      });
      return (
        <ThemeProvider>
          <SortMenu
            fields={[
              { id: "name", label: "Name" },
              { id: "balance", label: "Balance" },
              { id: "archived", label: "Archived", disabled: true },
            ]}
            value={value}
            onValueChange={setValue}
          />
        </ThemeProvider>
      );
    }
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sort: Name" }));
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toBeChecked();
    expect(
      screen.getByRole("menuitemradio", { name: "Archived" }),
    ).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("menuitemradio", { name: "Balance" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Descending" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Balance" }),
    ).toBeChecked();
    expect(
      screen.getByRole("menuitemradio", { name: "Descending" }),
    ).toBeChecked();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Sort: Balance" })).toHaveFocus();
  });
  it("shares controlled sorting with column headers and preserves selections from other pages", async () => {
    const sort = vi.fn(),
      select = vi.fn();
    render(
      <DataTable
        caption="Vendors"
        rows={[
          { id: "b", amount: 20 },
          { id: "a", amount: 5 },
        ]}
        getRowId={(row) => row.id}
        columns={[
          {
            id: "amount",
            header: "Amount",
            sortValue: (row) => row.amount,
            render: (row) => row.amount,
          },
        ]}
        sort={{ id: "amount", direction: "asc" }}
        onSortChange={sort}
        selected={["other-page"]}
        onSelectionChange={select}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: /Amount/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      within(screen.getAllByRole("row")[1]).getByRole("cell", { name: "5" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Amount/ }));
    expect(sort).toHaveBeenCalledWith({ id: "amount", direction: "desc" });
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select all rows" }),
    );
    expect(select).toHaveBeenCalledWith(["other-page", "b", "a"]);
  });
});
describe("list edge cases", () => {
  it("ignores filter groups without an accessor and searches every word across fields", () => {
    const rows = [
      { name: "Kochi hotel", city: "Kerala" },
      { name: "Hotel", city: "Munnar" },
    ];
    expect(filterRows(rows, { unknown: ["value"] }, {})).toEqual(rows);
    expect(
      searchRows(rows, "  KERALA hotel ", [
        (row) => row.name,
        (row) => row.city,
      ]),
    ).toEqual([rows[0]]);
  });
  it("sorts numeric names, keeps empty values last in both directions, and preserves ties", () => {
    const rows = [
      { id: 1, value: "Room 12" },
      { id: 2, value: null },
      { id: 3, value: "Room 2" },
      { id: 4, value: "Room 2" },
      { id: 5, value: "" },
    ];
    expect(sortRows(rows, (row) => row.value).map((row) => row.id)).toEqual([
      3, 4, 1, 2, 5,
    ]);
    expect(
      sortRows(rows, (row) => row.value, "desc").map((row) => row.id),
    ).toEqual([1, 3, 4, 2, 5]);
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3, 4, 5]);
  });
  it("compares ISO timestamps and Date values chronologically, including timezone offsets", () => {
    const rows = [
      { value: "2026-01-01T10:00:00+05:30" },
      { value: new Date("2026-01-01T04:00:00Z") },
      { value: "2026-01-01T05:00:00Z" },
    ];
    expect(sortRows(rows, (row) => row.value)).toEqual([
      rows[1],
      rows[0],
      rows[2],
    ]);
  });
  it("clamps an obsolete page after filtering and renders consistent empty and final-page footers", () => {
    expect(paginate([1, 2, 3, 4], 99, 3)).toEqual([4]);
    expect(paginate([], 2, 3)).toEqual([]);
    expect(pageCount(0, 3)).toBe(0);
    expect(() => pageCount(3, 0)).toThrow(RangeError);
    const { rerender } = render(
      <TableFooter page={99} pageSize={3} total={4} onPageChange={() => {}} />,
    );
    expect(screen.getByText("4–4 of 4 records")).toBeInTheDocument();
    rerender(
      <TableFooter page={3} pageSize={3} total={0} onPageChange={() => {}} />,
    );
    expect(screen.getByText("0–0 of 0 records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
