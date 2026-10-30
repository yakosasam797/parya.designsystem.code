import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ActivityTimeline,
  EmailCommunication,
  NotesPanel,
  RateMatrix,
  ThemeProvider,
  MiniCalendar,
  CommandPalette,
  KanbanBoard,
  KanbanCard,
  LineChart,
  DonutChart,
  activityDate,
  civilDate,
  describeKanbanSignal,
  groupAgenda,
  parseRateInput,
  rateCellKey,
  statusMeta,
  validateRateMatrix,
  type EmailDraft,
  type RateValues,
} from "../index";

describe("reusable record sections", () => {
  it("keeps a failed note draft and saves the trimmed text on retry", async () => {
    const onAdd = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    render(
      <ThemeProvider>
        <NotesPanel
          open
          onOpenChange={() => {}}
          title="Booking notes"
          notes={[]}
          onAdd={onAdd}
        />
      </ThemeProvider>,
    );
    await userEvent.type(
      screen.getByLabelText("New note"),
      "  Confirm adjoining rooms  ",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your text is still here",
    );
    expect(screen.getByLabelText("New note")).toHaveValue(
      "  Confirm adjoining rooms  ",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));
    await waitFor(() =>
      expect(screen.getByLabelText("New note")).toHaveValue(""),
    );
    expect(onAdd).toHaveBeenLastCalledWith("Confirm adjoining rooms");
  });
  it("requires confirmation before discarding an unsaved note", async () => {
    const change = vi.fn();
    render(
      <ThemeProvider>
        <NotesPanel
          open
          onOpenChange={change}
          title="Notes"
          notes={[]}
          onAdd={() => {}}
        />
      </ThemeProvider>,
    );
    await userEvent.type(screen.getByLabelText("New note"), "Keep this draft");
    await userEvent.click(screen.getByRole("button", { name: "Close notes" }));
    expect(change).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog", {
      name: "Discard this note?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    expect(screen.getByLabelText("New note")).toHaveValue("Keep this draft");
  });
  it("preserves unknown dates and does not invent a time for captured activity", () => {
    expect(activityDate(undefined, "8 Oct · year not recorded")).toEqual({
      day: "8 Oct · year not recorded",
      time: "Time not recorded",
      instant: undefined,
    });
    expect(activityDate("2026-10-28T23:30:00Z").day).toBe("29 Oct 2026");
    render(
      <ActivityTimeline
        items={[
          {
            id: "x",
            title: "Captured update",
            dateLabel: "8 Oct · year not recorded",
          },
        ]}
      />,
    );
    expect(screen.getByText("8 Oct · year not recorded")).toBeInTheDocument();
    expect(screen.getByText("Time not recorded")).toBeInTheDocument();
  });
  it("keeps failed email drafts and attachments, then clears them only after success", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    function Harness() {
      const [draft, setDraft] = useState<EmailDraft>({
        to: "guest@example.com",
        subject: "Trip confirmed",
        body: "Your transfer is included.",
        attachments: [{ id: "doc", name: "itinerary.pdf" }],
      });
      return (
        <ThemeProvider>
          <EmailCommunication
            initialCompose
            contact={{ name: "Guest" }}
            messages={[]}
            draft={draft}
            onDraftChange={setDraft}
            onSend={send}
          />
        </ThemeProvider>
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Send email" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your draft is preserved",
    );
    expect(screen.getByRole("textbox", { name: /^Subject/ })).toHaveValue(
      "Trip confirmed",
    );
    expect(screen.getByText("itinerary.pdf")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Send email" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("form", { name: "Compose email" }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Compose email" }),
    );
    expect(screen.getByRole("textbox", { name: /^Subject/ })).toHaveValue("");
    expect(screen.queryByText("itinerary.pdf")).not.toBeInTheDocument();
    expect(send).toHaveBeenCalledTimes(2);
  });
  it("read-only mail cannot expose a compose or send action", () => {
    render(
      <EmailCommunication
        readOnly
        initialCompose
        contact={{ name: "Guest" }}
        messages={[]}
        draft={{ to: "", subject: "", body: "" }}
        onDraftChange={() => {}}
        onSend={() => {}}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Compose email" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send email" }),
    ).not.toBeInTheDocument();
  });
});
describe("collection and calendar contracts", () => {
  it("calendar navigation preserves civil dates across month boundaries", async () => {
    const change = vi.fn();
    render(
      <ThemeProvider>
        <MiniCalendar
          value="2026-01-31"
          today="2026-01-31"
          onValueChange={change}
        />
      </ThemeProvider>,
    );
    const selected = screen.getByRole("button", {
      name: /Saturday, 31 January 2026/,
    });
    selected.focus();
    await userEvent.keyboard("{ArrowRight}");
    const next = screen.getByRole("button", {
      name: /Sunday, 1 February 2026/,
    });
    await waitFor(() => expect(next).toHaveFocus());
    expect(change).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(change).toHaveBeenCalledWith("2026-02-01");
    expect(civilDate("2026-02-30")).toBeNull();
  });
  it("only unresolved actionable events appear overdue", () => {
    const groups = groupAgenda(
      [
        { id: "due", kind: "payment", date: "2026-11-01", title: "Due" },
        {
          id: "paid",
          kind: "payment",
          date: "2026-11-01",
          title: "Paid",
          status: "paid",
        },
        {
          id: "departure",
          kind: "departure",
          date: "2026-11-01",
          title: "Departed",
        },
      ],
      { today: "2026-11-03", from: "2026-11-03" },
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].date).toBe("overdue");
    expect(groups[0].items.map((row) => row.id)).toEqual(["due"]);
    expect(
      describeKanbanSignal({
        kind: "due",
        date: "2026-11-01",
        today: "2026-11-03",
      }).tone,
    ).toBe("danger");
    expect(statusMeta("booking", "On trip")).toEqual({
      label: "On trip",
      tone: "info",
    });
  });
  it("command search filters keywords and supports alternative keyboard actions", async () => {
    const normal = vi.fn(),
      alternate = vi.fn(),
      close = vi.fn();
    render(
      <ThemeProvider>
        <CommandPalette
          open
          onOpenChange={close}
          groups={[
            {
              id: "records",
              label: "Records",
              items: [
                {
                  id: "b",
                  label: "Bali booking",
                  keywords: ["Mehta"],
                  onSelect: normal,
                  onSelectAlt: alternate,
                },
              ],
            },
          ]}
        />
      </ThemeProvider>,
    );
    await userEvent.type(await screen.findByRole("combobox"), "Mehta");
    expect(
      screen.getByRole("option", { name: /Bali booking/ }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(alternate).toHaveBeenCalledOnce();
    expect(normal).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(false);
  });
  it("board refuses a move without changing the controlled source records", async () => {
    const move = vi.fn().mockResolvedValue(false);
    const items = [{ id: "a", stage: "new", title: "Mehta family" }];
    render(
      <ThemeProvider>
        <KanbanBoard
          label="Sales"
          columns={[
            { id: "new", label: "New" },
            { id: "quote", label: "Quoting" },
          ]}
          items={items}
          getId={(row) => row.id}
          getColumn={(row) => row.stage}
          getItemLabel={(row) => row.title}
          renderCard={(row) => <KanbanCard title={row.title} />}
          onMove={move}
        />
      </ThemeProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /^Move Mehta family/ }),
    );
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await waitFor(() =>
      expect(move).toHaveBeenCalledWith({
        id: "a",
        from: "new",
        to: "quote",
        beforeId: undefined,
        source: "keyboard",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "was not moved",
    );
    expect(items[0].stage).toBe("new");
  });
});
describe("rate editing and chart evidence", () => {
  it("rejects invalid or negative rates and warns when sell falls below cost", () => {
    const rows = [{ id: "room", label: "Room" }],
      groups = [
        { id: "s", name: "Season", columns: [{ id: "cp", label: "CP" }] },
      ],
      key = rateCellKey("room", "s", "cp");
    expect(validateRateMatrix(rows, groups, { [key]: -1 })[0].severity).toBe(
      "error",
    );
    expect(
      validateRateMatrix(
        rows,
        groups,
        { [key]: { cost: 100, sell: 90 } },
        { display: "sell" },
      )[0].severity,
    ).toBe("warning");
    expect(parseRateInput("1,00,000")).toBeUndefined();
    expect(parseRateInput("45.50")).toBe(45.5);
    expect(parseRateInput("—")).toBeNull();
  });
  it("Escape cancels an edit, while Enter commits it exactly once", async () => {
    const change = vi.fn(),
      key = rateCellKey("room", "s", "cp");
    function Harness() {
      const [values, setValues] = useState<RateValues>({ [key]: 4500 });
      return (
        <ThemeProvider>
          <RateMatrix
            label="Room rates"
            rows={[{ id: "room", label: "Room" }]}
            groups={[
              { id: "s", name: "Season", columns: [{ id: "cp", label: "CP" }] },
            ]}
            mode="edit"
            values={values}
            onValueChange={(next) => {
              change(next);
              setValues(next);
            }}
          />
        </ThemeProvider>
      );
    }
    render(<Harness />);
    screen.getByRole("gridcell", { name: /4,500/ }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.clear(
      screen.getByRole("textbox", { name: "Room, Season, CP" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Room, Season, CP" }),
      "6000",
    );
    await userEvent.keyboard("{Escape}");
    expect(change).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole("gridcell", { name: /4,500/ })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await userEvent.clear(
      screen.getByRole("textbox", { name: "Room, Season, CP" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Room, Season, CP" }),
      "5200",
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
    expect(change).toHaveBeenCalledWith({ [key]: 5200 });
  });
  it("invalid spreadsheet paste is rejected as a whole", () => {
    const change = vi.fn();
    render(
      <RateMatrix
        label="Rates"
        rows={[{ id: "room", label: "Room" }]}
        groups={[
          {
            id: "s",
            name: "Season",
            columns: [
              { id: "a", label: "A" },
              { id: "b", label: "B" },
            ],
          },
        ]}
        mode="edit"
        values={{}}
        onValueChange={change}
      />,
    );
    fireEvent.paste(screen.getByRole("region", { name: "Rates" }), {
      clipboardData: { getData: () => "100\tnot-a-price" },
    });
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Paste rejected");
  });
  it("null chart values remain gaps and masked charts do not disclose exact amounts", () => {
    render(
      <LineChart
        label="Revenue"
        data={[
          { label: "Aug", values: { revenue: 380000 } },
          { label: "Sep", values: { revenue: null } },
          { label: "Oct", values: { revenue: 530000 } },
        ]}
        series={[{ id: "revenue", label: "Revenue" }]}
        format="money"
        maskValues
      />,
    );
    const chart = screen.getByRole("img", { name: /^Revenue/ });
    expect(chart.innerHTML).not.toContain("NaN");
    expect(screen.queryByText("View data table")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("3,80,000");
  });
  it("invalid share values are explicit rather than drawn as a misleading donut", () => {
    render(
      <DonutChart items={[{ id: "negative", label: "Invalid", value: -10 }]} />,
    );
    expect(screen.getByText("Invalid share values")).toBeInTheDocument();
  });
});
