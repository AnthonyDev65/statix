// =====================================================
// Statix — Section
// =====================================================
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useUIMode } from '@/context/UIModeContext';

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Obsoleto: se conserva por compatibilidad; todos los títulos usan el mismo estilo. */
  monospaceTitle?: boolean;
  /** Añade más aire arriba para separar bloques mayores. */
  divider?: boolean;
  /** Muestra el encabezado también en el modo "Calcular". */
  alwaysShowHeader?: boolean;
}

export function Section({
  title,
  description,
  children,
  delay = 0,
  className = '',
  divider = false,
  alwaysShowHeader = false,
}: SectionProps) {
  const { simpleMode } = useUIMode();
  const showHeader = (alwaysShowHeader || !simpleMode) && (title || description);
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`space-y-5 ${divider ? 'pt-8' : ''} ${className}`}
    >
      {showHeader && (
        <header>
          {title && (
            <h2 className="text-[22px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 max-w-[65ch] text-[15px] leading-relaxed text-v0-600 dark:text-v0-300">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </motion.section>
  );
}
