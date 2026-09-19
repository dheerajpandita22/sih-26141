import type { ConfusionMatrixCounts } from "../types/simulation";
import { EmptyState } from "./ui";

function Cell({
  value,
  total,
  tone,
  label,
}: {
  value: number;
  total: number;
  tone: "correct" | "incorrect";
  label: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-4 py-6 ${
        tone === "correct" ? "border-emerald-400/25 bg-emerald-400/[0.06]" : "border-rose-400/25 bg-rose-400/[0.06]"
      }`}
    >
      <span className={`text-2xl font-bold tabular-nums ${tone === "correct" ? "text-emerald-300" : "text-rose-300"}`}>
        {value}
      </span>
      <span className="text-[10.5px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-[10.5px] text-slate-600">{pct.toFixed(1)}%</span>
    </div>
  );
}

export function ConfusionMatrix({ counts }: { counts: ConfusionMatrixCounts | null }) {
  if (!counts) {
    return <EmptyState message="Run a batch evaluation from the Metrics compartment to populate the confusion matrix." />;
  }
  const total = counts.TP + counts.TN + counts.FP + counts.FN;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[110px_1fr_1fr] gap-2 text-[11px]">
        <div />
        <div className="text-center font-semibold uppercase tracking-wider text-slate-500">Predicted: Legitimate</div>
        <div className="text-center font-semibold uppercase tracking-wider text-slate-500">Predicted: Attack</div>

        <div className="flex items-center justify-end pr-2 text-right font-semibold uppercase tracking-wider text-slate-500">
          Actual: Legitimate
        </div>
        <Cell value={counts.TN} total={total} tone="correct" label="True Negative" />
        <Cell value={counts.FP} total={total} tone="incorrect" label="False Positive" />

        <div className="flex items-center justify-end pr-2 text-right font-semibold uppercase tracking-wider text-slate-500">
          Actual: Attack
        </div>
        <Cell value={counts.FN} total={total} tone="incorrect" label="False Negative" />
        <Cell value={counts.TP} total={total} tone="correct" label="True Positive" />
      </div>
      <p className="pt-2 text-center text-[11px] text-slate-600">
        Total trials: <span className="font-mono text-slate-400">{total.toLocaleString()}</span>
      </p>
    </div>
  );
}
