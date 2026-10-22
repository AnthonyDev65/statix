/* eslint-disable no-loss-of-precision -- coeficientes publicados con más dígitos de los que representa un double; se conservan tal cual. */
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

import {
  logGamma, combination, erf, erfc, normalCdf, normalSurvival, normalQuantile,
  tCdf, tQuantile, studentizedRangeQInfo, studentizedRangeCdf, studentizedRangeQuantile,
} from '@/utils/math.utils';

/** Comprueba |a − b| ≤ tol·|b| (tolerancia relativa). */
const expectRel = (a: number, b: number, tol: number) => {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.abs(b));
};

describe('logGamma (Lanczos en espacio log)', () => {
  it('coincide con log Γ para valores pequeños', () => {
    expect(logGamma(5)).toBeCloseTo(Math.log(24), 12);
    expect(logGamma(0.5)).toBeCloseTo(0.5 * Math.log(Math.PI), 12);
    expect(logGamma(1)).toBeCloseTo(0, 12);
  });
  it('no desborda para z > 171', () => {
    expect(gamma(200)).toBe(Infinity); // referencia: Γ sí desborda
    // log Γ(200) = log(199!) = 857.9336698258574
    expectRel(logGamma(200), 857.9336698258574, 1e-13);
    // log Γ(5001) = log(5000!) = 37591.143508876765
    expectRel(logGamma(5001), 37591.143508876765, 1e-13);
  });
  it('usa reflexión para z < 0.5 (|Γ(−0.5)| = 2√π)', () => {
    expect(logGamma(-0.5)).toBeCloseTo(Math.log(2 * Math.sqrt(Math.PI)), 12);
    expect(logGamma(0.1)).toBeCloseTo(2.252712651734206, 12);
  });
  it('combination devuelve enteros exactos', () => {
    expect(combination(5, 2)).toBe(10);
    expect(combination(30, 15)).toBe(155117520);
    expectRel(combination(200, 100), 9.054851465610328e58, 1e-11);
  });
});

describe('erf / erfc de alta precisión', () => {
  const ref: Array<[number, number, number]> = [
    // x, erfc(x), erf(x)
    [1e-10, 0.999999999887162, 1.1283791670955126e-10],
    [0.1, 0.8875370839817152, 0.1124629160182849],
    [0.5, 0.4795001221869535, 0.5204998778130465],
    [1, 0.15729920705028516, 0.8427007929497148],
    [2, 0.004677734981047266, 0.9953222650189527],
    [3, 2.209049699858544e-5, 0.9999779095030014],
    [5, 1.5374597944280347e-12, 0.9999999999984626],
    [10, 2.0884875837625446e-45, 1],
    [26, 5.663192408856145e-296, 1],
  ];
  it.each(ref)('x = %d', (x, c, e) => {
    expectRel(erfc(x), c, 1e-13);
    expectRel(erf(x), e, 1e-13);
    expectRel(erf(-x), -e, 1e-13);
    expectRel(erfc(-x), 2 - c, 1e-14);
  });
});

describe('normalCdf / normalSurvival', () => {
  it('normalCdf(1.96) = 0.9750021', () => {
    expect(normalCdf(1.96)).toBeCloseTo(0.9750021048517795, 12);
  });
  it('cola izquierda precisa: normalCdf(−6) ≈ 9.8658765e−10', () => {
    expectRel(normalCdf(-6), 9.865876450376948e-10, 1e-6);
    expectRel(normalCdf(-37), 5.7255712225239266e-300, 1e-6);
  });
  it('cola derecha precisa: P(Z > 8) ≈ 6.221e−16 (1 − cdf daría 0 o ruido)', () => {
    expectRel(normalSurvival(8), 6.22096057427174e-16, 1e-6);
  });
  it('normalQuantile es inverso exacto de normalCdf', () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.959963984540054, 12);
    for (const p of [1e-12, 0.001, 0.3, 0.5, 0.9, 0.999999]) {
      expectRel(normalCdf(normalQuantile(p)), p, 1e-10);
    }
  });
});

describe('t de Student', () => {
  it('tCdf con valores de referencia', () => {
    expect(tCdf(0, 7)).toBe(0.5);
    expect(tCdf(2.0, 5)).toBeCloseTo(0.9490302605850709, 10);
    expect(tCdf(-3, 3)).toBeCloseTo(0.028834442811218657, 10);
    expect(tCdf(1, 1)).toBeCloseTo(0.75, 12); // Cauchy
  });
  it('tQuantile(0.975, 9) = 2.262157 (n = 10, 95 %)', () => {
    expect(tQuantile(0.975, 9)).toBeCloseTo(2.2621571628540993, 6);
  });
  it('tQuantile(0.975, 30) = 2.042272', () => {
    expect(tQuantile(0.975, 30)).toBeCloseTo(2.0422724563012373, 6);
  });
  it('es robusto en df = 1, df = 2 y df grande', () => {
    expect(tQuantile(0.975, 1)).toBeCloseTo(12.706204736432095, 6);
    expectRel(tQuantile(0.99995, 1), 6366.197671316636, 1e-8);
    expect(tQuantile(0.995, 2)).toBeCloseTo(9.92484320091807, 6);
    expect(tQuantile(0.975, 1e6)).toBeCloseTo(1.9599663568141066, 6);
  });
  it('es simétrico y hace ida y vuelta con tCdf', () => {
    expect(tQuantile(0.025, 12)).toBeCloseTo(-tQuantile(0.975, 12), 12);
    expect(tQuantile(0.5, 4)).toBe(0);
    const t = tQuantile(0.9, 17);
    expect(tCdf(t, 17)).toBeCloseTo(0.9, 10);
  });
});

describe('rango studentizado (Tukey) — tabla y cálculo numérico', () => {
  it('dentro de la tabla: método table, sin aviso', () => {
    const info = studentizedRangeQInfo(3, 12, 0.05);
    expect(info.method).toBe('table');
    expect(info.outOfTable).toBe(false);
    expect(info.approximate).toBe(false);
    expect(info.warning).toBeUndefined();
    expect(info.q).toBeCloseTo(3.77, 2);
  });
  it('la CDF numérica coincide con la tabla (±1 %)', () => {
    const cases: Array<[number, number, number, number]> = [
      // k, df, α, q de tabla
      [3, 12, 0.05, 3.77], [10, 20, 0.05, 5.01], [5, 10, 0.01, 6.14],
      [2, 5, 0.05, 3.64], [4, 60, 0.01, 4.59], [8, 30, 0.05, 4.60],
    ];
    for (const [k, df, a, qt] of cases) {
      expectRel(studentizedRangeQuantile(1 - a, k, df), qt, 0.01);
      expect(studentizedRangeCdf(qt, k, df)).toBeCloseTo(1 - a, 2);
    }
  });
  it('k > 10 usa cálculo numérico y avisa', () => {
    const info = studentizedRangeQInfo(12, 20, 0.05);
    expect(info.method).toBe('numeric');
    expect(info.outOfTable).toBe(true);
    expect(info.approximate).toBe(false);
    expect(info.warning).toMatch(/k = 12/);
    expectRel(info.q, 5.198976751093784, 2e-3); // qtukey(0.95, 12, 20)
    expectRel(studentizedRangeQInfo(20, 60, 0.05).q, 5.241199792809555, 2e-3);
    expectRel(studentizedRangeQInfo(15, 30, 0.01).q, 6.142295424387434, 2e-3);
  });
  it('α fuera de {0.05, 0.01} usa cálculo numérico', () => {
    const info = studentizedRangeQInfo(4, 20, 0.1);
    expect(info.method).toBe('numeric');
    expect(info.outOfTable).toBe(true);
    expect(info.warning).toMatch(/α = 0.1/);
    expectRel(info.q, 3.461543359356429, 2e-3);
  });
  it('gl grandes: interpola hacia gl = ∞ en vez de quedarse en 120', () => {
    const q = studentizedRangeQInfo(3, 1000, 0.05).q;
    expectRel(q, 3.3194448973252, 2e-3);
  });
  it('fuera de tabla y sin cálculo posible (gl < 2): aproximado con aviso', () => {
    const info = studentizedRangeQInfo(12, 1, 0.05);
    expect(info.approximate).toBe(true);
    expect(info.outOfTable).toBe(true);
    expect(info.warning).toBeDefined();
  });
});
