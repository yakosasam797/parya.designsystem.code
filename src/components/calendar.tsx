import { useEffect, useId, useRef, useState } from "react";
import { Avatar, Button, IconButton, Skeleton, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";
import { EmptyState, Money } from "./content";
import { StatusBadge, type StatusDomain } from "./domain";
import { Menu, type MenuItem } from "./overlays";
export const EVENT_KINDS = {
  departure: {
    label: "Departures",
    icon: "plane-takeoff",
    tone: "work",
    time: "Departs",
  },
  return: { label: "Returns", icon: "plane", tone: "work", time: "Returns" },
  payment: {
    label: "Payments due",
    icon: "hand-coins",
    tone: "warm",
    time: "Due",
  },
  task: {
    label: "Tasks",
    icon: "check-circle",
    tone: "neutral",
    time: "Any time",
  },
  meeting: {
    label: "Meetings",
    icon: "users",
    tone: "channel",
    time: "Any time",
  },
  "follow-up": {
    label: "Follow-ups",
    icon: "phone",
    tone: "person",
    time: "Any time",
  },
} as const;
export type EventKind = keyof typeof EVENT_KINDS;
export const EVENT_KIND_IDS = Object.keys(EVENT_KINDS) as EventKind[];
export function civilDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
}
export function todayCivil(timeZone = "Asia/Kolkata") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join("-");
}
export function addCivilDays(value: string, count: number) {
  const date = civilDate(value);
  if (!date) return value;
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
export function formatCivil(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  const date = civilDate(value);
  return date
    ? new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "UTC" }).format(
        date,
      )
    : "Date not recorded";
}
export interface CalendarEvent {
  id: string;
  kind: EventKind;
  date: string;
  title: string;
  time?: string;
  endTime?: string;
  description?: string;
  reference?: string;
  status?: string;
  statusDomain?: StatusDomain;
  amount?: number;
  currency?: string;
  owner?: { name: string; avatarSrc?: string };
  href?: string;
  onOpen?: () => void;
  menuItems?: MenuItem[];
}
export function eventState(event: CalendarEvent, today = todayCivil()) {
  const status = event.status?.toLowerCase().replace(/[\s_]+/g, "-") ?? "";
  const cancelled = status === "cancelled";
  const settled = [
    "paid",
    "done",
    "completed",
    "settled",
    "cancelled",
  ].includes(status);
  const pending = ["pending", "on-hold", "tentative"].includes(status);
  const overdue =
    !!civilDate(event.date) &&
    !!civilDate(today) &&
    ["payment", "task", "follow-up"].includes(event.kind) &&
    event.date < today &&
    !settled;
  return {
    cancelled,
    settled,
    pending,
    overdue,
    daysLate: overdue
      ? Math.floor(
          (civilDate(today)!.getTime() - civilDate(event.date)!.getTime()) /
            86400000,
        )
      : 0,
  };
}
export function groupAgenda(
  events: CalendarEvent[],
  {
    today = todayCivil(),
    from,
    to,
  }: { today?: string; from?: string; to?: string } = {},
) {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of [...events].sort((a, b) =>
    `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`),
  )) {
    if (!civilDate(event.date)) continue;
    const overdue = eventState(event, today).overdue;
    if (!overdue && ((from && event.date < from) || (to && event.date > to)))
      continue;
    const key = overdue ? "overdue" : event.date;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups]
    .sort(([a], [b]) =>
      a === "overdue" ? -1 : b === "overdue" ? 1 : a.localeCompare(b),
    )
    .map(([date, items]) => ({ date, items }));
}
export interface MiniCalendarProps {
  value: string;
  onValueChange: (date: string) => void;
  today?: string;
  events?: CalendarEvent[];
  min?: string;
  max?: string;
  range?: { from: string; to: string };
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  label?: string;
}
export function MiniCalendar({
  value,
  onValueChange,
  today = todayCivil(),
  events = [],
  min,
  max,
  range,
  collapsed = false,
  onCollapsedChange,
  label = "Schedule calendar",
}: MiniCalendarProps) {
  const validValue = civilDate(value) ? value : today;
  const [month, setMonth] = useState(validValue.slice(0, 7)),
    [focus, setFocus] = useState(validValue);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (civilDate(value)) {
      setMonth(value.slice(0, 7));
      setFocus(value);
    }
  }, [value]);
  const first = civilDate(`${month}-01`)!;
  const gridStart = collapsed
    ? addCivilDays(focus, -civilDate(focus)!.getUTCDay())
    : addCivilDays(`${month}-01`, -first.getUTCDay());
  const days = Array.from({ length: collapsed ? 7 : 42 }, (_, i) =>
    addCivilDays(gridStart, i),
  );
  const disabled = (date: string) =>
    !!((min && date < min) || (max && date > max));
  const navigate = (date: string, focusButton = true) => {
    const next = min && date < min ? min : max && date > max ? max : date;
    setFocus(next);
    setMonth(next.slice(0, 7));
    if (focusButton)
      requestAnimationFrame(() =>
        root.current
          ?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)
          ?.focus(),
      );
  };
  const shiftMonth = (months: number, start = focus) => {
    const d = civilDate(start)!;
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + months);
    const last = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
    d.setUTCDate(Math.min(day, last));
    return d.toISOString().slice(0, 10);
  };
  return (
    <div className="pt-mini-calendar" ref={root}>
      <header>
        <IconButton
          icon="chevron-left"
          aria-label="Previous month"
          variant="ghost"
          size="xs"
          onClick={() => navigate(shiftMonth(-1), false)}
        />
        <h3 id={id}>
          {formatCivil(`${month}-01`, { month: "long", year: "numeric" })}
        </h3>
        <IconButton
          icon="chevron-right"
          aria-label="Next month"
          variant="ghost"
          size="xs"
          onClick={() => navigate(shiftMonth(1), false)}
        />
      </header>
      <table role="grid" aria-label={label} aria-labelledby={id}>
        <thead>
          <tr>
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <th scope="col" key={day} abbr={day}>
                {day.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: days.length / 7 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const count = events.filter(
                  (event) =>
                    event.date === day && !eventState(event, today).cancelled,
                ).length;
                return (
                  <td key={day} aria-selected={day === value}>
                    <button
                      type="button"
                      data-date={day}
                      data-outside={!day.startsWith(month)}
                      data-in-range={
                        !!range && day >= range.from && day <= range.to
                      }
                      aria-current={day === today ? "date" : undefined}
                      aria-label={`${formatCivil(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${count ? `, ${count} events` : ""}`}
                      aria-disabled={disabled(day) || undefined}
                      tabIndex={focus === day ? 0 : -1}
                      onFocus={() => setFocus(day)}
                      onClick={() => {
                        if (!disabled(day)) {
                          navigate(day, false);
                          onValueChange(day);
                        }
                      }}
                      onKeyDown={(event) => {
                        const offsets: Record<string, number> = {
                          ArrowLeft: -1,
                          ArrowRight: 1,
                          ArrowUp: -7,
                          ArrowDown: 7,
                        };
                        let next: string | undefined;
                        if (event.key in offsets)
                          next = addCivilDays(day, offsets[event.key]);
                        else if (event.key === "Home")
                          next = addCivilDays(
                            day,
                            -civilDate(day)!.getUTCDay(),
                          );
                        else if (event.key === "End")
                          next = addCivilDays(
                            day,
                            6 - civilDate(day)!.getUTCDay(),
                          );
                        else if (
                          event.key === "PageUp" ||
                          event.key === "PageDown"
                        )
                          next = shiftMonth(
                            (event.key === "PageUp" ? -1 : 1) *
                              (event.shiftKey ? 12 : 1),
                            day,
                          );
                        if (next) {
                          event.preventDefault();
                          navigate(next);
                        }
                      }}
                    >
                      {Number(day.slice(-2))}
                      {count ? <span aria-hidden="true" /> : null}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {onCollapsedChange ? (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? "Show month" : "Show week"}
        </Button>
      ) : null}
    </div>
  );
}
export interface EventRowProps {
  event: CalendarEvent;
  today?: string;
  onOpen?: (event: CalendarEvent) => void;
}
export function EventRow({
  event,
  today = todayCivil(),
  onOpen,
}: EventRowProps) {
  const state = eventState(event, today),
    kind = EVENT_KINDS[event.kind];
  const name = <span>{event.title}</span>;
  return (
    <article
      className={cx(
        "pt-event-row",
        state.overdue && "pt-event-row--overdue",
        state.cancelled && "pt-event-row--cancelled",
        state.settled && "pt-event-row--settled",
      )}
    >
      <div className="pt-event-time">
        {state.overdue ? (
          <>
            {formatCivil(event.date, { day: "numeric", month: "short" })}
            <small>{state.daysLate} days late</small>
          </>
        ) : event.time ? (
          `${event.time}${event.endTime ? `–${event.endTime}` : ""}`
        ) : (
          kind.time
        )}
      </div>
      <span
        className={cx(
          "pt-event-icon",
          `pt-tone--${kind.tone}`,
          state.pending && "pt-event-icon--pending",
        )}
      >
        <Icon name={kind.icon} />
      </span>
      <div className="pt-event-content">
        {event.href ? (
          <a href={event.href}>{name}</a>
        ) : onOpen || event.onOpen ? (
          <button
            type="button"
            className="pt-event-open"
            onClick={() => (onOpen ? onOpen(event) : event.onOpen?.())}
          >
            {name}
          </button>
        ) : (
          <strong>{name}</strong>
        )}
        {event.description || event.reference ? (
          <p>
            {event.description}
            {event.reference ? (
              <span className="pt-mono">
                {event.description ? " · " : ""}
                {event.reference}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="pt-event-meta">
          {event.status ? (
            <StatusBadge
              domain={
                event.statusDomain ??
                (event.kind === "payment" ? "payment" : "task")
              }
              status={event.status}
            />
          ) : null}
          {event.amount !== undefined ? (
            <Money value={event.amount} currency={event.currency} />
          ) : null}
        </div>
      </div>
      {event.owner ? (
        <Avatar name={event.owner.name} src={event.owner.avatarSrc} />
      ) : null}
      {event.menuItems?.length ? (
        <Menu
          label={`Actions for ${event.title}`}
          items={event.menuItems}
          trigger={
            <IconButton
              icon="more-vertical"
              aria-label={`Actions for ${event.title}`}
              variant="ghost"
            />
          }
        />
      ) : null}
    </article>
  );
}
export interface AgendaProps {
  events: CalendarEvent[];
  today?: string;
  from?: string;
  to?: string;
  kinds?: EventKind[];
  onKindsChange?: (kinds: EventKind[]) => void;
  onOpen?: (event: CalendarEvent) => void;
  loading?: boolean;
  showOverdue?: boolean;
  showKindFilters?: boolean;
  label?: string;
}
export function Agenda({
  events,
  today = todayCivil(),
  from,
  to,
  kinds: controlled,
  onKindsChange,
  onOpen,
  loading,
  showOverdue = true,
  showKindFilters = true,
  label = "Schedule",
}: AgendaProps) {
  const [internal, setInternal] = useState<EventKind[]>([]),
    kinds = controlled ?? internal;
  const setKinds = (next: EventKind[]) => {
    if (controlled === undefined) setInternal(next);
    onKindsChange?.(next);
  };
  const groups = groupAgenda(
    events.filter((event) => !kinds.length || kinds.includes(event.kind)),
    { today, from, to },
  ).filter((group) => showOverdue || group.date !== "overdue");
  return (
    <section className="pt-agenda" aria-label={label}>
      {showKindFilters ? (
        <div className="pt-agenda-kinds" role="group" aria-label="Event types">
          <Button
            size="xs"
            aria-pressed={!kinds.length}
            onClick={() => setKinds([])}
          >
            All {events.length}
          </Button>
          {EVENT_KIND_IDS.map((kind) => (
            <Button
              key={kind}
              size="xs"
              leadingIcon={EVENT_KINDS[kind].icon}
              aria-pressed={kinds.includes(kind)}
              onClick={() =>
                setKinds(
                  kinds.includes(kind)
                    ? kinds.filter((value) => value !== kind)
                    : [...kinds, kind],
                )
              }
            >
              {EVENT_KINDS[kind].label}{" "}
              {events.filter((event) => event.kind === kind).length}
            </Button>
          ))}
        </div>
      ) : null}
      {loading ? (
        <div
          className="pt-agenda-loading"
          role="status"
          aria-label="Loading schedule"
        >
          <Skeleton lines={6} />
        </div>
      ) : groups.length ? (
        <>
          {groups.map((group) => (
            <section
              key={group.date}
              aria-label={
                group.date === "overdue" ? "Overdue" : formatCivil(group.date)
              }
            >
              <h3>
                {group.date === "overdue"
                  ? "Overdue"
                  : `${group.date === today ? "Today · " : group.date === addCivilDays(today, 1) ? "Tomorrow · " : ""}${formatCivil(group.date, { weekday: "short", day: "numeric", month: "short" })}`}
              </h3>
              <ul>
                {group.items.map((event) => (
                  <li key={event.id}>
                    <EventRow event={event} today={today} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="pt-section-empty">End of schedule</p>
        </>
      ) : (
        <EmptyState
          icon="calendar"
          title={events.length ? "No events in this view" : "No events yet"}
          description={
            events.length
              ? "Choose another period or show all event types."
              : "Departures, payments and tasks will appear here."
          }
          action={
            kinds.length ? (
              <Button onClick={() => setKinds([])}>Show all types</Button>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
export interface AgendaSummaryProps {
  events: CalendarEvent[];
  today?: string;
  onSelect?: (kind: EventKind) => void;
}
export function AgendaSummary({
  events,
  today = todayCivil(),
  onSelect,
}: AgendaSummaryProps) {
  return (
    <ul className="pt-agenda-summary">
      {EVENT_KIND_IDS.map((kind) => {
        const rows = events
          .filter(
            (event) =>
              event.kind === kind && !eventState(event, today).cancelled,
          )
          .sort((a, b) => a.date.localeCompare(b.date));
        const content = (
          <>
            <Icon name={EVENT_KINDS[kind].icon} />
            <span>
              <strong>
                {EVENT_KINDS[kind].label}{" "}
                <span className="pt-mono">{rows.length}</span>
              </strong>
              {kind === "payment" ? (
                <span>
                  <Money
                    value={rows.reduce(
                      (total, row) => total + (row.amount ?? 0),
                      0,
                    )}
                  />
                </span>
              ) : null}
              <small>
                {rows.length
                  ? rows[0].date === today
                    ? "Today"
                    : `Next: ${formatCivil(rows[0].date, { weekday: "short", day: "numeric", month: "short" })}`
                  : "None scheduled"}
              </small>
            </span>
          </>
        );
        return (
          <li key={kind}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(kind)}>
                {content}
              </button>
            ) : (
              <div>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
