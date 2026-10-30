import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="VisuallyHidden")!;

const meta={title:"Primitives/VisuallyHidden",tags:['autodocs'],argTypes:{"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Icon, VisuallyHidden, Button} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function VisuallyHiddenExample() {\n\nreturn (<Button><Icon name=\"plus\" /><VisuallyHidden>Add traveler</VisuallyHidden></Button>);\n}",language:'tsx'},description:{component:"Deprecated compatibility for frozen historical previews. For new work use a semantic element with the public pt-visually-hidden utility class. Screen-reader-only text (.pt-visually-hidden): a 1px clipped box anchored to its containing block's top-left, so hidden text inside scrolling tables, boards and matrices never grows the document.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nVisuallyHidden uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nUse this for text that assistive technology should read while the visual interface omits it. Do not hide focusable controls inside it.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
