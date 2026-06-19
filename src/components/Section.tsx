// =====================================================
// Statix — Section
// =====================================================
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
  monospaceTitle?: boolean;
}

export function Section({
  title, description, children, delay = 0, className = '', monospaceTitle = false,
}: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`space-y-5 ${className}`}
    >
      {(title || description) && (
        <header className="flex items-end justify-between gap-4">
          <div>
            {title && (
              <h2
                className={`${
                  monospaceTitle
                    ? 'font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-v0-600 dark:text-v0-300'
                    : 'text-[20px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50'
                }`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-v0-600 dark:text-v0-300">
                {description}
              </p>
            )}
          </div>
        </header>
      )}
      {children}
    </motion.section>
  );
}
