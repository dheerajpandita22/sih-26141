// ─────────────────────────────────────────────────────────────────────────
// SIH26141 — Quantum Signature Verification & Threat Detection
// Core domain types shared by the simulation engine, Client page and
// Server page. This is a classical (non-quantum) frontend simulation that
// models the statistical behaviour described in the build guide.
// ─────────────────────────────────────────────────────────────────────────

export type Basis = "Z" | "X" | "Y" | "ALL";

export type AttackType =
  | "NONE"
  | "FORGERY"
  | "IMPERSONATION"
  | "REPLAY"
  | "CHANNEL_MANIPULATION";

export type TransmissionStage =
  | "IDLE"
  | "PREPARING"
  | "TELEPORTING"
  | "TRANSMITTING"
  | "RECEIVED"
  | "VERIFIED"
  | "FLAGGED";

export type TeleportStep =
  | "IDLE"
  | "STATE_PREP"
  | "BELL_PAIR"
  | "ALICE_MEASURE"
  | "CLASSICAL_CORRECTION"
  | "BOB_RECEIVE"
  | "DONE";

export interface QuantumSignature {
  id: string;
  theta: number; // radians, the legitimate/expected signer angle
  thetaDegrees: number;
  stateLabel: string; // e.g. "|ψ(θ)⟩"
  preparation: string; // "RY(θ)|0⟩"
  createdAt: number; // epoch ms
}

export interface SessionInfo {
  sessionId: string;
  requestId: string;
  nonce: string;
  previousNonce: string | null;
  timestamp: number; // epoch ms
  status: "ACTIVE" | "EXPIRED" | "REPLAYED";
  isReplay: boolean;
  freshnessValidMs: number; // freshness window used for the check
  ageMs: number;
}

export interface ChannelState {
  status: "IDLE" | "OPEN" | "TRANSMITTING" | "CLOSED";
  attackOccurred: boolean;
  disturbanceProbability: number; // 0..1, only meaningful for CHANNEL_MANIPULATION
  tampered: boolean;
  receivedStateStatus: "PENDING" | "INTACT" | "CORRUPTED";
}

export interface ForgeryDetail {
  expectedTheta: number;
  attackerTheta: number;
  angleDifferenceRad: number;
  angleDifferenceDeg: number;
}

export interface ImpersonationDetail {
  expectedStateLabel: string;
  receivedStateLabel: string;
  receivedPreparation: string;
}

export interface ReplayDetail {
  currentNonce: string;
  previousNonce: string | null;
  reused: boolean;
}

export interface ChannelManipulationDetail {
  flipProbability: number;
  bitsFlipped: number;
  totalBits: number;
  disturbanceOccurred: boolean;
}

export interface AttackConfig {
  type: AttackType;
  flipProbability: number; // used by CHANNEL_MANIPULATION, 0..1
  forgery?: ForgeryDetail;
  impersonation?: ImpersonationDetail;
  replay?: ReplayDetail;
  channel?: ChannelManipulationDetail;
}

export interface BasisDistribution {
  p0: number;
  p1: number;
}

export interface BasisMeasurement {
  basis: "Z" | "X" | "Y";
  shots: number;
  expected: BasisDistribution; // theoretical, from the expected θ
  expectedCounts: [number, number];
  observedCounts: [number, number]; // [count0, count1]
  observedDistribution: BasisDistribution;
  mismatch: number; // total variation distance between observed and expected
  chiSquare: number;
  degreesOfFreedom: number;
}

export interface MeasurementResult {
  basis: Basis;
  shots: number;
  perBasis: BasisMeasurement[]; // 1 entry unless basis === "ALL" (then 3)
  overallMismatch: number;
  overallChiSquare: number;
  overallDegreesOfFreedom: number;
}

export interface DetectorResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  mismatchRate: number;
  alpha: number;
  mismatchThreshold: number;
  statisticalVerdict: "LEGITIMATE" | "FLAGGED";
  reason: string;
}

export interface SessionCheckResult {
  freshnessValid: boolean;
  replayDetected: boolean;
  reason: string;
}

export interface FinalVerdict {
  verdict: "LEGITIMATE" | "FLAGGED";
  signatureAccepted: boolean;
  sessionValid: boolean;
  reasonSummary: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  message: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
}

export interface SimulationHistoryEntry {
  id: string;
  timestamp: number;
  theta: number;
  basis: Basis;
  shots: number;
  attack: AttackType;
  pValue: number;
  mismatch: number;
  chiSquare: number;
  verdict: "LEGITIMATE" | "FLAGGED";
  sessionValid: boolean;
}

export interface ConfusionMatrixCounts {
  TP: number;
  TN: number;
  FP: number;
  FN: number;
}

export interface ConditionMetric extends ConfusionMatrixCounts {
  condition: AttackType;
  trials: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  detectionRate: number; // for attack conditions: TP / (TP+FN); for NONE: FP rate
}

export interface BatchMetricsResult {
  trialsPerCondition: number;
  runAt: number;
  conditions: ConditionMetric[];
  overall: ConfusionMatrixCounts & {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
}

export interface SignatureConfig {
  theta: number;
  basis: Basis;
  shots: number;
  seed: string | null;
}

/** Pure result of running one full protocol trial (signature → teleport →
 * measure → detect → verdict) with no UI/animation concerns attached. Used
 * both by the interactive single-run flow and by the batch metrics engine. */
export interface TrialResult {
  signature: QuantumSignature;
  session: SessionInfo;
  attackConfig: AttackConfig;
  channel: ChannelState;
  measurement: MeasurementResult;
  detector: DetectorResult;
  sessionCheck: SessionCheckResult;
  finalVerdict: FinalVerdict;
}

export interface SimulationState {
  signature: QuantumSignature | null;
  session: SessionInfo | null;
  config: SignatureConfig;
  attackConfig: AttackConfig;
  transmission: TransmissionStage;
  teleportStep: TeleportStep;
  channel: ChannelState;
  measurement: MeasurementResult | null;
  detector: DetectorResult | null;
  sessionCheck: SessionCheckResult | null;
  finalVerdict: FinalVerdict | null;
  isRunning: boolean;
  logs: AuditLogEntry[];
  history: SimulationHistoryEntry[];
  batchMetrics: BatchMetricsResult | null;
  knownNonces: string[]; // used to detect replay
  lastSession: SessionInfo | null; // used by the "reuse old session" demo action
}
