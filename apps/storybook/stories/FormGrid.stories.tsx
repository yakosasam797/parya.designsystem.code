import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="FormGrid")!;

const meta={title:"Forms & validation/FormGrid",tags:['autodocs'],argTypes:{"columns":{"description":"1 | 2 | 3","table":{"type":{"summary":"1 | 2 | 3"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {FormGrid, TextField} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function FormGridExample() {\n\nreturn (<FormGrid columns={2}><TextField label=\"First name\" /><TextField label=\"Last name\" /></FormGrid>);\n}",language:'tsx'},description:{component:"Responsive grid of fields: 1/2/3 columns (row gap 16, column gap 20). Fields with span=\"full\" span every column. Collapses 3→2 under 720px and to 1 under 480px of available width (container query).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nFormGrid uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
