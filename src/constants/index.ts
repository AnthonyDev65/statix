// =====================================================
// Statix - Constantes de la aplicación
// =====================================================
import type { DistributionType } from '@/types';

export const APP_NAME = 'Statix';
export const APP_TAGLINE = 'Aprende estadística resolviendo problemas reales';
export const APP_DESCRIPTION =
  'Software académico de precisión para distribuciones de probabilidad, estimación de parámetros y análisis estadístico inferencial.';

// -----------------------------------------------------
// Navegación
// -----------------------------------------------------
export type NavGroup = 'probabilidad' | 'inferencia';

export interface NavItem {
  id: DistributionType;
  label: string;
  /** Nombre corto para la navegación lateral. */
  short: string;
  description: string;
  /** La pregunta que resuelve el módulo, en palabras de quien la tiene. */
  question: string;
  notation: string;
  group: NavGroup;
  path: string;
  icon: string; // nombre del icono de lucide-react
}

export const NAV_GROUPS: Array<{ id: NavGroup; label: string }> = [
  { id: 'probabilidad', label: 'Probabilidad' },
  { id: 'inferencia', label: 'Inferencia' },
];

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'binomial',
    label: 'Distribución Binomial',
    short: 'Binomial',
    description: 'Ensayos independientes con probabilidad constante',
    question: '¿Cuántos éxitos en n intentos independientes?',
    notation: 'B(n, p)',
    group: 'probabilidad',
    path: '/binomial',
    icon: 'Sigma',
  },
  {
    id: 'hypergeometric',
    label: 'Distribución Hipergeométrica',
    short: 'Hipergeométrica',
    description: 'Muestreo sin reemplazo de una población finita',
    question: '¿Cuántos defectuosos si saco una muestra sin devolverla?',
    notation: 'H(N, K, n)',
    group: 'probabilidad',
    path: '/hypergeometric',
    icon: 'Layers',
  },
  {
    id: 'normal',
    label: 'Distribución Normal',
    short: 'Normal',
    description: 'Variable continua con curva de campana',
    question: '¿Qué tan probable es un valor por encima o por debajo de x?',
    notation: 'N(μ, σ²)',
    group: 'probabilidad',
    path: '/normal',
    icon: 'Activity',
  },
  {
    id: 'estimation',
    label: 'Estimación de Parámetros',
    short: 'Intervalos de confianza',
    description: 'Intervalos de confianza para media y proporción',
    question: '¿Entre qué valores está la media real de la población?',
    notation: 'x̄ ± t·s/√n',
    group: 'inferencia',
    path: '/estimation',
    icon: 'Target',
  },
  {
    id: 'anova',
    label: 'ANOVA',
    short: 'ANOVA',
    description: 'Análisis de la varianza para uno y dos factores',
    question: '¿Las medias de varios grupos son realmente distintas?',
    notation: 'F = MCE / MCD',
    group: 'inferencia',
    path: '/anova',
    icon: 'TableProperties',
  },
];

// -----------------------------------------------------
// Niveles de confianza típicos
// -----------------------------------------------------
export const CONFIDENCE_LEVELS: Array<{ value: number; label: string; z: number }> = [
  { value: 0.80, label: '80 %', z: 1.2816 },
  { value: 0.90, label: '90 %', z: 1.6449 },
  { value: 0.95, label: '95 %', z: 1.9600 },
  { value: 0.98, label: '98 %', z: 2.3263 },
  { value: 0.99, label: '99 %', z: 2.5758 },
  { value: 0.999, label: '99.9 %', z: 3.2905 },
];

// -----------------------------------------------------
// Constantes matemáticas
// -----------------------------------------------------
export const SQRT_2PI = Math.sqrt(2 * Math.PI);
export const LN_SQRT_2PI = Math.log(SQRT_2PI);

// -----------------------------------------------------
// LocalStorage keys
// -----------------------------------------------------
export const STORAGE_KEYS = {
  THEME: 'statix:theme',
  HISTORY: 'statix:history',
  UI_MODE: 'statix:ui-mode',
} as const;

// -----------------------------------------------------
// Límites
// -----------------------------------------------------
export const LIMITS = {
  MAX_HISTORY: 25,
  MAX_BINOMIAL_N: 10000,
  MAX_HYPERGEOM_N: 5000,
  NORMAL_RESOLUTION: 240, // puntos para curva
} as const;
