import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[react()],base:process.env.DOCS_BASE || '/',server:{fs:{allow:[fileURLToPath(new URL('..',import.meta.url))]}},build:{outDir:'dist',emptyOutDir:true}});
