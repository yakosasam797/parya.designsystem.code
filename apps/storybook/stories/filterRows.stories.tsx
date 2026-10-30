import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="filterRows")!;

const meta={title:"Tables & collections/filterRows",tags:['autodocs'],argTypes:{"rows":{"description":"T[]","table":{"type":{"summary":"T[]"}},"control":false},"value":{"description":"FilterValue","table":{"type":{"summary":"FilterValue"}},"control":false},"accessors":{"description":"Record<string, (row: T) => string | string[]>","table":{"type":{"summary":"Record<string, (row: T) => string | string[]>"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {filterRows} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function FilterRowsDemo() {\n  const rows = [\n    { name: \"Resort\", services: [\"hotel\", \"activity\"], status: \"active\" },\n    { name: \"Transfers\", services: [\"transport\"], status: \"active\" },\n    { name: \"Archived hotel\", services: [\"hotel\"], status: \"inactive\" },\n  ];\n  const filtered = filterRows(\n    rows,\n    { service: [\"hotel\", \"activity\"], status: [\"active\"] },\n    { service: (row) => row.services, status: (row) => row.status },\n  );\n  return <p>Matching vendors: {filtered.map((row) => row.name).join(\", \")}</p>;\n}",language:'tsx'},description:{component:"Applies a FilterValue to client-side rows: AND across groups, OR within a group. Groups without an accessor or selected values are ignored.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nfilterRows belongs to the shared package and is used by components and application code. It has no independent visual style.\n\nAccessibility\nfilterRows is a utility. It does not render interface semantics; present its result using labeled components and announce relevant loading or error feedback in the application.\n\nExperimental. Utility function; the story demonstrates its output. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
