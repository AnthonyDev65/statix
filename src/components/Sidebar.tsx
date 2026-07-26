// =====================================================
// Statix — Sidebar (Vercel project nav)
// =====================================================
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  GitCommitVertical,
  Layers,
  Sigma,
  Target,
  TableProperties,
  X,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { NAV_ITEMS } from '@/constants';
import type { DistributionType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  Sigma, Layers, Activity, Target, TableProperties,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-v0-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-v0-150/30 bg-v0-50 transition-transform duration-300 ease-out dark:border-v0-800/30 dark:bg-v0-950 lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:self-start lg:overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera (mobile) */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-v0-150/30 px-5 dark:border-v0-800/30 lg:hidden">
          <span className="text-[15px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
            Statix
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-v0-500/70 transition-all duration-200 hover:bg-v0-75 hover:text-v0-900 active:scale-95 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100"
            aria-label="Cerrar menú"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Project switcher */}
        <div className="hidden flex-shrink-0 border-b border-v0-150/30 p-4 dark:border-v0-800/30 lg:block">
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-md border border-v0-150/30 bg-v0-50 px-3 py-2.5 text-left transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 active:scale-[0.99] dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700 dark:hover:bg-v0-800/60"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-v0-950 font-mono text-[11px] font-semibold text-v0-50 dark:bg-v0-50 dark:text-v0-950">
              S
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-v0-950 dark:text-v0-50">
                estadística-2026
              </p>
              <p className="font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
                Hobby · Free
              </p>
            </div>
            <ChevronRight
              size={13}
              strokeWidth={1.75}
              className="text-v0-400/70 transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-v0-400/70 dark:text-v0-500/70">
            Modules
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = ICONS[item.icon] ?? Activity;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-all duration-150 ${
                        isActive
                          ? 'bg-v0-100 text-v0-950 dark:bg-v0-900 dark:text-v0-50'
                          : 'text-v0-600 hover:bg-v0-75 hover:text-v0-950 dark:text-v0-300/80 dark:hover:bg-v0-900/60 dark:hover:text-v0-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-v0-950 dark:bg-v0-50"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <Icon
                          size={14}
                          strokeWidth={1.75}
                          className={
                            isActive
                              ? 'text-v0-950 dark:text-v0-50'
                              : 'text-v0-400/70 dark:text-v0-500/70 group-hover:text-v0-700 dark:group-hover:text-v0-200'
                          }
                        />
                        <span className="flex-1 truncate font-medium">
                          {item.label}
                        </span>
                        <span
                          className={`font-mono text-[10.5px] tabular-nums ${
                            isActive
                              ? 'text-v0-500/70 dark:text-v0-300/80'
                              : 'text-v0-300 dark:text-v0-600'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <p className="mb-2 mt-6 px-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-v0-400/70 dark:text-v0-500/70">
            Resources
          </p>
          <ul className="space-y-0.5">
            <ResourceLink to="/docs" icon={BookOpen} label="Documentación" badge="docs" onClose={onClose} />
            <ResourceLink to="/changelog" icon={GitCommitVertical} label="Changelog" badge="v1.2" onClose={onClose} />
          </ul>
        </nav>

        {/* Footer con status */}
        <div className="flex-shrink-0 border-t border-v0-150/30 px-4 py-3 dark:border-v0-800/30">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70 dark:text-v0-500/70">
              status
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] font-medium text-v0-700 dark:text-v0-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Operational
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between px-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70 dark:text-v0-500/70">
              region
            </span>
            <span className="font-mono text-[10.5px] text-v0-600 dark:text-v0-300">
              eu-west-1
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

function ResourceLink({
  to, icon: Icon, label, badge, onClose,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  badge: string;
  onClose: () => void;
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-all duration-150 ${
            isActive
              ? 'bg-v0-100 text-v0-950 dark:bg-v0-900 dark:text-v0-50'
              : 'text-v0-500/70 hover:bg-v0-75 hover:text-v0-900 dark:text-v0-300/80 dark:hover:bg-v0-900/60 dark:hover:text-v0-100'
          }`
        }
      >
        <Icon size={13} strokeWidth={1.75} className="text-v0-400/70 dark:text-v0-500/70 group-hover:text-v0-700 dark:group-hover:text-v0-200" />
        <span className="flex-1 font-medium">{label}</span>
        <span className="rounded-md border border-v0-150/30 px-1.5 py-px font-mono text-[10px] text-v0-400/70 dark:border-v0-800/30 dark:text-v0-500/70">
          {badge}
        </span>
      </NavLink>
    </li>
  );
}

export type SidebarDistribution = DistributionType;
