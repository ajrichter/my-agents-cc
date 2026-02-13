#!/usr/bin/env node

/**
 * View pipeline status for a repo.
 *
 * Usage:
 *   node orchestrator/status.js --repo <path>
 */

import { resolve, join } from "path";
import { existsSync, readFileSync } from "fs";
import { getStatusSummary, readTrackingFile } from "../shared/tracking.js";

const repo = process.argv.find((_, i, a) => a[i - 1] === "--repo");
if (!repo) {
  console.error("Usage: node status.js --repo <path>");
  process.exit(1);
}

const repoPath = resolve(repo);
const summary = getStatusSummary(repoPath);

if (!summary.exists) {
  console.log("No pipeline found for this repo.");
  process.exit(0);
}

console.log("\n=== Pipeline Status ===");
console.log(`Pipeline ID: ${summary.pipelineId}`);
console.log(`Overall: ${summary.overallStatus}\n`);

for (const phase of summary.phases) {
  const icon =
    phase.status === "completed" ? "[done]" :
    phase.status === "in_progress" ? "[....]" :
    phase.status === "failed" ? "[FAIL]" : "[    ]";

  let line = `  ${icon} ${phase.label}`;
  if (phase.startedAt) line += ` (started: ${phase.startedAt})`;
  if (phase.completedAt) line += ` (completed: ${phase.completedAt})`;
  if (phase.errorCount > 0) line += ` (${phase.errorCount} errors)`;
  console.log(line);
}

// Show change manifest if available
const manifest = readTrackingFile(repoPath, "change-manifest.json");
if (manifest?.changes?.length) {
  console.log(`\nChanges tracked: ${manifest.changes.length} files`);
  for (const change of manifest.changes) {
    console.log(`  [${change.changeType}] ${change.file} (${change.agent})`);
  }
}

if (manifest?.scanCoverage?.totalFiles) {
  console.log(`\nScan coverage: ${manifest.scanCoverage.totalFiles} files scanned`);
  console.log(`Coverage complete: ${manifest.scanCoverage.coverageComplete}`);
}

console.log("");
