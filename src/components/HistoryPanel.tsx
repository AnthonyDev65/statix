// =====================================================
// Statix — HistoryPanel (Vercel deploy log)
// =====================================================
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, X } from 'lucide-react';
import { useHistory } from '@/context/HistoryContext';
import { formatTimestamp } from '@/utils/formatters.utils';
import { NAV_ITEMS } from '@/constants';
import type { DistributionType } from '@/types';

const TYPE_LABELS: Record<DistributionType, string> = NAV_ITEMS.reduce(
  (acc, n) => ({ ...acc, [n.id]: n.label }),
  {} as Record<DistributionType, string>,
);

export function HistoryPanel() {
  const { history, clear, remove } = useHistory();
  if (history.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
      <div className="flex items-center justify-between border-b border-v0-150/30 px-5 py-3 dark:border-v0-800/30">
        <div className="flex items-center gap-2.5">
          <Clock size={13} strokeWidth={1.75} className="text-v0-500/70 dark:text-v0-300/80" />
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-800 dark:text-v0-200">
            Recent builds
          </h3>
          <span className="rounded-md border border-v0-200/30 px-1.5 py-0.5 font-mono text-[10.5px] text-v0-500/70 dark:border-v0-800/30 dark:text-v0-300/80">
            {history.length}
          </span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-medium text-v0-500/70 transition-colors hover:bg-v0-75 hover:text-v0-900 dark:hover:bg-v0-900 dark:hover:text-v0-100"
        >
          <Trash2 size={11} strokeWidth={1.75} /> clear
        </button>
      </div>
      <ul className="divide-y divide-v0-150/30 dark:divide-v0-800/30">
        <AnimatePresence initial={false}>
          {history.slice(0, 8).map((entry, idx) => (
            <motion.li
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-v0-50/60 dark:hover:bg-v0-900/40"
            >
              <span className="font-mono text-[10.5px] tabular-nums text-v0-400/70 dark:text-v0-500/70">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/30" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-v0-900 dark:text-v0-100">
                    {entry.title}
                  </span>
                  <span className="rounded-md border border-v0-200/30 px-1.5 py-0.5 font-mono text-[10px] text-v0-500/70 dark:border-v0-800/30 dark:text-v0-300/80">
                    {entry.type}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[11px] text-v0-500/70 dark:text-v0-300/80">
                  {entry.summary}
                </p>
              </div>
              <span className="hidden font-mono text-[10.5px] tabular-nums text-v0-400/70 dark:text-v0-500/70 sm:inline">
                {formatTimestamp(entry.timestamp)}
              </span>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-v0-400/70 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/10"
                aria-label="Eliminar"
              >
                <X size={12} strokeWidth={1.75} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
