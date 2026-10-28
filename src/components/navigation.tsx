import * as Tabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { Button, CountBadge, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";
export interface TabItem {
  value: string;
  label: string;
  icon?: IconName;
  count?: number;
  disabled?: boolean;
  content?: ReactNode;
}
export interface TabBarProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  variant?: "primary" | "secondary";
  showZeroCounts?: boolean;
}
export function TabBar({
  items,
  value,
  onValueChange,
  variant = "primary",
  showZeroCounts = false,
  ...props
}: TabBarProps) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List {...props} className={cx("pt-tabs", `pt-tabs--${variant}`)}>
        {items.map((item) => (
          <Tabs.Trigger
            className="pt-tab"
            value={item.value}
            key={item.value}
            disabled={item.disabled}
          >
            {item.icon ? <Icon name={item.icon} size="sm" /> : null}
            {item.label}
            {item.count !== undefined && (item.count > 0 || showZeroCounts) ? (
              <CountBadge>{item.count}</CountBadge>
            ) : null}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content
          value={item.value}
          key={item.value}
          className="pt-tab-content"
        >
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
export interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="pt-breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {i > 0 ? <Icon name="chevron-right" size="xs" /> : null}
            {item.href && i < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function BackButton({
  children = "Back",
  onClick,
}: {
  children?: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button leadingIcon="arrow-left" variant="ghost" onClick={onClick}>
      {children}
    </Button>
  );
}
export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}
export function Pagination({
  page,
  pageCount,
  onPageChange,
  disabled,
}: PaginationProps) {
  const count = Math.max(1, pageCount);
  return (
    <nav aria-label="Pagination" className="pt-inline">
      <Button
        leadingIcon="chevron-left"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="pt-caption" aria-live="polite">
        Page {page} of {count}
      </span>
      <Button
        trailingIcon="chevron-right"
        disabled={disabled || page >= count}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
