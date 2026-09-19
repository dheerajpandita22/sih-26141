// ─────────────────────────────────────────────────────────────────────────
// Threat Detector — the statistical half of verification.
//
// Decision rule (from the build guide):
//   LEGITIMATE  if  p-value >= α   AND   mismatch rate <= mismatchThreshold
//   FLAGGED     otherwise
//
// This module only judges *measurement statistics*. Replay / session
// freshness is judged separately in session.ts, and the two are combined
// into a FinalVerdict in useSimulation.ts — this mirrors the guide's
// instruction that statistics alone are not sufficient for replay
// detection.
// ─────────────────────────────────────────────────────────────────────────

import type { DetectorResult, MeasurementResult } from "../types/simulation";
import { chiSquarePValue } from "./statistics";

export const DEFAULT_ALPHA = 0.05;
export const DEFAULT_MISMATCH_THRESHOLD = 0.15;

export function runThreatDetector(
  measurement: MeasurementResult,
  alpha: number = DEFAULT_ALPHA,
  mismatchThreshold: number = DEFAULT_MISMATCH_THRESHOLD
): DetectorResult {
  const chiSquare = measurement.overallChiSquare;
  const df = measurement.overallDegreesOfFreedom;
  const pValue = chiSquarePValue(chiSquare, df);
  const mismatchRate = measurement.overallMismatch;

  const statsPass = pValue >= alpha;
  const mismatchPass = mismatchRate <= mismatchThreshold;
  const verdict: "LEGITIMATE" | "FLAGGED" = statsPass && mismatchPass ? "LEGITIMATE" : "FLAGGED";

  let reason: string;
  if (verdict === "LEGITIMATE") {
    reason = "Observed measurements are statistically consistent with the expected signature.";
  } else if (!mismatchPass && !statsPass) {
    reason =
      "Observed distribution is statistically inconsistent with the expected signature, and the measurement mismatch exceeded the configured threshold.";
  } else if (!mismatchPass) {
    reason = "Measurement mismatch exceeded the configured threshold.";
  } else {
    reason = "Observed distribution is statistically inconsistent with the expected signature.";
  }

  return {
    chiSquare,
    degreesOfFreedom: df,
    pValue,
    mismatchRate,
    alpha,
    mismatchThreshold,
    statisticalVerdict: verdict,
    reason,
  };
}
