import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Panel")!;

const meta={title:"Content & records/Panel",tags:['autodocs'],argTypes:{"title":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"actions":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Panel, Money} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PanelExample() {\n\nreturn (<Panel title=\"Booking summary\" description=\"All amounts include taxes.\"><Money value={248000} /></Panel>);\n}",language:'tsx'},description:{component:"Bordered section card (radius lg) with a raised head (Onest 15/700 title, mono meta, actions), a 16/20 body or full-width body, and an optional footer disclosure. An EmptyState placed directly in the body (or as ItemList/DataTable `empty`) renders bare — the panel is the card.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPanel uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
