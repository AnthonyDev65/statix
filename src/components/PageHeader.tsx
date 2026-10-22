// =====================================================
// Statix — PageHeader
// Título del módulo, su notación y una frase que explica para qué sirve.
// =====================================================
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useUIMode } from '@/context/UIModeContext';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Notación del modelo, p. ej. "B(n, p)". Se muestra junto al título. */
  badge?: string;
  actions?: ReactNode;
  /** Obsoleto: se conserva por compatibilidad, ya no se muestra. */
  status?: { label: string; tone: 'ready' | 'building' | 'shipped' };
}

export function PageHeader({
  title, description, icon: Icon, badge, actions,
}: PageHeaderProps) {
  const { simpleMode } = useUIMode();
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="flex items-start gap-4">
        <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-v0-100 text-v0-950 dark:bg-v0-800 dark:text-v0-50 sm:flex">
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.05] tracking-tighter text-v0-950 dark:text-v0-50 sm:text-[44px]">
            {title}
            {badge && (
              <span className="ml-3 align-middle text-[20px] font-normal tracking-normal text-v0-950 dark:text-v0-50 sm:text-[24px]">
                {badge}
              </span>
            )}
          </h1>
          <p className="mt-3 max-w-[62ch] text-pretty text-[16px] leading-relaxed text-v0-700 dark:text-v0-200 sm:text-[17px]">
            {description}
          </p>
        </div>
      </div>
      {!simpleMode && actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </motion.header>
  );
}
