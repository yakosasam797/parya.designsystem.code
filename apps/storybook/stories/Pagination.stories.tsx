import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Pagination")!;
const Component=UI.Pagination as unknown as ComponentType<Record<string,unknown>>;
function ControlledStory(){const [args,update]=useArgs();return <Component {...args} onValueChange={(value:unknown)=>update({value})} onCheckedChange={(checked:boolean)=>update({checked})} onCountryCodeChange={(countryCode:string)=>update({countryCode})} onPageChange={(page:number)=>update({page})}/>}
const meta={title:"Shell & navigation/Pagination",tags:['autodocs'],component:UI.Pagination,args:{...{"page":1,"pageCount":5,"disabled":false},onPageChange:()=>{}},argTypes:{"page":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"pageCount":{"description":"number","table":{"type":{"summary":"number"}},"control":"number"},"onPageChange":{"description":"(page: number) => void","table":{"type":{"summary":"(page: number) => void"}},"control":false},"disabled":{"control":"boolean"}},parameters:{docs:{source:{code:"import {useState} from \"react\";\nimport {Pagination, pageCount} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PaginationExample() {\nconst [page, setPage] = useState(1);\nreturn (<Pagination page={page} pageCount={5} onPageChange={setPage} />);\n}",language:'tsx'},description:{component:"30px mono pager: previous/next chevrons, pages with ellipses (1 … 4 5 6 … 20), pink current page with aria-current=page.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPagination uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: Button\n\nAccessibility\nExplain why an action is unavailable in visible surrounding text. Keep the enabled and disabled states consistent with application permissions.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:ControlledStory};
