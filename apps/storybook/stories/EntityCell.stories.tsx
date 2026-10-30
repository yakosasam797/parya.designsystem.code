import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="EntityCell")!;
const Component=UI.EntityCell as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Tables & collections/EntityCell",tags:['autodocs'],component:UI.EntityCell,args:{...{"name":"Mehta family · Bali","description":"BK-1042"},},argTypes:{"name":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"icon":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"object"},"href":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"}},parameters:{docs:{source:{code:"import {EntityCell} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function EntityCellExample() {\n\nreturn (<EntityCell name=\"Mehta family · Bali\" description=\"BK-1042\" />);\n}",language:'tsx'},description:{component:"Two-line primary entity cell: optional rounded media, title with inline tags, and one secondary line combining mono code and subtitle.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nEntityCell uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
