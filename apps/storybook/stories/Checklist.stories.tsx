import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Checklist")!;

const meta={title:"Content & records/Checklist",tags:['autodocs'],argTypes:{"items":{"description":"{ id: string; label: string; checked: boolean; disabled?: boolean }[]","table":{"type":{"summary":"{ id: string; label: string; checked: boolean; disabled?: boolean }[]"}},"control":false},"onCheckedChange":{"description":"(id: string, checked: boolean) => void","table":{"type":{"summary":"(id: string, checked: boolean) => void"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {useState} from \"react\";\nimport {Checklist} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function ChecklistDemo() {\n  const [checked, set] = useState([\"passport\"]);\n  return (\n    <Checklist\n      items={[\n        {\n          id: \"passport\",\n          label: \"Passport copies\",\n          checked: checked.includes(\"passport\"),\n        },\n        {\n          id: \"payment\",\n          label: \"Deposit received\",\n          checked: checked.includes(\"payment\"),\n        },\n      ]}\n      onCheckedChange={(id, on) =>\n        set(on ? [...checked, id] : checked.filter((v) => v !== id))\n      }\n    />\n  );\n}",language:'tsx'},description:{component:"Setup checklist: title with a right-aligned '2 of 5 done' count, full-width progress bar under the header, check-circle / circle-dashed items and an action per open item. Framed as its own card by default (no Panel needed); inside a Panel body the frame drops.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nChecklist uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nWhen supplying controlled state, update it in the matching change callback. Verify keyboard interaction and preserve the visible focus indicator.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
