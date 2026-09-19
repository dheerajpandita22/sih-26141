import { ShieldOff, UserX, Copy, Waves, Ban, PlayCircle, Loader2, AlertTriangle } from "lucide-react";
import type { AttackConfig, AttackType, ChannelState } from "../types/simulation";
import { Card, DataRow, Pill, SectionLabel } from "./ui";
import { fmtDeg, fmtPct, fmtRad } from "../utils/format";

const OPTIONS: { type: AttackType; label: string; icon: typeof ShieldOff; hint: string }[] = [
  { type: "NONE", label: "No Attack", icon: ShieldOff, hint: "Legitimate traffic only" },
  { type: "FORGERY", label: "Forgery", icon: Copy, hint: "Wrong rotation angle" },
  { type: "IMPERSONATION", label: "Impersonation", icon: UserX, hint: "Generic |+⟩ state" },
  { type: "REPLAY", label: "Replay", icon: Copy, hint: "Reused session / nonce" },
  { type: "CHANNEL_MANIPULATION", label: "Channel Manipulation", icon: Waves, hint: "Probabilistic bit-flip" },
];

export function AttackSimulationPanel({
  attackType,
  setAttackType,
  flipProbability,
  setFlipProbability,
  lastAttackConfig,
  channel,
  isRunning,
  onRun,
}: {
  attackType: AttackType;
  setAttackType: (t: AttackType) => void;
  flipProbability: number;
  setFlipProbability: (p: number) => void;
  lastAttackConfig: AttackConfig | null;
  channel: ChannelState | null;
  isRunning: boolean;
  onRun: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Attack Scenario</SectionLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = attackType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setAttackType(opt.type)}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-cyan-glow/40 bg-cyan-glow/[0.06]"
                    : "border-base-600/60 bg-base-850/40 hover:border-base-500"
                }`}
              >
                <Icon size={16} className={selected ? "mt-0.5 text-cyan-glow" : "mt-0.5 text-slate-500"} />
                <span>
                  <span className={`block text-[12.5px] font-semibold ${selected ? "text-cyan-glow" : "text-slate-200"}`}>
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-slate-500">{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {attackType === "CHANNEL_MANIPULATION" && (
        <div>
          <SectionLabel>Flip Probability</SectionLabel>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(flipProbability * 100)}
              onChange={(e) => setFlipProbability(Number(e.target.value) / 100)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-base-700 accent-cyan-glow"
            />
            <span className="w-14 shrink-0 text-right font-mono text-[13px] text-cyan-glow">
              {fmtPct(flipProbability, 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">Default 30% — each transmitted bit is flipped with this probability.</p>
        </div>
      )}

      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-400/15 px-4 py-2.5 text-[13px] font-semibold text-violet-300 ring-1 ring-violet-400/30 transition hover:bg-violet-400/25 disabled:opacity-50"
      >
        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
        Run Simulation
      </button>

      <div>
        <SectionLabel>Last Run — Internal Detail</SectionLabel>
        {!lastAttackConfig || lastAttackConfig.type === "NONE" ? (
          <Card>
            <p className="text-[12px] text-slate-500">No attack was active on the last run.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {lastAttackConfig.type === "FORGERY" && lastAttackConfig.forgery && (
              <Card>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-[12px] font-semibold text-rose-300">Forgery attempt</span>
                </div>
                <DataRow label="Expected θ" value={fmtRad(lastAttackConfig.forgery.expectedTheta)} />
                <DataRow label="Attacker θ" value={fmtRad(lastAttackConfig.forgery.attackerTheta)} />
                <DataRow label="Angle difference" value={fmtDeg(lastAttackConfig.forgery.angleDifferenceDeg)} />
              </Card>
            )}

            {lastAttackConfig.type === "IMPERSONATION" && lastAttackConfig.impersonation && (
              <Card>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-[12px] font-semibold text-rose-300">Impersonation attempt</span>
                </div>
                <DataRow label="Expected signature" value={lastAttackConfig.impersonation.expectedStateLabel} mono={false} />
                <DataRow label="Received signature" value={lastAttackConfig.impersonation.receivedStateLabel} mono={false} />
                <DataRow label="Received preparation" value={lastAttackConfig.impersonation.receivedPreparation} />
              </Card>
            )}

            {lastAttackConfig.type === "REPLAY" && lastAttackConfig.replay && (
              <Card className={lastAttackConfig.replay.reused ? "!border-rose-400/30 !bg-rose-400/[0.04]" : undefined}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-rose-300">Replay attempt</span>
                  {lastAttackConfig.replay.reused && <Pill tone="flag">REPLAY DETECTED</Pill>}
                </div>
                <DataRow label="Current nonce" value={lastAttackConfig.replay.currentNonce} />
                <DataRow label="Previous nonce" value={lastAttackConfig.replay.previousNonce ?? "—"} />
                <DataRow label="Nonce reused" value={lastAttackConfig.replay.reused ? "YES" : "NO"} />
              </Card>
            )}

            {lastAttackConfig.type === "CHANNEL_MANIPULATION" && lastAttackConfig.channel && (
              <Card>
                <div className="mb-2 flex items-center gap-2">
                  <Ban size={14} className="text-rose-400" />
                  <span className="text-[12px] font-semibold text-rose-300">Channel manipulation</span>
                </div>
                <DataRow label="Disturbance probability" value={fmtPct(lastAttackConfig.channel.flipProbability, 0)} />
                <DataRow label="Bits flipped" value={`${lastAttackConfig.channel.bitsFlipped} / ${lastAttackConfig.channel.totalBits}`} />
                <DataRow
                  label="Disturbance occurred"
                  value={lastAttackConfig.channel.disturbanceOccurred ? "YES" : "NO"}
                  valueClass={lastAttackConfig.channel.disturbanceOccurred ? "text-rose-300" : "text-emerald-300"}
                />
              </Card>
            )}

            {channel && (
              <Card>
                <DataRow label="Channel status" value={channel.status} />
                <DataRow label="Tampered" value={channel.tampered ? "YES" : "NO"} />
                <DataRow label="Received-state status" value={channel.receivedStateStatus} />
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
