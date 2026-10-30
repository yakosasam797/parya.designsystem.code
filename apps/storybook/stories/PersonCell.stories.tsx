import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="PersonCell")!;
const Component=UI.PersonCell as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Tables & collections/PersonCell",tags:['autodocs'],component:UI.PersonCell,args:{...{"name":"Aarav Sharma","description":"Booking owner"},},argTypes:{"name":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"src":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"}},parameters:{docs:{source:{code:"import {PersonCell} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PersonCellExample() {\n\nreturn (<PersonCell name=\"Aarav Sharma\" description=\"Booking owner\" />);\n}",language:'tsx'},description:{component:"Owner / assignee / contact cell: 26px person avatar + name (13.5/600) with optional inline tags + optional 11.5px sub-line.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPersonCell uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: EntityCell, Avatar\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
