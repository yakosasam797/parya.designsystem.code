import { useId, type ReactNode, type HTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";
import { Avatar, Button, StatusChip, cx, type StatusTone } from "./primitives";
export interface PageHeaderProps {
  title: string;
  headingLevel?: 1 | 2 | 3;
  description?: string;
  count?: number;
  status?: ReactNode;
  actions?: ReactNode;
}
export function PageHeader({
  title,
  headingLevel = 1,
  description,
  count,
  status,
  actions,
}: PageHeaderProps) {
  const Title = headingLevel === 1 ? "h1" : headingLevel === 2 ? "h2" : "h3";
  return (
    <header className="pt-page-header">
      <div>
        <div className="pt-inline">
          <Title className="pt-page-header-title">{title}</Title>
          {count !== undefined ? (
            <span className="pt-mono pt-caption">{count}</span>
          ) : null}
          {status}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? (
        <div className="pt-inline pt-header-actions">{actions}</div>
      ) : null}
    </header>
  );
}
export interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: PanelProps) {
  return (
    <section {...props} className={cx("pt-panel", className)}>
      {title || actions ? (
        <header className="pt-split">
          <div>
            {title ? <h2 className="pt-heading">{title}</h2> : null}
            {description ? <p className="pt-caption">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="pt-panel-body">{children}</div>
    </section>
  );
}
export function IconText({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <span className="pt-inline">
      <Icon name={icon} />
      {children}
    </span>
  );
}
export function PersonInline({ name, src }: { name: string; src?: string }) {
  return (
    <span className="pt-inline">
      <Avatar name={name} src={src} size="chip" />
      {name}
    </span>
  );
}
export interface MoneyProps {
  value: number;
  currency?: string;
  locale?: string;
  decimals?: number;
  tone?: "default" | "muted" | "success" | "danger";
}
export function formatMoney(
  value: number,
  currency = "INR",
  locale = "en-IN",
  decimals = 0,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
export function Money({
  value,
  currency = "INR",
  locale = "en-IN",
  decimals = 0,
  tone = "default",
}: MoneyProps) {
  return (
    <span className={cx("pt-mono", `pt-text--${tone}`)}>
      {formatMoney(value, currency, locale, decimals)}
    </span>
  );
}
export interface DateTextProps {
  value: string | Date;
  locale?: string;
  format?: "short" | "medium" | "long";
  timeZone?: string;
}
export function DateText({
  value,
  locale = "en-IN",
  format = "medium",
  timeZone = "Asia/Kolkata",
}: DateTextProps) {
  const date =
    typeof value === "string"
      ? new Date(
          /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00+05:30` : value,
        )
      : value;
  return Number.isNaN(date.valueOf()) ? (
    <span>—</span>
  ) : (
    <time dateTime={date.toISOString()}>
      {new Intl.DateTimeFormat(locale, { dateStyle: format, timeZone }).format(
        date,
      )}
    </time>
  );
}
export interface DescriptionListProps {
  items: { label: string; value: ReactNode }[];
  columns?: 1 | 2 | 3;
}
export function DescriptionList({ items, columns = 2 }: DescriptionListProps) {
  return (
    <dl className={cx("pt-description-list", `pt-form-grid--${columns}`)}>
      {items.map((item, i) => (
        <div key={i}>
          <dt>{item.label}</dt>
          <dd>{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
export interface SummaryStripProps {
  items: { label: string; value: ReactNode; hint?: string }[];
}
export function SummaryStrip({ items }: SummaryStripProps) {
  return (
    <dl className="pt-summary-strip">
      {items.map((item, i) => (
        <div key={i}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}
            {item.hint ? <small>{item.hint}</small> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export interface BannerProps {
  tone?: StatusTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}
export function Banner({
  tone = "info",
  title,
  children,
  action,
}: BannerProps) {
  return (
    <div
      className={cx("pt-banner", `pt-status--${tone}`)}
      role={tone === "danger" ? "alert" : undefined}
    >
      <Icon
        name={
          tone === "danger"
            ? "alert-circle"
            : tone === "success"
              ? "check-circle"
              : "info"
        }
      />
      <div>
        <strong>{title}</strong>
        {children ? <div>{children}</div> : null}
      </div>
      {action}
    </div>
  );
}
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
}
export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
}: EmptyStateProps) {
  return (
    <div className="pt-empty">
      <span className="pt-empty-icon">
        <Icon name={icon} size="xl" />
      </span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
export interface RecordHeaderProps extends PageHeaderProps {
  code?: string;
  icon?: IconName;
  meta?: ReactNode;
}
export function RecordHeader({
  code,
  icon,
  meta,
  ...props
}: RecordHeaderProps) {
  return (
    <div className="pt-record-header">
      {code ? (
        <div className="pt-caption pt-mono">
          {icon ? <Icon name={icon} /> : null}
          {code}
        </div>
      ) : null}
      <PageHeader {...props} />
      {meta ? <div className="pt-inline pt-caption">{meta}</div> : null}
    </div>
  );
}
export interface ItemListProps {
  items: {
    id: string;
    title: string;
    description?: string;
    icon?: IconName;
    trailing?: ReactNode;
    onClick?: () => void;
  }[];
}
export function ItemList({ items }: ItemListProps) {
  return (
    <ul className="pt-item-list">
      {items.map((item) => (
        <li key={item.id}>
          {item.icon ? <Icon name={item.icon} /> : null}
          <div>
            {item.onClick ? (
              <button
                type="button"
                className="pt-text-button"
                onClick={item.onClick}
              >
                {item.title}
              </button>
            ) : (
              <strong>{item.title}</strong>
            )}
            {item.description ? (
              <p className="pt-caption">{item.description}</p>
            ) : null}
          </div>
          {item.trailing}
        </li>
      ))}
    </ul>
  );
}
export function ContactList({
  items,
}: {
  items: { label: string; value: string; type: "email" | "phone" | "text" }[];
}) {
  return (
    <ul className="pt-item-list">
      {items.map((item, i) => (
        <li key={i}>
          <Icon
            name={
              item.type === "email"
                ? "mail"
                : item.type === "phone"
                  ? "phone"
                  : "user"
            }
          />
          <div>
            <small className="pt-caption">{item.label}</small>
            <div>
              {item.type === "text" ? (
                item.value
              ) : (
                <a
                  className="pt-link"
                  href={`${item.type === "email" ? "mailto" : "tel"}:${item.value}`}
                >
                  {item.value}
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
export interface StepsProps {
  steps: { id: string; label: string; description?: string }[];
  current: string;
}
export function Steps({ steps, current }: StepsProps) {
  const index = steps.findIndex((s) => s.id === current);
  return (
    <ol className="pt-steps">
      {steps.map((step, i) => (
        <li
          key={step.id}
          aria-current={i === index ? "step" : undefined}
          data-complete={i < index}
        >
          <span className="pt-step-number">
            {i < index ? <Icon name="check" size="sm" /> : i + 1}
          </span>
          <span>
            {step.label}
            {step.description ? (
              <small className="pt-caption">{step.description}</small>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
export interface ChecklistProps {
  items: { id: string; label: string; checked: boolean; disabled?: boolean }[];
  onCheckedChange: (id: string, checked: boolean) => void;
}
export function Checklist({ items, onCheckedChange }: ChecklistProps) {
  const id = useId();
  return (
    <ul className="pt-item-list">
      {items.map((item) => (
        <li key={item.id}>
          <input
            id={`${id}-${item.id}`}
            type="checkbox"
            checked={item.checked}
            disabled={item.disabled}
            onChange={(e) => onCheckedChange(item.id, e.target.checked)}
          />
          <label htmlFor={`${id}-${item.id}`}>{item.label}</label>
        </li>
      ))}
    </ul>
  );
}
export interface FileDropzoneProps {
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxBytes?: number;
  onFiles: (files: File[]) => void;
  onError?: (message: string) => void;
}
export function FileDropzone({
  label,
  description,
  accept,
  multiple,
  disabled,
  maxBytes,
  onFiles,
  onError,
}: FileDropzoneProps) {
  const id = useId();
  const validate = (files: File[]) => {
    const allowed = accept?.split(",").map((v) => v.trim().toLowerCase());
    if (files.some((f) => maxBytes && f.size > maxBytes)) {
      onError?.("A file exceeds the size limit.");
      return;
    }
    if (
      allowed &&
      files.some(
        (f) =>
          !allowed.some((a) =>
            a.startsWith(".")
              ? f.name.toLowerCase().endsWith(a)
              : a.endsWith("/*")
                ? f.type.startsWith(a.slice(0, -1))
                : f.type === a,
          ),
      )
    ) {
      onError?.("This file type is not accepted.");
      return;
    }
    onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <div
      className={cx("pt-dropzone", disabled && "pt-disabled")}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!disabled) validate(Array.from(e.dataTransfer.files));
      }}
    >
      <Icon name="upload" size="xl" />
      <label htmlFor={id}>{label}</label>
      {description ? <p className="pt-caption">{description}</p> : null}
      <input
        id={id}
        type="file"
        {...{ accept, multiple, disabled }}
        onChange={(e) => {
          validate(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
export function StageLabel({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  return <StatusChip tone={tone}>{children}</StatusChip>;
}
export function PriorityDot({
  priority,
}: {
  priority: "low" | "medium" | "high" | "urgent";
}) {
  return (
    <span
      className={cx("pt-priority", `pt-priority--${priority}`)}
      role="img"
      aria-label={`${priority} priority`}
    />
  );
}
export function KanbanSignal({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <span className="pt-inline pt-caption">
      <Icon name={icon} size="sm" />
      {children}
    </span>
  );
}
export interface KanbanCardProps {
  title: string;
  code?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  description?: string;
  footer?: ReactNode;
  onClick?: () => void;
}
export function KanbanCard({
  title,
  code,
  priority,
  description,
  footer,
  onClick,
}: KanbanCardProps) {
  return (
    <article className="pt-kanban-card">
      <div className="pt-split">
        {code ? <span className="pt-mono pt-caption">{code}</span> : null}
        {priority ? <PriorityDot priority={priority} /> : null}
      </div>
      {onClick ? (
        <button
          type="button"
          className="pt-text-button pt-card-title"
          onClick={onClick}
        >
          {title}
        </button>
      ) : (
        <h3>{title}</h3>
      )}
      {description ? <p className="pt-caption">{description}</p> : null}
      {footer ? <footer>{footer}</footer> : null}
    </article>
  );
}
export function PriceChip({ value, ...props }: MoneyProps) {
  return (
    <span className="pt-price-chip">
      <Money value={value} {...props} />
    </span>
  );
}
export function SeasonHeader({
  name,
  from,
  to,
}: {
  name: string;
  from: string;
  to: string;
}) {
  return (
    <div>
      <strong>{name}</strong>
      <p className="pt-caption">
        <DateText value={from} /> – <DateText value={to} />
      </p>
    </div>
  );
}
