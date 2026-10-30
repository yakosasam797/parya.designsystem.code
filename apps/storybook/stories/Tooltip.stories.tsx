import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Tooltip")!;

const meta={title:"Primitives/Tooltip",tags:['autodocs'],argTypes:{"content":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Tooltip, Button} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function TooltipExample() {\n\nreturn (<Tooltip content=\"Export bookings as a spreadsheet\"><Button>Export</Button></Tooltip>);\n}",language:'tsx'},description:{component:"Dark hover/focus tooltip (12px) around a single focusable trigger. Includes its own provider (300ms delay).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nTooltip uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nUse tooltip text as supplementary help. Keep an accessible name on the trigger and put essential instructions in visible text.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
