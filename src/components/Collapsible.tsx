// =====================================================
// Statix — Collapsible (contenedor plegable genérico)
// =====================================================
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, type LucideIcon } from 'lucide-react';

interface CollapsibleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({
  title, subtitle, icon: Icon, defaultOpen = false, children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-v0-75 dark:hover:bg-v0-800/50"
      >
        {Icon && (
          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-v0-150 bg-v0-50 dark:border-v0-800 dark:bg-v0-950">
            <Icon size={13} strokeWidth={1.75} className="text-v0-600 dark:text-v0-300" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
            {title}
          </span>
          {subtitle && (
            <span className="block text-[14px] text-v0-600 dark:text-v0-300">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.9}
          className={`flex-shrink-0 text-v0-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-v0-150 px-5 py-5 dark:border-v0-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
