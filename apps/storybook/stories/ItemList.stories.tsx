import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="ItemList")!;

const meta={title:"Content & records/ItemList",tags:['autodocs'],argTypes:{"items":{"description":"{\n    id: string;\n    title: string;\n    description?: string;\n    icon?: IconName;\n    trailing?: ReactNode;\n    onClick?: () => void;\n  }[]","table":{"type":{"summary":"{\n    id: string;\n    title: string;\n    description?: string;\n    icon?: IconName;\n    trailing?: ReactNode;\n    onClick?: () => void;\n  }[]"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {ItemList} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function ItemListExample() {\n\nreturn (<ItemList items={[{id:\"flight\",title:\"Flight to Denpasar\",description:\"10 November · 09:30\",icon:\"plane\"}]} />);\n}",language:'tsx'},description:{component:"Header-less ruled rows for rails and panels: [16px muted icon] label 13.5/500 (+ quiet meta line) · right-aligned value (mono optional, blank → '—') · one trailing action (IconButton xs ghost). 48px min rows, hairlines, 20px panel gutter; the value drops under the label below 320px. Values stay aligned when only some rows have actions. Long values (account numbers, e-mails) wrap inside a column capped at 60% of the row, so they never squeeze the label.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nItemList uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Icon\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
