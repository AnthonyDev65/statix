// =====================================================
// Statix - Formateadores
// =====================================================

/** Formatea un número a string con precisión adaptativa */
export function formatNumber(value: number, decimals = 4): string {
  if (!isFinite(value)) return '—';
  if (Number.isInteger(value) && Math.abs(value) < 1e6) return value.toString();
  return value.toFixed(decimals);
}

/** Formatea una probabilidad como porcentaje */
export function formatProbability(p: number, decimals = 4): string {
  if (!isFinite(p)) return '—';
  return `${(p * 100).toFixed(decimals)}%`;
}

/** Formatea un número en notación científica cuando es muy grande o pequeño */
export function formatScientific(value: number, decimals = 3): string {
  if (!isFinite(value) || value === 0) return value.toString();
  if (Math.abs(value) >= 1e-4 && Math.abs(value) < 1e6) {
    return Number(value.toFixed(decimals)).toString();
  }
  return value.toExponential(decimals);
}

/** Truncar decimales sin redondear */
export function truncate(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

/** Formatea una fecha timestamp a texto legible */
export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Capitaliza primera letra */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
