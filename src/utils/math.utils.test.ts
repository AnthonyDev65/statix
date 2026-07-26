import { describe, it, expect } from 'vitest';
import { gamma } from '@/utils/math.utils';

describe('vitest setup', () => {
  it('runs and resolves @ alias', () => {
    expect(gamma(5)).toBeCloseTo(24, 6); // Γ(5) = 4! = 24
  });
});

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
