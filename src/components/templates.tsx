import { useId, type FormEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./primitives";
export interface RecordPageTemplateProps {
  header: ReactNode;
  banner?: ReactNode;
  tabs?: ReactNode;
  contentLabel?: string;
  children: ReactNode;
}
export function RecordPageTemplate({
  header,
  banner,
  tabs,
  contentLabel = "Record content",
  children,
}: RecordPageTemplateProps) {
  return (
    <div className="pt-record-template">
      <div data-region="header">{header}</div>
      {banner ? <div data-region="banner">{banner}</div> : null}
      {tabs ? <div data-region="tabs">{tabs}</div> : null}
      <section data-region="content" aria-label={contentLabel}>
        {children}
      </section>
    </div>
  );
}
export interface RecordOverviewLayoutProps {
  summary?: ReactNode;
  main: ReactNode;
  rail?: ReactNode;
}
export function RecordOverviewLayout({
  summary,
  main,
  rail,
}: RecordOverviewLayoutProps) {
  return (
    <div className="pt-overview-template">
      {summary ? <div data-region="summary">{summary}</div> : null}
      <div className="pt-overview-columns">
        <div data-region="main">{main}</div>
        {rail ? (
          <aside data-region="rail" aria-label="Record supporting details">
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
export interface FormPageTemplateProps {
  header: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  formLabel?: string;
}
export function FormPageTemplate({
  header,
  banner,
  children,
  footer,
  onSubmit,
  formLabel = "Record form",
}: FormPageTemplateProps) {
  const content = (
    <>
      <div data-region="header">{header}</div>
      {banner ? <div data-region="banner">{banner}</div> : null}
      <div data-region="sections">{children}</div>
      <div data-region="footer">{footer}</div>
    </>
  );
  return onSubmit ? (
    <form
      className="pt-form-template"
      aria-label={formLabel}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event);
      }}
    >
      {content}
    </form>
  ) : (
    <div className="pt-form-template">{content}</div>
  );
}
export interface SettingsPageTemplateProps {
  header: ReactNode;
  nav: { id: string; label: string; icon?: IconName; description?: string }[];
  activeId: string;
  onNavigate: (id: string) => void;
  navLabel?: string;
  children: ReactNode;
  scrollMode?: "page" | "contained";
  divider?: boolean;
  toolbar?: ReactNode;
}
export function SettingsPageTemplate({
  header,
  nav,
  activeId,
  onNavigate,
  navLabel = "Settings sections",
  children,
  scrollMode = "page",
  divider,
  toolbar,
}: SettingsPageTemplateProps) {
  const id = useId();
  return (
    <div
      className={cx(
        "pt-settings-template",
        divider && "pt-settings-template--divider",
      )}
      data-scroll-mode={scrollMode}
    >
      <div data-region="header">{header}</div>
      {toolbar ? <div data-region="toolbar">{toolbar}</div> : null}
      <div className="pt-settings-columns">
        <nav data-region="nav" aria-label={navLabel}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={activeId === item.id ? "page" : undefined}
              aria-controls={`${id}-content`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon ? <Icon name={item.icon} /> : null}
              <span>
                <strong>{item.label}</strong>
                {item.description ? <small>{item.description}</small> : null}
              </span>
            </button>
          ))}
        </nav>
        <section
          data-region="content"
          id={`${id}-content`}
          aria-label={
            nav.find((item) => item.id === activeId)?.label ??
            "Settings content"
          }
        >
          {children}
        </section>
      </div>
    </div>
  );
}
export interface DashboardPageTemplateProps {
  header: ReactNode;
  kpis?: ReactNode;
  main: ReactNode;
  rail?: ReactNode;
}
export function DashboardPageTemplate({
  header,
  kpis,
  main,
  rail,
}: DashboardPageTemplateProps) {
  return (
    <div className="pt-dashboard-template">
      <div data-region="header">{header}</div>
      {kpis ? <div data-region="kpis">{kpis}</div> : null}
      <div className="pt-dashboard-columns">
        <div data-region="main">{main}</div>
        {rail ? (
          <aside data-region="rail" aria-label="Dashboard supporting details">
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
