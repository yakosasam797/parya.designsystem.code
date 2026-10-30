import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="PriceChip")!;
const Component=UI.PriceChip as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Pricing & finance/PriceChip",tags:['autodocs'],component:UI.PriceChip,args:{...{"value":12500,"currency":"INR"},},argTypes:{"value":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"currency":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"locale":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"decimals":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"tone":{"description":"\"default\" | \"muted\" | \"success\" | \"danger\"","table":{"type":{"summary":"\"default\" | \"muted\" | \"success\" | \"danger\""}},"control":{"type":"select"},"options":["success","danger","default","muted"]}},parameters:{docs:{source:{code:"import {PriceChip} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PriceChipExample() {\n\nreturn (<PriceChip value={12500} />);\n}",language:'tsx'},description:{component:"A price with its change against a previous version: mono INR amount + a toned pill \"↑ 8.6%\" / \"↓ 4.2%\" / \"–\" / \"New\". Tone follows goodDirection (default \"down\" for vendor costs: up = warning, down = success). Screen readers hear \"up 8.6% from v3 (₹7,000)\". Internal pricing only.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPriceChip uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Money\n\nAccessibility\nKeep a text explanation of the status or category; color and icon shape must not be the only way to distinguish meaning.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
