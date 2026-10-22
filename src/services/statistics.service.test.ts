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
    // NOTE: plan asserted 4.0, but mean(A)=30/6=5 and mean(C)=60/6=10 => |diff|=5.0.
    // Corrected to the arithmetically-true value; the calculation matches the plan's formula.
    expect(ac.meanDiff).toBeCloseTo(5.0, 6);
    expect(typeof ac.significant).toBe('boolean');
  });
});

describe('ANOVA degenerate zero-variance cases', () => {
  it('one-way: zero within-variance but differing means rejects H0', () => {
    const r = calculateAnovaOneWay([
      { label: 'A', values: [5, 5] },
      { label: 'B', values: [9, 9] },
    ], 0.05);
    expect(r.fStatistic).toBe(Infinity);
    expect(r.pValue).toBe(0);
    expect(r.rejectH0).toBe(true);
  });
  it('one-way: identical groups do not reject H0', () => {
    const r = calculateAnovaOneWay([
      { label: 'A', values: [5, 5] },
      { label: 'B', values: [5, 5] },
    ], 0.05);
    expect(r.fStatistic).toBe(0);
    expect(r.rejectH0).toBe(false);
  });
  it('two-way no-replication with additive matrix produces no NaN', () => {
    const matrix = [
      [[1], [2], [3]],
      [[2], [3], [4]],
      [[3], [4], [5]],
    ]; // perfectly additive -> ssError = 0
    const r = calculateAnovaTwoWay(matrix, 0.05, ['a1','a2','a3'], ['b1','b2','b3']);
    r.rows.forEach((row) => {
      if (row.f !== null) expect(Number.isNaN(row.f)).toBe(false);
      if (row.pValue !== null) expect(Number.isNaN(row.pValue)).toBe(false);
    });
  });
});

import {
  binomialPmf, binomialCdf, binomialSurvival,
  hypergeometricPmf, hypergeometricCdf, hypergeometricSurvival,
  calculateNormal, calculateMeanEstimation, calculateMeanEstimationCentered,
  calculateProportionEstimation, isBalancedDesign,
} from '@/services/statistics.service';

const expectRel = (a: number, b: number, tol: number) => {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.abs(b));
};

describe('binomial con n grande (regresión de desbordamiento)', () => {
  it('binomialPmf(200, 0.5, 100) = 0.0563484790…', () => {
    expectRel(binomialPmf(200, 0.5, 100), 0.056348479009256436, 1e-10);
  });
  it('n = 5000', () => {
    expectRel(binomialPmf(5000, 0.5, 2500), 0.011283227495479858, 1e-9);
    expectRel(binomialPmf(5000, 0.2, 1000), 0.014103505478012498, 1e-9);
  });
  it('p = 0 y p = 1 exactos', () => {
    expect(binomialPmf(10, 0, 0)).toBe(1);
    expect(binomialPmf(10, 0, 3)).toBe(0);
    expect(binomialPmf(10, 1, 10)).toBe(1);
    expect(binomialPmf(10, 1, 9)).toBe(0);
    expect(binomialCdf(10, 0, 0)).toBe(1);
    expect(binomialSurvival(10, 1, 10)).toBe(1);
  });
  it('cola superior sumada directamente (sin 1 − CDF)', () => {
    // P(X ≥ 170 | n=200, p=0.5) = 3.0866e−25 ; 1 − cdf daría 0
    expectRel(binomialSurvival(200, 0.5, 170), 3.086567678106935e-25, 1e-8);
    expectRel(binomialCdf(200, 0.5, 30), 3.086567678106935e-25, 1e-8);
  });
  it('CDF y supervivencia en [0, 1] y complementarias', () => {
    const c = binomialCdf(200, 0.3, 60);
    const s = binomialSurvival(200, 0.3, 61);
    expect(c).toBeLessThanOrEqual(1);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(c + s).toBeCloseTo(1, 12);
    expect(binomialSurvival(20, 0.4, 0)).toBe(1);
    expect(binomialCdf(20, 0.4, 20)).toBe(1);
  });
});

describe('hipergeométrica con N grande', () => {
  it('hypergeometricPmf(500, 100, 50, 10) ≈ 0.147368 (antes NaN)', () => {
    expectRel(hypergeometricPmf(500, 100, 50, 10), 0.14736784420411747, 1e-9);
  });
  it('N = 5000', () => {
    expectRel(hypergeometricPmf(5000, 1000, 500, 100), 0.04697422123365405, 1e-9);
    expectRel(hypergeometricSurvival(5000, 1000, 500, 150), 1.1800782329147414e-8, 1e-7);
  });
  it('CDF + supervivencia = 1 y respeta el soporte', () => {
    const c = hypergeometricCdf(500, 100, 50, 9);
    const s = hypergeometricSurvival(500, 100, 50, 10);
    expect(c + s).toBeCloseTo(1, 12);
    // soporte: x ≥ n − (N − K) = 8
    expect(hypergeometricCdf(10, 8, 10, 7)).toBe(0);
    expect(hypergeometricSurvival(10, 8, 10, 8)).toBe(1);
  });
});

describe('calculateNormal — cola derecha con función complementaria', () => {
  it('P(X > μ + 8σ) ≈ 6.221e−16', () => {
    const r = calculateNormal({ mu: 10, sigma: 2, x: 26, mode: 'right-tail' });
    expectRel(r.probability, 6.22096057427174e-16, 1e-6);
  });
  it('between en la cola derecha no pierde precisión', () => {
    const r = calculateNormal({ mu: 0, sigma: 1, x: 7, x2: 8, mode: 'between' });
    // Φ(8) − Φ(7) = Q(7) − Q(8)
    expectRel(r.probability, 1.279812543885835e-12 - 6.22096057427174e-16, 1e-6);
  });
});

describe('IC de la media con t de Student', () => {
  it('por defecto usa t con n − 1 gl (n=10, 95 % → t = 2.262157)', () => {
    const r = calculateMeanEstimation({ n: 10, xBar: 50, s: 4, confidence: 0.95 });
    expect(r.criticalKind).toBe('t');
    expect(r.df).toBe(9);
    expect(r.critical).toBeCloseTo(2.262157, 6);
    expect(r.zCritical).toBe(r.critical); // compatibilidad hacia atrás
    expect(r.marginOfError).toBeCloseTo(2.262157 * 4 / Math.sqrt(10), 5);
  });
  it('sigmaKnown = true usa z', () => {
    const r = calculateMeanEstimation({ n: 10, xBar: 50, s: 4, confidence: 0.95, sigmaKnown: true });
    expect(r.criticalKind).toBe('z');
    expect(r.df).toBeUndefined();
    expect(r.critical).toBeCloseTo(1.959964, 6);
  });
  it('n = 31 → t(0.975, 30) = 2.042272 y límites centrados', () => {
    const r = calculateMeanEstimationCentered({ n: 31, xBar: 100, s: 10, confidence: 0.95 });
    expect(r.critical).toBeCloseTo(2.042272, 6);
    expect(r.upperBound - r.center).toBeCloseTo(r.marginOfError, 12);
    expect(r.center - r.lowerBound).toBeCloseTo(r.marginOfError, 12);
  });
});

describe('IC de la proporción: Wald recortado + Wilson', () => {
  it('Wilson con valores de referencia (n=100, p̂=0.5, 95 %)', () => {
    const r = calculateProportionEstimation({ n: 100, pHat: 0.5, confidence: 0.95 });
    expect(r.criticalKind).toBe('z');
    expect(r.wilsonLower).toBeCloseTo(0.403831, 5);
    expect(r.wilsonUpper).toBeCloseTo(0.596169, 5);
    expect(r.waldClamped).toBe(false);
    expect(r.lowerBound).toBeCloseTo(0.5 - 1.959964 * 0.05, 5);
  });
  it('Wilson asimétrico (n=20, p̂=0.1) y Wald recortado a [0, 1]', () => {
    const r = calculateProportionEstimation({ n: 20, pHat: 0.1, confidence: 0.95 });
    expect(r.wilsonLower).toBeCloseTo(0.0278665, 5);
    expect(r.wilsonUpper).toBeCloseTo(0.3010336, 5);
    expect(r.lowerBound).toBe(0);
    expect(r.waldClamped).toBe(true);
  });
  it('p̂ = 0: Wald degenera, Wilson no', () => {
    const r = calculateProportionEstimation({ n: 30, pHat: 0, confidence: 0.95 });
    expect(r.lowerBound).toBe(0);
    expect(r.wilsonLower).toBe(0);
    expect(r.wilsonUpper).toBeGreaterThan(0.1);
  });
});

describe('Tukey: metadatos de la tabla', () => {
  const mk = (k: number) => Array.from({ length: k }, (_, i) => ({
    label: `G${i + 1}`, values: [i, i + 1, i + 2],
  }));
  it('k ≤ 10 y α = 0.05: tabla, sin aviso', () => {
    const r = tukeyHSD(mk(4), 1, 8, 0.05);
    expect(r.approximate).toBe(false);
    expect(r.outOfTable).toBe(false);
    expect(r.qMethod).toBe('table');
    expect(r.warning).toBeUndefined();
  });
  it('k = 12: cálculo numérico con aviso en español', () => {
    const r = tukeyHSD(mk(12), 1, 24, 0.05);
    expect(r.outOfTable).toBe(true);
    expect(r.qMethod).toBe('numeric');
    expect(r.warning).toMatch(/tabla/);
    expect(r.comparisons).toHaveLength(66);
  });
});

describe('ANOVA dos factores: diseño balanceado', () => {
  it('isBalancedDesign', () => {
    expect(isBalancedDesign([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])).toBe(true);
    expect(isBalancedDesign([[[1, 2], [3]], [[5, 6], [7, 8]]])).toBe(false);
    expect(isBalancedDesign([[[1], []], [[5], [7]]])).toBe(false);
    expect(isBalancedDesign([[[1], [2]], [[5]]])).toBe(false);
    expect(isBalancedDesign([])).toBe(false);
  });
  it('lanza Error con mensaje en español si las réplicas difieren', () => {
    expect(() => calculateAnovaTwoWay([[[1, 2], [3]], [[5, 6], [7, 8]]], 0.05, ['a', 'b'], ['c', 'd']))
      .toThrow(/balanceado/);
  });
  it('lanza Error si hay una celda vacía', () => {
    expect(() => calculateAnovaTwoWay([[[1], []], [[5], [7]]], 0.05, ['a', 'b'], ['c', 'd']))
      .toThrow(/celda \(fila 1, columna 2\) está vacía/);
  });
  it('lanza Error si las filas tienen distinto nº de columnas', () => {
    expect(() => calculateAnovaTwoWay([[[1], [2]], [[5]]], 0.05, ['a', 'b'], ['c', 'd']))
      .toThrow(/fila 2/);
  });
});
