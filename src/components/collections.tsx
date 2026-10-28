import type { ReactNode } from "react";
import * as Drop from "@radix-ui/react-dropdown-menu";
import {
  Button,
  Checkbox,
  CountBadge,
  IconButton,
  RadioGroup,
  Switch,
  cx,
} from "./primitives";
import { Icon } from "./Icon";
import { Popover } from "./overlays";
import type { FilterValue, SortState } from "./data";
import { useTheme } from "../theme";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
  disabled?: boolean;
}
export interface FilterGroup {
  id: string;
  label: string;
  mode?: "multiple" | "single" | "toggle";
  options: FilterOption[];
}
export interface FilterMenuProps {
  groups: FilterGroup[];
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
  compact?: boolean;
  disabled?: boolean;
  onClearAll?: () => void;
}
function activeOptions(group: FilterGroup, value: FilterValue) {
  return group.options.filter((option) =>
    value[group.id]?.includes(option.value),
  );
}
export function FilterMenu({
  groups,
  value,
  onValueChange,
  compact = false,
  disabled,
  onClearAll,
}: FilterMenuProps) {
  const count = groups.reduce(
    (total, group) => total + activeOptions(group, value).length,
    0,
  );
  const clear = () => {
    onValueChange({});
    onClearAll?.();
  };
  const change = (group: FilterGroup, next: string[]) =>
    onValueChange({ ...value, [group.id]: next });
  return (
    <Popover
      label="Filters"
      align="end"
      trigger={
        <Button
          variant={compact ? "secondary" : "brand"}
          size="md"
          disabled={disabled}
          aria-label={`Filters${count ? `, ${count} active` : ""}`}
          className={cx(
            "pt-filter-trigger",
            compact && "pt-filter-trigger--compact",
          )}
        >
          <Icon name="filter" size={compact ? "lg" : "md"} />
          {compact ? null : "Filters"}
          {count ? <CountBadge>{count}</CountBadge> : null}
        </Button>
      }
    >
      <div className="pt-filter-menu">
        <div className="pt-filter-menu-head">
          <strong>Filters</strong>
          <Button size="xs" variant="link" disabled={!count} onClick={clear}>
            Clear all
          </Button>
        </div>
        {groups.map((group) => (
          <fieldset className="pt-filter-group" key={group.id}>
            <legend>{group.label}</legend>
            {group.mode === "single" ? (
              <RadioGroup
                aria-label={group.label}
                value={value[group.id]?.[0] ?? ""}
                onValueChange={(next) => change(group, [next])}
                options={group.options.map((option) => ({
                  ...option,
                  label:
                    option.label +
                    (option.count === undefined ? "" : ` (${option.count})`),
                }))}
              />
            ) : (
              group.options.map((option) => {
                const Control = group.mode === "toggle" ? Switch : Checkbox;
                return (
                  <div className="pt-filter-option" key={option.value}>
                    <Control
                      checked={value[group.id]?.includes(option.value) ?? false}
                      onCheckedChange={(checked) =>
                        change(
                          group,
                          checked
                            ? [
                                ...new Set([
                                  ...(value[group.id] ?? []),
                                  option.value,
                                ]),
                              ]
                            : (value[group.id] ?? []).filter(
                                (v) => v !== option.value,
                              ),
                        )
                      }
                      label={option.label}
                      description={option.description}
                      disabled={option.disabled}
                    />
                    {option.count === undefined ? null : (
                      <span
                        className="pt-caption"
                        aria-label={`${option.count} matches`}
                      >
                        {option.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </fieldset>
        ))}
      </div>
    </Popover>
  );
}
export interface FilterChipsProps {
  groups: FilterGroup[];
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
  onClearAll?: () => void;
  maxVisible?: number;
}
export function FilterChips({
  groups,
  value,
  onValueChange,
  onClearAll,
  maxVisible = 2,
}: FilterChipsProps) {
  const active = groups
    .map((group) => ({ group, options: activeOptions(group, value) }))
    .filter((item) => item.options.length);
  if (!active.length) return null;
  const limit = Math.max(1, Math.floor(maxVisible) || 1);
  return (
    <div className="pt-filter-chips" role="group" aria-label="Applied filters">
      {active.map(({ group, options }) => {
        const labels = options.map((option) => option.label);
        const summary =
          labels.slice(0, limit).join(", ") +
          (labels.length > limit ? ` +${labels.length - limit}` : "");
        return (
          <button
            className="pt-filter-chip"
            type="button"
            key={group.id}
            aria-label={`Remove ${group.label} filter: ${labels.join(", ")}`}
            title={`${group.label}: ${labels.join(", ")}`}
            onClick={() => {
              const next = { ...value };
              delete next[group.id];
              onValueChange(next);
            }}
          >
            <span>
              <span className="pt-filter-chip-label">{group.label}: </span>
              {summary}
            </span>
            <Icon name="x" size="xs" />
          </button>
        );
      })}
      <Button
        variant="link"
        size="xs"
        onClick={() => {
          onValueChange({});
          onClearAll?.();
        }}
      >
        Clear all
      </Button>
    </div>
  );
}
export interface SortMenuProps {
  fields: { id: string; label: string; disabled?: boolean }[];
  value: SortState;
  onValueChange: (value: SortState) => void;
  compact?: boolean;
  disabled?: boolean;
  ascendingLabel?: string;
  descendingLabel?: string;
}
export function SortMenu({
  fields,
  value,
  onValueChange,
  compact = false,
  disabled,
  ascendingLabel = "Ascending",
  descendingLabel = "Descending",
}: SortMenuProps) {
  const { theme } = useTheme();
  const label =
    fields.find((field) => field.id === value.id)?.label ?? "Choose field";
  return (
    <Drop.Root>
      <Drop.Trigger asChild>
        {compact ? (
          <IconButton
            className="pt-sort-trigger"
            icon="arrow-up-down"
            size="md"
            aria-label={`Sort: ${label}, ${value.direction === "asc" ? ascendingLabel : descendingLabel}`}
            disabled={disabled}
          />
        ) : (
          <Button
            className="pt-sort-trigger"
            leadingIcon="arrow-up-down"
            size="md"
            disabled={disabled}
          >
            Sort: {label}
          </Button>
        )}
      </Drop.Trigger>
      <Drop.Portal>
        <Drop.Content
          className="pt-menu pt-sort-menu"
          data-theme={theme}
          sideOffset={6}
          align="end"
          aria-label="Sort records"
        >
          <Drop.Label className="pt-menu-label">Sort by</Drop.Label>
          <Drop.RadioGroup
            value={value.id}
            onValueChange={(id) => onValueChange({ ...value, id })}
          >
            {fields.map((field) => (
              <Drop.RadioItem
                className="pt-menu-item pt-sort-option"
                key={field.id}
                value={field.id}
                disabled={field.disabled}
                onSelect={(event) => event.preventDefault()}
              >
                <span className="pt-menu-indicator">
                  <Drop.ItemIndicator>
                    <Icon name="check" size="sm" />
                  </Drop.ItemIndicator>
                </span>
                {field.label}
              </Drop.RadioItem>
            ))}
          </Drop.RadioGroup>
          <Drop.Separator className="pt-menu-separator" />
          <Drop.Label className="pt-menu-label">Direction</Drop.Label>
          <Drop.RadioGroup
            value={value.direction}
            onValueChange={(direction) =>
              onValueChange({
                ...value,
                direction: direction as SortState["direction"],
              })
            }
          >
            {(
              [
                ["asc", ascendingLabel],
                ["desc", descendingLabel],
              ] as const
            ).map(([direction, text]) => (
              <Drop.RadioItem
                className="pt-menu-item pt-sort-option"
                key={direction}
                value={direction}
                onSelect={(event) => event.preventDefault()}
              >
                <span className="pt-menu-indicator">
                  <Drop.ItemIndicator>
                    <Icon name="check" size="sm" />
                  </Drop.ItemIndicator>
                </span>
                {text}
              </Drop.RadioItem>
            ))}
          </Drop.RadioGroup>
        </Drop.Content>
      </Drop.Portal>
    </Drop.Root>
  );
}
export interface ListToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  sort?: ReactNode;
  actions?: ReactNode;
  chips?: ReactNode;
  label?: string;
}
export function ListToolbar({
  search,
  filters,
  sort,
  actions,
  chips,
  label = "List controls",
}: ListToolbarProps) {
  return (
    <div className="pt-list-toolbar" role="group" aria-label={label}>
      <div className="pt-list-toolbar-row">
        <div className="pt-list-toolbar-search">{search}</div>
        <div className="pt-list-toolbar-actions">
          {filters}
          {sort}
          {actions}
        </div>
      </div>
      {chips ? <div className="pt-list-toolbar-chips">{chips}</div> : null}
    </div>
  );
}
export interface ListPageTemplateProps {
  header: ReactNode;
  tabs?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  bulkActions?: ReactNode;
  footer?: ReactNode;
}
export function ListPageTemplate({
  header,
  tabs,
  toolbar,
  children,
  bulkActions,
  footer,
}: ListPageTemplateProps) {
  return (
    <div className="pt-list-page">
      <div className="pt-list-page-header">{header}</div>
      {tabs}
      {toolbar}
      <div className="pt-list-page-content">{children}</div>
      {bulkActions}
      {footer}
    </div>
  );
}
