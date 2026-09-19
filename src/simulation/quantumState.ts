// ─────────────────────────────────────────────────────────────────────────
// Quantum signature state model
//
// The signature is prepared with an RY(θ) rotation applied to |0⟩:
//
//     |ψ(θ)⟩ = RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩
//
// This module implements only the *theoretical* probability distributions
// for measuring |ψ(θ)⟩ in the Z, X and Y bases, exactly as specified in the
// SIH26141 build guide. Sampling (i.e. turning these into observed counts)
// lives in `measurement.ts`.
// ─────────────────────────────────────────────────────────────────────────

import type { BasisDistribution, QuantumSignature } from "../types/simulation";
import { genSignatureId } from "../utils/ids";
import { radToDeg } from "../utils/format";

export const TWO_PI = Math.PI * 2;

/** Normalize an angle into [0, 2π). */
export function normalizeTheta(theta: number): number {
  let t = theta % TWO_PI;
  if (t < 0) t += TWO_PI;
  return t;
}

/** Z-basis theoretical distribution: P(0) = cos²(θ/2), P(1) = sin²(θ/2). */
export function zBasisDistribution(theta: number): BasisDistribution {
  const p0 = Math.cos(theta / 2) ** 2;
  return { p0, p1: 1 - p0 };
}

/** X-basis theoretical distribution: P(0) = ½(1 + sin θ). */
export function xBasisDistribution(theta: number): BasisDistribution {
  const p0 = 0.5 * (1 + Math.sin(theta));
  return { p0, p1: 1 - p0 };
}

/** Y-basis theoretical distribution: always maximally mixed, P(0)=P(1)=½. */
export function yBasisDistribution(_theta: number): BasisDistribution {
  return { p0: 0.5, p1: 0.5 };
}

export function distributionForBasis(
  basis: "Z" | "X" | "Y",
  theta: number
): BasisDistribution {
  switch (basis) {
    case "Z":
      return zBasisDistribution(theta);
    case "X":
      return xBasisDistribution(theta);
    case "Y":
      return yBasisDistribution(theta);
  }
}

/** The |+⟩ = H|0⟩ state used by the IMPERSONATION attack. It is the X-basis
 * +1 eigenstate, so it is deterministic in X but maximally mixed in Z / Y. */
export function plusStateDistribution(basis: "Z" | "X" | "Y"): BasisDistribution {
  if (basis === "X") return { p0: 1, p1: 0 };
  return { p0: 0.5, p1: 0.5 };
}

export function createSignature(theta: number, rng?: () => number): QuantumSignature {
  const t = normalizeTheta(theta);
  return {
    id: genSignatureId(rng),
    theta: t,
    thetaDegrees: radToDeg(t),
    stateLabel: "|ψ(θ)⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩",
    preparation: "RY(θ)|0⟩",
    createdAt: Date.now(),
  };
}
