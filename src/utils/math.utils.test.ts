import { describe, it, expect } from 'vitest';
import { gamma } from '@/utils/math.utils';

describe('vitest setup', () => {
  it('runs and resolves @ alias', () => {
    expect(gamma(5)).toBeCloseTo(24, 6); // Γ(5) = 4! = 24
  });
});
