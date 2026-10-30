import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Avatar")!;
const Component=UI.Avatar as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Primitives/Avatar",tags:['autodocs'],component:UI.Avatar,args:{...{"name":"Aarav Sharma","size":"md","tone":"person"},},argTypes:{"name":{"description":"string | null","table":{"type":{"summary":"string | null"}},"control":"text"},"src":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"unassignedLabel":{"description":"string","table":{"type":{"summary":"string"}},"control":"text"},"size":{"description":"\"xs\" | \"chip\" | \"sm\" | \"md\" | \"lg\" | \"xl\"","table":{"type":{"summary":"\"xs\" | \"chip\" | \"sm\" | \"md\" | \"lg\" | \"xl\""}},"control":{"type":"select"},"options":["sm","md","lg","xs","xl","chip"]},"tone":{"description":"\"person\" | \"work\" | \"warm\" | \"channel\" | \"neutral\"","table":{"type":{"summary":"\"person\" | \"work\" | \"warm\" | \"channel\" | \"neutral\""}},"control":{"type":"select"},"options":["work","person","warm","channel","neutral"]}},parameters:{docs:{source:{code:"import {Avatar} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function AvatarExample() {\n\nreturn (<Avatar name=\"Aarav Sharma\" size=\"md\" />);\n}",language:'tsx'},description:{component:"Rounded person/entity photo or initials with load-error fallback. Default sm26; chip24/radius6 is compact rounded media for Kanban assignees. Existing sizes and tones remain unchanged.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nAvatar uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nUse the person's name to identify them when the avatar carries information. Avoid repeating that name in an adjacent accessible label unnecessarily.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
