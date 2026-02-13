#!/usr/bin/env node

/**
 * Reset pipeline tracking for a repo (start fresh).
 *
 * Usage:
 *   node orchestrator/reset.js --repo <path> [--phase <agent>]
 *
 * Without --phase: resets everything
 * With --phase: resets only that phase and later phases
 */

import { resolve, join } from "path";
import { existsSync, rmSync, readdirSync } from "fs";
import { initPipelineStatus, readTrackingFile, writeTrackingFile } from "../shared/tracking.js";

const args = process.argv.slice(2);
let repo = null;
let phase = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--repo" && args[i + 1]) repo = resolve(args[++i]);
  if (args[i] === "--phase" && args[i + 1]) phase = args[++i];
}

if (!repo) {
  console.error("Usage: node reset.js --repo <path> [--phase <agent>]");
  process.exit(1);
}

const trackingDir = join(repo, ".agent-tracking");

if (!phase) {
  // Full reset
  if (existsSync(trackingDir)) {
    rmSync(trackingDir, { recursive: true });
    console.log(`Removed: ${trackingDir}`);
  }
  console.log("Pipeline fully reset.");
} else {
  // Phase reset
  const phaseOrder = { discoverer: 1, builder: 2, inspector: 3 };
  const resetFrom = phaseOrder[phase];

  if (!resetFrom) {
    console.error(`Unknown phase: ${phase}. Use: discoverer, builder, inspector`);
    process.exit(1);
  }

  const status = readTrackingFile(repo, "pipeline-status.json");
  if (!status) {
    console.log("No pipeline to reset.");
    process.exit(0);
  }

  // Reset this phase and all later phases
  for (const [name, meta] of Object.entries(phaseOrder)) {
    if (meta >= resetFrom && status.phases[name]) {
      status.phases[name].status = "pending";
      status.phases[name].startedAt = null;
      status.phases[name].completedAt = null;
      status.phases[name].errors = [];
      status.phases[name].summary = null;

      // Remove output files
      const outputFile = join(trackingDir, `${name}-output.json`);
      if (existsSync(outputFile)) {
        rmSync(outputFile);
        console.log(`Removed: ${name}-output.json`);
      }
    }
  }

  status.overallStatus = resetFrom === 1 ? "initialized" : `${phase}_pending`;
  writeTrackingFile(repo, "pipeline-status.json", status);
  console.log(`Reset from phase: ${phase} (and later phases)`);
}
