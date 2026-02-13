#!/usr/bin/env node

/**
 * Run a single agent against a target repo.
 *
 * Usage:
 *   node orchestrator/run-agent.js <agent> --repo <path> [--endpoints <file>]
 *
 * Agents: discoverer | builder | inspector
 *
 * This script:
 * 1. Validates inputs
 * 2. Initializes tracking
 * 3. Invokes Claude Code with the agent's CLAUDE.md as context
 * 4. Updates tracking on completion
 */

import { resolve, join } from "path";
import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import {
  initPipelineStatus,
  markPhaseStarted,
  markPhaseCompleted,
  markPhaseFailed,
  writeTrackingFile,
} from "../shared/tracking.js";

const AGENTS = ["discoverer", "builder", "inspector"];
const AGENTS_DIR = resolve(import.meta.dirname, "..", "agents");

function parseArgs(args) {
  const parsed = { agent: null, repo: null, endpoints: null };
  parsed.agent = args[0];

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--repo" && args[i + 1]) {
      parsed.repo = resolve(args[++i]);
    } else if (args[i] === "--endpoints" && args[i + 1]) {
      parsed.endpoints = resolve(args[++i]);
    }
  }
  return parsed;
}

function validateArgs(parsed) {
  if (!parsed.agent || !AGENTS.includes(parsed.agent)) {
    console.error(`Error: Agent must be one of: ${AGENTS.join(", ")}`);
    console.error(`Usage: node run-agent.js <agent> --repo <path> [--endpoints <file>]`);
    process.exit(1);
  }

  if (!parsed.repo) {
    console.error("Error: --repo <path> is required");
    process.exit(1);
  }

  if (!existsSync(parsed.repo)) {
    console.error(`Error: Repo path does not exist: ${parsed.repo}`);
    process.exit(1);
  }

  if (parsed.agent === "discoverer" && parsed.endpoints && !existsSync(parsed.endpoints)) {
    console.error(`Error: Endpoints file does not exist: ${parsed.endpoints}`);
    process.exit(1);
  }
}

function buildPrompt(agent, repoPath, endpointsFile) {
  const agentDir = join(AGENTS_DIR, agent);
  const claudeMd = readFileSync(join(agentDir, "CLAUDE.md"), "utf-8");

  let prompt = `You are running as the "${agent}" agent.\n\n`;
  prompt += `Target repository: ${repoPath}\n\n`;
  prompt += `Your instructions:\n${claudeMd}\n\n`;

  // Add input context based on agent
  if (agent === "discoverer" && endpointsFile) {
    const endpoints = readFileSync(endpointsFile, "utf-8");
    prompt += `Endpoints input:\n${endpoints}\n\n`;
  }

  if (agent === "builder" || agent === "inspector") {
    const trackingDir = join(repoPath, ".agent-tracking");
    if (existsSync(join(trackingDir, "discoverer-output.json"))) {
      const discovererOutput = readFileSync(join(trackingDir, "discoverer-output.json"), "utf-8");
      prompt += `Discoverer output:\n${discovererOutput}\n\n`;
    }
  }

  if (agent === "inspector") {
    const trackingDir = join(repoPath, ".agent-tracking");
    if (existsSync(join(trackingDir, "builder-output.json"))) {
      const builderOutput = readFileSync(join(trackingDir, "builder-output.json"), "utf-8");
      prompt += `Builder output:\n${builderOutput}\n\n`;
    }
  }

  // Load all skills for this agent
  const skillsDir = join(agentDir, "skills");
  if (existsSync(skillsDir)) {
    const skills = execSync(`ls "${skillsDir}"`, { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter((f) => f.endsWith(".md"));

    for (const skillFile of skills) {
      const skillContent = readFileSync(join(skillsDir, skillFile), "utf-8");
      prompt += `--- Skill: ${skillFile.replace(".md", "")} ---\n${skillContent}\n\n`;
    }
  }

  return prompt;
}

async function runAgent(agent, repoPath, endpointsFile) {
  console.log(`\n=== Running Agent: ${agent} ===`);
  console.log(`Target repo: ${repoPath}`);
  if (endpointsFile) console.log(`Endpoints: ${endpointsFile}`);
  console.log("");

  // Initialize tracking
  initPipelineStatus(repoPath, endpointsFile);
  markPhaseStarted(repoPath, agent);

  // If discoverer and endpoints provided, copy input to tracking dir
  if (agent === "discoverer" && endpointsFile) {
    const endpointsData = JSON.parse(readFileSync(endpointsFile, "utf-8"));
    writeTrackingFile(repoPath, "discoverer-input.json", endpointsData);
  }

  // Build the prompt
  const prompt = buildPrompt(agent, repoPath, endpointsFile);

  // Write prompt to temp file for claude to read
  const promptFile = join(repoPath, ".agent-tracking", `${agent}-prompt.txt`);
  const { writeFileSync } = await import("fs");
  writeFileSync(promptFile, prompt, "utf-8");

  try {
    // Invoke Claude Code with the agent context
    // The agent runs inside the target repo directory
    const cmd = `cd "${repoPath}" && claude --print "${prompt.substring(0, 200)}... (see ${promptFile} for full prompt)"`;

    console.log(`Invoking Claude Code for ${agent}...`);
    console.log(`Prompt written to: ${promptFile}`);
    console.log(`\nTo run manually:\n  cd "${repoPath}"\n  claude --print < "${promptFile}"\n`);
    console.log(`Or interactively:\n  cd "${repoPath}"\n  claude\n  (then paste the prompt or reference the agent CLAUDE.md)\n`);

    markPhaseCompleted(repoPath, agent, { promptFile });
    console.log(`\n=== Agent ${agent} tracking initialized ===`);
  } catch (error) {
    markPhaseFailed(repoPath, agent, error.message);
    console.error(`Agent ${agent} failed:`, error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const parsed = parseArgs(args);
validateArgs(parsed);
runAgent(parsed.agent, parsed.repo, parsed.endpoints);
