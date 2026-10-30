import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Modal")!;

const meta={title:"Overlays & feedback/Modal",tags:['autodocs'],argTypes:{"open":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false},"onOpenChange":{"description":"(open: boolean) => void","table":{"type":{"summary":"(open: boolean) => void"}},"control":false},"title":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"description":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"footer":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"trigger":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"size":{"description":"\"sm\" | \"md\" | \"lg\"","table":{"type":{"summary":"\"sm\" | \"md\" | \"lg\""}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {useState} from \"react\";\nimport {Button, TextField, Modal} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function ModalExample() {\nconst [open, setOpen] = useState(false);\nreturn (<Modal open={open} onOpenChange={setOpen} title=\"Edit traveler\" trigger={<Button>Edit traveler</Button>}><TextField label=\"Email address\" type=\"email\" /></Modal>);\n}",language:'tsx'},description:{component:"Medium content that fits without scrolling. Header → body → right-aligned footer. Source sm width 480px. Avoid deep previews and long forms → full page.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nModal uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nComposes: IconButton\n\nAccessibility\nGive the overlay a meaningful title or label using its documented API. Test keyboard opening, dismissal and focus return to the trigger in the complete workflow.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
