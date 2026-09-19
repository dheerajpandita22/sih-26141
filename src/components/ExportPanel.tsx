import { Download, FileJson, FileSpreadsheet, Trash2 } from "lucide-react";
import type { BatchMetricsResult, SimulationHistoryEntry } from "../types/simulation";
import { Card, SectionLabel } from "./ui";
import {
  exportBatchMetricsCsv,
  exportBatchMetricsJson,
  exportHistoryCsv,
  exportHistoryJson,
} from "../simulation/exportResults";

function ExportButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-lg border border-base-600/60 bg-base-800/60 px-3 py-2.5 text-[12.5px] font-medium text-slate-300 transition hover:border-cyan-glow/40 hover:text-cyan-glow disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export function ExportPanel({
  history,
  batchMetrics,
  onReset,
}: {
  history: SimulationHistoryEntry[];
  batchMetrics: BatchMetricsResult | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Simulation History ({history.length} runs)</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <ExportButton icon={FileSpreadsheet} label="Export CSV" onClick={() => exportHistoryCsv(history)} disabled={history.length === 0} />
          <ExportButton icon={FileJson} label="Export JSON" onClick={() => exportHistoryJson(history)} disabled={history.length === 0} />
        </div>
      </div>

      <div>
        <SectionLabel>Batch Metrics</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <ExportButton
            icon={FileSpreadsheet}
            label="Export CSV"
            onClick={() => batchMetrics && exportBatchMetricsCsv(batchMetrics)}
            disabled={!batchMetrics}
          />
          <ExportButton
            icon={FileJson}
            label="Export JSON"
            onClick={() => batchMetrics && exportBatchMetricsJson(batchMetrics)}
            disabled={!batchMetrics}
          />
        </div>
        {!batchMetrics && <p className="mt-2 text-[11px] text-slate-600">Run a batch evaluation from the Metrics compartment first.</p>}
      </div>

      <Card className="!border-rose-400/20 !bg-rose-400/[0.03]">
        <SectionLabel>Danger Zone</SectionLabel>
        <p className="mb-3 text-[11.5px] text-slate-500">
          Clears all persisted state: session, signature, verdict, history, and batch metrics from local storage.
        </p>
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-[12.5px] font-medium text-rose-300 transition hover:bg-rose-400/20"
        >
          <Trash2 size={14} />
          Reset All Data
        </button>
      </Card>
    </div>
  );
}
