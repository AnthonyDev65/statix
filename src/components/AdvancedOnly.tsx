// =====================================================
// Statix — AdvancedOnly
// =====================================================
// Oculta su contenido cuando la interfaz está en "modo simple".
// Se usa para envolver fórmulas, teoría e historial: piezas de
// referencia que no forman parte de la calculadora en sí.
import type { ReactNode } from 'react';
import { useUIMode } from '@/context/UIModeContext';

export function AdvancedOnly({ children }: { children: ReactNode }) {
  const { simpleMode } = useUIMode();
  if (simpleMode) return null;
  return <>{children}</>;
}
