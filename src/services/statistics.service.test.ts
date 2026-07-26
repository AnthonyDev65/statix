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
