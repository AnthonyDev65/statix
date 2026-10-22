// =====================================================
// Statix — AnovaTable (tabla ANOVA clásica)
// =====================================================
import type { AnovaTableRow } from '@/types';
import { formatNumber } from '@/utils/formatters.utils';

export function AnovaTable({ rows }: { rows: AnovaTableRow[] }) {
  const cell = 'px-3 py-3 text-right text-[15px] tabular-nums';
  const head = 'px-3 py-2.5 text-right text-[14px] font-medium text-v0-600 dark:text-v0-300';
  return (
    <div className="overflow-x-auto rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900">
      <table className="w-full min-w-[620px]">
        <thead className="border-b border-v0-150 dark:border-v0-800">
          <tr>
            <th scope="col" className={head + ' text-left'}>Fuente de variación</th>
            <th scope="col" className={head}><abbr title="Suma de cuadrados" className="no-underline">SC</abbr></th>
            <th scope="col" className={head}><abbr title="Grados de libertad" className="no-underline">gl</abbr></th>
            <th scope="col" className={head}><abbr title="Cuadrado medio" className="no-underline">CM</abbr></th>
            <th scope="col" className={head}>F</th>
            <th scope="col" className={head}>Valor p</th>
            <th scope="col" className={head}>F crítico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.source} className="border-b border-v0-150 last:border-0 dark:border-v0-800">
              <th scope="row" className="px-3 py-3 text-left text-[15px] font-medium text-v0-900 dark:text-v0-100">
                {r.source}
              </th>
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
