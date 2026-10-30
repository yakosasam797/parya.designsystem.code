import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="searchRows")!;

const meta={title:"Tables & collections/searchRows",tags:['autodocs'],argTypes:{"rows":{"description":"T[]","table":{"type":{"summary":"T[]"}},"control":false},"query":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"accessors":{"description":"((row: T) => string)[]","table":{"type":{"summary":"((row: T) => string)[]"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {useState} from \"react\";\nimport {Stack, SearchField, searchRows} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function SearchRowsDemo() {\n  const [query, setQuery] = useState(\"Kochi hotel\");\n  const rows = [\n    { name: \"Harbour hotel\", city: \"Kochi\" },\n    { name: \"Hillside hotel\", city: \"Munnar\" },\n    { name: \"Kochi transfers\", city: \"Kochi\" },\n  ];\n  const filtered = searchRows(rows, query, [\n    (row) => row.name,\n    (row) => row.city,\n  ]);\n  return (\n    <Stack>\n      <SearchField\n        placeholder=\"Search vendors\"\n        value={query}\n        onValueChange={setQuery}\n        shortcut=\"\"\n      />\n      <p role=\"status\">\n        {filtered.map((row) => row.name).join(\", \") || \"No matches\"}\n      </p>\n    </Stack>\n  );\n}",language:'tsx'},description:{component:"Case-insensitive search over the fields returned for each row; every word of the query must appear.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nsearchRows belongs to the shared package and is used by components and application code. It has no independent visual style.\n\nAccessibility\nsearchRows is a utility. It does not render interface semantics; present its result using labeled components and announce relevant loading or error feedback in the application.\n\nExperimental. Utility function; the story demonstrates its output. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
