import type { Basis } from "../types/simulation";
import { SectionLabel } from "./ui";
import { degToRad, fmtDeg, fmtRad, radToDeg } from "../utils/format";

const THETA_PRESETS_DEG = [0, 30, 45, 60, 90, 120, 180, 270, 360];
const SHOT_PRESETS = [100, 500, 1000, 2000, 5000, 10000];
const BASIS_OPTIONS: { value: Basis; label: string }[] = [
  { value: "Z", label: "Z" },
  { value: "X", label: "X" },
  { value: "Y", label: "Y" },
  { value: "ALL", label: "ALL" },
];

export function SignatureConfigPanel({
  theta,
  setTheta,
  basis,
  setBasis,
  shots,
  setShots,
  seed,
  setSeed,
}: {
  theta: number;
  setTheta: (t: number) => void;
  basis: Basis;
  setBasis: (b: Basis) => void;
  shots: number;
  setShots: (s: number) => void;
  seed: string | null;
  setSeed: (s: string | null) => void;
}) {
  const degrees = radToDeg(theta);

  return (
    <div className="space-y-7">
      <div>
        <SectionLabel>θ — Rotation Angle</SectionLabel>
        <div className="mb-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.001}
            value={theta}
            onChange={(e) => setTheta(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-base-700 accent-cyan-glow"
          />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500">Radians</span>
            <input
              type="number"
              step={0.001}
              min={0}
              max={Math.PI * 2}
              value={Number(theta.toFixed(4))}
              onChange={(e) => setTheta(Number(e.target.value))}
              className="w-full rounded-lg border border-base-500 bg-base-850 px-3 py-1.5 font-mono text-[12.5px] text-slate-200 outline-none focus:border-cyan-glow/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500">Degrees</span>
            <input
              type="number"
              step={1}
              min={0}
              max={360}
              value={Number(degrees.toFixed(1))}
              onChange={(e) => setTheta(degToRad(Number(e.target.value)))}
              className="w-full rounded-lg border border-base-500 bg-base-850 px-3 py-1.5 font-mono text-[12.5px] text-slate-200 outline-none focus:border-cyan-glow/50"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {THETA_PRESETS_DEG.map((d) => {
            const active = Math.abs(degrees - d) < 0.3 || (d === 360 && Math.abs(degrees) < 0.3);
            return (
              <button
                key={d}
                onClick={() => setTheta(degToRad(d === 360 ? 0 : d))}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  active ? "bg-cyan-glow/15 text-cyan-glow ring-1 ring-cyan-glow/40" : "bg-base-700/50 text-slate-400 hover:bg-base-700"
                }`}
              >
                {d}°
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          {fmtRad(theta)} · {fmtDeg(degrees)}
        </p>
      </div>

      <div>
        <SectionLabel>Measurement Basis</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {BASIS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBasis(opt.value)}
              className={`rounded-lg py-2 text-[12.5px] font-semibold transition ${
                basis === opt.value
                  ? "bg-cyan-glow/15 text-cyan-glow ring-1 ring-cyan-glow/40"
                  : "bg-base-700/50 text-slate-400 hover:bg-base-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Shots</SectionLabel>
        <div className="mb-2 flex flex-wrap gap-2">
          {SHOT_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => setShots(s)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                shots === s ? "bg-cyan-glow/15 text-cyan-glow ring-1 ring-cyan-glow/40" : "bg-base-700/50 text-slate-400 hover:bg-base-700"
              }`}
            >
              {s.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          step={1}
          value={shots}
          onChange={(e) => setShots(Math.max(1, Number(e.target.value)))}
          className="w-full rounded-lg border border-base-500 bg-base-850 px-3 py-1.5 font-mono text-[12.5px] text-slate-200 outline-none focus:border-cyan-glow/50"
          placeholder="Custom shot count"
        />
      </div>

      <div>
        <SectionLabel>Random Seed (optional)</SectionLabel>
        <input
          type="text"
          value={seed ?? ""}
          onChange={(e) => setSeed(e.target.value.length ? e.target.value : null)}
          placeholder="Leave empty for non-deterministic sampling"
          className="w-full rounded-lg border border-base-500 bg-base-850 px-3 py-1.5 font-mono text-[12.5px] text-slate-200 outline-none focus:border-cyan-glow/50"
        />
        <p className="mt-1.5 text-[11px] text-slate-600">
          Supplying a seed makes measurement sampling deterministic and reproducible.
        </p>
      </div>
    </div>
  );
}
