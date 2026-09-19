// ─────────────────────────────────────────────────────────────────────────
// Measurement simulation.
//
// For each requested basis we:
//   1. Determine the *expected* (legitimate, theoretical) distribution from
//      the signer's real θ — this is what the server has on record.
//   2. Determine the distribution actually "emitted" given the active
//      attack (see attacks.ts) and sample `shots` outcomes from it using
//      the shared RNG (optionally seeded for reproducibility).
//   3. If CHANNEL_MANIPULATION is active, probabilistically bit-flip each
//      individual sampled outcome (X-type disturbance) — this happens in
//      transit, independent of what was actually prepared.
//   4. Compare observed vs expected counts to get a chi-square statistic
//      and mismatch (total variation distance) per basis.
// ─────────────────────────────────────────────────────────────────────────

import type {
  AttackConfig,
  Basis,
  BasisMeasurement,
  MeasurementResult,
} from "../types/simulation";
import { distributionForBasis } from "./quantumState";
import { actualEmittedDistribution } from "./attacks";
import { chiSquareStatistic, totalVariationDistance } from "./statistics";
import type { RngFn } from "../utils/rng";

function sampleOutcome(p0: number, rng: RngFn): 0 | 1 {
  return rng() < p0 ? 0 : 1;
}

function measureSingleBasis(
  basis: "Z" | "X" | "Y",
  legitimateTheta: number,
  shots: number,
  attack: AttackConfig,
  rng: RngFn
): BasisMeasurement {
  const expected = distributionForBasis(basis, legitimateTheta);
  const emitted = actualEmittedDistribution(basis, legitimateTheta, attack);

  let count0 = 0;
  let count1 = 0;
  let flips = 0;

  for (let i = 0; i < shots; i++) {
    let outcome = sampleOutcome(emitted.p0, rng);

    if (attack.type === "CHANNEL_MANIPULATION" && rng() < attack.flipProbability) {
      outcome = outcome === 0 ? 1 : 0;
      flips++;
    }

    if (outcome === 0) count0++;
    else count1++;
  }

  if (attack.type === "CHANNEL_MANIPULATION" && attack.channel) {
    attack.channel.bitsFlipped += flips;
    attack.channel.totalBits += shots;
    attack.channel.disturbanceOccurred = attack.channel.disturbanceOccurred || flips > 0;
  }

  const expectedCounts: [number, number] = [expected.p0 * shots, expected.p1 * shots];
  const observedCounts: [number, number] = [count0, count1];
  const observedDistribution = { p0: count0 / shots, p1: count1 / shots };

  const chiSquare = chiSquareStatistic(
    [observedCounts[0], observedCounts[1]],
    [expectedCounts[0], expectedCounts[1]]
  );
  const mismatch = totalVariationDistance(observedDistribution.p0, expected.p0);

  return {
    basis,
    shots,
    expected,
    expectedCounts,
    observedCounts,
    observedDistribution,
    mismatch,
    chiSquare,
    degreesOfFreedom: 1,
  };
}

export function runMeasurement(
  basis: Basis,
  legitimateTheta: number,
  shots: number,
  attack: AttackConfig,
  rng: RngFn
): MeasurementResult {
  const bases: Array<"Z" | "X" | "Y"> = basis === "ALL" ? ["Z", "X", "Y"] : [basis];
  const perBasis = bases.map((b) => measureSingleBasis(b, legitimateTheta, shots, attack, rng));

  const overallChiSquare = perBasis.reduce((sum, m) => sum + m.chiSquare, 0);
  const overallDegreesOfFreedom = perBasis.length;
  const overallMismatch = perBasis.reduce((sum, m) => sum + m.mismatch, 0) / perBasis.length;

  return {
    basis,
    shots,
    perBasis,
    overallMismatch,
    overallChiSquare,
    overallDegreesOfFreedom,
  };
}
