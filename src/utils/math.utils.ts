/* eslint-disable no-loss-of-precision -- coeficientes publicados con más dígitos de los que representa un double; se conservan tal cual. */
// =====================================================
// Statix - Utilidades matemáticas
// =====================================================
import { SQRT_2PI, LN_SQRT_2PI } from '@/constants';

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

/**
 * Logaritmo de |Γ(z)| calculado directamente en espacio logarítmico (Lanczos).
 * No desborda para z > 171 (donde Γ(z) = Infinity en doble precisión).
 * Para z < 0.5 usa la fórmula de reflexión: Γ(z)Γ(1−z) = π / sin(πz).
 */
export function logGamma(z: number): number {
  if (z < 0.5) {
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - logGamma(1 - z);
  }
  z -= 1;
  let x = LANCZOS_C[0];
  for (let i = 1; i < LANCZOS_G + 2; i++) {
    x += LANCZOS_C[i] / (z + i);
  }
  const t = z + LANCZOS_G + 0.5;
  return LN_SQRT_2PI + (z + 0.5) * Math.log(t) - t + Math.log(x);
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
  const c = Math.exp(logC);
  // Para argumentos enteros el resultado es entero: redondear mientras el error
  // relativo de exp(log C) sea muy inferior a 0.5 unidades
  if (Number.isInteger(n) && Number.isInteger(k) && c < 1e9) {
    return Math.round(c);
  }
  return c;
}

// -----------------------------------------------------
// Distribución Normal - PDF / CDF
// -----------------------------------------------------
/** Función de densidad normal estándar */
export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

/**
 * CDF normal: P(X ≤ x) = ½·erfc(−z/√2).
 * Usar erfc (y no 1 + erf) conserva la precisión relativa en la cola izquierda.
 */
export function normalCdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return 0.5 * erfc(-z / Math.SQRT2);
}

/**
 * Función de supervivencia normal: P(X > x) = ½·erfc(z/√2).
 * Preferir sobre 1 − normalCdf(x) en la cola derecha (evita cancelación).
 */
export function normalSurvival(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return 0.5 * erfc(z / Math.SQRT2);
}

// Coeficientes de Chebyshev para erfc (Numerical Recipes 3ª ed., erfccheb)
const ERFC_COF = [
  -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
  -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
  4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
  1.30365583558e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
  5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11,
  2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13,
  3.81e-16, 7.106e-15, -1.523e-15, -9.4e-17, 1.21e-16, -2.8e-17,
];

/** erfc(z) para z ≥ 0 mediante expansión de Chebyshev (error relativo ~1e-15). */
function erfcCheb(z: number): number {
  const t = 2 / (2 + z);
  const ty = 4 * t - 2;
  let d = 0;
  let dd = 0;
  for (let j = ERFC_COF.length - 1; j > 0; j--) {
    const tmp = d;
    d = ty * d - dd + ERFC_COF[j];
    dd = tmp;
  }
  return t * Math.exp(-z * z + 0.5 * (ERFC_COF[0] + ty * d) - dd);
}

/** Función error complementaria erfc(x) = 1 − erf(x), precisa en ambas colas. */
export function erfc(x: number): number {
  if (Number.isNaN(x)) return NaN;
  return x >= 0 ? erfcCheb(x) : 2 - erfcCheb(-x);
}

/** Función error erf(x). Serie de Taylor cerca de 0 para conservar precisión relativa. */
export function erf(x: number): number {
  if (Number.isNaN(x)) return NaN;
  const ax = Math.abs(x);
  if (ax < 0.5) {
    // erf(x) = 2/√π · Σ (−1)ⁿ x^(2n+1) / (n!·(2n+1))
    const x2 = x * x;
    let term = x;
    let sum = x;
    for (let n = 1; n < 30; n++) {
      term *= -x2 / n;
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
    }
    return (2 / Math.sqrt(Math.PI)) * sum;
  }
  return x >= 0 ? 1 - erfcCheb(ax) : erfcCheb(ax) - 1;
}

/**
 * Cuantil de la normal estándar (inversa de la CDF).
 * Aproximación racional de Acklam (~1e-9) refinada con un paso de Halley
 * usando erfc, lo que lleva el resultado a precisión de máquina.
 */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const x = normalQuantileRational(p);
  // Paso de Halley: e = Φ(x) − p ; u = e·√(2π)·exp(x²/2)
  const e = 0.5 * erfc(-x / Math.SQRT2) - p;
  const u = e * SQRT_2PI * Math.exp((x * x) / 2);
  const refined = x - u / (1 + (x * u) / 2);
  return Number.isFinite(refined) ? refined : x;
}

function normalQuantileRational(p: number): number {

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
  // El nº de iteraciones necesario crece como O(√max(a,b)); se deja margen
  // amplio para gl grandes (p. ej. t con gl ~ 1e6). El bucle corta al converger.
  const MAXIT = 10000;
  const EPS = 3e-14;
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

// -----------------------------------------------------
// Distribución t de Student
// -----------------------------------------------------
/** Cola derecha P(T > t) para t ≥ 0:  ½·I_{df/(df+t²)}(df/2, ½). */
function tUpperTail(t: number, df: number): number {
  if (!Number.isFinite(t)) return 0;
  const x = df / (df + t * t);
  return 0.5 * incompleteBeta(x, df / 2, 0.5);
}

/** CDF de la t de Student con df grados de libertad: P(T ≤ t). */
export function tCdf(t: number, df: number): number {
  if (Number.isNaN(t) || !(df > 0)) return NaN;
  if (t === 0) return 0.5;
  const tail = tUpperTail(Math.abs(t), df);
  return t > 0 ? 1 - tail : tail;
}

/**
 * Cuantil de la t de Student: valor t tal que P(T ≤ t) = p.
 * Bisección sobre la cola (sin cancelación 1 − p) con acotamiento adaptativo;
 * robusto para df ≥ 1 (incluye Cauchy, df = 1).
 */
export function tQuantile(p: number, df: number): number {
  if (Number.isNaN(p) || !(df > 0)) return NaN;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  if (p < 0.5) return -tQuantile(1 - p, df);
  const target = 1 - p; // probabilidad de la cola derecha
  // Acotar: partir del cuantil normal y duplicar hasta superar la cola
  let lo = 0;
  let hi = Math.max(1, normalQuantile(p));
  while (tUpperTail(hi, df) > target && hi < 1e300) {
    lo = hi;
    hi *= 2;
  }
  for (let i = 0; i < 200; i++) {
    const mid = 0.5 * (lo + hi);
    if (tUpperTail(mid, df) > target) lo = mid;
    else hi = mid;
    if (hi - lo <= 1e-14 * hi) break;
  }
  return 0.5 * (lo + hi);
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
 * Busca q en la tabla (k = 2..10, α ∈ {0.05, 0.01}).
 * Interpola en 1/gl (interpolación armónica, la recomendada para estas tablas),
 * lo que también permite interpolar correctamente entre gl = 120 y gl = ∞.
 */
function studentizedRangeQTable(k: number, dfError: number, alpha: number): number {
  const table = alpha <= 0.01 ? Q_TABLE_01 : Q_TABLE_05;
  const col = Math.min(Math.max(Math.round(k), 2), 10) - 2; // k=2 -> col 0
  if (dfError <= Q_DF[0]) return table[0][col];
  for (let i = 1; i < Q_DF.length; i++) {
    const upper = Q_DF[i];
    if (dfError <= upper) {
      const lowerDf = Q_DF[i - 1];
      const lowerQ = table[i - 1][col];
      const upperQ = table[i][col];
      // 1/∞ = 0, por lo que el último tramo queda bien definido
      const t = (1 / lowerDf - 1 / dfError) / (1 / lowerDf - 1 / upper);
      return lowerQ + t * (upperQ - lowerQ);
    }
  }
  return table[table.length - 1][col];
}

// -----------------------------------------------------
// Rango studentizado — cálculo numérico (Copenhaver & Holland, 1988;
// misma formulación que ptukey/qtukey de R). Una sola familia de rangos (rr = 1).
// -----------------------------------------------------
const WPROB_XLEG = [
  0.981560634246719250690549090149, 0.904117256370474856678465866119,
  0.769902674194304687036893833213, 0.587317954286617447296702418941,
  0.367831498998180193752691536644, 0.125233408511468915472441369464,
];
const WPROB_ALEG = [
  0.047175336386511827194615961485, 0.106939325995318430960254718194,
  0.160078328543346226334652529543, 0.20316742672306592174906445581,
  0.233492536538354808760849898925, 0.249147045813402785000562436043,
];

/** P(rango de cc normales estándar < w)  (gl = ∞). */
function studentizedRangeWprob(w: number, cc: number): number {
  const nleg = 12;
  const ihalf = 6;
  const C1 = -30;
  const C2 = -50;
  const C3 = 60;
  const bb = 8;
  const wlar = 3;
  const qsqz = w * 0.5;
  if (qsqz >= bb) return 1;

  // (2Φ(w/2) − 1)^cc : primer término de la forma de Hartley
  let prW = 2 * normalCdf(qsqz) - 1;
  prW = prW >= Math.exp(C2 / cc) ? Math.pow(prW, cc) : 0;

  const wincr = w > wlar ? 2 : 3;
  let blb = qsqz;
  const binc = (bb - qsqz) / wincr;
  let bub = blb + binc;
  let einsum = 0;
  const cc1 = cc - 1;
  for (let wi = 1; wi <= wincr; wi++) {
    let elsum = 0;
    const a = 0.5 * (bub + blb);
    const b = 0.5 * (bub - blb);
    for (let jj = 1; jj <= nleg; jj++) {
      let j: number;
      let xx: number;
      if (ihalf < jj) {
        j = nleg - jj + 1;
        xx = WPROB_XLEG[j - 1];
      } else {
        j = jj;
        xx = -WPROB_XLEG[j - 1];
      }
      const ac = a + b * xx;
      const qexpo = ac * ac;
      if (qexpo > C3) break;
      const pplus = 2 * normalCdf(ac);
      const pminus = 2 * normalCdf(ac, w, 1);
      let rinsum = pplus * 0.5 - pminus * 0.5;
      if (rinsum >= Math.exp(C1 / cc1)) {
        rinsum = WPROB_ALEG[j - 1] * Math.exp(-(0.5 * qexpo)) * Math.pow(rinsum, cc1);
        elsum += rinsum;
      }
    }
    elsum *= (2 * b * cc) / SQRT_2PI;
    einsum += elsum;
    blb = bub;
    bub += binc;
  }
  prW += einsum;
  if (prW <= Math.exp(C1)) return 0;
  return Math.min(1, prW);
}

const PTUKEY_XLEGQ = [
  0.98940093499164993259615417345, 0.944575023073232576077988415535,
  0.865631202387831743880467897712, 0.755404408355003033895101194847,
  0.617876244402643748446671764049, 0.458016777657227386342419442984,
  0.28160355077925891323046050146, 0.950125098376374401853193354250e-1,
];
const PTUKEY_ALEGQ = [
  0.27152459411754094851780572456e-1, 0.622535239386478928628438369944e-1,
  0.951585116824927848099251076022e-1, 0.124628971255533872052476282192,
  0.149595988816576732081501730547, 0.16915651939500253818931207903,
  0.182603415044923588866763667969, 0.189450610455068496285396723208,
];

/**
 * CDF del rango studentizado: P(Q ≤ q) con k medias y df gl del error.
 * Requiere k ≥ 2 y df ≥ 2 (df = ∞ admitido). Devuelve NaN fuera de dominio.
 */
export function studentizedRangeCdf(q: number, k: number, df: number): number {
  if (Number.isNaN(q) || k < 2 || df < 2) return NaN;
  if (q <= 0) return 0;
  if (!Number.isFinite(q)) return 1;
  if (df > 25000) return studentizedRangeWprob(q, k);

  const nlegq = 16;
  const ihalfq = 8;
  const eps1 = -30;
  const eps2 = 1e-14;
  const f2 = df * 0.5;
  let f2lf = f2 * Math.log(df) - df * Math.LN2 - logGamma(f2);
  const f21 = f2 - 1;
  const ff4 = df * 0.25;
  let ulen: number;
  if (df <= 100) ulen = 1;
  else if (df <= 800) ulen = 0.5;
  else if (df <= 5000) ulen = 0.25;
  else ulen = 0.125;
  f2lf += Math.log(ulen);

  let ans = 0;
  for (let i = 1; i <= 50; i++) {
    let otsum = 0;
    const twa1 = (2 * i - 1) * ulen;
    for (let jj = 1; jj <= nlegq; jj++) {
      let j: number;
      let t1: number;
      if (ihalfq < jj) {
        j = jj - ihalfq - 1;
        t1 = f2lf + f21 * Math.log(twa1 + PTUKEY_XLEGQ[j] * ulen)
          - (PTUKEY_XLEGQ[j] * ulen + twa1) * ff4;
      } else {
        j = jj - 1;
        t1 = f2lf + f21 * Math.log(twa1 - PTUKEY_XLEGQ[j] * ulen)
          + (PTUKEY_XLEGQ[j] * ulen - twa1) * ff4;
      }
      if (t1 >= eps1) {
        const qsqz = ihalfq < jj
          ? q * Math.sqrt((PTUKEY_XLEGQ[j] * ulen + twa1) * 0.5)
          : q * Math.sqrt((-(PTUKEY_XLEGQ[j] * ulen) + twa1) * 0.5);
        const wprb = studentizedRangeWprob(qsqz, k);
        otsum += wprb * PTUKEY_ALEGQ[j] * Math.exp(t1);
      }
    }
    // al menos 1/ulen intervalos para no perder área en la cola izquierda
    if (i * ulen >= 1 && otsum <= eps2) break;
    ans += otsum;
  }
  return Math.min(1, ans);
}

/**
 * Cuantil del rango studentizado: q tal que P(Q ≤ q) = p.
 * Bisección acotada (la CDF es monótona). Requiere k ≥ 2 y df ≥ 2.
 */
export function studentizedRangeQuantile(p: number, k: number, df: number): number {
  if (Number.isNaN(p) || k < 2 || df < 2) return NaN;
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0;
  let hi = 4;
  while (studentizedRangeCdf(hi, k, df) < p && hi < 1e4) {
    lo = hi;
    hi *= 2;
  }
  for (let i = 0; i < 60; i++) {
    const mid = 0.5 * (lo + hi);
    if (studentizedRangeCdf(mid, k, df) < p) lo = mid;
    else hi = mid;
    if (hi - lo <= 1e-7 * hi) break;
  }
  return 0.5 * (lo + hi);
}

/** Resultado detallado del valor crítico q de Tukey. */
export interface StudentizedRangeQInfo {
  q: number;
  /** Origen del valor: tabla impresa o cálculo numérico (ptukey). */
  method: 'table' | 'numeric';
  /** true si (k, α) no están cubiertos por la tabla (k > 10 o α ∉ {0.05, 0.01}). */
  outOfTable: boolean;
  /** true si el valor no es fiable (fuera de tabla y sin cálculo numérico posible). */
  approximate: boolean;
  /** Aviso en español para mostrar al usuario, si procede. */
  warning?: string;
}

const isTableAlpha = (alpha: number) =>
  Math.abs(alpha - 0.05) < 1e-9 || Math.abs(alpha - 0.01) < 1e-9;

/**
 * Valor crítico q del rango studentizado para Tukey, con metadatos.
 * - Usa la tabla cuando k ∈ 2..10 y α ∈ {0.05, 0.01}.
 * - Fuera de la tabla calcula q numéricamente (requiere gl ≥ 2).
 * - Si no es posible (gl < 2 fuera de tabla) recurre a la tabla con clamp y
 *   lo marca como aproximado con un aviso.
 */
export function studentizedRangeQInfo(
  k: number,
  dfError: number,
  alpha: number,
): StudentizedRangeQInfo {
  const kk = Math.round(k);
  const inTable = kk >= 2 && kk <= 10 && isTableAlpha(alpha);
  if (inTable) {
    return {
      q: studentizedRangeQTable(kk, dfError, alpha),
      method: 'table',
      outOfTable: false,
      approximate: false,
    };
  }
  const reason = kk < 2
    ? `k = ${kk} no es válido (se requieren al menos 2 grupos)`
    : kk > 10
      ? `k = ${kk} supera la tabla (k ≤ 10)`
      : `α = ${alpha} no está en la tabla (solo 0.05 y 0.01)`;
  if (kk >= 2 && dfError >= 2 && alpha > 0 && alpha < 1) {
    const q = studentizedRangeQuantile(1 - alpha, kk, dfError);
    if (Number.isFinite(q)) {
      return {
        q,
        method: 'numeric',
        outOfTable: true,
        approximate: false,
        warning: `${reason}: q calculado numéricamente (integración de la distribución del rango studentizado).`,
      };
    }
  }
  return {
    q: studentizedRangeQTable(kk, dfError, alpha),
    method: 'table',
    outOfTable: true,
    approximate: true,
    warning: `${reason} y no se pudo calcular numéricamente (se requieren gl ≥ 2): se usa el valor más cercano de la tabla, que es solo aproximado.`,
  };
}

/**
 * Valor crítico q del rango studentizado para Tukey.
 * Tabla para k = 2..10 y α ∈ {0.05, 0.01}; cálculo numérico en otro caso.
 * Ver studentizedRangeQInfo para saber si el valor salió de la tabla o es aproximado.
 */
export function studentizedRangeQ(k: number, dfError: number, alpha: number): number {
  return studentizedRangeQInfo(k, dfError, alpha).q;
}
