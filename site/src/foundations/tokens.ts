import tokenData from "../../../design/paper-tokens.json" with { type: "json" };
import guide from "../../../design/foundation-guidance.json" with { type: "json" };

export type PreviewTheme = "light" | "dark";
export const tokenMap = new Map(
  tokenData.tokens.map((token) => [token.name, String(token.value)]),
);
// Fluid expressions are restored in styles.css from Paper's typography specimens.
const fluidTitles: Record<string, string> = {
  "--pt-type-page-title-size": "clamp(20px, 0.7cqi + 18px, 24px)",
  "--pt-type-record-title-size": "clamp(18px, 0.8cqi + 16px, 22px)",
};
export function resolveToken(
  name: string,
  theme: PreviewTheme = "light",
  seen = new Set<string>(),
): string {
  const darkAlias = name.replace(/^--pt-color-/, "--pt-dark-color-");
  const key =
    theme === "dark" &&
    name.startsWith("--pt-color-") &&
    tokenMap.has(darkAlias)
      ? darkAlias
      : name;
  if (seen.has(key)) return name;
  const value = tokenMap.get(key) ?? fluidTitles[key] ?? name;
  const next = new Set(seen).add(key);
  return value.replace(/var\((--[\w-]+)\)/g, (_, reference: string) =>
    resolveToken(reference, theme, next),
  );
}
export function resolveExpression(
  value: string,
  theme: PreviewTheme = "light",
) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) =>
    resolveToken(name, theme),
  );
}
type Rgba = readonly [number, number, number, number];
export function parseColor(value: string): Rgba | null {
  if (/^#[0-9a-f]{3,8}$/i.test(value)) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((char) => char + char).join("");
    if (hex.length !== 6 && hex.length !== 8) return null;
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    ];
  }
  const rgb = value.match(/^rgba?\((.+)\)$/i);
  if (!rgb) return null;
  const parts = rgb[1]
    .replaceAll(",", " ")
    .replace("/", " ")
    .trim()
    .split(/\s+/);
  if (parts.length < 3 || parts.length > 4) return null;
  const channels = parts
    .slice(0, 3)
    .map((part) =>
      part.endsWith("%") ? (parseFloat(part) / 100) * 255 : parseFloat(part),
    );
  const alpha = parts[3]
    ? parseFloat(parts[3]) / (parts[3].endsWith("%") ? 100 : 1)
    : 1;
  if (
    ![...channels, alpha].every(Number.isFinite) ||
    channels.some((channel) => channel < 0 || channel > 255) ||
    alpha < 0 ||
    alpha > 1
  )
    return null;
  return [channels[0], channels[1], channels[2], alpha];
}
function over(foreground: Rgba, background: Rgba): Rgba {
  return [
    foreground[0] * foreground[3] + background[0] * (1 - foreground[3]),
    foreground[1] * foreground[3] + background[1] * (1 - foreground[3]),
    foreground[2] * foreground[3] + background[2] * (1 - foreground[3]),
    1,
  ];
}
function luminance(color: Rgba) {
  const linear = color.slice(0, 3).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
export function contrastRatio(
  foreground: string,
  background: string,
  canvas = "#ffffff",
): number | null {
  const fg = parseColor(foreground),
    bg = parseColor(background),
    surface = parseColor(canvas);
  if (!fg || !bg || !surface || surface[3] !== 1) return null;
  const opaqueBackground = over(bg, surface);
  const a = luminance(over(fg, opaqueBackground)),
    b = luminance(opaqueBackground);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function tokenContrast(
  foreground: string,
  background: string,
  theme: PreviewTheme,
) {
  return contrastRatio(
    resolveToken(foreground, theme),
    resolveToken(background, theme),
    resolveToken("--pt-color-bg-surface", theme),
  );
}
export function contrastChecks(ratio: number | null) {
  return {
    normal: ratio !== null && ratio >= 4.5,
    large: ratio !== null && ratio >= 3,
    nonText: ratio !== null && ratio >= 3,
  };
}
export function typeDetails(role: (typeof guide.typography)[number]) {
  const css = role.css as Record<string, string>;
  const size = resolveExpression(css.fontSize);
  return {
    family: resolveExpression(css.fontFamily).replaceAll('"', ""),
    size:
      role.id === "page-title"
        ? "20–24px, fluid"
        : role.id === "record-title"
          ? "18–22px, fluid"
          : size,
    weight: resolveExpression(css.fontWeight),
    lineHeight: resolveExpression(css.lineHeight),
    tracking: resolveExpression(css.letterSpacing),
  };
}
export function roleSnippet(
  role: (typeof guide.typography)[number],
  text = role.example,
) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");
  // Arbitrary edited text is not necessarily a date. Do not copy a false datetime.
  const tag = role.tag === "time" && text !== role.example ? "span" : role.tag;
  const attributes =
    tag === "label"
      ? ' htmlFor="traveler-name"'
      : tag === "button"
        ? ' type="button"'
        : tag === "time"
          ? ' dateTime="2026-12-12"'
          : tag === "th"
            ? ' scope="col"'
            : "";
  return `<${tag}${attributes} className="${role.className}">${escaped}</${tag}>`;
}
