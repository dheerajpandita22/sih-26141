import { zBasisDistribution } from "../simulation/quantumState";
import { fmtPct } from "../utils/format";
import { ProgressBar } from "./ui";

const SIZE = 220;
const R = 82;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function BlochGlyph({ theta, accent = "#5eead4" }: { theta: number; accent?: string }) {
  const px = CX + R * Math.sin(theta);
  const py = CY - R * Math.cos(theta);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto block" width="100%" style={{ maxWidth: 240 }}>
      {/* outer sphere ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={1} />
      {/* equator ellipse (perspective) */}
      <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.32} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth={1} />
      {/* axes */}
      <line x1={CX - R - 14} y1={CY} x2={CX + R + 14} y2={CY} stroke="rgba(148,163,184,0.18)" strokeWidth={1} />
      <line x1={CX} y1={CY - R - 14} x2={CX} y2={CY + R + 14} stroke="rgba(148,163,184,0.18)" strokeWidth={1} />

      {/* state vector */}
      <line x1={CX} y1={CY} x2={px} y2={py} stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <circle cx={px} cy={py} r={5.5} fill={accent} />
      <circle cx={px} cy={py} r={9} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={2.5} fill="rgba(148,163,184,0.7)" />

      {/* labels */}
      <text x={CX} y={CY - R - 20} textAnchor="middle" className="fill-slate-400" fontSize="11" fontFamily="JetBrains Mono, monospace">
        |0⟩
      </text>
      <text x={CX} y={CY + R + 28} textAnchor="middle" className="fill-slate-400" fontSize="11" fontFamily="JetBrains Mono, monospace">
        |1⟩
      </text>
      <text x={CX + R + 20} y={CY + 4} textAnchor="middle" className="fill-slate-500" fontSize="10" fontFamily="JetBrains Mono, monospace">
        |+⟩
      </text>
      <text x={CX - R - 20} y={CY + 4} textAnchor="middle" className="fill-slate-500" fontSize="10" fontFamily="JetBrains Mono, monospace">
        |−⟩
      </text>
    </svg>
  );
}

export function QuantumStatePanel({ theta }: { theta: number }) {
  const dist = zBasisDistribution(theta);
  return (
    <div className="space-y-5">
      <BlochGlyph theta={theta} />
      <div className="rounded-lg border border-cyan-glow/15 bg-cyan-glow/[0.04] px-4 py-3 text-center font-mono text-[13px] text-cyan-glow/90">
        |ψ(θ)⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩
      </div>
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="text-slate-400">Probability |0⟩</span>
            <span className="font-mono text-slate-200">{fmtPct(dist.p0)}</span>
          </div>
          <ProgressBar value={dist.p0} tone="client" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="text-slate-400">Probability |1⟩</span>
            <span className="font-mono text-slate-200">{fmtPct(dist.p1)}</span>
          </div>
          <ProgressBar value={dist.p1} tone="server" />
        </div>
      </div>
    </div>
  );
}
