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
