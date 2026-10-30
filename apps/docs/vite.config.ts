import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { packageAliases } from "../../shared/vite-aliases.ts";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  plugins: [react()],
  resolve: { alias: packageAliases, dedupe: ["react", "react-dom"] },
  base: process.env.DOCS_BASE || "/",
  server: { fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] } },
  build: { outDir: "dist", emptyOutDir: true },
});
