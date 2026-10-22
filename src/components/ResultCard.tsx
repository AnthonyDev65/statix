// =====================================================
// Statix — ResultCard
// Resultado principal: la cifra grande, su porcentaje y qué significa.
// =====================================================
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ResultCardProps {
  label: string;
  value: string;
  description?: string;
  /** Obsoleto: se conserva por compatibilidad, ya no se muestra. */
  icon?: LucideIcon;
  interpretation?: string;
  meta?: string;
  /** Destaca la tarjeta con el color de acento (la respuesta principal). */
  emphasis?: boolean;
}

export function ResultCard({
  label, value, description, interpretation, meta, emphasis = false,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col rounded-lg p-5 ${
        emphasis
          ? 'bg-v0-950 text-v0-50 dark:bg-v0-50 dark:text-v0-950'
          : 'border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900 text-v0-950 dark:text-v0-50'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold">{label}</p>
        {meta && (
          <p className={`text-[13px] ${emphasis ? 'text-v0-300 dark:text-v0-300' : 'text-v0-600 dark:text-v0-300'}`}>
            {meta}
          </p>
        )}
      </div>

      <p className="mt-4 text-[38px] font-semibold leading-none tracking-tighter tabular-nums">
        {value}
      </p>
      {description && (
        <p className={`mt-2 text-[15px] font-medium tabular-nums ${emphasis ? 'text-v0-300 dark:text-v0-300' : 'text-v0-600 dark:text-v0-300'}`}>
          {description}
        </p>
      )}

      {interpretation && (
        <p className={`mt-4 text-[14px] leading-relaxed ${emphasis ? 'text-v0-50 dark:text-v0-950' : 'text-v0-700 dark:text-v0-200'}`}>
          {interpretation}
        </p>
      )}
    </motion.div>
  );
}
