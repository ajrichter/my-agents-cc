#!/usr/bin/env node

/**
 * Run the full 3-agent pipeline against a target repo.
 *
 * Usage:
 *   node orchestrator/run-pipeline.js --repo <path> --endpoints <file> [--max-loops 3]
 *
 * Flow:
 *   1. Discoverer scans and plans
 *   2. Builder generates code with TDD
 *   3. Inspector validates
 *   4. If Inspector says loop → re-run Builder (up to max-loops)
 *   5. Final report
 */

import { resolve, join } from "path";
import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import {
  initPipelineStatus,
  markPhaseStarted,
  markPhaseCompleted,
  markPhaseFailed,
  readTrackingFile,
  writeTrackingFile,
  getStatusSummary,
} from "../shared/tracking.js";

function parseArgs(args) {
  const parsed = { repo: null, endpoints: null, maxLoops: 3 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--repo" && args[i + 1]) parsed.repo = resolve(args[++i]);
    if (args[i] === "--endpoints" && args[i + 1]) parsed.endpoints = resolve(args[++i]);
    if (args[i] === "--max-loops" && args[i + 1]) parsed.maxLoops = parseInt(args[++i], 10);
  }
  return parsed;
}

function printStatus(repoPath) {
  const summary = getStatusSummary(repoPath);
  if (!summary.exists) {
    console.log("No pipeline initialized.");
    return;
  }
  console.log(`\nPipeline: ${summary.pipelineId}`);
  console.log(`Status: ${summary.overallStatus}`);
  for (const phase of summary.phases) {
    const icon = phase.status === "completed" ? "[done]" :
                 phase.status === "in_progress" ? "[....]" :
                 phase.status === "failed" ? "[FAIL]" : "[    ]";
    console.log(`  ${icon} ${phase.label} (${phase.agent})`);
  }
  console.log("");
}

async function runPipeline(repo, endpoints, maxLoops) {
  console.log("=== Starting Pipeline ===");
  console.log(`Repo: ${repo}`);
  console.log(`Endpoints: ${endpoints}`);
  console.log(`Max builder loops: ${maxLoops}`);
  console.log("");

  // Initialize
  initPipelineStatus(repo, endpoints);

  // Copy endpoints input
  if (endpoints) {
    const endpointsData = JSON.parse(readFileSync(endpoints, "utf-8"));
    writeTrackingFile(repo, "discoverer-input.json", endpointsData);
  }

  // === Phase 1: Discoverer ===
  console.log("\n--- Phase 1: Discoverer (Magellan) ---");
  markPhaseStarted(repo, "discoverer");

  const discovererClaudeMd = resolve(import.meta.dirname, "..", "agents", "discoverer", "CLAUDE.md");
  console.log(`Agent CLAUDE.md: ${discovererClaudeMd}`);
  console.log(`\nRun the Discoverer agent:`);
  console.log(`  cd "${repo}"`);
  console.log(`  claude --claude-md "${discovererClaudeMd}"`);
  console.log(`\nAfter Discoverer completes, ensure output is at:`);
  console.log(`  ${join(repo, ".agent-tracking", "discoverer-output.json")}`);
  console.log(`\nThen re-run this script to continue from Phase 2.`);

  // Check if discoverer already completed
  const discovererOutput = readTrackingFile(repo, "discoverer-output.json");
  if (!discovererOutput) {
    markPhaseCompleted(repo, "discoverer", { status: "awaiting_manual_run" });
    printStatus(repo);
    console.log("Discoverer output not yet available. Run the Discoverer agent first.");
    console.log("Pipeline will resume from Builder phase on next run.");
    return;
  }
  markPhaseCompleted(repo, "discoverer", { occurrences: discovererOutput.occurrences?.length || 0 });

  // === Phase 2: Builder (with loop support) ===
  let loopCount = 0;
  let builderDone = false;

  while (!builderDone && loopCount < maxLoops) {
    loopCount++;
    console.log(`\n--- Phase 2: Builder (Bob) — Loop ${loopCount}/${maxLoops} ---`);
    markPhaseStarted(repo, "builder");

    const builderClaudeMd = resolve(import.meta.dirname, "..", "agents", "builder", "CLAUDE.md");
    console.log(`Agent CLAUDE.md: ${builderClaudeMd}`);
    console.log(`\nRun the Builder agent:`);
    console.log(`  cd "${repo}"`);
    console.log(`  claude --claude-md "${builderClaudeMd}"`);

    const builderOutput = readTrackingFile(repo, "builder-output.json");
    if (!builderOutput) {
      markPhaseCompleted(repo, "builder", { status: "awaiting_manual_run", loop: loopCount });
      printStatus(repo);
      console.log("Builder output not yet available. Run the Builder agent.");
      return;
    }
    markPhaseCompleted(repo, "builder", { loop: loopCount, ...builderOutput.testResults });

    // === Phase 3: Inspector ===
    console.log(`\n--- Phase 3: Inspector (Gadget) — After Loop ${loopCount} ---`);
    markPhaseStarted(repo, "inspector");

    const inspectorClaudeMd = resolve(import.meta.dirname, "..", "agents", "inspector", "CLAUDE.md");
    console.log(`Agent CLAUDE.md: ${inspectorClaudeMd}`);
    console.log(`\nRun the Inspector agent:`);
    console.log(`  cd "${repo}"`);
    console.log(`  claude --claude-md "${inspectorClaudeMd}"`);

    const inspectorOutput = readTrackingFile(repo, "inspector-output.json");
    if (!inspectorOutput) {
      markPhaseCompleted(repo, "inspector", { status: "awaiting_manual_run" });
      printStatus(repo);
      console.log("Inspector output not yet available. Run the Inspector agent.");
      return;
    }

    if (inspectorOutput.requiresBuilderLoop && loopCount < maxLoops) {
      console.log(`\nInspector requests Builder loop (reason: ${inspectorOutput.loopReason})`);
      // Write loop instructions for builder
      writeTrackingFile(repo, "builder-loop-instructions.json", {
        loop: loopCount + 1,
        items: inspectorOutput.loopItems || [],
        reason: inspectorOutput.loopReason,
      });
      // Reset builder and inspector phases for re-run
      markPhaseCompleted(repo, "inspector", { loopRequested: true, loop: loopCount });
    } else {
      builderDone = true;
      markPhaseCompleted(repo, "inspector", inspectorOutput.validationResults || {});
    }
  }

  // === Final Status ===
  console.log("\n=== Pipeline Complete ===");
  printStatus(repo);

  const finalInspector = readTrackingFile(repo, "inspector-output.json");
  if (finalInspector?.confidenceScore) {
    console.log(`Confidence Score: ${finalInspector.confidenceScore}/100`);
  }
  if (finalInspector?.requiresBuilderLoop && loopCount >= maxLoops) {
    console.log(`WARNING: Max loops (${maxLoops}) reached. Manual review required.`);
  }
}

// Main
const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (!parsed.repo) {
  console.error("Usage: node run-pipeline.js --repo <path> --endpoints <file> [--max-loops 3]");
  process.exit(1);
}

runPipeline(parsed.repo, parsed.endpoints, parsed.maxLoops);
