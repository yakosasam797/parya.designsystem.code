import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="TextLink")!;

const meta={title:"Primitives/TextLink",tags:['autodocs'],argTypes:{},parameters:{controls:{disable:true},docs:{source:{code:"import {TextLink} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function TextLinkExample() {\n\nreturn (<TextLink href=\"https://app.paper.design/file/01M5KKMF33S23DNN84NAWWBTJR\">Open Paper library</TextLink>);\n}",language:'tsx'},description:{component:"Inline teal link, underline on hover; external opens a new tab with an external-link icon.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nTextLink uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nUse a meaningful destination label and a real href. Use Button for an action that does not navigate.\n\nKeep the focus indicator visible and tell users when a link opens a new context.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
