import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="BackButton")!;

const meta={title:"Shell & navigation/BackButton",tags:['autodocs'],argTypes:{"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"onClick":{"description":"() => void","table":{"type":{"summary":"() => void"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {BackButton} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function BackButtonExample() {\n\nreturn (<BackButton onClick={() => history.back()}>Back to bookings</BackButton>);\n}",language:'tsx'},description:{component:"36px bordered chevron-left button left of the breadcrumbs on record, detail and create pages.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nBackButton uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Button\n\nAccessibility\nKeep BackButton's content meaningful in the surrounding page and preserve semantic labels and reading order. Verify any supplied actions with a keyboard.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
