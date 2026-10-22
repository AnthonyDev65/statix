// =====================================================
// Statix — FormulaCard
// Nombre de la fórmula, la fórmula en KaTeX y qué significa.
// =====================================================
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { motion } from 'framer-motion';
import type { FormulaDef } from '@/formulas/formulas';

interface FormulaCardProps {
  formula: FormulaDef;
  index?: number;
}

export function FormulaCard({ formula, index = 0 }: FormulaCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(formula.latex, ref.current, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
        strict: 'ignore',
      });
    } catch {
      ref.current.textContent = formula.latex;
    }
  }, [formula.latex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col rounded-lg border border-v0-150 bg-v0 transition-colors hover:border-v0-300 dark:border-v0-800 dark:bg-v0-900 dark:hover:border-v0-600"
    >
      <h4 className="px-5 pt-4 text-[15px] font-semibold text-v0-950 dark:text-v0-50">
        {formula.label}
      </h4>
      <div ref={ref} className="overflow-x-auto px-5 py-3 text-[16px] text-v0-950 dark:text-v0-50" />
      <p className="mt-auto border-t border-v0-150 px-5 py-3 text-[14px] leading-relaxed text-v0-600 dark:border-v0-800 dark:text-v0-300">
        {formula.description}
      </p>
    </motion.div>
  );
}
