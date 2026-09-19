// ─────────────────────────────────────────────────────────────────────────
// Statistical primitives used by the Threat Detector.
//
// We need a Pearson chi-square goodness-of-fit test (observed measurement
// counts vs. the theoretical distribution predicted by the signature's θ)
// and its p-value. There is no stats library dependency allowed here, so
// the regularized incomplete gamma function is implemented directly
// (standard Numerical-Recipes style series / continued-fraction expansion)
// to evaluate the chi-square survival function.
// ─────────────────────────────────────────────────────────────────────────

const ITMAX = 200;
const EPS = 3e-9;

function gammln(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Regularized lower incomplete gamma P(a, x) via series expansion. */
function gammaSeries(a: number, x: number): number {
  if (x <= 0) return 0;
  const gln = gammln(a);
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 1; n <= ITMAX; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - gln);
}

/** Regularized upper incomplete gamma Q(a, x) via continued fraction. */
function gammaContinuedFraction(a: number, x: number): number {
  const gln = gammln(a);
  const FPMIN = 1e-30;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}

/** Upper regularized incomplete gamma function Q(a, x), a>0, x>=0.
 * This equals the survival function needed for the chi-square p-value. */
export function upperIncompleteGammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 1;
  if (x < a + 1) {
    return 1 - gammaSeries(a, x);
  }
  return gammaContinuedFraction(a, x);
}

/** Survival function of the chi-square distribution: P(X >= chiSq) for
 * `df` degrees of freedom. This is the two-sided goodness-of-fit p-value. */
export function chiSquarePValue(chiSq: number, df: number): number {
  if (chiSq <= 0) return 1;
  if (df <= 0) return 1;
  const p = upperIncompleteGammaQ(df / 2, chiSq / 2);
  if (!Number.isFinite(p)) return 1;
  return Math.min(1, Math.max(0, p));
}

/** Pearson chi-square goodness-of-fit statistic for a set of observed vs.
 * expected (theoretical) counts. Categories with zero expected count are
 * skipped to avoid division by zero (shouldn't occur with these models
 * since every probability stays in (0,1) for the supported bases). */
export function chiSquareStatistic(observed: number[], expected: number[]): number {
  let stat = 0;
  for (let i = 0; i < observed.length; i++) {
    const e = expected[i];
    if (e <= 0) continue;
    const diff = observed[i] - e;
    stat += (diff * diff) / e;
  }
  return stat;
}

/** Total variation distance between two 2-outcome distributions, used as
 * the human-readable "mismatch rate": 0 = identical, 1 = fully disjoint. */
export function totalVariationDistance(pA: number, pB: number): number {
  return Math.abs(pA - pB);
}
