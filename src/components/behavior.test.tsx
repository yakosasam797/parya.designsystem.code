import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Button,
  Checkbox,
  TextField,
  QuantityField,
  DateRangeField,
  Combobox,
  MultiSelect,
  Modal,
  SearchField,
  filterRows,
  paginate,
  sortRows,
  ThemeProvider,
} from "../index";
describe("interaction contracts", () => {
  it("allows a required multi-select form to submit once a selection exists", () => {
    const { container, rerender } = render(
      <form>
        <MultiSelect
          label="Services"
          value={["hotel"]}
          onValueChange={() => {}}
          options={[{ value: "hotel", label: "Hotel" }]}
          required
        />
      </form>,
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    rerender(
      <form>
        <MultiSelect
          label="Services"
          value={[]}
          onValueChange={() => {}}
          options={[{ value: "hotel", label: "Hotel" }]}
          required
        />
      </form>,
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
  });
  it("prevents duplicate actions while loading", async () => {
    const click = vi.fn();
    render(
      <Button loading onClick={click}>
        Save booking
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
  it("announces indeterminate selection and toggles to checked", async () => {
    const change = vi.fn();
    render(
      <Checkbox
        label="Select travelers"
        checked="indeterminate"
        onCheckedChange={change}
      />,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    await userEvent.click(screen.getByLabelText("Select travelers"));
    expect(change).toHaveBeenCalledWith(true);
  });
  it("connects field errors to the actual input", () => {
    render(
      <TextField label="Traveler name" error="Enter the passport name." />,
    );
    const field = screen.getByLabelText("Traveler name");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Enter the passport name.");
  });
  it("respects a stepper boundary without calling the handler", async () => {
    const change = vi.fn();
    render(
      <QuantityField
        label="Rooms"
        min={1}
        max={2}
        value={1}
        onValueChange={change}
      />,
    );
    expect(screen.getByRole("button", { name: "Remove Rooms" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Add Rooms" }));
    expect(change).toHaveBeenCalledWith(2);
  });
  it("validates reversed dates", () => {
    render(
      <DateRangeField
        label="Travel dates"
        value={{ from: "2026-11-20", to: "2026-11-10" }}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByLabelText("End date")).toHaveAccessibleDescription(
      "End date must follow start date.",
    );
  });
  it("selects a filtered combobox option with the keyboard", async () => {
    function App() {
      const [v, set] = useState("");
      return (
        <Combobox
          label="Service"
          value={v}
          onValueChange={set}
          options={[
            { value: "a", label: "Activity", disabled: true },
            { value: "hotel", label: "Hotel" },
            { value: "car", label: "Car" },
          ]}
        />
      );
    }
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Service" }));
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "hotel");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Service" })).toHaveTextContent(
      "Hotel",
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
  it("closes a modal with Escape and returns focus to its trigger", async () => {
    function App() {
      const [open, set] = useState(false);
      return (
        <ThemeProvider>
          <Modal
            title="Edit traveler"
            open={open}
            onOpenChange={set}
            trigger={<Button>Edit</Button>}
          >
            <TextField label="Name" />
          </Modal>
        </ThemeProvider>
      );
    }
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Edit" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("clears search before Escape can dismiss an ancestor", async () => {
    const ancestor = vi.fn();
    function App() {
      const [q, set] = useState("Bali");
      return (
        <div onKeyDown={ancestor}>
          <SearchField
            value={q}
            onValueChange={set}
            placeholder="Search bookings"
          />
        </div>
      );
    }
    render(<App />);
    await userEvent.click(screen.getByRole("searchbox"));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(ancestor).not.toHaveBeenCalled();
  });
});
describe("list utilities", () => {
  it("combines filter groups with AND and options with OR", () => {
    const rows = [
      { id: 1, types: ["hotel", "car"], status: "active" },
      { id: 2, types: ["hotel"], status: "inactive" },
      { id: 3, types: ["flight"], status: "active" },
    ];
    expect(
      filterRows(
        rows,
        { type: ["hotel", "car"], status: ["active"] },
        { type: (r) => r.types, status: (r) => r.status },
      ).map((r) => r.id),
    ).toEqual([1]);
  });
  it("sorts without mutating source rows", () => {
    const rows = [{ amount: 20 }, { amount: 3 }];
    expect(sortRows(rows, (r) => r.amount).map((r) => r.amount)).toEqual([
      3, 20,
    ]);
    expect(rows[0].amount).toBe(20);
  });
  it("rejects invalid pagination instead of silently slicing wrong rows", () => {
    expect(() => paginate([1, 2], 0, 10)).toThrow(RangeError);
    expect(paginate([1, 2, 3, 4], 2, 2)).toEqual([3, 4]);
  });
});
