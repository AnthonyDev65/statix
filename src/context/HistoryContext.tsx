// =====================================================
// Statix - Contexto de historial de cálculos
// =====================================================
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LIMITS, STORAGE_KEYS } from '@/constants';
import type { DistributionType, HistoryEntry } from '@/types';

interface HistoryContextValue {
  history: HistoryEntry[];
  add: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export function HistoryProvider({ children }: ProviderProps) {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    STORAGE_KEYS.HISTORY,
    [],
  );

  const add = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, LIMITS.MAX_HISTORY));
    },
    [setHistory],
  );

  const remove = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((e) => e.id !== id));
    },
    [setHistory],
  );

  const clear = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const value = useMemo<HistoryContextValue>(
    () => ({ history, add, remove, clear }),
    [history, add, remove, clear],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook junto a su proveedor
export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory debe usarse dentro de <HistoryProvider>');
  return ctx;
}

// Utilidad para agrupar por tipo
// eslint-disable-next-line react-refresh/only-export-components -- utilidad ligada al historial
export function groupByType(
  history: HistoryEntry[],
): Record<DistributionType, HistoryEntry[]> {
  const acc: Record<DistributionType, HistoryEntry[]> = {
    binomial: [],
    hypergeometric: [],
    normal: [],
    estimation: [],
    anova: [],
  };
  for (const entry of history) {
    acc[entry.type].push(entry);
  }
  return acc;
}
