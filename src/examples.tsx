import { useState, type ComponentType } from "react";
import * as UI from "./index";
export interface Example {
  name: string;
  code: string;
  source?: string;
  kind?: "component" | "utility";
  Demo: ComponentType;
}
function FilterControlsDemo() {
  const [value, setValue] = useState<UI.FilterValue>({ service: ["hotel"] });
  const groups: UI.FilterGroup[] = [
    {
      id: "service",
      label: "Service",
      options: [
        { value: "hotel", label: "Accommodation", count: 4 },
        { value: "transport", label: "Transport", count: 2 },
        { value: "flight", label: "Flights", disabled: true },
      ],
    },
    {
      id: "status",
      label: "Status",
      mode: "single",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      id: "balance",
      label: "Balance",
      mode: "toggle",
      options: [
        {
          value: "outstanding",
          label: "Outstanding balance",
          description: "Only vendors with an unpaid balance",
        },
      ],
    },
  ];
  return (
    <UI.Stack>
      <UI.FilterMenu groups={groups} value={value} onValueChange={setValue} />
      <UI.FilterChips groups={groups} value={value} onValueChange={setValue} />
    </UI.Stack>
  );
}
function SortControlsDemo() {
  const [value, setValue] = useState<UI.SortState>({
    id: "name",
    direction: "asc",
  });
  const rows = [
    { name: "Vendor 12", balance: 8500 },
    { name: "Vendor 2", balance: 12000 },
    { name: "Vendor 1", balance: 3000 },
  ];
  const sorted = UI.sortRows(
    rows,
    (row) => (value.id === "balance" ? row.balance : row.name),
    value.direction,
  );
  return (
    <UI.Stack>
      <UI.SortMenu
        fields={[
          { id: "name", label: "Name" },
          { id: "balance", label: "Balance" },
        ]}
        value={value}
        onValueChange={setValue}
      />
      <ul>
        {sorted.map((row) => (
          <li key={row.name}>
            {row.name}: <UI.Money value={row.balance} />
          </li>
        ))}
      </ul>
    </UI.Stack>
  );
}
function CollectionListDemo() {
  const rows = [
    {
      id: "V-001",
      name: "Kumarakom Lake Resort",
      service: "hotel",
      location: "Kumarakom",
      balance: 45000,
    },
    {
      id: "V-002",
      name: "Malabar Transfers",
      service: "transport",
      location: "Kochi",
      balance: 12000,
    },
    {
      id: "V-003",
      name: "Blanket Hotel & Spa",
      service: "hotel",
      location: "Munnar",
      balance: 18000,
    },
    {
      id: "V-004",
      name: "Trailmakers Experiences",
      service: "activity",
      location: "Kochi",
      balance: 8500,
    },
    {
      id: "V-005",
      name: "Brunton Boatyard",
      service: "hotel",
      location: "Kochi",
      balance: 0,
    },
    {
      id: "V-006",
      name: "Western Ghats Cabs",
      service: "transport",
      location: "Munnar",
      balance: 3200,
    },
  ];
  const groups: UI.FilterGroup[] = [
    {
      id: "service",
      label: "Service",
      options: [
        { value: "hotel", label: "Accommodation", count: 3 },
        { value: "transport", label: "Transport", count: 2 },
        { value: "activity", label: "Activities", count: 1 },
      ],
    },
  ];
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<UI.FilterValue>({});
  const [sort, setSort] = useState<UI.SortState>({
    id: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState("all");
  const visible = UI.filterRows(
    UI.searchRows(rows, query, [(row) => row.name, (row) => row.location]),
    filters,
    { service: (row) => row.service },
  );
  const sorted = UI.sortRows(
    visible,
    (row) => (sort.id === "balance" ? row.balance : row.name),
    sort.direction,
  );
  const updateFilters = (next: UI.FilterValue) => {
    setFilters(next);
    setPage(1);
  };
  const updateSort = (next: UI.SortState) => {
    setSort(next);
    setPage(1);
  };
  const clearAll = () => {
    setQuery("");
    setPage(1);
  };
  return (
    <UI.ListPageTemplate
      header={
        <UI.PageHeader
          title="Vendors"
          count={rows.length}
          description="Manage accommodation, transport and activity partners."
        />
      }
      tabs={
        <UI.TabBar
          aria-label="Vendor views"
          value={tab}
          onValueChange={setTab}
          items={[{ value: "all", label: "All vendors", count: rows.length }]}
        />
      }
      toolbar={
        <UI.ListToolbar
          search={
            <UI.SearchField
              placeholder="Search vendors"
              shortcut=""
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setPage(1);
              }}
            />
          }
          filters={
            <UI.FilterMenu
              groups={groups}
              value={filters}
              onValueChange={updateFilters}
              onClearAll={clearAll}
            />
          }
          sort={
            <UI.SortMenu
              fields={[
                { id: "name", label: "Name" },
                { id: "balance", label: "Balance" },
              ]}
              value={sort}
              onValueChange={updateSort}
            />
          }
          chips={
            <UI.FilterChips
              groups={groups}
              value={filters}
              onValueChange={updateFilters}
              onClearAll={clearAll}
            />
          }
        />
      }
      bulkActions={
        <UI.BulkActionBar
          count={selected.length}
          onClear={() => setSelected([])}
        >
          <span>Selected across pages</span>
        </UI.BulkActionBar>
      }
      footer={
        <UI.TableFooter
          page={page}
          pageSize={3}
          total={visible.length}
          onPageChange={setPage}
        />
      }
    >
      <UI.DataTable
        caption="Vendors"
        rows={UI.paginate(sorted, page, 3)}
        getRowId={(row) => row.id}
        selected={selected}
        onSelectionChange={setSelected}
        sort={sort}
        onSortChange={updateSort}
        columns={[
          {
            id: "name",
            header: "Vendor",
            sortValue: (row) => row.name,
            render: (row) => (
              <UI.EntityCell name={row.name} description={row.id} />
            ),
          },
          {
            id: "location",
            header: "Location",
            render: (row) => (
              <UI.IconTextCell icon="map-pin">{row.location}</UI.IconTextCell>
            ),
          },
          {
            id: "balance",
            header: "Balance",
            align: "right",
            sortValue: (row) => row.balance,
            render: (row) => <UI.Money value={row.balance} />,
          },
        ]}
      />
    </UI.ListPageTemplate>
  );
}
function FilterRowsDemo() {
  const rows = [
    { name: "Resort", services: ["hotel", "activity"], status: "active" },
    { name: "Transfers", services: ["transport"], status: "active" },
    { name: "Archived hotel", services: ["hotel"], status: "inactive" },
  ];
  const filtered = UI.filterRows(
    rows,
    { service: ["hotel", "activity"], status: ["active"] },
    { service: (row) => row.services, status: (row) => row.status },
  );
  return <p>Matching vendors: {filtered.map((row) => row.name).join(", ")}</p>;
}
function SearchRowsDemo() {
  const [query, setQuery] = useState("Kochi hotel");
  const rows = [
    { name: "Harbour hotel", city: "Kochi" },
    { name: "Hillside hotel", city: "Munnar" },
    { name: "Kochi transfers", city: "Kochi" },
  ];
  const filtered = UI.searchRows(rows, query, [
    (row) => row.name,
    (row) => row.city,
  ]);
  return (
    <UI.Stack>
      <UI.SearchField
        placeholder="Search vendors"
        value={query}
        onValueChange={setQuery}
        shortcut=""
      />
      <p role="status">
        {filtered.map((row) => row.name).join(", ") || "No matches"}
      </p>
    </UI.Stack>
  );
}
function PaginateDemo() {
  const [page, setPage] = useState(1);
  const rows = [
    "Booking 1",
    "Booking 2",
    "Booking 3",
    "Booking 4",
    "Booking 5",
  ];
  const visible = UI.paginate(rows, page, 2);
  return (
    <UI.Stack>
      <ul>
        {visible.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      <UI.Pagination
        page={page}
        pageCount={UI.pageCount(rows.length, 2)}
        onPageChange={setPage}
      />
    </UI.Stack>
  );
}
const options = [
  {
    value: "hotel",
    label: "Hotel",
    icon: "hotel" as const,
    description: "Accommodation partners",
  },
  {
    value: "transport",
    label: "Transport",
    icon: "car" as const,
    description: "Transfers and car rentals",
  },
  {
    value: "activity",
    label: "Activity",
    icon: "ticket" as const,
    description: "Experiences and attractions",
  },
];
function ButtonDemo() {
  return (
    <UI.Stack direction="row" wrap align="center">
      {(
        [
          "primary",
          "brand",
          "secondary",
          "tertiary",
          "ghost",
          "danger",
          "link",
        ] as const
      ).map((variant) => (
        <UI.Button key={variant} variant={variant}>
          {variant === "primary"
            ? "Create booking"
            : variant === "danger"
              ? "Delete"
              : variant[0].toUpperCase() + variant.slice(1)}
        </UI.Button>
      ))}
    </UI.Stack>
  );
}
function CheckboxDemo() {
  const [checked, set] = useState<boolean | "indeterminate">("indeterminate");
  return (
    <UI.Checkbox
      checked={checked}
      onCheckedChange={set}
      label="Select all travelers"
      description="Includes every traveler on this booking."
    />
  );
}
function SwitchDemo() {
  const [checked, set] = useState(true);
  return (
    <UI.Switch
      checked={checked}
      onCheckedChange={set}
      label="Booking notifications"
      description="Get an update when a booking changes."
    />
  );
}
function RadioDemo() {
  const [value, set] = useState("agency");
  return (
    <UI.RadioGroup
      aria-label="Booking source"
      value={value}
      onValueChange={set}
      options={[
        {
          value: "agency",
          label: "Agency booking",
          description: "Managed by your team",
        },
        {
          value: "direct",
          label: "Direct booking",
          description: "Booked by the traveler",
        },
      ]}
    />
  );
}
function TextFieldDemo() {
  const [value, set] = useState("Aarav Sharma");
  return (
    <UI.TextField
      label="Traveler name"
      value={value}
      onValueChange={set}
      hint="Enter the name as it appears on their passport."
      leadingIcon="user"
    />
  );
}
function SelectDemo() {
  const [value, set] = useState("hotel");
  return (
    <UI.SelectField
      label="Service type"
      options={options}
      value={value}
      onValueChange={set}
    />
  );
}
function ComboDemo() {
  const [value, set] = useState("hotel");
  return (
    <UI.Combobox
      label="Service type"
      options={options}
      value={value}
      onValueChange={set}
      hint="Search by service name."
    />
  );
}
function MultiDemo() {
  const [value, set] = useState(["hotel"]);
  return (
    <UI.MultiSelect
      label="Services offered"
      options={options}
      value={value}
      onValueChange={set}
    />
  );
}
function MoneyDemo() {
  const [value, set] = useState<number | null>(12500);
  return (
    <UI.MoneyField
      label="Deposit amount"
      value={value}
      onValueChange={set}
      hint="Amounts are in Indian rupees."
    />
  );
}
function PhoneDemo() {
  const [value, set] = useState("9876543210");
  const [code, setCode] = useState("+91");
  return (
    <UI.PhoneField
      label="Phone number"
      value={value}
      onValueChange={set}
      countryCode={code}
      onCountryCodeChange={setCode}
    />
  );
}
function RangeDemo() {
  const [value, set] = useState<UI.DateRangeValue>({
    from: "2026-11-10",
    to: "2026-11-15",
  });
  return (
    <UI.DateRangeField label="Travel dates" value={value} onValueChange={set} />
  );
}
function SearchDemo() {
  const [value, set] = useState("");
  return (
    <UI.SearchField
      placeholder="Search bookings"
      value={value}
      onValueChange={set}
    />
  );
}
function ChoiceDemo() {
  const [value, set] = useState(["hotel"]);
  return (
    <UI.ChoiceChips
      aria-label="Services"
      options={options}
      value={value}
      onValueChange={set}
    />
  );
}
function SegmentDemo() {
  const [value, set] = useState("list");
  return (
    <UI.SegmentedControl
      aria-label="View"
      value={value}
      onValueChange={set}
      options={[
        { value: "list", label: "List", icon: "list" },
        { value: "board", label: "Board", icon: "board" },
      ]}
    />
  );
}
function QuantityDemo() {
  const [value, set] = useState(2);
  return (
    <UI.QuantityField
      label="Rooms"
      value={value}
      onValueChange={set}
      min={1}
      max={8}
      unit={{ one: "room", other: "rooms" }}
      hint="Up to 8 rooms per booking."
    />
  );
}
function PaxDemo() {
  const [value, set] = useState<UI.PaxValue>({
    adults: 2,
    children: 1,
    infants: 0,
    childAges: [8],
  });
  return (
    <UI.PaxSelector
      label="Travelers"
      value={value}
      onValueChange={set}
      maxTotal={9}
    />
  );
}
function ModalDemo() {
  const [open, set] = useState(false);
  return (
    <UI.Modal
      open={open}
      onOpenChange={set}
      title="Edit traveler"
      description="Update the traveler's contact details."
      trigger={<UI.Button>Edit traveler</UI.Button>}
      footer={
        <>
          <UI.Button onClick={() => set(false)}>Cancel</UI.Button>
          <UI.Button
            variant="primary"
            onClick={() => {
              set(false);
              UI.toast("Traveler updated", { tone: "success" });
            }}
          >
            Save changes
          </UI.Button>
        </>
      }
    >
      <UI.TextField
        label="Email address"
        type="email"
        defaultValue="aarav@example.com"
      />
    </UI.Modal>
  );
}
function ConfirmDemo() {
  const [open, set] = useState(false);
  return (
    <UI.ConfirmDialog
      open={open}
      onOpenChange={set}
      title="Delete draft?"
      message="This removes the draft booking. Confirmed bookings are unaffected."
      confirmLabel="Delete draft"
      danger
      onConfirm={() => {
        UI.toast("Draft deleted", { tone: "success" });
      }}
      trigger={<UI.Button variant="danger">Delete draft</UI.Button>}
    />
  );
}
function TabsDemo() {
  const [value, set] = useState("bookings");
  return (
    <UI.TabBar
      aria-label="Customer records"
      value={value}
      onValueChange={set}
      items={[
        {
          value: "bookings",
          label: "Bookings",
          count: 12,
          content: <p>12 bookings for this customer.</p>,
        },
        {
          value: "travelers",
          label: "Travelers",
          count: 4,
          content: <p>4 traveler profiles.</p>,
        },
        {
          value: "documents",
          label: "Documents",
          count: 3,
          content: <p>3 saved documents.</p>,
        },
      ]}
    />
  );
}
const rows = [
  {
    id: "BK-1042",
    name: "Mehta family · Bali",
    status: "Confirmed",
    amount: 248000,
  },
  {
    id: "BK-1043",
    name: "Sharma couple · Kerala",
    status: "Awaiting payment",
    amount: 86000,
  },
  {
    id: "BK-1044",
    name: "Kapoor group · Dubai",
    status: "Draft",
    amount: 174500,
  },
];
function DataDemo() {
  const [selected, set] = useState<string[]>([]);
  return (
    <UI.Stack>
      <UI.DataTable
        rows={rows}
        getRowId={(r) => r.id}
        caption="Recent bookings"
        selected={selected}
        onSelectionChange={set}
        columns={[
          {
            id: "booking",
            header: "Booking",
            sortValue: (r) => r.name,
            render: (r) => <UI.EntityCell name={r.name} description={r.id} />,
          },
          {
            id: "status",
            header: "Status",
            render: (r) => (
              <UI.StatusChip
                tone={
                  r.status === "Confirmed"
                    ? "success"
                    : r.status === "Draft"
                      ? "neutral"
                      : "warning"
                }
              >
                {r.status}
              </UI.StatusChip>
            ),
          },
          {
            id: "amount",
            header: "Total",
            align: "right",
            sortValue: (r) => r.amount,
            render: (r) => <UI.MoneyCell value={r.amount} />,
          },
        ]}
      />
      {selected.length ? (
        <UI.BulkActionBar count={selected.length} onClear={() => set([])}>
          <UI.Button onClick={() => UI.toast("Export requested")}>
            Export
          </UI.Button>
        </UI.BulkActionBar>
      ) : null}
    </UI.Stack>
  );
}
function PaginationDemo() {
  const [page, set] = useState(1);
  return <UI.Pagination page={page} pageCount={5} onPageChange={set} />;
}
function ChecklistDemo() {
  const [checked, set] = useState(["passport"]);
  return (
    <UI.Checklist
      items={[
        {
          id: "passport",
          label: "Passport copies",
          checked: checked.includes("passport"),
        },
        {
          id: "payment",
          label: "Deposit received",
          checked: checked.includes("payment"),
        },
      ]}
      onCheckedChange={(id, on) =>
        set(on ? [...checked, id] : checked.filter((v) => v !== id))
      }
    />
  );
}
function FileDemo() {
  const [message, set] = useState("PDF or image, up to 5 MB.");
  return (
    <UI.FileDropzone
      label="Upload traveler documents"
      description={message}
      accept=".pdf,image/*"
      maxBytes={5 * 1024 * 1024}
      onFiles={(files) =>
        set(`${files.length} file selected: ${files[0]?.name}`)
      }
      onError={set}
    />
  );
}
function FormDemo() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        UI.toast("Traveler saved", { tone: "success" });
      }}
    >
      <UI.Stack gap="6">
        <UI.FormSection
          title="Traveler details"
          description="Use the details on their travel document."
        >
          <UI.FormGrid>
            <UI.TextField label="First name" required defaultValue="Aarav" />
            <UI.TextField label="Last name" required defaultValue="Sharma" />
            <UI.TextField label="Email" type="email" span="full" optional />
          </UI.FormGrid>
        </UI.FormSection>
        <UI.FormFooter sticky={false}>
          <UI.Button type="reset">Reset</UI.Button>
          <UI.Button type="submit" variant="primary">
            Save traveler
          </UI.Button>
        </UI.FormFooter>
      </UI.Stack>
    </form>
  );
}
function ToastDemo() {
  return (
    <UI.Button
      onClick={() =>
        UI.toast("Booking confirmed", {
          description: "The traveler has been notified.",
          tone: "success",
        })
      }
    >
      Show notification
    </UI.Button>
  );
}
function AvatarDemo() {
  return (
    <UI.Stack direction="row" align="center">
      {(["xs", "chip", "sm", "md", "lg", "xl"] as const).map((size) => (
        <UI.Avatar key={size} name="Aarav Sharma" size={size} />
      ))}
    </UI.Stack>
  );
}
function StatusDemo() {
  return (
    <UI.Stack direction="row" wrap>
      {(["success", "warning", "danger", "info", "neutral"] as const).map(
        (tone) => (
          <UI.StatusChip tone={tone} key={tone}>
            {tone === "success"
              ? "Confirmed"
              : tone === "warning"
                ? "Pending"
                : tone === "danger"
                  ? "Cancelled"
                  : tone === "info"
                    ? "Processing"
                    : "Draft"}
          </UI.StatusChip>
        ),
      )}
    </UI.Stack>
  );
}
function TagDemo() {
  const [tags, set] = useState(["Honeymoon", "Premium", "Bali"]);
  return (
    <UI.Stack direction="row" wrap>
      {tags.map((tag) => (
        <UI.Tag
          key={tag}
          onRemove={() => set(tags.filter((t) => t !== tag))}
          removeLabel={`Remove ${tag}`}
        >
          {tag}
        </UI.Tag>
      ))}
      {!tags.length ? (
        <UI.Button onClick={() => set(["Honeymoon", "Premium", "Bali"])}>
          Reset tags
        </UI.Button>
      ) : null}
    </UI.Stack>
  );
}
export const examples: Example[] = [
  {
    name: "FilterMenu",
    code: "",
    source: "FilterControlsDemo",
    Demo: FilterControlsDemo,
  },
  {
    name: "FilterChips",
    code: "",
    source: "FilterControlsDemo",
    Demo: FilterControlsDemo,
  },
  {
    name: "SortMenu",
    code: "",
    source: "SortControlsDemo",
    Demo: SortControlsDemo,
  },
  {
    name: "ListToolbar",
    code: "",
    source: "CollectionListDemo",
    Demo: CollectionListDemo,
  },
  {
    name: "ListPageTemplate",
    code: "",
    source: "CollectionListDemo",
    Demo: CollectionListDemo,
  },
  {
    name: "IconTextCell",
    code: '<IconTextCell icon="map-pin">Kochi, India</IconTextCell>',
    Demo: () => <UI.IconTextCell icon="map-pin">Kochi, India</UI.IconTextCell>,
  },
  {
    name: "filterRows",
    kind: "utility",
    code: "",
    source: "FilterRowsDemo",
    Demo: FilterRowsDemo,
  },
  {
    name: "searchRows",
    kind: "utility",
    code: "",
    source: "SearchRowsDemo",
    Demo: SearchRowsDemo,
  },
  {
    name: "sortRows",
    kind: "utility",
    code: "",
    source: "SortControlsDemo",
    Demo: SortControlsDemo,
  },
  {
    name: "paginate",
    kind: "utility",
    code: "",
    source: "PaginateDemo",
    Demo: PaginateDemo,
  },
  {
    name: "pageCount",
    kind: "utility",
    code: "",
    source: "PaginateDemo",
    Demo: PaginateDemo,
  },
  {
    name: "Button",
    code: '<Button variant="primary" leadingIcon="plus">Create booking</Button>',
    Demo: ButtonDemo,
  },
  {
    name: "IconButton",
    code: '<IconButton icon="pencil" aria-label="Edit booking" />',
    Demo: () => (
      <UI.IconButton
        icon="pencil"
        aria-label="Edit booking"
        onClick={() => UI.toast("Edit booking selected")}
      />
    ),
  },
  {
    name: "Icon",
    code: '<Icon name="plane" size="xl" label="Flight" />',
    Demo: () => (
      <UI.Stack direction="row" gap="6">
        {(
          [
            "hotel",
            "plane",
            "car",
            "train",
            "ship",
            "compass",
            "ticket",
            "luggage",
          ] as const
        ).map((name) => (
          <UI.Icon key={name} name={name} size="xl" label={name} />
        ))}
      </UI.Stack>
    ),
  },
  {
    name: "Checkbox",
    code: 'const [checked, setChecked] = useState(false);\n<Checkbox checked={checked} onCheckedChange={setChecked} label="Select all travelers" />',
    Demo: CheckboxDemo,
  },
  {
    name: "Switch",
    code: 'const [enabled, setEnabled] = useState(true);\n<Switch checked={enabled} onCheckedChange={setEnabled} label="Booking notifications" />',
    Demo: SwitchDemo,
  },
  {
    name: "RadioGroup",
    code: 'const [value, setValue] = useState("agency");\n<RadioGroup aria-label="Booking source" value={value} onValueChange={setValue}\n  options={[{ value: "agency", label: "Agency booking" }, { value: "direct", label: "Direct booking" }]} />',
    Demo: RadioDemo,
  },
  {
    name: "Avatar",
    code: '<Avatar name="Aarav Sharma" size="md" />',
    Demo: AvatarDemo,
  },
  {
    name: "StatusChip",
    code: '<StatusChip tone="success">Confirmed</StatusChip>',
    Demo: StatusDemo,
  },
  { name: "Tag", code: '<Tag tone="work">Honeymoon</Tag>', Demo: TagDemo },
  {
    name: "CountBadge",
    code: "<CountBadge>24</CountBadge>",
    Demo: () => <UI.CountBadge>24</UI.CountBadge>,
  },
  {
    name: "IdChip",
    code: "<IdChip>BK-1042</IdChip>",
    Demo: () => <UI.IdChip>BK-1042</UI.IdChip>,
  },
  { name: "Kbd", code: "<Kbd>⌘ K</Kbd>", Demo: () => <UI.Kbd>⌘ K</UI.Kbd> },
  {
    name: "Spinner",
    code: '<Spinner label="Loading bookings" />',
    Demo: () => <UI.Spinner label="Loading bookings" />,
  },
  {
    name: "Skeleton",
    code: "<Skeleton lines={3} />",
    Demo: () => <UI.Skeleton lines={3} />,
  },
  {
    name: "Meter",
    code: '<Meter label="Monthly credits" value={640} max={1000} />',
    Demo: () => <UI.Meter label="Monthly credits" value={640} max={1000} />,
  },
  {
    name: "TextLink",
    code: '<TextLink href="https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR">Open Paper library</TextLink>',
    Demo: () => (
      <UI.TextLink
        href="https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR"
        target="_blank"
        rel="noreferrer"
      >
        Open Paper library
      </UI.TextLink>
    ),
  },
  {
    name: "Tooltip",
    code: '<Tooltip content="Export bookings as a spreadsheet"><Button>Export</Button></Tooltip>',
    Demo: () => (
      <UI.Tooltip content="Export bookings as a spreadsheet">
        <UI.Button>Export</UI.Button>
      </UI.Tooltip>
    ),
  },
  {
    name: "Divider",
    code: "<Divider />",
    Demo: () => (
      <UI.Stack>
        <span>Traveler details</span>
        <UI.Divider />
        <span>Booking details</span>
      </UI.Stack>
    ),
  },
  {
    name: "Stack",
    code: '<Stack direction="row" gap="3"><Button>Cancel</Button><Button variant="primary">Save</Button></Stack>',
    Demo: () => (
      <UI.Stack direction="row" gap="3">
        <UI.Button>Cancel</UI.Button>
        <UI.Button variant="primary">Save</UI.Button>
      </UI.Stack>
    ),
  },
  {
    name: "VisuallyHidden",
    code: '<Button><Icon name="plus" /><VisuallyHidden>Add traveler</VisuallyHidden></Button>',
    Demo: () => (
      <UI.Button>
        <UI.Icon name="plus" />
        <UI.VisuallyHidden>Add traveler</UI.VisuallyHidden>
      </UI.Button>
    ),
  },
  {
    name: "HeadingLevelProvider",
    code: "<HeadingLevelProvider level={3}><Heading>Traveler details</Heading></HeadingLevelProvider>",
    Demo: () => (
      <UI.HeadingLevelProvider level={3}>
        <UI.Heading>Traveler details</UI.Heading>
      </UI.HeadingLevelProvider>
    ),
  },
  {
    name: "Heading",
    code: "<Heading>Traveler details</Heading>",
    Demo: () => <UI.Heading>Traveler details</UI.Heading>,
  },
  {
    name: "Field",
    code: '<Field label="Booking reference" htmlFor="reference" hint="Your agency reference."><input id="reference" /></Field>',
    Demo: () => (
      <UI.Field
        label="Booking reference"
        htmlFor="example-reference"
        hint="Your agency reference."
      >
        <input
          className="pt-input-wrap"
          id="example-reference"
          defaultValue="BK-1042"
        />
      </UI.Field>
    ),
  },
  {
    name: "TextField",
    code: 'const [name, setName] = useState("Aarav Sharma");\n<TextField label="Traveler name" value={name} onValueChange={setName} leadingIcon="user" hint="Match the name on their passport." />',
    Demo: TextFieldDemo,
  },
  {
    name: "TextArea",
    code: '<TextArea label="Special requests" placeholder="Dietary needs, accessibility, or room preferences" optional />',
    Demo: () => (
      <UI.TextArea
        label="Special requests"
        placeholder="Dietary needs, accessibility, or room preferences"
        optional
      />
    ),
  },
  {
    name: "SelectField",
    code: 'const [value, setValue] = useState("hotel");\n<SelectField label="Service type" value={value} onValueChange={setValue} options={[{value:"hotel",label:"Hotel"},{value:"transport",label:"Transport"}]} />',
    Demo: SelectDemo,
  },
  {
    name: "Combobox",
    code: 'const [value, setValue] = useState("");\n<Combobox label="Service type" value={value} onValueChange={setValue} options={[{value:"hotel",label:"Hotel"},{value:"transport",label:"Transport"}]} />',
    Demo: ComboDemo,
  },
  {
    name: "MultiSelect",
    code: 'const [value, setValue] = useState<string[]>(["hotel"]);\n<MultiSelect label="Services offered" value={value} onValueChange={setValue} options={[{value:"hotel",label:"Hotel"},{value:"transport",label:"Transport"}]} />',
    Demo: MultiDemo,
  },
  {
    name: "DateField",
    code: '<DateField label="Departure date" defaultValue="2026-11-10" />',
    Demo: () => (
      <UI.DateField label="Departure date" defaultValue="2026-11-10" />
    ),
  },
  {
    name: "TimeField",
    code: '<TimeField label="Pickup time" defaultValue="09:30" />',
    Demo: () => <UI.TimeField label="Pickup time" defaultValue="09:30" />,
  },
  {
    name: "DateRangeField",
    code: 'const [dates, setDates] = useState({from:"2026-11-10",to:"2026-11-15"});\n<DateRangeField label="Travel dates" value={dates} onValueChange={setDates} />',
    Demo: RangeDemo,
  },
  {
    name: "MoneyField",
    code: 'const [amount, setAmount] = useState<number | null>(12500);\n<MoneyField label="Deposit amount" value={amount} onValueChange={setAmount} currency="INR" />',
    Demo: MoneyDemo,
  },
  {
    name: "PhoneField",
    code: 'const [phone, setPhone] = useState("");\nconst [code, setCode] = useState("+91");\n<PhoneField label="Phone number" value={phone} onValueChange={setPhone} countryCode={code} onCountryCodeChange={setCode} />',
    Demo: PhoneDemo,
  },
  {
    name: "SearchField",
    code: 'const [query, setQuery] = useState("");\n<SearchField placeholder="Search bookings" value={query} onValueChange={setQuery} />',
    Demo: SearchDemo,
  },
  {
    name: "ChoiceChips",
    code: 'const [value, setValue] = useState<string[]>([]);\n<ChoiceChips aria-label="Services" value={value} onValueChange={setValue} options={[{value:"hotel",label:"Hotel"},{value:"transport",label:"Transport"}]} />',
    Demo: ChoiceDemo,
  },
  {
    name: "SegmentedControl",
    code: 'const [view, setView] = useState("list");\n<SegmentedControl aria-label="View" value={view} onValueChange={setView} options={[{value:"list",label:"List"},{value:"board",label:"Board"}]} />',
    Demo: SegmentDemo,
  },
  {
    name: "QuantityField",
    code: 'const [rooms, setRooms] = useState(2);\n<QuantityField label="Rooms" value={rooms} onValueChange={setRooms} min={1} max={8} unit={{one:"room",other:"rooms"}} />',
    Demo: QuantityDemo,
  },
  {
    name: "PaxSelector",
    code: 'const [pax, setPax] = useState({adults:2,children:0,infants:0,childAges:[] as (number|null)[]});\n<PaxSelector label="Travelers" value={pax} onValueChange={setPax} maxTotal={9} />',
    Demo: PaxDemo,
  },
  {
    name: "FormSection",
    code: '<FormSection title="Traveler details"><TextField label="Full name" /></FormSection>',
    Demo: FormDemo,
  },
  {
    name: "FormGrid",
    code: '<FormGrid columns={2}><TextField label="First name" /><TextField label="Last name" /></FormGrid>',
    Demo: FormDemo,
  },
  {
    name: "FormFooter",
    code: '<FormFooter sticky={false}><Button>Cancel</Button><Button variant="primary" type="submit">Save traveler</Button></FormFooter>',
    Demo: FormDemo,
  },
  {
    name: "Modal",
    code: 'const [open, setOpen] = useState(false);\n<Modal open={open} onOpenChange={setOpen} title="Edit traveler" trigger={<Button>Edit traveler</Button>}><TextField label="Email address" type="email" /></Modal>',
    Demo: ModalDemo,
  },
  {
    name: "ConfirmDialog",
    code: 'const [open, setOpen] = useState(false);\n<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete draft?" message="This removes the draft booking." danger onConfirm={() => deleteDraft()} trigger={<Button>Delete draft</Button>} />',
    Demo: ConfirmDemo,
  },
  {
    name: "Popover",
    code: '<Popover label="Booking notes" trigger={<Button>Notes</Button>}><p>Window seat requested.</p></Popover>',
    Demo: () => (
      <UI.Popover label="Booking notes" trigger={<UI.Button>Notes</UI.Button>}>
        <p>Window seat requested.</p>
      </UI.Popover>
    ),
  },
  {
    name: "Menu",
    code: '<Menu label="Booking actions" trigger={<Button>Actions</Button>} items={[{id:"copy",label:"Copy reference",icon:"copy",onSelect:copyReference}]} />',
    Demo: () => (
      <UI.Menu
        label="Booking actions"
        trigger={<UI.Button trailingIcon="chevron-down">Actions</UI.Button>}
        items={[
          {
            id: "copy",
            label: "Copy reference",
            icon: "copy",
            onSelect: () => UI.toast("Reference copied"),
          },
          {
            id: "download",
            label: "Download itinerary",
            icon: "download",
            onSelect: () => UI.toast("Download selected"),
          },
        ]}
      />
    ),
  },
  {
    name: "toast",
    code: 'toast("Booking confirmed", {tone:"success", description:"The traveler has been notified."});\n// Mount <Toaster /> once inside your ThemeProvider.',
    Demo: ToastDemo,
  },
  {
    name: "Toaster",
    code: '<ThemeProvider theme="light"><App /><Toaster /></ThemeProvider>',
    Demo: ToastDemo,
  },
  {
    name: "PageHeader",
    code: '<PageHeader title="Bookings" count={24} description="Manage every journey in one place." actions={<Button variant="primary" leadingIcon="plus">Create booking</Button>} />',
    Demo: () => (
      <UI.PageHeader
        title="Bookings"
        count={24}
        description="Manage every journey in one place."
        actions={
          <UI.Button variant="primary" leadingIcon="plus">
            Create booking
          </UI.Button>
        }
      />
    ),
  },
  {
    name: "Panel",
    code: '<Panel title="Booking summary" description="All amounts include taxes."><Money value={248000} /></Panel>',
    Demo: () => (
      <UI.Panel
        title="Booking summary"
        description="All amounts include taxes."
      >
        <UI.SummaryStrip
          items={[
            { label: "Total value", value: <UI.Money value={248000} /> },
            { label: "Deposit received", value: <UI.Money value={62000} /> },
          ]}
        />
      </UI.Panel>
    ),
  },
  {
    name: "RecordHeader",
    code: '<RecordHeader title="Mehta family · Bali" code="BK-1042" description="10–15 November 2026" status={<StatusChip tone="success">Confirmed</StatusChip>} />',
    Demo: () => (
      <UI.RecordHeader
        title="Mehta family · Bali"
        code="BK-1042"
        description="10–15 November 2026"
        status={<UI.StatusChip tone="success">Confirmed</UI.StatusChip>}
      />
    ),
  },
  {
    name: "IconText",
    code: '<IconText icon="map-pin">Bali, Indonesia</IconText>',
    Demo: () => <UI.IconText icon="map-pin">Bali, Indonesia</UI.IconText>,
  },
  {
    name: "PersonInline",
    code: '<PersonInline name="Aarav Sharma" />',
    Demo: () => <UI.PersonInline name="Aarav Sharma" />,
  },
  {
    name: "Money",
    code: '<Money value={248000} currency="INR" />',
    Demo: () => (
      <UI.Stack direction="row" gap="6">
        <UI.Money value={248000} />
        <UI.Money value={62000} tone="success" />
        <UI.Money value={1250.5} currency="USD" decimals={2} />
      </UI.Stack>
    ),
  },
  {
    name: "DateText",
    code: '<DateText value="2026-11-10" format="long" />',
    Demo: () => <UI.DateText value="2026-11-10" format="long" />,
  },
  {
    name: "DescriptionList",
    code: '<DescriptionList items={[{label:"Destination",value:"Bali, Indonesia"},{label:"Travelers",value:"2 adults"}]} />',
    Demo: () => (
      <UI.DescriptionList
        items={[
          { label: "Destination", value: "Bali, Indonesia" },
          { label: "Travelers", value: "2 adults" },
          { label: "Departure", value: <UI.DateText value="2026-11-10" /> },
          { label: "Booking value", value: <UI.Money value={248000} /> },
        ]}
      />
    ),
  },
  {
    name: "SummaryStrip",
    code: '<SummaryStrip items={[{label:"Total bookings",value:"128"},{label:"Booking value",value:<Money value={3240000}/>}]} />',
    Demo: () => (
      <UI.SummaryStrip
        items={[
          { label: "Total bookings", value: "128", hint: "This month" },
          { label: "Booking value", value: <UI.Money value={3240000} /> },
          { label: "Awaiting payment", value: "12" },
        ]}
      />
    ),
  },
  {
    name: "Banner",
    code: '<Banner tone="warning" title="Payment due soon">Collect the balance before 5 November.</Banner>',
    Demo: () => (
      <UI.Banner tone="warning" title="Payment due soon">
        Collect the balance before 5 November.
      </UI.Banner>
    ),
  },
  {
    name: "EmptyState",
    code: '<EmptyState title="No bookings yet" description="Create a booking to start planning your first journey." icon="bookings" action={<Button variant="primary">Create booking</Button>} />',
    Demo: () => (
      <UI.EmptyState
        title="No bookings yet"
        description="Create a booking to start planning your first journey."
        icon="bookings"
        action={<UI.Button variant="primary">Create booking</UI.Button>}
      />
    ),
  },
  {
    name: "ItemList",
    code: '<ItemList items={[{id:"flight",title:"Flight to Denpasar",description:"10 November · 09:30",icon:"plane"}]} />',
    Demo: () => (
      <UI.ItemList
        items={[
          {
            id: "flight",
            title: "Flight to Denpasar",
            description: "10 November · 09:30",
            icon: "plane",
          },
          {
            id: "hotel",
            title: "The Westin Resort",
            description: "5 nights · Deluxe room",
            icon: "hotel",
          },
        ]}
      />
    ),
  },
  {
    name: "ContactList",
    code: '<ContactList items={[{label:"Email",value:"aarav@example.com",type:"email"}]} />',
    Demo: () => (
      <UI.ContactList
        items={[
          { label: "Email", value: "aarav@example.com", type: "email" },
          { label: "Phone", value: "+919876543210", type: "phone" },
        ]}
      />
    ),
  },
  {
    name: "Steps",
    code: '<Steps current="payment" steps={[{id:"details",label:"Details"},{id:"payment",label:"Payment"},{id:"confirmed",label:"Confirmed"}]} />',
    Demo: () => (
      <UI.Steps
        current="payment"
        steps={[
          { id: "details", label: "Details" },
          { id: "payment", label: "Payment" },
          { id: "confirmed", label: "Confirmed" },
        ]}
      />
    ),
  },
  {
    name: "Checklist",
    code: "<Checklist items={documents} onCheckedChange={updateDocument} />",
    Demo: ChecklistDemo,
  },
  {
    name: "FileDropzone",
    code: '<FileDropzone label="Upload traveler documents" accept=".pdf,image/*" maxBytes={5242880} onFiles={handleFiles} onError={handleError} />',
    Demo: FileDemo,
  },
  {
    name: "TabBar",
    code: 'const [tab, setTab] = useState("bookings");\n<TabBar aria-label="Customer records" value={tab} onValueChange={setTab} items={[{value:"bookings",label:"Bookings",count:12,content:<BookingList/>},{value:"travelers",label:"Travelers",content:<TravelerList/>}]} />',
    Demo: TabsDemo,
  },
  {
    name: "Breadcrumbs",
    code: '<Breadcrumbs items={[{label:"Bookings",href:"/bookings"},{label:"BK-1042"}]} />',
    Demo: () => (
      <UI.Breadcrumbs
        items={[
          { label: "Bookings", href: "#/components/Breadcrumbs" },
          { label: "BK-1042" },
        ]}
      />
    ),
  },
  {
    name: "BackButton",
    code: "<BackButton onClick={() => history.back()}>Back to bookings</BackButton>",
    Demo: () => (
      <UI.BackButton onClick={() => UI.toast("Back selected")}>
        Back to bookings
      </UI.BackButton>
    ),
  },
  {
    name: "Pagination",
    code: "const [page, setPage] = useState(1);\n<Pagination page={page} pageCount={5} onPageChange={setPage} />",
    Demo: PaginationDemo,
  },
  {
    name: "DataTable",
    code: '<DataTable rows={bookings} getRowId={row => row.id} caption="Recent bookings"\n  columns={[{id:"name",header:"Booking",render:row=>row.name},{id:"total",header:"Total",align:"right",render:row=><Money value={row.amount}/>}]} />',
    Demo: DataDemo,
  },
  {
    name: "EntityCell",
    code: '<EntityCell name="Mehta family · Bali" description="BK-1042" />',
    Demo: () => (
      <UI.EntityCell name="Mehta family · Bali" description="BK-1042" />
    ),
  },
  {
    name: "PersonCell",
    code: '<PersonCell name="Aarav Sharma" description="Booking owner" />',
    Demo: () => (
      <UI.PersonCell name="Aarav Sharma" description="Booking owner" />
    ),
  },
  {
    name: "StackCell",
    code: '<StackCell primary="Bali, Indonesia" secondary="5 nights · 2 adults" />',
    Demo: () => (
      <UI.StackCell primary="Bali, Indonesia" secondary="5 nights · 2 adults" />
    ),
  },
  {
    name: "MoneyCell",
    code: "<MoneyCell value={248000} due={186000} />",
    Demo: () => <UI.MoneyCell value={248000} due={186000} />,
  },
  {
    name: "DateCell",
    code: '<DateCell value="2026-11-10" note="Departure" />',
    Demo: () => <UI.DateCell value="2026-11-10" note="Departure" />,
  },
  {
    name: "TableFooter",
    code: "<TableFooter page={1} pageSize={10} total={3} onPageChange={setPage} />",
    Demo: () => (
      <UI.TableFooter
        page={1}
        pageSize={10}
        total={3}
        onPageChange={() => {}}
      />
    ),
  },
  {
    name: "BulkActionBar",
    code: "<BulkActionBar count={3} onClear={clearSelection}><Button onClick={exportSelected}>Export</Button></BulkActionBar>",
    Demo: DataDemo,
  },
  {
    name: "StageLabel",
    code: '<StageLabel tone="warning">Awaiting confirmation</StageLabel>',
    Demo: () => (
      <UI.StageLabel tone="warning">Awaiting confirmation</UI.StageLabel>
    ),
  },
  {
    name: "PriorityDot",
    code: '<PriorityDot priority="high" />',
    Demo: () => (
      <UI.Stack direction="row" gap="4">
        {(["low", "medium", "high", "urgent"] as const).map((priority) => (
          <UI.PriorityDot key={priority} priority={priority} />
        ))}
      </UI.Stack>
    ),
  },
  {
    name: "KanbanSignal",
    code: '<KanbanSignal icon="users">2 adults</KanbanSignal>',
    Demo: () => <UI.KanbanSignal icon="users">2 adults</UI.KanbanSignal>,
  },
  {
    name: "KanbanCard",
    code: '<KanbanCard title="Mehta family · Bali" code="Q-1042" priority="high" description="5 nights · 2 adults" footer={<KanbanSignal icon="calendar">10 November</KanbanSignal>} />',
    Demo: () => (
      <UI.KanbanCard
        title="Mehta family · Bali"
        code="Q-1042"
        priority="high"
        description="5 nights · 2 adults"
        footer={<UI.KanbanSignal icon="calendar">10 November</UI.KanbanSignal>}
      />
    ),
  },
  {
    name: "PriceChip",
    code: "<PriceChip value={12500} />",
    Demo: () => <UI.PriceChip value={12500} />,
  },
  {
    name: "SeasonHeader",
    code: '<SeasonHeader name="Winter season" from="2026-11-01" to="2027-02-28" />',
    Demo: () => (
      <UI.SeasonHeader name="Winter season" from="2026-11-01" to="2027-02-28" />
    ),
  },
];
