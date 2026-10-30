import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Steps")!;

const meta={title:"Content & records/Steps",tags:['autodocs'],argTypes:{"steps":{"description":"{ id: string; label: string; description?: string }[]","table":{"type":{"summary":"{ id: string; label: string; description?: string }[]"}},"control":false},"current":{"description":"string","table":{"type":{"summary":"string"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Steps} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function StepsExample() {\n\nreturn (<Steps current=\"payment\" steps={[{id:\"details\",label:\"Details\"},{id:\"payment\",label:\"Payment\"},{id:\"confirmed\",label:\"Confirmed\"}]} />);\n}",language:'tsx'},description:{component:"Owner-selected bounded checklist rail (cards) is the default: numbered upcoming/current steps, checked completed steps, a completion count and the current upload/action area. Explicit numbered instructions, horizontal wizard and compact segmented variants remain available.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nSteps uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Icon\n\nAccessibility\nKeep Steps's content meaningful in the surrounding page and preserve semantic labels and reading order. Verify any supplied actions with a keyboard.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
