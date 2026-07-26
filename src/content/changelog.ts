// =====================================================
// Statix - Changelog (historial de versiones)
// -----------------------------------------------------
// Registro de cambios mostrado en /changelog. Cada entrada
// agrupa los cambios por tipo. Las fechas son fijas (no se
// calculan en tiempo de ejecución).
// =====================================================

export type ChangeKind = 'added' | 'fixed' | 'changed';

export interface ChangelogEntry {
  version: string;
  date: string;        // ISO o legible
  title: string;
  current?: boolean;   // versión actual
  changes: Array<{ kind: ChangeKind; text: string }>;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-07-26',
    title: 'Módulo ANOVA',
    current: true,
    changes: [
      { kind: 'added', text: 'Módulo ANOVA con análisis de un factor y de dos factores (con y sin repetición).' },
      { kind: 'added', text: 'Editor de datos tipo hoja de cálculo: añade y quita columnas y filas, y encabezados editables.' },
      { kind: 'added', text: 'Tabla ANOVA con valor-p exacto (distribución F), decisión del test y post-hoc Tukey HSD.' },
      { kind: 'added', text: 'Apartado "Cálculo paso a paso" que muestra el desarrollo manual con tus datos.' },
      { kind: 'added', text: 'Documentación teórica completa de ANOVA en /docs y en el buscador (⌘K).' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-19',
    title: 'Teoría, documentación y buscador',
    changes: [
      { kind: 'added', text: 'Sección de Teoría y documentación en cada módulo (qué es, parámetros, fórmulas y ejemplo resuelto).' },
      { kind: 'added', text: 'Página central de Documentación (/docs) con toda la teoría e índice navegable.' },
      { kind: 'added', text: 'Buscador en el encabezado (⌘K) por título y palabras clave de la documentación.' },
      { kind: 'added', text: 'Página de Changelog (/changelog) con el historial de versiones.' },
      { kind: 'fixed', text: 'Los campos numéricos ahora permiten escribir decimales y valores intermedios con el teclado.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-01',
    title: 'Lanzamiento inicial',
    changes: [
      { kind: 'added', text: 'Módulo de distribución Binomial con función de masa, acumulada y estadísticos.' },
      { kind: 'added', text: 'Módulo de distribución Hipergeométrica (muestreo sin reemplazo).' },
      { kind: 'added', text: 'Módulo de distribución Normal con estandarización Z y área bajo la curva.' },
      { kind: 'added', text: 'Módulo de Estimación de parámetros (intervalos de confianza para media y proporción).' },
      { kind: 'added', text: 'Cálculo en vivo, gráficas (Recharts), fórmulas en KaTeX y exportación a PDF.' },
      { kind: 'added', text: 'Historial persistente en localStorage y tema claro/oscuro.' },
    ],
  },
];
