import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["packages/web/src/test-setup.ts"],
    include: ["packages/web/src/**/*.test.tsx"],
  },
});
