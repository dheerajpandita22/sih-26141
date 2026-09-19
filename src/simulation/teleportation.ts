// ─────────────────────────────────────────────────────────────────────────
// Quantum teleportation circuit model (visualization metadata only).
//
// Q0 = Signature / Alice   : RY(θ) → CX → H → Measure
// Q1 = Alice's Bell qubit  : H → CX → Measure → (classical) CX correction
// Q2 = Bob / Receiver      : CX → CZ → Measure
//
// The actual probability math lives in quantumState.ts / measurement.ts;
// this module just describes the circuit stages so the UI can animate
// them in lockstep with the simulation's TeleportStep state machine.
// ─────────────────────────────────────────────────────────────────────────

import type { TeleportStep } from "../types/simulation";

export interface CircuitGate {
  id: string;
  label: string;
  /** which TeleportStep lights this gate up */
  step: TeleportStep;
}

export interface QubitTrack {
  id: "Q0" | "Q1" | "Q2";
  label: string;
  role: string;
  gates: CircuitGate[];
}

export const TELEPORT_STEP_ORDER: TeleportStep[] = [
  "IDLE",
  "STATE_PREP",
  "BELL_PAIR",
  "ALICE_MEASURE",
  "CLASSICAL_CORRECTION",
  "BOB_RECEIVE",
  "DONE",
];

export const TELEPORT_STEP_LABELS: Record<TeleportStep, string> = {
  IDLE: "Idle",
  STATE_PREP: "State preparation",
  BELL_PAIR: "Bell-pair creation",
  ALICE_MEASURE: "Alice measurement",
  CLASSICAL_CORRECTION: "Classical correction",
  BOB_RECEIVE: "Bob receives state",
  DONE: "Complete",
};

export const CIRCUIT_TRACKS: QubitTrack[] = [
  {
    id: "Q0",
    label: "Q0",
    role: "Signature / Alice",
    gates: [
      { id: "q0-ry", label: "RY(θ)", step: "STATE_PREP" },
      { id: "q0-cx", label: "CX", step: "BELL_PAIR" },
      { id: "q0-h", label: "H", step: "ALICE_MEASURE" },
      { id: "q0-m", label: "M", step: "ALICE_MEASURE" },
    ],
  },
  {
    id: "Q1",
    label: "Q1",
    role: "Alice Bell qubit",
    gates: [
      { id: "q1-h", label: "H", step: "BELL_PAIR" },
      { id: "q1-cx", label: "CX", step: "BELL_PAIR" },
      { id: "q1-m", label: "M", step: "ALICE_MEASURE" },
      { id: "q1-cx2", label: "CX", step: "CLASSICAL_CORRECTION" },
    ],
  },
  {
    id: "Q2",
    label: "Q2",
    role: "Bob / Receiver",
    gates: [
      { id: "q2-cx", label: "CX", step: "CLASSICAL_CORRECTION" },
      { id: "q2-cz", label: "CZ", step: "CLASSICAL_CORRECTION" },
      { id: "q2-m", label: "M", step: "BOB_RECEIVE" },
    ],
  },
];

export function nextTeleportStep(current: TeleportStep): TeleportStep {
  const idx = TELEPORT_STEP_ORDER.indexOf(current);
  if (idx === -1 || idx === TELEPORT_STEP_ORDER.length - 1) return current;
  return TELEPORT_STEP_ORDER[idx + 1];
}
