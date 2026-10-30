import type {Meta,StoryObj} from '@storybook/react-vite';
import type {ComponentType} from 'react';
import {useArgs} from 'storybook/preview-api';
import * as UI from '@parya/design-system';
import {examples} from '@parya/design-system/examples';

const example=examples.find(e=>e.name==="SummaryStrip")!;

const meta={title:"Content & records/SummaryStrip",tags:['autodocs'],argTypes:{"items":{"description":"{ label: string; value: ReactNode; hint?: string }[]","table":{"type":{"summary":"{ label: string; value: ReactNode; hint?: string }[]"}},"control":false}},parameters:{controls:{disable:true},docs:{source:{code:"import {Money, SummaryStrip} from \"@parya/design-system\";\nimport \"@parya/design-system/styles.css\";\n\nexport function SummaryStripExample() {\n\nreturn (<SummaryStrip items={[{label:\"Total bookings\",value:\"128\"},{label:\"Booking value\",value:<Money value={3240000}/>}]} />);\n}",language:'tsx'},description:{component:"Deprecated compatibility for frozen historical previews. For new work use KpiStrip with real scoped navigation. Ruled KPI strip: 48px pink icon tiles, overline labels (never clipped), Onest/mono values coloured by tone, hints. Columns follow the strip's own width: 4 → 2 at ≤ 900px; ≤ 620px every strip is 2 compact columns (small inline icon); 1 column only at ≤ 340px — an 8-item strip is 4 short rows on a phone. Bleeds to the page edges inside RecordOverviewLayout and DashboardPageTemplate.\n\nPackage: @parya/design-system@0.3.1. Components share this library release.\n\nConnected foundations\nSummaryStrip uses the shared Parya foundations. Its own styles and composed children determine which tokens apply; the values are maintained in one component library.\n\nAccessibility\nKeep data labels, dates, amounts and record identities understandable in context. Use named native controls for any actions in the supplied content.\n\nExperimental. See the documentation website for the full API and Paper guidance."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<typeof meta>;

export const Default:Story={render:()=> <example.Demo/>};
