import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell as RCell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, PlayCircle } from "lucide-react";
import type { AttackType, BatchMetricsResult } from "../types/simulation";
import { Card, DataRow, EmptyState, SectionLabel } from "./ui";
import { fmtPct } from "../utils/format";

const TRIAL_OPTIONS = [10, 50, 100, 200, 500];

const ATTACK_LABEL: Record<AttackType, string> = {
  NONE: "No Attack",
  FORGERY: "Forgery",
  IMPERSONATION: "Impersonation",
  REPLAY: "Replay",
  CHANNEL_MANIPULATION: "Channel Manipulation",
};

function StatCard({ label, value, tone = "text-slate-100" }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="text-center">
      <p className={`text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-1 text-[10.5px] uppercase tracking-wider text-slate-500">{label}</p>
    </Card>
  );
}

export function MetricsPanel({
  result,
  isRunning,
  onRun,
}: {
  result: BatchMetricsResult | null;
  isRunning: boolean;
  onRun: (trials: number) => void;
}) {
  const [trials, setTrials] = useState(100);

  const chartData = result
    ? result.conditions.map((c) => ({
        name: ATTACK_LABEL[c.condition],
        rate: c.detectionRate,
        isFalsePositive: c.condition === "NONE",
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Batch Evaluation</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          {TRIAL_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTrials(t)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                trials === t ? "bg-cyan-glow/15 text-cyan-glow ring-1 ring-cyan-glow/40" : "bg-base-700/50 text-slate-400 hover:bg-base-700"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => onRun(trials)}
            disabled={isRunning}
            className="ml-auto flex items-center gap-2 rounded-lg bg-cyan-glow/15 px-4 py-1.5 text-[12.5px] font-semibold text-cyan-glow ring-1 ring-cyan-glow/40 transition hover:bg-cyan-glow/25 disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            Run {trials}× per condition
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          Runs {trials} trials for each of 5 conditions (No Attack, Forgery, Impersonation, Replay, Channel
          Manipulation) — {trials * 5} total simulated verifications, generated live.
        </p>
      </div>

      {!result ? (
        <EmptyState message="No batch evaluation has been run yet. Choose a trial count above and run the evaluation." />
      ) : (
        <>
          <div>
            <SectionLabel>Overall (aggregated across conditions)</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Accuracy" value={fmtPct(result.overall.accuracy)} tone="text-cyan-glow" />
              <StatCard label="Precision" value={fmtPct(result.overall.precision)} />
              <StatCard label="Recall" value={fmtPct(result.overall.recall)} />
              <StatCard label="F1 Score" value={fmtPct(result.overall.f1)} />
            </div>
          </div>

          <div>
            <SectionLabel>Detection Rate by Attack Type</SectionLabel>
            <div className="h-56 w-full rounded-lg border border-base-600/60 bg-base-850/50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 1]} />
                  <Tooltip
                    formatter={(v) => fmtPct(Number(v))}
                    contentStyle={{ background: "#0d1220", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#cbd5e1" }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => (
                      <RCell key={i} fill={d.isFalsePositive ? "#fbbf24" : "#5eead4"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">
              Amber bar = false-positive rate on legitimate (no-attack) traffic. Teal bars = true detection rate per
              attack type.
            </p>
          </div>

          <div>
            <SectionLabel>Per-Condition Breakdown</SectionLabel>
            <div className="overflow-x-auto rounded-lg border border-base-600/60">
              <table className="w-full text-[11.5px]">
                <thead className="bg-base-800/70 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Condition</th>
                    <th className="px-3 py-2 text-right font-medium">Trials</th>
                    <th className="px-3 py-2 text-right font-medium">TP</th>
                    <th className="px-3 py-2 text-right font-medium">TN</th>
                    <th className="px-3 py-2 text-right font-medium">FP</th>
                    <th className="px-3 py-2 text-right font-medium">FN</th>
                    <th className="px-3 py-2 text-right font-medium">Detection</th>
                  </tr>
                </thead>
                <tbody>
                  {result.conditions.map((c) => (
                    <tr key={c.condition} className="border-t border-base-600/50 font-mono text-slate-300">
                      <td className="px-3 py-2 font-sans text-slate-200">{ATTACK_LABEL[c.condition]}</td>
                      <td className="px-3 py-2 text-right">{c.trials}</td>
                      <td className="px-3 py-2 text-right">{c.TP}</td>
                      <td className="px-3 py-2 text-right">{c.TN}</td>
                      <td className="px-3 py-2 text-right">{c.FP}</td>
                      <td className="px-3 py-2 text-right">{c.FN}</td>
                      <td className="px-3 py-2 text-right text-cyan-glow">{fmtPct(c.detectionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DataRow label="Last run" value={new Date(result.runAt).toLocaleString("en-GB", { hour12: false })} />
        </>
      )}
    </div>
  );
}
