// =====================================================
// Statix — ActionBar (Vercel-style buttons)
// =====================================================
import { motion } from 'framer-motion';
import { Eraser, FlaskConical, Play } from 'lucide-react';
import type { ReactNode } from 'react';

interface ActionBarProps {
  onExample?: () => void;
  onReset?: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  extra?: ReactNode;
}

export function ActionBar({
  onExample, onReset, onSubmit, isLoading = false,
  submitLabel = 'Calcular', extra,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-md bg-v0-950 px-4 text-[13px] font-medium text-v0-50 transition-all duration-200 hover:bg-v0-800 hover:shadow-soft active:bg-v0-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200 dark:active:bg-v0-300"
      >
        {/* Shimmer al pasar el mouse */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-black/10" />
        {isLoading ? (
          <>
            <span className="relative inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="relative">Calculando…</span>
          </>
        ) : (
          <>
            <Play size={12} strokeWidth={2.4} fill="currentColor" className="relative" />
            <span className="relative">{submitLabel}</span>
            <span className="relative ml-1 hidden font-mono text-[10.5px] text-v0-400/70 transition-colors group-hover:text-v0-300 sm:inline dark:text-v0-500/70 dark:group-hover:text-v0-600">
              ⌘↵
            </span>
          </>
        )}
      </motion.button>
      {onExample && (
        <button
          type="button"
          onClick={onExample}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-3.5 text-[13px] font-medium text-v0-800 transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 active:scale-[0.98] dark:border-v0-700/30 dark:bg-transparent dark:text-v0-100 dark:hover:border-v0-600 dark:hover:bg-v0-800/50"
        >
          <FlaskConical size={13} strokeWidth={1.75} />
          Ejemplo
        </button>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-3.5 text-[13px] font-medium text-v0-800 transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 active:scale-[0.98] dark:border-v0-700/30 dark:bg-transparent dark:text-v0-100 dark:hover:border-v0-600 dark:hover:bg-v0-800/50"
        >
          <Eraser size={13} strokeWidth={1.75} />
          Limpiar
        </button>
      )}
      {extra}
    </div>
  );
}
