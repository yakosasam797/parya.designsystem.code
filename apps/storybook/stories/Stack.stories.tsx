import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Stack")!;

const meta={title:"Primitives/Stack",tags:['autodocs'],argTypes:{"direction":{"description":"\"row\" | \"column\"","table":{"type":{"summary":"\"row\" | \"column\""}},"control":false},"gap":{"description":"\"1\" | \"2\" | \"3\" | \"4\" | \"6\" | \"8\"","table":{"type":{"summary":"\"1\" | \"2\" | \"3\" | \"4\" | \"6\" | \"8\""}},"control":false},"align":{"description":"\"start\" | \"center\" | \"end\" | \"stretch\"","table":{"type":{"summary":"\"start\" | \"center\" | \"end\" | \"stretch\""}},"control":false},"wrap":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Stack, Button} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function StackExample() {\n\nreturn (<Stack direction=\"row\" gap=\"3\"><Button>Cancel</Button><Button variant=\"primary\">Save</Button></Stack>);\n}",language:'tsx'},description:{component:"Flex layout for a few children inside a region: column (default) or row, gap from the space scale (--pt-space-*), align, justify, wrap; renders div, ul or ol. Classes only, no inline styles.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nStack uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
