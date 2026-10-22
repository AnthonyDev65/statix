// =====================================================
// Statix — ModeToggle (Simple / Completo)
// =====================================================
import { LayoutGrid, Rows3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIMode, type UIMode } from '@/context/UIModeContext';

// "Calcular" muestra solo datos y resultados; "Aprender" añade fórmulas,
// teoría paso a paso e historial.
const OPTIONS: Array<{ value: UIMode; label: string; hint: string; icon: typeof LayoutGrid }> = [
  { value: 'simple', label: 'Calcular', hint: 'Solo datos y resultados', icon: Rows3 },
  { value: 'complete', label: 'Aprender', hint: 'Con fórmulas, teoría e historial', icon: LayoutGrid },
];

export function ModeToggle() {
  const { mode, setMode } = useUIMode();

  return (
    <div
      role="group"
      aria-label="Modo de interfaz"
      className="relative hidden items-center rounded-md border border-v0-150 bg-v0-50 p-0.5 dark:border-v0-800 dark:bg-v0-900 md:inline-flex"
    >
      {OPTIONS.map(({ value, label, hint, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            title={hint}
            className={`relative z-10 inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-[14px] font-medium transition-colors duration-200 ${
              active
                ? 'text-v0-950 dark:text-v0-50'
                : 'text-v0-600 hover:text-v0-900 dark:text-v0-300 dark:hover:text-v0-50'
            }`}
          >
            {active && (
              <motion.span
                layoutId="ui-mode-pill"
                className="absolute inset-0 -z-10 rounded-[5px] bg-v0-100 dark:bg-v0-800"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
