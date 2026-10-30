import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="ContactList")!;

const meta={title:"Content & records/ContactList",tags:['autodocs'],argTypes:{"items":{"description":"{ label: string; value: string; type: \"email\" | \"phone\" | \"text\" }[]","table":{"type":{"summary":"{ label: string; value: string; type: \"email\" | \"phone\" | \"text\" }[]"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {ContactList} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function ContactListExample() {\n\nreturn (<ContactList items={[{label:\"Email\",value:\"aarav@example.com\",type:\"email\"}]} />);\n}",language:'tsx'},description:{component:"People to reach for a record: avatar, name, role, Primary tag and Call / Email / WhatsApp pills (tel:, mailto:, wa.me), with a 'View all N contacts' disclosure.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nContactList uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Icon\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
