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
