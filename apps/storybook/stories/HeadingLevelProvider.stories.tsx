import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="HeadingLevelProvider")!;

const meta={title:"Primitives/HeadingLevelProvider",tags:['autodocs'],argTypes:{"level":{"description":"1 | 2 | 3 | 4 | 5 | 6","table":{"type":{"summary":"1 | 2 | 3 | 4 | 5 | 6"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {HeadingLevelProvider, Heading} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function HeadingLevelProviderExample() {\n\nreturn (<HeadingLevelProvider level={3}><Heading>Traveler details</Heading></HeadingLevelProvider>);\n}",language:'tsx'},description:{component:"Sets the heading level that section components (FormSection) use inside a surface. Modal and Sheet already provide 3 because their title is the h2; useHeadingLevel() reads it.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nHeadingLevelProvider uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nSet the starting level to fit the surrounding document. Nest providers when a composed section introduces a deeper heading.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
