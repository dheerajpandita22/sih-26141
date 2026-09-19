import { CheckCircle2, XCircle } from "lucide-react";
import type { DetectorResult, SessionCheckResult } from "../types/simulation";
import { Card, DataRow, EmptyState, Pill, ProgressBar, SectionLabel } from "./ui";
import { fmtNum, fmtPct } from "../utils/format";

export function ThreatDetectorPanel({
  detector,
  sessionCheck,
}: {
  detector: DetectorResult | null;
  sessionCheck: SessionCheckResult | null;
}) {
  if (!detector) {
    return <EmptyState message="No verification has run yet. Send a signature from the Client to populate the Threat Detector." />;
  }

  const verdict = detector.statisticalVerdict;
  const legitimate = verdict === "LEGITIMATE";
  const pPass = detector.pValue >= detector.alpha;
  const mismatchPass = detector.mismatchRate <= detector.mismatchThreshold;

  return (
    <div className="space-y-5">
      <Card className={legitimate ? "!border-emerald-400/30 !bg-emerald-400/[0.04]" : "!border-rose-400/30 !bg-rose-400/[0.04]"}>
        <div className="flex items-center gap-3">
          {legitimate ? (
            <CheckCircle2 className="text-emerald-400" size={28} />
          ) : (
            <XCircle className="text-rose-400" size={28} />
          )}
          <div>
            <p className={`text-[15px] font-bold tracking-wide ${legitimate ? "text-emerald-300" : "text-rose-300"}`}>
              {verdict}
            </p>
            <p className="mt-0.5 text-[12px] text-slate-400">{detector.reason}</p>
          </div>
        </div>
      </Card>

      {sessionCheck?.replayDetected && (
        <Card className="!border-rose-400/30 !bg-rose-400/[0.04]">
          <p className="text-[12px] font-semibold text-rose-300">Session / replay check failed</p>
          <p className="mt-1 text-[11.5px] text-slate-400">{sessionCheck.reason}</p>
          <p className="mt-1.5 text-[11px] text-slate-600">
            Note: this failure comes from nonce / freshness validation, independent of the statistical result above —
            statistics alone cannot catch a replayed signature.
          </p>
        </Card>
      )}

      <div>
        <SectionLabel>Statistical Test</SectionLabel>
        <div className="space-y-3">
          <DataRow label="Chi-square (χ²)" value={fmtNum(detector.chiSquare, 4)} />
          <DataRow label="Degrees of freedom" value={detector.degreesOfFreedom} />
          <DataRow
            label="p-value"
            value={fmtNum(detector.pValue, 4)}
            valueClass={pPass ? "text-emerald-300" : "text-rose-300"}
          />
          <DataRow label="Significance level (α)" value={detector.alpha.toFixed(2)} />
        </div>
      </div>

      <div>
        <SectionLabel>Mismatch</SectionLabel>
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="text-slate-400">Observed mismatch rate</span>
          <span className={`font-mono ${mismatchPass ? "text-emerald-300" : "text-rose-300"}`}>
            {fmtPct(detector.mismatchRate)}
          </span>
        </div>
        <ProgressBar value={detector.mismatchRate} tone={mismatchPass ? "legit" : "flag"} />
        <p className="mt-1 text-right text-[11px] text-slate-600">threshold: {fmtPct(detector.mismatchThreshold)}</p>
      </div>

      <div>
        <SectionLabel>Decision Logic</SectionLabel>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-base-600/50 px-3 py-2">
            <span className="text-[11.5px] text-slate-400">p-value ≥ α</span>
            <Pill tone={pPass ? "legit" : "flag"}>{pPass ? "PASS" : "FAIL"}</Pill>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-base-600/50 px-3 py-2">
            <span className="text-[11.5px] text-slate-400">mismatch ≤ threshold</span>
            <Pill tone={mismatchPass ? "legit" : "flag"}>{mismatchPass ? "PASS" : "FAIL"}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
