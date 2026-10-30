import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="StageLabel")!;
const Component=UI.StageLabel as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Boards & workflow/StageLabel",tags:['autodocs'],component:UI.StageLabel,args:{...{"children":"Awaiting confirmation","tone":"warning"},},argTypes:{"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"text"},"tone":{"description":"StatusTone","table":{"type":{"summary":"StatusTone"}},"control":{"type":"select"},"options":["info","neutral","success","warning","danger"]}},parameters:{docs:{source:{code:"import {StageLabel} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function StageLabelExample() {\n\nreturn (<StageLabel tone=\"warning\">Awaiting confirmation</StageLabel>);\n}",language:'tsx'},description:{component:"8px tone dot + label for a workspace-configurable stage (New, Quoting, Options sent, Vouchers pending). md 13.5/600 for column headers; sm 12.5/500 for table cells and previews. Takes the board column ({ label, tone }).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nStageLabel uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: StatusChip\n\nAccessibility\nKeep a text explanation of the status or category; color and icon shape must not be the only way to distinguish meaning.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
