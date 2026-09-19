import { User, Sparkles, Radio, ShieldAlert, ServerIcon, Check, AlertTriangle } from "lucide-react";
import type { TransmissionStage } from "../types/simulation";
import { Pill } from "./ui";

const STAGE_ORDER: TransmissionStage[] = ["IDLE", "PREPARING", "TELEPORTING", "TRANSMITTING", "RECEIVED", "VERIFIED"];

const NODES = [
  { key: "CLIENT", label: "Client", icon: User, activeAt: ["PREPARING", "TELEPORTING", "TRANSMITTING", "RECEIVED", "VERIFIED", "FLAGGED"] },
  { key: "PREP", label: "Signature Preparation", icon: Sparkles, activeAt: ["PREPARING", "TELEPORTING", "TRANSMITTING", "RECEIVED", "VERIFIED", "FLAGGED"] },
  { key: "TELEPORT", label: "Teleportation", icon: Radio, activeAt: ["TELEPORTING", "TRANSMITTING", "RECEIVED", "VERIFIED", "FLAGGED"] },
  { key: "CHANNEL", label: "Quantum Channel", icon: ShieldAlert, activeAt: ["TRANSMITTING", "RECEIVED", "VERIFIED", "FLAGGED"] },
  { key: "SERVER", label: "Server", icon: ServerIcon, activeAt: ["RECEIVED", "VERIFIED", "FLAGGED"] },
] as const;

function stageIndex(stage: TransmissionStage): number {
  if (stage === "FLAGGED") return STAGE_ORDER.indexOf("VERIFIED");
  const i = STAGE_ORDER.indexOf(stage);
  return i === -1 ? 0 : i;
}

export function TransmissionFlow({
  stage,
  attackOccurred = false,
}: {
  stage: TransmissionStage;
  attackOccurred?: boolean;
}) {
  const idx = stageIndex(stage);
  const done = stage === "VERIFIED" || stage === "FLAGGED";

  return (
    <div className="space-y-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sequence</span>
        <Pill tone={stage === "FLAGGED" ? "flag" : stage === "VERIFIED" ? "legit" : stage === "IDLE" ? "neutral" : "warn"}>
          {stage}
        </Pill>
      </div>
      {NODES.map((node, i) => {
        const isActive = (node.activeAt as readonly string[]).includes(stage);
        const isCurrent =
          i === Math.min(idx, NODES.length - 1) && !done ? true : done && i === NODES.length - 1;
        const isChannelAttack = node.key === "CHANNEL" && attackOccurred && idx >= 3;
        const Icon = node.icon;
        return (
          <div key={node.key} className="relative flex gap-3 pb-6 last:pb-0">
            {i < NODES.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 h-full w-px ${
                  isActive ? "bg-cyan-glow/40" : "bg-base-600"
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all
                ${
                  isChannelAttack
                    ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                    : isActive
                    ? "border-cyan-glow/50 bg-cyan-glow/10 text-cyan-glow"
                    : "border-base-500 bg-base-800 text-slate-600"
                }
                ${isCurrent && stage !== "IDLE" && !done ? "animate-pulse-ring" : ""}
              `}
            >
              {isChannelAttack ? <AlertTriangle size={14} /> : <Icon size={14} strokeWidth={1.75} />}
            </div>
            <div className="pt-1">
              <p className={`text-[12.5px] font-medium ${isActive ? "text-slate-100" : "text-slate-500"}`}>
                {node.label}
              </p>
              {isChannelAttack && (
                <p className="mt-0.5 text-[11px] text-rose-300">⚠ Attack event in channel</p>
              )}
            </div>
          </div>
        );
      })}
      {done && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium ${
            stage === "VERIFIED" ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {stage === "VERIFIED" ? <Check size={14} /> : <AlertTriangle size={14} />}
          {stage === "VERIFIED" ? "Verification complete — signature verified" : "Verification complete — signature flagged"}
        </div>
      )}
    </div>
  );
}
