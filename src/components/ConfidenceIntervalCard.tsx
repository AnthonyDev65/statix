// =====================================================
// Statix — ConfidenceIntervalCard
// Límites del intervalo, estimación puntual y qué significa.
// =====================================================
import { motion } from 'framer-motion';
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
  const confidencePct = Math.round(confidence * 1000) / 10;

  const cells = [
    { label: 'Límite inferior', value: lower },
    { label: 'Estimación', value: center },
    { label: 'Límite superior', value: upper },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg bg-v0-950 p-5 text-v0-50 dark:bg-v0-50 dark:text-v0-950 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[15px] font-semibold">Intervalo de confianza al {confidencePct} %</p>
        {range > 0 && (
          <p className="text-[14px] tabular-nums text-v0-300 dark:text-v0-600">
            Margen de error ±{formatNumber(range / 2, 4)}
          </p>
        )}
      </div>

      <p className="mt-4 text-[34px] font-semibold leading-none tracking-tighter tabular-nums">
        [{formatNumber(lower, 4)}, {formatNumber(upper, 4)}]
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.label}>
            <dt className="text-[13px] text-v0-300 dark:text-v0-600">{c.label}</dt>
            <dd className="mt-1 text-[17px] font-semibold tabular-nums">
              {formatNumber(c.value, 4)}
              {unit && <span className="ml-0.5 text-[13px] text-v0-300 dark:text-v0-600">{unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {interpretation && (
        <p className="mt-5 text-[15px] leading-relaxed text-v0-100 dark:text-v0-800">{interpretation}</p>
      )}
    </motion.div>
  );
}
