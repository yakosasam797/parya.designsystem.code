import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Pop from "@radix-ui/react-popover";
import * as Drop from "@radix-ui/react-dropdown-menu";
import { Button, IconButton, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";
import { useTheme } from "../theme";
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  trigger?: ReactNode;
  size?: "sm" | "md" | "lg";
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  size = "sm",
}: ModalProps) {
  const { theme } = useTheme();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="pt-scrim" data-theme={theme} />
        <Dialog.Content
          data-theme={theme}
          className={cx("pt-modal", `pt-modal--${size}`)}
          aria-describedby={description ? undefined : ""}
        >
          <header className="pt-modal-header">
            <div>
              <Dialog.Title className="pt-heading">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="pt-caption">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <IconButton icon="x" aria-label="Close dialog" variant="ghost" />
            </Dialog.Close>
          </header>
          <div className="pt-modal-body">{children}</div>
          {footer ? (
            <footer className="pt-modal-footer">{footer}</footer>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export interface ConfirmDialogProps extends Omit<
  ModalProps,
  "children" | "footer"
> {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
}
export function ConfirmDialog({
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  danger,
  ...props
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      {...props}
      onOpenChange={(v) => {
        if (!pending) props.onOpenChange(v);
      }}
      footer={
        <>
          <Button disabled={pending} onClick={() => props.onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={pending}
            onClick={async () => {
              setPending(true);
              setError("");
              try {
                await onConfirm();
                props.onOpenChange(false);
              } catch {
                setError("The action could not be completed. Try again.");
              } finally {
                setPending(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
      {error ? (
        <p role="alert" className="pt-field-error">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  label: string;
}
export function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  align = "start",
  label,
}: PopoverProps) {
  const { theme } = useTheme();
  return (
    <Pop.Root open={open} onOpenChange={onOpenChange}>
      <Pop.Trigger asChild>{trigger}</Pop.Trigger>
      <Pop.Portal>
        <Pop.Content
          data-theme={theme}
          className="pt-popover"
          align={align}
          aria-label={label}
          sideOffset={6}
        >
          {children}
        </Pop.Content>
      </Pop.Portal>
    </Pop.Root>
  );
}
export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void;
}
export interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  label: string;
}
export function Menu({ trigger, items, label }: MenuProps) {
  const { theme } = useTheme();
  return (
    <Drop.Root>
      <Drop.Trigger asChild>{trigger}</Drop.Trigger>
      <Drop.Portal>
        <Drop.Content
          data-theme={theme}
          className="pt-menu"
          sideOffset={6}
          aria-label={label}
        >
          {items.map((item) => (
            <Drop.Item
              className={cx("pt-menu-item", item.danger && "pt-text--danger")}
              disabled={item.disabled}
              onSelect={item.onSelect}
              key={item.id}
            >
              {item.icon ? <Icon name={item.icon} size="sm" /> : null}
              {item.label}
            </Drop.Item>
          ))}
        </Drop.Content>
      </Drop.Portal>
    </Drop.Root>
  );
}
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "danger" | "info";
  duration?: number;
}
const listeners = new Set<(message: ToastMessage) => void>();
let sequence = 0;
export function toast(
  title: string,
  options: Omit<ToastMessage, "id" | "title"> = {},
) {
  const message = { ...options, title, id: `toast-${++sequence}` };
  listeners.forEach((fn) => fn(message));
  return message.id;
}
function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage;
  onDismiss: () => void;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || message.duration === 0) return;
    const id = setTimeout(onDismiss, message.duration ?? 6000);
    return () => clearTimeout(id);
  }, [paused, message.duration, onDismiss]);
  return (
    <li
      className="pt-toast"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <Icon
        name={
          message.tone === "success"
            ? "check-circle"
            : message.tone === "danger"
              ? "alert-circle"
              : "info"
        }
      />
      <div role="status">
        <strong>{message.title}</strong>
        {message.description ? (
          <p className="pt-caption">{message.description}</p>
        ) : null}
      </div>
      <IconButton
        icon="x"
        aria-label={`Dismiss ${message.title}`}
        variant="ghost"
        onClick={onDismiss}
      />
    </li>
  );
}
export function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const { theme } = useTheme();
  useEffect(() => {
    const listener = (message: ToastMessage) =>
      setMessages((ms) => [...ms, message].slice(-5));
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return (
    <ol className="pt-toaster" data-theme={theme} aria-label="Notifications">
      {messages.map((message) => (
        <ToastItem
          message={message}
          key={message.id}
          onDismiss={() =>
            setMessages((ms) => ms.filter((m) => m.id !== message.id))
          }
        />
      ))}
    </ol>
  );
}
