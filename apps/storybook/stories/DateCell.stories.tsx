import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="DateCell")!;
const Component=UI.DateCell as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Tables & collections/DateCell",tags:['autodocs'],component:UI.DateCell,args:{...{"value":"2026-11-10","note":"Departure"},},argTypes:{"value":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"note":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"}},parameters:{docs:{source:{code:"import {DateCell} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function DateCellExample() {\n\nreturn (<DateCell value=\"2026-11-10\" note=\"Departure\" />);\n}",language:'tsx'},description:{component:"Mono date \"12 Dec 2026\" or range \"12–16 Dec 2026\" (`to`) via @paryatech/format; civil YYYY-MM-DD dates never shift by timezone. Optional calendar icon, danger tone for overdue.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nDateCell uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: StackCell, DateText\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
