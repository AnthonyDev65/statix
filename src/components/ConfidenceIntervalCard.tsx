// =====================================================
// Statix — ConfidenceIntervalCard
// =====================================================
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import { formatNumber } from '@/utils/formatters.utils';

interface ConfidenceIntervalCardProps {
  lower: number;
  upper: number;
  center: number;
  confidence: number;
  unit?: string;
  interpretation?: string;
}

export function ConfidenceIntervalCard({
  lower, upper, center, confidence, unit = '', interpretation,
}: ConfidenceIntervalCardProps) {
  const range = upper - lower;
  const confidencePct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-lg border border-v0-200/30 bg-v0-50 p-6 transition-colors hover:border-v0-300/60 dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
            <Gauge size={14} strokeWidth={1.75} className="text-v0-800 dark:text-v0-200" />
          </span>
          <div>
            <h3 className="text-[14px] font-semibold tracking-vercel text-v0-500/70 dark:text-v0-300/80">
              Intervalo de Confianza
            </h3>
            <p className="mt-0.5 font-mono text-[10.5px] text-v0-500/70 dark:text-v0-300/80">
              {confidencePct}% confidence interval
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-v0-950 px-2.5 py-1 font-mono text-[11px] font-semibold text-v0-50 dark:bg-v0-50 dark:text-v0-950">
          {confidencePct}%
        </span>
      </div>

      {/* Visualización */}
      <div className="mt-6">
        <div className="relative h-2 overflow-hidden rounded-full bg-v0-100 dark:bg-v0-800">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left center' }}
            className="absolute inset-y-0 left-0 right-0 rounded-full bg-v0-950 dark:bg-v0-50"
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
              Lower
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold text-v0-950 dark:text-v0-50 tabular-nums">
              {formatNumber(lower, 4)}
              <span className="ml-0.5 text-[11px] text-v0-400/70 dark:text-v0-500/70">
                {unit}
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
              Estimate
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold text-v0-950 dark:text-v0-50 tabular-nums">
              {formatNumber(center, 4)}
              <span className="ml-0.5 text-[11px] text-v0-400/70 dark:text-v0-500/70">
                {unit}
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
              Upper
            </div>
            <div className="mt-1 font-mono text-[17px] font-semibold text-v0-950 dark:text-v0-50 tabular-nums">
              {formatNumber(upper, 4)}
              <span className="ml-0.5 text-[11px] text-v0-400/70 dark:text-v0-500/70">
                {unit}
              </span>
            </div>
          </div>
        </div>
        {range > 0 && (
          <p className="mt-3 text-center font-mono text-[10.5px] text-v0-500/70 dark:text-v0-300/80">
            margin of error = ±{formatNumber(range / 2, 4)}
          </p>
        )}
      </div>

      {interpretation && (
        <p className="mt-5 border-t border-v0-150/30 pt-4 text-[12.5px] leading-relaxed text-v0-500/70 dark:border-v0-300/80">
          {interpretation}
        </p>
      )}
    </motion.div>
  );
}
