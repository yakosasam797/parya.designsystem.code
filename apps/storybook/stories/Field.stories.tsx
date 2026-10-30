import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Field")!;

const meta={title:"Forms & validation/Field",tags:['autodocs'],argTypes:{"label":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"htmlFor":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"labelId":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"hint":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"error":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"optional":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false},"required":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false},"span":{"description":"\"full\"","table":{"type":{"summary":"\"full\""}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Field} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function FieldExample() {\n\nreturn (<Field label=\"Booking reference\" htmlFor=\"reference\" hint=\"Your agency reference.\"><input id=\"reference\" /></Field>);\n}",language:'tsx'},description:{component:"Label above a custom control, with hint or error (alert icon) below. Every labelled form component already renders one.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nField uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Icon\n\nAccessibility\nGive Field a meaningful label that explains its purpose in the surrounding workflow.\n\nProvide a specific error message and a way to correct the value. A colored border alone is insufficient.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
