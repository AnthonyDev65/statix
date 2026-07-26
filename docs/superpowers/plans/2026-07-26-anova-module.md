# ANOVA Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an ANOVA module to Statix (one-way and two-way, with/without replication) driven by an Excel-like editable grid, showing the ANOVA table, F-test decision, Tukey HSD post-hoc, a collapsible step-by-step derivation, and full searchable theory docs.

**Architecture:** Follows the existing `EstimationPage` pattern — one page (`AnovaPage.tsx`) with a factor selector and tabbed sections, reusing shared components. A single editable grid feeds both one-way (columns = groups) and two-way (rows = factor A, cols = factor B) analyses. Pure numeric code (F-distribution, ANOVA sums of squares, Tukey) lives in `math.utils.ts` / `statistics.service.ts` and is unit-tested with Vitest. UI is verified via `tsc` typecheck + manual checks.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, react-hook-form + Zod, framer-motion, KaTeX, lucide-react. **New dev dependency:** Vitest (scoped to pure functions only).

---

## File Structure

**New files**
- `src/pages/AnovaPage.tsx` — module page.
- `src/components/DataGrid.tsx` — Excel-like editable grid (add/remove rows & cols, editable headers).
- `src/components/AnovaTable.tsx` — classic ANOVA results table.
- `src/components/AnovaSteps.tsx` — collapsible step-by-step derivation.
- `src/components/Collapsible.tsx` — generic collapsible container.
- `src/utils/anova.utils.ts` — grid parsing helpers (grid strings → numeric structures).
- `src/utils/math.utils.test.ts` — tests for F-distribution + studentized range.
- `src/services/statistics.service.test.ts` — tests for ANOVA + Tukey.
- `src/utils/anova.utils.test.ts` — tests for grid parsing.
- `vitest.config.ts` — Vitest config.

**Modified files**
- `src/utils/math.utils.ts` — add `incompleteBeta`, `betacf`, `fCdf`, `fQuantile`, `studentizedRangeQ`.
- `src/services/statistics.service.ts` — add `calculateAnovaOneWay`, `calculateAnovaTwoWay`, `tukeyHSD`.
- `src/types/index.ts` — add `'anova'` to `DistributionType`; ANOVA result interfaces.
- `src/formulas/formulas.ts` — `ANOVA_FORMULAS`.
- `src/content/theory.ts` — ANOVA theory module.
- `src/constants/index.ts` — `NAV_ITEMS` entry.
- `src/App.tsx` — `/anova` route.
- `src/components/Sidebar.tsx` — ANOVA icon.
- `src/pages/DocsPage.tsx` — ANOVA icon.
- `src/content/changelog.ts` — v1.2.0 entry.
- `package.json` — Vitest devDependency + `test` script.

---

## Task 1: Set up Vitest for pure-function testing

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/utils/math.utils.test.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2.1.0`
Expected: `vitest` added to `devDependencies`.

- [ ] **Step 2: Add the test script to `package.json`**

In `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Create a smoke test `src/utils/math.utils.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { gamma } from '@/utils/math.utils';

describe('vitest setup', () => {
  it('runs and resolves @ alias', () => {
    expect(gamma(5)).toBeCloseTo(24, 6); // Γ(5) = 4! = 24
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/utils/math.utils.test.ts
git commit -m "test: add vitest for pure-function testing"
```

---

## Task 2: Regularized incomplete beta function

**Files:**
- Modify: `src/utils/math.utils.ts`
- Test: `src/utils/math.utils.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/utils/math.utils.test.ts`:

```ts
import { incompleteBeta } from '@/utils/math.utils';

describe('incompleteBeta (regularized I_x(a,b))', () => {
  it('is 0 at x=0 and 1 at x=1', () => {
    expect(incompleteBeta(0, 2, 3)).toBe(0);
    expect(incompleteBeta(1, 2, 3)).toBe(1);
  });
  it('is symmetric: I_x(a,b) = 1 - I_(1-x)(b,a)', () => {
    expect(incompleteBeta(0.3, 2, 5)).toBeCloseTo(1 - incompleteBeta(0.7, 5, 2), 8);
  });
  it('matches known value I_0.5(2,2) = 0.5', () => {
    expect(incompleteBeta(0.5, 2, 2)).toBeCloseTo(0.5, 8);
  });
  it('matches I_0.5(0.5,0.5) = 0.5 (arcsine)', () => {
    expect(incompleteBeta(0.5, 0.5, 0.5)).toBeCloseTo(0.5, 8);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `incompleteBeta is not a function`.

- [ ] **Step 3: Implement `betacf` and `incompleteBeta`**

Append to `src/utils/math.utils.ts` (uses existing `logGamma`):

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all `incompleteBeta` tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/math.utils.ts src/utils/math.utils.test.ts
git commit -m "feat: add regularized incomplete beta to math utils"
```

---

## Task 3: F-distribution CDF

**Files:**
- Modify: `src/utils/math.utils.ts`
- Test: `src/utils/math.utils.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/utils/math.utils.test.ts`:

```ts
import { fCdf } from '@/utils/math.utils';

describe('fCdf (F-distribution CDF)', () => {
  it('is 0 for f<=0', () => {
    expect(fCdf(0, 3, 10)).toBe(0);
    expect(fCdf(-2, 3, 10)).toBe(0);
  });
  it('CDF at the 0.95 critical value ~ 0.95 (F_0.05(3,12)=3.490)', () => {
    expect(fCdf(3.490, 3, 12)).toBeCloseTo(0.95, 3);
  });
  it('CDF at F_0.05(5,20)=2.711 is ~0.95', () => {
    expect(fCdf(2.711, 5, 20)).toBeCloseTo(0.95, 3);
  });
  it('is increasing', () => {
    expect(fCdf(1, 4, 15)).toBeLessThan(fCdf(3, 4, 15));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `fCdf is not a function`.

- [ ] **Step 3: Implement `fCdf`**

Append to `src/utils/math.utils.ts`:

```ts
/** CDF de la distribución F con d1, d2 grados de libertad: P(F ≤ f). */
export function fCdf(f: number, d1: number, d2: number): number {
  if (f <= 0) return 0;
  const x = (d1 * f) / (d1 * f + d2);
  return incompleteBeta(x, d1 / 2, d2 / 2);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/math.utils.ts src/utils/math.utils.test.ts
git commit -m "feat: add F-distribution CDF"
```

---

## Task 4: F-distribution quantile (critical F)

**Files:**
- Modify: `src/utils/math.utils.ts`
- Test: `src/utils/math.utils.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/utils/math.utils.test.ts`:

```ts
import { fQuantile } from '@/utils/math.utils';

describe('fQuantile (inverse F CDF)', () => {
  it('F_0.05(3,12): quantile at 0.95 ~ 3.490', () => {
    expect(fQuantile(0.95, 3, 12)).toBeCloseTo(3.490, 2);
  });
  it('F_0.05(2,27) ~ 3.354', () => {
    expect(fQuantile(0.95, 2, 27)).toBeCloseTo(3.354, 2);
  });
  it('round-trips with fCdf', () => {
    const q = fQuantile(0.9, 4, 20);
    expect(fCdf(q, 4, 20)).toBeCloseTo(0.9, 4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `fQuantile is not a function`.

- [ ] **Step 3: Implement `fQuantile`**

Append to `src/utils/math.utils.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/math.utils.ts src/utils/math.utils.test.ts
git commit -m "feat: add F-distribution quantile"
```

---

## Task 5: Studentized range critical value (Tukey q)

**Files:**
- Modify: `src/utils/math.utils.ts`
- Test: `src/utils/math.utils.test.ts`

**Note:** The studentized range `q` has no simple closed form. We use a standard table
(α = 0.05 and 0.01) indexed by k (groups) and df (error), with linear interpolation on
df and clamping outside the table. Values are the classic Tukey tables.

- [ ] **Step 1: Add failing tests**

Append to `src/utils/math.utils.test.ts`:

```ts
import { studentizedRangeQ } from '@/utils/math.utils';

describe('studentizedRangeQ (Tukey q)', () => {
  it('q_0.05(k=3, df=12) ~ 3.77', () => {
    expect(studentizedRangeQ(3, 12, 0.05)).toBeCloseTo(3.77, 1);
  });
  it('q_0.05(k=4, df=20) ~ 3.96', () => {
    expect(studentizedRangeQ(4, 20, 0.05)).toBeCloseTo(3.96, 1);
  });
  it('q_0.01(k=3, df=12) ~ 5.05', () => {
    expect(studentizedRangeQ(3, 12, 0.01)).toBeCloseTo(5.05, 1);
  });
  it('interpolates between tabulated df', () => {
    const q = studentizedRangeQ(3, 13, 0.05); // between df=12 and df=14
    expect(q).toBeGreaterThan(studentizedRangeQ(3, 14, 0.05));
    expect(q).toBeLessThan(studentizedRangeQ(3, 12, 0.05));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `studentizedRangeQ is not a function`.

- [ ] **Step 3: Implement `studentizedRangeQ` with the table**

Append to `src/utils/math.utils.ts`. Columns are k = 2..10; rows are df with an
`Infinity` sentinel row for large df:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/math.utils.ts src/utils/math.utils.test.ts
git commit -m "feat: add studentized range q table for Tukey"
```

---

## Task 6: ANOVA types

**Files:**
- Modify: `src/types/index.ts:9` (the `DistributionType` union) and append interfaces.

- [ ] **Step 1: Extend `DistributionType`**

Change line 9 from:

```ts
export type DistributionType = 'binomial' | 'hypergeometric' | 'normal' | 'estimation';
```

to:

```ts
export type DistributionType = 'binomial' | 'hypergeometric' | 'normal' | 'estimation' | 'anova';
```

- [ ] **Step 2: Append ANOVA interfaces at the end of `src/types/index.ts`**

```ts
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b --noEmit` (or `npm run build` skipping vite: `npx tsc -b`)
Expected: No new type errors from this file. (Other files referencing `DistributionType` still compile — the union only widened.)

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add ANOVA result types"
```

---

## Task 7: One-way ANOVA calculation

**Files:**
- Modify: `src/services/statistics.service.ts`
- Test: `src/services/statistics.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/statistics.service.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateAnovaOneWay } from '@/services/statistics.service';

describe('calculateAnovaOneWay', () => {
  // Textbook example (3 groups): classic F ≈ 9.0
  const groups = [
    { label: 'A', values: [6, 8, 4, 5, 3, 4] },
    { label: 'B', values: [8, 12, 9, 11, 6, 8] },
    { label: 'C', values: [13, 9, 11, 8, 7, 12] },
  ];

  it('computes k, N and grand mean', () => {
    const r = calculateAnovaOneWay(groups, 0.05);
    expect(r.k).toBe(3);
    expect(r.N).toBe(18);
    expect(r.grandMean).toBeCloseTo(8.0, 6);
  });

  it('SS_between + SS_within = SS_total', () => {
    const r = calculateAnovaOneWay(groups, 0.05);
    const between = r.rows.find((x) => x.source.includes('Entre'))!;
    const within = r.rows.find((x) => x.source.includes('Dentro'))!;
    const total = r.rows.find((x) => x.source.includes('Total'))!;
    expect(between.ss + within.ss).toBeCloseTo(total.ss, 6);
    expect(total.df).toBe(17);
    expect(between.df).toBe(2);
    expect(within.df).toBe(15);
  });

  it('produces an F statistic and p-value', () => {
    const r = calculateAnovaOneWay(groups, 0.05);
    expect(r.fStatistic).toBeGreaterThan(0);
    expect(r.pValue).toBeGreaterThanOrEqual(0);
    expect(r.pValue).toBeLessThanOrEqual(1);
    expect(r.rejectH0).toBe(r.fStatistic > r.fCritical);
  });

  it('detects equal-means case (F≈0, no rejection)', () => {
    const equal = [
      { label: 'A', values: [1, 2, 3] },
      { label: 'B', values: [1, 2, 3] },
      { label: 'C', values: [1, 2, 3] },
    ];
    const r = calculateAnovaOneWay(equal, 0.05);
    expect(r.fStatistic).toBeCloseTo(0, 6);
    expect(r.rejectH0).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `calculateAnovaOneWay is not a function`.

- [ ] **Step 3: Implement `calculateAnovaOneWay`**

Add imports at the top of `src/services/statistics.service.ts` (extend the existing
import lines):

```ts
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
```

Append the calculation at the end of the file:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/statistics.service.ts src/services/statistics.service.test.ts
git commit -m "feat: add one-way ANOVA calculation"
```

---

## Task 8: Two-way ANOVA calculation (with & without replication)

**Files:**
- Modify: `src/services/statistics.service.ts`
- Test: `src/services/statistics.service.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `src/services/statistics.service.test.ts`:

```ts
import { calculateAnovaTwoWay } from '@/services/statistics.service';

describe('calculateAnovaTwoWay (no replication / blocks)', () => {
  // 3 rows (A) × 3 cols (B), one value per cell
  const matrix = [
    [[1], [2], [3]],
    [[2], [4], [6]],
    [[3], [6], [9]],
  ];
  it('detects no replication (r=1)', () => {
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']);
    expect(r.hasReplication).toBe(false);
    expect(r.r).toBe(1);
  });
  it('has rows for Factor A, Factor B, Error and Total (no interaction)', () => {
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']);
    const sources = r.rows.map((x) => x.source);
    expect(sources.some((s) => s.includes('Factor A'))).toBe(true);
    expect(sources.some((s) => s.includes('Factor B'))).toBe(true);
    expect(sources.some((s) => s.includes('Error'))).toBe(true);
    expect(sources.some((s) => s.includes('Total'))).toBe(true);
    expect(sources.some((s) => s.includes('Interacción'))).toBe(false);
  });
  it('SS components sum to SS total', () => {
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']);
    const get = (key: string) => r.rows.find((x) => x.source.includes(key))!.ss;
    expect(get('Factor A') + get('Factor B') + get('Error')).toBeCloseTo(get('Total'), 6);
  });
});

describe('calculateAnovaTwoWay (with replication / interaction)', () => {
  // 2 rows × 2 cols × 2 replicates
  const matrix = [
    [[10, 12], [20, 22]],
    [[14, 16], [30, 28]],
  ];
  it('detects replication (r=2) and adds interaction row', () => {
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1', 'a2'], ['b1', 'b2']);
    expect(r.hasReplication).toBe(true);
    expect(r.r).toBe(2);
    expect(r.rows.some((x) => x.source.includes('Interacción'))).toBe(true);
  });
  it('SS_A + SS_B + SS_AB + SS_error = SS_total', () => {
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1', 'a2'], ['b1', 'b2']);
    const get = (key: string) => r.rows.find((x) => x.source.includes(key))!.ss;
    const total = r.rows.find((x) => x.source === 'Total')!.ss;
    expect(get('Factor A') + get('Factor B') + get('Interacción') + get('Error')).toBeCloseTo(total, 6);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `calculateAnovaTwoWay is not a function`.

- [ ] **Step 3: Implement `calculateAnovaTwoWay`**

Append to `src/services/statistics.service.ts`. `matrix[i][j]` is an array of replicate
values for row i (factor A level) and column j (factor B level):

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/statistics.service.ts src/services/statistics.service.test.ts
git commit -m "feat: add two-way ANOVA (with and without replication)"
```

---

## Task 9: Tukey HSD post-hoc

**Files:**
- Modify: `src/services/statistics.service.ts`
- Test: `src/services/statistics.service.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `src/services/statistics.service.test.ts`:

```ts
import { tukeyHSD } from '@/services/statistics.service';

describe('tukeyHSD', () => {
  const groups = [
    { label: 'A', values: [6, 8, 4, 5, 3, 4] },
    { label: 'B', values: [8, 12, 9, 11, 6, 8] },
    { label: 'C', values: [13, 9, 11, 8, 7, 12] },
  ];
  it('produces one comparison per pair (k choose 2)', () => {
    const res = tukeyHSD(groups, 5.0, 15, 0.05);
    expect(res.comparisons).toHaveLength(3); // 3 groups -> 3 pairs
  });
  it('flags significant pairs when mean diff exceeds HSD', () => {
    const res = tukeyHSD(groups, 5.0, 15, 0.05);
    const ac = res.comparisons.find((c) => c.a === 'A' && c.b === 'C')!;
    expect(ac.meanDiff).toBeCloseTo(4.0, 6);
    expect(typeof ac.significant).toBe('boolean');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `tukeyHSD is not a function`.

- [ ] **Step 3: Implement `tukeyHSD`**

Append to `src/services/statistics.service.ts`:

```ts
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
  const q = studentizedRangeQ(k, dfError, alpha);
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
  return { q, comparisons, alpha };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/statistics.service.ts src/services/statistics.service.test.ts
git commit -m "feat: add Tukey HSD post-hoc"
```

---

## Task 10: Grid parsing helpers

**Files:**
- Create: `src/utils/anova.utils.ts`
- Test: `src/utils/anova.utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/anova.utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  parseCell, parseGridOneWay, parseGridTwoWay, detectReplication,
} from '@/utils/anova.utils';

describe('parseCell', () => {
  it('parses comma/space separated numbers, ignoring blanks', () => {
    expect(parseCell('1, 2 3')).toEqual([1, 2, 3]);
    expect(parseCell('  ')).toEqual([]);
    expect(parseCell('4')).toEqual([4]);
  });
  it('ignores non-numeric tokens', () => {
    expect(parseCell('1, x, 3')).toEqual([1, 3]);
  });
});

describe('parseGridOneWay (columns = groups)', () => {
  it('collects each column into a group, flattening cell values', () => {
    // grid[row][col]
    const grid = [
      ['1', '10'],
      ['2', '20'],
      ['3', ''],
    ];
    const groups = parseGridOneWay(grid, ['G1', 'G2']);
    expect(groups).toEqual([
      { label: 'G1', values: [1, 2, 3] },
      { label: 'G2', values: [10, 20] },
    ]);
  });
});

describe('parseGridTwoWay', () => {
  it('parses each cell into a replicate array', () => {
    const grid = [
      ['1,2', '3,4'],
      ['5,6', '7,8'],
    ];
    const m = parseGridTwoWay(grid);
    expect(m).toEqual([
      [[1, 2], [3, 4]],
      [[5, 6], [7, 8]],
    ]);
  });
});

describe('detectReplication', () => {
  it('true when every cell has >1 value', () => {
    expect(detectReplication([[[1, 2]], [[3, 4]]])).toEqual({ replication: true, r: 2 });
  });
  it('false when cells have a single value', () => {
    expect(detectReplication([[[1]], [[3]]])).toEqual({ replication: false, r: 1 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/anova.utils.ts`**

```ts
// =====================================================
// Statix — Utilidades de parseo de la rejilla ANOVA
// =====================================================
import type { LabeledGroup } from '@/services/statistics.service';

/** Convierte el texto de una celda en una lista de números (coma o espacio). */
export function parseCell(text: string): number[] {
  if (!text) return [];
  return text
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n));
}

/** Un factor: cada columna es un grupo; se aplanan los valores de sus celdas. */
export function parseGridOneWay(grid: string[][], colLabels: string[]): LabeledGroup[] {
  const cols = grid[0]?.length ?? 0;
  const groups: LabeledGroup[] = [];
  for (let c = 0; c < cols; c++) {
    const values: number[] = [];
    for (let rIdx = 0; rIdx < grid.length; rIdx++) {
      values.push(...parseCell(grid[rIdx][c] ?? ''));
    }
    groups.push({ label: colLabels[c] ?? `Grupo ${c + 1}`, values });
  }
  return groups;
}

/** Dos factores: matrix[fila][col] = lista de réplicas de esa celda. */
export function parseGridTwoWay(grid: string[][]): number[][][] {
  return grid.map((row) => row.map((cell) => parseCell(cell ?? '')));
}

/** Detecta si hay repetición (r>1) mirando el nº de valores por celda. */
export function detectReplication(matrix: number[][][]): { replication: boolean; r: number } {
  let maxLen = 0;
  let minLen = Infinity;
  matrix.forEach((row) => row.forEach((cell) => {
    maxLen = Math.max(maxLen, cell.length);
    minLen = Math.min(minLen, cell.length);
  }));
  const r = maxLen;
  return { replication: r > 1, r };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/anova.utils.ts src/utils/anova.utils.test.ts
git commit -m "feat: add ANOVA grid parsing helpers"
```

---

## Task 11: ANOVA formula definitions

**Files:**
- Modify: `src/formulas/formulas.ts`

- [ ] **Step 1: Append `ANOVA_FORMULAS` at the end of `src/formulas/formulas.ts`**

```ts
export const ANOVA_FORMULAS: FormulaDef[] = [
  {
    id: 'ss-between',
    label: 'Suma de Cuadrados Entre Grupos',
    latex: 'SC_{entre} = \\sum_{j=1}^{k} n_j\\,(\\bar{x}_j - \\bar{x})^{2}',
    description: 'Variabilidad explicada por las diferencias entre las medias de los grupos.',
  },
  {
    id: 'ss-within',
    label: 'Suma de Cuadrados Dentro',
    latex: 'SC_{dentro} = \\sum_{j=1}^{k} \\sum_{i=1}^{n_j} (x_{ij} - \\bar{x}_j)^{2}',
    description: 'Variabilidad no explicada (dentro de cada grupo), la componente de error.',
  },
  {
    id: 'ms',
    label: 'Cuadrados Medios',
    latex: 'CM = \\dfrac{SC}{gl} \\qquad CM_{entre}=\\dfrac{SC_{entre}}{k-1}, \\;\\; CM_{dentro}=\\dfrac{SC_{dentro}}{N-k}',
    description: 'Cada suma de cuadrados dividida entre sus grados de libertad.',
  },
  {
    id: 'f',
    label: 'Estadístico F',
    latex: 'F = \\dfrac{CM_{entre}}{CM_{dentro}}',
    description: 'Razón de varianzas. Grande cuando las medias difieren más que el ruido interno.',
  },
  {
    id: 'ss-total',
    label: 'Identidad de la Suma de Cuadrados',
    latex: 'SC_{total} = SC_{entre} + SC_{dentro}',
    description: 'La variabilidad total se descompone en explicada más error.',
  },
  {
    id: 'tukey',
    label: 'Tukey HSD',
    latex: 'HSD = q_{\\alpha,\\,k,\\,gl_{error}} \\cdot \\sqrt{\\dfrac{CM_{error}}{2}\\left(\\dfrac{1}{n_i}+\\dfrac{1}{n_j}\\right)}',
    description: 'Umbral de diferencia significativa entre pares de medias tras rechazar H₀.',
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/formulas/formulas.ts
git commit -m "feat: add ANOVA formula definitions"
```

---

## Task 12: ANOVA theory content

**Files:**
- Modify: `src/content/theory.ts`

- [ ] **Step 1: Add the ANOVA module and register it**

First read the bottom of `src/content/theory.ts` to find the `THEORY_MODULES` export
array and the `getTheoryModule` helper. Add a new `ANOVA` module constant following the
exact shape of the existing modules (`TheoryModule` with `articles: TheoryArticle[]`),
then add `ANOVA` to the `THEORY_MODULES` array.

Insert this constant just before the `THEORY_MODULES` export:

```ts
// =====================================================
// ANOVA
// =====================================================
const ANOVA: TheoryModule = {
  id: 'anova',
  label: 'ANOVA (Análisis de la Varianza)',
  path: '/anova',
  tagline: 'Compara las medias de tres o más grupos mediante la razón de sus varianzas.',
  articles: [
    {
      id: 'anova-que-es',
      moduleId: 'anova',
      title: '¿Qué es el ANOVA?',
      summary: 'Prueba si tres o más grupos tienen medias distintas comparando varianzas.',
      keywords: ['anova', 'análisis de la varianza', 'qué es', 'medias', 'grupos', 'factor', 'f'],
      blocks: [
        { kind: 'paragraph', text: 'El **ANOVA** (*Analysis of Variance*) es una prueba que compara las **medias de tres o más grupos** a la vez. En lugar de hacer muchas pruebas $t$ por pares (que inflan el error), el ANOVA usa una sola prueba basada en la razón de dos estimaciones de la varianza.' },
        { kind: 'paragraph', text: 'La idea central: si los grupos realmente tienen la misma media, la variación **entre** los grupos debería ser parecida a la variación **dentro** de cada grupo. Si la variación entre grupos es mucho mayor, es señal de que las medias difieren.' },
        { kind: 'callout', tone: 'note', title: 'Un factor vs. dos factores', text: 'El **ANOVA de un factor** estudia el efecto de una sola variable de agrupación (p. ej. el método de enseñanza). El **de dos factores** estudia dos variables a la vez (p. ej. método y turno) y puede detectar su **interacción**.' },
      ],
    },
    {
      id: 'anova-supuestos',
      moduleId: 'anova',
      title: 'Supuestos del ANOVA',
      summary: 'Normalidad, igualdad de varianzas (homocedasticidad) e independencia.',
      keywords: ['supuestos', 'normalidad', 'homocedasticidad', 'varianzas iguales', 'independencia', 'anova'],
      blocks: [
        { kind: 'list', ordered: false, items: [
          '**Normalidad:** dentro de cada grupo, los datos siguen (aprox.) una distribución normal.',
          '**Homocedasticidad:** todos los grupos tienen la misma varianza poblacional $\\sigma^2$.',
          '**Independencia:** las observaciones son independientes entre sí y entre grupos.',
        ] },
        { kind: 'callout', tone: 'warning', title: 'Ojo', text: 'Si las varianzas son muy distintas o las muestras muy pequeñas y sesgadas, el valor-p del ANOVA puede no ser fiable. Conviene revisar los supuestos antes de concluir.' },
      ],
    },
    {
      id: 'anova-hipotesis',
      moduleId: 'anova',
      title: 'Hipótesis y el estadístico F',
      summary: 'H₀: todas las medias son iguales. F es la razón de cuadrados medios.',
      keywords: ['hipótesis', 'h0', 'nula', 'estadístico f', 'razón de varianzas', 'valor-p', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'La hipótesis nula afirma que **todas las medias son iguales**; la alternativa, que **al menos una** difiere:' },
        { kind: 'formula', latex: 'H_0:\\; \\mu_1 = \\mu_2 = \\dots = \\mu_k \\qquad H_1:\\; \\text{alguna } \\mu_j \\text{ difiere}' },
        { kind: 'paragraph', text: 'El estadístico de prueba es el cociente entre el cuadrado medio entre grupos y el cuadrado medio del error:' },
        { kind: 'formula', latex: 'F = \\dfrac{CM_{entre}}{CM_{dentro}}', caption: 'Bajo $H_0$, $F$ sigue una distribución $F$ con $(k-1,\\, N-k)$ grados de libertad.' },
        { kind: 'callout', tone: 'tip', text: 'Se rechaza $H_0$ si $F > F_{crítico}$ (o equivalentemente si el **valor-p** $< \\alpha$). Statix calcula el valor-p exacto con la CDF de la distribución $F$.' },
      ],
    },
    {
      id: 'anova-tabla',
      moduleId: 'anova',
      title: 'La tabla ANOVA',
      summary: 'Fuente, suma de cuadrados, grados de libertad, cuadrado medio, F y valor-p.',
      keywords: ['tabla anova', 'suma de cuadrados', 'grados de libertad', 'cuadrado medio', 'fuente', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'Los resultados se resumen en la **tabla ANOVA**. Cada fila es una *fuente de variación* con su suma de cuadrados ($SC$), grados de libertad ($gl$), cuadrado medio ($CM = SC/gl$) y, si procede, el estadístico $F$.' },
        { kind: 'params', items: [
          { symbol: 'SC', name: 'Suma de cuadrados', description: 'Variabilidad atribuida a cada fuente.', constraint: '$\\ge 0$' },
          { symbol: 'gl', name: 'Grados de libertad', description: 'Entre grupos $k-1$; error $N-k$; total $N-1$.' },
          { symbol: 'CM', name: 'Cuadrado medio', description: 'Varianza estimada: $CM = SC / gl$.' },
          { symbol: 'F', name: 'Estadístico F', description: 'Razón $CM_{entre}/CM_{dentro}$.' },
        ] },
      ],
    },
    {
      id: 'anova-un-factor',
      moduleId: 'anova',
      title: 'ANOVA de un factor',
      summary: 'Un solo criterio de agrupación; columnas = grupos.',
      keywords: ['un factor', 'one-way', 'unifactorial', 'entre grupos', 'dentro de grupos', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'En el **ANOVA de un factor** se compara un único factor con $k$ niveles (grupos). En Statix, **cada columna de la rejilla es un grupo** y las filas son sus observaciones (los grupos pueden tener distinto tamaño).' },
        { kind: 'formula', latex: 'SC_{entre} = \\sum_j n_j(\\bar{x}_j-\\bar{x})^2 \\qquad SC_{dentro} = \\sum_j\\sum_i (x_{ij}-\\bar{x}_j)^2' },
        { kind: 'formula', latex: 'F = \\dfrac{SC_{entre}/(k-1)}{SC_{dentro}/(N-k)}' },
      ],
    },
    {
      id: 'anova-dos-factores',
      moduleId: 'anova',
      title: 'ANOVA de dos factores',
      summary: 'Dos factores a la vez; con repetición aparece la interacción A×B.',
      keywords: ['dos factores', 'two-way', 'bifactorial', 'interacción', 'bloques', 'repetición', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'El **ANOVA de dos factores** analiza dos variables simultáneamente. En la rejilla, las **filas son los niveles del factor A** y las **columnas los del factor B**.' },
        { kind: 'paragraph', text: 'Si cada celda tiene **una** observación, es un diseño **sin repetición** (en bloques): se estiman los efectos de A y B pero no su interacción. Si cada celda tiene **varias** réplicas, el diseño es **con repetición** y aparece la **interacción A×B**, que mide si el efecto de un factor depende del nivel del otro.' },
        { kind: 'formula', latex: 'SC_{total} = SC_{A} + SC_{B} + SC_{AB} + SC_{error}', caption: 'Con repetición. Sin repetición desaparece $SC_{AB}$ y su variación pasa al error.' },
        { kind: 'callout', tone: 'note', title: 'Auto-detección', text: 'Statix detecta el diseño automáticamente: si escribes más de un valor por celda (separados por coma), asume repetición y calcula la interacción.' },
      ],
    },
    {
      id: 'anova-tukey',
      moduleId: 'anova',
      title: 'Comparaciones post-hoc: Tukey HSD',
      summary: 'Tras rechazar H₀, identifica qué pares de medias difieren.',
      keywords: ['post-hoc', 'tukey', 'hsd', 'comparaciones múltiples', 'pares', 'rango studentizado', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'El ANOVA solo dice *si* hay diferencias, no *entre quiénes*. Cuando se rechaza $H_0$, la prueba **Tukey HSD** compara todos los pares de medias controlando el error global.' },
        { kind: 'formula', latex: 'HSD = q_{\\alpha,\\,k,\\,gl_{error}}\\;\\sqrt{\\dfrac{CM_{error}}{2}\\left(\\tfrac{1}{n_i}+\\tfrac{1}{n_j}\\right)}' },
        { kind: 'paragraph', text: 'Dos grupos difieren significativamente si $|\\bar{x}_i-\\bar{x}_j| > HSD$. El valor $q$ proviene de la distribución del **rango studentizado**.' },
        { kind: 'callout', tone: 'warning', title: 'Nota técnica', text: 'El valor crítico $q$ no tiene forma cerrada simple; Statix lo obtiene de una tabla estándar (α = 0.05 y 0.01) interpolando en los grados de libertad, como es habitual en las calculadoras.' },
      ],
    },
    {
      id: 'anova-ejemplo',
      moduleId: 'anova',
      title: 'Ejemplo resuelto (un factor)',
      summary: 'Procedimiento completo con tres grupos, paso a paso.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'cómo calcular', 'anova'],
      blocks: [
        { kind: 'example',
          statement: 'Tres métodos de estudio dan las notas: A = {6, 8, 4, 5, 3, 4}, B = {8, 12, 9, 11, 6, 8}, C = {13, 9, 11, 8, 7, 12}. ¿Difieren las medias con α = 0.05?',
          steps: [
            'Medias: $\\bar{x}_A=5$, $\\bar{x}_B=9$, $\\bar{x}_C=10$; media global $\\bar{x}=8$ ($N=18$, $k=3$).',
            'Entre grupos: $SC_{entre}=6[(5-8)^2+(9-8)^2+(10-8)^2]=6\\cdot14=84$, con $gl=k-1=2$.',
            'Dentro: $SC_{dentro}=$ suma de $(x_{ij}-\\bar{x}_j)^2 = 72$, con $gl=N-k=15$.',
            'Cuadrados medios: $CM_{entre}=84/2=42$; $CM_{dentro}=72/15=4.8$.',
            'Estadístico: $F=42/4.8=8.75$. Crítico $F_{0.05}(2,15)\\approx 3.68$.',
          ],
          result: 'F = 8.75 > 3.68 → se rechaza H₀: al menos un método tiene media distinta.',
        },
      ],
    },
  ],
};
```

Then find the `THEORY_MODULES` array export and add `ANOVA` to it, e.g.:

```ts
export const THEORY_MODULES: TheoryModule[] = [BINOMIAL, HYPERGEOMETRIC, NORMAL, ESTIMATION, ANOVA];
```

(Use the actual existing constant names in the array; just append `, ANOVA`.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors. (The `moduleId: 'anova'` now type-checks because Task 6 widened `DistributionType`.)

- [ ] **Step 3: Commit**

```bash
git add src/content/theory.ts
git commit -m "docs: add ANOVA theory content"
```

---

## Task 13: Collapsible component

**Files:**
- Create: `src/components/Collapsible.tsx`

- [ ] **Step 1: Implement `src/components/Collapsible.tsx`**

Follows the app's Tailwind `v0-*` palette and framer-motion usage:

```tsx
// =====================================================
// Statix — Collapsible (contenedor plegable genérico)
// =====================================================
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, type LucideIcon } from 'lucide-react';

interface CollapsibleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({
  title, subtitle, icon: Icon, defaultOpen = false, children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-v0-75 dark:hover:bg-v0-800/30"
      >
        {Icon && (
          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-950">
            <Icon size={13} strokeWidth={1.75} className="text-v0-600 dark:text-v0-300" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
            {title}
          </span>
          {subtitle && (
            <span className="block text-[12px] text-v0-500/70 dark:text-v0-400">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.9}
          className={`flex-shrink-0 text-v0-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-v0-150/30 px-5 py-5 dark:border-v0-800/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Collapsible.tsx
git commit -m "feat: add Collapsible component"
```

---

## Task 14: DataGrid component (Excel-like editor)

**Files:**
- Create: `src/components/DataGrid.tsx`

- [ ] **Step 1: Implement `src/components/DataGrid.tsx`**

Controlled component. Parent owns the grid (`string[][]`) plus header arrays; DataGrid
renders editable cells/headers and add/remove buttons.

```tsx
// =====================================================
// Statix — DataGrid (editor de datos tipo hoja de cálculo)
// =====================================================
import { Plus, Trash2 } from 'lucide-react';

export interface DataGridProps {
  grid: string[][];                 // grid[fila][col]
  rowHeaders: string[];
  colHeaders: string[];
  showRowHeaders?: boolean;         // ocultar en modo un factor si se desea
  rowHeaderLabel?: string;          // encabezado de la esquina
  onChange: (grid: string[][]) => void;
  onRowHeadersChange: (h: string[]) => void;
  onColHeadersChange: (h: string[]) => void;
}

export function DataGrid({
  grid, rowHeaders, colHeaders, showRowHeaders = true, rowHeaderLabel = '',
  onChange, onRowHeadersChange, onColHeadersChange,
}: DataGridProps) {
  const rows = grid.length;
  const cols = colHeaders.length;

  const setCell = (r: number, c: number, value: string) => {
    const next = grid.map((row) => row.slice());
    next[r][c] = value;
    onChange(next);
  };

  const addColumn = () => {
    const next = grid.map((row) => [...row, '']);
    onChange(next);
    onColHeadersChange([...colHeaders, `Grupo ${cols + 1}`]);
  };
  const removeColumn = () => {
    if (cols <= 1) return;
    const next = grid.map((row) => row.slice(0, -1));
    onChange(next);
    onColHeadersChange(colHeaders.slice(0, -1));
  };
  const addRow = () => {
    onChange([...grid, Array(cols).fill('')]);
    onRowHeadersChange([...rowHeaders, `Nivel ${rows + 1}`]);
  };
  const removeRow = () => {
    if (rows <= 1) return;
    onChange(grid.slice(0, -1));
    onRowHeadersChange(rowHeaders.slice(0, -1));
  };

  const inputCls =
    'w-full rounded-md border border-v0-200/40 bg-v0-50 px-2 py-1.5 text-center font-mono text-[12.5px] text-v0-900 outline-none transition focus:border-v0-950 dark:border-v0-800/40 dark:bg-v0-950 dark:text-v0-100 dark:focus:border-v0-50';
  const headCls =
    'w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-[12px] font-semibold text-v0-700 outline-none focus:border-v0-300 dark:text-v0-200 dark:focus:border-v0-700';

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-v0-200/30 bg-v0-50 p-3 dark:border-v0-800/30 dark:bg-v0-900">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              {showRowHeaders && (
                <th className="w-24 px-1 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70">
                  {rowHeaderLabel}
                </th>
              )}
              {colHeaders.map((h, c) => (
                <th key={c} className="min-w-[92px] px-0.5">
                  <input
                    aria-label={`Encabezado columna ${c + 1}`}
                    value={h}
                    onChange={(e) => {
                      const next = colHeaders.slice();
                      next[c] = e.target.value;
                      onColHeadersChange(next);
                    }}
                    className={headCls}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {showRowHeaders && (
                  <td className="px-0.5">
                    <input
                      aria-label={`Encabezado fila ${r + 1}`}
                      value={rowHeaders[r] ?? ''}
                      onChange={(e) => {
                        const next = rowHeaders.slice();
                        next[r] = e.target.value;
                        onRowHeadersChange(next);
                      }}
                      className={headCls + ' text-left'}
                    />
                  </td>
                )}
                {row.map((cell, c) => (
                  <td key={c} className="px-0.5">
                    <input
                      inputMode="decimal"
                      aria-label={`Celda fila ${r + 1} columna ${c + 1}`}
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className={inputCls}
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <GridButton onClick={addColumn} icon={Plus} label="Columna" />
        <GridButton onClick={removeColumn} icon={Trash2} label="Columna" tone="danger" />
        <span className="mx-1 h-4 w-px bg-v0-200/50 dark:bg-v0-800/50" />
        <GridButton onClick={addRow} icon={Plus} label="Fila" />
        <GridButton onClick={removeRow} icon={Trash2} label="Fila" tone="danger" />
      </div>
    </div>
  );
}

function GridButton({
  onClick, icon: Icon, label, tone = 'default',
}: {
  onClick: () => void;
  icon: typeof Plus;
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-all active:scale-[0.97] ${
        tone === 'danger'
          ? 'border-v0-200/40 text-v0-500 hover:border-red-400/50 hover:text-red-500 dark:border-v0-800/40 dark:text-v0-400'
          : 'border-v0-200/40 text-v0-700 hover:border-v0-950 hover:text-v0-950 dark:border-v0-800/40 dark:text-v0-200 dark:hover:border-v0-50 dark:hover:text-v0-50'
      }`}
    >
      <Icon size={13} strokeWidth={1.9} />
      {label}
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DataGrid.tsx
git commit -m "feat: add Excel-like DataGrid editor"
```

---

## Task 15: AnovaTable component

**Files:**
- Create: `src/components/AnovaTable.tsx`

- [ ] **Step 1: Implement `src/components/AnovaTable.tsx`**

```tsx
// =====================================================
// Statix — AnovaTable (tabla ANOVA clásica)
// =====================================================
import type { AnovaTableRow } from '@/types';
import { formatNumber } from '@/utils/formatters.utils';

export function AnovaTable({ rows }: { rows: AnovaTableRow[] }) {
  const cell = 'px-3 py-2.5 text-right font-mono text-[12.5px] tabular-nums';
  const head = 'px-3 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70';
  return (
    <div className="overflow-x-auto rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
      <table className="w-full">
        <thead className="border-b border-v0-150/30 dark:border-v0-800/30">
          <tr>
            <th className={head + ' text-left'}>Fuente</th>
            <th className={head}>SC</th>
            <th className={head}>gl</th>
            <th className={head}>CM</th>
            <th className={head}>F</th>
            <th className={head}>valor-p</th>
            <th className={head}>F crítico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.source} className="border-b border-v0-150/20 last:border-0 dark:border-v0-800/20">
              <td className="px-3 py-2.5 text-left text-[12.5px] font-medium text-v0-800 dark:text-v0-100">
                {r.source}
              </td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{formatNumber(r.ss, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.df}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.ms === null ? '—' : formatNumber(r.ms, 4)}</td>
              <td className={cell + ' font-semibold text-v0-950 dark:text-v0-50'}>{r.f === null ? '—' : formatNumber(r.f, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.pValue === null ? '—' : formatNumber(r.pValue, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.fCritical === null ? '—' : formatNumber(r.fCritical, 4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors. (Confirm `formatNumber` exists in `src/utils/formatters.utils.ts` — it is used across pages.)

- [ ] **Step 3: Commit**

```bash
git add src/components/AnovaTable.tsx
git commit -m "feat: add AnovaTable component"
```

---

## Task 16: AnovaSteps component (step-by-step derivation)

**Files:**
- Create: `src/components/AnovaSteps.tsx`

- [ ] **Step 1: Implement `src/components/AnovaSteps.tsx`**

Renders the one-way derivation with real numbers substituted, inside the `Collapsible`.
Uses `MathText` (inline `$...$`) which already exists.

```tsx
// =====================================================
// Statix — AnovaSteps (cálculo paso a paso, un factor)
// =====================================================
import { ListOrdered } from 'lucide-react';
import { Collapsible } from '@/components/Collapsible';
import { MathText } from '@/components/MathText';
import type { AnovaOneWayResult } from '@/types';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';

export function AnovaSteps({ result }: { result: AnovaOneWayResult }) {
  const between = result.rows.find((r) => r.source.includes('Entre'))!;
  const within = result.rows.find((r) => r.source.includes('Dentro'))!;
  const total = result.rows.find((r) => r.source.includes('Total'))!;
  const f = (n: number, d = 4) => formatNumber(n, d);

  return (
    <Collapsible
      title="Cálculo paso a paso"
      subtitle="Cómo se obtiene la tabla a mano, con tus datos"
      icon={ListOrdered}
      defaultOpen={false}
    >
      <ol className="space-y-4">
        <Step n={1} title="Medias por grupo y media global">
          <ul className="space-y-1">
            {result.groups.map((g) => (
              <li key={g.label}>
                <MathText>{`$\\bar{x}_{${g.label}} = ${f(g.mean, 3)}$ (n = ${g.n})`}</MathText>
              </li>
            ))}
            <li>
              <MathText>{`Media global: $\\bar{x} = ${f(result.grandMean, 3)}$, con $N = ${result.N}$ y $k = ${result.k}$ grupos.`}</MathText>
            </li>
          </ul>
        </Step>

        <Step n={2} title="Suma de cuadrados entre grupos">
          <MathText>{`$SC_{entre} = \\sum n_j(\\bar{x}_j-\\bar{x})^2 = ${f(between.ss, 4)}$, con $gl = k-1 = ${between.df}$.`}</MathText>
        </Step>

        <Step n={3} title="Suma de cuadrados dentro (error)">
          <MathText>{`$SC_{dentro} = \\sum\\sum (x_{ij}-\\bar{x}_j)^2 = ${f(within.ss, 4)}$, con $gl = N-k = ${within.df}$.`}</MathText>
          <p className="mt-1"><MathText>{`Total: $SC_{total} = ${f(total.ss, 4)}$ (comprobación: $${f(between.ss, 2)} + ${f(within.ss, 2)}$).`}</MathText></p>
        </Step>

        <Step n={4} title="Cuadrados medios y estadístico F">
          <MathText>{`$CM_{entre} = ${f(between.ss, 4)}/${between.df} = ${f(between.ms ?? 0, 4)}$; $CM_{dentro} = ${f(within.ss, 4)}/${within.df} = ${f(within.ms ?? 0, 4)}$.`}</MathText>
          <p className="mt-1"><MathText>{`$F = CM_{entre}/CM_{dentro} = ${f(result.fStatistic, 4)}$.`}</MathText></p>
        </Step>

        <Step n={5} title="Decisión">
          <MathText>{`$F_{crítico} = F_{${formatProbability(result.alpha, 2)}}(${between.df}, ${within.df}) = ${f(result.fCritical, 4)}$; valor-p $= ${f(result.pValue, 4)}$.`}</MathText>
          <p className="mt-2 font-medium text-v0-900 dark:text-v0-50">
            {result.rejectH0
              ? '✓ F > F crítico → se rechaza H₀: al menos una media difiere.'
              : '✕ F ≤ F crítico → no se rechaza H₀: no hay evidencia de diferencias.'}
          </p>
        </Step>
      </ol>
    </Collapsible>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-v0-100 font-mono text-[11px] font-semibold text-v0-700 dark:bg-v0-800 dark:text-v0-200">
        {n}
      </span>
      <div className="flex-1 space-y-1 text-[13px] leading-relaxed text-v0-600 dark:text-v0-300">
        <p className="font-semibold text-v0-800 dark:text-v0-100">{title}</p>
        {children}
      </div>
    </li>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AnovaSteps.tsx
git commit -m "feat: add ANOVA step-by-step derivation component"
```

---

## Task 17: AnovaPage (wire it all together)

**Files:**
- Create: `src/pages/AnovaPage.tsx`

- [ ] **Step 1: Implement `src/pages/AnovaPage.tsx`**

Follows `EstimationPage` structure: `PageHeader`, factor tabs, `DataGrid`, live compute,
`AnovaTable`, decision + Tukey cards, `AnovaSteps` (one-way), `FormulaCard` framework,
`TheoryDocs`, `HistoryPanel`, `ExportButton`.

```tsx
// =====================================================
// Statix — AnovaPage
// =====================================================
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableProperties, CheckCircle2, XCircle, Sigma } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { StatCard } from '@/components/StatCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { TheoryDocs } from '@/components/TheoryDocs';
import { DataGrid } from '@/components/DataGrid';
import { AnovaTable } from '@/components/AnovaTable';
import { AnovaSteps } from '@/components/AnovaSteps';
import { ANOVA_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';
import {
  parseGridOneWay, parseGridTwoWay, detectReplication,
} from '@/utils/anova.utils';
import {
  calculateAnovaOneWay, calculateAnovaTwoWay, tukeyHSD,
} from '@/services/statistics.service';

type Mode = 'one-way' | 'two-way';
const ALPHA = 0.05;

// Ejemplo por defecto (un factor): 3 grupos
const ONE_WAY_EXAMPLE: string[][] = [
  ['6', '8', '13'],
  ['8', '12', '9'],
  ['4', '9', '11'],
  ['5', '11', '8'],
  ['3', '6', '7'],
  ['4', '8', '12'],
];
const ONE_WAY_COLS = ['Método A', 'Método B', 'Método C'];

// Ejemplo dos factores con repetición (2×2, r=2)
const TWO_WAY_EXAMPLE: string[][] = [
  ['10, 12', '20, 22'],
  ['14, 16', '30, 28'],
];
const TWO_WAY_ROWS = ['A1', 'A2'];
const TWO_WAY_COLS = ['B1', 'B2'];

export function AnovaPage() {
  const { add } = useHistory();
  const [mode, setMode] = useState<Mode>('one-way');

  // Estado de la rejilla (un factor)
  const [grid1, setGrid1] = useState<string[][]>(ONE_WAY_EXAMPLE);
  const [cols1, setCols1] = useState<string[]>(ONE_WAY_COLS);
  const [rows1, setRows1] = useState<string[]>(ONE_WAY_EXAMPLE.map((_, i) => `Obs ${i + 1}`));

  // Estado de la rejilla (dos factores)
  const [grid2, setGrid2] = useState<string[][]>(TWO_WAY_EXAMPLE);
  const [rows2, setRows2] = useState<string[]>(TWO_WAY_ROWS);
  const [cols2, setCols2] = useState<string[]>(TWO_WAY_COLS);

  // ---- Cálculo un factor ----
  const oneWay = useMemo(() => {
    const groups = parseGridOneWay(grid1, cols1).filter((g) => g.values.length > 0);
    if (groups.length < 2 || groups.some((g) => g.values.length < 2)) return null;
    const res = calculateAnovaOneWay(groups, ALPHA);
    const within = res.rows.find((r) => r.source.includes('Dentro'))!;
    const tukey = res.rejectH0
      ? tukeyHSD(groups, within.ms ?? 0, within.df, ALPHA)
      : null;
    return { res, tukey };
  }, [grid1, cols1]);

  // ---- Cálculo dos factores ----
  const twoWay = useMemo(() => {
    const matrix = parseGridTwoWay(grid2);
    // rejilla rectangular y celdas no vacías
    const ok = matrix.length >= 2
      && matrix.every((row) => row.length >= 2 && row.every((cell) => cell.length >= 1));
    if (!ok) return null;
    const { r } = detectReplication(matrix);
    // exigir réplicas homogéneas
    const homogeneous = matrix.every((row) => row.every((cell) => cell.length === r));
    if (!homogeneous) return null;
    return calculateAnovaTwoWay(matrix, ALPHA, rows2, cols2);
  }, [grid2, rows2, cols2]);

  const onSaveOneWay = () => {
    if (!oneWay) return;
    add({
      type: 'anova',
      title: `ANOVA 1 factor · k=${oneWay.res.k}`,
      summary: `F = ${formatNumber(oneWay.res.fStatistic, 3)}, p = ${formatNumber(oneWay.res.pValue, 4)} · ${oneWay.res.rejectH0 ? 'rechaza H₀' : 'no rechaza H₀'}`,
      inputs: { k: oneWay.res.k, N: oneWay.res.N },
    });
  };
  const onSaveTwoWay = () => {
    if (!twoWay) return;
    add({
      type: 'anova',
      title: `ANOVA 2 factores · ${twoWay.a}×${twoWay.b}${twoWay.hasReplication ? `, r=${twoWay.r}` : ''}`,
      summary: twoWay.hasReplication ? 'Con interacción A×B' : 'Sin repetición (bloques)',
      inputs: { a: twoWay.a, b: twoWay.b, r: twoWay.r },
    });
  };

  const pdfPayload = {
    documentTitle: 'ANOVA · Análisis de la Varianza',
    subtitle: mode === 'one-way' ? 'Un factor' : 'Dos factores',
    meta: mode === 'one-way' && oneWay
      ? [
          { label: 'k', value: String(oneWay.res.k) },
          { label: 'N', value: String(oneWay.res.N) },
          { label: 'F', value: formatNumber(oneWay.res.fStatistic, 4) },
          { label: 'p', value: formatNumber(oneWay.res.pValue, 4) },
        ]
      : twoWay
      ? [
          { label: 'a', value: String(twoWay.a) },
          { label: 'b', value: String(twoWay.b) },
          { label: 'r', value: String(twoWay.r) },
        ]
      : [],
    sections: mode === 'one-way' && oneWay
      ? [{ title: 'Tabla ANOVA', content: oneWay.res.rows.map((r) =>
          `${r.source}: SC=${formatNumber(r.ss, 3)}, gl=${r.df}, CM=${r.ms === null ? '—' : formatNumber(r.ms, 3)}, F=${r.f === null ? '—' : formatNumber(r.f, 3)}`) }]
      : twoWay
      ? [{ title: 'Tabla ANOVA', content: twoWay.rows.map((r) =>
          `${r.source}: SC=${formatNumber(r.ss, 3)}, gl=${r.df}, CM=${r.ms === null ? '—' : formatNumber(r.ms, 3)}, F=${r.f === null ? '—' : formatNumber(r.f, 3)}`) }]
      : [],
  };

  const summary = mode === 'one-way' && oneWay
    ? `ANOVA un factor\nF = ${formatNumber(oneWay.res.fStatistic, 4)}, p = ${formatNumber(oneWay.res.pValue, 4)}\n${oneWay.res.rejectH0 ? 'Se rechaza H₀' : 'No se rechaza H₀'}`
    : '';

  const hasResult = (mode === 'one-way' && oneWay) || (mode === 'two-way' && twoWay);

  return (
    <div className="space-y-12">
      <PageHeader
        title="ANOVA"
        description="Compara las medias de varios grupos con el análisis de la varianza. Introduce los datos como en una hoja de cálculo y elige uno o dos factores."
        icon={TableProperties}
        badge="inference"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={hasResult && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      <div className="inline-flex items-center gap-1 rounded-lg border border-v0-200/30 bg-v0-50 p-1 dark:border-v0-800/30 dark:bg-v0-900">
        <ModeTab active={mode === 'one-way'} onClick={() => setMode('one-way')} label="Un factor" sub="1" />
        <ModeTab active={mode === 'two-way'} onClick={() => setMode('two-way')} label="Dos factores" sub="2" />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'one-way' ? (
          <motion.div key="one" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            <Section title="Datos" monospaceTitle description="Cada columna es un grupo. Añade columnas (grupos) y filas (observaciones).">
              <DataGrid
                grid={grid1}
                rowHeaders={rows1}
                colHeaders={cols1}
                showRowHeaders={false}
                onChange={setGrid1}
                onRowHeadersChange={setRows1}
                onColHeadersChange={setCols1}
              />
              <div className="mt-4 border-t border-v0-150/30 pt-4 dark:border-v0-800/30">
                <ActionBar
                  onExample={() => { setGrid1(ONE_WAY_EXAMPLE); setCols1(ONE_WAY_COLS); }}
                  onReset={() => { setGrid1([['', '', '']]); setCols1(['Grupo 1', 'Grupo 2', 'Grupo 3']); }}
                  onSubmit={onSaveOneWay}
                />
              </div>
            </Section>

            {oneWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" monospaceTitle description="Resultado del análisis">
                  <AnovaTable rows={oneWay.res.rows} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <StatCard label="F" value={formatNumber(oneWay.res.fStatistic, 4)} icon={Sigma} description={`F crítico ${formatNumber(oneWay.res.fCritical, 3)}`} />
                    <StatCard label="valor-p" value={formatNumber(oneWay.res.pValue, 4)} icon={Sigma} description={`α = ${formatProbability(ALPHA, 2)}`} />
                    <StatCard label="k / N" value={`${oneWay.res.k} / ${oneWay.res.N}`} icon={Sigma} description="grupos / observaciones" />
                  </div>
                </Section>

                <DecisionCard reject={oneWay.res.rejectH0} />

                {oneWay.tukey && <TukeyCard tukey={oneWay.tukey} />}

                <AnovaSteps result={oneWay.res} />
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : (
          <motion.div key="two" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            <Section title="Datos" monospaceTitle description="Filas = factor A, columnas = factor B. Escribe varias réplicas por celda (coma) para la interacción.">
              <DataGrid
                grid={grid2}
                rowHeaders={rows2}
                colHeaders={cols2}
                showRowHeaders
                rowHeaderLabel="A \\ B"
                onChange={setGrid2}
                onRowHeadersChange={setRows2}
                onColHeadersChange={setCols2}
              />
              <div className="mt-4 border-t border-v0-150/30 pt-4 dark:border-v0-800/30">
                <ActionBar
                  onExample={() => { setGrid2(TWO_WAY_EXAMPLE); setRows2(TWO_WAY_ROWS); setCols2(TWO_WAY_COLS); }}
                  onReset={() => { setGrid2([['', ''], ['', '']]); setRows2(['A1', 'A2']); setCols2(['B1', 'B2']); }}
                  onSubmit={onSaveTwoWay}
                />
              </div>
            </Section>

            {twoWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" monospaceTitle description={twoWay.hasReplication ? `Dos factores con repetición · r = ${twoWay.r}` : 'Dos factores sin repetición (bloques)'}>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-v0-200/40 px-3 py-1.5 font-mono text-[11px] text-v0-600 dark:border-v0-800/40 dark:text-v0-300">
                    Detectado: {twoWay.a}×{twoWay.b}{twoWay.hasReplication ? `, r = ${twoWay.r} (con interacción)` : ' (sin repetición)'}
                  </div>
                  <AnovaTable rows={twoWay.rows} />
                </Section>
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Section title="Framework" monospaceTitle description="Fórmulas utilizadas">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ANOVA_FORMULAS.map((f, i) => (
            <FormulaCard key={f.id} formula={f} index={i} />
          ))}
        </div>
      </Section>

      <TheoryDocs moduleId="anova" />

      <HistoryPanel />
    </div>
  );
}

function ModeTab({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-md px-4 py-2 text-left transition-all duration-200 ${
        active
          ? 'bg-v0-950 text-v0-50 shadow-soft dark:bg-v0-50 dark:text-v0-950'
          : 'text-v0-500/70 hover:bg-v0-75 hover:text-v0-900 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100'
      }`}
    >
      <span className="font-mono text-[11px] font-medium opacity-70">{sub}</span>
      <span className="text-[13.5px] font-medium">{label}</span>
    </button>
  );
}

function DecisionCard({ reject }: { reject: boolean }) {
  const Icon = reject ? CheckCircle2 : XCircle;
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
      reject
        ? 'border-emerald-500/25 bg-emerald-500/[0.05]'
        : 'border-v0-300/30 bg-v0-100/40 dark:border-v0-700/40 dark:bg-v0-800/30'
    }`}>
      <Icon size={20} strokeWidth={1.9} className={reject ? 'text-emerald-600 dark:text-emerald-400' : 'text-v0-500'} />
      <p className="text-[13.5px] font-medium text-v0-900 dark:text-v0-50">
        {reject
          ? 'Se rechaza H₀: hay evidencia de que al menos una media difiere.'
          : 'No se rechaza H₀: no hay evidencia suficiente de diferencias entre las medias.'}
      </p>
    </div>
  );
}

function TukeyCard({ tukey }: { tukey: import('@/types').TukeyResult }) {
  return (
    <Section title="Post-hoc · Tukey HSD" monospaceTitle description={`Comparaciones por pares (q = ${formatNumber(tukey.q, 3)})`}>
      <div className="overflow-hidden rounded-xl border border-v0-200/30 dark:border-v0-800/30">
        {tukey.comparisons.map((c, i) => (
          <div key={`${c.a}-${c.b}`} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-v0-150/30 dark:border-v0-800/30' : ''}`}>
            <span className="text-[13px] font-medium text-v0-800 dark:text-v0-100">{c.a} vs {c.b}</span>
            <span className="flex items-center gap-3 font-mono text-[12px] text-v0-600 dark:text-v0-300">
              <span>|Δ| = {formatNumber(c.meanDiff, 3)}</span>
              <span>HSD = {formatNumber(c.hsd, 3)}</span>
              <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${c.significant ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-v0-100 text-v0-500 dark:bg-v0-800 dark:text-v0-400'}`}>
                {c.significant ? 'significativo' : 'no signif.'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
      <TableProperties size={22} strokeWidth={1.5} className="text-v0-400/70" />
      <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce datos válidos</p>
      <p className="mt-1 text-[12.5px] text-v0-500/70">Un factor: ≥ 2 grupos con ≥ 2 datos. Dos factores: rejilla completa ≥ 2×2.</p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: No errors. If `PageHeader`/`Section`/`ActionBar`/`StatCard` prop names differ,
adjust to match their actual signatures (read those components first).

- [ ] **Step 3: Commit**

```bash
git add src/pages/AnovaPage.tsx
git commit -m "feat: add AnovaPage"
```

---

## Task 18: Register the module (nav, route, icons)

**Files:**
- Modify: `src/constants/index.ts`, `src/App.tsx`, `src/components/Sidebar.tsx`, `src/pages/DocsPage.tsx`

- [ ] **Step 1: Add the nav item in `src/constants/index.ts`**

Append to the `NAV_ITEMS` array (after the `estimation` entry):

```ts
  {
    id: 'anova',
    label: 'ANOVA',
    description: 'Análisis de la varianza para uno y dos factores',
    path: '/anova',
    icon: 'TableProperties',
  },
```

- [ ] **Step 2: Add the route in `src/App.tsx`**

Add the import near the other page imports:

```ts
import { AnovaPage } from '@/pages/AnovaPage';
```

Add the route before the catch-all `<Route path="*" ... />`:

```tsx
<Route path="/anova" element={<AnovaPage />} />
```

- [ ] **Step 3: Register the icon in `src/components/Sidebar.tsx`**

Add `TableProperties` to the lucide import list, and to the `ICONS` map:

```ts
const ICONS: Record<string, LucideIcon> = {
  Sigma, Layers, Activity, Target, TableProperties,
};
```

- [ ] **Step 4: Register the icon in `src/pages/DocsPage.tsx`**

Add `TableProperties` to the lucide import and to the `ICONS` map:

```ts
const ICONS: Record<string, LucideIcon> = {
  binomial: Sigma,
  hypergeometric: Layers,
  normal: Activity,
  estimation: Target,
  anova: TableProperties,
};
```

- [ ] **Step 5: Typecheck & build**

Run: `npm run build`
Expected: Build succeeds; `/anova` reachable.

- [ ] **Step 6: Commit**

```bash
git add src/constants/index.ts src/App.tsx src/components/Sidebar.tsx src/pages/DocsPage.tsx
git commit -m "feat: register ANOVA module in nav, routes and docs"
```

---

## Task 19: Changelog v1.2.0

**Files:**
- Modify: `src/content/changelog.ts`

- [ ] **Step 1: Update `src/content/changelog.ts`**

Remove `current: true` from the `1.1.0` entry and prepend a new entry at the top of the
`CHANGELOG` array:

```ts
  {
    version: '1.2.0',
    date: '2026-07-26',
    title: 'Módulo ANOVA',
    current: true,
    changes: [
      { kind: 'added', text: 'Módulo ANOVA con análisis de un factor y de dos factores (con y sin repetición).' },
      { kind: 'added', text: 'Editor de datos tipo hoja de cálculo: añade y quita columnas y filas, y encabezados editables.' },
      { kind: 'added', text: 'Tabla ANOVA con valor-p exacto (distribución F), decisión del test y post-hoc Tukey HSD.' },
      { kind: 'added', text: 'Apartado "Cálculo paso a paso" que muestra el desarrollo manual con tus datos.' },
      { kind: 'added', text: 'Documentación teórica completa de ANOVA en /docs y en el buscador (⌘K).' },
    ],
  },
```

- [ ] **Step 2: Update the sidebar changelog badge (optional)**

In `src/components/Sidebar.tsx`, the resource link badge shows `v1.1`. Update it to `v1.2`:

```tsx
<ResourceLink to="/changelog" icon={GitCommitVertical} label="Changelog" badge="v1.2" onClose={onClose} />
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/content/changelog.ts src/components/Sidebar.tsx
git commit -m "docs: changelog v1.2.0 (ANOVA module)"
```

---

## Task 20: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests PASS (math, services, parsing).

- [ ] **Step 2: Typecheck + production build**

Run: `npm run build`
Expected: `tsc -b` clean; `vite build` succeeds.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: No new errors (fix any introduced by the new files).

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in the browser:
- Open `/anova`. Verify the grid renders with the example data and the ANOVA table + F/p + decision appear.
- Add/remove a column and a row; confirm the table recomputes live.
- Switch to "Dos factores"; verify the detected design banner (`2×2, r = 2 (con interacción)`) and interaction row.
- Change a two-factor cell to a single value per cell; verify it switches to "sin repetición" (no interaction row).
- Expand "Cálculo paso a paso"; verify real numbers are substituted.
- Open `/docs`; verify the ANOVA card with 8 articles; press ⌘K and search "anova".
- Open `/changelog`; verify v1.2.0 is current.

- [ ] **Step 5: Final commit (if any lint fixes)**

```bash
git add -A
git commit -m "chore: final ANOVA verification fixes"
```

---

## Notes for the implementer

- **`formatNumber` / `formatProbability`** live in `src/utils/formatters.utils.ts` and are
  used across pages — confirm their signatures `(value: number, decimals: number)`.
- **`PageHeader`, `Section`, `StatCard`, `ActionBar`, `ExportButton`** — read the existing
  usages in `EstimationPage.tsx` (already cited) and match their prop names exactly; the
  code above mirrors those usages.
- **`ExportButton` payload shape** is taken from `EstimationPage`'s `pdfPayload`; if the
  component's type differs, adjust field names to match.
- Two-way ANOVA assumes a **balanced** design (equal replicates per cell); the page guards
  against non-homogeneous cells by returning `null` (empty state) rather than miscomputing.
```
