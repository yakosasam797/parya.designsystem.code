import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="StackCell")!;
const Component=UI.StackCell as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Tables & collections/StackCell",tags:['autodocs'],component:UI.StackCell,args:{...{"primary":"Bali, Indonesia","secondary":"5 nights · 2 adults"},},argTypes:{"primary":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"text"},"secondary":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":"text"}},parameters:{docs:{source:{code:"import {StackCell} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function StackCellExample() {\n\nreturn (<StackCell primary=\"Bali, Indonesia\" secondary=\"5 nights · 2 adults\" />);\n}",language:'tsx'},description:{component:"Two-line cell: primary 13.5px over a 12.5px muted secondary line; mono option for references.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nStackCell uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nChoose headings, landmarks and reading order for the surrounding page. Layout and visual grouping do not replace semantic structure.\n\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
