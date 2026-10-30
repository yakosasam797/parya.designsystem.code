import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Spinner")!;
const Component=UI.Spinner as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Primitives/Spinner",tags:['autodocs'],component:UI.Spinner,args:{...{"label":"Loading bookings"},},argTypes:{"label":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"}},parameters:{docs:{source:{code:"import {Spinner} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function SpinnerExample() {\n\nreturn (<Spinner label=\"Loading bookings\" />);\n}",language:'tsx'},description:{component:"Rotating loader arc or refresh arrow in currentColor for indeterminate short waits.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nSpinner uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nSupply a label that identifies the operation in progress. Keep surrounding content stable and provide success or error feedback in the application.\n\nGive Spinner a meaningful label that explains its purpose in the surrounding workflow.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
