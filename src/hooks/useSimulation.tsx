import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AttackConfig,
  AttackType,
  AuditLogEntry,
  Basis,
  BatchMetricsResult,
  ChannelState,
  DetectorResult,
  FinalVerdict,
  MeasurementResult,
  QuantumSignature,
  SessionCheckResult,
  SessionInfo,
  SignatureConfig,
  SimulationHistoryEntry,
  TeleportStep,
  TransmissionStage,
} from "../types/simulation";
import { runTrial } from "../simulation/engine";
import { runBatchMetrics as runBatchMetricsEngine } from "../simulation/metrics";
import { DEFAULT_ALPHA, DEFAULT_MISMATCH_THRESHOLD } from "../simulation/detector";
import { DEFAULT_FLIP_PROBABILITY } from "../simulation/attacks";
import { createRng } from "../utils/rng";
import { genHistoryId, genLogId } from "../utils/ids";
import { loadFromStorage, saveToStorage, clearAllStorage } from "../utils/storage";

const HISTORY_LIMIT = 20;
const LOG_LIMIT = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PersistedBundle {
  config: SignatureConfig;
  flipProbability: number;
  attackType: AttackType;
  knownNonces: string[];
  lastSession: SessionInfo | null;
}

export interface SimulationContextValue {
  // configuration
  config: SignatureConfig;
  setTheta: (theta: number) => void;
  setBasis: (basis: Basis) => void;
  setShots: (shots: number) => void;
  setSeed: (seed: string | null) => void;

  attackType: AttackType;
  setAttackType: (t: AttackType) => void;
  flipProbability: number;
  setFlipProbability: (p: number) => void;

  detectorAlpha: number;
  mismatchThreshold: number;

  // live protocol state
  signature: QuantumSignature | null;
  session: SessionInfo | null;
  channel: ChannelState | null;
  measurement: MeasurementResult | null;
  detector: DetectorResult | null;
  sessionCheck: SessionCheckResult | null;
  finalVerdict: FinalVerdict | null;
  lastAttackConfig: AttackConfig | null;

  transmission: TransmissionStage;
  teleportStep: TeleportStep;
  isRunning: boolean;

  // request / incoming metadata (server-facing)
  requestStatus: "NONE" | "PENDING" | "PROCESSED";

  logs: AuditLogEntry[];
  history: SimulationHistoryEntry[];
  lastSession: SessionInfo | null;

  runFullSimulation: () => Promise<void>;

  // batch metrics
  batchMetrics: BatchMetricsResult | null;
  isRunningBatch: boolean;
  runBatch: (trialsPerCondition: number) => Promise<void>;

  resetAll: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(() => loadFromStorage<PersistedBundle>("config"), []);

  const [config, setConfig] = useState<SignatureConfig>(
    persisted?.config ?? { theta: Math.PI / 3, basis: "Z", shots: 2000, seed: null }
  );
  const [attackType, setAttackTypeState] = useState<AttackType>(persisted?.attackType ?? "NONE");
  const [flipProbability, setFlipProbabilityState] = useState<number>(
    persisted?.flipProbability ?? DEFAULT_FLIP_PROBABILITY
  );

  const [signature, setSignature] = useState<QuantumSignature | null>(
    () => loadFromStorage<QuantumSignature>("signature")
  );
  const [session, setSession] = useState<SessionInfo | null>(() => loadFromStorage<SessionInfo>("session"));
  const [channel, setChannel] = useState<ChannelState | null>(null);
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [detector, setDetector] = useState<DetectorResult | null>(null);
  const [sessionCheck, setSessionCheck] = useState<SessionCheckResult | null>(null);
  const [finalVerdict, setFinalVerdict] = useState<FinalVerdict | null>(
    () => loadFromStorage<FinalVerdict>("verdict")
  );
  const [lastAttackConfig, setLastAttackConfig] = useState<AttackConfig | null>(null);

  const [transmission, setTransmission] = useState<TransmissionStage>("IDLE");
  const [teleportStep, setTeleportStep] = useState<TeleportStep>("IDLE");
  const [isRunning, setIsRunning] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"NONE" | "PENDING" | "PROCESSED">(
    signature ? "PROCESSED" : "NONE"
  );

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [history, setHistory] = useState<SimulationHistoryEntry[]>(
    () => loadFromStorage<SimulationHistoryEntry[]>("history") ?? []
  );

  const knownNoncesRef = useRef<string[]>(persisted?.knownNonces ?? []);
  const lastSessionRef = useRef<SessionInfo | null>(persisted?.lastSession ?? null);
  const [lastSessionState, setLastSessionState] = useState<SessionInfo | null>(lastSessionRef.current);

  const [batchMetrics, setBatchMetrics] = useState<BatchMetricsResult | null>(
    () => loadFromStorage<BatchMetricsResult>("batchMetrics")
  );
  const [isRunningBatch, setIsRunningBatch] = useState(false);

  // persist config bundle whenever it changes
  useEffect(() => {
    saveToStorage("config", {
      config,
      flipProbability,
      attackType,
      knownNonces: knownNoncesRef.current.slice(-200),
      lastSession: lastSessionRef.current,
    } satisfies PersistedBundle);
  }, [config, flipProbability, attackType]);

  const pushLog = useCallback((message: string, level: AuditLogEntry["level"] = "INFO") => {
    setLogs((prev) => {
      const entry: AuditLogEntry = { id: genLogId(), timestamp: Date.now(), message, level };
      const next = [...prev, entry];
      return next.length > LOG_LIMIT ? next.slice(next.length - LOG_LIMIT) : next;
    });
  }, []);

  const setTheta = useCallback((theta: number) => setConfig((c) => ({ ...c, theta })), []);
  const setBasis = useCallback((basis: Basis) => setConfig((c) => ({ ...c, basis })), []);
  const setShots = useCallback((shots: number) => setConfig((c) => ({ ...c, shots })), []);
  const setSeed = useCallback((seed: string | null) => setConfig((c) => ({ ...c, seed })), []);
  const setAttackType = useCallback((t: AttackType) => setAttackTypeState(t), []);
  const setFlipProbability = useCallback((p: number) => setFlipProbabilityState(p), []);

  const runFullSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRequestStatus("PENDING");
    setTransmission("PREPARING");
    setTeleportStep("IDLE");
    setChannel(null);
    setMeasurement(null);
    setDetector(null);
    setSessionCheck(null);
    setFinalVerdict(null);

    pushLog("Request received", "INFO");
    await delay(420);

    pushLog("Signature preparation started (RY(θ)|0⟩)", "INFO");
    await delay(380);

    setTransmission("TELEPORTING");
    setTeleportStep("STATE_PREP");
    pushLog("Teleportation started", "INFO");
    await delay(340);
    setTeleportStep("BELL_PAIR");
    await delay(340);
    setTeleportStep("ALICE_MEASURE");
    await delay(340);
    setTeleportStep("CLASSICAL_CORRECTION");
    await delay(340);
    setTeleportStep("BOB_RECEIVE");
    await delay(300);
    setTeleportStep("DONE");
    pushLog("Teleportation completed", "SUCCESS");

    setTransmission("TRANSMITTING");
    await delay(360);

    // ── run the actual protocol trial ──────────────────────────────────
    const rng = createRng(config.seed);
    const result = runTrial({
      config,
      attackType,
      flipProbability,
      knownNonces: knownNoncesRef.current,
      lastSession: lastSessionRef.current,
      rng,
    });

    setSignature(result.signature);
    setSession(result.session);
    setChannel(result.channel);
    setLastAttackConfig(result.attackConfig);

    if (result.channel.attackOccurred) {
      pushLog(
        attackType === "CHANNEL_MANIPULATION"
          ? "Channel manipulation detected in transit"
          : attackType === "FORGERY"
          ? `Forgery attempt: attacker θ deviates by ${result.attackConfig.forgery?.angleDifferenceDeg.toFixed(1)}°`
          : attackType === "IMPERSONATION"
          ? "Impersonation attempt: generic |+⟩ state received instead of θ-signature"
          : "Session replay attempt detected",
        "WARN"
      );
    }

    setTransmission("RECEIVED");
    pushLog("Session validated", result.sessionCheck.replayDetected ? "ERROR" : "SUCCESS");
    if (result.sessionCheck.replayDetected) {
      pushLog("Replay detected: nonce previously used", "ERROR");
    }
    pushLog("Signature received", "INFO");
    await delay(260);

    pushLog("Measurement started", "INFO");
    setMeasurement(result.measurement);
    await delay(360);

    pushLog("Threat analysis started", "INFO");
    await delay(280);
    setDetector(result.detector);
    setSessionCheck(result.sessionCheck);
    pushLog(
      `Threat analysis completed (χ²=${result.detector.chiSquare.toFixed(2)}, p=${result.detector.pValue.toFixed(4)})`,
      "INFO"
    );
    if (result.measurement.overallMismatch > result.detector.mismatchThreshold) {
      pushLog("Measurement mismatch detected", "WARN");
    }

    setFinalVerdict(result.finalVerdict);
    setTransmission(result.finalVerdict.verdict === "LEGITIMATE" ? "VERIFIED" : "FLAGGED");
    pushLog(`Verdict: ${result.finalVerdict.verdict}`, result.finalVerdict.verdict === "LEGITIMATE" ? "SUCCESS" : "ERROR");

    // update replay-detection memory
    knownNoncesRef.current = [...knownNoncesRef.current, result.session.nonce].slice(-500);
    lastSessionRef.current = result.session;
    setLastSessionState(result.session);

    // history + persistence
    const historyEntry: SimulationHistoryEntry = {
      id: genHistoryId(),
      timestamp: Date.now(),
      theta: result.signature.theta,
      basis: config.basis,
      shots: config.shots,
      attack: attackType,
      pValue: result.detector.pValue,
      mismatch: result.detector.mismatchRate,
      chiSquare: result.detector.chiSquare,
      verdict: result.finalVerdict.verdict,
      sessionValid: result.finalVerdict.sessionValid,
    };
    setHistory((prev) => {
      const next = [historyEntry, ...prev].slice(0, HISTORY_LIMIT);
      saveToStorage("history", next);
      return next;
    });

    saveToStorage("signature", result.signature);
    saveToStorage("session", result.session);
    saveToStorage("verdict", result.finalVerdict);

    setRequestStatus("PROCESSED");
    setIsRunning(false);
  }, [isRunning, config, attackType, flipProbability, pushLog]);

  const runBatch = useCallback(
    async (trialsPerCondition: number) => {
      setIsRunningBatch(true);
      // yield a frame so the loading state paints before the (synchronous,
      // CPU-bound) batch loop runs
      await delay(30);
      const result = runBatchMetricsEngine(config, flipProbability, trialsPerCondition, config.seed);
      setBatchMetrics(result);
      saveToStorage("batchMetrics", result);
      pushLog(
        `Batch evaluation completed: ${trialsPerCondition} trials × ${result.conditions.length} conditions`,
        "INFO"
      );
      setIsRunningBatch(false);
    },
    [config, flipProbability, pushLog]
  );

  const resetAll = useCallback(() => {
    clearAllStorage();
    knownNoncesRef.current = [];
    lastSessionRef.current = null;
    setLastSessionState(null);
    setConfig({ theta: Math.PI / 3, basis: "Z", shots: 2000, seed: null });
    setAttackTypeState("NONE");
    setFlipProbabilityState(DEFAULT_FLIP_PROBABILITY);
    setSignature(null);
    setSession(null);
    setChannel(null);
    setMeasurement(null);
    setDetector(null);
    setSessionCheck(null);
    setFinalVerdict(null);
    setLastAttackConfig(null);
    setTransmission("IDLE");
    setTeleportStep("IDLE");
    setRequestStatus("NONE");
    setLogs([]);
    setHistory([]);
    setBatchMetrics(null);
  }, []);

  const value: SimulationContextValue = {
    config,
    setTheta,
    setBasis,
    setShots,
    setSeed,
    attackType,
    setAttackType,
    flipProbability,
    setFlipProbability,
    detectorAlpha: DEFAULT_ALPHA,
    mismatchThreshold: DEFAULT_MISMATCH_THRESHOLD,
    signature,
    session,
    channel,
    measurement,
    detector,
    sessionCheck,
    finalVerdict,
    lastAttackConfig,
    transmission,
    teleportStep,
    isRunning,
    requestStatus,
    logs,
    history,
    lastSession: lastSessionState,
    runFullSimulation,
    batchMetrics,
    isRunningBatch,
    runBatch,
    resetAll,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within a SimulationProvider");
  return ctx;
}
