import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Popover")!;

const meta={title:"Overlays & feedback/Popover",tags:['autodocs'],argTypes:{"trigger":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"children":{"description":"ReactNode","table":{"type":{"summary":"ReactNode"}},"control":false},"open":{"description":"boolean","table":{"type":{"summary":"boolean"}},"control":false},"onOpenChange":{"description":"(open: boolean) => void","table":{"type":{"summary":"(open: boolean) => void"}},"control":false},"align":{"description":"\"start\" | \"center\" | \"end\"","table":{"type":{"summary":"\"start\" | \"center\" | \"end\""}},"control":false},"label":{"description":"string","table":{"type":{"summary":"string"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Button, Popover} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function PopoverExample() {\n\nreturn (<Popover label=\"Booking notes\" trigger={<Button>Notes</Button>}><p>Window seat requested.</p></Popover>);\n}",language:'tsx'},description:{component:"Anchored panel for a small task beside its trigger, with optional title header (close button) and a footer band. Escape and outside click close; focus returns to the trigger by default. Optional lifecycle handlers support a compact picker beside an external search without moving that input into the panel.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nPopover uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nGive Popover a meaningful label that explains its purpose in the surrounding workflow.\n\nGive the overlay a meaningful title or label using its documented API. Test keyboard opening, dismissal and focus return to the trigger in the complete workflow.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
