// =====================================================
// Statix - Formateadores
// =====================================================

/** Formatea un número a string con precisión adaptativa */
export function formatNumber(value: number, decimals = 4): string {
  if (!isFinite(value)) return '—';
  if (Number.isInteger(value) && Math.abs(value) < 1e6) return value.toString();
  // Valores minúsculos (colas extremas) no deben mostrarse como "0.0000".
  if (value !== 0 && Math.abs(value) < 0.5 * 10 ** -decimals) {
    return value.toExponential(Math.max(1, decimals - 2));
  }
  return value.toFixed(decimals);
}

/**
 * Traduce una probabilidad a frecuencia esperada en palabras:
 * 0.1916 → "unas 19 de cada 100 veces"; 0.0004 → "unas 4 de cada 10 000 veces".
 */
export function frequencyPhrase(p: number): string {
  if (!isFinite(p) || p < 0) return '';
  if (p === 0) return 'prácticamente nunca';
  if (p >= 0.995) return 'casi siempre';
  let base = 100;
  while (p * base < 1 && base < 1e9) base *= 10;
  const count = Math.round(p * base);
  return `unas ${count.toLocaleString('es-ES')} de cada ${base.toLocaleString('es-ES')} veces`;
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
