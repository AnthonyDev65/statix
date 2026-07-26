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
