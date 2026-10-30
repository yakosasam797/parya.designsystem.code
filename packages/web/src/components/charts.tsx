import {
  createContext,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button, Skeleton, cx } from "./primitives";
import { Icon, type IconName } from "./Icon";
import { EmptyState } from "./content";
const ChartContext = createContext({ label: "Chart", loading: false });
export interface ChartCardProps {
  title: string;
  description?: string;
  period?: ReactNode;
  actions?: ReactNode;
  value?: ReactNode;
  trend?: { value: number; goodWhen?: "up" | "down" };
  footer?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}
export function ChartCard({
  title,
  description,
  period,
  actions,
  value,
  trend,
  footer,
  loading = false,
  children,
}: ChartCardProps) {
  return (
    <section className="pt-chart-card" aria-label={title}>
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <div className="pt-chart-card-actions">
          {period}
          {actions}
        </div>
      </header>
      {value !== undefined ? (
        <div className="pt-chart-headline">
          <strong className="pt-mono">{loading ? <Skeleton /> : value}</strong>
          {trend && !loading ? (
            <span
              className={cx(
                "pt-chart-trend",
                trend.value !== 0 &&
                  (trend.value > 0 === (trend.goodWhen !== "down")
                    ? "pt-text--success"
                    : "pt-text--danger"),
              )}
            >
              <Icon
                name={trend.value < 0 ? "trending-down" : "trending-up"}
                size="sm"
              />
              {Math.abs(trend.value)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <ChartContext.Provider value={{ label: title, loading }}>
        <div className="pt-chart-content">{children}</div>
      </ChartContext.Provider>
      {footer ? <footer>{footer}</footer> : null}
    </section>
  );
}
export interface ChartSeries {
  id: string;
  label: string;
}
export interface ChartDatum {
  label: string;
  values: Record<string, number | null>;
  id?: string;
  icon?: IconName;
}
export interface CartesianChartProps {
  data: ChartDatum[];
  series: ChartSeries[];
  label?: string;
  height?: "sm" | "md" | "lg";
  format?: "number" | "money" | "percent";
  currency?: string;
  loading?: boolean;
  stacked?: boolean;
  maskValues?: boolean;
  onSelect?: (datum: ChartDatum) => void;
}
function chartValue(
  value: number | null | undefined,
  format: "number" | "money" | "percent",
  currency: string,
  compact = false,
) {
  if (value == null || !Number.isFinite(value)) return "—";
  return (
    new Intl.NumberFormat("en-IN", {
      notation: compact ? "compact" : "standard",
      style: format === "money" ? "currency" : "decimal",
      currency: format === "money" ? currency : undefined,
      maximumFractionDigits: format === "percent" ? 1 : 0,
    }).format(value) + (format === "percent" ? "%" : "")
  );
}
function DataDisclosure({
  data,
  series,
  format,
  currency,
  label,
}: {
  data: ChartDatum[];
  series: ChartSeries[];
  format: "number" | "money" | "percent";
  currency: string;
  label: string;
}) {
  return (
    <details className="pt-chart-data">
      <summary>View data table</summary>
      <div
        className="pt-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${label} data`}
      >
        <table>
          <caption className="pt-sr-only">{label}</caption>
          <thead>
            <tr>
              <th scope="col">Period or category</th>
              {series.map((s) => (
                <th scope="col" key={s.id}>
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((point, i) => (
              <tr key={point.id ?? i}>
                <th scope="row">{point.label}</th>
                {series.map((s) => (
                  <td key={s.id}>
                    {chartValue(point.values[s.id], format, currency)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
function CartesianChart({
  data,
  series: rawSeries,
  label: given,
  height = "md",
  format = "number",
  currency = "INR",
  loading,
  stacked = false,
  maskValues,
  onSelect,
  type,
  horizontal = false,
}: CartesianChartProps & {
  type: "area" | "line" | "bar";
  horizontal?: boolean;
}) {
  const context = useContext(ChartContext),
    label = given ?? context.label;
  const series = rawSeries.slice(0, 8),
    busy = loading ?? context.loading;
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const valid = data.some((point) =>
    series.some(
      (s) => point.values[s.id] != null && Number.isFinite(point.values[s.id]),
    ),
  );
  if (busy)
    return (
      <div
        role="status"
        aria-label={`Loading ${label}`}
        className={`pt-chart-loading pt-chart-height--${height}`}
      >
        <Skeleton lines={4} />
      </div>
    );
  if (!valid || !series.length)
    return (
      <EmptyState
        icon="chart"
        title="No chart data"
        description="Data will appear when this period has values."
      />
    );
  const values = data.flatMap((point) =>
    stacked
      ? [
          series.reduce(
            (sum, s) => sum + Math.max(0, point.values[s.id] ?? 0),
            0,
          ),
          series.reduce(
            (sum, s) => sum + Math.min(0, point.values[s.id] ?? 0),
            0,
          ),
        ]
      : series
          .map((s) => point.values[s.id])
          .filter((v): v is number => v != null && Number.isFinite(v)),
  );
  const max = Math.max(0, ...values),
    min = Math.min(0, ...values),
    span = max - min || 1;
  const width = 600,
    plotLeft = horizontal ? 130 : 60,
    plotWidth = width - plotLeft - 16,
    plotTop = 16,
    plotHeight = 190;
  const y = (value: number) => plotTop + ((max - value) / span) * plotHeight;
  const x = (index: number) =>
    plotLeft +
    (data.length === 1
      ? plotWidth / 2
      : (index / (data.length - 1)) * plotWidth);
  const barBand = (horizontal ? plotHeight : plotWidth) / data.length;
  const pointLabel = (point: ChartDatum) =>
    `${point.label}: ${series.map((s) => `${s.label} ${maskValues ? "Hidden" : chartValue(point.values[s.id], format, currency)}`).join(", ")}`;
  const focused =
    active !== null ? data[Math.min(active, data.length - 1)] : null;
  return (
    <div className={cx("pt-chart", `pt-chart-height--${height}`)}>
      <svg
        viewBox="0 0 600 240"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}. Use left and right arrow keys to inspect values${onSelect ? ", Enter to open" : ""}.`}
        aria-describedby={`${id}-readout`}
        tabIndex={0}
        onFocus={() => setActive(0)}
        onKeyDown={(event) => {
          if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            setActive(
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? data.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        data.length - 1,
                        (active ?? 0) + (event.key === "ArrowRight" ? 1 : -1),
                      ),
                    ),
            );
          }
          if (event.key === "Enter" && focused && onSelect) {
            event.preventDefault();
            onSelect(focused);
          }
        }}
        onPointerLeave={() => setActive(null)}
      >
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = min + (span * tick) / 4;
          return (
            <g key={tick}>
              <line
                x1={plotLeft}
                x2={width - 16}
                y1={y(value)}
                y2={y(value)}
                stroke="var(--pt-color-chart-grid)"
              />
              <text
                x={plotLeft - 8}
                y={y(value) + 4}
                textAnchor="end"
                className="pt-chart-axis"
              >
                {maskValues ? "•••" : chartValue(value, format, currency, true)}
              </text>
            </g>
          );
        })}
        {type !== "bar"
          ? series.map((s, si) => {
              let path = "";
              const segments: { x: number; y: number; base: number }[][] = [];
              let segment: { x: number; y: number; base: number }[] = [];
              for (let i = 0; i < data.length; i++) {
                const value = data[i].values[s.id];
                if (value == null || !Number.isFinite(value)) {
                  if (segment.length) segments.push(segment);
                  segment = [];
                  continue;
                }
                const base = stacked
                  ? series
                      .slice(0, si)
                      .reduce(
                        (sum, previous) =>
                          sum + (data[i].values[previous.id] ?? 0),
                        0,
                      )
                  : 0;
                const point = { x: x(i), y: y(value + base), base: y(base) };
                path += `${segment.length ? "L" : "M"}${point.x},${point.y}`;
                segment.push(point);
              }
              if (segment.length) segments.push(segment);
              return (
                <g key={s.id}>
                  {type === "area" && (si === 0 || stacked)
                    ? segments.map((points, i) => (
                        <path
                          key={i}
                          d={`${points.map((p, j) => `${j ? "L" : "M"}${p.x},${p.y}`).join(" ")} ${[
                            ...points,
                          ]
                            .reverse()
                            .map((p) => `L${p.x},${p.base}`)
                            .join(" ")}Z`}
                          fill={`var(--pt-color-chart-${si + 1})`}
                          opacity=".13"
                        />
                      ))
                    : null}
                  <path
                    d={path}
                    fill="none"
                    stroke={`var(--pt-color-chart-${si + 1})`}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })
          : data.map((point, index) =>
              series.map((s, si) => {
                const value = point.values[s.id];
                if (value == null || !Number.isFinite(value)) return null;
                const base = stacked
                  ? series
                      .slice(0, si)
                      .reduce(
                        (sum, prev) =>
                          sum +
                          ((point.values[prev.id] ?? 0) * value > 0
                            ? (point.values[prev.id] ?? 0)
                            : 0),
                        0,
                      )
                  : 0;
                const thickness =
                  (barBand - 10) / (stacked ? 1 : series.length);
                return horizontal ? (
                  <g key={`${index}-${s.id}`}>
                    <rect
                      x={
                        plotLeft +
                        ((Math.min(base, base + value) - min) / span) *
                          plotWidth
                      }
                      y={
                        plotTop +
                        index * barBand +
                        5 +
                        (stacked ? 0 : si * thickness)
                      }
                      width={(Math.abs(value) / span) * plotWidth}
                      height={Math.max(1, thickness - 2)}
                      rx="3"
                      fill={`var(--pt-color-chart-${si + 1})`}
                    />
                    <text
                      x={plotLeft - 8}
                      y={plotTop + index * barBand + barBand / 2 + 4}
                      textAnchor="end"
                      className="pt-chart-axis"
                    >
                      {point.label.slice(0, 18)}
                    </text>
                  </g>
                ) : (
                  <rect
                    key={`${index}-${s.id}`}
                    x={
                      plotLeft +
                      index * barBand +
                      5 +
                      (stacked ? 0 : si * thickness)
                    }
                    y={Math.min(y(base), y(base + value))}
                    width={Math.max(1, thickness - 2)}
                    height={Math.abs(y(base) - y(base + value))}
                    rx="3"
                    fill={`var(--pt-color-chart-${si + 1})`}
                  />
                );
              }),
            )}
        {!horizontal
          ? data.map((point, index) => (
              <g key={point.id ?? index}>
                {index === 0 ||
                index === data.length - 1 ||
                index % Math.max(1, Math.ceil(data.length / 6)) === 0 ? (
                  <text
                    className="pt-chart-axis"
                    textAnchor="middle"
                    x={
                      type === "bar"
                        ? plotLeft + (index + 0.5) * barBand
                        : x(index)
                    }
                    y="230"
                  >
                    {point.label.slice(0, 16)}
                  </text>
                ) : null}
                <rect
                  x={
                    type === "bar"
                      ? plotLeft + index * barBand
                      : x(index) - plotWidth / Math.max(1, data.length - 1) / 2
                  }
                  y={plotTop}
                  width={
                    type === "bar"
                      ? barBand
                      : plotWidth / Math.max(1, data.length - 1)
                  }
                  height={plotHeight}
                  fill="transparent"
                  onPointerEnter={() => setActive(index)}
                  onClick={() => onSelect?.(point)}
                />
              </g>
            ))
          : data.map((point, index) => (
              <rect
                key={point.id ?? index}
                x={plotLeft}
                y={plotTop + index * barBand}
                width={plotWidth}
                height={barBand}
                fill="transparent"
                onPointerEnter={() => setActive(index)}
                onClick={() => onSelect?.(point)}
              />
            ))}
        {active !== null && !horizontal ? (
          <line
            x1={
              type === "bar" ? plotLeft + (active + 0.5) * barBand : x(active)
            }
            x2={
              type === "bar" ? plotLeft + (active + 0.5) * barBand : x(active)
            }
            y1={plotTop}
            y2={plotTop + plotHeight}
            stroke="var(--pt-color-chart-crosshair)"
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        ) : null}
      </svg>
      <div className="pt-chart-readout" id={`${id}-readout`} aria-live="polite">
        {focused
          ? pointLabel(focused)
          : "Focus the chart or point at a period to inspect values."}
      </div>
      <ul className="pt-chart-legend" aria-label="Series">
        {series.map((s, i) => (
          <li key={s.id}>
            <span style={{ background: `var(--pt-color-chart-${i + 1})` }} />
            {s.label}
          </li>
        ))}
      </ul>
      {!maskValues ? (
        <DataDisclosure {...{ data, series, format, currency, label }} />
      ) : (
        <p className="pt-caption">Amounts hidden</p>
      )}
    </div>
  );
}
export function AreaChart(props: CartesianChartProps) {
  return <CartesianChart {...props} type="area" />;
}
export function LineChart(props: CartesianChartProps) {
  return <CartesianChart {...props} type="line" />;
}
export interface BarChartProps extends CartesianChartProps {
  orientation?: "vertical" | "horizontal";
}
export function BarChart({
  orientation = "vertical",
  ...props
}: BarChartProps) {
  return (
    <CartesianChart
      {...props}
      type="bar"
      horizontal={orientation === "horizontal"}
    />
  );
}
export interface BarListItem {
  id: string;
  label: string;
  value: number;
  secondary?: ReactNode;
  icon?: IconName;
}
export interface BarListProps {
  items: BarListItem[];
  label?: string;
  format?: "number" | "money" | "percent";
  currency?: string;
  onSelect?: (item: BarListItem) => void;
  maskValues?: boolean;
  loading?: boolean;
}
export function BarList({
  items,
  label: given,
  format = "number",
  currency = "INR",
  onSelect,
  maskValues,
  loading,
}: BarListProps) {
  const context = useContext(ChartContext),
    label = given ?? context.label;
  if (loading ?? context.loading)
    return (
      <div role="status" aria-label={`Loading ${label}`}>
        <Skeleton lines={4} />
      </div>
    );
  const max = Math.max(
    1,
    ...items.map((item) => (Number.isFinite(item.value) ? item.value : 0)),
  );
  return items.length ? (
    <ul className="pt-bar-list" aria-label={label}>
      {items.map((item) => {
        const content = (
          <>
            {item.icon ? <Icon name={item.icon} size="sm" /> : null}
            <span>
              <strong>{item.label}</strong>
              <span className="pt-bar-list-track">
                <span
                  style={{
                    width: `${Math.min(100, Math.max(0, (item.value / max) * 100))}%`,
                  }}
                />
              </span>
            </span>
            <span className="pt-mono">
              {maskValues
                ? "•••"
                : chartValue(item.value, format, currency, true)}
            </span>
            {!maskValues && item.secondary ? (
              <span className="pt-bar-list-secondary">{item.secondary}</span>
            ) : null}
          </>
        );
        return (
          <li key={item.id}>
            {onSelect ? (
              <button
                type="button"
                disabled={item.value === 0}
                aria-label={`${item.label}: ${maskValues ? "Hidden" : chartValue(item.value, format, currency)}`}
                onClick={() => onSelect(item)}
              >
                {content}
              </button>
            ) : (
              <div
                aria-label={`${item.label}: ${maskValues ? "Hidden" : chartValue(item.value, format, currency)}`}
              >
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  ) : (
    <EmptyState icon="chart" title="No data yet" />
  );
}
export interface DonutChartProps {
  items: BarListItem[];
  label?: string;
  format?: "number" | "money" | "percent";
  currency?: string;
  loading?: boolean;
  onSelect?: (item: BarListItem) => void;
  maskValues?: boolean;
}
export function DonutChart({
  items,
  label: given,
  format = "number",
  currency = "INR",
  loading,
  onSelect,
  maskValues,
}: DonutChartProps) {
  const context = useContext(ChartContext),
    label = given ?? context.label;
  const [active, setActive] = useState<string | null>(null);
  if (loading ?? context.loading)
    return (
      <div role="status" aria-label={`Loading ${label}`}>
        <Skeleton lines={4} />
      </div>
    );
  if (items.some((item) => item.value < 0 || !Number.isFinite(item.value)))
    return (
      <EmptyState
        icon="alert-circle"
        title="Invalid share values"
        description="A share chart needs finite, nonnegative values."
      />
    );
  const positive = items.filter((item) => item.value > 0),
    total = positive.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <EmptyState icon="chart" title="No data yet" />;
  const largest = new Set(
    [...positive]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((item) => item.id),
  );
  const visible = positive.filter((item) => largest.has(item.id)),
    rest = positive.filter((item) => !largest.has(item.id));
  if (rest.length)
    visible.push({
      id: "__other",
      label: "Other",
      value: rest.reduce((sum, item) => sum + item.value, 0),
    });
  const selected = visible.find((item) => item.id === active);
  let offset = 0;
  return (
    <div className="pt-donut" role="group" aria-label={label}>
      <div className="pt-donut-plot">
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label={`${label}: ${maskValues ? "amounts hidden" : chartValue(total, format, currency)}`}
        >
          <g transform="rotate(-90 100 100)">
            {visible.map((item, i) => {
              const fraction = item.value / total,
                start = offset;
              offset += fraction;
              return (
                <circle
                  key={item.id}
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke={
                    item.id === "__other"
                      ? "var(--pt-color-chart-other)"
                      : `var(--pt-color-chart-${i + 1})`
                  }
                  strokeWidth={selected?.id === item.id ? "29" : "26"}
                  pathLength="100"
                  strokeDasharray={`${Math.max(0.1, fraction * 100 - 0.6)} ${100 - Math.max(0.1, fraction * 100 - 0.6)}`}
                  strokeDashoffset={-start * 100}
                />
              );
            })}
          </g>
        </svg>
        <div className="pt-donut-total" aria-live="polite">
          <small>{selected?.label ?? "Total"}</small>
          <strong className="pt-mono">
            {maskValues
              ? "•••"
              : chartValue(selected?.value ?? total, format, currency, true)}
          </strong>
        </div>
      </div>
      <ul className="pt-donut-legend">
        {visible.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onFocus={() => setActive(item.id)}
              onPointerEnter={() => setActive(item.id)}
              onPointerLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              onClick={() => {
                if (item.id !== "__other") onSelect?.(item);
              }}
              aria-label={`${item.label}: ${maskValues ? "Hidden" : `${chartValue(item.value, format, currency)}, ${((item.value / total) * 100).toFixed(1)}%`}`}
            >
              <span
                style={{
                  background:
                    item.id === "__other"
                      ? "var(--pt-color-chart-other)"
                      : `var(--pt-color-chart-${i + 1})`,
                }}
              />
              <span>{item.label}</span>
              <strong className="pt-mono">
                {maskValues ? "•••" : chartValue(item.value, format, currency)}
              </strong>
              <small>
                {maskValues
                  ? ""
                  : `${((item.value / total) * 100).toFixed(1)}%`}
              </small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export interface SparklineProps {
  values: (number | null)[];
  label: string;
  size?: "sm" | "md";
  format?: "number" | "money" | "percent";
  currency?: string;
}
export function Sparkline({
  values,
  label,
  size = "md",
  format = "number",
  currency = "INR",
}: SparklineProps) {
  const valid = values.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (!valid.length) return <span className="pt-caption">No trend data</span>;
  const min = Math.min(...valid),
    span = Math.max(...valid) - min || 1;
  let path = "",
    segment = false;
  values.forEach((value, i) => {
    if (value === null || !Number.isFinite(value)) {
      segment = false;
      return;
    }
    path += `${segment ? "L" : "M"}${values.length === 1 ? 50 : (i / (values.length - 1)) * 100},${28 - ((value - min) / span) * 24}`;
    segment = true;
  });
  return (
    <svg
      className={cx("pt-sparkline", size === "sm" && "pt-sparkline--sm")}
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label}: ${chartValue(valid[0], format, currency)} to ${chartValue(valid[valid.length - 1], format, currency)}`}
    >
      <path
        d={path}
        stroke="var(--pt-color-chart-1)"
        strokeWidth="1.5"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
