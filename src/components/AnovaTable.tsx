// =====================================================
// Statix — AnovaTable (tabla ANOVA clásica)
// =====================================================
import type { AnovaTableRow } from '@/types';
import { formatNumber } from '@/utils/formatters.utils';

export function AnovaTable({ rows }: { rows: AnovaTableRow[] }) {
  const cell = 'px-3 py-2.5 text-right font-mono text-[12.5px] tabular-nums';
  const head = 'px-3 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70';
  return (
    <div className="overflow-x-auto rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
      <table className="w-full">
        <thead className="border-b border-v0-150/30 dark:border-v0-800/30">
          <tr>
            <th className={head + ' text-left'}>Fuente</th>
            <th className={head}>SC</th>
            <th className={head}>gl</th>
            <th className={head}>CM</th>
            <th className={head}>F</th>
            <th className={head}>valor-p</th>
            <th className={head}>F crítico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.source} className="border-b border-v0-150/20 last:border-0 dark:border-v0-800/20">
              <td className="px-3 py-2.5 text-left text-[12.5px] font-medium text-v0-800 dark:text-v0-100">
                {r.source}
              </td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{formatNumber(r.ss, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.df}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.ms === null ? '—' : formatNumber(r.ms, 4)}</td>
              <td className={cell + ' font-semibold text-v0-950 dark:text-v0-50'}>{r.f === null ? '—' : formatNumber(r.f, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.pValue === null ? '—' : formatNumber(r.pValue, 4)}</td>
              <td className={cell + ' text-v0-700 dark:text-v0-200'}>{r.fCritical === null ? '—' : formatNumber(r.fCritical, 4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
