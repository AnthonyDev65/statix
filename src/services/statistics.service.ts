// =====================================================
// Statix - Servicio de cálculos estadísticos
// =====================================================
import {
  combination,
  logCombination,
  normalCdf,
  normalPdf,
  normalQuantile,
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
