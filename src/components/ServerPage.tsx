import { useState, type ReactNode } from "react";
import {
  Inbox,
  KeyRound,
  FileSignature,
  Radio,
  ShieldAlert,
  Activity,
  ShieldQuestion,
  Swords,
  BarChart3,
  Grid3x3,
  ScrollText,
  History,
  Download,
  ServerIcon,
  User,
  AlertTriangle,
} from "lucide-react";
import { useSimulation } from "../hooks/useSimulation";
import { InfoCompartment } from "./InfoCompartment";
import { SideDrawer } from "./SideDrawer";
import { Card, DataRow, EmptyState, EquationBlock, Pill, SectionLabel } from "./ui";
import { ProtocolFlowBanner } from "./ProtocolFlowBanner";
import { QuantumCircuit } from "./QuantumCircuit";
import { MeasurementPanel } from "./MeasurementPanel";
import { ThreatDetectorPanel } from "./ThreatDetectorPanel";
import { AttackSimulationPanel } from "./AttackSimulationPanel";
import { MetricsPanel } from "./MetricsPanel";
import { ConfusionMatrix } from "./ConfusionMatrix";
import { AuditLog } from "./AuditLog";
import { HistoryPanel } from "./HistoryPanel";
import { ExportPanel } from "./ExportPanel";
import { zBasisDistribution } from "../simulation/quantumState";
import { fmtAgeMs, fmtDateTime, fmtPct, fmtRad } from "../utils/format";

const CLIENT_ID = "CLIENT-ALICE-01";

type DrawerKey =
  | "request"
  | "session"
  | "signature"
  | "teleportation"
  | "channel"
  | "measurement"
  | "detector"
  | "attack"
  | "metrics"
  | "confusion"
  | "audit"
  | "history"
  | "export"
  | null;

function GroupHeading({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-600 first:mt-0">{children}</p>;
}

export function ServerPage() {
  const sim = useSimulation();
  const [drawer, setDrawer] = useState<DrawerKey>(null);
  const close = () => setDrawer(null);

  const verdict = sim.finalVerdict;
  const attack = sim.lastAttackConfig;

  // Derived "received" signature fields for the Server's Signature compartment
  let receivedTheta: string = sim.signature ? fmtRad(sim.signature.theta) : "—";
  let receivedState = sim.signature?.stateLabel ?? "—";
  let receivedPrep = sim.signature?.preparation ?? "—";
  if (attack?.type === "FORGERY" && attack.forgery) {
    receivedTheta = `${fmtRad(attack.forgery.attackerTheta)} (forged)`;
    receivedState = "|ψ(θ_attacker)⟩ — incorrect rotation";
    receivedPrep = "RY(θ_attacker)|0⟩";
  } else if (attack?.type === "IMPERSONATION" && attack.impersonation) {
    receivedTheta = "N/A — generic state substituted";
    receivedState = attack.impersonation.receivedStateLabel;
    receivedPrep = attack.impersonation.receivedPreparation;
  }

  const expectedDist = sim.signature ? zBasisDistribution(sim.signature.theta) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/25">
              <ServerIcon size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">QUANTUM VERIFICATION SERVER</h1>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">Quantum Signature Verification &amp; Threat Detection Engine</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Online</span>
        </div>
      </div>

      <div className="mb-6">
        <ProtocolFlowBanner stage={sim.transmission} attackOccurred={!!sim.channel?.attackOccurred} />
      </div>

      {verdict && (
        <Card className={`mb-6 ${verdict.verdict === "LEGITIMATE" ? "!border-emerald-400/30 !bg-emerald-400/[0.05]" : "!border-rose-400/30 !bg-rose-400/[0.05]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Pill tone={verdict.verdict === "LEGITIMATE" ? "legit" : "flag"}>{verdict.verdict}</Pill>
              <span className="text-[12px] text-slate-400">{verdict.reasonSummary}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              {sim.detector && (
                <span>
                  χ²=<span className="font-mono text-slate-300">{sim.detector.chiSquare.toFixed(2)}</span> · p=
                  <span className="font-mono text-slate-300">{sim.detector.pValue.toFixed(4)}</span>
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Compartments */}
      <GroupHeading>Request &amp; Session</GroupHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={Inbox}
          title="Incoming Request"
          description="Raw request metadata as received by the server."
          accent="server"
          badge={{ label: sim.requestStatus, tone: sim.requestStatus === "PROCESSED" ? "legit" : "neutral" }}
          onClick={() => setDrawer("request")}
        />
        <InfoCompartment
          icon={KeyRound}
          title="Session"
          description="Nonce & timestamp freshness validation — replay detection."
          accent="server"
          badge={sim.sessionCheck ? { label: sim.sessionCheck.replayDetected ? "Replay" : "Fresh", tone: sim.sessionCheck.replayDetected ? "flag" : "legit" } : undefined}
          onClick={() => setDrawer("session")}
        />
      </div>

      <GroupHeading>Signature &amp; Teleportation</GroupHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={FileSignature}
          title="Signature"
          description="Received vs. expected θ, state preparation, distribution."
          accent="server"
          onClick={() => setDrawer("signature")}
        />
        <InfoCompartment
          icon={Radio}
          title="Teleportation"
          description="3-qubit teleportation circuit — animated gate sequence."
          accent="server"
          badge={{ label: sim.teleportStep, tone: sim.teleportStep === "DONE" ? "legit" : "neutral" }}
          onClick={() => setDrawer("teleportation")}
        />
      </div>

      <GroupHeading>Channel &amp; Measurement</GroupHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={ShieldAlert}
          title="Quantum Channel"
          description="Transmission status, disturbance probability, tampering."
          accent="server"
          badge={sim.channel?.attackOccurred ? { label: "Attack", tone: "flag" } : undefined}
          onClick={() => setDrawer("channel")}
        />
        <InfoCompartment
          icon={Activity}
          title="Measurement"
          description="Per-basis sampled counts vs. theoretical expectation."
          accent="server"
          onClick={() => setDrawer("measurement")}
        />
      </div>

      <GroupHeading>Threat Detection</GroupHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={ShieldQuestion}
          title="Threat Detector"
          description="Chi-square, p-value, mismatch rate and final verdict."
          accent="server"
          badge={sim.detector ? { label: sim.detector.statisticalVerdict, tone: sim.detector.statisticalVerdict === "LEGITIMATE" ? "legit" : "flag" } : undefined}
          onClick={() => setDrawer("detector")}
        />
        <InfoCompartment
          icon={Swords}
          title="Attack Simulation"
          description="Forgery, impersonation, replay, channel manipulation."
          accent="server"
          badge={sim.attackType !== "NONE" ? { label: sim.attackType.replace("_", " "), tone: "warn" } : undefined}
          onClick={() => setDrawer("attack")}
        />
      </div>

      <GroupHeading>Evaluation &amp; Records</GroupHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={BarChart3}
          title="Metrics"
          description="Batch evaluation — accuracy, precision, recall, F1."
          accent="server"
          onClick={() => setDrawer("metrics")}
        />
        <InfoCompartment
          icon={Grid3x3}
          title="Confusion Matrix"
          description="Aggregated TP / TN / FP / FN from the last batch run."
          accent="server"
          onClick={() => setDrawer("confusion")}
        />
        <InfoCompartment
          icon={ScrollText}
          title="Audit Log"
          description="Chronological server event trail for this session."
          accent="server"
          onClick={() => setDrawer("audit")}
        />
        <InfoCompartment
          icon={History}
          title="Simulation History"
          description="Last 20 runs with verdict and statistical summary."
          accent="server"
          onClick={() => setDrawer("history")}
        />
        <InfoCompartment
          icon={Download}
          title="Export Results"
          description="Download history and batch metrics as CSV / JSON."
          accent="server"
          onClick={() => setDrawer("export")}
        />
      </div>

      <p className="mt-8 text-center text-[11px] text-slate-600">
        Classical frontend simulation — models the statistical behaviour of the quantum protocol described in the
        SIH26141 build guide. No physical quantum computer is used; no guarantee of unconditional quantum security is
        implied.
      </p>

      {/* ── Drawers ───────────────────────────────────────────────── */}

      <SideDrawer open={drawer === "request"} onClose={close} title="Incoming Request" icon={Inbox} accentClass="text-violet-300">
        {!sim.session ? (
          <EmptyState message="No request has been received yet." />
        ) : (
          <div>
            <SectionLabel>Request Metadata</SectionLabel>
            <DataRow label="Request ID" value={sim.session.requestId} />
            <DataRow label="Client / Signer ID" value={CLIENT_ID} />
            <DataRow label="Session ID" value={sim.session.sessionId} />
            <DataRow label="Nonce" value={sim.session.nonce} />
            <DataRow label="Received timestamp" value={fmtDateTime(sim.session.timestamp)} />
            <DataRow label="Signature ID" value={sim.signature?.id ?? "—"} />
            <DataRow label="Request status" value={<Pill tone={sim.requestStatus === "PROCESSED" ? "legit" : "neutral"}>{sim.requestStatus}</Pill>} mono={false} />
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "session"} onClose={close} title="Session" icon={KeyRound} accentClass="text-violet-300">
        {!sim.session ? (
          <EmptyState message="No session to evaluate yet." />
        ) : (
          <div className="space-y-5">
            <div>
              <SectionLabel>Session Record</SectionLabel>
              <DataRow label="Session ID" value={sim.session.sessionId} />
              <DataRow label="Current nonce" value={sim.session.nonce} />
              <DataRow label="Previous nonce" value={sim.session.previousNonce ?? "—"} />
              <DataRow label="Session timestamp" value={fmtDateTime(sim.session.timestamp)} />
              <DataRow label="Session age" value={fmtAgeMs(Math.max(0, Date.now() - sim.session.timestamp))} />
              <DataRow label="Session status" value={<Pill tone={sim.session.status === "ACTIVE" ? "legit" : "flag"}>{sim.session.status}</Pill>} mono={false} />
            </div>

            {sim.sessionCheck && (
              <Card className={sim.sessionCheck.replayDetected ? "!border-rose-400/30 !bg-rose-400/[0.05]" : "!border-emerald-400/25 !bg-emerald-400/[0.04]"}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-200">Freshness / Replay Validation</span>
                  {sim.sessionCheck.replayDetected && <Pill tone="flag">REPLAY DETECTED</Pill>}
                </div>
                <DataRow label="Freshness valid" value={sim.sessionCheck.freshnessValid ? "YES" : "NO"} />
                <DataRow label="Replay detected" value={sim.sessionCheck.replayDetected ? "YES" : "NO"} />
                <p className="mt-2 text-[11.5px] text-slate-500">{sim.sessionCheck.reason}</p>
                <p className="mt-2 text-[11px] text-slate-600">
                  Replay detection is performed via session / nonce freshness validation, not via statistical
                  measurement comparison — a replayed signature can be a statistically perfect match.
                </p>
              </Card>
            )}
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "signature"} onClose={close} title="Signature" icon={FileSignature} accentClass="text-violet-300">
        {!sim.signature ? (
          <EmptyState message="No signature received yet." />
        ) : (
          <div className="space-y-5">
            <EquationBlock>RY(θ)|0⟩</EquationBlock>
            <EquationBlock>|ψ(θ)⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩</EquationBlock>

            <div>
              <SectionLabel>Comparison</SectionLabel>
              <DataRow label="Expected θ" value={fmtRad(sim.signature.theta)} />
              <DataRow label="Received θ" value={receivedTheta} valueClass={attack?.type === "FORGERY" ? "text-rose-300" : ""} />
              <DataRow label="Signature state (received)" value={receivedState} mono={false} valueClass={attack && attack.type !== "NONE" && attack.type !== "REPLAY" && attack.type !== "CHANNEL_MANIPULATION" ? "text-rose-300" : ""} />
              <DataRow label="State preparation (received)" value={receivedPrep} />
              <DataRow label="Signature ID" value={sim.signature.id} />
            </div>

            {expectedDist && (
              <div>
                <SectionLabel>Expected Probability Distribution (Z basis)</SectionLabel>
                <DataRow label="P(0)" value={fmtPct(expectedDist.p0)} />
                <DataRow label="P(1)" value={fmtPct(expectedDist.p1)} />
                <p className="mt-2 text-[11px] text-slate-600">See the Measurement compartment for the full multi-basis breakdown.</p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "teleportation"} onClose={close} title="Teleportation" icon={Radio} accentClass="text-violet-300">
        <QuantumCircuit activeStep={sim.teleportStep} />
      </SideDrawer>

      <SideDrawer open={drawer === "channel"} onClose={close} title="Quantum Channel" icon={ShieldAlert} accentClass="text-violet-300">
        {!sim.channel ? (
          <EmptyState message="Channel is idle. No transmission has occurred yet." />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-base-600/60 bg-base-850/50 px-4 py-4">
              <div className="flex flex-col items-center gap-1 text-sky-300">
                <User size={20} />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Client</span>
              </div>
              <div className="relative mx-2 h-px flex-1 bg-base-500">
                {sim.channel.attackOccurred && (
                  <AlertTriangle size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-400" />
                )}
              </div>
              <div className="flex flex-col items-center gap-1 text-violet-300">
                <ServerIcon size={20} />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Server</span>
              </div>
            </div>

            <div>
              <SectionLabel>Channel State</SectionLabel>
              <DataRow label="Channel status" value={sim.channel.status} />
              <DataRow label="Transmission status" value={sim.requestStatus} />
              <DataRow label="Attack status" value={sim.channel.attackOccurred ? "ATTACK ACTIVE" : "CLEAR"} valueClass={sim.channel.attackOccurred ? "text-rose-300" : "text-emerald-300"} />
              <DataRow label="Disturbance probability" value={fmtPct(sim.channel.disturbanceProbability)} />
              <DataRow label="Tampering occurred" value={sim.channel.tampered ? "YES" : "NO"} />
              <DataRow label="Received-state status" value={sim.channel.receivedStateStatus} />
            </div>
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "measurement"} onClose={close} title="Measurement" icon={Activity} accentClass="text-violet-300">
        <MeasurementPanel measurement={sim.measurement} mismatchThreshold={sim.mismatchThreshold} />
      </SideDrawer>

      <SideDrawer open={drawer === "detector"} onClose={close} title="Threat Detector" icon={ShieldQuestion} accentClass="text-violet-300">
        <ThreatDetectorPanel detector={sim.detector} sessionCheck={sim.sessionCheck} />
      </SideDrawer>

      <SideDrawer open={drawer === "attack"} onClose={close} title="Attack Simulation" icon={Swords} accentClass="text-violet-300">
        <AttackSimulationPanel
          attackType={sim.attackType}
          setAttackType={sim.setAttackType}
          flipProbability={sim.flipProbability}
          setFlipProbability={sim.setFlipProbability}
          lastAttackConfig={sim.lastAttackConfig}
          channel={sim.channel}
          isRunning={sim.isRunning}
          onRun={sim.runFullSimulation}
        />
      </SideDrawer>

      <SideDrawer open={drawer === "metrics"} onClose={close} title="Metrics" icon={BarChart3} accentClass="text-violet-300">
        <MetricsPanel result={sim.batchMetrics} isRunning={sim.isRunningBatch} onRun={sim.runBatch} />
      </SideDrawer>

      <SideDrawer open={drawer === "confusion"} onClose={close} title="Confusion Matrix" icon={Grid3x3} accentClass="text-violet-300">
        <ConfusionMatrix counts={sim.batchMetrics?.overall ?? null} />
      </SideDrawer>

      <SideDrawer open={drawer === "audit"} onClose={close} title="Audit Log" icon={ScrollText} accentClass="text-violet-300">
        <AuditLog logs={sim.logs} />
      </SideDrawer>

      <SideDrawer open={drawer === "history"} onClose={close} title="Simulation History" icon={History} accentClass="text-violet-300">
        <HistoryPanel history={sim.history} />
      </SideDrawer>

      <SideDrawer open={drawer === "export"} onClose={close} title="Export Results" icon={Download} accentClass="text-violet-300">
        <ExportPanel history={sim.history} batchMetrics={sim.batchMetrics} onReset={sim.resetAll} />
      </SideDrawer>
    </div>
  );
}
