// =====================================================
// Statix — ConfidenceChart
// =====================================================
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/formatters.utils';

interface ConfidenceChartProps {
  lower: number;
  upper: number;
  center: number;
  unit?: string;
  height?: number;
}

export function ConfidenceChart({
  lower, upper, center, unit = '', height = 130,
}: ConfidenceChartProps) {
  return (
    <div className="w-full select-none px-3" style={{ height }}>
      <div className="relative h-full w-full">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-v0-200 dark:bg-v0-800" />

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left center' }}
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-sm bg-v0-950 dark:bg-v0-50"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-4 w-4 rounded-full border-2 border-white bg-v0-950 dark:border-v0-950 dark:bg-v0-50" />
          <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold text-v0-950 dark:text-v0-50 tabular-nums">
            {formatNumber(center, 4)}
            <span className="ml-0.5 text-[13px] text-v0-500 dark:text-v0-300">{unit}</span>
          </div>
        </motion.div>

        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-3 w-px bg-v0-400 dark:bg-v0-500" />
          <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium text-v0-500 dark:text-v0-300 tabular-nums">
            {formatNumber(lower, 4)}
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div className="h-3 w-px bg-v0-400 dark:bg-v0-500" />
          <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium text-v0-500 dark:text-v0-300 tabular-nums">
            {formatNumber(upper, 4)}
          </div>
        </div>
      </div>
    </div>
  );
}
