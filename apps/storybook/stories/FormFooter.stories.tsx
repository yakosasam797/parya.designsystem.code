import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="FormFooter")!;

const meta={title:"Forms & validation/FormFooter",tags:['autodocs'],argTypes:{"sticky":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false},"start":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Button, FormFooter} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function FormFooterExample() {\n\nreturn (<FormFooter sticky={false}><Button>Cancel</Button><Button variant=\"primary\" type=\"submit\">Save traveler</Button></FormFooter>);\n}",language:'tsx'},description:{component:"Action row at the end of a form: right-aligned actions (Cancel, then primary), optional start slot. sticky (default) = 72px translucent bar with shadow sticky at the bottom of the page; sticky={false} on settings pages and inside Modal/Sheet footers. Under 560px of its own width the start slot stacks above the actions; actions keep natural width (a Cancel + primary pair splits the row).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nFormFooter uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep FormFooter's content meaningful in the surrounding page and preserve semantic labels and reading order. Verify any supplied actions with a keyboard.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
