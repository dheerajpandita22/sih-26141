// ─────────────────────────────────────────────────────────────────────────
// Batch evaluation: runs N trials for each condition (NO ATTACK, FORGERY,
// IMPERSONATION, REPLAY, CHANNEL_MANIPULATION), aggregates a confusion
// matrix and derives accuracy / precision / recall / F1 from the *actual*
// generated trial outcomes — nothing here is a hardcoded example number.
// ─────────────────────────────────────────────────────────────────────────

import type {
  AttackType,
  BatchMetricsResult,
  ConditionMetric,
  SignatureConfig,
} from "../types/simulation";
import { runTrial, isAttackCondition } from "./engine";
import { createSession } from "./session";
import { createRng } from "../utils/rng";

export const METRIC_CONDITIONS: AttackType[] = [
  "NONE",
  "FORGERY",
  "IMPERSONATION",
  "REPLAY",
  "CHANNEL_MANIPULATION",
];

function safeDiv(n: number, d: number): number {
  return d === 0 ? 0 : n / d;
}

export function runBatchMetrics(
  config: SignatureConfig,
  flipProbability: number,
  trialsPerCondition: number,
  seed: string | null
): BatchMetricsResult {
  const rng = createRng(seed);
  const conditions: ConditionMetric[] = [];

  for (const condition of METRIC_CONDITIONS) {
    let TP = 0,
      TN = 0,
      FP = 0,
      FN = 0;

    const knownNonces: string[] = [];
    // For REPLAY we need a genuine prior session to replay against, so we
    // seed one "legitimate" session before the batch begins.
    let lastSession = condition === "REPLAY" ? createSession(rng, null) : null;
    if (lastSession) knownNonces.push(lastSession.nonce);

    for (let i = 0; i < trialsPerCondition; i++) {
      const result = runTrial({
        config,
        attackType: condition,
        flipProbability,
        knownNonces,
        lastSession,
        rng,
      });

      const predictedAttack = result.finalVerdict.verdict === "FLAGGED";
      const actualAttack = isAttackCondition(condition);

      if (actualAttack && predictedAttack) TP++;
      else if (actualAttack && !predictedAttack) FN++;
      else if (!actualAttack && predictedAttack) FP++;
      else TN++;

      knownNonces.push(result.session.nonce);
      // Keep replaying the same original session on every trial so the
      // condition consistently represents "an attacker resends an old,
      // already-used signature" rather than drifting to fresh sessions.
      if (condition !== "REPLAY") lastSession = result.session;
    }

    const trials = trialsPerCondition;
    const accuracy = safeDiv(TP + TN, trials);
    const precision = safeDiv(TP, TP + FP);
    const recall = safeDiv(TP, TP + FN);
    const f1 = precision + recall === 0 ? 0 : safeDiv(2 * precision * recall, precision + recall);
    const detectionRate = isAttackCondition(condition) ? safeDiv(TP, TP + FN) : safeDiv(FP, FP + TN);

    conditions.push({ condition, trials, TP, TN, FP, FN, accuracy, precision, recall, f1, detectionRate });
  }

  const overallTP = conditions.filter((c) => c.condition !== "NONE").reduce((s, c) => s + c.TP, 0);
  const overallFN = conditions.filter((c) => c.condition !== "NONE").reduce((s, c) => s + c.FN, 0);
  const noneCond = conditions.find((c) => c.condition === "NONE")!;
  const overallTN = noneCond.TN;
  const overallFP = noneCond.FP;

  const overallAccuracy = safeDiv(overallTP + overallTN, overallTP + overallTN + overallFP + overallFN);
  const overallPrecision = safeDiv(overallTP, overallTP + overallFP);
  const overallRecall = safeDiv(overallTP, overallTP + overallFN);
  const overallF1 =
    overallPrecision + overallRecall === 0
      ? 0
      : safeDiv(2 * overallPrecision * overallRecall, overallPrecision + overallRecall);

  return {
    trialsPerCondition,
    runAt: Date.now(),
    conditions,
    overall: {
      TP: overallTP,
      TN: overallTN,
      FP: overallFP,
      FN: overallFN,
      accuracy: overallAccuracy,
      precision: overallPrecision,
      recall: overallRecall,
      f1: overallF1,
    },
  };
}
