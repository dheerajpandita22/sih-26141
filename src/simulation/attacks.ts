// ─────────────────────────────────────────────────────────────────────────
// Attack models, following the SIH26141 build guide's attack section:
//
//  FORGERY               — attacker prepares the signature with an incorrect
//                           / random rotation angle instead of the signer's
//                           real secret θ.
//  IMPERSONATION         — attacker sends a generic |+⟩ = H|0⟩ state instead
//                           of a θ-dependent signature.
//  REPLAY                — attacker resubmits a previously used signature /
//                           session. Caught by nonce / session freshness
//                           checks, NOT by statistics.
//  CHANNEL_MANIPULATION  — probabilistic bit-flip (X) disturbance applied to
//                           each transmitted shot with a configurable
//                           probability.
// ─────────────────────────────────────────────────────────────────────────

import type {
  AttackConfig,
  AttackType,
  BasisDistribution,
} from "../types/simulation";
import { normalizeTheta, plusStateDistribution, distributionForBasis } from "./quantumState";
import { radToDeg } from "../utils/format";

export const DEFAULT_FLIP_PROBABILITY = 0.3;

/** Pick a random "wrong" rotation angle for the FORGERY attack. Retries a
 * few times to make sure it is meaningfully different from the real θ so
 * the demo reliably shows a detectable forgery. */
export function pickForgeryTheta(expectedTheta: number, rng: () => number): number {
  let candidate = expectedTheta;
  for (let i = 0; i < 8; i++) {
    candidate = rng() * Math.PI * 2;
    const diff = angularDifference(candidate, expectedTheta);
    if (diff > 0.55) break; // > ~31.5°, ensures a visible statistical gap
  }
  return normalizeTheta(candidate);
}

/** Smallest angular difference between two angles, wrapped into [0, π]. */
export function angularDifference(a: number, b: number): number {
  let diff = Math.abs(normalizeTheta(a) - normalizeTheta(b));
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
}

export function buildAttackConfig(
  type: AttackType,
  expectedTheta: number,
  flipProbability: number,
  currentNonce: string,
  previousNonce: string | null,
  reusedNonce: boolean,
  rng: () => number
): AttackConfig {
  const base: AttackConfig = { type, flipProbability };

  if (type === "FORGERY") {
    const attackerTheta = pickForgeryTheta(expectedTheta, rng);
    const diff = angularDifference(attackerTheta, expectedTheta);
    base.forgery = {
      expectedTheta,
      attackerTheta,
      angleDifferenceRad: diff,
      angleDifferenceDeg: radToDeg(diff),
    };
  }

  if (type === "IMPERSONATION") {
    base.impersonation = {
      expectedStateLabel: "|ψ(θ)⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩",
      receivedStateLabel: "|+⟩ = (|0⟩ + |1⟩) / √2",
      receivedPreparation: "H|0⟩",
    };
  }

  if (type === "REPLAY") {
    base.replay = {
      currentNonce,
      previousNonce,
      reused: reusedNonce,
    };
  }

  if (type === "CHANNEL_MANIPULATION") {
    base.channel = {
      flipProbability,
      bitsFlipped: 0,
      totalBits: 0,
      disturbanceOccurred: false,
    };
  }

  return base;
}

/** The distribution actually "emitted onto the wire" for a given basis,
 * given the current attack configuration. This is what gets sampled from —
 * the Threat Detector then compares observed counts against the *expected*
 * (legitimate) distribution to see how far reality drifted. */
export function actualEmittedDistribution(
  basis: "Z" | "X" | "Y",
  legitimateTheta: number,
  attack: AttackConfig
): BasisDistribution {
  switch (attack.type) {
    case "FORGERY":
      return distributionForBasis(basis, attack.forgery?.attackerTheta ?? legitimateTheta);
    case "IMPERSONATION":
      return plusStateDistribution(basis);
    case "NONE":
    case "REPLAY":
    case "CHANNEL_MANIPULATION":
    default:
      // Channel manipulation disturbs bits post-sampling (see measurement.ts),
      // not the underlying emitted state, so the "true" emitted distribution
      // here is still the legitimate one.
      return distributionForBasis(basis, legitimateTheta);
  }
}
