import type {Preview} from '@storybook/react-vite';
import {ThemeProvider,Toaster,type Theme} from '@parya/design-system';
import '@parya/design-system/styles.css';
const preview:Preview={
 globalTypes:{theme:{description:'Parya theme',toolbar:{title:'Theme',icon:'circlehollow',items:[{value:'light',title:'Light'},{value:'dark',title:'Dark'}],dynamicTitle:true}}},
 initialGlobals:{theme:'light'},
 decorators:[(Story,context)=><ThemeProvider theme={context.globals.theme as Theme}><div style={{padding:24,background:'var(--pt-color-bg-surface)',minHeight:160}}><Story/></div><Toaster/></ThemeProvider>],
 parameters:{layout:'padded',controls:{expanded:true},a11y:{test:'error'},options:{storySort:{order:['Get started','Primitives','Forms & validation','Content & records','Tables & collections','Shell & navigation','Overlays & feedback','Boards & workflow','Pricing & finance','Icons']}}}
};
export default preview;
