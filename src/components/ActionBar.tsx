// =====================================================
// Statix — ActionBar
// Una acción principal (Calcular) y dos secundarias en texto.
// =====================================================
import { Eraser, FlaskConical, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ActionBarProps {
  onExample?: () => void;
  onReset?: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  extra?: ReactNode;
}

const secondary =
  'inline-flex h-11 items-center gap-2 rounded-md px-3.5 text-[15px] font-medium text-v0-700 transition-colors hover:bg-v0-100 hover:text-v0-950 active:scale-[0.98] dark:text-v0-200 dark:hover:bg-v0-800 dark:hover:text-v0-50';

export function ActionBar({
  onExample, onReset, onSubmit, isLoading = false,
  submitLabel = 'Calcular', extra,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        aria-busy={isLoading}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-v0-950 px-5 text-[15px] font-semibold text-v0-50 transition-[background-color,transform] duration-150 hover:bg-v0-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Calculando…
          </>
        ) : (
          submitLabel
        )}
      </button>
      {onExample && (
        <button type="button" onClick={onExample} className={secondary}>
          <FlaskConical size={16} strokeWidth={1.75} aria-hidden="true" />
          Cargar ejemplo
        </button>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className={secondary}>
          <Eraser size={16} strokeWidth={1.75} aria-hidden="true" />
          Limpiar
        </button>
      )}
      {extra}
    </div>
  );
}
