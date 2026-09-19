export function fmtPct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function fmtNum(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(digits);
}

export function fmtRad(x: number, digits = 4): string {
  return `${x.toFixed(digits)} rad`;
}

export function fmtDeg(x: number, digits = 1): string {
  return `${x.toFixed(digits)}°`;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function fmtTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

export function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", { hour12: false });
}

export function fmtAgeMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s - m * 60);
  return `${m}m ${rem}s`;
}

export function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x));
}
