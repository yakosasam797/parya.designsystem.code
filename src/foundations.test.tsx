import { describe, it, expect } from "vitest";
import {
  contrastChecks,
  contrastRatio,
  parseColor,
  resolveToken,
  roleSnippet,
  tokenContrast,
  typeDetails,
} from "../site/src/foundations/tokens";
import guide from "../design/foundation-guidance.json";

describe("foundation contrast calculations", () => {
  it("uses relative luminance, including alpha compositing", () => {
    expect(contrastRatio("#000", "#fff")).toBe(21);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(contrastRatio("rgb(0 0 0 / 50%)", "#fff")).toBeCloseTo(3.97665, 4);
    expect(contrastRatio("#00000080", "#fff")).toBeCloseTo(4.0041, 3);
    expect(parseColor("rgba(100%, 0%, 0%, 0.5)")).toEqual([255, 0, 0, 0.5]);
    expect(contrastRatio("color-mix(in srgb, red, blue)", "#fff")).toBeNull();
  });
  it("does not round failing ratios into a pass", () => {
    expect(contrastChecks(4.4999).normal).toBe(false);
    expect(contrastChecks(4.5).normal).toBe(true);
    expect(contrastChecks(2.9999).nonText).toBe(false);
    expect(contrastChecks(3).large).toBe(true);
    expect(contrastChecks(null)).toEqual({
      normal: false,
      large: false,
      nonText: false,
    });
  });
  it("resolves semantic dark aliases while preserving fixed palette values", () => {
    expect(resolveToken("--pt-color-text-primary", "light")).toBe("#16181D");
    expect(resolveToken("--pt-color-text-primary", "dark")).toBe("#EEF0F3");
    expect(resolveToken("--pt-color-bg-surface", "dark")).toBe("#1B1E24");
    expect(resolveToken("--pt-palette-teal-500", "dark")).toBe(
      resolveToken("--pt-palette-teal-500", "light"),
    );
    expect(resolveToken("--pt-dark-color-text-primary", "light")).toBe(
      "#EEF0F3",
    );
  });
  it("keeps the suggested text pairings legible in both themes", () => {
    for (const pair of guide.colorPairs)
      for (const theme of ["light", "dark"] as const) {
        expect(
          tokenContrast(pair.foreground, pair.background, theme),
          `${pair.id} / ${theme}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    expect(
      contrastChecks(
        tokenContrast(
          "--pt-color-text-disabled",
          "--pt-color-bg-surface",
          "light",
        ),
      ).normal,
    ).toBe(false);
  });
});
describe("typography guidance", () => {
  it("reports the exact Paper role values instead of inventing a display scale", () => {
    expect(
      typeDetails(guide.typography.find((role) => role.id === "page-title")!),
    ).toMatchObject({
      family: "Onest",
      size: "20–24px, fluid",
      weight: "700",
      lineHeight: "125%",
    });
    expect(
      typeDetails(guide.typography.find((role) => role.id === "body")!),
    ).toMatchObject({
      family: "Public Sans",
      size: "14px",
      weight: "400",
      lineHeight: "150%",
    });
  });
  it("provides semantic HTML and safely escapes editable preview text", () => {
    const date = guide.typography.find((role) => role.id === "mono-date")!;
    expect(roleSnippet(date)).toContain('dateTime="2026-12-12"');
    expect(roleSnippet(date, "A different date")).toBe(
      '<span className="pt-type-mono-date">A different date</span>',
    );
    const body = guide.typography.find((role) => role.id === "body")!;
    const code = roleSnippet(body, "<script>{oops}&");
    expect(code).toContain("&lt;script&gt;&#123;oops&#125;&amp;");
    expect(code).not.toContain("<script>");
    expect(
      roleSnippet(guide.typography.find((role) => role.id === "table-head")!),
    ).toContain('scope="col"');
  });
});
