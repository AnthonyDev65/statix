// =====================================================
// Statix — Panel, EmptyResult y ChartPanel
// Superficies compartidas por todas las calculadoras.
// =====================================================
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

/** Superficie de un bloque: tarjeta blanca con borde fino (estilo Vercel). */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900 p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

/** Estado vacío de los resultados cuando los datos no son válidos todavía. */
export function EmptyResult({
  title = 'Faltan datos válidos',
  text = 'Corrige los campos marcados en rojo y el resultado aparecerá aquí.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-v0-200 bg-v0 px-6 py-16 text-center dark:border-v0-800 dark:bg-v0-900"
    >
      <Calculator size={22} strokeWidth={1.75} className="text-v0-500 dark:text-v0-300" aria-hidden="true" />
      <p className="mt-4 text-[16px] font-semibold text-v0-900 dark:text-v0-50">{title}</p>
      <p className="mt-1.5 max-w-xs text-[15px] text-v0-600 dark:text-v0-300">{text}</p>
    </motion.div>
  );
}

/** Contenedor de gráfico con un pie que explica qué se ve. */
export function ChartPanel({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="rounded-lg border border-v0-150 bg-v0 dark:border-v0-800 dark:bg-v0-900 p-3 sm:p-5">
      {children}
      {caption && (
        <figcaption className="px-2 pt-3 text-[14px] text-v0-600 dark:text-v0-300">{caption}</figcaption>
      )}
    </figure>
  );
}
