// =====================================================
// Statix - Servicio de cálculos estadísticos
// =====================================================
import {
  combination,
  logCombination,
  normalCdf,
  normalPdf,
  normalQuantile,
  fCdf,
  fQuantile,
  studentizedRangeQ,
} from '@/utils/math.utils';
import { LIMITS } from '@/constants';
import type {
  BinomialInputs,
  BinomialResults,
  HypergeometricInputs,
  HypergeometricResults,
  MeanEstimationInputs,
  NormalInputs,
  NormalResults,
  ProportionEstimationInputs,
  EstimationResults,
  AnovaOneWayResult,
  AnovaTableRow,
  AnovaTwoWayResult,
  GroupSummary,
  TukeyResult,
  TukeyComparison,
} from '@/types';

// =====================================================
// DISTRIBUCIÓN BINOMIAL
// =====================================================
export function binomialPmf(n: number, p: number, x: number): number {
  if (x < 0 || x > n) return 0;
  return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

export function binomialCdf(n: number, p: number, x: number): number {
  let sum = 0;
  for (let k = 0; k <= x; k++) {
    sum += binomialPmf(n, p, k);
  }
  return Math.min(1, sum);
}

export function binomialSurvival(n: number, p: number, x: number): number {
  return 1 - binomialCdf(n, p, x - 1);
}

export function calculateBinomial(input: BinomialInputs): BinomialResults {
  const { n, p, x } = input;
  const distribution: Array<{ x: number; probability: number }> = [];
  const maxX = Math.min(n, LIMITS.MAX_BINOMIAL_N);
  for (let k = 0; k <= maxX; k++) {
    distribution.push({ x: k, probability: binomialPmf(n, p, k) });
  }
  return {
    probabilityExact: binomialPmf(n, p, x),
    probabilityLessEqual: binomialCdf(n, p, x),
    probabilityGreaterEqual: binomialSurvival(n, p, x),
    mean: n * p,
    variance: n * p * (1 - p),
    stdDev: Math.sqrt(n * p * (1 - p)),
    distribution,
  };
}

// =====================================================
// DISTRIBUCIÓN HIPERGEOMÉTRICA
// =====================================================
export function hypergeometricPmf(
  N: number,
  K: number,
  n: number,
  x: number,
): number {
  if (x < 0 || x > n || x > K || n - x > N - K) return 0;
  // P(X = x) = C(K, x) * C(N-K, n-x) / C(N, n)
  const logNum = logCombination(K, x) + logCombination(N - K, n - x);
  const logDen = logCombination(N, n);
  return Math.exp(logNum - logDen);
}

export function hypergeometricCdf(
  N: number,
  K: number,
  n: number,
  x: number,
): number {
  const upper = Math.min(x, n, K);
  let sum = 0;
  for (let k = 0; k <= upper; k++) {
    sum += hypergeometricPmf(N, K, n, k);
  }
  return Math.min(1, sum);
}

export function hypergeometricSurvival(
  N: number,
  K: number,
  n: number,
  x: number,
): number {
  return 1 - hypergeometricCdf(N, K, n, x - 1);
}

export function calculateHypergeometric(
  input: HypergeometricInputs,
): HypergeometricResults {
  const { N, K, n, x } = input;
  const distribution: Array<{ x: number; probability: number }> = [];
  const upper = Math.min(n, K);
  for (let k = 0; k <= upper; k++) {
    distribution.push({ x: k, probability: hypergeometricPmf(N, K, n, k) });
  }
  const mean = (n * K) / N;
  const variance = (n * K * (N - K) * (N - n)) / (N * N * (N - 1));
  return {
    probabilityExact: hypergeometricPmf(N, K, n, x),
    probabilityLessEqual: hypergeometricCdf(N, K, n, x),
    probabilityGreaterEqual: hypergeometricSurvival(N, K, n, x),
    mean,
    variance,
    stdDev: Math.sqrt(variance),
    distribution,
  };
}

// =====================================================
// DISTRIBUCIÓN NORMAL
// =====================================================
export function calculateNormal(input: NormalInputs): NormalResults {
  const { mu, sigma, x, x2, mode } = input;
  const zScore = (x - mu) / sigma;
  const pdf = normalPdf(x, mu, sigma);

  let probability = 0;
  let isBetween = false;
  const bounds: NormalResults['bounds'] = {};

  switch (mode) {
    case 'cumulative': {
      // P(X ≤ x)
      probability = normalCdf(x, mu, sigma);
      bounds.a = mu - 4 * sigma;
      bounds.b = x;
      break;
    }
    case 'left-tail': {
      probability = normalCdf(x, mu, sigma);
      bounds.a = mu - 4 * sigma;
      bounds.b = x;
      break;
    }
    case 'right-tail': {
      probability = 1 - normalCdf(x, mu, sigma);
      bounds.a = x;
      bounds.b = mu + 4 * sigma;
      break;
    }
    case 'between': {
      const a = Math.min(x, x2 ?? x);
      const b = Math.max(x, x2 ?? x);
      probability = normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma);
      isBetween = true;
      bounds.a = a;
      bounds.b = b;
      break;
    }
  }

  // Curva para graficar
  const N = LIMITS.NORMAL_RESOLUTION;
  const range = 4.5 * sigma;
  const start = mu - range;
  const end = mu + range;
  const distribution: Array<{ x: number; y: number }> = [];
  const shadedArea: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= N; i++) {
    const t = start + (i / N) * (end - start);
    const y = normalPdf(t, mu, sigma);
    distribution.push({ x: t, y });
    if (t >= (bounds.a ?? -Infinity) && t <= (bounds.b ?? Infinity)) {
      shadedArea.push({ x: t, y });
    }
  }

  return {
    zScore,
    probability,
    pdf,
    isBetween,
    bounds,
    distribution,
    shadedArea,
  };
}

// =====================================================
// ESTIMACIÓN DE PARÁMETROS
// =====================================================
function zCriticalForConfidence(confidence: number): number {
  const alpha = 1 - confidence;
  return normalQuantile(1 - alpha / 2);
}

export function calculateMeanEstimation(
  input: MeanEstimationInputs,
): EstimationResults {
  const { n, s, confidence } = input;
  const standardError = s / Math.sqrt(n);
  const zCritical = zCriticalForConfidence(confidence);
  const marginOfError = zCritical * standardError;
  // Nota: xBar no entra en el ancho del IC, sólo en el centro
  // devolvemos bounds con centro en xBar
  // (se ajustan al renderizar con xBar)
  return {
    standardError,
    marginOfError,
    zCritical,
    lowerBound: 0,
    upperBound: 0,
    confidenceLevel: confidence,
  };
}

export interface MeanEstimationCentered extends EstimationResults {
  center: number;
}

export function calculateMeanEstimationCentered(
  input: MeanEstimationInputs,
): MeanEstimationCentered {
  const base = calculateMeanEstimation(input);
  return {
    ...base,
    center: input.xBar,
    lowerBound: input.xBar - base.marginOfError,
    upperBound: input.xBar + base.marginOfError,
  };
}

export function calculateProportionEstimation(
  input: ProportionEstimationInputs,
): EstimationResults & { center: number } {
  const { n, pHat, confidence } = input;
  const standardError = Math.sqrt((pHat * (1 - pHat)) / n);
  const zCritical = zCriticalForConfidence(confidence);
  const marginOfError = zCritical * standardError;
  return {
    standardError,
    marginOfError,
    zCritical,
    lowerBound: pHat - marginOfError,
    upperBound: pHat + marginOfError,
    confidenceLevel: confidence,
    center: pHat,
  };
}

// =====================================================
// ANOVA — UN FACTOR
// =====================================================
export interface LabeledGroup {
  label: string;
  values: number[];
}

export function calculateAnovaOneWay(
  input: LabeledGroup[],
  alpha: number,
): AnovaOneWayResult {
  const groups: GroupSummary[] = input.map((g) => {
    const n = g.values.length;
    const sum = g.values.reduce((a, b) => a + b, 0);
    return { label: g.label, n, sum, mean: n > 0 ? sum / n : 0 };
  });

  const N = groups.reduce((a, g) => a + g.n, 0);
  const grandTotal = groups.reduce((a, g) => a + g.sum, 0);
  const grandMean = N > 0 ? grandTotal / N : 0;
  const k = groups.length;

  // SS entre grupos = Σ n_j (x̄_j − x̄)²
  let ssBetween = 0;
  groups.forEach((g) => {
    ssBetween += g.n * (g.mean - grandMean) ** 2;
  });

  // SS dentro = ΣΣ (x_ij − x̄_j)²
  let ssWithin = 0;
  input.forEach((g, j) => {
    const mean = groups[j].mean;
    g.values.forEach((v) => {
      ssWithin += (v - mean) ** 2;
    });
  });

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;
  const msBetween = ssBetween / dfBetween;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;
  const fStatistic = msWithin > 0 ? msBetween / msWithin : 0;
  const pValue = msWithin > 0 ? 1 - fCdf(fStatistic, dfBetween, dfWithin) : 1;
  const fCritical = fQuantile(1 - alpha, dfBetween, dfWithin);
  const rejectH0 = fStatistic > fCritical;

  const rows: AnovaTableRow[] = [
    { source: 'Entre grupos', ss: ssBetween, df: dfBetween, ms: msBetween, f: fStatistic, pValue, fCritical },
    { source: 'Dentro de grupos (error)', ss: ssWithin, df: dfWithin, ms: msWithin, f: null, pValue: null, fCritical: null },
    { source: 'Total', ss: ssTotal, df: dfTotal, ms: null, f: null, pValue: null, fCritical: null },
  ];

  return {
    rows, groups, grandMean, grandTotal, N, k,
    fStatistic, pValue, fCritical, rejectH0, alpha,
  };
}

// =====================================================
// ANOVA — DOS FACTORES
// =====================================================
export function calculateAnovaTwoWay(
  matrix: number[][][],
  alpha: number,
  rowLabels: string[],
  colLabels: string[],
): AnovaTwoWayResult {
  const a = matrix.length;
  const b = matrix[0].length;
  const r = matrix[0][0].length; // réplicas por celda (asumida constante)
  const hasReplication = r > 1;

  const all: number[] = [];
  matrix.forEach((row) => row.forEach((cell) => cell.forEach((v) => all.push(v))));
  const N = all.length;
  const grandTotal = all.reduce((s, v) => s + v, 0);
  const grandMean = grandTotal / N;

  const cellMean = (i: number, j: number) =>
    matrix[i][j].reduce((s, v) => s + v, 0) / matrix[i][j].length;

  // Medias de fila (A) y columna (B)
  const rowMean = (i: number) => {
    let s = 0; let c = 0;
    matrix[i].forEach((cell) => cell.forEach((v) => { s += v; c += 1; }));
    return s / c;
  };
  const colMean = (j: number) => {
    let s = 0; let c = 0;
    matrix.forEach((row) => row[j].forEach((v) => { s += v; c += 1; }));
    return s / c;
  };

  // SS_A = b·r · Σ (x̄_i.. − x̄)²
  let ssA = 0;
  for (let i = 0; i < a; i++) ssA += (b * r) * (rowMean(i) - grandMean) ** 2;
  // SS_B = a·r · Σ (x̄_.j. − x̄)²
  let ssB = 0;
  for (let j = 0; j < b; j++) ssB += (a * r) * (colMean(j) - grandMean) ** 2;

  // SS_total = ΣΣΣ (x − x̄)²
  const ssTotal = all.reduce((s, v) => s + (v - grandMean) ** 2, 0);

  const rows: AnovaTableRow[] = [];
  const dfA = a - 1;
  const dfB = b - 1;

  if (hasReplication) {
    // SS_cells = r · ΣΣ (x̄_ij − x̄)²  ; SS_AB = SS_cells − SS_A − SS_B
    let ssCells = 0;
    for (let i = 0; i < a; i++)
      for (let j = 0; j < b; j++) ssCells += r * (cellMean(i, j) - grandMean) ** 2;
    const ssAB = ssCells - ssA - ssB;
    // SS_error = ΣΣΣ (x − x̄_ij)²
    let ssError = 0;
    for (let i = 0; i < a; i++)
      for (let j = 0; j < b; j++) {
        const m = cellMean(i, j);
        matrix[i][j].forEach((v) => { ssError += (v - m) ** 2; });
      }
    const dfAB = dfA * dfB;
    const dfError = a * b * (r - 1);
    const msA = ssA / dfA;
    const msB = ssB / dfB;
    const msAB = ssAB / dfAB;
    const msError = ssError / dfError;
    const fA = msA / msError;
    const fB = msB / msError;
    const fAB = msAB / msError;
    rows.push(
      { source: 'Factor A (filas)', ss: ssA, df: dfA, ms: msA, f: fA, pValue: 1 - fCdf(fA, dfA, dfError), fCritical: fQuantile(1 - alpha, dfA, dfError) },
      { source: 'Factor B (columnas)', ss: ssB, df: dfB, ms: msB, f: fB, pValue: 1 - fCdf(fB, dfB, dfError), fCritical: fQuantile(1 - alpha, dfB, dfError) },
      { source: 'Interacción A×B', ss: ssAB, df: dfAB, ms: msAB, f: fAB, pValue: 1 - fCdf(fAB, dfAB, dfError), fCritical: fQuantile(1 - alpha, dfAB, dfError) },
      { source: 'Error', ss: ssError, df: dfError, ms: msError, f: null, pValue: null, fCritical: null },
      { source: 'Total', ss: ssTotal, df: N - 1, ms: null, f: null, pValue: null, fCritical: null },
    );
  } else {
    // Sin repetición: SS_error = SS_total − SS_A − SS_B
    const ssError = ssTotal - ssA - ssB;
    const dfError = dfA * dfB;
    const msA = ssA / dfA;
    const msB = ssB / dfB;
    const msError = ssError / dfError;
    const fA = msA / msError;
    const fB = msB / msError;
    rows.push(
      { source: 'Factor A (filas)', ss: ssA, df: dfA, ms: msA, f: fA, pValue: 1 - fCdf(fA, dfA, dfError), fCritical: fQuantile(1 - alpha, dfA, dfError) },
      { source: 'Factor B (columnas)', ss: ssB, df: dfB, ms: msB, f: fB, pValue: 1 - fCdf(fB, dfB, dfError), fCritical: fQuantile(1 - alpha, dfB, dfError) },
      { source: 'Error', ss: ssError, df: dfError, ms: msError, f: null, pValue: null, fCritical: null },
      { source: 'Total', ss: ssTotal, df: N - 1, ms: null, f: null, pValue: null, fCritical: null },
    );
  }

  return { rows, hasReplication, a, b, r, grandMean, N, alpha, rowLabels, colLabels };
}
