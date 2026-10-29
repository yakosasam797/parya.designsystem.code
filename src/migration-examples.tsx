import { useState } from "react";
import * as UI from "./index";

export function NotesSectionExample() {
  const [open, setOpen] = useState(true);
  const [notes, setNotes] = useState<UI.NoteRecord[]>([
    {
      id: "n1",
      body: "Confirm monsoon blackout dates before publishing the revised rate card.",
      at: "2026-10-28T10:35:00+05:30",
      author: { name: "Priya Nair" },
    },
    {
      id: "n2",
      body: "The family would prefer adjoining rooms. Confirm availability with the hotel.",
      dateLabel: "27 Oct 2026",
      author: { name: "Anjali Menon" },
    },
  ]);
  return (
    <>
      <UI.NotesStrip
        label="Booking notes"
        count={notes.length}
        onOpen={() => setOpen(true)}
        onAdd={() => setOpen(true)}
      />
      <UI.NotesPanel
        open={open}
        onOpenChange={setOpen}
        title="Booking notes"
        notes={notes}
        onAdd={(body) =>
          setNotes([
            ...notes,
            {
              id: `n${notes.length + 1}`,
              body,
              at: new Date().toISOString(),
              author: { name: "Vijay Jain" },
            },
          ])
        }
      />
    </>
  );
}
export function CommunicationSectionExample() {
  const [draft, setDraft] = useState<UI.EmailDraft>({
    to: "mehta@example.com",
    subject: "",
    body: "",
    attachments: [],
  });
  const [messages, setMessages] = useState<UI.EmailMessage[]>([
    {
      id: "m1",
      threadId: "bali",
      folder: "inbox",
      from: "mehta@example.com",
      to: "priya@agency.example",
      subject: "Bali itinerary",
      body: "Could you confirm the airport transfer and the family room?",
      at: "2026-10-28T09:30:00+05:30",
    },
    {
      id: "m2",
      threadId: "bali",
      folder: "sent",
      from: "priya@agency.example",
      to: "mehta@example.com",
      subject: "Re: Bali itinerary",
      body: "The transfer is included. We are checking adjoining rooms with the hotel.",
      at: "2026-10-28T10:00:00+05:30",
    },
    {
      id: "m3",
      folder: "unknown",
      subject: "Captured travel request",
      body: "Please send the next steps.",
      dateLabel: "8 Oct · year not recorded",
      caption: "Captured message · direction not recorded",
    },
  ]);
  return (
    <UI.EmailCommunication
      contact={{ name: "Mehta family", email: "mehta@example.com" }}
      messages={messages}
      draft={draft}
      onDraftChange={setDraft}
      context="Interactive example · messages stay in this preview; no email is delivered."
      onSend={async (submitted) => {
        await Promise.resolve();
        setMessages([
          ...messages,
          {
            id: `sent-${messages.length}`,
            folder: "sent",
            subject: submitted.subject,
            body: submitted.body,
            to: submitted.to,
            from: "priya@agency.example",
            at: new Date().toISOString(),
            attachments: submitted.attachments,
          },
        ]);
      }}
      templates={[
        {
          id: "confirmation",
          label: "Booking confirmation",
          subject: "Your booking is confirmed",
          body: "Your trip is confirmed. We will share your final travel documents before departure.",
        },
      ]}
    />
  );
}
export function ActivitySectionExample() {
  const [presentation, setPresentation] = useState<"timeline" | "table">(
    "timeline",
  );
  const items: UI.ActivityItem[] = [
    {
      id: "a1",
      at: "2026-10-28T10:30:00+05:30",
      title: "Booking confirmed",
      description: "Mehta family · BK-1042",
      icon: "check-circle",
      actor: { name: "Priya Nair", subtitle: "Operations" },
    },
    {
      id: "a2",
      at: "2026-10-28T09:10:00+05:30",
      title: "Payment received",
      description: "Deposit recorded against invoice INV-220",
      icon: "hand-coins",
      actor: { name: "Kumar Iyer", subtitle: "Finance" },
    },
    {
      id: "a3",
      dateLabel: "27 Oct 2026",
      title: "Travel preferences imported",
      description: "Captured history with no recorded time",
      actor: { name: "Anjali Menon", subtitle: "Sales" },
    },
  ];
  return (
    <UI.Stack>
      <UI.SegmentedControl
        aria-label="Activity presentation"
        value={presentation}
        onValueChange={(value) =>
          setPresentation(value as "timeline" | "table")
        }
        options={[
          { value: "timeline", label: "Timeline", icon: "history" },
          { value: "table", label: "Table", icon: "table" },
        ]}
      />
      <UI.ActivityTimeline items={items} presentation={presentation} />
    </UI.Stack>
  );
}
export function ActivityHistoryExample() {
  return (
    <UI.ActivityTable
      items={[
        {
          id: "1",
          at: "2026-10-28T10:30:00+05:30",
          title: "Booking confirmed",
          section: "bookings",
          description: "Mehta family · BK-1042",
          icon: "bookings",
          actor: { name: "Priya Nair", subtitle: "Operations" },
        },
        {
          id: "2",
          at: "2026-10-27T09:10:00+05:30",
          title: "Payment received",
          section: "finance",
          icon: "hand-coins",
          actor: { name: "Kumar Iyer", subtitle: "Finance" },
        },
      ]}
      sectionOptions={[
        { value: "bookings", label: "Bookings" },
        { value: "finance", label: "Finance" },
      ]}
    />
  );
}
export function KpiSectionExample() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.KpiStrip
        items={[
          {
            id: "queries",
            label: "Open queries",
            value: "22",
            icon: "queries",
            onSelect: () => setSelected("Open queries"),
          },
          {
            id: "trips",
            label: "Trips this week",
            value: "4",
            icon: "plane-takeoff",
            hint: "Four confirmed departures in the next seven days.",
            onSelect: () => setSelected("Upcoming trips"),
          },
          {
            id: "due",
            label: "Collections due",
            value: <UI.Money value={530000} />,
            icon: "hand-coins",
            onSelect: () => setSelected("Collections due"),
          },
          {
            id: "tasks",
            label: "Pending tasks",
            value: "5",
            icon: "tasks",
            onSelect: () => setSelected("Pending tasks"),
          },
        ]}
      />
      <p role="status">
        {selected
          ? `Opened ${selected.toLowerCase()}.`
          : "Select a metric to open its related records."}
      </p>
    </UI.Stack>
  );
}
export function ShellSectionsExample() {
  const [records, setRecords] = useState<UI.OpenRecord[]>([
    {
      id: "BK-1042",
      code: "BK-1042",
      title: "Mehta family · Bali",
      icon: "bookings",
      unsaved: true,
    },
    {
      id: "Q-1079",
      code: "Q-1079",
      title: "Kerala family holiday",
      icon: "queries",
    },
  ]);
  const [selected, setSelected] = useState<string | null>("BK-1042");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [message, setMessage] = useState("");
  const close = (id: string) =>
    setRecords(records.filter((row) => row.id !== id));
  return (
    <UI.Stack>
      <UI.NotesStrip
        label="Booking notes"
        count={3}
        onOpen={() => setMessage("Booking notes opened")}
        onAdd={() => setMessage("New note opened")}
      />
      <UI.CreditsMeter
        used={720}
        total={1000}
        onUpgrade={() => setMessage("Credit upgrade opened")}
      />
      <UI.AccountMenu
        name="Vijay Jain"
        subtitle="Owner · Parya Travel"
        email="vijay@example.com"
        items={[
          {
            id: "profile",
            label: "My profile",
            icon: "user",
            description: "Your details and preferences",
            navigates: true,
            onSelect: () => setMessage("Profile opened"),
          },
          {
            id: "logout",
            label: "Sign out",
            icon: "logout",
            danger: true,
            onSelect: () => setMessage("Sign-out action selected"),
          },
        ]}
        theme={{ value: theme, onValueChange: setTheme }}
        onShortcuts={() => setMessage("Shortcuts opened")}
      />
      <div style={{ maxWidth: 300 }}>
        <UI.OpenRecordsList
          records={records}
          activeId={selected}
          onSelect={setSelected}
          onClose={close}
          defaultExpanded
          onCloseAll={() => setRecords([])}
          onReorder={(ids) =>
            setRecords(ids.map((id) => records.find((row) => row.id === id)!))
          }
        />
      </div>
      <UI.OpenRecordsSwitcher
        records={records}
        activeId={selected}
        onSelect={setSelected}
        onClose={close}
      />
      <p role="status">
        {message || `Selected record: ${selected ?? "Module page"}`}
      </p>
    </UI.Stack>
  );
}
export function NotificationsSectionExample() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("unread");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<UI.NotificationRowData[]>([
    {
      id: "n1",
      title: "Priya assigned a booking to you",
      context: "Bookings · Mehta family",
      recordTitle: "BK-1042 · Bali",
      at: "2026-10-28T10:30:00+05:30",
      unread: true,
      actor: { name: "Priya Nair" },
      assigned: true,
    },
    {
      id: "n2",
      title: "Payment received",
      context: "Finance · Deposit collected",
      recordTitle: "BK-1043 · Munnar",
      at: "2026-10-28T09:10:00+05:30",
      unread: false,
      icon: "hand-coins",
    },
  ]);
  const unreadCount = rows.filter((row) => row.unread).length;
  return (
    <UI.Stack>
      <UI.Button leadingIcon="bell" onClick={() => setOpen(true)}>
        Open notification inbox
      </UI.Button>
      <UI.NotificationsPanel
        items={rows.map((row) => ({
          id: row.id,
          title: row.title,
          body: row.context,
          unread: row.unread,
          onSelect: () => setMessage(`Opened ${row.recordTitle}`),
        }))}
        onMarkAllRead={() =>
          setRows(rows.map((row) => ({ ...row, unread: false })))
        }
        onViewAll={() => setOpen(true)}
      />
      <UI.NotificationRow
        row={rows[0]}
        now="2026-10-28T12:00:00+05:30"
        onOpen={(row) => setMessage(`Opened ${row.recordTitle}`)}
        onSetRead={(ids, read) =>
          setRows(
            rows.map((row) =>
              ids.includes(row.id) ? { ...row, unread: !read } : row,
            ),
          )
        }
      />
      <UI.NotificationsDrawer
        open={open}
        onOpenChange={setOpen}
        groups={[{ id: "today", label: "Today", rows }]}
        unreadCount={unreadCount}
        tab={tab}
        onTabChange={setTab}
        now="2026-10-28T12:00:00+05:30"
        onOpen={(row) => {
          setMessage(`Opened ${row.recordTitle}`);
          setOpen(false);
        }}
        onSetRead={(ids, read) =>
          setRows(
            rows.map((row) =>
              ids.includes(row.id) ? { ...row, unread: !read } : row,
            ),
          )
        }
        onMarkAllRead={() =>
          setRows(rows.map((row) => ({ ...row, unread: false })))
        }
        rowActions="manage"
        timestamp="compact"
        onDelete={(row) => setRows(rows.filter((item) => item.id !== row.id))}
      />
      <p role="status">{message}</p>
    </UI.Stack>
  );
}
export function OverlaySectionsExample() {
  const [surface, setSurface] = useState<"sheet" | "drawer" | "command" | null>(
    null,
  );
  const [message, setMessage] = useState("");
  return (
    <UI.Stack>
      <UI.Stack direction="row">
        <UI.Button onClick={() => setSurface("command")}>
          Search workspace
        </UI.Button>
        <UI.Button onClick={() => setSurface("drawer")}>
          Open notifications drawer
        </UI.Button>
        <UI.Button onClick={() => setSurface("sheet")}>
          Compatibility sheet
        </UI.Button>
      </UI.Stack>
      <UI.CommandPalette
        open={surface === "command"}
        onOpenChange={(open) => {
          if (!open) setSurface(null);
        }}
        groups={[
          {
            id: "pages",
            label: "Pages",
            items: [
              {
                id: "bookings",
                label: "Bookings",
                description: "Manage every journey",
                icon: "bookings",
                onSelect: () => setMessage("Bookings opened"),
              },
              {
                id: "customers",
                label: "Customers",
                description: "Customer directory",
                icon: "customers",
                onSelect: () => setMessage("Customers opened"),
              },
            ],
          },
        ]}
      />
      <UI.Drawer
        open={surface === "drawer"}
        onOpenChange={(open) => {
          if (!open) setSurface(null);
        }}
        label="Example notifications"
      >
        <header className="pt-section-heading">
          <h2>Notifications</h2>
          <UI.IconButton
            icon="x"
            aria-label="Close notifications drawer"
            onClick={() => setSurface(null)}
          />
        </header>
        <UI.EmptyState icon="bell" title="All caught up" />
      </UI.Drawer>
      <UI.Sheet
        open={surface === "sheet"}
        onOpenChange={(open) => {
          if (!open) setSurface(null);
        }}
        title="Compatibility sheet"
      >
        <p>
          Existing consumers can retain this surface. Use a full page for new
          long record forms.
        </p>
      </UI.Sheet>
      <p role="status">{message}</p>
    </UI.Stack>
  );
}
export function DomainSectionExample() {
  const [open, setOpen] = useState(false),
    [tier, setTier] = useState({ name: "Preferred", color: "#0F6E63" });
  return (
    <UI.Stack>
      <UI.ServiceTypeLabel type="accommodation" />
      <UI.ServiceTypeList
        types={["accommodation", "transport", "flight", "visa", "activity"]}
      />
      <UI.VendorTypeLabel type="dmc" />
      <UI.CustomerTypeLabel type="corporate" />
      <UI.QueryTypeLabel type="trip" />
      <UI.EnumLabel icon="cake" label="Birthday" />
      <UI.TierBadge label={tier.name} color={tier.color} />
      <UI.DocumentTypeTile type="passport" />
      <UI.StatusBadge domain="booking" status="confirmed" />
      <UI.Button onClick={() => setOpen(true)}>Add customer tier</UI.Button>
      <UI.CustomerTierDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={setTier}
      />
      <pre>
        {JSON.stringify(
          {
            vendorTypes: UI.VENDOR_TYPES,
            status: UI.statusMeta("booking", "On trip"),
            navigation: UI.paryatechNav({
              counts: { tasks: 4 },
              hide: ["news"],
            }).map((group) => group.label),
          },
          null,
          2,
        )}
      </pre>
    </UI.Stack>
  );
}
export function TemplateSectionsExample() {
  const [section, setSection] = useState("organisation");
  return (
    <UI.SettingsPageTemplate
      header={
        <UI.PageHeader
          title="Workspace settings"
          description="Shared templates keep page structure consistent."
        />
      }
      nav={[
        {
          id: "organisation",
          label: "Organisation",
          icon: "building",
          description: "Agency profile",
        },
        {
          id: "team",
          label: "Team",
          icon: "team",
          description: "People and access",
        },
      ]}
      activeId={section}
      onNavigate={setSection}
    >
      <UI.FormPageTemplate
        header={
          <UI.PageHeader
            title={
              section === "team" ? "Team settings" : "Organisation details"
            }
          />
        }
        onSubmit={() => UI.toast("Example settings saved", { tone: "success" })}
        footer={
          <UI.FormFooter>
            <UI.Button type="submit" variant="primary">
              Save changes
            </UI.Button>
          </UI.FormFooter>
        }
      >
        <UI.FormSection title="Details">
          <UI.TextField
            label={section === "team" ? "Team name" : "Agency name"}
            defaultValue="Parya Travel"
          />
        </UI.FormSection>
      </UI.FormPageTemplate>
    </UI.SettingsPageTemplate>
  );
}
export function RecordTemplateExample() {
  return (
    <UI.RecordPageTemplate
      header={
        <UI.RecordHeader
          title="Mehta family · Bali"
          code="BK-1042"
          status={<UI.StatusBadge domain="booking" status="confirmed" />}
        />
      }
    >
      <UI.RecordOverviewLayout
        summary={
          <UI.KpiStrip
            columns={2}
            items={[
              {
                label: "Travelers",
                value: "4",
                onSelect: () => UI.toast("Traveler tab selected"),
              },
              {
                label: "Booking value",
                value: <UI.Money value={248000} />,
                onSelect: () => UI.toast("Payments tab selected"),
              },
            ]}
          />
        }
        main={
          <UI.Panel title="Journey">
            <UI.DescriptionList
              items={[
                { label: "Destination", value: "Bali, Indonesia" },
                { label: "Departure", value: "10 Nov 2026" },
              ]}
            />
          </UI.Panel>
        }
        rail={
          <UI.Panel title="Customer">
            <UI.PersonInline name="Mehta family" />
          </UI.Panel>
        }
      />
    </UI.RecordPageTemplate>
  );
}
export function DashboardTemplateExample() {
  return (
    <UI.DashboardPageTemplate
      header={
        <UI.PageHeader title="Home" description="Today’s work at a glance." />
      }
      kpis={
        <UI.KpiStrip
          columns={2}
          items={[
            {
              label: "Open queries",
              value: "22",
              icon: "queries",
              onSelect: () => UI.toast("Queries opened"),
            },
            {
              label: "Upcoming trips",
              value: "4",
              icon: "bookings",
              onSelect: () => UI.toast("Bookings opened"),
            },
          ]}
        />
      }
      main={
        <UI.Panel title="Today’s priorities">
          <UI.ItemList
            items={[
              {
                id: "hotel",
                title: "Confirm hotel rooms",
                description: "Mehta family · Bali",
              },
              {
                id: "documents",
                title: "Collect travel documents",
                description: "Aarav Singh · Munnar",
              },
            ]}
          />
        </UI.Panel>
      }
      rail={
        <UI.Panel title="Support">
          <p>Keep important supporting details beside the main work area.</p>
        </UI.Panel>
      }
    />
  );
}
export function CalendarSectionsExample() {
  const [date, setDate] = useState("2026-11-10");
  const events: UI.CalendarEvent[] = [
    {
      id: "e1",
      kind: "departure",
      date: "2026-11-10",
      time: "09:30",
      title: "Mehta family · Bali",
      reference: "BK-1042",
      status: "confirmed",
      statusDomain: "booking",
      owner: { name: "Priya Nair" },
    },
    {
      id: "e2",
      kind: "payment",
      date: "2026-11-09",
      title: "Collect remaining balance",
      amount: 64000,
      status: "due",
    },
    {
      id: "e3",
      kind: "task",
      date: "2026-11-11",
      title: "Check traveler documents",
      status: "open",
    },
  ];
  return (
    <UI.Stack>
      <UI.MiniCalendar
        value={date}
        onValueChange={setDate}
        today="2026-11-10"
        events={events}
      />
      <UI.AgendaSummary events={events} today="2026-11-10" />
      <UI.Agenda
        events={events}
        today="2026-11-10"
        from={date}
        to="2026-11-30"
        onOpen={(event) => UI.toast(event.title)}
      />
      <UI.EventRow event={events[0]} today="2026-11-10" />
      <pre>{JSON.stringify(UI.EVENT_KINDS, null, 2)}</pre>
    </UI.Stack>
  );
}
export function ChartSectionsExample() {
  const data: UI.ChartDatum[] = [
    { label: "Aug", values: { revenue: 380000, cost: 240000 } },
    { label: "Sep", values: { revenue: 460000, cost: 310000 } },
    { label: "Oct", values: { revenue: 530000, cost: 340000 } },
  ];
  const series = [
    { id: "revenue", label: "Revenue" },
    { id: "cost", label: "Cost" },
  ];
  return (
    <UI.Stack>
      <UI.ChartCard
        title="Revenue and cost"
        description="Monthly operating totals"
        value={<UI.Money value={530000} />}
      >
        <UI.AreaChart data={data} series={series} format="money" />
      </UI.ChartCard>
      <UI.ChartCard title="Booking trend">
        <UI.LineChart data={data} series={[series[0]]} format="money" />
      </UI.ChartCard>
      <UI.ChartCard title="Revenue by month">
        <UI.BarChart data={data} series={series} format="money" />
      </UI.ChartCard>
      <UI.ChartCard title="Revenue share">
        <UI.DonutChart
          items={data.map((row) => ({
            id: row.label,
            label: row.label,
            value: row.values.revenue!,
          }))}
          format="money"
        />
      </UI.ChartCard>
      <UI.ChartCard title="Ranked months">
        <UI.BarList
          items={data.map((row) => ({
            id: row.label,
            label: row.label,
            value: row.values.revenue!,
          }))}
          format="money"
        />
        <UI.Sparkline
          label="Revenue"
          values={[380000, 460000, 530000]}
          format="money"
        />
      </UI.ChartCard>
    </UI.Stack>
  );
}
export function WorkflowSectionsExample() {
  const [view, setView] = useState<"board" | "list">("board");
  const [preview, setPreview] = useState(false);
  const [items, setItems] = useState([
    { id: "q1", stage: "new", title: "Mehta family · Bali", value: 248000 },
    {
      id: "q2",
      stage: "quoting",
      title: "Kerala family holiday",
      value: 126000,
    },
  ]);
  const columns: UI.KanbanColumn[] = [
    { id: "new", label: "New", quickAdd: true },
    { id: "quoting", label: "Quoting" },
    { id: "won", label: "Won" },
  ];
  return (
    <UI.Stack>
      <UI.BoardViewSwitch value={view} onValueChange={setView} />
      {view === "board" ? (
        <div style={{ height: 480 }}>
          <UI.KanbanBoard
            label="Sales pipeline"
            columns={columns}
            items={items}
            getId={(item) => item.id}
            getColumn={(item) => item.stage}
            getItemLabel={(item) => item.title}
            getValue={(item) => item.value}
            columnSummary="total"
            onSelect={() => setPreview(true)}
            onMove={(move) =>
              setItems(
                items.map((item) =>
                  item.id === move.id ? { ...item, stage: move.to } : item,
                ),
              )
            }
            onQuickAdd={(stage, title) =>
              setItems([
                ...items,
                { id: `q${items.length + 1}`, stage, title, value: 0 },
              ])
            }
            renderCard={(item) => (
              <UI.KanbanCard
                title={item.title}
                code={item.id}
                footer={<UI.Money value={item.value} />}
              />
            )}
          />
        </div>
      ) : (
        <UI.DataTable
          rows={items}
          getRowId={(row) => row.id}
          caption="Sales queries"
          columns={[
            { id: "title", header: "Query", render: (row) => row.title },
            { id: "stage", header: "Stage", render: (row) => row.stage },
          ]}
        />
      )}
      <UI.Button onClick={() => setPreview(true)}>
        Open compatibility preview
      </UI.Button>
      <UI.RecordPreviewPanel
        open={preview}
        onOpenChange={setPreview}
        title="Mehta family · Bali"
        reference="Q-1042"
        onOpenRecord={() => {
          setPreview(false);
          UI.toast("Full record page selected");
        }}
      >
        <UI.RecordPreviewSection title="Journey">
          <p>5 nights · 4 travelers</p>
        </UI.RecordPreviewSection>
      </UI.RecordPreviewPanel>
      <pre>
        {JSON.stringify(
          {
            priorities: UI.PRIORITY_LEVELS,
            overdue: UI.describeKanbanSignal({
              kind: "due",
              date: "2026-11-08",
              today: "2026-11-10",
            }),
          },
          null,
          2,
        )}
      </pre>
    </UI.Stack>
  );
}
export function RateSectionsExample() {
  const rows: UI.RateRow[] = [
    { id: "deluxe", label: "Deluxe room" },
    { id: "suite", label: "Family suite" },
  ];
  const groups: UI.RateSeason[] = [
    {
      id: "winter",
      name: "Winter",
      from: "2026-11-01",
      to: "2027-02-28",
      columns: [
        { id: "single", label: "Single" },
        { id: "double", label: "Double" },
      ],
    },
    {
      id: "peak",
      name: "Peak",
      from: "2026-12-20",
      to: "2027-01-05",
      columns: [
        { id: "single", label: "Single" },
        { id: "double", label: "Double" },
      ],
    },
  ];
  const [values, setValues] = useState<UI.RateValues>({
    [UI.rateCellKey("deluxe", "winter", "single")]: 4500,
    [UI.rateCellKey("deluxe", "winter", "double")]: 6200,
    [UI.rateCellKey("suite", "winter", "double")]: 9800,
  });
  const [version, setVersion] = useState("draft");
  const issues = UI.validateRateMatrix(rows, groups, values);
  return (
    <UI.Stack>
      <UI.RateVersionBar
        versions={[
          {
            id: "draft",
            label: "Version v2",
            status: "draft",
            note: "Winter update",
          },
          {
            id: "published",
            label: "Version v1",
            status: "published",
            dateLabel: "15 Oct 2026",
          },
        ]}
        value={version}
        onValueChange={setVersion}
        errorCount={issues.filter((issue) => issue.severity === "error").length}
      />
      <UI.SeasonLegend seasons={groups} />
      <UI.RateMatrix
        label="Room rates"
        rows={rows}
        groups={groups}
        values={values}
        onValueChange={setValues}
        mode={version === "draft" ? "edit" : "view"}
      />
      <p className="pt-caption">
        Keyboard: arrows to navigate, Enter to edit, Shift+arrows to select,
        Ctrl+C to copy, and paste tab-separated prices.
      </p>
    </UI.Stack>
  );
}
