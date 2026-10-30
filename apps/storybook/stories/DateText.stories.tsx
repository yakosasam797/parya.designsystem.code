import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="DateText")!;
const Component=UI.DateText as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Content & records/DateText",tags:['autodocs'],component:UI.DateText,args:{...{"value":"2026-11-10","format":"long","locale":"en-IN"},},argTypes:{"value":{"description":"string | Date","table":{"type":{"summary":"string | Date"}},"control":"text"},"locale":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"format":{"description":"\"short\" | \"medium\" | \"long\"","table":{"type":{"summary":"\"short\" | \"medium\" | \"long\""}},"control":{"type":"select"},"options":["short","medium","long"]},"timeZone":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"}},parameters:{docs:{source:{code:"import {DateText} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function DateTextExample() {\n\nreturn (<DateText value=\"2026-11-10\" format=\"long\" />);\n}",language:'tsx'},description:{component:"A civil date (YYYY-MM-DD, never timezone-shifted) or an instant (IST) in a <time> element: '12 Dec 2026', with optional time or relative ('3 months ago').\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nDateText uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nSupply a valid date and the intended locale and time zone. Explain dates in the context of the trip or operation.\n\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
