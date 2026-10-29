import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell, Sidebar, ThemeProvider, type AppNavGroup } from "../index";

const groups: AppNavGroup[] = [
  {
    id: "travel",
    items: [
      {
        id: "bookings",
        label: "Bookings",
        icon: "bookings",
        children: [{ id: "departures", label: "Departures" }],
      },
      { id: "finance", label: "Finance", icon: "finance", disabled: true },
    ],
  },
];
describe("application shell", () => {
  it("separates parent navigation from child disclosure and blocks disabled destinations", async () => {
    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <Sidebar
          navGroups={groups}
          activeNavId="bookings"
          onNavigate={onNavigate}
        />
      </ThemeProvider>,
    );
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    await userEvent.click(
      within(nav).getByRole("button", { name: "Show Bookings pages" }),
    );
    expect(onNavigate).not.toHaveBeenCalled();
    await userEvent.click(
      within(nav).getByRole("button", { name: "Departures" }),
    );
    expect(onNavigate).toHaveBeenLastCalledWith("departures");
    onNavigate.mockClear();
    await userEvent.click(within(nav).getByRole("button", { name: "Finance" }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(
      within(nav).getByRole("button", { name: "Bookings" }),
    ).toHaveAttribute("aria-current", "page");
  });
  it("collapses the sidebar, preserves its accessible navigation, and supports embedded landmarks", async () => {
    render(
      <ThemeProvider>
        <AppShell
          navGroups={groups}
          activeNavId="bookings"
          onNavigate={() => {}}
          embedded
          withToaster={false}
          height={600}
        >
          <h2>Booking list</h2>
        </AppShell>
      </ThemeProvider>,
    );
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Workspace" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    );
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Bookings" }),
    ).toBeInTheDocument();
  });
});
