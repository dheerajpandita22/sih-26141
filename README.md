# SIH26141 — Quantum Signature Verification & Threat Detection

A **frontend-only browser simulation** of the SIH26141 quantum signature verification
protocol: a signer (Client) prepares a quantum signature with an `RY(θ)` rotation,
teleports it across a simulated quantum channel to a verifier (Server), which
measures it, runs a statistical Threat Detector, and returns a verdict.

> ⚠️ **Scientific honesty**: this is a **classical simulation** that models the
> statistical behaviour of the protocol in TypeScript. It does not use a real
> quantum computer, Qiskit, or any backend — everything (including "quantum"
> measurement sampling) runs as probabilistic math in the browser. No claim of
> unconditional quantum security is made.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts (charts)
- lucide-react (icons)
- No backend, no database, no external auth — `localStorage` only

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

## Structure

There are exactly **two pages**, reflecting the protocol:

```
CLIENT  →  QUANTUM CHANNEL  →  SERVER
```

Neither page dumps raw data — every technical detail lives behind a clickable
**compartment** (card) that opens a **side drawer**.

```
src/
  components/       UI: pages, compartments, drawers, charts, circuit diagram
  simulation/        Pure TypeScript simulation engine (no React, no UI)
    quantumState.ts   RY(θ) signature model + Z/X/Y theoretical distributions
    attacks.ts         Forgery / impersonation / replay / channel-manipulation models
    measurement.ts     Probabilistic sampling of measurement outcomes
    statistics.ts      Chi-square statistic + regularized incomplete gamma (p-value)
    session.ts         Nonce / freshness-based replay detection
    detector.ts        LEGITIMATE / FLAGGED decision logic
    engine.ts          Combines the above into one runTrial()
    metrics.ts         Batch evaluation across all attack conditions
    exportResults.ts   CSV / JSON export
    teleportation.ts   3-qubit circuit metadata for the animated diagram
  hooks/useSimulation.tsx   Shared state (React context) driving both pages
  types/simulation.ts       Central domain types
  utils/                    rng (seeded PRNG), ids, formatting, localStorage
```

## What the Client can see

Signature creation, session info, the quantum state visualization, live
transmission status, and **only the final verdict** (LEGITIMATE/FLAGGED,
signature accepted/rejected, session valid/rejected) — never the detector's
internal chi-square, p-value, mismatch threshold, or attack internals.

## What the Server can see

Everything: incoming request, session/nonce freshness check, received vs.
expected signature, the teleportation circuit, channel/attack status, full
per-basis measurement distributions, the Threat Detector's statistics, attack
configuration internals, batch metrics, confusion matrix, audit log, history,
and CSV/JSON export.

## Demo script (for judges)

1. **Legitimate**: Client → Signature Configuration → θ = 60° (π/3) → **CREATE &
   SEND SIGNATURE**. Switch to Server and open Measurement / Threat Detector →
   **LEGITIMATE**.
2. **Forgery**: Server → Attack Simulation → select **Forgery** → Run. Open
   Measurement (distribution shifts) → Threat Detector → **FLAGGED**.
3. **Impersonation**: select **Impersonation** → Run → Threat Detector →
   **FLAGGED** (compare expected vs. received state in Attack Simulation).
4. **Channel manipulation**: select **Channel Manipulation**, set flip
   probability (default 30%) → Run → Quantum Channel shows the attack event →
   Threat Detector verdict.
5. **Replay**: select **Replay** → Run. Open Session → nonce reuse / freshness
   failure → **REPLAY DETECTED** (caught by session logic, not statistics).
6. **Batch evaluation**: Server → Metrics → choose trial count → Run → Accuracy
   / Precision / Recall / F1, then Confusion Matrix and the Detection Rate by
   Attack Type chart — all computed from freshly generated trials.

## Notes on the model

- `|ψ(θ)⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩`, prepared as `RY(θ)|0⟩`.
- Z: `P(0) = cos²(θ/2)`; X: `P(0) = ½(1 + sin θ)`; Y: `P(0) = P(1) = ½`.
- Threat Detector: `LEGITIMATE` iff `p-value ≥ α (0.05)` **and**
  `mismatch ≤ threshold (0.15)`; otherwise `FLAGGED`.
- Replay detection is a **session/nonce freshness check**, deliberately
  separate from the statistical test — a replayed signature can be a
  statistically perfect match, so statistics alone cannot catch it.
- An optional random seed makes measurement sampling fully reproducible.
