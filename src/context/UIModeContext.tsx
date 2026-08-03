// =====================================================
// Statix - Contexto de modo de interfaz (simple / completo)
// =====================================================
// "simple"   → solo la calculadora (parámetros, resultados y gráfico).
// "complete" → todo: fórmulas, teoría e historial.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/constants';

export type UIMode = 'simple' | 'complete';

interface UIModeContextValue {
  mode: UIMode;
  simpleMode: boolean;
  toggle: () => void;
  setMode: (m: UIMode) => void;
}

const UIModeContext = createContext<UIModeContextValue | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export function UIModeProvider({ children }: ProviderProps) {
  const [mode, setMode] = useLocalStorage<UIMode>(STORAGE_KEYS.UI_MODE, 'complete');

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'simple' ? 'complete' : 'simple'));
  }, [setMode]);

  const value = useMemo<UIModeContextValue>(
    () => ({ mode, simpleMode: mode === 'simple', toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <UIModeContext.Provider value={value}>{children}</UIModeContext.Provider>;
}

export function useUIMode(): UIModeContextValue {
  const ctx = useContext(UIModeContext);
  if (!ctx) throw new Error('useUIMode debe usarse dentro de <UIModeProvider>');
  return ctx;
}
