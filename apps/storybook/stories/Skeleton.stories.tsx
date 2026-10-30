import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Skeleton")!;
const Component=UI.Skeleton as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Primitives/Skeleton",tags:['autodocs'],component:UI.Skeleton,args:{...{"lines":3},},argTypes:{"lines":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"}},parameters:{docs:{source:{code:"import {Skeleton} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function SkeletonExample() {\n\nreturn (<Skeleton lines={3} />);\n}",language:'tsx'},description:{component:"Shimmering placeholder block or text lines for loading content (aria-hidden).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nSkeleton uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nProvide a meaningful loading message in the surrounding region. Placeholder shapes do not explain what is loading.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
