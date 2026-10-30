import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Divider")!;

const meta={title:"Primitives/Divider",tags:['autodocs'],argTypes:{},parameters:{controls:{disable:true},docs:{source:{code:"import {Divider} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function DividerExample() {\n\nreturn (<Divider />);\n}",language:'tsx'},description:{component:"1px hairline separator, horizontal or vertical.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nDivider uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
