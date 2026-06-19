// =====================================================
// Statix — TooltipInfo
// =====================================================
import { useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipInfoProps {
  content: string;
  children?: ReactNode;
}

export function TooltipInfo({ content, children }: TooltipInfoProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-v0-400/70 transition-colors hover:text-v0-700 focus:text-v0-700 dark:text-v0-500/70 dark:hover:text-v0-300"
        aria-label="Más información"
      >
        {children ?? <Info size={11} strokeWidth={2} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 2, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md border border-v0-200/30 bg-v0-50 p-3 text-[12px] leading-relaxed text-v0-700 shadow-elevated dark:border-v0-700/30 dark:bg-v0-900 dark:text-v0-200"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
