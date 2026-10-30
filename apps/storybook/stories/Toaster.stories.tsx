import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="Toaster")!;

const meta={title:"Overlays & feedback/Toaster",tags:['autodocs'],argTypes:{},parameters:{controls:{disable:true},docs:{source:{code:"import {Button, toast, Toaster, ThemeProvider} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function NotificationExample() { return <ThemeProvider theme=\"light\"><Button onClick={() => toast(\"Example notification\")}>Show notification</Button><Toaster /></ThemeProvider>; }",language:'tsx'},description:{component:"Mount point that renders toasts raised with toast(). Portalled bottom-right stack at --pt-z-toast.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nToaster uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nMount one toast host for the application. AppShell already provides one unless withToaster is disabled.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
