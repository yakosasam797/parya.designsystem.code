import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Drop from "@radix-ui/react-dropdown-menu";
import { useTheme } from "../theme";
import { useControllableState } from "../hooks";
import {
  Avatar,
  Button,
  Checkbox,
  CountBadge,
  IconButton,
  Skeleton,
  Tooltip,
  cx,
} from "./primitives";
import { Icon, type IconName } from "./Icon";
import { Menu, Modal, Popover, type MenuItem } from "./overlays";
import { Drawer } from "./advanced-overlays";
import { EmptyState } from "./content";
import { activityDate } from "./sections";
import { FilterChips, FilterMenu, type FilterGroup } from "./collections";
import type { FilterValue } from "./data";

export const ShellSidebarContext = createContext(false);
export interface NotesStripProps {
  label: string;
  count?: number;
  onOpen: () => void;
  onAdd?: () => void;
  collapsed?: boolean;
}
export function NotesStrip({
  label,
  count,
  onOpen,
  onAdd,
  collapsed,
}: NotesStripProps) {
  const rail = useContext(ShellSidebarContext);
  return (
    <div className="pt-notes-strip" data-collapsed={collapsed ?? rail}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${label}${count !== undefined ? `, ${count} notes` : ""}`}
        title={label}
      >
        <Icon name="notes" />
        <span>{label}</span>
        {count !== undefined && !(collapsed ?? rail) ? (
          <CountBadge>{count}</CountBadge>
        ) : null}
      </button>
      {onAdd && !(collapsed ?? rail) ? (
        <button type="button" aria-label={`Add to ${label}`} onClick={onAdd}>
          <Icon name="plus" />
        </button>
      ) : null}
    </div>
  );
}
export interface CreditsMeterProps {
  used: number;
  total: number;
  onUpgrade?: () => void;
  collapsed?: boolean;
}
export function CreditsMeter({
  used,
  total,
  onUpgrade,
  collapsed,
}: CreditsMeterProps) {
  const rail = useContext(ShellSidebarContext);
  const percent =
    Number.isFinite(used) && Number.isFinite(total) && total > 0
      ? Math.min(100, Math.max(0, Math.round((used / total) * 100)))
      : 0;
  const label = `Credits ${percent}% used`;
  return (
    <div className="pt-credits" data-collapsed={collapsed ?? rail}>
      <span
        className="pt-credits-icon"
        title={label}
        role="img"
        aria-label={(collapsed ?? rail) ? label : undefined}
      >
        <Icon name="credits" size="sm" />
      </span>
      {!(collapsed ?? rail) ? (
        <>
          <div className="pt-credits-copy">
            <span>Credits {percent}%</span>
            <span
              role="meter"
              aria-label="Credits used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${used.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")} credits`}
              className="pt-credits-track"
            >
              <span style={{ width: `${percent}%` }} />
            </span>
          </div>
          {onUpgrade ? (
            <IconButton
              icon="plus"
              variant="primary"
              size="sm"
              aria-label="Upgrade credits"
              onClick={onUpgrade}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
export interface AccountMenuProps {
  name: string;
  email?: string;
  avatarSrc?: string;
  subtitle?: string;
  meta?: string;
  items?: (MenuItem & { description?: string; navigates?: boolean })[];
  theme?: {
    value: "light" | "dark" | "system";
    onValueChange: (value: "light" | "dark" | "system") => void;
  };
  onShortcuts?: () => void;
  trigger?: ReactNode;
}
export function AccountMenu({
  name,
  email,
  avatarSrc,
  subtitle,
  meta,
  items = [],
  theme: selection,
  onShortcuts,
  trigger,
}: AccountMenuProps) {
  const { theme } = useTheme();
  const normal = items.filter((item) => !item.danger),
    destructive = items.filter((item) => item.danger);
  return (
    <Drop.Root>
      <Drop.Trigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="pt-shell-account"
            aria-label={`Open account menu for ${name}`}
          >
            <Avatar name={name} src={avatarSrc} size="sm" />
            <Icon name="chevron-down" size="xs" />
          </button>
        )}
      </Drop.Trigger>
      <Drop.Portal>
        <Drop.Content
          className="pt-account-menu pt-menu"
          data-theme={theme}
          align="end"
          sideOffset={6}
          aria-label="Account menu"
        >
          <div className="pt-account-identity">
            <Avatar name={name} src={avatarSrc} size="md" />
            <div>
              <strong>{name}</strong>
              {subtitle ? <small>{subtitle}</small> : null}
              {meta || email ? <small>{meta ?? email}</small> : null}
            </div>
          </div>
          {[...normal, ...destructive].map((item, i) => (
            <div key={item.id}>
              {item.danger && i === normal.length ? (
                <Drop.Separator className="pt-menu-separator" />
              ) : null}
              <Drop.Item
                className={cx("pt-menu-item", item.danger && "pt-text--danger")}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.icon ? <Icon name={item.icon} /> : null}
                <span>
                  <strong>{item.label}</strong>
                  {item.description ? <small>{item.description}</small> : null}
                </span>
                {item.navigates ? (
                  <Icon name="chevron-right" size="sm" />
                ) : null}
              </Drop.Item>
            </div>
          ))}
          {selection || onShortcuts ? (
            <>
              <Drop.Separator className="pt-menu-separator" />
              {selection ? (
                <Drop.RadioGroup
                  value={selection.value}
                  onValueChange={(value) =>
                    selection.onValueChange(
                      value as "light" | "dark" | "system",
                    )
                  }
                  aria-label="Appearance"
                >
                  <Drop.Label className="pt-account-theme-label">
                    Theme
                  </Drop.Label>
                  {(["light", "dark", "system"] as const).map((value) => (
                    <Drop.RadioItem
                      key={value}
                      value={value}
                      className="pt-menu-item"
                      onSelect={(event) => event.preventDefault()}
                    >
                      <span>{value[0].toUpperCase() + value.slice(1)}</span>
                      <Drop.ItemIndicator>
                        <Icon name="check" size="sm" />
                      </Drop.ItemIndicator>
                    </Drop.RadioItem>
                  ))}
                </Drop.RadioGroup>
              ) : null}
              {onShortcuts ? (
                <Drop.Item className="pt-menu-item" onSelect={onShortcuts}>
                  <Icon name="sliders" size="sm" />
                  Keyboard shortcuts
                </Drop.Item>
              ) : null}
            </>
          ) : null}
        </Drop.Content>
      </Drop.Portal>
    </Drop.Root>
  );
}
export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  meta?: string;
  unread?: boolean;
  onSelect?: () => void;
}
export interface NotificationsPanelProps {
  items: NotificationItem[];
  filter?: "unread" | "all";
  onFilterChange?: (value: "unread" | "all") => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  onOpenPreferences?: () => void;
}
export function NotificationsPanel({
  items,
  filter: controlled,
  onFilterChange,
  onMarkAllRead,
  onViewAll,
  onOpenPreferences,
}: NotificationsPanelProps) {
  const [filter, setFilter] = useControllableState(
    controlled,
    "unread",
    onFilterChange,
  );
  const unread = items.filter((item) => item.unread).length;
  const visible =
    filter === "all" ? items : items.filter((item) => item.unread);
  return (
    <section className="pt-notifications-panel" aria-label="Notifications">
      <header className="pt-section-heading">
        <h2>Notifications</h2>
        <span className="pt-mono pt-caption">{unread} unread</span>
      </header>
      <div className="pt-notification-controls">
        <div role="group" aria-label="Notification filter">
          {(["unread", "all"] as const).map((value) => (
            <Button
              key={value}
              size="xs"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All" : "Unread"}
            </Button>
          ))}
        </div>
        {onMarkAllRead ? (
          <Button variant="brand" disabled={!unread} onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        ) : null}
      </div>
      <ul>
        {visible.map((item) => (
          <li key={item.id} data-unread={item.unread}>
            <button
              type="button"
              disabled={!item.onSelect}
              onClick={item.onSelect}
            >
              <strong>{item.title}</strong>
              {item.body ? <span>{item.body}</span> : null}
              {item.meta ? <small>{item.meta}</small> : null}
              {item.unread ? <span className="pt-sr-only">Unread</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {!visible.length ? (
        <EmptyState
          icon="bell"
          title={filter === "unread" ? "All caught up" : "No notifications yet"}
          description={
            filter === "unread"
              ? "There are no unread notifications."
              : "Updates will appear here."
          }
        />
      ) : null}
      {onViewAll || onOpenPreferences ? (
        <footer>
          {onViewAll ? (
            <Button variant="link" onClick={onViewAll}>
              View all notifications
            </Button>
          ) : null}
          {onOpenPreferences ? (
            <Button variant="link" onClick={onOpenPreferences}>
              Preferences
            </Button>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
export interface OpenRecord {
  id: string;
  title: string;
  code?: string;
  icon?: IconName;
  unsaved?: boolean;
}
export interface OpenRecordsListProps {
  records: OpenRecord[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  onCloseAll?: () => void;
  onCloseOthers?: () => void;
  onReopen?: () => void;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  label?: string;
  collapsed?: boolean;
}
export function OpenRecordsList({
  records,
  activeId,
  onSelect,
  onClose,
  onReorder,
  onCloseAll,
  onCloseOthers,
  onReopen,
  expanded: controlled,
  defaultExpanded = false,
  onExpandedChange,
  label = "Open records",
  collapsed,
}: OpenRecordsListProps) {
  const rail = useContext(ShellSidebarContext),
    isRail = collapsed ?? rail;
  const [expanded, setExpanded] = useControllableState(
    controlled,
    defaultExpanded,
    onExpandedChange,
  );
  const [railOpen, setRailOpen] = useState(false);
  const drag = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const move = (source: string, target: string) => {
    if (!onReorder || source === target) return;
    const next = records.map((row) => row.id).filter((row) => row !== source);
    const to = next.indexOf(target);
    if (to < 0) return;
    next.splice(to, 0, source);
    onReorder(next);
  };
  const menu: MenuItem[] = [
    {
      id: "show",
      label: expanded ? "Hide records" : "Show all records",
      onSelect: () => setExpanded(!expanded),
    },
    ...(onCloseOthers
      ? [{ id: "others", label: "Close others", onSelect: onCloseOthers }]
      : []),
    ...(onReopen
      ? [{ id: "reopen", label: "Reopen last closed", onSelect: onReopen }]
      : []),
    ...(onCloseAll
      ? [{ id: "all", label: "Close all records", onSelect: onCloseAll }]
      : []),
  ];
  const list = (
    <ul
      ref={listRef}
      id={id}
      className="pt-open-records-list"
      aria-label={label}
    >
      {records.length ? (
        records.map((record, index) => (
          <li
            key={record.id}
            draggable={!!onReorder}
            onDragStart={(event) => {
              drag.current = record.id;
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              drag.current = null;
            }}
            onDragOver={(event) => {
              if (onReorder) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (drag.current) move(drag.current, record.id);
              drag.current = null;
            }}
          >
            <button
              type="button"
              data-record={record.id}
              aria-current={activeId === record.id ? "page" : undefined}
              aria-label={`${record.code ? `${record.code}, ` : ""}${record.title}${record.unsaved ? ", unsaved changes" : ""}`}
              onClick={() => {
                onSelect(record.id);
                setRailOpen(false);
              }}
              onKeyDown={(event) => {
                if (
                  event.altKey &&
                  (event.key === "ArrowUp" || event.key === "ArrowDown") &&
                  onReorder
                ) {
                  event.preventDefault();
                  const next = records.map((row) => row.id);
                  const target = index + (event.key === "ArrowUp" ? -1 : 1);
                  if (target < 0 || target >= next.length) return;
                  [next[index], next[target]] = [next[target], next[index]];
                  onReorder(next);
                }
              }}
            >
              <Icon name={record.icon ?? "file-text"} size="nav" />
              <span>{record.title}</span>
              {record.unsaved ? (
                <span className="pt-open-unsaved" aria-hidden="true" />
              ) : null}
            </button>
            <IconButton
              icon="x"
              size="xs"
              variant="ghost"
              aria-label={`Close ${record.title}`}
              onClick={() => {
                const next = records[index + 1] ?? records[index - 1];
                onClose(record.id);
                requestAnimationFrame(() => {
                  if (next)
                    Array.from(
                      listRef.current?.querySelectorAll<HTMLButtonElement>(
                        "[data-record]",
                      ) ?? [],
                    )
                      .find((button) => button.dataset.record === next.id)
                      ?.focus();
                  else
                    listRef.current
                      ?.closest(".pt-open-records")
                      ?.querySelector<HTMLButtonElement>(
                        ".pt-open-records-heading button",
                      )
                      ?.focus();
                });
              }}
            />
          </li>
        ))
      ) : (
        <li className="pt-caption pt-section-empty">Nothing open</li>
      )}
    </ul>
  );
  return isRail ? (
    <Popover
      label={label}
      open={railOpen}
      onOpenChange={setRailOpen}
      trigger={
        <button
          type="button"
          className="pt-open-records-rail"
          aria-label={`${label}, ${records.length}`}
        >
          <Icon name="file-text" />
          <CountBadge>{records.length}</CountBadge>
        </button>
      }
    >
      {list}
    </Popover>
  ) : (
    <section className="pt-open-records" aria-label={label}>
      <header className="pt-open-records-heading">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? id : undefined}
          onClick={() => setExpanded(!expanded)}
        >
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size="xs" />
          {label}
          <CountBadge>{records.length}</CountBadge>
        </button>
        <Menu
          label="Open records options"
          items={menu}
          trigger={
            <IconButton
              icon="more-horizontal"
              size="xs"
              variant="ghost"
              aria-label="Open records options"
            />
          }
        />
      </header>
      {expanded ? list : null}
    </section>
  );
}
export interface OpenRecordsSwitcherProps {
  records: OpenRecord[];
  activeId?: string | null;
  onSelect: (id: string | null) => void;
  onClose: (id: string) => void;
  onCloseAll?: () => void;
  home?: { label: string; icon?: IconName };
  onSearch?: () => void;
  label?: string;
}
export function OpenRecordsSwitcher({
  records,
  activeId,
  onSelect,
  onClose,
  onCloseAll,
  home = { label: "Module page", icon: "home" },
  onSearch,
  label = "Open records",
}: OpenRecordsSwitcherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className="pt-open-switcher"
        leadingIcon="file-text"
        aria-label={`${label}, ${records.length}`}
        onClick={() => setOpen(true)}
      >
        {records.length}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={label}
        footer={
          <>
            {onSearch ? (
              <Button
                leadingIcon="search"
                onClick={() => {
                  setOpen(false);
                  onSearch();
                }}
              >
                Find and open a record
              </Button>
            ) : null}
            {onCloseAll ? (
              <Button disabled={!records.length} onClick={onCloseAll}>
                Close all
              </Button>
            ) : null}
          </>
        }
      >
        <Button
          fullWidth
          variant="ghost"
          leadingIcon={home.icon ?? "home"}
          onClick={() => {
            onSelect(null);
            setOpen(false);
          }}
        >
          {home.label}
        </Button>
        <OpenRecordsList
          records={records}
          activeId={activeId}
          onSelect={(id) => {
            onSelect(id);
            setOpen(false);
          }}
          onClose={onClose}
          expanded
          onExpandedChange={() => {}}
        />
      </Modal>
    </>
  );
}
export interface NotificationRowData {
  id: string;
  title: string;
  body?: string;
  context?: string;
  recordTitle?: string;
  reason?: string;
  at?: string;
  dateLabel?: string;
  unread?: boolean;
  actor?: { name: string; avatarSrc?: string };
  icon?: IconName;
  assigned?: boolean;
  mentioned?: boolean;
}
export interface NotificationRowProps {
  row: NotificationRowData;
  now?: string;
  focused?: boolean;
  nested?: boolean;
  more?: number;
  onOpen: (row: NotificationRowData, options: { background: boolean }) => void;
  onSetRead: (ids: string[], read: boolean) => void;
  onCopyLink?: (row: NotificationRowData) => void;
  onMute?: (row: NotificationRowData) => void;
  onFocusRow?: (id: string) => void;
  rowActions?: "triage" | "manage";
  onDelete?: (row: NotificationRowData) => void;
  timestamp?: "relative" | "absolute" | "compact";
}
function notificationAge(at?: string, now?: string, compact = false) {
  if (!at || !/T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(at))
    return "Date not recorded";
  const elapsed = (now ? Date.parse(now) : Date.now()) - Date.parse(at);
  if (!Number.isFinite(elapsed)) return "Date not recorded";
  if (elapsed < 0) return "Scheduled";
  const minutes = Math.floor(elapsed / 60000),
    hours = Math.floor(minutes / 60),
    days = Math.floor(hours / 24);
  return compact
    ? days
      ? `${days}d`
      : hours
        ? `${hours}h`
        : `${minutes}m`
    : days
      ? `${days} ${days === 1 ? "day" : "days"} ago`
      : hours
        ? `${hours} ${hours === 1 ? "hour" : "hours"} ago`
        : minutes
          ? `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
          : "Just now";
}
export function NotificationRow({
  row,
  now,
  focused,
  nested,
  more,
  onOpen,
  onSetRead,
  onCopyLink,
  onMute,
  onFocusRow,
  rowActions = "triage",
  onDelete,
  timestamp = "relative",
}: NotificationRowProps) {
  const date = activityDate(row.at, row.dateLabel);
  const exact = `${date.day} · ${date.time} IST`;
  return (
    <article
      className={cx(
        "pt-notification-row",
        nested && "pt-notification-row--nested",
      )}
      data-unread={row.unread}
      data-focused={focused}
      onFocus={() => onFocusRow?.(row.id)}
    >
      <span className="pt-notification-dot" aria-hidden="true" />
      {row.actor ? (
        <Avatar name={row.actor.name} src={row.actor.avatarSrc} />
      ) : (
        <span className="pt-notification-kind">
          <Icon name={row.icon ?? "bell"} />
        </span>
      )}
      <div className="pt-notification-copy">
        <button
          type="button"
          className="pt-notification-open"
          onClick={(event) =>
            onOpen(row, { background: event.ctrlKey || event.metaKey })
          }
          aria-label={`${row.unread ? "Unread. " : ""}${row.title}. ${[row.context, row.body, row.recordTitle, row.reason, exact].filter(Boolean).join(". ")}`}
        >
          <strong>{row.title}</strong>
          <time dateTime={date.instant} title={exact}>
            {timestamp === "absolute" ? (
              exact
            ) : (
              <>
                <span
                  className={
                    rowActions === "manage" && timestamp === "compact"
                      ? "pt-notification-age"
                      : undefined
                  }
                >
                  {notificationAge(row.at, now, timestamp === "compact")}
                </span>
                {rowActions === "manage" && timestamp === "compact" ? (
                  <span className="pt-notification-exact">{exact}</span>
                ) : null}
              </>
            )}
          </time>
        </button>
        {row.context || row.body ? <p>{row.context ?? row.body}</p> : null}
        {row.recordTitle || row.reason ? (
          <p className="pt-notification-record">
            {row.recordTitle}
            {row.reason ? ` · ${row.reason}` : ""}
          </p>
        ) : null}
        {row.assigned || row.mentioned ? (
          <span
            className={cx(
              "pt-notification-reason",
              row.mentioned && "pt-notification-reason--person",
            )}
          >
            {row.mentioned ? "Mentioned you" : "Assigned to you"}
          </span>
        ) : null}
        {more ? (
          <span className="pt-caption"> +{more} related updates</span>
        ) : null}
        <div className="pt-notification-actions">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onSetRead([row.id], !!row.unread)}
          >
            {row.unread ? "Mark read" : "Mark unread"}
          </Button>
          {rowActions === "manage" ? (
            onDelete ? (
              <IconButton
                icon="trash"
                variant="ghost"
                size="xs"
                aria-label={`Delete ${row.title}`}
                onClick={() => onDelete(row)}
              />
            ) : null
          ) : (
            <>
              {onCopyLink ? (
                <IconButton
                  icon="link"
                  variant="ghost"
                  size="xs"
                  aria-label={`Copy link to ${row.title}`}
                  onClick={() => onCopyLink(row)}
                />
              ) : null}
              {onMute ? (
                <Button variant="ghost" size="xs" onClick={() => onMute(row)}>
                  Mute
                </Button>
              ) : null}
              <IconButton
                icon="external-link"
                variant="ghost"
                size="xs"
                aria-label={`Open ${row.title} in background`}
                onClick={() => onOpen(row, { background: true })}
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
export interface NotificationGroup {
  id: string;
  label: string;
  rows: NotificationRowData[];
}
function AppliedNotificationFilters({
  groups,
  value,
  onValueChange,
}: {
  groups: FilterGroup[];
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState<FilterValue>({});
  return (
    <Popover
      label="Notification filters"
      open={open}
      onOpenChange={(next) => {
        if (next)
          setDraft(
            Object.fromEntries(
              Object.entries(value).map(([id, values]) => [id, [...values]]),
            ),
          );
        setOpen(next);
      }}
      trigger={<Button leadingIcon="filter">Filters</Button>}
    >
      <div className="pt-notification-filter-draft">
        {groups.map((group) => (
          <fieldset key={group.id}>
            <legend>{group.label}</legend>
            {group.options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                disabled={option.disabled}
                checked={draft[group.id]?.includes(option.value) ?? false}
                onCheckedChange={(checked) =>
                  setDraft({
                    ...draft,
                    [group.id]: checked
                      ? group.mode === "single"
                        ? [option.value]
                        : [...(draft[group.id] ?? []), option.value]
                      : (draft[group.id] ?? []).filter(
                          (value) => value !== option.value,
                        ),
                  })
                }
              />
            ))}
          </fieldset>
        ))}
        <div className="pt-section-actions">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              onValueChange(draft);
              setOpen(false);
            }}
          >
            Apply filters
          </Button>
        </div>
      </div>
    </Popover>
  );
}
export interface NotificationsDrawerProps extends Omit<
  NotificationRowProps,
  "row" | "focused" | "nested" | "more" | "onFocusRow"
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: NotificationGroup[];
  unreadCount: number;
  tab: "all" | "unread";
  onTabChange: (tab: "all" | "unread") => void;
  onMarkAllRead?: () => void;
  moduleTabs?: {
    items: { value: string; label: string; count?: number }[];
    value: string;
    onValueChange: (value: string) => void;
  };
  collectionTabs?: {
    value: "all" | "mine";
    onValueChange: (value: "all" | "mine") => void;
  };
  filters?: {
    groups: FilterGroup[];
    value: FilterValue;
    onValueChange: (value: FilterValue) => void;
    mode?: "instant" | "apply";
  };
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  onLoadMore?: () => void;
}
export function NotificationsDrawer({
  open,
  onOpenChange,
  groups,
  unreadCount,
  tab,
  onTabChange,
  onMarkAllRead,
  moduleTabs,
  collectionTabs,
  filters,
  loading,
  error,
  onRetry,
  onOpenSettings,
  onLoadMore,
  ...rowProps
}: NotificationsDrawerProps) {
  const root = useRef<HTMLDivElement>(null);
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => tab === "all" || row.unread),
    }))
    .filter((group) => group.rows.length);
  const rows = visibleGroups.flatMap((group) => group.rows);
  const [focusId, setFocusId] = useState<string | null>(null);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} label="Notifications">
      <div
        ref={root}
        className="pt-notifications-drawer"
        onKeyDown={(event) => {
          const target = event.target as HTMLElement;
          if (
            target.closest(
              "input, textarea, select, [role=combobox], [role=menu]",
            )
          )
            return;
          const index = rows.findIndex((row) => row.id === focusId);
          if (event.key === "j" || event.key === "k") {
            event.preventDefault();
            const next =
              rows[
                Math.max(
                  0,
                  Math.min(
                    rows.length - 1,
                    index + (event.key === "j" ? 1 : -1),
                  ),
                )
              ];
            if (next) {
              setFocusId(next.id);
              root.current
                ?.querySelectorAll<HTMLButtonElement>(".pt-notification-open")
                [rows.indexOf(next)]?.focus();
            }
          }
          if (
            target.closest(".pt-notification-open") &&
            index >= 0 &&
            (event.key === "e" || event.key === "m")
          ) {
            event.preventDefault();
            if (event.key === "e") rowProps.onSetRead([rows[index].id], true);
            else rowProps.onMute?.(rows[index]);
          }
        }}
      >
        <header className="pt-section-heading">
          <h2>
            Notifications <CountBadge>{unreadCount}</CountBadge>
          </h2>
          <div className="pt-inline">
            {onOpenSettings ? (
              <IconButton
                icon="settings"
                variant="ghost"
                aria-label="Notification settings"
                onClick={onOpenSettings}
              />
            ) : null}
            <IconButton
              icon="x"
              variant="ghost"
              aria-label="Close notifications"
              onClick={() => onOpenChange(false)}
            />
          </div>
        </header>
        {moduleTabs ? (
          <div
            className="pt-notification-modules"
            role="group"
            aria-label="Notification module"
          >
            {moduleTabs.items.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                aria-pressed={moduleTabs.value === item.value}
                onClick={() => moduleTabs.onValueChange(item.value)}
              >
                {item.label}
                {item.count !== undefined ? ` ${item.count}` : ""}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="pt-notification-controls">
          <div
            role="group"
            aria-label={
              collectionTabs ? "Notification collection" : "Read status"
            }
          >
            {collectionTabs
              ? (["all", "mine"] as const).map((value) => (
                  <Button
                    key={value}
                    size="xs"
                    aria-pressed={collectionTabs.value === value}
                    onClick={() => collectionTabs.onValueChange(value)}
                  >
                    {value === "all" ? "All" : "Mine"}
                  </Button>
                ))
              : (["all", "unread"] as const).map((value) => (
                  <Button
                    key={value}
                    size="xs"
                    aria-pressed={tab === value}
                    onClick={() => onTabChange(value)}
                  >
                    {value === "all" ? "All" : "Unread"}
                  </Button>
                ))}
          </div>
          {onMarkAllRead ? (
            <Button
              variant="link"
              disabled={!unreadCount || loading}
              onClick={onMarkAllRead}
            >
              Mark all as read
            </Button>
          ) : null}
          {filters ? (
            filters.mode === "apply" ? (
              <AppliedNotificationFilters
                groups={filters.groups}
                value={filters.value}
                onValueChange={filters.onValueChange}
              />
            ) : (
              <FilterMenu
                groups={filters.groups}
                value={filters.value}
                onValueChange={filters.onValueChange}
              />
            )
          ) : null}
        </div>
        {filters ? (
          <FilterChips
            groups={filters.groups}
            value={filters.value}
            onValueChange={filters.onValueChange}
          />
        ) : null}
        <div className="pt-notification-scroll">
          {loading ? (
            <div role="status" aria-label="Loading notifications">
              <Skeleton lines={8} />
            </div>
          ) : error ? (
            <EmptyState
              icon="alert-circle"
              title="Notifications could not be loaded"
              description={error}
              action={
                onRetry ? (
                  <Button onClick={onRetry}>Try again</Button>
                ) : undefined
              }
            />
          ) : !rows.length ? (
            <EmptyState
              icon="bell"
              title="All caught up"
              description="There are no notifications in this view."
            />
          ) : (
            visibleGroups.map((group) => (
              <section key={group.id} aria-label={group.label}>
                <h3 className="pt-notification-group">{group.label}</h3>
                {group.rows.map((row) => (
                  <NotificationRow
                    key={row.id}
                    row={row}
                    {...rowProps}
                    focused={focusId === row.id}
                    onFocusRow={setFocusId}
                  />
                ))}
              </section>
            ))
          )}
          {onLoadMore && !loading && !error ? (
            <Button fullWidth variant="ghost" onClick={onLoadMore}>
              Load more notifications
            </Button>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
}
