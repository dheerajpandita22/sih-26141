import { ChevronRight, type LucideIcon } from "lucide-react";

export type CompartmentAccent = "client" | "server" | "neutral" | "legit" | "flag" | "warn";

const ACCENT_ICON_WRAP: Record<CompartmentAccent, string> = {
  client: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20",
  server: "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20",
  neutral: "bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/20",
  legit: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
  flag: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20",
  warn: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
};

export interface InfoCompartmentProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: CompartmentAccent;
  badge?: { label: string; tone: CompartmentAccent };
  disabled?: boolean;
  onClick: () => void;
}

export function InfoCompartment({
  icon: Icon,
  title,
  description,
  accent = "neutral",
  badge,
  disabled,
  onClick,
}: InfoCompartmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`glass-card group relative flex w-full flex-col gap-3 rounded-xl p-4 text-left transition
        ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_ICON_WRAP[accent]}`}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ACCENT_ICON_WRAP[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[13px] font-semibold tracking-wide text-slate-100">{title}</h3>
        <p className="mt-1 text-[12px] leading-snug text-slate-400">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1 pt-1 text-[11px] font-medium text-slate-500 transition group-hover:text-cyan-glow">
        Inspect
        <ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
