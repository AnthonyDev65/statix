// =====================================================
// Statix — FormulaCard (Vercel terminal block)
// =====================================================
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { motion } from 'framer-motion';
import { Sigma } from 'lucide-react';
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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group overflow-hidden rounded-lg border border-v0-200/30 bg-v0-50 transition-all duration-200 hover:border-v0-300/60 hover:shadow-soft dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700"
    >
      <div className="flex items-center justify-between border-b border-v0-150/30 px-4 py-2.5 dark:border-v0-800/30">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-v0-300 dark:bg-v0-600" />
            <span className="h-2 w-2 rounded-full bg-v0-300 dark:bg-v0-600" />
            <span className="h-2 w-2 rounded-full bg-v0-300 dark:bg-v0-600" />
          </div>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
            <Sigma size={11} strokeWidth={1.75} className="text-v0-700 dark:text-v0-300" />
          </span>
          <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-v0-800 dark:text-v0-200">
            {formula.label}
          </h4>
        </div>
        <span className="font-mono text-[10.5px] tabular-nums text-v0-400/70 dark:text-v0-500/70">
          eq.{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div
        ref={ref}
        className="overflow-x-auto px-5 py-5 font-mono text-[15px] text-v0-950 dark:text-v0-50"
      />
      <p className="border-t border-v0-150/30 px-4 py-3 text-[12px] leading-relaxed text-v0-500/70 dark:border-v0-800/30 dark:text-v0-300/80">
        {formula.description}
      </p>
    </motion.div>
  );
}
