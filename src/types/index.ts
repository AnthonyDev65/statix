// =====================================================
// Statix - Tipos globales
// =====================================================

/** Tema de la aplicación */
export type Theme = 'light' | 'dark';

/** Tipo de distribución para navegación e historial */
export type DistributionType = 'binomial' | 'hypergeometric' | 'normal' | 'estimation' | 'anova';

/** Sección de estimación */
export type EstimationSection = 'mean' | 'proportion';

// -----------------------------------------------------
// Distribución Binomial
// -----------------------------------------------------
export interface BinomialInputs {
  n: number; // número de ensayos
  p: number; // probabilidad de éxito (0-1)
  x: number; // número de éxitos
}

export interface BinomialResults {
  probabilityExact: number;     // P(X = x)
  probabilityLessEqual: number; // P(X ≤ x)
  probabilityGreaterEqual: number; // P(X ≥ x)
  mean: number;                 // E[X]
  variance: number;             // Var(X)
  stdDev: number;               // σ
  distribution: Array<{ x: number; probability: number }>;
}

// -----------------------------------------------------
// Distribución Hipergeométrica
// -----------------------------------------------------
export interface HypergeometricInputs {
  N: number; // tamaño de la población
  K: number; // número de éxitos en la población
  n: number; // tamaño de la muestra
  x: number; // número de éxitos observados
}

export interface HypergeometricResults {
  probabilityExact: number;
  probabilityLessEqual: number;
  probabilityGreaterEqual: number;
  mean: number;
  variance: number;
  stdDev: number;
  distribution: Array<{ x: number; probability: number }>;
}

// -----------------------------------------------------
// Distribución Normal
// -----------------------------------------------------
export type NormalMode = 'cumulative' | 'left-tail' | 'right-tail' | 'between';

export interface NormalInputs {
  mu: number;        // media
  sigma: number;     // desviación estándar
  x: number;         // valor
  x2?: number;       // segundo valor (modo between)
  mode: NormalMode;
}

export interface NormalResults {
  zScore: number;
  probability: number;        // probabilidad pedida
  pdf: number;                // f(x) densidad en x
  isBetween: boolean;
  bounds: { a?: number; b?: number };
  distribution: Array<{ x: number; y: number }>;
  shadedArea: Array<{ x: number; y: number }>;
}

// -----------------------------------------------------
// Estimación de Parámetros
// -----------------------------------------------------
export interface MeanEstimationInputs {
  n: number;
  xBar: number;       // media muestral
  s: number;          // desviación estándar
  confidence: number; // nivel de confianza (0-1)
}

export interface ProportionEstimationInputs {
  n: number;
  pHat: number;       // proporción observada
  confidence: number;
}

export interface EstimationResults {
  standardError: number;
  marginOfError: number;
  zCritical: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
}

// -----------------------------------------------------
// Historial
// -----------------------------------------------------
export interface HistoryEntry {
  id: string;
  type: DistributionType;
  title: string;
  summary: string;
  inputs: Record<string, number | string>;
  timestamp: number;
}

// -----------------------------------------------------
// Validación
// -----------------------------------------------------
export interface ValidationError {
  field: string;
  message: string;
}

// -----------------------------------------------------
// ANOVA
// -----------------------------------------------------
export type AnovaFactorMode = 'one-way' | 'two-way';

/** Una fila de la tabla ANOVA (una fuente de variación). */
export interface AnovaTableRow {
  source: string;      // 'Entre grupos', 'Factor A', 'Interacción', 'Error', 'Total'…
  ss: number;          // suma de cuadrados
  df: number;          // grados de libertad
  ms: number | null;   // cuadrado medio (null en 'Total')
  f: number | null;    // estadístico F (null en 'Error'/'Total')
  pValue: number | null;
  fCritical: number | null;
}

export interface GroupSummary {
  label: string;
  n: number;
  sum: number;
  mean: number;
}

export interface AnovaOneWayResult {
  rows: AnovaTableRow[];
  groups: GroupSummary[];
  grandMean: number;
  grandTotal: number;
  N: number;
  k: number;
  fStatistic: number;
  pValue: number;
  fCritical: number;
  rejectH0: boolean;
  alpha: number;
}

export interface TukeyComparison {
  a: string;
  b: string;
  meanDiff: number;      // |x̄_a − x̄_b|
  hsd: number;           // umbral HSD para el par
  significant: boolean;
}

export interface TukeyResult {
  q: number;
  comparisons: TukeyComparison[];
  alpha: number;
}

export interface AnovaTwoWayResult {
  rows: AnovaTableRow[];
  hasReplication: boolean;
  a: number;             // niveles factor A (filas)
  b: number;             // niveles factor B (columnas)
  r: number;             // réplicas por celda (1 si sin repetición)
  grandMean: number;
  N: number;
  alpha: number;
  rowLabels: string[];
  colLabels: string[];
}
