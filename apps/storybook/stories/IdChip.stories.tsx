import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="IdChip")!;
const Component=UI.IdChip as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Primitives/IdChip",tags:['autodocs'],component:UI.IdChip,args:{...{"children":"BK-1042"},},argTypes:{"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"text"}},parameters:{docs:{source:{code:"import {IdChip} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function IdChipExample() {\n\nreturn (<IdChip>BK-1042</IdChip>);\n}",language:'tsx'},description:{component:"Mono record reference chip with bookmark icon and copy-to-clipboard button (announces \"Copied\").\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nIdChip uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep a text explanation of the status or category; color and icon shape must not be the only way to distinguish meaning.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
