// =====================================================
// Statix — Colores de los gráficos (paleta Vercel)
// Negro/blanco para la serie, azul #0070F3 para el área calculada.
// =====================================================
export function chartColors(isDark: boolean) {
  return {
    grid: isDark ? '#262626' : '#EAEAEA',
    tick: isDark ? '#A3A3A3' : '#525252',
    /** Serie destacada: el valor que pidió el usuario. */
    accent: isDark ? '#FAFAFA' : '#0A0A0A',
    /** Resto de la serie. */
    subtle: isDark ? '#404040' : '#D4D4D4',
    /** Área bajo la curva = probabilidad calculada. */
    area: '#0070F3',
    ref: isDark ? '#404040' : '#D4D4D4',
    cursor: isDark ? '#171717' : '#F5F5F5',
    tooltipBg: isDark ? '#0A0A0A' : '#FFFFFF',
    tooltipText: isDark ? '#FAFAFA' : '#0A0A0A',
    tooltipShadow: '0 0 0 1px rgb(0 0 0 / 0.06), 0 4px 12px -2px rgb(0 0 0 / 0.12)',
  };
}
