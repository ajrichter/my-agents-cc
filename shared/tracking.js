/**
 * Shared tracking system for agent pipeline.
 * Manages JSON status files in each target repo's .agent-tracking/ directory.
 *
 * Status file structure:
 *   .agent-tracking/
 *     pipeline-status.json    — overall pipeline state
 *     discoverer-output.json  — Agent 1 output
 *     builder-output.json     — Agent 2 output
 *     inspector-output.json   — Agent 3 output
 *     change-manifest.json    — all files modified across agents
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const TRACKING_DIR = ".agent-tracking";

const AGENT_PHASES = {
  discoverer: { order: 1, label: "Discovery" },
  builder: { order: 2, label: "Build" },
  inspector: { order: 3, label: "Inspection" },
};

/**
 * Ensure tracking directory exists in target repo.
 */
export function ensureTrackingDir(repoPath) {
  const dir = join(repoPath, TRACKING_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Read a tracking JSON file. Returns null if missing.
 */
export function readTrackingFile(repoPath, filename) {
  const filepath = join(repoPath, TRACKING_DIR, filename);
  if (!existsSync(filepath)) return null;
  return JSON.parse(readFileSync(filepath, "utf-8"));
}

/**
 * Write a tracking JSON file.
 */
export function writeTrackingFile(repoPath, filename, data) {
  const dir = ensureTrackingDir(repoPath);
  const filepath = join(dir, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  return filepath;
}

/**
 * Initialize or update the pipeline status.
 */
export function initPipelineStatus(repoPath, endpointsFile) {
  const existing = readTrackingFile(repoPath, "pipeline-status.json");
  const status = existing || {
    pipelineId: `pipeline-${Date.now()}`,
    repoPath,
    endpointsFile,
    startedAt: new Date().toISOString(),
    phases: {},
    overallStatus: "initialized",
  };

  for (const [agent, meta] of Object.entries(AGENT_PHASES)) {
    if (!status.phases[agent]) {
      status.phases[agent] = {
        order: meta.order,
        label: meta.label,
        status: "pending",
        startedAt: null,
        completedAt: null,
        outputFile: `${agent}-output.json`,
        errors: [],
      };
    }
  }

  writeTrackingFile(repoPath, "pipeline-status.json", status);
  return status;
}

/**
 * Mark an agent phase as started.
 */
export function markPhaseStarted(repoPath, agentName) {
  const status = readTrackingFile(repoPath, "pipeline-status.json");
  if (!status) throw new Error("Pipeline not initialized. Run initPipelineStatus first.");
  status.phases[agentName].status = "in_progress";
  status.phases[agentName].startedAt = new Date().toISOString();
  status.overallStatus = `${agentName}_in_progress`;
  writeTrackingFile(repoPath, "pipeline-status.json", status);
  return status;
}

/**
 * Mark an agent phase as completed.
 */
export function markPhaseCompleted(repoPath, agentName, summary = {}) {
  const status = readTrackingFile(repoPath, "pipeline-status.json");
  status.phases[agentName].status = "completed";
  status.phases[agentName].completedAt = new Date().toISOString();
  status.phases[agentName].summary = summary;
  status.overallStatus = `${agentName}_completed`;

  // Check if all phases done
  const allDone = Object.values(status.phases).every((p) => p.status === "completed");
  if (allDone) {
    status.overallStatus = "pipeline_completed";
    status.completedAt = new Date().toISOString();
  }

  writeTrackingFile(repoPath, "pipeline-status.json", status);
  return status;
}

/**
 * Mark an agent phase as failed.
 */
export function markPhaseFailed(repoPath, agentName, error) {
  const status = readTrackingFile(repoPath, "pipeline-status.json");
  status.phases[agentName].status = "failed";
  status.phases[agentName].errors.push({
    message: error,
    timestamp: new Date().toISOString(),
  });
  status.overallStatus = `${agentName}_failed`;
  writeTrackingFile(repoPath, "pipeline-status.json", status);
  return status;
}

/**
 * Record a changed file in the manifest.
 */
export function recordChange(repoPath, agentName, filePath, changeType, description) {
  const manifest = readTrackingFile(repoPath, "change-manifest.json") || {
    changes: [],
    scanCoverage: {},
  };

  manifest.changes.push({
    agent: agentName,
    file: filePath,
    changeType, // "created" | "modified" | "deleted"
    description,
    timestamp: new Date().toISOString(),
  });

  writeTrackingFile(repoPath, "change-manifest.json", manifest);
  return manifest;
}

/**
 * Record scan coverage (which files/dirs were scanned by discoverer).
 */
export function recordScanCoverage(repoPath, scannedPaths, totalFiles) {
  const manifest = readTrackingFile(repoPath, "change-manifest.json") || {
    changes: [],
    scanCoverage: {},
  };

  manifest.scanCoverage = {
    scannedPaths,
    totalFiles,
    scannedAt: new Date().toISOString(),
    coverageComplete: true,
  };

  writeTrackingFile(repoPath, "change-manifest.json", manifest);
  return manifest;
}

/**
 * Get a printable status summary.
 */
export function getStatusSummary(repoPath) {
  const status = readTrackingFile(repoPath, "pipeline-status.json");
  if (!status) return { exists: false, message: "No pipeline initialized for this repo." };

  const phases = Object.entries(status.phases)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([name, phase]) => ({
      agent: name,
      label: phase.label,
      status: phase.status,
      startedAt: phase.startedAt,
      completedAt: phase.completedAt,
      errorCount: phase.errors?.length || 0,
    }));

  return {
    exists: true,
    pipelineId: status.pipelineId,
    overallStatus: status.overallStatus,
    phases,
  };
}
