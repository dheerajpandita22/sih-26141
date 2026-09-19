import type { BatchMetricsResult, SimulationHistoryEntry } from "../types/simulation";

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportHistoryCsv(history: SimulationHistoryEntry[]): void {
  const headers = [
    "timestamp",
    "theta_rad",
    "basis",
    "shots",
    "attack",
    "chi_square",
    "p_value",
    "mismatch",
    "verdict",
    "session_valid",
  ];
  const rows = history.map((h) =>
    [
      new Date(h.timestamp).toISOString(),
      h.theta.toFixed(6),
      h.basis,
      h.shots,
      h.attack,
      h.chiSquare.toFixed(6),
      h.pValue.toFixed(6),
      h.mismatch.toFixed(6),
      h.verdict,
      h.sessionValid ? "VALID" : "INVALID",
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  downloadBlob(`sih26141_history_${Date.now()}.csv`, csv, "text/csv");
}

export function exportHistoryJson(history: SimulationHistoryEntry[]): void {
  downloadBlob(
    `sih26141_history_${Date.now()}.json`,
    JSON.stringify(history, null, 2),
    "application/json"
  );
}

export function exportBatchMetricsCsv(result: BatchMetricsResult): void {
  const headers = ["condition", "trials", "TP", "TN", "FP", "FN", "accuracy", "precision", "recall", "f1", "detection_rate"];
  const rows = result.conditions.map((c) =>
    [c.condition, c.trials, c.TP, c.TN, c.FP, c.FN, c.accuracy.toFixed(4), c.precision.toFixed(4), c.recall.toFixed(4), c.f1.toFixed(4), c.detectionRate.toFixed(4)]
      .map(csvEscape)
      .join(",")
  );
  rows.push(
    ["OVERALL", result.trialsPerCondition * result.conditions.length, result.overall.TP, result.overall.TN, result.overall.FP, result.overall.FN, result.overall.accuracy.toFixed(4), result.overall.precision.toFixed(4), result.overall.recall.toFixed(4), result.overall.f1.toFixed(4), ""]
      .map(csvEscape)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  downloadBlob(`sih26141_metrics_${Date.now()}.csv`, csv, "text/csv");
}

export function exportBatchMetricsJson(result: BatchMetricsResult): void {
  downloadBlob(`sih26141_metrics_${Date.now()}.json`, JSON.stringify(result, null, 2), "application/json");
}
