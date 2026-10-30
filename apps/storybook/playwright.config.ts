import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  timeout: 90000,
  use: { baseURL: "http://127.0.0.1:6009", headless: true },
  webServer: {
    command: "npm run preview -- --port 6009",
    url: "http://127.0.0.1:6009",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
