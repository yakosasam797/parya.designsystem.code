import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run this command with npm run dev.");
const generated = spawnSync(process.execPath, [npm, "run", "generate"], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});
if (generated.status !== 0) process.exit(generated.status ?? 1);
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (process.platform === "win32")
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    else child.kill("SIGTERM");
  }
  process.exitCode = code;
}
for (const args of [
  ["run", "serve:docs"],
  ["run", "storybook", "--workspace", "parya-designsystem-storybook"],
]) {
  const child = spawn(process.execPath, [npm, ...args], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => stop(code ?? 1));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
