import { useState } from "react";
import {
  FileSignature,
  KeyRound,
  Atom,
  SlidersHorizontal,
  Radio,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSimulation } from "../hooks/useSimulation";
import { InfoCompartment } from "./InfoCompartment";
import { SideDrawer } from "./SideDrawer";
import { Card, DataRow, EmptyState, EquationBlock, Pill, SectionLabel } from "./ui";
import { ProtocolFlowBanner } from "./ProtocolFlowBanner";
import { QuantumStatePanel } from "./QuantumState";
import { TransmissionFlow } from "./TransmissionFlow";
import { SignatureConfigPanel } from "./SignatureConfigPanel";
import { fmtDateTime, fmtDeg, radToDeg } from "../utils/format";

type DrawerKey = "signature" | "session" | "state" | "config" | "transmission" | "result" | null;

export function ClientPage() {
  const sim = useSimulation();
  const [drawer, setDrawer] = useState<DrawerKey>(null);
  const close = () => setDrawer(null);

  const verdict = sim.finalVerdict;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/25">
              <FileSignature size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">QUANTUM CLIENT</h1>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">Secure Quantum Signature Transmission</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Connected</span>
        </div>
      </div>

      {/* Flow banner */}
      <div className="mb-6">
        <ProtocolFlowBanner stage={sim.transmission} attackOccurred={false} />
      </div>

      {/* Primary action */}
      <Card className="mb-6 !bg-base-850/70">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-400">
            <span>
              θ = <span className="font-mono text-slate-200">{fmtDeg(radToDeg(sim.config.theta), 0)}</span>
            </span>
            <span>
              Basis = <span className="font-mono text-slate-200">{sim.config.basis}</span>
            </span>
            <span>
              Shots = <span className="font-mono text-slate-200">{sim.config.shots.toLocaleString()}</span>
            </span>
            <button onClick={() => setDrawer("config")} className="text-cyan-glow underline-offset-2 hover:underline">
              Edit configuration →
            </button>
          </div>
          <button
            onClick={sim.runFullSimulation}
            disabled={sim.isRunning}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-glow/15 px-6 py-3 text-[14px] font-bold tracking-wide text-cyan-glow ring-1 ring-cyan-glow/40 transition hover:bg-cyan-glow/25 disabled:opacity-50 sm:shrink-0"
          >
            {sim.isRunning ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            {sim.isRunning ? "TRANSMITTING…" : "CREATE & SEND SIGNATURE"}
          </button>
        </div>
      </Card>

      {/* Compartments */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCompartment
          icon={FileSignature}
          title="My Signature"
          description="Quantum signature ID, θ and preparation method."
          accent="client"
          badge={sim.signature ? { label: "Ready", tone: "legit" } : undefined}
          onClick={() => setDrawer("signature")}
        />
        <InfoCompartment
          icon={KeyRound}
          title="Session"
          description="Session ID, request ID and nonce for this transmission."
          accent="client"
          badge={sim.session ? { label: sim.session.status, tone: sim.session.status === "ACTIVE" ? "legit" : "warn" } : undefined}
          onClick={() => setDrawer("session")}
        />
        <InfoCompartment
          icon={Atom}
          title="Quantum State"
          description="Visual representation of |ψ(θ)⟩ and outcome probabilities."
          accent="client"
          onClick={() => setDrawer("state")}
        />
        <InfoCompartment
          icon={SlidersHorizontal}
          title="Signature Configuration"
          description="θ, measurement basis, shots and random seed."
          accent="client"
          onClick={() => setDrawer("config")}
        />
        <InfoCompartment
          icon={Radio}
          title="Transmission"
          description="Live sequence: preparation → teleportation → channel → server."
          accent="client"
          badge={{ label: sim.transmission, tone: sim.transmission === "FLAGGED" ? "flag" : sim.transmission === "VERIFIED" ? "legit" : "neutral" }}
          onClick={() => setDrawer("transmission")}
        />
        <InfoCompartment
          icon={ShieldCheck}
          title="Verification Result"
          description="Final outcome returned by the server for this signature."
          accent={verdict ? (verdict.verdict === "LEGITIMATE" ? "legit" : "flag") : "client"}
          badge={verdict ? { label: verdict.verdict, tone: verdict.verdict === "LEGITIMATE" ? "legit" : "flag" } : { label: "Pending", tone: "neutral" }}
          onClick={() => setDrawer("result")}
        />
      </div>

      <p className="mt-8 text-center text-[11px] text-slate-600">
        Classical frontend simulation — models the statistical behaviour of the quantum protocol described in the
        SIH26141 build guide. No physical quantum computer is used.
      </p>

      {/* ── Drawers ───────────────────────────────────────────────── */}

      <SideDrawer open={drawer === "signature"} onClose={close} title="My Signature" icon={FileSignature} accentClass="text-sky-300">
        {!sim.signature ? (
          <EmptyState message="No signature has been created yet. Click CREATE & SEND SIGNATURE to generate one." />
        ) : (
          <div className="space-y-5">
            <EquationBlock>{sim.signature.preparation}</EquationBlock>
            <EquationBlock>{sim.signature.stateLabel}</EquationBlock>
            <div>
              <SectionLabel>Details</SectionLabel>
              <DataRow label="Signature ID" value={sim.signature.id} />
              <DataRow label="θ (radians)" value={sim.signature.theta.toFixed(4)} />
              <DataRow label="θ (degrees)" value={fmtDeg(sim.signature.thetaDegrees)} />
              <DataRow label="Quantum state" value={sim.signature.stateLabel} mono={false} />
              <DataRow label="State preparation" value={sim.signature.preparation} />
              <DataRow label="Created at" value={fmtDateTime(sim.signature.createdAt)} />
            </div>
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "session"} onClose={close} title="Session" icon={KeyRound} accentClass="text-sky-300">
        {!sim.session ? (
          <EmptyState message="No session has been created yet." />
        ) : (
          <div>
            <SectionLabel>Session Metadata</SectionLabel>
            <DataRow label="Session ID" value={sim.session.sessionId} />
            <DataRow label="Request ID" value={sim.session.requestId} />
            <DataRow label="Nonce" value={sim.session.nonce} />
            <DataRow label="Timestamp" value={fmtDateTime(sim.session.timestamp)} />
            <DataRow
              label="Session status"
              value={<Pill tone={sim.session.status === "ACTIVE" ? "legit" : "warn"}>{sim.session.status}</Pill>}
              mono={false}
            />
            <p className="mt-4 text-[11px] text-slate-600">
              A fresh, unique nonce is generated for every new session to support server-side freshness validation.
            </p>
          </div>
        )}
      </SideDrawer>

      <SideDrawer open={drawer === "state"} onClose={close} title="Quantum State" icon={Atom} accentClass="text-sky-300">
        <QuantumStatePanel theta={sim.config.theta} />
      </SideDrawer>

      <SideDrawer open={drawer === "config"} onClose={close} title="Signature Configuration" icon={SlidersHorizontal} accentClass="text-sky-300">
        <SignatureConfigPanel
          theta={sim.config.theta}
          setTheta={sim.setTheta}
          basis={sim.config.basis}
          setBasis={sim.setBasis}
          shots={sim.config.shots}
          setShots={sim.setShots}
          seed={sim.config.seed}
          setSeed={sim.setSeed}
        />
      </SideDrawer>

      <SideDrawer open={drawer === "transmission"} onClose={close} title="Transmission" icon={Radio} accentClass="text-sky-300">
        <TransmissionFlow stage={sim.transmission} />
      </SideDrawer>

      <SideDrawer open={drawer === "result"} onClose={close} title="Verification Result" icon={ShieldCheck} accentClass="text-sky-300">
        {!verdict ? (
          <EmptyState message="No verification result yet. Send a signature to the server to receive a result." />
        ) : (
          <div className="space-y-4">
            <Card className={verdict.verdict === "LEGITIMATE" ? "!border-emerald-400/30 !bg-emerald-400/[0.05]" : "!border-rose-400/30 !bg-rose-400/[0.05]"}>
              <div className="flex items-center gap-3">
                {verdict.verdict === "LEGITIMATE" ? (
                  <CheckCircle2 className="text-emerald-400" size={30} />
                ) : (
                  <XCircle className="text-rose-400" size={30} />
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Verification Result</p>
                  <p className={`text-[19px] font-bold tracking-wide ${verdict.verdict === "LEGITIMATE" ? "text-emerald-300" : "text-rose-300"}`}>
                    {verdict.verdict}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Signature</p>
                <p className={`mt-1 text-[14px] font-semibold ${verdict.signatureAccepted ? "text-emerald-300" : "text-rose-300"}`}>
                  {verdict.signatureAccepted ? "Signature Accepted" : "Signature Rejected"}
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Session</p>
                <p className={`mt-1 text-[14px] font-semibold ${verdict.sessionValid ? "text-emerald-300" : "text-rose-300"}`}>
                  {verdict.sessionValid ? "Session Valid" : "Session Rejected"}
                </p>
              </Card>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-600">
              The client only receives the outcome above. Detailed statistical evidence (chi-square, p-value, mismatch
              analysis) is retained internally by the Server's Threat Detector.
            </p>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
