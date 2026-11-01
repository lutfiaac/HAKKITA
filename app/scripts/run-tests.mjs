import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
await mkdir(".qa", { recursive: true });
await build({
  entryPoints: ["src/App.jsx"],
  outfile: ".qa/app.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom"],
  loader: { ".css": "empty" },
  logLevel: "error",
});
await build({
  entryPoints: ["src/ProgramCarousel.jsx"],
  outfile: ".qa/carousel.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom"],
  loader: { ".css": "empty" },
  logLevel: "error",
});
await build({
  entryPoints: ["src/ProgramDetail.jsx"],
  outfile: ".qa/program-detail.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom"],
  logLevel: "error",
});
await build({
  entryPoints: ["src/AuthPage.jsx"],
  outfile: ".qa/auth-page.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom"],
  logLevel: "error",
});
const result = spawnSync(
  process.execPath,
  [
    "--test",
    "--test-isolation=none",
    "tests/data.test.mjs",
    "tests/program-detail.test.mjs",
    "tests/auth.test.mjs",
    "tests/homepage-featured.test.mjs",
    "tests/profile.test.mjs",
    "tests/account.test.mjs",
    "tests/ui.test.mjs",
    "tests/sites-worker.test.mjs",
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
