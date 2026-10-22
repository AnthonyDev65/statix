// =====================================================
// Statix — HistoryPanel
// Los últimos cálculos guardados en este navegador.
// =====================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, X } from 'lucide-react';
import { useHistory } from '@/context/HistoryContext';
import { formatTimestamp } from '@/utils/formatters.utils';
import { NAV_ITEMS } from '@/constants';
import type { DistributionType } from '@/types';

const TYPE_LABELS: Record<DistributionType, string> = NAV_ITEMS.reduce(
  (acc, n) => ({ ...acc, [n.id]: n.short }),
  {} as Record<DistributionType, string>,
);

export function HistoryPanel() {
  const { history, clear, remove } = useHistory();
  // Vaciar pide una segunda pulsación para evitar borrados accidentales.
  const [confirming, setConfirming] = useState(false);
  if (history.length === 0) return null;

  const onClear = () => {
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 4000);
      return;
    }
    clear();
    setConfirming(false);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900">
      <div className="flex items-center justify-between gap-3 border-b border-v0-150 px-5 py-3 dark:border-v0-800">
        <div className="flex items-center gap-2.5">
          <Clock size={16} strokeWidth={1.75} className="text-v0-600 dark:text-v0-300" aria-hidden="true" />
          <h3 className="text-[16px] font-semibold text-v0-950 dark:text-v0-50">Cálculos recientes</h3>
          <span className="text-[14px] tabular-nums text-v0-600 dark:text-v0-300">{history.length}</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[14px] font-medium transition-colors ${
            confirming
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
              : 'text-v0-600 hover:bg-v0-75 hover:text-v0-950 dark:text-v0-300 dark:hover:bg-v0-800 dark:hover:text-v0-50'
          }`}
        >
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
          {confirming ? '¿Seguro? Vaciar' : 'Vaciar historial'}
        </button>
      </div>
      <ul className="divide-y divide-v0-150 dark:divide-v0-800">
        <AnimatePresence initial={false}>
          {history.slice(0, 8).map((entry) => (
            <motion.li
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-v0-50 dark:hover:bg-v0-800/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-medium text-v0-900 dark:text-v0-100">{entry.title}</span>
                  <span className="hidden rounded-md bg-v0-100 px-1.5 py-0.5 text-[13px] text-v0-700 dark:bg-v0-800 dark:text-v0-200 sm:inline">
                    {TYPE_LABELS[entry.type] ?? entry.type}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[14px] tabular-nums text-v0-600 dark:text-v0-300">{entry.summary}</p>
              </div>
              <span className="hidden text-[13px] tabular-nums text-v0-600 dark:text-v0-300 sm:inline">
                {formatTimestamp(entry.timestamp)}
              </span>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-v0-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 dark:text-v0-300 dark:hover:bg-rose-500/10 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Borrar del historial: ${entry.title}`}
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
