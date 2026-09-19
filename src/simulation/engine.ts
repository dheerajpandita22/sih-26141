// ─────────────────────────────────────────────────────────────────────────
// Protocol engine: signature → (attack) → channel → measurement →
// threat detector → session check → combined final verdict.
//
// This is intentionally UI-free and synchronous so it can be reused by:
//   • the interactive "CREATE & SEND SIGNATURE" flow (wrapped with staged
//     animation delays in useSimulation.ts)
//   • the batch Metrics engine, which needs to run hundreds of trials fast
// ─────────────────────────────────────────────────────────────────────────

import type {
  AttackType,
  ChannelState,
  FinalVerdict,
  SessionInfo,
  SignatureConfig,
  TrialResult,
} from "../types/simulation";
import { createSignature } from "./quantumState";
import { createSession, createReplayedSession, evaluateSession } from "./session";
import { buildAttackConfig } from "./attacks";
import { runMeasurement } from "./measurement";
import { runThreatDetector, DEFAULT_ALPHA, DEFAULT_MISMATCH_THRESHOLD } from "./detector";
import type { RngFn } from "../utils/rng";

export interface EngineParams {
  config: SignatureConfig;
  attackType: AttackType;
  flipProbability: number;
  knownNonces: string[];
  lastSession: SessionInfo | null;
  rng: RngFn;
  alpha?: number;
  mismatchThreshold?: number;
}

export function runTrial(params: EngineParams): TrialResult {
  const {
    config,
    attackType,
    flipProbability,
    knownNonces,
    lastSession,
    rng,
    alpha = DEFAULT_ALPHA,
    mismatchThreshold = DEFAULT_MISMATCH_THRESHOLD,
  } = params;

  const signature = createSignature(config.theta, rng);

  // REPLAY: deliberately reuse a prior session/nonce instead of minting a
  // fresh one. Falls back to a normal fresh session if there is no prior
  // session yet to replay (first-ever run).
  const session: SessionInfo =
    attackType === "REPLAY" && lastSession
      ? createReplayedSession(lastSession)
      : createSession(rng, lastSession);

  const reusedNonce = attackType === "REPLAY" && !!lastSession;

  const attackConfig = buildAttackConfig(
    attackType,
    signature.theta,
    flipProbability,
    session.nonce,
    lastSession?.nonce ?? null,
    reusedNonce,
    rng
  );

  const channel: ChannelState = {
    status: "TRANSMITTING",
    attackOccurred: attackType !== "NONE",
    disturbanceProbability: attackType === "CHANNEL_MANIPULATION" ? flipProbability : 0,
    tampered: attackType === "FORGERY" || attackType === "IMPERSONATION" || attackType === "CHANNEL_MANIPULATION",
    receivedStateStatus: "PENDING",
  };

  const measurement = runMeasurement(config.basis, signature.theta, config.shots, attackConfig, rng);

  if (attackConfig.type === "CHANNEL_MANIPULATION" && attackConfig.channel) {
    channel.receivedStateStatus = attackConfig.channel.disturbanceOccurred ? "CORRUPTED" : "INTACT";
  } else if (attackType === "FORGERY" || attackType === "IMPERSONATION") {
    channel.receivedStateStatus = "CORRUPTED";
  } else {
    channel.receivedStateStatus = "INTACT";
  }

  const detector = runThreatDetector(measurement, alpha, mismatchThreshold);
  const sessionCheck = evaluateSession(session, knownNonces);

  const overallFlagged = detector.statisticalVerdict === "FLAGGED" || sessionCheck.replayDetected || !sessionCheck.freshnessValid;

  let reasonSummary: string;
  if (sessionCheck.replayDetected) {
    reasonSummary = "Session replay detected — nonce reuse.";
  } else if (!sessionCheck.freshnessValid) {
    reasonSummary = "Session freshness check failed.";
  } else {
    reasonSummary = detector.reason;
  }

  const finalVerdict: FinalVerdict = {
    verdict: overallFlagged ? "FLAGGED" : "LEGITIMATE",
    signatureAccepted: !overallFlagged,
    sessionValid: !sessionCheck.replayDetected && sessionCheck.freshnessValid,
    reasonSummary,
  };

  return { signature, session, attackConfig, channel, measurement, detector, sessionCheck, finalVerdict };
}

/** Ground truth for metrics: was this trial actually an attack? */
export function isAttackCondition(type: AttackType): boolean {
  return type !== "NONE";
}
