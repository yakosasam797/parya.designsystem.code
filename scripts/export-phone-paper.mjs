import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch();
const tokenData = JSON.parse(
  await readFile("design/paper-tokens.json", "utf8"),
);
await mkdir("artifacts/paper-phone", { recursive: true });
const cases = [
  {
    id: "shell",
    name: "AppShell · Home",
    path: "/#/examples/app-shell",
    selector: ".pt-app-shell",
  },
  {
    id: "navigation",
    name: "AppShell · Navigation open",
    path: "/#/examples/app-shell",
    action: "navigation",
    selector: "body",
  },
  {
    id: "records",
    name: "OpenRecordsSwitcher · Record list",
    path: "/#/examples/app-shell",
    action: "records",
    selector: "body",
  },
  {
    id: "notifications",
    name: "NotificationsDrawer · Unread",
    path: "/#/examples/app-shell",
    action: "notifications",
    selector: "body",
  },
  {
    id: "table",
    name: "DataTable · Record cards",
    path: "/#/preview/DataTable",
    selector: ".ds-standalone-preview",
  },
  {
    id: "board",
    name: "KanbanBoard · Stage navigation",
    path: "/#/preview/KanbanBoard",
    selector: ".pt-board",
  },
  {
    id: "agenda",
    name: "Agenda · Week navigation",
    path: "/#/preview/Agenda",
    selector: ".pt-agenda",
  },
  {
    id: "record",
    name: "RecordOverviewLayout · Stacked details",
    path: "/#/preview/RecordPageTemplate",
    selector: ".pt-record-template",
  },
  {
    id: "dashboard",
    name: "DashboardPageTemplate · Stacked panels",
    path: "/#/preview/DashboardPageTemplate",
    selector: ".pt-dashboard-template",
  },
  {
    id: "form",
    name: "FormPageTemplate · Single column",
    path: "/#/preview/FormPageTemplate",
    selector: ".pt-form-template",
  },
  {
    id: "settings",
    name: "SettingsPageTemplate · Horizontal sections",
    path: "/#/preview/SettingsPageTemplate",
    selector: ".pt-settings-template",
  },
];
const index = [];
try {
  for (const theme of ["light", "dark"])
    for (const item of cases.filter(
      (item) =>
        process.argv.length < 3 || process.argv.slice(2).includes(item.id),
    )) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (theme) => localStorage.setItem("parya-theme", theme),
        theme,
      );
      const page = await context.newPage();
      await page.goto(
        "http://127.0.0.1:5190" +
          item.path +
          (item.path.includes("/preview/") ? "?theme=" + theme : ""),
      );
      await page.waitForSelector(
        item.selector === "body" ? ".pt-app-shell" : item.selector,
      );
      await page.evaluate(() => document.fonts.ready);
      if (item.action === "navigation")
        await page
          .getByRole("button", {
            name: "Open application navigation",
            exact: true,
          })
          .click();
      if (item.action === "records")
        await page.getByRole("button", { name: /^Open records,/ }).click();
      if (item.action === "notifications")
        await page.getByRole("button", { name: /^Notifications/ }).click();
      if (item.action) await page.getByRole("dialog").waitFor();
      if (!item.action)
        await page.locator(item.selector).scrollIntoViewIfNeeded();
      const capture = await page.evaluate(
        async ({ selector, theme, tokens, action }) => {
          const escape = (s) =>
            String(s)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
          const root = document.querySelector(selector),
            rect = root.getBoundingClientRect();
          const origin = action
            ? { x: 0, y: 0 }
            : selector === ".pt-app-shell" ||
                selector === ".ds-standalone-preview"
              ? { x: 0, y: 0 }
              : { x: rect.left - 16, y: rect.top - 16 };
          const top =
            document.querySelector(".pt-theme") ?? document.documentElement;
          const vars = getComputedStyle(top);
          const colorTokens = tokens.filter(
            (t) =>
              t.type === "color" &&
              !t.name.includes("palette") &&
              (theme === "dark"
                ? t.name.startsWith("--pt-dark-")
                : !t.name.startsWith("--pt-dark-")),
          );
          if (theme === "dark")
            colorTokens.push(
              ...tokens.filter(
                (t) =>
                  t.type === "color" &&
                  !t.name.includes("palette") &&
                  !t.name.startsWith("--pt-dark-") &&
                  !tokens.some(
                    (d) => d.name === t.name.replace("--pt-", "--pt-dark-"),
                  ),
              ),
            );
          const probe = document.createElement("i");
          document.body.append(probe);
          const resolved = colorTokens.map((t) => {
            let n = t.name;
            if (n.startsWith("--pt-dark-"))
              n = n.replace("--pt-dark-", "--pt-");
            probe.style.color = vars.getPropertyValue(n) || t.value;
            return { name: t.name, color: getComputedStyle(probe).color };
          });
          probe.remove();
          const token = (value, property) => {
            const hints =
              property === "backgroundColor"
                ? ["-bg-", "-action-", "-status-", "-tone-"]
                : property === "color"
                  ? ["-text-", "-status-", "-tone-"]
                  : ["-border-"];
            const rank = (t) => {
              const i = hints.findIndex((h) => t.name.includes(h));
              return i < 0 ? 999 : i;
            };
            const match = resolved
              .filter((t) => t.color === value)
              .sort((a, b) => rank(a) - rank(b))[0];
            return match ? "var(" + match.name + ")" : value;
          };
          const css = (el, box, abs = true) => {
            const s = getComputedStyle(el);
            const out = {
              display: "block",
              position: abs ? "absolute" : "relative",
              left: abs ? box.x - origin.x + "px" : undefined,
              top: abs ? box.y - origin.y + "px" : undefined,
              width: box.width + "px",
              height: box.height + "px",
              boxSizing: "border-box",
              margin: "0",
              color: token(s.color, "color"),
              fontFamily: s.fontFamily.includes("Onest")
                ? "Onest"
                : s.fontFamily.includes("JetBrains")
                  ? "JetBrains Mono"
                  : "Public Sans",
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              lineHeight: s.lineHeight,
              letterSpacing: s.letterSpacing,
              textAlign: s.textAlign,
              whiteSpace: s.whiteSpace === "nowrap" ? "nowrap" : "normal",
              overflowWrap: s.overflowWrap,
            };
            if (s.backgroundColor !== "rgba(0, 0, 0, 0)")
              out.backgroundColor = token(s.backgroundColor, "backgroundColor");
            for (const side of ["Top", "Right", "Bottom", "Left"])
              if (parseFloat(s["border" + side + "Width"]) > 0) {
                out["border" + side + "Width"] = s["border" + side + "Width"];
                out["border" + side + "Style"] = s["border" + side + "Style"];
                out["border" + side + "Color"] = token(
                  s["border" + side + "Color"],
                  "borderColor",
                );
              }
            out.borderRadius = s.borderRadius;
            if (el.matches(".pt-shell-topbar")) {
              out.borderTopLeftRadius = "16px";
              out.borderTopRightRadius = "16px";
            }
            if (s.boxShadow !== "none") out.boxShadow = s.boxShadow;
            if (s.opacity !== "1") out.opacity = s.opacity;
            if (
              [s.overflowX, s.overflowY].some((value) =>
                ["hidden", "clip", "auto", "scroll"].includes(value),
              )
            )
              out.overflow = "hidden";
            return out;
          };
          const style = (o) =>
            Object.entries(o)
              .filter(([, v]) => v !== undefined)
              .map(
                ([k, v]) =>
                  k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) +
                  ":" +
                  escape(v),
              )
              .join(";");
          const visible = (el) => {
            const s = getComputedStyle(el),
              r = el.getBoundingClientRect();
            return (
              s.display !== "none" &&
              s.visibility !== "hidden" &&
              r.width > 1 &&
              r.height > 1 &&
              r.right > origin.x &&
              r.left < origin.x + 390 &&
              r.bottom > origin.y &&
              r.top < origin.y + 844 &&
              !el.matches(".pt-sr-only,.ds-skip,script,style,pre")
            );
          };
          const svg = (el) => {
            const clone = el.cloneNode(true),
              s = getComputedStyle(el);
            clone.setAttribute("color", token(s.color, "color"));
            if (clone.getAttribute("stroke") === "currentColor")
              clone.setAttribute("stroke", token(s.color, "color"));
            for (const node of clone.querySelectorAll("*"))
              for (const attribute of ["stroke", "fill"])
                if (node.getAttribute(attribute) === "currentColor")
                  node.setAttribute(attribute, token(s.color, "color"));
            clone.setAttribute(
              "style",
              "display:block;width:100%;height:100%;color:" +
                token(s.color, "color"),
            );
            return clone.outerHTML;
          };
          const serialize = async (el, parentRect) => {
            if (getComputedStyle(el).display === "contents")
              return (
                await Promise.all(
                  [...el.children].map((child) => serialize(child, parentRect)),
                )
              ).join("");
            if (!visible(el)) return "";
            const r = el.getBoundingClientRect(),
              s = getComputedStyle(el);
            const b = {
              x: r.left - parentRect.left + origin.x,
              y: r.top - parentRect.top + origin.y,
              width: r.width,
              height: r.height,
            };
            const st = css(el, b);
            if (el.tagName.toLowerCase() === "svg")
              return '<div style="' + style(st) + '">' + svg(el) + "</div>";
            if (el.tagName === "IMG") {
              const text = await (await fetch(el.src)).text();
              if (text.trim().startsWith("<svg") || text.includes("<svg")) {
                const imported = new DOMParser().parseFromString(
                  text,
                  "image/svg+xml",
                ).documentElement;
                imported.setAttribute("width", "100%");
                imported.setAttribute("height", "100%");
                imported.setAttribute(
                  "style",
                  "display:block;width:100%;height:100%",
                );
                return (
                  '<div style="' +
                  style(st) +
                  '">' +
                  imported.outerHTML +
                  "</div>"
                );
              }
              return "";
            }
            if (
              el.tagName === "INPUT" ||
              el.tagName === "TEXTAREA" ||
              el.tagName === "SELECT"
            ) {
              let value =
                el.tagName === "SELECT"
                  ? el.selectedOptions[0]?.textContent
                  : el.value || el.placeholder;
              return (
                '<div style="' +
                style({
                  ...st,
                  padding: s.padding,
                  display: "flex",
                  alignItems: "center",
                  color: token(
                    el.value
                      ? s.color
                      : vars.getPropertyValue("--pt-color-text-muted"),
                    "color",
                  ),
                }) +
                '">' +
                escape(value ?? "") +
                "</div>"
              );
            }
            let content = "";
            for (const node of el.childNodes) {
              if (node.nodeType === Node.ELEMENT_NODE)
                content += await serialize(node, r);
              else if (
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim()
              ) {
                const text = node.textContent;
                const range = document.createRange();
                range.selectNodeContents(node);
                const rb = range.getBoundingClientRect();
                if (rb.width > 0 && rb.height > 0)
                  content +=
                    '<div style="' +
                    style({
                      position: "absolute",
                      left: rb.left - r.left + "px",
                      top: rb.top - r.top + "px",
                      width: Math.ceil(rb.width + 8) + "px",
                      height: rb.height + "px",
                      fontFamily: st.fontFamily,
                      fontSize: st.fontSize,
                      fontWeight: st.fontWeight,
                      lineHeight: st.lineHeight,
                      letterSpacing: st.letterSpacing,
                      color: st.color,
                      whiteSpace:
                        range.getClientRects().length === 1
                          ? "nowrap"
                          : st.whiteSpace,
                      overflowWrap: st.overflowWrap,
                    }) +
                    '">' +
                    escape(text.trim()) +
                    "</div>";
              }
            }
            return '<div style="' + style(st) + '">' + content + "</div>";
          };
          const atomic =
            ".pt-shell-topbar,.pt-page-header,.pt-record-header,.pt-section-heading,.pt-modal-header,.pt-modal-footer,.pt-form-footer,.pt-table-footer,.pt-table>thead,.pt-table>tbody>tr,.pt-kpi-grid>a,.pt-kpi-grid>button,.pt-kpi-grid>div,.pt-event-row,.pt-notification-row,.pt-board-stage-picker,.pt-board-lane>header,.pt-board-lane>form,.pt-board-item-actions,.pt-kanban-card>*,.pt-agenda-week,.pt-agenda-kinds,.pt-agenda>section>h3,.pt-settings-columns>nav,.pt-field,.pt-form-section>header,.pt-breadcrumbs,.pt-segmented,.pt-open-records-heading,.pt-open-records-list>li,.pt-notifications-head,.pt-notifications-toolbar";
          const groups = [];
          const walk = async (el) => {
            if (getComputedStyle(el).display === "contents") {
              for (const child of el.children) await walk(child);
              return;
            }
            if (!visible(el)) return;
            const r = el.getBoundingClientRect(),
              s = getComputedStyle(el);
            if (
              el.matches(atomic) ||
              el.matches(
                "button,input,textarea,select,svg,img,h1,h2,h3,h4,p",
              ) ||
              !el.children.length
            ) {
              const text = await serialize(el, {
                left: origin.x,
                top: origin.y,
              });
              if (text)
                groups.push({
                  name:
                    el.getAttribute("aria-label") ||
                    el.textContent.trim().slice(0, 65) ||
                    el.className?.toString() ||
                    el.tagName,
                  html: text,
                });
              return;
            }
            const decoration =
              s.backgroundColor !== "rgba(0, 0, 0, 0)" ||
              parseFloat(s.borderTopWidth) > 0 ||
              parseFloat(s.borderBottomWidth) > 0 ||
              s.boxShadow !== "none";
            if (decoration)
              groups.push({
                name: "Surface · " + el.className,
                html:
                  '<div style="' +
                  style(
                    css(el, {
                      x: r.left,
                      y: r.top,
                      width: r.width,
                      height: r.height,
                    }),
                  ) +
                  '"></div>',
              });
            for (const child of el.children) await walk(child);
          };
          if (action) {
            await walk(document.querySelector(".pt-app-shell"));
            for (const el of document.body.children)
              if (el.matches("[data-radix-portal]")) await walk(el);
            for (const el of document.querySelectorAll(
              ".pt-shell-mobile-scrim,.pt-shell-mobile-panel,.pt-scrim,.pt-modal,.pt-drawer",
            ))
              if (
                !el.parentElement.closest(
                  ".pt-modal,.pt-drawer,.pt-shell-mobile-panel",
                )
              )
                await walk(el);
          } else await walk(root);
          const clipRegions = [
            ...document.querySelectorAll(".pt-shell-nav,.pt-board-lanes"),
          ]
            .filter(visible)
            .map((el) => {
              const r = el.getBoundingClientRect();
              return {
                selector: el.className,
                x: r.left - origin.x,
                y: r.top - origin.y,
                width: r.width,
                height: r.height,
              };
            });
          return {
            width: 390,
            height: 844,
            background:
              theme === "dark"
                ? "var(--pt-dark-color-bg-surface)"
                : "var(--pt-color-bg-surface)",
            groups,
            clipRegions,
          };
        },
        {
          selector: item.selector,
          theme,
          tokens: tokenData.tokens,
          action: item.action,
        },
      );
      const filename = item.id + "-" + theme;
      await writeFile(
        "artifacts/paper-phone/" + filename + ".json",
        JSON.stringify(
          {
            ...capture,
            id: filename,
            name: item.name + " · " + theme + " · 390px",
            source: "http://127.0.0.1:5190" + item.path,
            theme,
          },
          null,
          2,
        ),
      );
      await page.screenshot({
        path: "artifacts/paper-phone/" + filename + ".png",
      });
      index.push({
        id: filename,
        name: item.name + " · " + theme + " · 390px",
        groups: capture.groups.length,
      });
      console.log(filename, capture.groups.length);
      await context.close();
    }
  await writeFile(
    "artifacts/paper-phone/index.json",
    JSON.stringify(index, null, 2),
  );
} finally {
  await browser.close();
}
