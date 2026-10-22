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
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="-m-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-v0-500 transition-colors hover:text-v0-900 focus:text-v0-900 dark:text-v0-300 dark:hover:text-v0-300"
        aria-label="Más información"
      >
        {children ?? <Info size={14} strokeWidth={2} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 2, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md border border-v0-150 bg-v0 p-3 text-[14px] font-normal leading-relaxed text-v0-800 shadow-float dark:border-v0-800 dark:bg-v0-900 dark:text-v0-200"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
