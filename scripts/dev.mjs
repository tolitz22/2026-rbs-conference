import { rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const nextDir = resolve(process.cwd(), ".next");

try {
  rmSync(nextDir, { recursive: true, force: true });
} catch {
  // Ignore cleanup failures and continue starting dev server.
}

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
