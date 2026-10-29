import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Avatar,
  Button,
  IconButton,
  Skeleton,
  Tooltip,
  cx,
  type StatusTone,
} from "./primitives";
import { Icon, type IconName } from "./Icon";
import { Banner, EmptyState } from "./content";
import { SearchField, SelectField, TextArea, TextField } from "./forms";
import { ConfirmDialog, Menu, type MenuItem } from "./overlays";
import { TableFooter } from "./data";

/** Preserve unknown captured dates instead of inventing an instant. */
export function activityDate(
  at?: string,
  dateLabel?: string,
  timeLabel?: string,
) {
  const date =
    at && /T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(at) ? new Date(at) : null;
  if (!date || !Number.isFinite(date.getTime()))
    return {
      day: dateLabel || "Date not recorded",
      time: timeLabel || "Time not recorded",
      instant: undefined,
    };
  return {
    day: new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(date),
    instant: date.toISOString(),
  };
}
export interface ActivityItem {
  id: string;
  at?: string;
  dateLabel?: string;
  timeLabel?: string;
  title: string;
  description?: string;
  icon?: IconName;
  markerTone?: "default" | "success";
  actor?: { name: string; subtitle?: string; avatarSrc?: string };
  section?: string;
}
export interface ActivityTimelineProps {
  items: ActivityItem[];
  groupByDay?: boolean;
  emptyText?: string;
  presentation?: "timeline" | "table";
  marker?: "dot" | "icon";
  loading?: boolean;
  label?: string;
  rowActions?: (item: ActivityItem) => MenuItem[];
}
function ActivityActor({ item }: { item: ActivityItem }) {
  return item.actor ? (
    <span className="pt-section-person">
      <Avatar name={item.actor.name} src={item.actor.avatarSrc} size="chip" />
      <span>
        {item.actor.name}
        {item.actor.subtitle ? <small>{item.actor.subtitle}</small> : null}
      </span>
    </span>
  ) : (
    <span className="pt-caption">Actor not recorded</span>
  );
}
export function ActivityTimeline({
  items,
  groupByDay = true,
  emptyText = "No activity yet.",
  presentation = "timeline",
  marker = "dot",
  loading,
  label = "Activity",
  rowActions,
}: ActivityTimelineProps) {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const key = groupByDay ? activityDate(item.at, item.dateLabel).day : label;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const action = (item: ActivityItem) => {
    const actions = rowActions?.(item);
    return actions?.length ? (
      <Menu
        label={`Actions for ${item.title}`}
        items={actions}
        trigger={
          <IconButton
            icon="more-vertical"
            variant="ghost"
            aria-label={`Actions for ${item.title}`}
          />
        }
      />
    ) : null;
  };
  if (loading)
    return (
      <div
        className="pt-activity-loading"
        role="status"
        aria-label="Loading activity"
      >
        <span className="pt-sr-only">Loading activity</span>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} lines={2} />
        ))}
      </div>
    );
  if (!items.length) return <p className="pt-section-empty">{emptyText}</p>;
  if (presentation === "table")
    return (
      <div
        className="pt-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <table className="pt-activity-table">
          <caption className="pt-sr-only">{label}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Activity</th>
              <th scope="col">By</th>
              {rowActions ? <th scope="col">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const date = activityDate(
                item.at,
                item.dateLabel,
                item.timeLabel,
              );
              return (
                <tr key={item.id}>
                  <td>
                    <time dateTime={date.instant} className="pt-mono">
                      {date.day}
                      <small>{date.time}</small>
                    </time>
                  </td>
                  <td>
                    <span className="pt-activity-detail">
                      <Icon name={item.icon ?? "history"} />
                      <span>
                        <strong>{item.title}</strong>
                        {item.description ? <p>{item.description}</p> : null}
                      </span>
                    </span>
                  </td>
                  <td>
                    <ActivityActor item={item} />
                  </td>
                  {rowActions ? <td>{action(item)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  return (
    <section className="pt-activity-timeline" aria-label={label}>
      {[...groups].map(([day, rows]) => (
        <div key={day}>
          {groupByDay ? <h3 className="pt-activity-day">{day}</h3> : null}
          <ol>
            {rows.map((item) => {
              const date = activityDate(
                item.at,
                item.dateLabel,
                item.timeLabel,
              );
              return (
                <li
                  key={item.id}
                  className={cx(
                    "pt-activity-row",
                    marker === "icon" && "pt-activity-row--icon",
                  )}
                >
                  <time dateTime={date.instant} className="pt-mono">
                    {!groupByDay ? <span>{date.day}</span> : null}
                    {date.time}
                  </time>
                  <span className="pt-activity-marker" aria-hidden="true">
                    {marker === "icon" ? (
                      <Icon name={item.icon ?? "history"} size="sm" />
                    ) : null}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    {item.description ? (
                      <p className="pt-activity-description">
                        {item.icon && marker !== "icon" ? (
                          <Icon name={item.icon} size="sm" />
                        ) : null}
                        {item.description}
                      </p>
                    ) : null}
                    <ActivityActor item={item} />
                  </div>
                  {action(item)}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
export interface ActivityTableProps extends Omit<
  ActivityTimelineProps,
  "groupByDay" | "presentation" | "marker"
> {
  title?: string;
  mode?: "recent" | "history";
  pageSize?: number;
  sectionOptions?: { value: string; label: string }[];
}
export function ActivityTable({
  items,
  title = "Activity",
  mode = "history",
  pageSize = 10,
  sectionOptions,
  ...props
}: ActivityTableProps) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = items.filter(
    (item) =>
      (section === "all" || item.section === section) &&
      `${item.title} ${item.description ?? ""} ${item.actor?.name ?? ""}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 10;
  const current = Math.max(
    1,
    Math.min(page, Math.ceil(filtered.length / size) || 1),
  );
  const rows =
    mode === "recent"
      ? filtered.slice(0, 4)
      : filtered.slice((current - 1) * size, current * size);
  return (
    <section className="pt-activity-history" aria-label={title}>
      <header className="pt-section-heading">
        <h2>{title}</h2>
        <span className="pt-caption">{filtered.length} activities</span>
      </header>
      <div className="pt-section-controls">
        <SearchField
          placeholder="Search activity"
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
        {sectionOptions ? (
          <SelectField
            label="Activity section"
            value={section}
            onValueChange={(value) => {
              setSection(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All sections" },
              ...sectionOptions.filter((o) => o.value !== "all"),
            ]}
          />
        ) : null}
      </div>
      <ActivityTimeline
        {...props}
        items={rows}
        presentation="table"
        label={title}
      />
      {mode === "history" && !props.loading ? (
        <TableFooter
          page={current}
          pageSize={size}
          total={filtered.length}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}
export type KpiItem = {
  id?: string;
  label: string;
  value: ReactNode;
  icon?: IconName;
  tone?: StatusTone;
  hint?: string;
  mono?: boolean;
  now?: boolean;
} & (
  | { href: string; onSelect?: () => void }
  | { href?: never; onSelect: () => void }
);
export interface KpiStripProps {
  label?: string;
  title?: string;
  actions?: ReactNode;
  items: KpiItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  loadingCount?: number;
}
export function KpiStrip({
  label = "Summary",
  title,
  actions,
  items,
  columns = 4,
  loading,
  loadingCount = 4,
}: KpiStripProps) {
  const id = useId();
  return (
    <section aria-label={title ?? label} className="pt-kpis">
      {title || actions ? (
        <header className="pt-section-heading">
          {title ? <h2>{title}</h2> : <span />}
          {actions}
        </header>
      ) : null}
      <div
        className="pt-kpi-grid"
        style={{ "--pt-kpi-columns": columns } as CSSProperties}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <>
            <span className="pt-sr-only" role="status">
              Loading summary
            </span>
            {Array.from(
              { length: Math.min(12, Math.max(1, loadingCount)) },
              (_, i) => (
                <div className="pt-kpi-tile" key={i}>
                  <Skeleton lines={2} />
                </div>
              ),
            )}
          </>
        ) : (
          items.map((item, i) => {
            const content = (
              <>
                {item.icon ? (
                  <span className="pt-kpi-icon">
                    <Icon name={item.icon} />
                  </span>
                ) : null}
                <span className="pt-kpi-copy">
                  <span>
                    {item.label}
                    {item.now ? (
                      <small className="pt-kpi-now">Now</small>
                    ) : null}
                  </span>
                  <strong
                    className={cx(
                      item.mono !== false && "pt-mono",
                      item.tone && `pt-text--${item.tone}`,
                    )}
                  >
                    {item.value}
                  </strong>
                </span>
                {item.hint ? (
                  <Icon name="info" size="sm" />
                ) : (
                  <Icon name="arrow-right" size="sm" />
                )}
              </>
            );
            const attributes = {
              className: "pt-kpi-tile",
              "aria-describedby": item.hint ? `${id}-${i}` : undefined,
            };
            const target = item.href ? (
              <a {...attributes} href={item.href} onClick={item.onSelect}>
                {content}
              </a>
            ) : (
              <button {...attributes} type="button" onClick={item.onSelect}>
                {content}
              </button>
            );
            return (
              <div className="pt-kpi-cell" key={item.id ?? i}>
                {item.hint ? (
                  <>
                    <Tooltip content={item.hint}>{target}</Tooltip>
                    <span className="pt-sr-only" id={`${id}-${i}`}>
                      {item.hint}
                    </span>
                  </>
                ) : (
                  target
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
export interface NoteRecord {
  id: string;
  body: string;
  at?: string;
  dateLabel?: string;
  timeLabel?: string;
  author: { name: string; avatarSrc?: string };
}
export interface NotesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  notes: NoteRecord[];
  onAdd?: (body: string) => void | Promise<void>;
  autoCompose?: boolean;
  variant?: "list" | "cards" | "timeline" | "compact";
  linkedRecords?: { id: string; label: string; onOpen: () => void }[];
}
export function NotesPanel({
  open,
  onOpenChange,
  title,
  notes,
  onAdd,
  autoCompose,
  variant = "list",
  linkedRecords,
}: NotesPanelProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (open) {
      if (autoCompose && onAdd)
        composer.current?.querySelector("textarea")?.focus();
      else titleRef.current?.focus();
    }
  }, [open, autoCompose, onAdd]);
  if (!open) return null;
  const close = () => {
    if (pending) return;
    if (body.trim()) setConfirmClose(true);
    else onOpenChange(false);
  };
  return (
    <section
      className={cx("pt-notes-section", `pt-notes-section--${variant}`)}
      aria-label={title}
    >
      <header className="pt-section-heading">
        <div>
          <h2 ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
          <p className="pt-caption">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <IconButton
          icon="x"
          aria-label="Close notes"
          onClick={close}
          disabled={pending}
        />
      </header>
      <div className="pt-notes-layout">
        <div>
          {onAdd ? (
            <form
              ref={composer}
              className="pt-note-composer"
              onSubmit={async (event) => {
                event.preventDefault();
                const text = body.trim();
                if (!text || pending) return;
                setPending(true);
                setError("");
                try {
                  await onAdd(text);
                  setBody("");
                } catch {
                  setError(
                    "The note could not be saved. Your text is still here. Try again.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              <TextArea
                label="New note"
                value={body}
                onValueChange={setBody}
                disabled={pending}
                required
                maxLength={20000}
              />
              <div className="pt-section-actions">
                {error ? (
                  <p role="alert" className="pt-field-error">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="primary"
                  loading={pending}
                  disabled={!body.trim()}
                >
                  Add note
                </Button>
              </div>
            </form>
          ) : null}
          {notes.length ? (
            <ol className="pt-notes-list">
              {notes.map((note) => {
                const date = activityDate(
                  note.at,
                  note.dateLabel,
                  note.timeLabel,
                );
                return (
                  <li key={note.id}>
                    <Avatar
                      name={note.author.name}
                      src={note.author.avatarSrc}
                      size="sm"
                    />
                    <article>
                      <header>
                        <strong>{note.author.name}</strong>
                        <time dateTime={date.instant}>
                          {date.day} · {date.time}
                        </time>
                      </header>
                      <p>{note.body}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState
              icon="notes"
              title="No notes yet"
              description={
                onAdd
                  ? "Add the first internal note for this record."
                  : "Internal notes will appear here."
              }
            />
          )}
        </div>
        {linkedRecords?.length ? (
          <aside aria-label="Linked records">
            <h3>Linked records</h3>
            {linkedRecords.map((record) => (
              <Button key={record.id} variant="ghost" onClick={record.onOpen}>
                {record.label}
              </Button>
            ))}
          </aside>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Discard this note?"
        message="The text you entered has not been saved."
        confirmLabel="Discard note"
        danger
        onConfirm={() => {
          setBody("");
          onOpenChange(false);
        }}
      />
    </section>
  );
}
export interface EmailAttachment {
  id: string;
  name: string;
  size?: number;
  file?: File;
}
export interface EmailMessage {
  id: string;
  threadId?: string;
  folder: "inbox" | "sent" | "draft" | "unknown";
  subject: string;
  body: string;
  from?: string;
  to?: string;
  at?: string;
  dateLabel?: string;
  caption?: string;
  attachments?: EmailAttachment[];
}
export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}
export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}
export interface EmailCommunicationProps {
  contact: { name: string; email?: string; avatarSrc?: string };
  messages: EmailMessage[];
  draft: EmailDraft;
  onDraftChange: (draft: EmailDraft) => void;
  onSend?: (draft: EmailDraft) => void | Promise<void>;
  composeAction?: "send" | "save-draft";
  onSaveDraft?: (draft: EmailDraft) => void | Promise<void>;
  readOnly?: boolean;
  allowAttachments?: boolean;
  messageActions?: (message: EmailMessage) => MenuItem[];
  templates?: EmailTemplate[];
  initialCompose?: boolean;
  state?: "ready" | "loading" | "error" | "no-access";
  errorText?: string;
  onRetry?: () => void;
  context?: string;
  onAttachmentOpen?: (attachment: EmailAttachment) => void;
}
export function EmailCommunication({
  contact,
  messages,
  draft,
  onDraftChange,
  onSend,
  composeAction = "send",
  onSaveDraft,
  readOnly,
  allowAttachments = true,
  messageActions,
  templates,
  initialCompose = false,
  state = "ready",
  errorText,
  onRetry,
  context,
  onAttachmentOpen,
}: EmailCommunicationProps) {
  const [folder, setFolder] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compose, setCompose] = useState(initialCompose);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failure, setFailure] = useState("");
  const [discard, setDiscard] = useState(false);
  const [query, setQuery] = useState("");
  const selectionRef = useRef<HTMLElement>(null);
  const update = (patch: Partial<EmailDraft>) =>
    onDraftChange({ ...draft, ...patch });
  const folders = [
    { value: "all", label: "All mail" },
    { value: "inbox", label: "Inbox" },
    { value: "sent", label: "Sent" },
    { value: "draft", label: "Drafts" },
    { value: "unknown", label: "Captured" },
  ];
  const filtered = messages.filter(
    (message) =>
      (folder === "all" || folder === message.folder) &&
      `${message.subject} ${message.body} ${message.from ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selected = messages.find(
    (message) =>
      message.id === selectedId &&
      filtered.some((row) => row.id === message.id),
  );
  const thread = selected
    ? messages.filter(
        (message) =>
          message.id === selected.id ||
          (selected.threadId && message.threadId === selected.threadId),
      )
    : [];
  const sender = composeAction === "save-draft" ? onSaveDraft : onSend;
  const canCompose = !readOnly && !!sender;
  const subjectRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (compose) subjectRef.current?.querySelector("input")?.focus();
  }, [compose]);
  const closeComposer = () => {
    if (pending) return;
    if (draft.subject.trim() || draft.body.trim() || draft.attachments?.length)
      setDiscard(true);
    else setCompose(false);
  };
  if (state === "no-access")
    return (
      <EmptyState
        icon="lock"
        title="Communication is unavailable"
        description="Your account does not have access to this record’s email."
      />
    );
  if (state === "error")
    return (
      <Banner
        tone="danger"
        title="Email could not be loaded"
        action={
          onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined
        }
      >
        {errorText ?? "Try again to load this record’s messages."}
      </Banner>
    );
  if (state === "loading")
    return (
      <section
        role="status"
        aria-label="Loading communication"
        className="pt-mail-loading"
      >
        <span className="pt-sr-only">Loading communication</span>
        <Skeleton lines={6} />
      </section>
    );
  return (
    <section className="pt-mail" aria-label="Email communication">
      <header className="pt-section-heading">
        <span className="pt-section-person">
          <Avatar name={contact.name} src={contact.avatarSrc} />
          <span>
            <strong>{contact.name}</strong>
            <small>{contact.email ?? "Email not recorded"}</small>
          </span>
        </span>
        {canCompose ? (
          <Button
            variant="primary"
            leadingIcon="pencil"
            onClick={() => {
              setCompose(true);
              setFailure("");
              setFeedback("");
              if (!draft.to) update({ to: contact.email ?? "" });
            }}
          >
            Compose email
          </Button>
        ) : null}
      </header>
      {context ? <p className="pt-mail-context">{context}</p> : null}
      <p className="pt-sr-only" role="status">
        {feedback}
      </p>
      <div className="pt-mail-layout">
        <nav aria-label="Mailbox folders">
          {folders.map((option) => (
            <button
              type="button"
              key={option.value}
              aria-current={folder === option.value ? "page" : undefined}
              onClick={() => {
                setFolder(option.value);
                setSelectedId(null);
              }}
            >
              <Icon
                name={
                  option.value === "inbox"
                    ? "inbox"
                    : option.value === "sent"
                      ? "send"
                      : option.value === "draft"
                        ? "file-text"
                        : "mail"
                }
                size="sm"
              />
              {option.label}
              <span className="pt-mono">
                {option.value === "all"
                  ? messages.length
                  : messages.filter((m) => m.folder === option.value).length}
              </span>
            </button>
          ))}
        </nav>
        <div className="pt-mail-list">
          <SearchField
            placeholder="Search mail"
            value={query}
            onValueChange={setQuery}
          />
          <ul aria-label="Messages">
            {filtered.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  aria-current={
                    selected?.id === message.id ? "true" : undefined
                  }
                  onClick={() => {
                    setSelectedId(message.id);
                    selectionRef.current?.focus();
                  }}
                >
                  <strong>{message.subject || "(No subject)"}</strong>
                  <span>
                    {message.from ?? contact.email ?? "Sender not recorded"}
                  </span>
                  <small>
                    {message.caption ??
                      (message.folder === "unknown"
                        ? "Captured message · direction not recorded"
                        : folders.find((f) => f.value === message.folder)
                            ?.label)}
                  </small>
                  <small>
                    {message.at
                      ? activityDate(message.at, message.dateLabel).day
                      : (message.dateLabel ?? "Date not recorded")}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {!filtered.length ? (
            <p className="pt-section-empty">
              {query
                ? "No messages match your search."
                : "No messages in this folder."}
            </p>
          ) : null}
        </div>
        <section
          ref={selectionRef}
          tabIndex={-1}
          className="pt-mail-thread"
          aria-label="Message thread"
        >
          {selected ? (
            <>
              <h3>{selected.subject || "(No subject)"}</h3>
              {thread.map((message) => (
                <article key={message.id}>
                  <header>
                    <div>
                      <strong>{message.from ?? "Sender not recorded"}</strong>
                      <p className="pt-caption">
                        To: {message.to ?? "Recipient not recorded"}
                      </p>
                      <time dateTime={activityDate(message.at).instant}>
                        {message.at
                          ? `${activityDate(message.at).day} · ${activityDate(message.at).time}`
                          : (message.dateLabel ?? "Date not recorded")}
                      </time>
                    </div>
                    {messageActions?.(message)?.length ? (
                      <Menu
                        label={`Message actions for ${message.subject}`}
                        items={messageActions(message)}
                        trigger={
                          <IconButton
                            icon="more-horizontal"
                            aria-label={`Message actions for ${message.subject}`}
                          />
                        }
                      />
                    ) : null}
                  </header>
                  <p className="pt-mail-body">{message.body}</p>
                  {message.attachments?.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="pt-mail-attachment"
                      disabled={!onAttachmentOpen}
                      onClick={() => onAttachmentOpen?.(file)}
                    >
                      <Icon name="paperclip" size="sm" />
                      {file.name}
                    </button>
                  ))}
                </article>
              ))}
            </>
          ) : (
            <EmptyState
              icon="mail"
              title="Select a message"
              description="Open an email to read the conversation here."
            />
          )}
        </section>
      </div>
      {compose && canCompose ? (
        <form
          className="pt-mail-compose"
          onSubmit={async (event) => {
            event.preventDefault();
            if (pending || !sender) return;
            if (!draft.to.trim() || !draft.subject.trim() || !draft.body.trim()) {
              setFailure("Enter a recipient, subject, and message before continuing.");
              return;
            }
            setPending(true);
            setFailure("");
            const snapshot = {
              ...draft,
              to: draft.to.trim(),
              subject: draft.subject.trim(),
              attachments: [...(draft.attachments ?? [])],
            };
            try {
              await sender(snapshot);
              onDraftChange({
                to: contact.email ?? "",
                subject: "",
                body: "",
                attachments: [],
              });
              setCompose(false);
              setFeedback(
                composeAction === "send" ? "Email sent." : "Draft saved.",
              );
            } catch {
              setFailure(
                composeAction === "send"
                  ? "Email was not sent. Your draft is preserved. Try again."
                  : "Draft could not be saved. Your text is preserved. Try again.",
              );
            } finally {
              setPending(false);
            }
          }}
          aria-label="Compose email"
        >
          <header className="pt-section-heading">
            <h3>Compose email</h3>
            <IconButton
              icon="x"
              aria-label="Close composer"
              disabled={pending}
              onClick={closeComposer}
            />
          </header>
          <TextField
            label="To"
            type="email"
            required
            value={draft.to}
            disabled={pending}
            onValueChange={(to) => update({ to })}
          />
          <div ref={subjectRef}>
            <TextField
              label="Subject"
              required
              value={draft.subject}
              disabled={pending}
              onValueChange={(subject) => update({ subject })}
            />
          </div>
          {templates?.length ? (
            <SelectField
              label="Email template"
              placeholder="Choose a template"
              disabled={pending}
              options={templates.map((t) => ({ value: t.id, label: t.label }))}
              onValueChange={(id) => {
                const template = templates.find((t) => t.id === id);
                if (template)
                  update({ subject: template.subject, body: template.body });
              }}
            />
          ) : null}
          <TextArea
            label="Message"
            required
            rows={7}
            value={draft.body}
            disabled={pending}
            onValueChange={(body) => update({ body })}
          />
          {allowAttachments ? (
            <label className="pt-mail-upload">
              Add attachments
              <input
                type="file"
                multiple
                disabled={pending}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  update({
                    attachments: [
                      ...(draft.attachments ?? []),
                      ...files.map((file, index) => ({
                        id: `upload-${Date.now()}-${index}`,
                        name: file.name,
                        size: file.size,
                        file,
                      })),
                    ],
                  });
                  event.target.value = "";
                }}
              />
            </label>
          ) : null}
          {draft.attachments?.map((file) => (
            <span className="pt-mail-attachment" key={file.id}>
              {file.name}
              <IconButton
                icon="x"
                variant="ghost"
                aria-label={`Remove ${file.name}`}
                disabled={pending}
                onClick={() =>
                  update({
                    attachments: draft.attachments?.filter(
                      (f) => f.id !== file.id,
                    ),
                  })
                }
              />
            </span>
          ))}
          {failure ? (
            <p role="alert" className="pt-field-error">
              {failure}
            </p>
          ) : null}
          <footer className="pt-section-actions">
            <Button disabled={pending} onClick={closeComposer}>
              Discard
            </Button>
            <Button
              type="submit"
              variant="primary"
              leadingIcon={composeAction === "send" ? "send" : "file-text"}
              loading={pending}
            >
              {composeAction === "send" ? "Send email" : "Save draft"}
            </Button>
          </footer>
        </form>
      ) : null}
      <ConfirmDialog
        open={discard}
        onOpenChange={setDiscard}
        title="Discard this draft?"
        message="The text and attachments in this draft will be removed."
        confirmLabel="Discard draft"
        danger
        onConfirm={() => {
          onDraftChange({
            to: contact.email ?? "",
            subject: "",
            body: "",
            attachments: [],
          });
          setCompose(false);
        }}
      />
    </section>
  );
}
