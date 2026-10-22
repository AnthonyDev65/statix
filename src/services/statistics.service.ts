// =====================================================
// Statix - Servicio de cálculos estadísticos
// =====================================================
import {
  logCombination,
  normalCdf,
  normalSurvival,
  normalPdf,
  normalQuantile,
  tQuantile,
  fCdf,
  fQuantile,
  studentizedRangeQInfo,
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
  ProportionEstimationResults,
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
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * P(X = x) calculada en espacio logarítmico para no desbordar con n grande:
 * log P = log C(n,x) + x·log p + (n−x)·log(1−p).
 * Los casos p = 0 y p = 1 (distribución degenerada) se tratan de forma exacta.
 */
export function binomialPmf(n: number, p: number, x: number): number {
  if (x < 0 || x > n) return 0;
  if (p <= 0) return x === 0 ? 1 : 0;
  if (p >= 1) return x === n ? 1 : 0;
  const logP = logCombination(n, x) + x * Math.log(p) + (n - x) * Math.log1p(-p);
  return Math.exp(logP);
}

/** P(X ≤ x): suma directa de la cola inferior. */
export function binomialCdf(n: number, p: number, x: number): number {
  if (x < 0) return 0;
  if (x >= n) return 1;
  let sum = 0;
  for (let k = 0; k <= x; k++) {
    sum += binomialPmf(n, p, k);
  }
  return clamp01(sum);
}

/**
 * P(X ≥ x): suma directa de la cola superior (no 1 − CDF), lo que conserva
 * la precisión relativa cuando la probabilidad es muy pequeña.
 */
export function binomialSurvival(n: number, p: number, x: number): number {
  if (x <= 0) return 1;
  if (x > n) return 0;
  let sum = 0;
  for (let k = n; k >= x; k--) {
    sum += binomialPmf(n, p, k);
  }
  return clamp01(sum);
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
  const lowerSupport = Math.max(0, n - (N - K));
  const upperSupport = Math.min(n, K);
  if (x < lowerSupport) return 0;
  if (x >= upperSupport) return 1;
  let sum = 0;
  for (let k = lowerSupport; k <= x; k++) {
    sum += hypergeometricPmf(N, K, n, k);
  }
  return clamp01(sum);
}

/** P(X ≥ x): suma directa de la cola superior (sin cancelación de 1 − CDF). */
export function hypergeometricSurvival(
  N: number,
  K: number,
  n: number,
  x: number,
): number {
  const lowerSupport = Math.max(0, n - (N - K));
  const upperSupport = Math.min(n, K);
  if (x <= lowerSupport) return 1;
  if (x > upperSupport) return 0;
  let sum = 0;
  for (let k = upperSupport; k >= x; k--) {
    sum += hypergeometricPmf(N, K, n, k);
  }
  return clamp01(sum);
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
      // Función complementaria: precisa aunque la probabilidad sea minúscula
      probability = normalSurvival(x, mu, sigma);
      bounds.a = x;
      bounds.b = mu + 4 * sigma;
      break;
    }
    case 'between': {
      const a = Math.min(x, x2 ?? x);
      const b = Math.max(x, x2 ?? x);
      // En la cola derecha restar supervivencias evita la cancelación de 1 − ε
      probability = a > mu
        ? normalSurvival(a, mu, sigma) - normalSurvival(b, mu, sigma)
        : normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma);
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

/** Valor crítico t_{α/2, df} para el nivel de confianza dado. */
function tCriticalForConfidence(confidence: number, df: number): number {
  const alpha = 1 - confidence;
  return tQuantile(1 - alpha / 2, df);
}

/**
 * IC para la media.
 * - Por defecto s es la desviación muestral → t de Student con n − 1 gl.
 * - Con sigmaKnown = true, s es σ poblacional conocida → normal z.
 * `zCritical` se mantiene por compatibilidad y contiene el valor crítico usado
 * (z o t); consultar `criticalKind` para saber cuál.
 */
export function calculateMeanEstimation(
  input: MeanEstimationInputs,
): EstimationResults {
  const { n, s, confidence, sigmaKnown = false } = input;
  const standardError = s / Math.sqrt(n);
  // Con n < 2 y σ desconocida no hay gl: tQuantile devuelve NaN (el esquema exige n ≥ 2)
  const useZ = sigmaKnown;
  const df = useZ ? undefined : n - 1;
  const critical = useZ
    ? zCriticalForConfidence(confidence)
    : tCriticalForConfidence(confidence, n - 1);
  const marginOfError = critical * standardError;
  // Nota: xBar no entra en el ancho del IC, sólo en el centro
  // devolvemos bounds con centro en xBar
  // (se ajustan al renderizar con xBar)
  return {
    standardError,
    marginOfError,
    zCritical: critical,
    critical,
    criticalKind: useZ ? 'z' : 't',
    df,
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

/**
 * IC para la proporción.
 * - Wald: p̂ ± z·√(p̂(1−p̂)/n), recortado a [0, 1] (waldClamped indica si hubo recorte).
 * - Wilson (score): (p̂ + z²/2n ± z·√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n).
 *   Mejor cobertura con n pequeño o p̂ cercano a 0 o 1; siempre dentro de [0, 1].
 */
export function calculateProportionEstimation(
  input: ProportionEstimationInputs,
): ProportionEstimationResults {
  const { n, pHat, confidence } = input;
  const standardError = Math.sqrt((pHat * (1 - pHat)) / n);
  const zCritical = zCriticalForConfidence(confidence);
  const marginOfError = zCritical * standardError;

  // Wald (recortado a [0, 1])
  const rawLower = pHat - marginOfError;
  const rawUpper = pHat + marginOfError;
  const lowerBound = clamp01(rawLower);
  const upperBound = clamp01(rawUpper);
  const waldClamped = lowerBound !== rawLower || upperBound !== rawUpper;

  // Wilson
  const z2 = zCritical * zCritical;
  const denom = 1 + z2 / n;
  const wilsonCenter = (pHat + z2 / (2 * n)) / denom;
  const wilsonHalf =
    (zCritical / denom) * Math.sqrt((pHat * (1 - pHat)) / n + z2 / (4 * n * n));

  return {
    standardError,
    marginOfError,
    zCritical,
    critical: zCritical,
    criticalKind: 'z',
    lowerBound,
    upperBound,
    confidenceLevel: confidence,
    center: pHat,
    // Con p̂ = 0 (o 1) el límite de Wilson es exactamente 0 (o 1); se fija para evitar ruido de redondeo
    wilsonLower: pHat <= 0 ? 0 : clamp01(wilsonCenter - wilsonHalf),
    wilsonUpper: pHat >= 1 ? 1 : clamp01(wilsonCenter + wilsonHalf),
    wilsonCenter,
    waldClamped,
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

  // Estadístico F y valor-p, con manejo de varianza de error cero.
  let fStatistic: number;
  let pValue: number;
  if (msWithin > 0) {
    fStatistic = msBetween / msWithin;
    pValue = 1 - fCdf(fStatistic, dfBetween, dfWithin);
  } else if (dfWithin > 0) {
    // Varianza dentro de grupos nula: si las medias difieren (ssBetween > 0)
    // el F es efectivamente +∞ y se rechaza H₀; si todo es idéntico, no.
    if (ssBetween > 0) {
      fStatistic = Infinity;
      pValue = 0;
    } else {
      fStatistic = 0;
      pValue = 1;
    }
  } else {
    fStatistic = 0;
    pValue = 1;
  }

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
/**
 * Comprueba que el diseño de dos factores sea balanceado y rectangular:
 * al menos una fila, todas las filas con el mismo nº de columnas (≥ 1) y
 * todas las celdas no vacías con el mismo nº de réplicas.
 */
export function isBalancedDesign(matrix: number[][][]): boolean {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const b = matrix[0]?.length ?? 0;
  if (b === 0) return false;
  const r = matrix[0][0]?.length ?? 0;
  if (r === 0) return false;
  return matrix.every(
    (row) => row.length === b && row.every((cell) => cell.length === r),
  );
}

/** Explica en español por qué un diseño no es balanceado (null si lo es). */
function unbalancedReason(matrix: number[][][]): string | null {
  if (!Array.isArray(matrix) || matrix.length === 0 || (matrix[0]?.length ?? 0) === 0) {
    return 'ANOVA de dos factores: la tabla de datos está vacía.';
  }
  const b = matrix[0].length;
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length !== b) {
      return `ANOVA de dos factores: la fila ${i + 1} tiene ${matrix[i].length} columnas y se esperaban ${b}.`;
    }
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < b; j++) {
      if (matrix[i][j].length === 0) {
        return `ANOVA de dos factores: la celda (fila ${i + 1}, columna ${j + 1}) está vacía.`;
      }
    }
  }
  if (!isBalancedDesign(matrix)) {
    const r = matrix[0][0].length;
    return `ANOVA de dos factores: el diseño no está balanceado; todas las celdas deben tener el mismo número de réplicas (la primera tiene ${r}).`;
  }
  return null;
}

/**
 * ANOVA de dos factores para diseños balanceados (mismo nº de réplicas r por celda).
 * Lanza un Error con mensaje en español si el diseño no es balanceado o hay celdas vacías.
 */
export function calculateAnovaTwoWay(
  matrix: number[][][],
  alpha: number,
  rowLabels: string[],
  colLabels: string[],
): AnovaTwoWayResult {
  const reason = unbalancedReason(matrix);
  if (reason) throw new Error(reason);
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

  // F y valor-p para un efecto, con manejo de varianza de error cero
  // (evita NaN por 0/0 e Infinity por ms/0).
  const effectFP = (
    ms: number,
    msError: number,
    dfEffect: number,
    dfError: number,
  ): { f: number; pValue: number } => {
    if (msError > 0) {
      const f = ms / msError;
      return { f, pValue: 1 - fCdf(f, dfEffect, dfError) };
    }
    return { f: ms > 0 ? Infinity : 0, pValue: ms > 0 ? 0 : 1 };
  };

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
    const rA = effectFP(msA, msError, dfA, dfError);
    const rB = effectFP(msB, msError, dfB, dfError);
    const rAB = effectFP(msAB, msError, dfAB, dfError);
    rows.push(
      { source: 'Factor A (filas)', ss: ssA, df: dfA, ms: msA, f: rA.f, pValue: rA.pValue, fCritical: fQuantile(1 - alpha, dfA, dfError) },
      { source: 'Factor B (columnas)', ss: ssB, df: dfB, ms: msB, f: rB.f, pValue: rB.pValue, fCritical: fQuantile(1 - alpha, dfB, dfError) },
      { source: 'Interacción A×B', ss: ssAB, df: dfAB, ms: msAB, f: rAB.f, pValue: rAB.pValue, fCritical: fQuantile(1 - alpha, dfAB, dfError) },
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
    const rA = effectFP(msA, msError, dfA, dfError);
    const rB = effectFP(msB, msError, dfB, dfError);
    rows.push(
      { source: 'Factor A (filas)', ss: ssA, df: dfA, ms: msA, f: rA.f, pValue: rA.pValue, fCritical: fQuantile(1 - alpha, dfA, dfError) },
      { source: 'Factor B (columnas)', ss: ssB, df: dfB, ms: msB, f: rB.f, pValue: rB.pValue, fCritical: fQuantile(1 - alpha, dfB, dfError) },
      { source: 'Error', ss: ssError, df: dfError, ms: msError, f: null, pValue: null, fCritical: null },
      { source: 'Total', ss: ssTotal, df: N - 1, ms: null, f: null, pValue: null, fCritical: null },
    );
  }

  return { rows, hasReplication, a, b, r, grandMean, N, alpha, rowLabels, colLabels };
}

/**
 * Tukey HSD: compara todos los pares de grupos.
 * mse = cuadrado medio del error; dfError = gl del error.
 * HSD_ij = q(k, dfError, α) · √( MSE/2 · (1/n_i + 1/n_j) )
 */
export function tukeyHSD(
  input: LabeledGroup[],
  mse: number,
  dfError: number,
  alpha: number,
): TukeyResult {
  const k = input.length;
  const qInfo = studentizedRangeQInfo(k, dfError, alpha);
  const q = qInfo.q;
  const means = input.map((g) => ({
    label: g.label,
    n: g.values.length,
    mean: g.values.reduce((a, b) => a + b, 0) / g.values.length,
  }));

  const comparisons: TukeyComparison[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const se = Math.sqrt((mse / 2) * (1 / means[i].n + 1 / means[j].n));
      const hsd = q * se;
      const meanDiff = Math.abs(means[i].mean - means[j].mean);
      comparisons.push({
        a: means[i].label,
        b: means[j].label,
        meanDiff,
        hsd,
        significant: meanDiff > hsd,
      });
    }
  }
  return {
    q,
    comparisons,
    alpha,
    qMethod: qInfo.method,
    outOfTable: qInfo.outOfTable,
    approximate: qInfo.approximate,
    warning: qInfo.warning,
  };
}
