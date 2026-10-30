import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon, type IconName } from "./Icon";
import { Avatar, Button, IconButton, Kbd, cx } from "./primitives";
import { Breadcrumbs, type BreadcrumbsProps } from "./navigation";
import { Menu, Popover, Toaster, type MenuItem } from "./overlays";
import { useControllableState } from "../hooks";
import { useTheme } from "../theme";
import logoTeal from "../assets/paryatech-logo-teal.svg";
import logoWhite from "../assets/paryatech-logo-white.svg";
import {
  AccountMenu,
  NotesStrip,
  CreditsMeter,
  ShellSidebarContext,
  type AccountMenuProps,
  type NotesStripProps,
  type CreditsMeterProps,
} from "./shell-sections";

export interface AppNavChild {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  badge?: number;
}
export interface AppNavItem extends AppNavChild {
  icon: IconName;
  children?: AppNavChild[];
}
export interface AppNavGroup {
  id: string;
  label?: string;
  items: AppNavItem[];
}
export interface SidebarProps {
  navGroups: AppNavGroup[];
  activeNavId: string;
  onNavigate: (id: string) => void;
  brand?: ReactNode;
  brandMark?: ReactNode;
  brandLabel?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  sidebarFooter?: ReactNode;
  notes?: Omit<NotesStripProps, "collapsed">;
  credits?: Omit<CreditsMeterProps, "collapsed">;
  openRecords?: ReactNode;
  workspaceMenu?: MenuItem[];
}
function Destination({
  item,
  active,
  rail = false,
  onNavigate,
}: {
  item: AppNavChild & { icon?: IconName };
  active: boolean;
  rail?: boolean;
  onNavigate: (id: string) => void;
}) {
  const props = {
    className: "pt-shell-nav-link",
    "aria-current": active ? ("page" as const) : undefined,
    "aria-label": rail ? item.label : undefined,
    title: rail ? item.label : undefined,
    onClick: () => onNavigate(item.id),
  };
  const content = (
    <>
      {item.icon ? (
        <span className="pt-shell-nav-icon">
          <Icon name={item.icon} size="nav" />
        </span>
      ) : null}
      <span className="pt-shell-nav-label">{item.label}</span>
      {item.badge !== undefined ? (
        <span className="pt-shell-nav-badge">{item.badge}</span>
      ) : null}
    </>
  );
  return item.href && !item.disabled ? (
    <a {...props} href={item.href}>
      {content}
    </a>
  ) : (
    <button {...props} type="button" disabled={item.disabled}>
      {content}
    </button>
  );
}
function NavGroupItem({
  item,
  activeNavId,
  collapsed,
  onNavigate,
}: {
  item: AppNavItem;
  activeNavId: string;
  collapsed: boolean;
  onNavigate: (id: string) => void;
}) {
  const childActive =
    item.children?.some((child) => child.id === activeNavId) ?? false;
  const [expanded, setExpanded] = useState(childActive);
  const id = useId();
  const [railOpen, setRailOpen] = useState(false);
  useEffect(() => {
    if (childActive) setExpanded(true);
  }, [childActive]);
  if (collapsed && item.children?.length)
    return (
      <Popover
        label={`${item.label} navigation`}
        open={railOpen}
        onOpenChange={setRailOpen}
        trigger={
          <button
            type="button"
            className="pt-shell-nav-link"
            data-active={item.id === activeNavId || childActive || undefined}
            aria-label={item.label}
            title={item.label}
            disabled={item.disabled}
          >
            <span className="pt-shell-nav-icon">
              <Icon name={item.icon} size="nav" />
            </span>
          </button>
        }
      >
        <nav className="pt-shell-rail-menu" aria-label={`${item.label} pages`}>
          {[item, ...item.children].map((child) => (
            <Destination
              key={child.id}
              item={child}
              active={child.id === activeNavId}
              onNavigate={(value) => {
                onNavigate(value);
                setRailOpen(false);
              }}
            />
          ))}
        </nav>
      </Popover>
    );
  return (
    <div className="pt-shell-nav-group-item">
      <div className="pt-shell-nav-row" data-active={childActive || undefined}>
        <Destination
          item={item}
          active={activeNavId === item.id}
          rail={collapsed}
          onNavigate={onNavigate}
        />
        {!collapsed && item.children?.length ? (
          <button
            type="button"
            className="pt-shell-disclosure"
            aria-label={`${expanded ? "Hide" : "Show"} ${item.label} pages`}
            aria-expanded={expanded}
            aria-controls={id}
            disabled={item.disabled}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size="sm" />
          </button>
        ) : null}
      </div>
      {!collapsed && item.children?.length && expanded ? (
        <div className="pt-shell-nav-children" id={id}>
          {item.children.map((child) => (
            <Destination
              key={child.id}
              item={child}
              active={activeNavId === child.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
export function Sidebar({
  navGroups,
  activeNavId,
  onNavigate,
  brand,
  brandMark,
  brandLabel = "Paryatech",
  collapsed = false,
  onCollapsedChange,
  sidebarFooter,
  notes,
  credits,
  openRecords,
  workspaceMenu,
}: SidebarProps) {
  const { theme } = useTheme();
  const logo = (
    <img
      src={theme === "dark" ? logoWhite : logoTeal}
      alt={brandLabel}
      width="150"
      height="32"
    />
  );
  return (
    <aside
      className="pt-shell-sidebar"
      data-collapsed={collapsed}
      aria-label="Application sidebar"
    >
      <div className="pt-shell-brand" aria-label={brandLabel}>
        {collapsed
          ? (brandMark ?? <span className="pt-shell-brand-mark">{logo}</span>)
          : (brand ?? logo)}
        {workspaceMenu?.length && !collapsed ? (
          <span className="pt-shell-workspace-switch">
            <Menu
              label="Workspaces"
              items={workspaceMenu}
              trigger={
                <IconButton
                  icon="chevron-down"
                  size="xs"
                  variant="ghost"
                  aria-label="Switch workspace"
                />
              }
            />
          </span>
        ) : null}
      </div>
      {notes ? (
        <div className="pt-shell-notes">
          <NotesStrip {...notes} collapsed={collapsed} />
        </div>
      ) : null}
      <nav className="pt-shell-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div className="pt-shell-nav-group" key={group.id}>
            {group.label && !collapsed ? (
              <p className="pt-shell-group-label">{group.label}</p>
            ) : null}
            {group.items.map((item) => (
              <NavGroupItem
                key={item.id}
                item={item}
                activeNavId={activeNavId}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
      {openRecords ? (
        <div className="pt-shell-records">
          <ShellSidebarContext.Provider value={collapsed}>
            {openRecords}
          </ShellSidebarContext.Provider>
        </div>
      ) : null}
      {credits ? (
        <div className="pt-shell-credits">
          <CreditsMeter {...credits} collapsed={collapsed} />
        </div>
      ) : null}
      <footer className="pt-shell-sidebar-footer">
        {!collapsed && sidebarFooter ? (
          <div className="pt-shell-sidebar-extra">{sidebarFooter}</div>
        ) : null}
        {onCollapsedChange ? (
          <button
            type="button"
            className="pt-shell-collapse"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            <Icon
              name={collapsed ? "chevrons-right" : "chevrons-left"}
              size="sm"
            />
            {!collapsed ? <span>Collapse sidebar</span> : null}
          </button>
        ) : null}
      </footer>
    </aside>
  );
}
export interface AppShellAccount extends AccountMenuProps {}
export interface AppShellNotifications {
  count?: number;
  panel?: ReactNode;
  onOpen?: () => void;
}
export interface TopbarProps {
  breadcrumbs?: BreadcrumbsProps["items"];
  onBack?: () => void;
  backLabel?: string;
  onSearch?: () => void;
  searchLabel?: string;
  onHelp?: () => void;
  notifications?: AppShellNotifications;
  account?: AppShellAccount;
  topbarActions?: ReactNode;
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
  navigationId?: string;
}
export function Topbar({
  breadcrumbs = [],
  onBack,
  backLabel = "Back",
  onSearch,
  searchLabel = "Search anything",
  onHelp,
  notifications,
  account,
  topbarActions,
  onMenuToggle,
  mobileMenuOpen,
  navigationId,
}: TopbarProps) {
  return (
    <header className="pt-shell-topbar">
      {onMenuToggle ? (
        <IconButton
          className="pt-shell-mobile-toggle"
          icon="menu"
          variant="ghost"
          aria-label="Open application navigation"
          aria-expanded={mobileMenuOpen}
          aria-controls={navigationId}
          onClick={onMenuToggle}
        />
      ) : null}
      {onBack ? (
        <IconButton
          icon="arrow-left"
          variant="ghost"
          aria-label={backLabel}
          title={backLabel}
          onClick={onBack}
        />
      ) : null}
      <div className="pt-shell-breadcrumbs">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="pt-shell-topbar-actions">
        {onSearch ? (
          <button
            className="pt-shell-search"
            type="button"
            aria-label={searchLabel}
            onClick={onSearch}
          >
            <Icon name="search" />
            <span>{searchLabel}</span>
            <Kbd>Ctrl/⌘ K</Kbd>
          </button>
        ) : null}
        {onHelp ? (
          <IconButton
            className="pt-shell-help"
            icon="help"
            aria-label="Help and support"
            onClick={onHelp}
          />
        ) : null}
        {notifications ? (
          notifications.onOpen ? (
            <button
              className="pt-shell-notifications"
              type="button"
              aria-label={`Notifications${notifications.count ? `, ${notifications.count} unread` : ""}`}
              onClick={notifications.onOpen}
            >
              <Icon name="bell" />
              {notifications.count ? (
                <span>
                  {notifications.count > 99 ? "99+" : notifications.count}
                </span>
              ) : null}
            </button>
          ) : (
            <Popover
              label="Application notifications"
              align="end"
              trigger={
                <button
                  className="pt-shell-notifications"
                  type="button"
                  aria-label={`Notifications${notifications.count ? `, ${notifications.count} unread` : ""}`}
                >
                  <Icon name="bell" />
                  {notifications.count ? (
                    <span>
                      {notifications.count > 99 ? "99+" : notifications.count}
                    </span>
                  ) : null}
                </button>
              }
            >
              <div className="pt-shell-notification-panel">
                {notifications.panel}
              </div>
            </Popover>
          )
        ) : null}
        {topbarActions}
        {account ? <AccountMenu {...account} /> : null}
      </div>
    </header>
  );
}
export interface AppShellProps
  extends
    SidebarProps,
    Omit<TopbarProps, "onMenuToggle" | "mobileMenuOpen" | "navigationId"> {
  children: ReactNode;
  defaultCollapsed?: boolean;
  height?: CSSProperties["height"];
  embedded?: boolean;
  contentLabel?: string;
  withToaster?: boolean;
  className?: string;
}
export function AppShell({
  children,
  navGroups,
  activeNavId,
  onNavigate,
  brand,
  brandMark,
  brandLabel,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  sidebarFooter,
  notes,
  credits,
  openRecords,
  workspaceMenu,
  height = "100dvh",
  embedded = false,
  contentLabel = "Workspace",
  withToaster = true,
  className,
  ...topbar
}: AppShellProps) {
  const [collapsed, setCollapsed] = useControllableState(
    controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const { theme } = useTheme();
  const onSearch = topbar.onSearch;
  useEffect(() => {
    if (embedded || !onSearch) return;
    const handler = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [embedded, onSearch]);
  const navigation = {
    navGroups,
    activeNavId,
    onNavigate,
    brand,
    brandMark,
    brandLabel,
    sidebarFooter,
    notes,
    credits,
    openRecords,
    workspaceMenu,
  };
  const Workspace = embedded ? "section" : "main";
  return (
    <div
      className={cx("pt-app-shell", className)}
      style={{ height }}
      ref={root}
      onKeyDown={(event) => {
        if (
          embedded &&
          onSearch &&
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          event.stopPropagation();
          onSearch();
        }
      }}
    >
      <a
        className="pt-shell-skip"
        href={`#${id}-content`}
        onClick={(event) => {
          event.preventDefault();
          root.current
            ?.querySelector<HTMLElement>(".pt-shell-content")
            ?.focus();
        }}
      >
        Skip to workspace
      </a>
      <div className="pt-shell-layout">
        <div className="pt-shell-desktop-sidebar">
          <Sidebar
            {...navigation}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          />
        </div>
        <div className="pt-shell-workspace">
          <Topbar
            {...topbar}
            onMenuToggle={() => setMobileOpen(true)}
            mobileMenuOpen={mobileOpen}
            navigationId={`${id}-navigation`}
          />
          <Workspace
            className="pt-shell-content"
            id={`${id}-content`}
            aria-label={contentLabel}
            tabIndex={-1}
          >
            {children}
          </Workspace>
        </div>
      </div>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="pt-shell-mobile-scrim"
            data-theme={theme}
          />
          <Dialog.Content
            className="pt-shell-mobile-panel"
            data-theme={theme}
            id={`${id}-navigation`}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              root.current
                ?.querySelector<HTMLButtonElement>(".pt-shell-mobile-toggle")
                ?.focus();
            }}
          >
            <Dialog.Title className="pt-sr-only">
              Application navigation
            </Dialog.Title>
            <Dialog.Description className="pt-sr-only">
              Choose a page in your workspace.
            </Dialog.Description>
            <Sidebar
              {...navigation}
              collapsed={false}
              onNavigate={(value) => {
                onNavigate(value);
                setMobileOpen(false);
              }}
            />
            <Dialog.Close asChild>
              <IconButton
                className="pt-shell-mobile-close"
                icon="x"
                variant="ghost"
                aria-label="Close application navigation"
              />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {withToaster ? <Toaster /> : null}
    </div>
  );
}
