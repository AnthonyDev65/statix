// =====================================================
// Statix — GaltonLive
// El tablero de Galton en vivo: la binomial B(n, p) en barras y la
// normal N(np, np(1−p)) encima. Al subir n, la campana aparece sola.
// =====================================================
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { binomialPmf } from '@/services/statistics.service';
import { normalPdf } from '@/utils/math.utils';

const W = 640;
const H = 260;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 26;

const fmt = (v: number, d = 3) =>
  v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

export function GaltonLive() {
  const [n, setN] = useState(12);
  const [p, setP] = useState(0.5);
  const nId = useId();
  const pId = useId();

  const model = useMemo(() => {
    const mean = n * p;
    const sd = Math.sqrt(n * p * (1 - p));
    const bars = Array.from({ length: n + 1 }, (_, k) => ({ k, y: binomialPmf(n, p, k) }));
    const maxBar = Math.max(...bars.map((b) => b.y));
    const curveAt = (x: number) => (sd > 0 ? normalPdf(x, mean, sd) : 0);
    const yMax = Math.max(maxBar, curveAt(mean)) * 1.08;
    // Mayor diferencia entre la probabilidad exacta y la aproximación normal.
    const maxGap = Math.max(...bars.map((b) => Math.abs(b.y - curveAt(b.k))));
    const plotW = W - PAD_X * 2;
    const plotH = H - PAD_TOP - PAD_BOTTOM;
    const xOf = (x: number) => PAD_X + ((x + 0.5) / (n + 1)) * plotW;
    const yOf = (y: number) => PAD_TOP + plotH - (y / yMax) * plotH;
    const steps = 160;
    const curve = Array.from({ length: steps + 1 }, (_, i) => {
      const x = -0.5 + (i / steps) * (n + 1);
      return `${i === 0 ? 'M' : 'L'}${xOf(x).toFixed(1)},${yOf(curveAt(x)).toFixed(1)}`;
    }).join(' ');
    return { mean, sd, bars, curve, maxGap, xOf, yOf, barW: (plotW / (n + 1)) * 0.78 };
  }, [n, p]);

  const labelEvery = n <= 16 ? 1 : n <= 32 ? 2 : 5;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
      <figure className="min-w-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Distribución binomial con n = ${n} y p = ${fmt(p, 2)}, comparada con la curva normal de media ${fmt(model.mean, 2)}`}
        >
          {model.bars.map((b) => (
            <rect
              key={b.k}
              x={model.xOf(b.k) - model.barW / 2}
              y={model.yOf(b.y)}
              width={model.barW}
              height={Math.max(0, model.yOf(0) - model.yOf(b.y))}
              rx={Math.min(3, model.barW / 4)}
              className="fill-v0-200 transition-[y,height] duration-300 ease-out dark:fill-v0-700"
            />
          ))}
          <path
            d={model.curve}
            fill="none"
            strokeWidth={2.5}
            strokeLinejoin="round"
            className="stroke-accent-500 dark:stroke-accent-400"
          />
          {model.bars
            .filter((b) => b.k % labelEvery === 0)
            .map((b) => (
              <text
                key={`t-${b.k}`}
                x={model.xOf(b.k)}
                y={H - 6}
                textAnchor="middle"
                className="fill-v0-500 text-[13px] tabular-nums dark:fill-v0-400"
              >
                {b.k}
              </text>
            ))}
        </svg>
        <figcaption className="mt-3 text-[14px] text-v0-600 dark:text-v0-300">
          Barras: probabilidad exacta de cada número de éxitos. Línea: la normal con la misma media y desviación.
        </figcaption>
      </figure>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={nId} className="text-[15px] font-medium text-v0-800 dark:text-v0-100">
              Intentos (n)
            </label>
            <output htmlFor={nId} className="text-[22px] font-semibold tabular-nums text-v0-950 dark:text-v0-50">
              {n}
            </output>
          </div>
          <input
            id={nId}
            type="range"
            min={1}
            max={60}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-2 h-11 w-full cursor-pointer accent-v0-950 dark:accent-v0-50"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={pId} className="text-[15px] font-medium text-v0-800 dark:text-v0-100">
              Probabilidad de éxito (p)
            </label>
            <output htmlFor={pId} className="text-[22px] font-semibold tabular-nums text-v0-950 dark:text-v0-50">
              {fmt(p, 2)}
            </output>
          </div>
          <input
            id={pId}
            type="range"
            min={0.05}
            max={0.95}
            step={0.05}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="mt-2 h-11 w-full cursor-pointer accent-v0-950 dark:accent-v0-50"
          />
        </div>

        <p className="text-[16px] leading-relaxed text-v0-800 dark:text-v0-100" aria-live="polite">
          Media <strong className="tabular-nums">{fmt(model.mean, 2)}</strong>, desviación{' '}
          <strong className="tabular-nums">{fmt(model.sd, 2)}</strong>. La normal se aleja de la
          binomial como mucho <strong className="tabular-nums">{fmt(model.maxGap, 4)}</strong>
          {model.maxGap < 0.01 ? ': ya es una buena aproximación.' : ': todavía conviene usar la binomial exacta.'}
        </p>

        <Link
          to={`/binomial?n=${n}&p=${p}&x=${Math.round(model.mean)}`}
          className="group inline-flex items-center gap-2 self-start text-[15px] font-semibold text-v0-950 underline-offset-4 hover:underline dark:text-v0-50"
        >
          Abrir estos valores en la calculadora
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
