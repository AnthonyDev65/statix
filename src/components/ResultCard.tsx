// =====================================================
// Statix — ResultCard (Vercel primary metric)
// =====================================================
import { motion } from 'framer-motion';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

interface ResultCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  interpretation?: string;
  meta?: string;
}

export function ResultCard({
  label, value, description, icon: Icon, interpretation, meta,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-lg border border-v0-950 bg-v0-950 p-6 text-v0-50 transition-transform duration-200 hover:-translate-y-0.5 dark:border-v0-50 dark:bg-v0-50 dark:text-v0-950"
    >
      {/* Brillo superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-black/20" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-v0-700 bg-v0-900/40 dark:border-v0-200/30 dark:bg-v0-50/40">
              <Icon size={12} strokeWidth={1.75} className="text-v0-50 dark:text-v0-950" />
            </span>
          )}
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-v0-300/80 dark:text-v0-500/70">
              {label}
            </p>
            {meta && (
              <p className="mt-0.5 font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
                {meta}
              </p>
            )}
          </div>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-v0-400/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-v0-500/70"
        />
      </div>

      <div className="relative mt-5">
        <p className="font-mono text-[44px] font-semibold leading-none tracking-tighter tabular-nums">
          {value}
        </p>
        {description && (
          <p className="mt-2 text-[13px] font-medium text-v0-300/80 dark:text-v0-500/70">
            {description}
          </p>
        )}
      </div>

      {interpretation && (
        <p className="relative mt-4 border-t border-v0-700/40 pt-3 text-[12px] leading-relaxed text-v0-300/80 dark:border-v0-200/40 dark:text-v0-500/70">
          {interpretation}
        </p>
      )}
    </motion.div>
  );
}
