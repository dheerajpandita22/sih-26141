import { User, ServerIcon, AlertTriangle, Atom } from "lucide-react";
import type { TransmissionStage } from "../types/simulation";

const ACTIVE_STAGES: TransmissionStage[] = ["PREPARING", "TELEPORTING", "TRANSMITTING", "RECEIVED"];

export function ProtocolFlowBanner({
  stage,
  attackOccurred,
}: {
  stage: TransmissionStage;
  attackOccurred: boolean;
}) {
  const packetRunning = ACTIVE_STAGES.includes(stage);
  const done = stage === "VERIFIED" || stage === "FLAGGED";
  const showAttack = attackOccurred && (stage === "TRANSMITTING" || stage === "RECEIVED" || done);

  return (
    <div className="glass-panel relative overflow-hidden rounded-xl px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sky-300">
          <User size={16} />
          <span className="text-[12px] font-semibold tracking-wide">CLIENT</span>
        </div>

        <div className="relative mx-2 h-px flex-1 bg-base-500">
          {packetRunning && (
            <div className="absolute -top-[5px] left-0 animate-packet-move">
              <Atom size={11} className="text-cyan-glow" />
            </div>
          )}
          {showAttack && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <AlertTriangle size={15} className="text-rose-400" />
            </div>
          )}
          <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider text-slate-500">
            Quantum Channel
          </span>
        </div>

        <div className="flex items-center gap-2 text-violet-300">
          <span className="text-[12px] font-semibold tracking-wide">SERVER</span>
          <ServerIcon size={16} />
        </div>
      </div>

      {done && (
        <div
          className={`mt-3 text-center text-[11px] font-medium uppercase tracking-wider ${
            stage === "VERIFIED" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {stage === "VERIFIED" ? "Signature verified — legitimate" : "Signature flagged"}
        </div>
      )}
    </div>
  );
}
