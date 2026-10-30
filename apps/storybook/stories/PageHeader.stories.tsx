import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="PageHeader")!;
const Component=UI.PageHeader as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Content & records/PageHeader",tags:['autodocs'],component:UI.PageHeader,args:{...{"title":"Bookings","description":"Manage every journey in one place.","count":24},},argTypes:{"title":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"headingLevel":{"description":"1 | 2 | 3","table":{"type":{"summary":"1 | 2 | 3"}},"control":"object"},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"count":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"status":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"object"},"actions":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"object"}},parameters:{docs:{source:{code:"import {Button, PageHeader} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PageHeaderExample() {\n\nreturn (<PageHeader title=\"Bookings\" count={24} description=\"Manage every journey in one place.\" actions={<Button variant=\"primary\" leadingIcon=\"plus\">Create booking</Button>} />);\n}",language:'tsx'},description:{component:"Import\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPageHeader uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
