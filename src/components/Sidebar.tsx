// =====================================================
// Statix — Sidebar
// Módulos agrupados por tema; recursos de aprendizaje al final.
// =====================================================
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  History,
  Home,
  Layers,
  Sigma,
  Target,
  TableProperties,
  X,
  type LucideIcon,
} from 'lucide-react';
import { APP_NAME, NAV_GROUPS, NAV_ITEMS } from '@/constants';
import type { DistributionType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modo simple: el sidebar se colapsa por completo (off-canvas en todos los tamaños). */
  collapsed?: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  Sigma, Layers, Activity, Target, TableProperties,
};

export function Sidebar({ isOpen, onClose, collapsed = false }: SidebarProps) {
  // En modo colapsado el sidebar deja de ser un rail fijo y solo aparece
  // como panel superpuesto (overlay) al abrirlo desde el botón de menú.
  const railClasses = collapsed
    ? ''
    : 'lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100dvh-4rem)] lg:translate-x-0 lg:self-start lg:overflow-y-auto lg:border-r lg:border-v0-150 lg:bg-v0-50 lg:shadow-none lg:dark:border-v0-800 lg:dark:bg-v0-950';
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-40 bg-v0-950/50 ${collapsed ? '' : 'lg:hidden'}`}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-v0 transition-transform duration-300 ease-out dark:bg-v0-900 ${
          isOpen ? 'translate-x-0 shadow-float' : '-translate-x-full'
        } ${railClasses}`}
      >
        <div
          className={`flex h-16 flex-shrink-0 items-center justify-between px-5 ${
            collapsed ? '' : 'lg:hidden'
          }`}
        >
          <span className="text-[17px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
            {APP_NAME}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-v0-600 transition-colors hover:bg-v0-100 hover:text-v0-900 active:scale-95 dark:text-v0-300 dark:hover:bg-v0-800 dark:hover:text-v0-50"
            aria-label="Cerrar menú"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6 pt-4 lg:pt-6">
          <ul className="space-y-0.5">
            <NavItemLink to="/" end icon={Home} label="Inicio" onClose={onClose} />
          </ul>

          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="mt-6">
              <p className="mb-1.5 px-3 text-[13px] font-medium text-v0-600 dark:text-v0-300">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {NAV_ITEMS.filter((i) => i.group === group.id).map((item) => (
                  <NavItemLink
                    key={item.id}
                    to={item.path}
                    icon={ICONS[item.icon] ?? Activity}
                    label={item.short}
                    onClose={onClose}
                  />
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-6">
            <p className="mb-1.5 px-3 text-[13px] font-medium text-v0-600 dark:text-v0-300">
              Aprender
            </p>
            <ul className="space-y-0.5">
              <NavItemLink to="/docs" icon={BookOpen} label="Teoría y fórmulas" onClose={onClose} />
              <NavItemLink to="/changelog" icon={History} label="Novedades" onClose={onClose} />
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItemLink({
  to, icon: Icon, label, onClose, end = false,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  onClose: () => void;
  end?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex min-h-[40px] items-center gap-3 rounded-md px-3 text-[15px] transition-colors duration-150 ${
            isActive
              ? 'bg-v0-100 font-semibold text-v0-950 dark:bg-v0-800 dark:text-v0-50'
              : 'font-medium text-v0-700 hover:bg-v0-100 hover:text-v0-950 dark:text-v0-200 dark:hover:bg-v0-800 dark:hover:text-v0-50'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={16}
              strokeWidth={1.75}
              className={
                isActive
                  ? 'text-v0-950 dark:text-v0-50'
                  : 'text-v0-500 group-hover:text-v0-800 dark:text-v0-300 dark:group-hover:text-v0-100'
              }
            />
            <span className="flex-1 truncate">{label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export type SidebarDistribution = DistributionType;
