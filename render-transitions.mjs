/**
 * Script to render all transitions as MP4 files with black background.
 * Output files can be used in CapCut as overlays with "Screen" blend mode.
 *
 * Usage: node render-transitions.mjs
 * Or render a specific transition: node render-transitions.mjs Glitch
 */

import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const transitions = [
  "Glitch",
  "LightLeak",
  "Zoom",
  "WhipPanBlur",
  "LumaFade",
  "SpeedLines",
  "Spin",
];

const outputDir = "out/transitions";
mkdirSync(outputDir, { recursive: true });

// Check if specific transition was requested
const requested = process.argv[2];
const toRender = requested
  ? transitions.filter((t) => t.toLowerCase() === requested.toLowerCase())
  : transitions;

if (requested && toRender.length === 0) {
  console.error(
    `Transition "${requested}" not found. Available: ${transitions.join(", ")}`,
  );
  process.exit(1);
}

console.log(`\nRendering ${toRender.length} transition(s)...\n`);

for (const name of toRender) {
  const outputPath = `${outputDir}/${name}.mp4`;
  console.log(`Rendering ${name}...`);

  try {
    execSync(
      `npx remotion render ${name} ${outputPath} --codec h264`,
      { stdio: "inherit" },
    );
    console.log(`  Done: ${outputPath}\n`);
  } catch {
    console.error(`  Failed to render ${name}\n`);
  }
}

console.log("All transitions rendered!");
console.log(`Output directory: ${outputDir}/`);
console.log(`
How to use in CapCut:
1. Import the MP4 files into CapCut
2. Add as "Overlay" between two clips
3. Set Blending Mode to "Screen"
4. Adjust duration and position as needed
`);
