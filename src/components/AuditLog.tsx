import type { AuditLogEntry } from "../types/simulation";
import { EmptyState } from "./ui";
import { fmtTime } from "../utils/format";

const LEVEL_COLOR: Record<AuditLogEntry["level"], string> = {
  INFO: "text-slate-400",
  SUCCESS: "text-emerald-400",
  WARN: "text-amber-400",
  ERROR: "text-rose-400",
};

const LEVEL_DOT: Record<AuditLogEntry["level"], string> = {
  INFO: "bg-slate-500",
  SUCCESS: "bg-emerald-400",
  WARN: "bg-amber-400",
  ERROR: "bg-rose-400",
};

export function AuditLog({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return <EmptyState message="No audit events yet. Server activity will be logged here as requests are processed." />;
  }

  const reversed = [...logs].reverse();

  return (
    <div className="max-h-[60vh] space-y-1 overflow-y-auto rounded-lg border border-base-600/60 bg-base-950/60 p-3 font-mono text-[12px]">
      {reversed.map((log) => (
        <div key={log.id} className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-base-800/50">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[log.level]}`} />
          <span className="shrink-0 text-slate-600">[{fmtTime(log.timestamp)}]</span>
          <span className={LEVEL_COLOR[log.level]}>{log.message}</span>
        </div>
      ))}
    </div>
  );
}
