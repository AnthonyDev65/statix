// =====================================================
// Statix — StatCard
// Medida secundaria (media, varianza…): nombre, cifra y fórmula corta.
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900 p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {Icon && (
            <Icon size={15} strokeWidth={1.75} className="text-v0-950 dark:text-v0-50" />
          )}
          <span className="text-[14px] font-medium text-v0-700 dark:text-v0-200">
            {label}
          </span>
          {tooltip && <TooltipInfo content={tooltip} />}
        </div>
        {trend && <TrendBadge {...trend} />}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold leading-none tracking-tighter text-v0-950 dark:text-v0-50 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[14px] font-medium text-v0-500 dark:text-v0-300">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-[14px] leading-snug text-v0-600 dark:text-v0-300">
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
      ? 'text-emerald-700 dark:text-emerald-400'
      : direction === 'down'
      ? 'text-rose-700 dark:text-rose-400'
      : 'text-v0-600 dark:text-v0-300';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[13px] font-medium ${color}`}>
      <span className="leading-none">{arrow}</span>
      {label}
    </span>
  );
}
