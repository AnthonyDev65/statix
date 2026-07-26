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
