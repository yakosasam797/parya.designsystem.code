import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="FormSection")!;

const meta={title:"Forms & validation/FormSection",tags:['autodocs'],argTypes:{"title":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"icon":{"description":"IconName","table":{"type":{"summary":"IconName"}},"control":false},"headingLevel":{"description":"2 | 3","table":{"type":{"summary":"2 | 3"}},"control":false},"id":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {FormSection, TextField} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function FormSectionExample() {\n\nreturn (<FormSection title=\"Traveler details\"><TextField label=\"Full name\" /></FormSection>);\n}",language:'tsx'},description:{component:"One section of a sectioned form: intro column (--pt-size-form-intro) with a 34px (--pt-size-form-intro-tile) teal icon tile, Onest 15/700 title and 12.5px description, beside the fields. Hairline between sections; stacks to one column under 760px of its own width. Title is h2 on pages and h3 inside Modal/Sheet automatically.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nFormSection uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Heading, Icon\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
