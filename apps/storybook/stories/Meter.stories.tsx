import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Meter")!;
const Component=UI.Meter as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Primitives/Meter",tags:['autodocs'],component:UI.Meter,args:{...{"value":640,"max":1000,"label":"Monthly credits","tone":"accent","size":"sm"},},argTypes:{"value":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"max":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"tone":{"description":"\"accent\" | \"primary\" | \"success\" | \"warning\" | \"danger\"","table":{"type":{"summary":"\"accent\" | \"primary\" | \"success\" | \"warning\" | \"danger\""}},"control":{"type":"select"},"options":["success","warning","danger","accent","primary"]},"label":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"valueText":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"size":{"description":"\"sm\" | \"md\"","table":{"type":{"summary":"\"sm\" | \"md\""}},"control":{"type":"select"},"options":["sm","md"]}},parameters:{docs:{source:{code:"import {Meter} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function MeterExample() {\n\nreturn (<Meter label=\"Monthly credits\" value={640} max={1000} />);\n}",language:'tsx'},description:{component:"4px usage bar (pink accent default, on a pink-tinted track; other tones on a neutral track) with optional label and value text; role=meter.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nMeter uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nSupply a meaningful label and a positive max. Keep the visible numeric value and units understandable outside the colored bar.\n\nGive Meter a meaningful label that explains its purpose in the surrounding workflow.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
