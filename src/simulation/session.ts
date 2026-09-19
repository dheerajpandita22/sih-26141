// ─────────────────────────────────────────────────────────────────────────
// Session / nonce lifecycle.
//
// The build guide is explicit that replay detection must be a session /
// timestamp / nonce freshness check, not a statistical measurement
// comparison — a replayed signature is, physically, a perfectly legitimate
// signature being resent, so the Threat Detector's chi-square test alone
// would happily call it LEGITIMATE. This module is what actually catches
// replay attacks.
// ─────────────────────────────────────────────────────────────────────────

import type { SessionCheckResult, SessionInfo } from "../types/simulation";
import { genNonce, genRequestId, genSessionId } from "../utils/ids";

/** A session is considered "fresh" if it was created within this window. */
export const FRESHNESS_WINDOW_MS = 30_000;

export function createSession(
  rng?: () => number,
  previous?: SessionInfo | null
): SessionInfo {
  const timestamp = Date.now();
  return {
    sessionId: genSessionId(rng),
    requestId: genRequestId(rng),
    nonce: genNonce(rng),
    previousNonce: previous?.nonce ?? null,
    timestamp,
    status: "ACTIVE",
    isReplay: false,
    freshnessValidMs: FRESHNESS_WINDOW_MS,
    ageMs: 0,
  };
}

/** Build a session that deliberately reuses a prior nonce/session id, for
 * the REPLAY attack demo. */
export function createReplayedSession(original: SessionInfo): SessionInfo {
  return {
    ...original,
    requestId: `${original.requestId}-R`,
    timestamp: Date.now(),
    status: "REPLAYED",
    isReplay: true,
    ageMs: 0,
  };
}

export function evaluateSession(
  session: SessionInfo,
  knownNonces: string[]
): SessionCheckResult {
  const ageMs = Date.now() - session.timestamp;
  const freshnessValid = ageMs <= session.freshnessValidMs;
  const replayDetected = session.isReplay || knownNonces.includes(session.nonce);

  if (replayDetected) {
    return {
      freshnessValid,
      replayDetected: true,
      reason: "Nonce has already been observed in a prior session — replay detected.",
    };
  }

  if (!freshnessValid) {
    return {
      freshnessValid: false,
      replayDetected: false,
      reason: "Session timestamp fell outside the freshness window.",
    };
  }

  return {
    freshnessValid: true,
    replayDetected: false,
    reason: "Nonce is unused and the session is within the freshness window.",
  };
}
