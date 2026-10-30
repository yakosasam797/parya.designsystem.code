import { readFile, writeFile, mkdir } from "node:fs/promises";
import { controls } from "./control-configs.mjs";
import { iconNames } from "@parya/design-system";
let components;
try {
  components = JSON.parse(
    await readFile("../docs/src/generated/components.json", "utf8"),
  );
} catch {
  throw new Error(
    "Generate the shared catalog first: run npm run generate from the repository root.",
  );
}
await mkdir("stories", { recursive: true });
for (const c of components) {
  const args = controls[c.name];
  const argTypes = {};
  const requiredHandlers = c.props
    .filter((p) => p.required && p.name.startsWith("on"))
    .map((p) => `${p.name}:()=>{}`)
    .join(",");
  for (const prop of c.props) {
    let literals =
      prop.type === "IconName"
        ? [...iconNames]
        : (prop.options ??
          [...prop.type.matchAll(/"([^\"]+)"/g)].map((m) => m[1]));
    if (literals.length && prop.type.includes("boolean"))
      literals = [false, true, ...literals];
    const editable =
      args && !(prop.name.startsWith("on") || prop.type.includes("=>"));
    argTypes[prop.name] = {
      description: prop.type,
      table: { type: { summary: prop.type } },
      control: !editable
        ? false
        : literals.length
          ? { type: "select" }
          : prop.type.includes("boolean")
            ? "boolean"
            : prop.type.startsWith("number")
              ? "number"
              : prop.type.startsWith("string") ||
                  typeof args?.[prop.name] === "string"
                ? "text"
                : "object",
      ...(editable && literals.length ? { options: literals } : {}),
    };
  }
  if (args?.disabled !== undefined) argTypes.disabled = { control: "boolean" };
  if (c.name === "Button")
    argTypes.children = {
      control: "text",
      description: "Visible action label",
    };
  const description = [
    c.description,
    `Package: ${c.package.name}@${c.package.version}. Components share this library release.`,
    ...(c.details
      ? [
          c.details.defaults,
          `Typography: ${c.details.typography.family}, weight ${c.details.typography.weight}. ${c.details.typography.sizes.map((item) => `${item.size}: ${item.value}`).join("; ")}.`,
          "Icons\n" + c.details.icons.join("\n\n"),
          "Accessibility\n" + c.details.accessibility.join("\n\n"),
        ]
      : []),
    "Connected foundations\n" + c.documentation.overview,
    ...(c.documentation.composition.length
      ? ["Composes: " + c.documentation.composition.join(", ")]
      : []),
    ...(!c.details
      ? ["Accessibility\n" + c.documentation.accessibility.join("\n\n")]
      : []),
    "Experimental. " +
      (c.kind === "utility"
        ? "Utility function; the story demonstrates its output. "
        : "") +
      "See the documentation website for the full API and Paper guidance.",
  ].join("\n\n");
  const source = `import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';
${c.name === "AppShell" ? "import {AppShellDemo} from '@parya/design-system/examples';" : ""}
const example=examples.find(e=>e.name===${JSON.stringify(c.name)})!;
${
  args
    ? `const Component=UI.${c.name} as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}`
    : ""
}
const meta={title:${JSON.stringify(c.category + "/" + c.name)},tags:['autodocs'],${args ? `component:UI.${c.name},args:{...${JSON.stringify(args)},${requiredHandlers}},` : ""}argTypes:${JSON.stringify(argTypes)},parameters:{${args ? "" : "controls:{disable:true},"}docs:{source:{code:${JSON.stringify(c.usage)},language:'tsx'},description:{component:${JSON.stringify(description)}}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;
${c.name === "Button" ? "export const WithoutIcons:Story={args:{leadingIcon:undefined,trailingIcon:undefined},render:ControlledStory};\nexport const TrailingIcon:Story={args:{leadingIcon:undefined,trailingIcon:'arrow-right'},render:ControlledStory};\nexport const BothIcons:Story={args:{leadingIcon:'plus',trailingIcon:'arrow-right'},render:ControlledStory};\nexport const FullWidth:Story={args:{fullWidth:true},render:ControlledStory};\n" : ""}
export const Default:Story={render:${args ? "ControlledStory" : "()=> <example.Demo/>"}};
${c.name === "AppShell" ? "export const Collapsed:Story={render:()=> <AppShellDemo defaultCollapsed/>};\n" : ""}
${["FilterMenu", "SortMenu"].includes(c.name) ? "export const Compact:Story={args:{compact:true},render:ControlledStory};\nexport const Disabled:Story={args:{disabled:true},render:ControlledStory};\n" : ""}${c.name === "FilterMenu" ? "export const AllFilterModes:Story={render:()=> <example.Demo/>};\n" : ""}${c.name === "FilterChips" ? "export const Empty:Story={args:{value:{}},render:ControlledStory};\n" : ""}
${c.name === "Button" ? "export const Loading:Story={args:{loading:true},render:ControlledStory};\nexport const Disabled:Story={args:{disabled:true},render:ControlledStory};\nexport const AllVariants:Story={render:()=> <example.Demo/>};\n" : ""}${c.name === "TextField" ? "export const Error:Story={args:{error:'Traveler name is required.',value:''},render:ControlledStory};\nexport const Disabled:Story={args:{disabled:true},render:ControlledStory};\n" : ""}`;
  await writeFile(`stories/${c.name}.stories.tsx`, source.trimEnd() + "\n");
}
console.log(
  `Synchronized ${components.length} Storybook references; ${Object.keys(controls).length} have prop controls.`,
);
