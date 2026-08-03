// =====================================================
// Statix — ModeToggle (Simple / Completo)
// =====================================================
import { LayoutGrid, Rows3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIMode, type UIMode } from '@/context/UIModeContext';

const OPTIONS: Array<{ value: UIMode; label: string; icon: typeof LayoutGrid }> = [
  { value: 'simple', label: 'Simple', icon: Rows3 },
  { value: 'complete', label: 'Completo', icon: LayoutGrid },
];

export function ModeToggle() {
  const { mode, setMode } = useUIMode();

  return (
    <div
      role="group"
      aria-label="Modo de interfaz"
      className="relative hidden items-center rounded-md border border-v0-150/30 bg-v0-50 p-0.5 dark:border-v0-800/30 dark:bg-v0-900 md:inline-flex"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 font-mono text-[11px] font-medium transition-colors duration-200 ${
              active
                ? 'text-v0-950 dark:text-v0-50'
                : 'text-v0-500/70 hover:text-v0-800 dark:text-v0-300/80 dark:hover:text-v0-100'
            }`}
          >
            {active && (
              <motion.span
                layoutId="ui-mode-pill"
                className="absolute inset-0 -z-10 rounded-[5px] bg-v0-100 dark:bg-v0-800"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={12} strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
