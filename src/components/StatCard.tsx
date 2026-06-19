// =====================================================
// Statix — StatCard (Vercel metric tile)
// =====================================================
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TooltipInfo } from './TooltipInfo';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  description?: string;
  icon?: LucideIcon;
  tooltip?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
}

export function StatCard({
  label, value, unit, description, icon: Icon, tooltip, trend,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-lg border border-v0-200/30 bg-v0-50 p-5 transition-all duration-200 hover:border-v0-300/60 hover:shadow-soft dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {Icon && (
            <Icon size={12} strokeWidth={1.75} className="text-v0-400/70 dark:text-v0-500/70" />
          )}
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-v0-500/70 dark:text-v0-300/80">
            {label}
          </span>
          {tooltip && <TooltipInfo content={tooltip} />}
        </div>
        {trend && <TrendBadge {...trend} />}
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono text-[30px] font-semibold leading-none tracking-tighter text-v0-950 dark:text-v0-50 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[11px] font-medium text-v0-400/70 dark:text-v0-500/70">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2.5 text-[12px] leading-snug text-v0-500/70 dark:text-v0-300/80">
          {description}
        </p>
      )}
    </motion.div>
  );
}

function TrendBadge({
  direction, label,
}: {
  direction: 'up' | 'down' | 'flat';
  label: string;
}) {
  const color =
    direction === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : direction === 'down'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-v0-500/70 dark:text-v0-300/80';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border border-v0-200/30 px-1.5 py-0.5 font-mono text-[10.5px] font-medium dark:border-v0-700/30 ${color}`}
    >
      <span className="leading-none">{arrow}</span>
      {label}
    </span>
  );
}
