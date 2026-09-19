import type { SimulationHistoryEntry } from "../types/simulation";
import { EmptyState, Pill } from "./ui";
import { fmtDateTime, fmtDeg, fmtNum, fmtPct, radToDeg } from "../utils/format";

const ATTACK_LABEL: Record<string, string> = {
  NONE: "—",
  FORGERY: "Forgery",
  IMPERSONATION: "Impersonation",
  REPLAY: "Replay",
  CHANNEL_MANIPULATION: "Channel Manip.",
};

export function HistoryPanel({ history }: { history: SimulationHistoryEntry[] }) {
  if (history.length === 0) {
    return <EmptyState message="No simulation runs yet. History (last 20 runs) will appear here after you send a signature." />;
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-600">Showing the most recent {history.length} run(s), newest first.</p>
      <div className="overflow-x-auto rounded-lg border border-base-600/60">
        <table className="w-full text-[11.5px]">
          <thead className="bg-base-800/70 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              <th className="px-3 py-2 text-right font-medium">θ</th>
              <th className="px-3 py-2 text-left font-medium">Basis</th>
              <th className="px-3 py-2 text-right font-medium">Shots</th>
              <th className="px-3 py-2 text-left font-medium">Attack</th>
              <th className="px-3 py-2 text-right font-medium">p-value</th>
              <th className="px-3 py-2 text-right font-medium">Mismatch</th>
              <th className="px-3 py-2 text-center font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t border-base-600/50 font-mono text-slate-300">
                <td className="whitespace-nowrap px-3 py-2 font-sans text-slate-400">{fmtDateTime(h.timestamp)}</td>
                <td className="px-3 py-2 text-right">{fmtDeg(radToDeg(h.theta), 0)}</td>
                <td className="px-3 py-2">{h.basis}</td>
                <td className="px-3 py-2 text-right">{h.shots.toLocaleString()}</td>
                <td className="px-3 py-2 font-sans">{ATTACK_LABEL[h.attack]}</td>
                <td className="px-3 py-2 text-right">{fmtNum(h.pValue, 3)}</td>
                <td className="px-3 py-2 text-right">{fmtPct(h.mismatch)}</td>
                <td className="px-3 py-2 text-center">
                  <Pill tone={h.verdict === "LEGITIMATE" ? "legit" : "flag"}>{h.verdict}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
