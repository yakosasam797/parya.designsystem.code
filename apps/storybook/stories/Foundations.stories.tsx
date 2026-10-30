import type { Meta, StoryObj } from "@storybook/react-vite";
import catalog from "@parya/design-system/catalog.json";
const roles = catalog.foundations.typography;

function RoleSpecimen({ role, text }: { role: string; text: string }) {
  const selected = roles.find((item) => item.id === role) ?? roles[0];
  return (
    <div style={{ containerType: "inline-size", maxWidth: 900 }}>
      <p style={{ fontSize: 13, marginBottom: 24 }}>
        {selected.label}: {selected.use}
      </p>
      <p className={selected.className}>{text || selected.example}</p>
      <dl style={{ fontSize: 13, marginTop: 32, display: "grid", gap: 10 }}>
        <div>
          <dt>Font</dt>
          <dd>{selected.resolved.fontFamily}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{selected.resolved.fontSize}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{selected.resolved.fontWeight}</dd>
        </div>
        <div>
          <dt>Line height</dt>
          <dd>{selected.resolved.lineHeight}</dd>
        </div>
      </dl>
      <p style={{ fontSize: 13, marginTop: 24 }}>
        The specimen is a paragraph. Choose heading, paragraph or label
        semantics independently of the visual role.
      </p>
    </div>
  );
}
const meta = {
  title: "Get started/Foundations",
  component: RoleSpecimen,
  tags: ["autodocs"],
  args: { role: "body", text: "" },
  argTypes: {
    role: {
      control: {
        type: "select",
        labels: Object.fromEntries(roles.map((role) => [role.id, role.label])),
      },
      options: roles.map((role) => role.id),
    },
    text: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Typography roles and semantic colors from the library’s packaged foundation catalog. Use the documentation website for when-to-use guidance, contrast checks and complete copyable code. Styles are visual only; use semantic HTML and the real components for controls.",
      },
      source: {
        code: 'import "@parya/design-system/styles.css";\n\n<h2 className="pt-type-section-title">Traveler details</h2>\n<p className="pt-type-body">Confirm the passport name before issuing the ticket.</p>',
        language: "tsx",
      },
    },
  },
} satisfies Meta<typeof RoleSpecimen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Typography: Story = {};
export const PageTitle: Story = { args: { role: "page-title" } };
export const Money: Story = { args: { role: "mono-money" } };
export const ColorPairs: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: "color: var(--pt-color-text-primary);\nbackground-color: var(--pt-color-bg-surface);",
        language: "css",
      },
    },
  },
  render: () => (
    <div
      className="pt-table-scroll"
      role="region"
      tabIndex={0}
      aria-label="Semantic color pairings"
    >
      <table className="pt-table">
        <caption>Semantic foreground and background pairings</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Preview</th>
            <th scope="col">When to use</th>
          </tr>
        </thead>
        <tbody>
          {catalog.foundations.colorPairs.map((pair) => (
            <tr key={pair.id}>
              <th scope="row">{pair.label}</th>
              <td>
                <p
                  style={{
                    padding: 16,
                    color: `var(${pair.foreground})`,
                    backgroundColor: `var(${pair.background})`,
                    borderRadius: 8,
                  }}
                >
                  Traveler details
                </p>
              </td>
              <td>{pair.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
