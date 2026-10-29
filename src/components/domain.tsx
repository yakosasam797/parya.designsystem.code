import { useState, type CSSProperties } from "react";
import { Icon, type IconName } from "./Icon";
import { Button, StatusChip, Tooltip, cx, type StatusTone } from "./primitives";
import { TextField } from "./forms";
import { Modal } from "./overlays";
import type { AppNavGroup } from "./shell";

export interface VocabularyEntry {
  label: string;
  icon: IconName;
}
export const SERVICE_TYPES = {
  accommodation: { label: "Accommodation", icon: "hotel" },
  transport: { label: "Transport", icon: "car" },
  activity: { label: "Activities", icon: "compass" },
  flight: { label: "Flights", icon: "plane" },
  visa: { label: "Visa", icon: "id-card" },
  addon: { label: "Add-ons", icon: "package-plus" },
  insurance: { label: "Insurance", icon: "shield-check" },
  cruise: { label: "Cruise", icon: "ship" },
  rail: { label: "Rail", icon: "train" },
  meal: { label: "Meals", icon: "utensils" },
  guide: { label: "Guides", icon: "flag" },
} as const satisfies Record<string, VocabularyEntry>;
export type ServiceType = keyof typeof SERVICE_TYPES;
export const SERVICE_TYPE_IDS = Object.keys(SERVICE_TYPES) as ServiceType[];
export const VENDOR_TYPES = {
  direct: { label: "Direct supplier", icon: "handshake" },
  dmc: { label: "DMC", icon: "briefcase" },
  wholesaler: { label: "Wholesaler", icon: "warehouse" },
  airline: { label: "Airline", icon: "plane" },
  "hotel-chain": { label: "Hotel chain", icon: "building" },
  transporter: { label: "Transporter", icon: "van" },
  "activity-operator": { label: "Activity operator", icon: "compass" },
  "visa-agent": { label: "Visa agent", icon: "passport" },
} as const satisfies Record<string, VocabularyEntry>;
export type VendorType = keyof typeof VENDOR_TYPES;
export const VENDOR_TYPE_IDS = Object.keys(VENDOR_TYPES) as VendorType[];
export const CUSTOMER_TYPES = {
  b2c: { label: "B2C", icon: "user" },
  b2b: { label: "B2B agent", icon: "handshake" },
  "sub-agent": { label: "Sub-agent", icon: "users" },
  corporate: { label: "Corporate", icon: "building" },
} as const satisfies Record<string, VocabularyEntry>;
export type CustomerType = keyof typeof CUSTOMER_TYPES;
export const CUSTOMER_TYPE_IDS = Object.keys(CUSTOMER_TYPES) as CustomerType[];
export const QUERY_TYPES = {
  trip: { label: "Trip", icon: "luggage" },
  flight: { label: "Flights", icon: "plane" },
  accommodation: { label: "Accommodation", icon: "hotel" },
  visa: { label: "Visa", icon: "id-card" },
  cruise: { label: "Cruise", icon: "ship" },
  transport: { label: "Transport", icon: "car" },
} as const satisfies Record<string, VocabularyEntry>;
export type QueryType = keyof typeof QUERY_TYPES;
export interface EnumLabelProps {
  icon: IconName;
  label: string;
  size?: "sm" | "md";
}
export function EnumLabel({ icon, label, size = "md" }: EnumLabelProps) {
  return (
    <span className={cx("pt-enum-label", `pt-enum-label--${size}`)}>
      <Icon name={icon} size={size === "sm" ? "sm" : "md"} />
      <span>{label}</span>
    </span>
  );
}
export function ServiceTypeLabel({
  type,
  size,
}: {
  type: ServiceType;
  size?: "sm" | "md";
}) {
  return (
    <EnumLabel
      {...(SERVICE_TYPES[type] ?? { label: "Unknown service", icon: "info" })}
      size={size}
    />
  );
}
export function VendorTypeLabel({
  type,
  size,
}: {
  type: VendorType;
  size?: "sm" | "md";
}) {
  return (
    <EnumLabel
      {...(VENDOR_TYPES[type] ?? {
        label: "Unknown vendor type",
        icon: "info",
      })}
      size={size}
    />
  );
}
export function CustomerTypeLabel({
  type,
  size,
}: {
  type: CustomerType;
  size?: "sm" | "md";
}) {
  return (
    <EnumLabel
      {...(CUSTOMER_TYPES[type] ?? {
        label: "Unknown customer type",
        icon: "info",
      })}
      size={size}
    />
  );
}
export function QueryTypeLabel({
  type,
  size,
}: {
  type: QueryType;
  size?: "sm" | "md";
}) {
  return (
    <EnumLabel
      {...(QUERY_TYPES[type] ?? { label: "Unknown query type", icon: "info" })}
      size={size}
    />
  );
}
export interface ServiceTypeListProps {
  types: ServiceType[];
  max?: number;
  size?: "sm" | "md";
  "aria-label"?: string;
}
export function ServiceTypeList({
  types,
  max = 3,
  size = "md",
  "aria-label": label = "Service types",
}: ServiceTypeListProps) {
  const unique = [...new Set(types)].filter((type) => type in SERVICE_TYPES),
    count = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 3;
  const hidden = unique
    .slice(count)
    .map((type) => SERVICE_TYPES[type].label)
    .join(", ");
  return (
    <span className="pt-service-types" role="group" aria-label={label}>
      {unique.length ? (
        <>
          {unique.slice(0, count).map((type) => (
            <ServiceTypeLabel key={type} type={type} size={size} />
          ))}
          {hidden ? (
            <Tooltip content={hidden}>
              <button
                type="button"
                className="pt-service-overflow"
                aria-label={`More service types: ${hidden}`}
              >
                +{unique.length - count}
              </button>
            </Tooltip>
          ) : null}
        </>
      ) : (
        <span aria-label="No service types">—</span>
      )}
    </span>
  );
}
export type TierBadgeColor =
  "work" | "person" | "warm" | "channel" | "neutral" | string;
export interface TierBadgeProps {
  label: string;
  color?: TierBadgeColor;
  size?: "sm" | "md";
}
export function TierBadge({
  label,
  color = "neutral",
  size = "md",
}: TierBadgeProps) {
  const valid = /^#[0-9a-f]{6}$/i.test(color),
    semantic = ["work", "person", "warm", "channel", "neutral"].includes(color)
      ? color
      : "neutral";
  return (
    <span className={cx("pt-tier-badge", `pt-tier-badge--${size}`)}>
      <span
        aria-hidden="true"
        style={{
          background: valid ? color : `var(--pt-color-tone-${semantic}-text)`,
        }}
      />
      {label}
    </span>
  );
}
export const DOCUMENT_TYPES = {
  passport: { label: "Passport", code: "PASS", icon: "passport" },
  visa: { label: "Visa", code: "VISA", icon: "id-card" },
  pan: { label: "PAN", code: "PAN", icon: "id-card" },
  aadhaar: { label: "Aadhaar", code: "AADH", icon: "id-card" },
  photo: { label: "Photo", code: "PHOT", icon: "image" },
  insurance: { label: "Insurance", code: "INSU", icon: "shield-check" },
  ticket: { label: "Ticket", code: "TKT", icon: "ticket" },
  voucher: { label: "Voucher", code: "VCHR", icon: "file-check" },
  invoice: { label: "Invoice", code: "INV", icon: "invoice" },
  "gst-certificate": {
    label: "GST certificate",
    code: "GST",
    icon: "file-text",
  },
  agreement: { label: "Agreement", code: "AGMT", icon: "file-text" },
  "trade-licence": { label: "Trade licence", code: "TL", icon: "file-text" },
  "cancelled-cheque": {
    label: "Cancelled cheque",
    code: "CHQ",
    icon: "file-text",
  },
  msme: { label: "MSME", code: "MSME", icon: "file-text" },
  other: { label: "Other document", code: "DOC", icon: "file" },
} as const satisfies Record<string, VocabularyEntry & { code: string }>;
export type DocumentType = keyof typeof DOCUMENT_TYPES;
export function DocumentTypeTile({
  type,
  size = "md",
}: {
  type: DocumentType;
  size?: "md" | "lg";
}) {
  const entry = DOCUMENT_TYPES[type] ?? DOCUMENT_TYPES.other;
  return (
    <span
      className={cx(
        "pt-document-tile",
        size === "lg" && "pt-document-tile--lg",
      )}
      role="img"
      aria-label={entry.label}
    >
      {entry.code}
    </span>
  );
}
export type StatusDomain =
  | "vendor"
  | "service"
  | "rateCard"
  | "booking"
  | "payment"
  | "invoice"
  | "task"
  | "customer"
  | "query"
  | "package"
  | "document"
  | "ledger"
  | "member";
const statusGroups: Record<StatusTone, string[]> = {
  success: [
    "active",
    "published",
    "confirmed",
    "completed",
    "paid",
    "settled",
    "done",
    "won",
    "verified",
    "ready",
  ],
  warning: [
    "draft",
    "in-progress",
    "pending",
    "upcoming",
    "part-paid",
    "partially-paid",
    "quoted",
    "on-hold",
    "expiring-soon",
  ],
  danger: [
    "expired",
    "blocked",
    "overdue",
    "cancelled",
    "lost",
    "failed",
    "missing",
    "suspended",
    "action-needed",
  ],
  info: [
    "open",
    "new",
    "on-trip",
    "to-collect",
    "due",
    "sent",
    "lead",
    "scheduled",
    "invited",
  ],
  neutral: ["inactive", "archived", "refunded", "void", "deactivated"],
};
export function statusMeta(
  domain: StatusDomain,
  value: string,
): { label: string; tone: StatusTone } {
  const key = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  if (domain === "ledger") {
    const tones: Record<string, StatusTone> = {
      credit: "success",
      debit: "info",
      refund: "warning",
      adjustment: "neutral",
    };
    return {
      label: key === "credit" ? "Payment received" : sentenceCase(key),
      tone: tones[key] ?? "neutral",
    };
  }
  const tone =
    (Object.keys(statusGroups) as StatusTone[]).find((tone) =>
      statusGroups[tone].includes(key),
    ) ?? "neutral";
  return { label: sentenceCase(key), tone };
}
function sentenceCase(value: string) {
  const text = value.replaceAll("-", " ");
  return text ? text[0].toUpperCase() + text.slice(1) : "Unknown";
}
export interface StatusBadgeProps {
  domain: StatusDomain;
  status: string;
  size?: "sm" | "md";
  dot?: boolean;
}
export function StatusBadge({ domain, status, ...props }: StatusBadgeProps) {
  const meta = statusMeta(domain, status);
  return (
    <StatusChip {...props} tone={meta.tone}>
      {meta.label}
    </StatusChip>
  );
}
export interface ParyatechNavOptions {
  counts?: Record<string, number>;
  hide?: string[];
  href?: (id: string) => string | undefined;
  children?: Record<
    string,
    { id: string; label: string; href?: string; disabled?: boolean }[]
  >;
}
const navigation: {
  id: string;
  label: string;
  entries: [string, string, IconName][];
}[] = [
  {
    id: "workspace",
    label: "Workspace",
    entries: [
      ["home", "Home", "home"],
      ["inbox", "Inbox", "inbox"],
      ["news", "News", "news"],
      ["tasks", "Tasks", "tasks"],
    ],
  },
  {
    id: "sales",
    label: "Sales",
    entries: [
      ["queries", "Queries", "queries"],
      ["packages", "Packages", "packages"],
      ["bookings", "Bookings", "bookings"],
    ],
  },
  {
    id: "crm",
    label: "CRM",
    entries: [
      ["customers", "Customers", "customers"],
      ["vendors", "Vendors", "vendors"],
    ],
  },
  {
    id: "operations",
    label: "Operations",
    entries: [
      ["finance", "Finance", "finance"],
      ["team", "Team", "team"],
      ["automations", "Automations", "automations"],
      ["insights", "Insights", "reports"],
      ["settings", "Settings", "settings"],
    ],
  },
];
export function paryatechNav({
  counts = {},
  hide = [],
  href,
  children = {},
}: ParyatechNavOptions = {}): AppNavGroup[] {
  return navigation
    .map((group) => ({
      id: group.id,
      label: group.label,
      items: group.entries
        .filter(([id]) => !hide.includes(id))
        .map(([id, label, icon]) => ({
          id,
          label,
          icon,
          href: href?.(id),
          badge: counts[id],
          children: children[id]?.map((child) => ({ ...child })),
        })),
    }))
    .filter((group) => group.items.length);
}
export interface CustomerTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (tier: { name: string; color: string }) => void | Promise<void>;
}
export function CustomerTierDialog({
  open,
  onOpenChange,
  onCreate,
}: CustomerTierDialogProps) {
  const [name, setName] = useState(""),
    [color, setColor] = useState("#0F6E63"),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value);
      }}
      title="Add customer tier"
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim() || !/^#[0-9a-f]{6}$/i.test(color) || pending) return;
          setPending(true);
          setError("");
          try {
            await onCreate({ name: name.trim(), color });
            setName("");
            onOpenChange(false);
          } catch {
            setError("The tier could not be saved. Try again.");
          } finally {
            setPending(false);
          }
        }}
        className="pt-tier-form"
      >
        <TextField
          label="Tier name"
          value={name}
          onValueChange={setName}
          required
          disabled={pending}
        />
        <label>
          Choose colour
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#0F6E63"}
            onChange={(event) => setColor(event.target.value)}
            disabled={pending}
          />
        </label>
        <TextField
          label="Hex colour"
          value={color}
          onValueChange={setColor}
          pattern="#[0-9a-fA-F]{6}"
          required
          hint="Use the full six-digit hex value, for example #0F6E63."
          disabled={pending}
        />
        <TierBadge label={name || "Tier preview"} color={color} />
        {error ? (
          <p role="alert" className="pt-field-error">
            {error}
          </p>
        ) : null}
        <div className="pt-section-actions">
          <Button disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={pending}
            disabled={!name.trim() || !/^#[0-9a-f]{6}$/i.test(color)}
          >
            Add tier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
