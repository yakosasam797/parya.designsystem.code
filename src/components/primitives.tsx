import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type HTMLAttributes,
  type AnchorHTMLAttributes,
} from "react";
import * as Check from "@radix-ui/react-checkbox";
import * as Toggle from "@radix-ui/react-switch";
import * as Radio from "@radix-ui/react-radio-group";
import * as Tip from "@radix-ui/react-tooltip";
import { Icon, type IconName } from "./Icon";
import { useTheme } from "../theme";

export const cx = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "brand"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "danger"
    | "link";
  size?: "xs" | "sm" | "md";
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "sm",
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          "pt-button",
          `pt-button--${variant}`,
          `pt-button--${size}`,
          fullWidth && "pt-full",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Spinner label="Loading" />
        ) : leadingIcon ? (
          <Icon name={leadingIcon} size="sm" />
        ) : null}
        <span>{children}</span>
        {trailingIcon ? <Icon name={trailingIcon} size="sm" /> : null}
      </button>
    );
  },
);
export interface IconButtonProps extends Omit<
  ButtonProps,
  "children" | "leadingIcon" | "trailingIcon"
> {
  icon: IconName;
  "aria-label": string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        className={cx("pt-icon-button", props.className)}
      >
        <Icon name={icon} />
      </Button>
    );
  },
);
export interface SpinnerProps {
  label?: string;
}
export function Spinner({ label = "Loading" }: SpinnerProps) {
  return (
    <span className="pt-spinner" role="status">
      <span className="pt-sr-only">{label}</span>
    </span>
  );
}
export interface CheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
}
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id: given,
  name,
  ...props
}: CheckboxProps) {
  const uid = useId();
  const id = given ?? uid;
  return (
    <div className="pt-choice">
      <Check.Root
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        disabled={disabled}
        className="pt-checkbox"
        aria-describedby={description ? `${id}-description` : undefined}
        {...props}
      >
        <Check.Indicator>
          <Icon
            name={checked === "indeterminate" ? "minus" : "check"}
            size="sm"
          />
        </Check.Indicator>
      </Check.Root>
      {label || description ? (
        <div>
          <label htmlFor={id}>{label}</label>
          {description ? (
            <p id={`${id}-description`} className="pt-caption">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
}
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id: given,
  ...props
}: SwitchProps) {
  const uid = useId();
  const id = given ?? uid;
  return (
    <div className="pt-choice">
      <Toggle.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="pt-switch"
        aria-describedby={description ? `${id}-description` : undefined}
        {...props}
      >
        <Toggle.Thumb className="pt-switch-thumb" />
      </Toggle.Root>
      {label || description ? (
        <div>
          <label htmlFor={id}>{label}</label>
          {description ? (
            <p id={`${id}-description`} className="pt-caption">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
  orientation?: "vertical" | "horizontal";
  "aria-label": string;
  disabled?: boolean;
}
export function RadioGroup({
  options,
  orientation = "vertical",
  ...props
}: RadioGroupProps) {
  const id = useId();
  return (
    <Radio.Root
      {...props}
      orientation={orientation}
      className={cx(
        "pt-radio-group",
        orientation === "horizontal" && "pt-inline",
      )}
    >
      {options.map((o) => (
        <div key={o.value} className="pt-choice">
          <Radio.Item
            value={o.value}
            disabled={o.disabled}
            id={`${id}-${o.value}`}
            className="pt-radio"
          >
            <Radio.Indicator className="pt-radio-dot" />
          </Radio.Item>
          <div>
            <label htmlFor={`${id}-${o.value}`}>{o.label}</label>
            {o.description ? (
              <p className="pt-caption">{o.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </Radio.Root>
  );
}
export interface AvatarProps {
  name: string | null;
  src?: string;
  unassignedLabel?: string;
  size?: "xs" | "chip" | "sm" | "md" | "lg" | "xl";
  tone?: "person" | "work" | "warm" | "channel" | "neutral";
}
export function Avatar({
  name,
  src,
  unassignedLabel = "Unassigned",
  size = "sm",
  tone = "person",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const label = name || unassignedLabel;
  return (
    <span
      className={cx("pt-avatar", `pt-avatar--${size}`, `pt-tone--${tone}`)}
      aria-label={label}
      role="img"
    >
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        label
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      )}
    </span>
  );
}
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
export interface StatusChipProps {
  tone: StatusTone;
  dot?: boolean;
  size?: "sm" | "md";
  children: ReactNode;
}
export function StatusChip({
  tone,
  dot = true,
  size = "md",
  children,
}: StatusChipProps) {
  return (
    <span
      className={cx("pt-status", `pt-status--${tone}`, `pt-status--${size}`)}
    >
      {dot ? <span className="pt-status-dot" /> : null}
      {children}
    </span>
  );
}
type TagBase = {
  children: ReactNode;
  icon?: IconName;
  tone?: "neutral" | "work" | "person";
  size?: "sm" | "md";
  disabled?: boolean;
};
export type TagProps = TagBase &
  (
    | { onRemove: () => void; removeLabel: string }
    | { onRemove?: never; removeLabel?: never }
  );
export function Tag({
  children,
  icon,
  tone = "neutral",
  size = "md",
  onRemove,
  removeLabel,
  disabled,
}: TagProps) {
  return (
    <span
      className={cx(
        "pt-tag",
        `pt-tone--${tone}`,
        size === "sm" && "pt-tag--sm",
      )}
    >
      {icon ? <Icon name={icon} size="xs" /> : null}
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          disabled={disabled}
        >
          <Icon name="x" size="xs" />
        </button>
      ) : null}
    </span>
  );
}
export function CountBadge({ children }: { children: ReactNode }) {
  return <span className="pt-count">{children}</span>;
}
export function IdChip({ children }: { children: ReactNode }) {
  return <code className="pt-id-chip">{children}</code>;
}
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="pt-kbd">{children}</kbd>;
}
export function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <Tip.Provider delayDuration={250}>
      <Tip.Root>
        <Tip.Trigger asChild>{children}</Tip.Trigger>
        <Tip.Portal>
          <Tip.Content className="pt-tooltip" sideOffset={6} data-theme={theme}>
            {content}
            <Tip.Arrow />
          </Tip.Content>
        </Tip.Portal>
      </Tip.Root>
    </Tip.Provider>
  );
}
export function Skeleton({ lines = 1 }: { lines?: number }) {
  return (
    <span className="pt-skeleton-group" aria-hidden="true">
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <span className="pt-skeleton" key={i} />
      ))}
    </span>
  );
}
export interface MeterProps {
  value: number;
  max: number;
  tone?: "accent" | "primary" | "success" | "warning" | "danger";
  label: string;
  valueText?: string;
  size?: "sm" | "md";
}
export function Meter({
  value,
  max,
  label,
  valueText,
  tone = "accent",
  size = "sm",
}: MeterProps) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(safeMax, Math.max(0, value));
  return (
    <div className="pt-meter-wrap">
      <div className="pt-split">
        <span>{label}</span>
        <span className="pt-caption">
          {valueText ?? `${safeValue} / ${safeMax}`}
        </span>
      </div>
      <meter
        className={cx(
          "pt-meter",
          `pt-meter--${tone}`,
          size === "md" && "pt-meter--md",
        )}
        value={safeValue}
        max={safeMax}
        min={0}
        aria-label={label}
        aria-valuetext={valueText}
      />
    </div>
  );
}
export function TextLink({
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cx("pt-link", className)} {...props} />;
}
export function Divider() {
  return <hr className="pt-divider" />;
}
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: "1" | "2" | "3" | "4" | "6" | "8";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
}
export function Stack({
  direction = "column",
  gap = "4",
  align = "stretch",
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      {...props}
      className={cx(
        "pt-stack",
        `pt-stack--${direction}`,
        `pt-gap--${gap}`,
        `pt-align--${align}`,
        wrap && "pt-wrap",
        className,
      )}
    />
  );
}
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="pt-sr-only">{children}</span>;
}
const HeadingContext = createContext<1 | 2 | 3 | 4 | 5 | 6>(2);
export function HeadingLevelProvider({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}) {
  return (
    <HeadingContext.Provider value={level}>{children}</HeadingContext.Provider>
  );
}
export function Heading({ children }: { children: ReactNode }) {
  const level = useContext(HeadingContext);
  const Tag = `h${level}` as "h2";
  return <Tag className="pt-heading">{children}</Tag>;
}
