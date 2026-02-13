#!/usr/bin/env node

/**
 * Run the pipeline across all repositories in a folder.
 *
 * Usage:
 *   node orchestrator/run-multi-repo.js --folder <path> --endpoints <file> [--max-loops 3]
 *
 * Scans <folder> for subdirectories that look like repos (have .git/ or package.json/pom.xml).
 * Runs the pipeline independently for each repo.
 * Produces a combined status report.
 */

import { resolve, join, basename } from "path";
import { existsSync, readdirSync, statSync, readFileSync } from "fs";
import {
  initPipelineStatus,
  getStatusSummary,
  writeTrackingFile,
} from "../shared/tracking.js";

function parseArgs(args) {
  const parsed = { folder: null, endpoints: null, maxLoops: 3 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--folder" && args[i + 1]) parsed.folder = resolve(args[++i]);
    if (args[i] === "--endpoints" && args[i + 1]) parsed.endpoints = resolve(args[++i]);
    if (args[i] === "--max-loops" && args[i + 1]) parsed.maxLoops = parseInt(args[++i], 10);
  }
  return parsed;
}

function isRepo(dirPath) {
  return (
    existsSync(join(dirPath, ".git")) ||
    existsSync(join(dirPath, "package.json")) ||
    existsSync(join(dirPath, "pom.xml")) ||
    existsSync(join(dirPath, "build.gradle"))
  );
}

function discoverRepos(folder) {
  const entries = readdirSync(folder);
  const repos = [];

  for (const entry of entries) {
    const fullPath = join(folder, entry);
    if (entry.startsWith(".")) continue;
    if (!statSync(fullPath).isDirectory()) continue;
    if (isRepo(fullPath)) {
      repos.push(fullPath);
    }
  }

  return repos;
}

function printMultiRepoStatus(repos) {
  console.log("\n=== Multi-Repo Pipeline Status ===\n");

  const summary = {
    total: repos.length,
    completed: 0,
    inProgress: 0,
    pending: 0,
    failed: 0,
    repos: [],
  };

  for (const repo of repos) {
    const status = getStatusSummary(repo);
    const repoName = basename(repo);

    if (!status.exists) {
      summary.pending++;
      summary.repos.push({ name: repoName, status: "pending" });
      console.log(`  [    ] ${repoName} — not started`);
    } else if (status.overallStatus === "pipeline_completed") {
      summary.completed++;
      summary.repos.push({ name: repoName, status: "completed" });
      console.log(`  [done] ${repoName} — complete`);
    } else if (status.overallStatus.includes("failed")) {
      summary.failed++;
      summary.repos.push({ name: repoName, status: "failed" });
      console.log(`  [FAIL] ${repoName} — ${status.overallStatus}`);
    } else {
      summary.inProgress++;
      summary.repos.push({ name: repoName, status: status.overallStatus });
      console.log(`  [....] ${repoName} — ${status.overallStatus}`);
    }
  }

  console.log(`\nTotal: ${summary.total} repos`);
  console.log(`  Completed: ${summary.completed}`);
  console.log(`  In Progress: ${summary.inProgress}`);
  console.log(`  Pending: ${summary.pending}`);
  console.log(`  Failed: ${summary.failed}`);

  return summary;
}

async function runMultiRepo(folder, endpoints, maxLoops) {
  console.log("=== Multi-Repo Pipeline ===");
  console.log(`Folder: ${folder}`);
  console.log(`Endpoints: ${endpoints}`);
  console.log("");

  // Discover repos
  const repos = discoverRepos(folder);
  if (repos.length === 0) {
    console.error("No repositories found in folder.");
    process.exit(1);
  }

  console.log(`Found ${repos.length} repositories:`);
  repos.forEach((r) => console.log(`  - ${basename(r)}`));
  console.log("");

  // Initialize tracking for each repo
  for (const repo of repos) {
    initPipelineStatus(repo, endpoints);

    // Copy endpoints input to each repo's tracking dir
    if (endpoints) {
      const endpointsData = JSON.parse(readFileSync(endpoints, "utf-8"));
      writeTrackingFile(repo, "discoverer-input.json", endpointsData);
    }
  }

  // Print instructions for running each repo
  console.log("=== Instructions ===\n");
  console.log("Run each repo's pipeline independently. You can run them in parallel.\n");

  for (const repo of repos) {
    const repoName = basename(repo);
    console.log(`--- ${repoName} ---`);
    console.log(`  cd "${repo}"`);
    console.log(`  # Phase 1: Discoverer`);
    console.log(`  claude --claude-md "${resolve(import.meta.dirname, "..", "agents", "discoverer", "CLAUDE.md")}"`);
    console.log(`  # Phase 2: Builder`);
    console.log(`  claude --claude-md "${resolve(import.meta.dirname, "..", "agents", "builder", "CLAUDE.md")}"`);
    console.log(`  # Phase 3: Inspector`);
    console.log(`  claude --claude-md "${resolve(import.meta.dirname, "..", "agents", "inspector", "CLAUDE.md")}"`);
    console.log("");
  }

  console.log("Or use the single-repo pipeline for each:");
  for (const repo of repos) {
    console.log(`  node orchestrator/run-pipeline.js --repo "${repo}" --endpoints "${endpoints}"`);
  }
  console.log("");

  // Print current status
  printMultiRepoStatus(repos);

  // Write combined status
  const combinedStatus = {
    folder,
    repos: repos.map((r) => ({
      path: r,
      name: basename(r),
      status: getStatusSummary(r),
    })),
    generatedAt: new Date().toISOString(),
  };

  const statusFile = join(folder, ".multi-repo-status.json");
  const { writeFileSync } = await import("fs");
  writeFileSync(statusFile, JSON.stringify(combinedStatus, null, 2), "utf-8");
  console.log(`\nCombined status written to: ${statusFile}`);
}

// Main
const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (!parsed.folder) {
  console.error("Usage: node run-multi-repo.js --folder <path> --endpoints <file> [--max-loops 3]");
  process.exit(1);
}

runMultiRepo(parsed.folder, parsed.endpoints, parsed.maxLoops);
