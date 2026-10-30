import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="toast")!;

const meta={title:"Overlays & feedback/toast",tags:['autodocs'],argTypes:{"title":{"description":"string","table":{"type":{"summary":"string"}},"control":false},"options":{"description":"Omit<ToastMessage, \"id\" | \"title\">","table":{"type":{"summary":"Omit<ToastMessage, \"id\" | \"title\">"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Button, toast} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function ToastDemo() {\n  return (\n    <Button\n      onClick={() =>\n        toast(\"Booking confirmed\", {\n          description: \"The traveler has been notified.\",\n          tone: \"success\",\n        })\n      }\n    >\n      Show notification\n    </Button>\n  );\n}",language:'tsx'},description:{component:"Imperative feedback after an action: toast({ title, description?, tone?, action? }). Renders in the Toaster (bottom-right, 360px), auto-dismisses after 5s, pauses on hover/focus, announced politely (danger assertively).\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\ntoast belongs to the shared package and is used by components and application code. It has no independent visual style.\n\nAccessibility\nUse brief feedback that explains the outcome. Keep essential errors or required actions visible in the page as well as in a transient toast.\n\ntoast is a utility. It does not render interface semantics; present its result using labeled components and announce relevant loading or error feedback in the application.\n\nExperimental. Utility function; the story demonstrates its output. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
