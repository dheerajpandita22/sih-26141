import type { TeleportStep } from "../types/simulation";
import { CIRCUIT_TRACKS, TELEPORT_STEP_LABELS, TELEPORT_STEP_ORDER } from "../simulation/teleportation";

const WIRE_X_START = 70;
const GATE_GAP = 78;
const WIRE_Y: Record<string, number> = { Q0: 46, Q1: 118, Q2: 190 };
const GATE_SIZE = 34;

function stepRank(step: TeleportStep): number {
  return TELEPORT_STEP_ORDER.indexOf(step);
}

export function QuantumCircuit({ activeStep }: { activeStep: TeleportStep }) {
  const activeRank = stepRank(activeStep);
  const width = WIRE_X_START + GATE_GAP * 4 + 80;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-base-600/60 bg-base-950/50 p-4">
        <svg viewBox={`0 0 ${width} 240`} width="100%" style={{ minWidth: 520 }}>
          {CIRCUIT_TRACKS.map((track) => {
            const y = WIRE_Y[track.id];
            return (
              <g key={track.id}>
                <line x1={WIRE_X_START - 30} y1={y} x2={width - 20} y2={y} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />
                <text x={8} y={y + 4} fontSize="12" fontFamily="JetBrains Mono, monospace" className="fill-slate-300">
                  {track.id}
                </text>
                <text x={8} y={y + 18} fontSize="8.5" fontFamily="Inter, sans-serif" className="fill-slate-600">
                  {track.role}
                </text>

                {track.gates.map((gate, i) => {
                  const gx = WIRE_X_START + i * GATE_GAP;
                  const gateRank = stepRank(gate.step);
                  const isDone = gateRank < activeRank || activeStep === "DONE";
                  const isCurrent = gateRank === activeRank && activeStep !== "IDLE";
                  const isMeasure = gate.label === "M";

                  const fill = isCurrent
                    ? "rgba(94,234,212,0.18)"
                    : isDone
                    ? "rgba(94,234,212,0.07)"
                    : "rgba(19,26,44,0.9)";
                  const stroke = isCurrent
                    ? "#5eead4"
                    : isDone
                    ? "rgba(94,234,212,0.4)"
                    : "rgba(148,163,184,0.28)";
                  const textColor = isCurrent || isDone ? "#5eead4" : "rgba(148,163,184,0.65)";

                  return (
                    <g key={gate.id} className={isCurrent ? "animate-pulse-ring-none" : ""}>
                      {isMeasure ? (
                        <path
                          d={`M ${gx - GATE_SIZE / 2} ${y - GATE_SIZE / 2} h ${GATE_SIZE} v ${GATE_SIZE} h -${GATE_SIZE} z`}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={1.3}
                          rx={4}
                        />
                      ) : (
                        <rect
                          x={gx - GATE_SIZE / 2}
                          y={y - GATE_SIZE / 2}
                          width={GATE_SIZE}
                          height={GATE_SIZE}
                          rx={6}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={1.3}
                        />
                      )}
                      <text
                        x={gx}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontFamily="JetBrains Mono, monospace"
                        fill={textColor}
                        fontWeight={600}
                      >
                        {gate.label}
                      </text>
                      {isCurrent && (
                        <circle cx={gx} cy={y} r={GATE_SIZE / 2 + 6} fill="none" stroke="#5eead4" strokeOpacity={0.5} strokeWidth={1.2}>
                          <animate attributeName="r" values={`${GATE_SIZE / 2 + 4};${GATE_SIZE / 2 + 12}`} dur="1.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0" dur="1.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* classical double-line for correction, connecting Q1/Q2 measurement outcomes conceptually */}
          <line
            x1={WIRE_X_START + 2 * GATE_GAP}
            y1={WIRE_Y.Q1 + 10}
            x2={WIRE_X_START + 3 * GATE_GAP}
            y2={WIRE_Y.Q2 - 10}
            stroke={activeRank >= stepRank("CLASSICAL_CORRECTION") ? "#a78bfa" : "rgba(148,163,184,0.2)"}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TELEPORT_STEP_ORDER.filter((s) => s !== "IDLE").map((s) => {
          const isActive = s === activeStep;
          const isDone = stepRank(s) < activeRank || activeStep === "DONE";
          return (
            <span
              key={s}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium transition ${
                isActive
                  ? "bg-cyan-glow/15 text-cyan-glow ring-1 ring-cyan-glow/40"
                  : isDone
                  ? "bg-base-700/60 text-slate-400"
                  : "bg-base-800/60 text-slate-600"
              }`}
            >
              {TELEPORT_STEP_LABELS[s]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
