import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Heading")!;

const meta={title:"Primitives/Heading",tags:['autodocs'],argTypes:{"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Heading} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function HeadingExample() {\n\nreturn (<Heading>Traveler details</Heading>);\n}",language:'tsx'},description:{component:"A heading that follows the nearest HeadingLevelProvider.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nHeading uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Tag\n\nAccessibility\nChoose the semantic heading level using HeadingLevelProvider. Visual size does not determine document order.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
