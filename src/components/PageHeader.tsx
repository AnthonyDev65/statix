// =====================================================
// Statix — PageHeader (Vercel module header)
// =====================================================
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  actions?: ReactNode;
  status?: { label: string; tone: 'ready' | 'building' | 'shipped' };
}

export function PageHeader({
  title, description, icon: Icon, badge, actions, status,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col gap-6 border-b border-v0-200/30 pb-8 dark:border-v0-800/30 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-v0-200/30 bg-v0-50 transition-colors hover:border-v0-300/60 dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700">
          <Icon size={20} strokeWidth={1.75} className="text-v0-800 dark:text-v0-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[34px] font-semibold leading-none tracking-vercel text-v0-950 dark:text-v0-50 sm:text-[40px]">
              {title}
            </h1>
            {badge && <Pill>{badge}</Pill>}
            {status && <StatusPill {...status} />}
          </div>
          <p className="mt-3.5 max-w-2xl text-balance text-[14.5px] leading-relaxed text-v0-500/70 dark:text-v0-300/80">
            {description}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-v0-200/30 bg-v0-75 px-2 py-0.5 font-mono text-[11px] font-medium text-v0-700 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300">
      {children}
    </span>
  );
}

function StatusPill({
  label, tone,
}: {
  label: string;
  tone: 'ready' | 'building' | 'shipped';
}) {
  const colors: Record<typeof tone, { dot: string; ring: string }> = {
    ready: { dot: 'bg-emerald-500', ring: 'bg-emerald-500/60' },
    building: { dot: 'bg-amber-500', ring: 'bg-amber-500/60' },
    shipped: { dot: 'bg-accent-500', ring: 'bg-accent-500/60' },
  };
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-2.5 py-1 font-mono text-[11px] font-medium text-v0-800 transition-colors dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-200">
      <span className="relative flex h-1.5 w-1.5">
        {tone !== 'shipped' && (
          <span
            className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${colors[tone].ring}`}
          />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${colors[tone].dot}`}
        />
      </span>
      {label}
    </span>
  );
}
