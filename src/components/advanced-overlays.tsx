import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "../theme";
import { useControllableState } from "../hooks";
import { Button, IconButton, Kbd, Skeleton, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  mode?: "modal" | "nonmodal";
  size?: "sm" | "md";
  children: ReactNode;
}
export function Drawer({
  open,
  onOpenChange,
  label,
  mode = "modal",
  size = "sm",
  children,
}: DrawerProps) {
  const { theme } = useTheme();
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={mode === "modal"}
    >
      <Dialog.Portal>
        {mode === "modal" ? (
          <Dialog.Overlay className="pt-scrim" data-theme={theme} />
        ) : null}
        <Dialog.Content
          className={cx("pt-drawer", `pt-drawer--${size}`)}
          data-theme={theme}
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          }}
          onCloseAutoFocus={(event) => {
            if (returnFocus.current?.isConnected) {
              event.preventDefault();
              returnFocus.current.focus();
            }
          }}
          onInteractOutside={(event) => {
            if (mode === "nonmodal") event.preventDefault();
          }}
        >
          <Dialog.Title className="pt-sr-only">{label}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md";
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
}
/** Compatibility surface; use full pages for new long record forms. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  size = "sm",
  children,
  footer,
  onSubmit,
  busy,
}: SheetProps) {
  const { theme } = useTheme();
  const content = (
    <>
      <header className="pt-section-heading">
        <div>
          <Dialog.Title>{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="pt-caption">
              {description}
            </Dialog.Description>
          ) : null}
        </div>
        <IconButton
          icon="x"
          aria-label="Close panel"
          disabled={busy}
          onClick={() => onOpenChange(false)}
        />
      </header>
      <div className="pt-sheet-body">{children}</div>
      {footer ? <footer className="pt-sheet-footer">{footer}</footer> : null}
    </>
  );
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="pt-scrim" data-theme={theme} />
        <Dialog.Content
          className={cx("pt-sheet", `pt-sheet--${size}`)}
          data-theme={theme}
          aria-describedby={description ? undefined : undefined}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          {onSubmit ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) onSubmit(event);
              }}
              aria-busy={busy || undefined}
            >
              {content}
            </form>
          ) : (
            content
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: IconName;
  code?: string;
  shortcut?: string;
  hint?: string;
  disabled?: boolean;
  onSelect: () => void;
  onSelectAlt?: () => void;
}
export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  filter?: boolean;
  scopes?: { value: string; label: string }[];
  scope?: string;
  onScopeChange?: (scope: string) => void;
  renderPreview?: (item: CommandItem) => ReactNode;
  loading?: boolean;
}
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Search anything",
  query: controlled,
  onQueryChange,
  filter = true,
  scopes,
  scope,
  onScopeChange,
  renderPreview,
  loading,
}: CommandPaletteProps) {
  const [query, setQuery] = useControllableState(controlled, "", onQueryChange);
  const [active, setActive] = useState<string | null>(null);
  const { theme } = useTheme();
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !filter ||
          terms.every((term) =>
            `${item.label} ${item.description ?? ""} ${item.code ?? ""} ${(item.keywords ?? []).join(" ")}`
              .toLowerCase()
              .includes(term),
          ),
      ),
    }))
    .filter((group) => group.items.length);
  const items = visible
    .flatMap((group) => group.items)
    .filter((item) => !item.disabled);
  const selected = items.find((item) => item.id === active) ?? items[0];
  const select = (item: CommandItem, alternate = false) => {
    if (item.disabled || loading) return;
    onOpenChange(false);
    if (alternate && item.onSelectAlt) item.onSelectAlt();
    else item.onSelect();
  };
  useEffect(() => {
    if (open && selected)
      document
        .getElementById(`${id}-${selected.id}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, id, selected?.id]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="pt-scrim" data-theme={theme} />
        <Dialog.Content
          className="pt-command"
          data-theme={theme}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus();
          }}
        >
          <Dialog.Title className="pt-sr-only">Search workspace</Dialog.Title>
          <div className="pt-command-search">
            <Icon name="search" />
            <input
              ref={input}
              role="combobox"
              aria-label={placeholder}
              aria-autocomplete="list"
              aria-expanded={true}
              aria-controls={`${id}-list`}
              aria-activedescendant={
                !loading && selected ? `${id}-${selected.id}` : undefined
              }
              placeholder={placeholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(null);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "ArrowDown" ||
                  event.key === "ArrowUp" ||
                  event.key === "Home" ||
                  event.key === "End"
                ) {
                  event.preventDefault();
                  const index = items.findIndex(
                    (item) => item.id === selected?.id,
                  );
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? items.length - 1
                        : (index +
                            (event.key === "ArrowDown" ? 1 : -1) +
                            items.length) %
                          items.length;
                  setActive(items[next]?.id ?? null);
                }
                if (event.key === "Enter" && selected) {
                  event.preventDefault();
                  select(selected, event.ctrlKey || event.metaKey);
                }
                if (event.key === "Tab" && scopes?.length && onScopeChange) {
                  event.preventDefault();
                  const index = scopes.findIndex(
                    (item) => item.value === scope,
                  );
                  onScopeChange(
                    scopes[
                      (index + (event.shiftKey ? -1 : 1) + scopes.length) %
                        scopes.length
                    ].value,
                  );
                  setActive(null);
                }
              }}
            />
            <IconButton
              icon="x"
              variant="ghost"
              aria-label="Close search"
              onClick={() => onOpenChange(false)}
            />
          </div>
          {scopes?.length ? (
            <div className="pt-command-scopes" aria-label="Search scope">
              {scopes.map((item) => (
                <Button
                  key={item.value}
                  size="xs"
                  aria-pressed={item.value === scope}
                  disabled={!onScopeChange}
                  onClick={() => {
                    onScopeChange?.(item.value);
                    setActive(null);
                    input.current?.focus();
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="pt-command-layout">
            <div
              role="listbox"
              aria-label="Search results"
              id={`${id}-list`}
              className="pt-command-results"
              aria-busy={loading || undefined}
            >
              {loading ? (
                <div role="status" aria-label="Searching">
                  <Skeleton lines={4} />
                </div>
              ) : visible.length ? (
                visible.map((group) => (
                  <div
                    role="group"
                    aria-labelledby={`${id}-group-${group.id}`}
                    key={group.id}
                  >
                    <div
                      className="pt-command-group"
                      id={`${id}-group-${group.id}`}
                    >
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        id={`${id}-${item.id}`}
                        role="option"
                        aria-disabled={item.disabled || undefined}
                        aria-selected={selected?.id === item.id}
                        className="pt-command-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onPointerMove={() => {
                          if (!item.disabled) setActive(item.id);
                        }}
                        onClick={() => select(item)}
                      >
                        {item.icon ? (
                          <span className="pt-command-icon">
                            <Icon name={item.icon} />
                          </span>
                        ) : null}
                        <span>
                          <strong>{item.label}</strong>
                          {item.description ? (
                            <small>{item.description}</small>
                          ) : null}
                        </span>
                        {item.code ? (
                          <span className="pt-mono">{item.code}</span>
                        ) : null}
                        {item.shortcut ? <Kbd>{item.shortcut}</Kbd> : null}
                        {selected?.id === item.id ? (
                          <small>{item.hint ?? "Open"}</small>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="pt-section-empty">
                  No matching pages or records.
                </p>
              )}
            </div>
            {renderPreview && selected && !loading ? (
              <aside
                className="pt-command-preview"
                aria-label={`Preview of ${selected.label}`}
              >
                {renderPreview(selected)}
              </aside>
            ) : null}
          </div>
          <footer>
            <span>
              <Kbd>↑↓</Kbd> Move
            </span>
            <span>
              <Kbd>Enter</Kbd> Open
            </span>
            <span>
              <Kbd>Esc</Kbd> Close
            </span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
