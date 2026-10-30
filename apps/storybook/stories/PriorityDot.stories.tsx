import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="PriorityDot")!;
const Component=UI.PriorityDot as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Boards & workflow/PriorityDot",tags:['autodocs'],component:UI.PriorityDot,args:{...{"priority":"high"},},argTypes:{"priority":{"description":"\"low\" | \"medium\" | \"high\" | \"urgent\"","table":{"type":{"summary":"\"low\" | \"medium\" | \"high\" | \"urgent\""}},"control":{"type":"select"},"options":["medium","low","high","urgent"]}},parameters:{docs:{source:{code:"import {PriorityDot} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PriorityDotExample() {\n\nreturn (<PriorityDot priority=\"high\" />);\n}",language:'tsx'},description:{component:"Accessible named priority marker. Default preserves8px urgent/high/medium/low vocabulary. Card appearance uses a solid10px marker and is selected by standard KanbanCard; name and tooltip always identify the level.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPriorityDot uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep a text explanation of the status or category; color and icon shape must not be the only way to distinguish meaning.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
