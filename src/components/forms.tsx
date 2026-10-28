import {
  useEffect,
  useId,
  useRef,
  useState,
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import * as Pop from "@radix-ui/react-popover";
import { Button, IconButton, Tag, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";
import { useControllableState } from "../hooks";
import { useTheme } from "../theme";

export interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  labelId?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  required?: boolean;
  span?: "full";
  children: ReactNode;
}
export function Field({
  label,
  htmlFor,
  labelId,
  hint,
  error,
  optional,
  required,
  span,
  children,
}: FieldProps) {
  return (
    <div className={cx("pt-field", span === "full" && "pt-span-full")}>
      <label className="pt-field-label" id={labelId} htmlFor={htmlFor}>
        {label}
        {optional ? <span className="pt-caption"> (optional)</span> : null}
        {required ? <span className="pt-sr-only"> (required)</span> : null}
      </label>
      {children}
      {error ? (
        <p className="pt-field-error" id={`${htmlFor}-error`}>
          <Icon name="alert-circle" size="sm" />
          {error}
        </p>
      ) : hint ? (
        <p className="pt-caption" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
interface FieldOptions {
  label: ReactNode;
  hint?: string;
  error?: string;
  optional?: boolean;
  span?: "full";
}
export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> {
  label: ReactNode;
  hint?: string;
  error?: string;
  optional?: boolean;
  span?: "full";
  leadingIcon?: IconName;
  prefix?: string;
  suffix?: ReactNode;
  size?: "sm" | "md";
  mono?: boolean;
  onValueChange?: (value: string) => void;
}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      error,
      optional,
      span,
      leadingIcon,
      prefix,
      suffix,
      size = "md",
      mono,
      onValueChange,
      id: given,
      className,
      onChange,
      ...input
    },
    ref,
  ) {
    const uid = useId();
    const id = given ?? uid;
    return (
      <Field
        {...{ label, hint, error, optional, span }}
        htmlFor={id}
        required={input.required}
      >
        <div
          className={cx(
            "pt-input-wrap",
            error && "pt-invalid",
            input.disabled && "pt-disabled",
            size === "sm" && "pt-input-wrap--sm",
            className,
          )}
        >
          {leadingIcon ? <Icon name={leadingIcon} /> : null}
          {prefix ? <span className="pt-caption">{prefix}</span> : null}
          <input
            {...input}
            ref={ref}
            id={id}
            className={cx("pt-input", mono && "pt-mono")}
            aria-invalid={!!error || undefined}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onChange={(e) => {
              onChange?.(e);
              onValueChange?.(e.target.value);
            }}
          />
          {suffix ? <span className="pt-input-suffix">{suffix}</span> : null}
        </div>
      </Field>
    );
  },
);
export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldOptions {
  resize?: "vertical" | "none";
  onValueChange?: (value: string) => void;
}
export function TextArea({
  label,
  hint,
  error,
  optional,
  span,
  resize = "vertical",
  rows = 3,
  id: given,
  onValueChange,
  onChange,
  ...props
}: TextAreaProps) {
  const uid = useId();
  const id = given ?? uid;
  return (
    <Field {...{ label, hint, error, optional, span }} htmlFor={id}>
      <textarea
        {...props}
        rows={rows}
        id={id}
        className={cx(
          "pt-textarea",
          error && "pt-invalid",
          resize === "none" && "pt-no-resize",
        )}
        aria-invalid={!!error || undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </Field>
  );
}
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  media?: { src: string };
}
export interface SelectFieldProps extends FieldOptions {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}
export function SelectField({
  label,
  hint,
  error,
  optional,
  span,
  options,
  placeholder = "Select…",
  onValueChange,
  ...props
}: SelectFieldProps) {
  const id = useId();
  return (
    <Field {...{ label, hint, error, optional, span }} htmlFor={id}>
      <div className={cx("pt-input-wrap", error && "pt-invalid")}>
        <select
          {...props}
          id={id}
          className="pt-input pt-select"
          aria-invalid={!!error || undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          onChange={(e) => onValueChange?.(e.target.value)}
        >
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
          {options.map((o) => (
            <option value={o.value} disabled={o.disabled} key={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size="sm" />
      </div>
    </Field>
  );
}
export interface ComboboxProps extends SelectFieldProps {
  searchPlaceholder?: string;
  emptyText?: string;
  leadingIcon?: IconName;
  onCreate?: (query: string) => void;
  createLabel?: string;
}
export function Combobox({
  label,
  hint,
  error,
  optional,
  span,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select…",
  emptyText = "No matches",
  searchPlaceholder = "Search…",
  disabled,
  required,
  name,
  onCreate,
  createLabel = "Create new",
}: ComboboxProps) {
  const { theme } = useTheme();
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const search = useRef<HTMLInputElement>(null);
  const id = useId();
  const filtered = options.filter((o) =>
    `${o.label} ${o.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selectable = filtered.filter((o) => !o.disabled);
  const current = options.find((o) => o.value === selected);
  function choose(v: string) {
    setSelected(v);
    setOpen(false);
  }
  return (
    <Field
      {...{ label, hint, error, optional, span }}
      htmlFor={`${id}-trigger`}
    >
      <Pop.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setQuery("");
          setActive(0);
        }}
      >
        <Pop.Trigger asChild>
          <button
            id={`${id}-trigger`}
            type="button"
            className={cx(
              "pt-input-wrap",
              "pt-combo-trigger",
              error && "pt-invalid",
            )}
            disabled={disabled}
            aria-describedby={
              error
                ? `${id}-trigger-error`
                : hint
                  ? `${id}-trigger-hint`
                  : undefined
            }
            aria-invalid={!!error || undefined}
          >
            <span>{current?.label ?? placeholder}</span>
            <Icon name="chevron-down" size="sm" />
          </button>
        </Pop.Trigger>
        <Pop.Portal>
          <Pop.Content
            data-theme={theme}
            className="pt-popover pt-combo"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              search.current?.focus();
            }}
          >
            <input
              ref={search}
              className="pt-combo-search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-controls={`${id}-list`}
              aria-expanded={open}
              aria-autocomplete="list"
              aria-activedescendant={
                selectable[active]
                  ? `${id}-${selectable[active].value}`
                  : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                  e.preventDefault();
                  if (e.key === "Enter" && selectable[active])
                    choose(selectable[active].value);
                  else if (e.key !== "Enter")
                    setActive(
                      (i) =>
                        (i +
                          (e.key === "ArrowDown" ? 1 : -1) +
                          Math.max(1, selectable.length)) %
                        Math.max(1, selectable.length),
                    );
                }
              }}
            />
            <div
              role="listbox"
              id={`${id}-list`}
              aria-label={typeof label === "string" ? label : "Options"}
              className="pt-option-list"
            >
              {filtered.length ? (
                filtered.map((o) => (
                  <button
                    type="button"
                    role="option"
                    id={`${id}-${o.value}`}
                    key={o.value}
                    tabIndex={-1}
                    disabled={o.disabled}
                    aria-selected={selected === o.value}
                    data-active={selectable[active]?.value === o.value}
                    className="pt-option"
                    onClick={() => choose(o.value)}
                  >
                    {o.icon ? <Icon name={o.icon} /> : null}
                    <span>
                      <span>{o.label}</span>
                      {o.description ? <small>{o.description}</small> : null}
                    </span>
                    {selected === o.value ? (
                      <Icon name="check" size="sm" />
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="pt-caption pt-pad">{emptyText}</p>
              )}
            </div>
            {onCreate && query ? (
              <Button
                fullWidth
                variant="ghost"
                leadingIcon="plus"
                onClick={() => {
                  onCreate(query);
                  setOpen(false);
                }}
              >
                {createLabel}: {query}
              </Button>
            ) : null}
          </Pop.Content>
        </Pop.Portal>
      </Pop.Root>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      {required ? (
        <input
          className="pt-validation-input"
          aria-label={typeof label === "string" ? label : "Selection"}
          tabIndex={-1}
          required
          value={selected}
          onChange={() => {}}
          onInvalid={() => setOpen(true)}
        />
      ) : null}
    </Field>
  );
}
export interface MultiSelectProps extends Omit<
  ComboboxProps,
  "value" | "defaultValue" | "onValueChange" | "name"
> {
  value: string[];
  onValueChange: (value: string[]) => void;
  max?: number;
}
export function MultiSelect({
  label,
  options,
  value,
  onValueChange,
  max = 3,
  disabled,
  required,
  ...props
}: MultiSelectProps) {
  return (
    <div className="pt-multi">
      <Combobox
        {...props}
        label={label}
        options={options.map((o) => ({
          ...o,
          disabled: o.disabled || value.includes(o.value),
        }))}
        disabled={disabled}
        required={false}
        value=""
        onValueChange={(v) => onValueChange([...value, v])}
      />
      <div className="pt-inline">
        {value.slice(0, max).map((v) => (
          <Tag
            key={v}
            onRemove={() => onValueChange(value.filter((x) => x !== v))}
            disabled={disabled}
            removeLabel={`Remove ${options.find((o) => o.value === v)?.label ?? v}`}
          >
            {options.find((o) => o.value === v)?.label ?? v}
          </Tag>
        ))}
        {value.length > max ? (
          <span className="pt-caption">+{value.length - max} selected</span>
        ) : null}
      </div>
      {required ? (
        <input
          className="pt-validation-input"
          tabIndex={-1}
          aria-label={typeof label === "string" ? label : "Selection"}
          required
          disabled={disabled}
          value={value.length ? value.join(",") : ""}
          onChange={() => {}}
          onInvalid={(e) => {
            e.preventDefault();
            (
              e.currentTarget
                .closest(".pt-multi")
                ?.querySelector("button") as HTMLButtonElement | null
            )?.click();
          }}
        />
      ) : null}
    </div>
  );
}
export function DateField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="date" />;
}
export function TimeField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="time" />;
}
export interface DateRangeValue {
  from?: string;
  to?: string;
}
export function isDateRangeReversed(value: DateRangeValue) {
  return !!(value.from && value.to && value.from > value.to);
}
export interface DateRangeFieldProps extends FieldOptions {
  value: DateRangeValue;
  onValueChange: (value: DateRangeValue) => void;
  fromLabel?: string;
  toLabel?: string;
  min?: string;
  max?: string;
  orderError?: string;
  disabled?: boolean;
  required?: boolean;
}
export function DateRangeField({
  value,
  onValueChange,
  label,
  fromLabel = "Start date",
  toLabel = "End date",
  min,
  max,
  error,
  orderError = "End date must follow start date.",
  disabled,
  required,
  hint,
  optional,
  span,
}: DateRangeFieldProps) {
  return (
    <fieldset className={cx("pt-fieldset", span === "full" && "pt-span-full")}>
      <legend className="pt-field-label">
        {label}
        {optional ? <span className="pt-caption"> (optional)</span> : null}
      </legend>
      <FormGrid>
        <DateField
          label={fromLabel}
          value={value.from ?? ""}
          onValueChange={(from) => onValueChange({ ...value, from })}
          {...{ min, max, disabled, required }}
        />
        <DateField
          label={toLabel}
          value={value.to ?? ""}
          onValueChange={(to) => onValueChange({ ...value, to })}
          min={value.from || min}
          {...{ max, disabled, required }}
          error={error || (isDateRangeReversed(value) ? orderError : undefined)}
        />
      </FormGrid>
      {hint ? <p className="pt-caption">{hint}</p> : null}
    </fieldset>
  );
}
export interface MoneyFieldProps extends FieldOptions {
  value: number | null;
  onValueChange: (value: number | null) => void;
  currency?: string;
  locale?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
}
export function MoneyField({
  value,
  onValueChange,
  currency = "INR",
  locale = "en-IN",
  ...props
}: MoneyFieldProps) {
  const symbol =
    new Intl.NumberFormat(locale, { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency;
  return (
    <TextField
      {...props}
      type="number"
      step="0.01"
      inputMode="decimal"
      mono
      prefix={symbol}
      value={value ?? ""}
      onValueChange={(v) => onValueChange(v === "" ? null : Number(v))}
    />
  );
}
export interface PhoneFieldProps extends FieldOptions {
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  countries?: { code: string; label: string }[];
  disabled?: boolean;
  required?: boolean;
}
export const PHONE_COUNTRY_CODES = [
  { code: "+91", label: "India" },
  { code: "+1", label: "United States / Canada" },
  { code: "+44", label: "United Kingdom" },
  { code: "+971", label: "United Arab Emirates" },
  { code: "+65", label: "Singapore" },
];
export function PhoneField({
  countryCode,
  onCountryCodeChange,
  countries = PHONE_COUNTRY_CODES,
  ...props
}: PhoneFieldProps) {
  return (
    <TextField
      {...props}
      type="tel"
      autoComplete="tel-national"
      prefix={undefined}
      leadingIcon="phone"
      suffix={
        <select
          className="pt-phone-code"
          aria-label="Country calling code"
          value={countryCode}
          disabled={props.disabled}
          onChange={(e) => onCountryCodeChange(e.target.value)}
        >
          {countries.map((c) => (
            <option value={c.code} key={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      }
    />
  );
}
export interface SearchFieldProps extends Omit<
  TextFieldProps,
  "label" | "leadingIcon"
> {
  placeholder: string;
  shortcut?: string;
  clearLabel?: string;
  icon?: IconName;
  value: string;
  onValueChange: (value: string) => void;
}
export function SearchField({
  shortcut = "/",
  clearLabel = "Clear search",
  icon = "search",
  value,
  onValueChange,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (shortcut !== "/") return;
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !el.closest("input,textarea,select,[contenteditable=true]")
      ) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [shortcut]);
  return (
    <div className="pt-search">
      <TextField
        {...props}
        ref={ref}
        label={
          <span className="pt-sr-only">
            {props["aria-label"] ?? props.placeholder}
          </span>
        }
        type="search"
        leadingIcon={icon}
        value={value}
        onValueChange={onValueChange}
        suffix={
          value ? (
            <IconButton
              icon="x"
              aria-label={clearLabel}
              variant="ghost"
              size="xs"
              onClick={() => {
                onValueChange("");
                ref.current?.focus();
              }}
            />
          ) : shortcut ? (
            <kbd className="pt-kbd">{shortcut}</kbd>
          ) : null
        }
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onValueChange("");
          }
        }}
      />
    </div>
  );
}
export interface ChoiceChipsProps {
  options: {
    value: string;
    label: string;
    icon?: IconName;
    disabled?: boolean;
  }[];
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  "aria-label": string;
}
export function ChoiceChips({
  options,
  value,
  onValueChange,
  multiple = true,
  disabled,
  ...props
}: ChoiceChipsProps) {
  return (
    <div role="group" {...props} className="pt-inline">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          className={cx(
            "pt-choice-chip",
            value.includes(o.value) && "pt-choice-chip--selected",
          )}
          disabled={disabled || o.disabled}
          aria-pressed={value.includes(o.value)}
          onClick={() =>
            onValueChange(
              value.includes(o.value)
                ? value.filter((v) => v !== o.value)
                : multiple
                  ? [...value, o.value]
                  : [o.value],
            )
          }
        >
          {o.icon ? <Icon name={o.icon} size="sm" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}
export interface SegmentedControlProps {
  options: {
    value: string;
    label: string;
    icon?: IconName;
    count?: number;
    disabled?: boolean;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  disabled?: boolean;
}
export function SegmentedControl({
  options,
  value,
  onValueChange,
  disabled,
  ...props
}: SegmentedControlProps) {
  return (
    <div role="group" {...props} className="pt-segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled || o.disabled}
          aria-pressed={o.value === value}
          onClick={() => onValueChange(o.value)}
        >
          {o.icon ? <Icon name={o.icon} size="sm" /> : null}
          {o.label}
          {o.count !== undefined ? <span>{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: IconName;
  headingLevel?: 2 | 3;
  id?: string;
  children: ReactNode;
}
export function FormSection({
  title,
  description,
  icon,
  headingLevel = 2,
  id,
  children,
}: FormSectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section id={id} className="pt-form-section">
      <header>
        <Heading className="pt-heading">
          {icon ? <Icon name={icon} /> : null}
          {title}
        </Heading>
        {description ? <p className="pt-caption">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
export function FormGrid({
  columns = 2,
  children,
}: {
  columns?: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cx("pt-form-grid", `pt-form-grid--${columns}`)}>
      {children}
    </div>
  );
}
export function FormFooter({
  sticky = true,
  start,
  children,
}: {
  sticky?: boolean;
  start?: ReactNode;
  children: ReactNode;
}) {
  return (
    <footer
      className={cx("pt-form-footer", sticky && "pt-form-footer--sticky")}
    >
      <div>{start}</div>
      <div className="pt-inline">{children}</div>
    </footer>
  );
}
export interface QuantityFieldProps extends FieldOptions {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: { one: string; other: string };
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  layout?: "stacked" | "inline";
}
export function QuantityField({
  value,
  onValueChange,
  label,
  min = 0,
  max = 99,
  step = 1,
  unit,
  disabled,
  readOnly,
  hint,
  error,
  optional,
  required,
  span,
  layout = "stacked",
}: QuantityFieldProps) {
  const id = useId();
  return (
    <div
      className={cx(
        "pt-quantity",
        `pt-quantity--${layout}`,
        span === "full" && "pt-span-full",
      )}
    >
      <div>
        <label htmlFor={id} className="pt-field-label">
          {label}
          {optional ? <span className="pt-caption"> (optional)</span> : null}
        </label>
        {hint && !error ? (
          <p id={`${id}-hint`} className="pt-caption">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} className="pt-field-error">
            {error}
          </p>
        ) : null}
      </div>
      <div className="pt-stepper">
        <IconButton
          icon="minus"
          aria-label={`Remove ${unit?.one ?? label}`}
          disabled={disabled || readOnly || value <= min}
          onClick={() =>
            onValueChange(Math.max(min, Number((value - step).toFixed(8))))
          }
        />
        <input
          id={id}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          type="number"
          aria-label={typeof label === "string" ? label : "Quantity"}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            if (e.target.value !== "") {
              const v = Number(e.target.value);
              if (Number.isFinite(v))
                onValueChange(Math.min(max, Math.max(min, v)));
            }
          }}
        />
        <IconButton
          icon="plus"
          aria-label={`Add ${unit?.one ?? label}`}
          disabled={disabled || readOnly || value >= max}
          onClick={() =>
            onValueChange(Math.min(max, Number((value + step).toFixed(8))))
          }
        />
      </div>
    </div>
  );
}
export interface PaxValue {
  adults: number;
  children: number;
  infants: number;
  childAges: (number | null)[];
  rooms?: number;
  extraBeds?: number;
}
export function paxTotal(value: PaxValue) {
  return value.adults + value.children + value.infants;
}
export function syncChildAges(ages: (number | null)[], count: number) {
  return Array.from({ length: Math.max(0, count) }, (_, i) => ages[i] ?? null);
}
export function paxSummary(value: PaxValue) {
  return `${value.adults} adult${value.adults === 1 ? "" : "s"}${value.children ? `, ${value.children} child${value.children === 1 ? "" : "ren"}` : ""}${value.infants ? `, ${value.infants} infant${value.infants === 1 ? "" : "s"}` : ""}`;
}
export interface PaxSelectorProps extends FieldOptions {
  value: PaxValue;
  onValueChange: (value: PaxValue) => void;
  maxTotal?: number;
  disabled?: boolean;
}
export function PaxSelector({
  value,
  onValueChange,
  maxTotal = 99,
  label,
  disabled,
  hint,
  error,
  optional,
  span,
}: PaxSelectorProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <Field {...{ label, hint, error, optional, span }} htmlFor={id}>
      <Pop.Root open={open} onOpenChange={setOpen}>
        <Pop.Trigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            className={cx(
              "pt-input-wrap",
              "pt-combo-trigger",
              error && "pt-invalid",
            )}
            aria-invalid={!!error || undefined}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
          >
            <Icon name="users" />
            <span>{paxSummary(value)}</span>
            <Icon name="chevron-down" />
          </button>
        </Pop.Trigger>
        <Pop.Portal>
          <Pop.Content
            data-theme={theme}
            className="pt-popover pt-pax"
            sideOffset={4}
            align="start"
          >
            <h3 className="pt-heading">Travelers</h3>
            {(["adults", "children", "infants"] as const).map((key) => (
              <QuantityField
                layout="inline"
                key={key}
                label={key[0].toUpperCase() + key.slice(1)}
                hint={
                  key === "adults"
                    ? "12 years and above"
                    : key === "children"
                      ? "2–11 years"
                      : "Under 2 years"
                }
                value={value[key]}
                min={key === "adults" ? 1 : 0}
                max={value[key] + Math.max(0, maxTotal - paxTotal(value))}
                onValueChange={(n) =>
                  onValueChange({
                    ...value,
                    [key]: n,
                    childAges:
                      key === "children"
                        ? syncChildAges(value.childAges, n)
                        : value.childAges,
                  })
                }
              />
            ))}
            {value.childAges.map((age, i) => (
              <SelectField
                key={i}
                label={`Child ${i + 1} age`}
                value={age === null ? "" : String(age)}
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: String(i + 2),
                  label: `${i + 2} years`,
                }))}
                onValueChange={(v) =>
                  onValueChange({
                    ...value,
                    childAges: value.childAges.map((a, j) =>
                      i === j ? Number(v) : a,
                    ),
                  })
                }
              />
            ))}
            <Button fullWidth variant="primary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </Pop.Content>
        </Pop.Portal>
      </Pop.Root>
    </Field>
  );
}
