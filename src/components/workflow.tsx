import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./Icon";
import {
  Button,
  CountBadge,
  IconButton,
  Skeleton,
  cx,
  type StatusTone,
} from "./primitives";
import { SegmentedControl, TextField } from "./forms";
import { EmptyState, Money } from "./content";
import { Menu } from "./overlays";
import { Sheet } from "./advanced-overlays";
import { civilDate, formatCivil, todayCivil } from "./calendar";
export type PriorityLevel = "urgent" | "high" | "medium" | "low";
export const PRIORITY_LEVELS = {
  urgent: { label: "Urgent", icon: "alert-circle", rank: 0 },
  high: { label: "High", icon: "arrow-up", rank: 1 },
  medium: { label: "Medium", icon: "minus", rank: 2 },
  low: { label: "Low", icon: "arrow-down", rank: 3 },
} as const;
export const PRIORITY_LEVEL_IDS = Object.keys(
  PRIORITY_LEVELS,
) as PriorityLevel[];
export type SignalDescription =
  | {
      kind: "due";
      date: string;
      label?: string;
      today?: string;
      compact?: boolean;
    }
  | {
      kind: "age";
      since: string;
      today?: string;
      warnAfter?: number;
      dangerAfter?: number;
    }
  | { kind: "flag"; tone: StatusTone; label: string; description?: string };
export function describeKanbanSignal(signal: SignalDescription): {
  tone: StatusTone;
  text: string;
  full: string;
} {
  if (signal.kind === "flag")
    return {
      tone: signal.tone,
      text: signal.label,
      full: signal.description ?? signal.label,
    };
  const today = signal.today ?? todayCivil(),
    todayDate = civilDate(today);
  const value = signal.kind === "due" ? signal.date : signal.since;
  const date =
    civilDate(value) ??
    (Number.isFinite(Date.parse(value)) ? new Date(value) : null);
  if (!date || !todayDate)
    return {
      tone: "neutral",
      text: "Date not recorded",
      full: "Date not recorded",
    };
  const days = Math.floor((todayDate.getTime() - date.getTime()) / 86400000);
  if (signal.kind === "age") {
    const age = Math.max(0, days);
    return {
      tone:
        age >= (signal.dangerAfter ?? 14)
          ? "danger"
          : age >= (signal.warnAfter ?? 7)
            ? "warning"
            : "neutral",
      text: `${age}d`,
      full: `${age} days old`,
    };
  }
  const formatted = formatCivil(value);
  return {
    tone: days > 0 ? "danger" : days === 0 ? "warning" : "info",
    text:
      days > 0
        ? `${days}d overdue`
        : days === 0
          ? "Due today"
          : signal.compact
            ? `${Math.abs(days)}d`
            : `${signal.label ?? "Due"} ${formatted}`,
    full: `${signal.label ?? "Due"} ${formatted}${days > 0 ? `, ${days} days overdue` : ""}`,
  };
}
export interface BoardViewSwitchProps {
  value: "board" | "list";
  onValueChange: (value: "board" | "list") => void;
  "aria-label"?: string;
}
export function BoardViewSwitch({
  value,
  onValueChange,
  "aria-label": label = "View",
}: BoardViewSwitchProps) {
  return (
    <SegmentedControl
      aria-label={label}
      value={value}
      onValueChange={(value) => onValueChange(value as "board" | "list")}
      options={[
        { value: "board", label: "Board", icon: "board" },
        { value: "list", label: "List", icon: "list" },
      ]}
    />
  );
}
export interface KanbanColumn {
  id: string;
  label: string;
  tone?: StatusTone;
  probability?: number;
  wipLimit?: number;
  quickAdd?: boolean;
}
export interface KanbanMove {
  id: string;
  from: string;
  to: string;
  beforeId?: string;
  source: "drag" | "keyboard" | "menu";
}
export interface KanbanBoardProps<T> {
  label: string;
  columns: KanbanColumn[];
  items: T[];
  getId: (item: T) => string;
  getColumn: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderCard: (
    item: T,
    context: { selected: boolean; overlay: boolean; columnId: string },
  ) => ReactNode;
  onMove?: (move: KanbanMove) => boolean | void | Promise<boolean | void>;
  readOnly?: boolean;
  reorder?: boolean;
  selectedId?: string;
  onSelect?: (item: T) => void;
  getValue?: (item: T) => number;
  columnSummary?: "count" | "total" | "forecast";
  onQuickAdd?: (columnId: string, title: string) => void | Promise<void>;
  collapseEmpty?: boolean;
  dropZones?: {
    id: string;
    label: string;
    tone: "success" | "danger";
    icon: IconName;
    hint?: string;
  }[];
  loading?: boolean;
  empty?: ReactNode;
  mobileLayout?: "snap" | "stage";
  currency?: string;
  pinnedIds?: readonly string[];
  onPinChange?: (id: string, pinned: boolean) => void;
  pinnedLabel?: string;
}
export function KanbanBoard<T>({
  label,
  columns,
  items,
  getId,
  getColumn,
  getItemLabel,
  renderCard,
  onMove,
  readOnly = false,
  reorder = true,
  selectedId,
  onSelect,
  getValue,
  columnSummary = "count",
  onQuickAdd,
  collapseEmpty,
  dropZones,
  loading,
  empty,
  mobileLayout = "stage",
  currency = "INR",
  pinnedIds,
  onPinChange,
  pinnedLabel = "Pinned",
}: KanbanBoardProps<T>) {
  const [pending, setPending] = useState<string | null>(null),
    [message, setMessage] = useState("");
  const [picked, setPicked] = useState<{ id: string; to: string } | null>(null);
  const [stage, setStage] = useState(columns[0]?.id ?? "");
  const lanes = useRef<HTMLDivElement>(null);
  const busy = useRef(false),
    drag = useRef<string | null>(null),
    id = useId();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const move = async (
    item: T,
    to: string,
    source: KanbanMove["source"],
    beforeId?: string,
  ) => {
    if (readOnly || !onMove || busy.current) return;
    const from = getColumn(item);
    if (from === to && (!reorder || beforeId === getId(item))) return;
    busy.current = true;
    setPending(getId(item));
    setPicked(null);
    setMessage(`Moving ${getItemLabel(item)}…`);
    try {
      const result = await onMove({
        id: getId(item),
        from,
        to,
        beforeId,
        source,
      });
      setMessage(
        result === false
          ? `${getItemLabel(item)} was not moved.`
          : `${getItemLabel(item)} moved to ${columns.find((column) => column.id === to)?.label ?? dropZones?.find((zone) => zone.id === to)?.label ?? to}.`,
      );
    } catch {
      setMessage(`${getItemLabel(item)} could not be moved. Try again.`);
    } finally {
      busy.current = false;
      setPending(null);
    }
  };
  const card = (item: T, columnId: string, pinned = false) => (
    <li
      key={getId(item)}
      className="pt-board-item"
      data-pending={pending === getId(item)}
      draggable={!readOnly && !!onMove && !pending && !pinned}
      onDragStart={(event) => {
        drag.current = getId(item);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        drag.current = null;
      }}
      onDragOver={(event) => {
        if (reorder && onMove && !readOnly && !pinned) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onDrop={(event) => {
        if (!reorder || pinned) return;
        event.preventDefault();
        event.stopPropagation();
        const source = items.find((row) => getId(row) === drag.current);
        if (source) void move(source, columnId, "drag", getId(item));
        drag.current = null;
      }}
    >
      <div>
        {renderCard(item, {
          selected: getId(item) === selectedId,
          overlay: false,
          columnId,
        })}
      </div>
      <div className="pt-board-item-actions">
        {onSelect ? (
          <IconButton
            icon="external-link"
            variant="ghost"
            size="xs"
            aria-label={`Open ${getItemLabel(item)}`}
            onClick={() => onSelect(item)}
          />
        ) : null}
        {!readOnly && onMove ? (
          <>
            <IconButton
              icon="grip"
              variant="ghost"
              size="xs"
              disabled={!!pending}
              aria-label={`Move ${getItemLabel(item)}. Space to pick up, left or right to choose a stage, Enter to drop.`}
              aria-pressed={picked?.id === getId(item)}
              onClick={() =>
                setPicked(
                  picked?.id === getId(item)
                    ? null
                    : { id: getId(item), to: getColumn(item) },
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setPicked(null);
                  setMessage("Move cancelled.");
                }
                if (picked?.id !== getId(item)) return;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  const current = columns.findIndex(
                    (column) => column.id === picked.to,
                  );
                  const next =
                    columns[
                      Math.max(
                        0,
                        Math.min(
                          columns.length - 1,
                          current + (event.key === "ArrowRight" ? 1 : -1),
                        ),
                      )
                    ];
                  if (next) {
                    setPicked({ id: picked.id, to: next.id });
                    setMessage(
                      `Move to ${next.label}. Enter to confirm, Escape to cancel.`,
                    );
                  }
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  void move(item, picked.to, "keyboard");
                }
              }}
            />
            <Menu
              label={`Move ${getItemLabel(item)} to`}
              trigger={
                <IconButton
                  icon="more-horizontal"
                  variant="ghost"
                  size="xs"
                  disabled={!!pending}
                  aria-label={`More actions for ${getItemLabel(item)}`}
                />
              }
              items={[
                ...columns.map((column) => ({
                  id: column.id,
                  label: `Move to ${column.label}`,
                  disabled: column.id === getColumn(item),
                  onSelect: () => {
                    void move(item, column.id, "menu");
                  },
                })),
                ...(onPinChange
                  ? [
                      {
                        id: "pin",
                        label: pinnedIds?.includes(getId(item))
                          ? "Unpin record"
                          : "Pin record",
                        onSelect: () =>
                          onPinChange(
                            getId(item),
                            !pinnedIds?.includes(getId(item)),
                          ),
                      },
                    ]
                  : []),
              ]}
            />
          </>
        ) : null}
      </div>
    </li>
  );
  const lane = (column: KanbanColumn) => {
    const rows = items.filter((item) => getColumn(item) === column.id);
    if (collapseEmpty && !rows.length && !loading) return null;
    const total =
      rows.reduce((sum, item) => sum + (getValue?.(item) ?? 0), 0) *
      (columnSummary === "forecast" ? (column.probability ?? 100) / 100 : 1);
    return (
      <section
        key={column.id}
        className="pt-board-lane"
        data-column={column.id}
        aria-label={column.label}
        aria-busy={!!pending || undefined}
        onDragOver={(event) => {
          if (onMove && !readOnly && !pending) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const item = items.find((row) => getId(row) === drag.current);
          if (item) void move(item, column.id, "drag");
          drag.current = null;
        }}
      >
        <header>
          <h3>{column.label}</h3>
          <span className="pt-mono">{rows.length}</span>
          {column.wipLimit !== undefined ? (
            <span
              className="pt-caption"
              aria-label={`Work limit ${column.wipLimit}`}
            >
              / {column.wipLimit}
            </span>
          ) : null}
          {getValue && columnSummary !== "count" ? (
            <Money value={total} currency={currency} />
          ) : null}
        </header>
        <ul>
          {loading
            ? [0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton lines={3} />
                </li>
              ))
            : rows.map((item) => card(item, column.id))}
        </ul>
        {column.quickAdd && onQuickAdd && !readOnly ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const title = draft[column.id]?.trim();
              if (!title || busy.current) return;
              busy.current = true;
              try {
                await onQuickAdd(column.id, title);
                setDraft({ ...draft, [column.id]: "" });
              } catch {
                setMessage("The record could not be added. Try again.");
              } finally {
                busy.current = false;
              }
            }}
          >
            <TextField
              label={`New ${column.label} record`}
              value={draft[column.id] ?? ""}
              onValueChange={(value) =>
                setDraft({ ...draft, [column.id]: value })
              }
            />
            <Button
              type="submit"
              size="xs"
              disabled={!draft[column.id]?.trim()}
            >
              Add
            </Button>
          </form>
        ) : null}
      </section>
    );
  };
  if (!items.length && !loading)
    return (
      empty ?? (
        <EmptyState
          icon="board"
          title="No records in this view"
          description="New records will appear in their workflow stage."
        />
      )
    );
  return (
    <section
      className={cx("pt-board", `pt-board--${mobileLayout}`)}
      aria-label={label}
    >
      <p className="pt-sr-only" role="status" id={id}>
        {message}
      </p>
      {mobileLayout === "stage" ? (
        <div
          className="pt-board-stage-picker"
          role="group"
          aria-label="Workflow stage"
        >
          {columns.map((column) => (
            <Button
              key={column.id}
              aria-pressed={stage === column.id}
              onClick={() => {
                setStage(column.id);
                const list = lanes.current;
                const target = list?.querySelector<HTMLElement>(
                  `[data-column="${column.id}"]`,
                );
                if (list && target)
                  list.scrollTo({
                    left:
                      list.scrollLeft +
                      target.getBoundingClientRect().left -
                      list.getBoundingClientRect().left,
                    behavior: "auto",
                  });
              }}
            >
              {column.label}
            </Button>
          ))}
        </div>
      ) : null}
      <div
        className="pt-board-lanes"
        ref={lanes}
        onScroll={(event) => {
          if (mobileLayout !== "stage") return;
          const list = event.currentTarget;
          const left = list.getBoundingClientRect().left;
          const nearest = [
            ...list.querySelectorAll<HTMLElement>("[data-column]"),
          ].sort(
            (a, b) =>
              Math.abs(a.getBoundingClientRect().left - left) -
              Math.abs(b.getBoundingClientRect().left - left),
          )[0];
          if (nearest?.dataset.column) setStage(nearest.dataset.column);
        }}
        style={
          {
            "--pt-board-stage": columns.findIndex(
              (column) => column.id === stage,
            ),
          } as CSSProperties
        }
      >
        {pinnedIds ? (
          <section
            className="pt-board-lane pt-board-lane--pinned"
            aria-label={pinnedLabel}
          >
            <header>
              <h3>{pinnedLabel}</h3>
              <CountBadge>
                {items.filter((item) => pinnedIds.includes(getId(item))).length}
              </CountBadge>
            </header>
            <ul>
              {items
                .filter((item) => pinnedIds.includes(getId(item)))
                .map((item) => card(item, getColumn(item), true))}
            </ul>
          </section>
        ) : null}
        {columns.map(lane)}
      </div>
      {dropZones?.length && !readOnly && onMove ? (
        <div className="pt-board-dropzones">
          {dropZones.map((zone) => (
            <div
              key={zone.id}
              className={`pt-status--${zone.tone}`}
              onDragOver={(event) => {
                if (!pending) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                const item = items.find((row) => getId(row) === drag.current);
                if (item) void move(item, zone.id, "drag");
                drag.current = null;
              }}
            >
              <Icon name={zone.icon} />
              <strong>{zone.label}</strong>
              {zone.hint ? <small>{zone.hint}</small> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
export interface RecordPreviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reference?: string;
  referenceLabel?: string;
  status?: ReactNode;
  meta?: ReactNode;
  onOpenRecord?: () => void;
  openRecordLabel?: string;
  actions?: ReactNode;
  size?: "sm" | "md";
  children: ReactNode;
}
export function RecordPreviewPanel({
  open,
  onOpenChange,
  title,
  reference,
  referenceLabel = "Reference",
  status,
  meta,
  onOpenRecord,
  openRecordLabel = "Open full record",
  actions,
  size = "md",
  children,
}: RecordPreviewPanelProps) {
  return (
    <Sheet {...{ open, onOpenChange, title, size }} footer={actions}>
      <div className="pt-record-preview-identity">
        {reference ? (
          <span
            className="pt-mono"
            aria-label={`${referenceLabel}: ${reference}`}
          >
            {reference}
          </span>
        ) : null}
        {status}
        {meta}
        {onOpenRecord ? (
          <Button variant="link" onClick={onOpenRecord}>
            {openRecordLabel}
          </Button>
        ) : null}
      </div>
      {children}
    </Sheet>
  );
}
export interface RecordPreviewSectionProps {
  title: string;
  actions?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}
export function RecordPreviewSection({
  title,
  actions,
  flush,
  children,
}: RecordPreviewSectionProps) {
  return (
    <section
      className={cx(
        "pt-record-preview-section",
        flush && "pt-record-preview-section--flush",
      )}
    >
      <header className="pt-section-heading">
        <h3>{title}</h3>
        {actions}
      </header>
      <div>{children}</div>
    </section>
  );
}
