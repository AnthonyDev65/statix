// =====================================================
// Statix - Utilidades matemáticas
// =====================================================
import { SQRT_2PI } from '@/constants';

// -----------------------------------------------------
// Función Gamma (Lanczos approximation)
// -----------------------------------------------------
const LANCZOS_G = 7;
const LANCZOS_C = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

export function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = LANCZOS_C[0];
  for (let i = 1; i < LANCZOS_G + 2; i++) {
    x += LANCZOS_C[i] / (z + i);
  }
  const t = z + LANCZOS_G + 0.5;
  return SQRT_2PI * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/** Logaritmo de la función Gamma */
export function logGamma(z: number): number {
  return Math.log(gamma(z));
}

// -----------------------------------------------------
// Coeficientes binomiales (log y directos)
// -----------------------------------------------------
export function logCombination(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

export function combination(n: number, k: number): number {
  const logC = logCombination(n, k);
  if (!isFinite(logC)) return 0;
  return Math.exp(logC);
}

// -----------------------------------------------------
// Distribución Normal - PDF / CDF
// -----------------------------------------------------
/** Función de densidad normal estándar */
export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

/** CDF normal estándar usando erf */
export function normalCdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Aproximación Abramowitz & Stegun para erf */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

/** Cuantil de la normal estándar (inversa de la CDF) — algoritmo de Beasley-Springer-Moro */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// -----------------------------------------------------
// Distribución de Poisson (usada en algunas interpolaciones)
// -----------------------------------------------------
export function poissonPmf(lambda: number, k: number): number {
  if (k < 0) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1));
}

// -----------------------------------------------------
// Beta incompleta regularizada  I_x(a, b)  (Numerical Recipes)
// -----------------------------------------------------
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Beta incompleta regularizada I_x(a,b) ∈ [0,1]. */
export function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = logGamma(a + b) - logGamma(a) - logGamma(b);
  const front = Math.exp(lbeta + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betacf(a, b, x)) / a;
  }
  return 1 - (front * betacf(b, a, 1 - x)) / b;
}

/** CDF de la distribución F con d1, d2 grados de libertad: P(F ≤ f). */
export function fCdf(f: number, d1: number, d2: number): number {
  if (f <= 0) return 0;
  const x = (d1 * f) / (d1 * f + d2);
  return incompleteBeta(x, d1 / 2, d2 / 2);
}

/** Cuantil de F (inversa de la CDF) por bisección. */
export function fQuantile(p: number, d1: number, d2: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0;
  let hi = 1e7;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (fCdf(mid, d1, d2) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// -----------------------------------------------------
// Rango studentizado q (Tukey) — tabla estándar
// Filas: gl del error. Columnas: k = 2..10.
// -----------------------------------------------------
const Q_DF = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 30, 40, 60, 120, Infinity];

// α = 0.05
const Q_TABLE_05: number[][] = [
  [17.97, 26.98, 32.82, 37.08, 40.41, 43.12, 45.40, 47.36, 49.07],
  [6.08, 8.33, 9.80, 10.88, 11.74, 12.44, 13.03, 13.54, 13.99],
  [4.50, 5.91, 6.82, 7.50, 8.04, 8.48, 8.85, 9.18, 9.46],
  [3.93, 5.04, 5.76, 6.29, 6.71, 7.05, 7.35, 7.60, 7.83],
  [3.64, 4.60, 5.22, 5.67, 6.03, 6.33, 6.58, 6.80, 6.99],
  [3.46, 4.34, 4.90, 5.30, 5.63, 5.90, 6.12, 6.32, 6.49],
  [3.34, 4.16, 4.68, 5.06, 5.36, 5.61, 5.82, 6.00, 6.16],
  [3.26, 4.04, 4.53, 4.89, 5.17, 5.40, 5.60, 5.77, 5.92],
  [3.20, 3.95, 4.41, 4.76, 5.02, 5.24, 5.43, 5.59, 5.74],
  [3.15, 3.88, 4.33, 4.65, 4.91, 5.12, 5.30, 5.46, 5.60],
  [3.08, 3.77, 4.20, 4.51, 4.75, 4.95, 5.12, 5.27, 5.39],
  [3.03, 3.70, 4.11, 4.41, 4.64, 4.83, 4.99, 5.13, 5.25],
  [3.00, 3.65, 4.05, 4.33, 4.56, 4.74, 4.90, 5.03, 5.15],
  [2.97, 3.61, 4.00, 4.28, 4.49, 4.67, 4.82, 4.96, 5.07],
  [2.95, 3.58, 3.96, 4.23, 4.45, 4.62, 4.77, 4.90, 5.01],
  [2.92, 3.53, 3.90, 4.17, 4.37, 4.54, 4.68, 4.81, 4.92],
  [2.89, 3.49, 3.85, 4.10, 4.30, 4.46, 4.60, 4.72, 4.82],
  [2.86, 3.44, 3.79, 4.04, 4.23, 4.39, 4.52, 4.63, 4.73],
  [2.83, 3.40, 3.74, 3.98, 4.16, 4.31, 4.44, 4.55, 4.65],
  [2.80, 3.36, 3.68, 3.92, 4.10, 4.24, 4.36, 4.47, 4.56],
  [2.77, 3.31, 3.63, 3.86, 4.03, 4.17, 4.29, 4.39, 4.47],
];

// α = 0.01
const Q_TABLE_01: number[][] = [
  [90.03, 135.0, 164.3, 185.6, 202.2, 215.8, 227.2, 237.0, 245.6],
  [14.04, 19.02, 22.29, 24.72, 26.63, 28.20, 29.53, 30.68, 31.69],
  [8.26, 10.62, 12.17, 13.33, 14.24, 15.00, 15.64, 16.20, 16.69],
  [6.51, 8.12, 9.17, 9.96, 10.58, 11.10, 11.55, 11.93, 12.27],
  [5.70, 6.98, 7.80, 8.42, 8.91, 9.32, 9.67, 9.97, 10.24],
  [5.24, 6.33, 7.03, 7.56, 7.97, 8.32, 8.61, 8.87, 9.10],
  [4.95, 5.92, 6.54, 7.01, 7.37, 7.68, 7.94, 8.17, 8.37],
  [4.75, 5.64, 6.20, 6.62, 6.96, 7.24, 7.47, 7.68, 7.86],
  [4.60, 5.43, 5.96, 6.35, 6.66, 6.91, 7.13, 7.33, 7.49],
  [4.48, 5.27, 5.77, 6.14, 6.43, 6.67, 6.87, 7.05, 7.21],
  [4.32, 5.05, 5.50, 5.84, 6.10, 6.32, 6.51, 6.67, 6.81],
  [4.21, 4.89, 5.32, 5.63, 5.88, 6.08, 6.26, 6.41, 6.54],
  [4.13, 4.79, 5.19, 5.49, 5.72, 5.92, 6.08, 6.22, 6.35],
  [4.07, 4.70, 5.09, 5.38, 5.60, 5.79, 5.94, 6.08, 6.20],
  [4.02, 4.64, 5.02, 5.29, 5.51, 5.69, 5.84, 5.97, 6.09],
  [3.96, 4.55, 4.91, 5.17, 5.37, 5.54, 5.69, 5.81, 5.92],
  [3.89, 4.45, 4.80, 5.05, 5.24, 5.40, 5.54, 5.65, 5.76],
  [3.82, 4.37, 4.70, 4.93, 5.11, 5.26, 5.39, 5.50, 5.60],
  [3.76, 4.28, 4.59, 4.82, 4.99, 5.13, 5.25, 5.36, 5.45],
  [3.70, 4.20, 4.50, 4.71, 4.87, 5.01, 5.12, 5.21, 5.30],
  [3.64, 4.12, 4.40, 4.60, 4.76, 4.88, 4.99, 5.08, 5.16],
];

/**
 * Valor crítico q del rango studentizado para Tukey.
 * k = nº de grupos (2..10), dfError = gl del error, alpha = 0.05 o 0.01.
 * Interpola linealmente en gl y hace clamp fuera de la tabla.
 */
export function studentizedRangeQ(k: number, dfError: number, alpha: number): number {
  const table = alpha <= 0.01 ? Q_TABLE_01 : Q_TABLE_05;
  const col = Math.min(Math.max(Math.round(k), 2), 10) - 2; // k=2 -> col 0
  // localizar el gl en Q_DF
  if (dfError <= Q_DF[0]) return table[0][col];
  for (let i = 1; i < Q_DF.length; i++) {
    const upper = Q_DF[i];
    if (dfError <= upper || upper === Infinity) {
      const lowerDf = Q_DF[i - 1];
      const lowerQ = table[i - 1][col];
      if (upper === Infinity) return lowerQ; // clamp a la última fila finita
      const upperQ = table[i][col];
      const t = (dfError - lowerDf) / (upper - lowerDf);
      return lowerQ + t * (upperQ - lowerQ);
    }
  }
  return table[table.length - 1][col];
}
