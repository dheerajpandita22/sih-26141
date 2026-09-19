import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </h4>
  );
}

export function DataRow({
  label,
  value,
  mono = true,
  valueClass = "",
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-base-600/50 py-2 last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className={`text-right text-[12.5px] text-slate-200 ${mono ? "font-mono" : ""} ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-base-600/60 bg-base-850/60 p-4 ${className}`}>{children}</div>;
}

export function EquationBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-glow/15 bg-cyan-glow/[0.04] px-4 py-3 text-center font-mono text-[14px] tracking-wide text-cyan-glow/90">
      {children}
    </div>
  );
}

type Tone = "legit" | "flag" | "warn" | "neutral" | "client" | "server";

const TONE_CLASSES: Record<Tone, string> = {
  legit: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/25",
  flag: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25",
  warn: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25",
  neutral: "bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/20",
  client: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/25",
  server: "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/25",
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral" }: { tone?: Tone }) {
  const dotClass: Record<Tone, string> = {
    legit: "bg-emerald-400",
    flag: "bg-rose-400",
    warn: "bg-amber-400",
    neutral: "bg-slate-400",
    client: "bg-sky-400",
    server: "bg-violet-400",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass[tone]}`} />;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-base-500 py-10 text-center">
      <p className="max-w-xs text-[12.5px] text-slate-500">{message}</p>
    </div>
  );
}

export function ProgressBar({ value, tone = "neutral" }: { value: number; tone?: Tone }) {
  const barClass: Record<Tone, string> = {
    legit: "bg-emerald-400",
    flag: "bg-rose-400",
    warn: "bg-amber-400",
    neutral: "bg-slate-400",
    client: "bg-sky-400",
    server: "bg-violet-400",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-700">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClass[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}
