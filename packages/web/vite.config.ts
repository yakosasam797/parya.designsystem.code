import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  build: {
    lib: {
      entry: { index: "src/index.ts", examples: "src/examples.tsx" },
      formats: ["es"],
      fileName: (_format, name) => name,
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
      output: { entryFileNames: "[name].js" },
    },
  },
});
