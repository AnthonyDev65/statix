// =====================================================
// Statix - Constantes de la aplicación
// =====================================================
import type { DistributionType } from '@/types';

export const APP_NAME = 'Statix';
export const APP_TAGLINE = 'Calculadora Profesional de Estadística y Probabilidad';
export const APP_DESCRIPTION =
  'Software académico de precisión para distribuciones de probabilidad, estimación de parámetros y análisis estadístico inferencial.';

// -----------------------------------------------------
// Navegación
// -----------------------------------------------------
export interface NavItem {
  id: DistributionType;
  label: string;
  description: string;
  path: string;
  icon: string; // nombre del icono de lucide-react
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'binomial',
    label: 'Distribución Binomial',
    description: 'Ensayos independientes con probabilidad constante',
    path: '/binomial',
    icon: 'Sigma',
  },
  {
    id: 'hypergeometric',
    label: 'Distribución Hipergeométrica',
    description: 'Muestreo sin reemplazo de una población finita',
    path: '/hypergeometric',
    icon: 'Layers',
  },
  {
    id: 'normal',
    label: 'Distribución Normal',
    description: 'Variable continua con curva de campana',
    path: '/normal',
    icon: 'Activity',
  },
  {
    id: 'estimation',
    label: 'Estimación de Parámetros',
    description: 'Intervalos de confianza para media y proporción',
    path: '/estimation',
    icon: 'Target',
  },
  {
    id: 'anova',
    label: 'ANOVA',
    description: 'Análisis de la varianza para uno y dos factores',
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
