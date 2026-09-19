import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentClass?: string; // tailwind text-color class for the icon/title accent
  children: ReactNode;
}

export function SideDrawer({ open, onClose, title, subtitle, icon: Icon, accentClass, children }: SideDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-base-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative flex h-full w-full max-w-xl flex-col border-l border-base-500/60 bg-base-900 shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-base-600/70 px-6 py-5">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-800 ${accentClass ?? "text-cyan-glow"}`}>
                <Icon size={18} strokeWidth={1.75} />
              </div>
            )}
            <div>
              <h2 className="text-[15px] font-semibold tracking-wide text-slate-100">{title}</h2>
              {subtitle && <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-base-800 hover:text-slate-200"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
