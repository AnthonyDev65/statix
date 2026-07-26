// =====================================================
// Statix - Definiciones de fórmulas (LaTeX)
// =====================================================

export interface FormulaDef {
  id: string;
  label: string;
  latex: string;
  description: string;
}

export const BINOMIAL_FORMULAS: FormulaDef[] = [
  {
    id: 'pmf',
    label: 'Función de Masa de Probabilidad',
    latex: 'P(X = x) = \\binom{n}{x} p^{x} (1-p)^{n-x}',
    description: 'Probabilidad de obtener exactamente x éxitos en n ensayos.',
  },
  {
    id: 'cdf',
    label: 'Función de Distribución Acumulada',
    latex: 'P(X \\le x) = \\sum_{k=0}^{x} \\binom{n}{k} p^{k} (1-p)^{n-k}',
    description: 'Probabilidad de obtener a lo sumo x éxitos.',
  },
  {
    id: 'mean',
    label: 'Valor Esperado',
    latex: 'E[X] = n \\cdot p',
    description: 'Número esperado de éxitos en n ensayos.',
  },
  {
    id: 'variance',
    label: 'Varianza',
    latex: '\\mathrm{Var}(X) = n \\cdot p \\cdot (1-p)',
    description: 'Medida de dispersión alrededor de la media.',
  },
  {
    id: 'std',
    label: 'Desviación Estándar',
    latex: '\\sigma = \\sqrt{n \\cdot p \\cdot (1-p)}',
    description: 'Raíz cuadrada de la varianza.',
  },
];

export const HYPERGEOMETRIC_FORMULAS: FormulaDef[] = [
  {
    id: 'pmf',
    label: 'Función de Masa de Probabilidad',
    latex:
      'P(X = x) = \\dfrac{\\binom{K}{x}\\binom{N-K}{n-x}}{\\binom{N}{n}}',
    description: 'Probabilidad de observar x éxitos en una muestra sin reemplazo.',
  },
  {
    id: 'mean',
    label: 'Valor Esperado',
    latex: 'E[X] = n \\cdot \\dfrac{K}{N}',
    description: 'Número esperado de éxitos en la muestra.',
  },
  {
    id: 'variance',
    label: 'Varianza',
    latex:
      '\\mathrm{Var}(X) = n \\cdot \\dfrac{K}{N} \\cdot \\dfrac{N-K}{N} \\cdot \\dfrac{N-n}{N-1}',
    description: 'Varianza con factor de corrección por población finita.',
  },
];

export const NORMAL_FORMULAS: FormulaDef[] = [
  {
    id: 'pdf',
    label: 'Función de Densidad',
    latex:
      'f(x) = \\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\, e^{-\\tfrac{1}{2}\\left(\\tfrac{x-\\mu}{\\sigma}\\right)^{2}}',
    description: 'Densidad de probabilidad de la distribución normal.',
  },
  {
    id: 'z',
    label: 'Estandarización (Z-Score)',
    latex: 'Z = \\dfrac{x - \\mu}{\\sigma}',
    description: 'Número de desviaciones estándar que x se aparta de la media.',
  },
  {
    id: 'cdf',
    label: 'Probabilidad Acumulada',
    latex: 'P(X \\le x) = \\Phi\\!\\left(\\dfrac{x - \\mu}{\\sigma}\\right)',
    description: 'Función de distribución acumulada estándar.',
  },
];

export const ESTIMATION_FORMULAS: FormulaDef[] = [
  {
    id: 'mean-se',
    label: 'Error Estándar de la Media',
    latex: 'SE_{\\bar{x}} = \\dfrac{s}{\\sqrt{n}}',
    description: 'Dispersión estimada del estimador de la media.',
  },
  {
    id: 'mean-me',
    label: 'Margen de Error',
    latex: 'E = z_{\\alpha/2} \\cdot \\dfrac{s}{\\sqrt{n}}',
    description: 'Mitad del ancho del intervalo de confianza.',
  },
  {
    id: 'mean-ic',
    label: 'Intervalo de Confianza para la Media',
    latex: 'IC = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\dfrac{s}{\\sqrt{n}}',
    description: 'Rango donde se encuentra el verdadero valor de la media con la confianza dada.',
  },
  {
    id: 'prop-se',
    label: 'Error Estándar de la Proporción',
    latex: 'SE_{\\hat{p}} = \\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}',
    description: 'Dispersión estimada del estimador de la proporción.',
  },
  {
    id: 'prop-ic',
    label: 'Intervalo de Confianza para la Proporción',
    latex: 'IC = \\hat{p} \\pm z_{\\alpha/2} \\cdot \\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}',
    description: 'Rango donde se encuentra la verdadera proporción poblacional.',
  },
];

export const ANOVA_FORMULAS: FormulaDef[] = [
  {
    id: 'ss-between',
    label: 'Suma de Cuadrados Entre Grupos',
    latex: 'SC_{entre} = \\sum_{j=1}^{k} n_j\\,(\\bar{x}_j - \\bar{x})^{2}',
    description: 'Variabilidad explicada por las diferencias entre las medias de los grupos.',
  },
  {
    id: 'ss-within',
    label: 'Suma de Cuadrados Dentro',
    latex: 'SC_{dentro} = \\sum_{j=1}^{k} \\sum_{i=1}^{n_j} (x_{ij} - \\bar{x}_j)^{2}',
    description: 'Variabilidad no explicada (dentro de cada grupo), la componente de error.',
  },
  {
    id: 'ms',
    label: 'Cuadrados Medios',
    latex: 'CM = \\dfrac{SC}{gl} \\qquad CM_{entre}=\\dfrac{SC_{entre}}{k-1}, \\;\\; CM_{dentro}=\\dfrac{SC_{dentro}}{N-k}',
    description: 'Cada suma de cuadrados dividida entre sus grados de libertad.',
  },
  {
    id: 'f',
    label: 'Estadístico F',
    latex: 'F = \\dfrac{CM_{entre}}{CM_{dentro}}',
    description: 'Razón de varianzas. Grande cuando las medias difieren más que el ruido interno.',
  },
  {
    id: 'ss-total',
    label: 'Identidad de la Suma de Cuadrados',
    latex: 'SC_{total} = SC_{entre} + SC_{dentro}',
    description: 'La variabilidad total se descompone en explicada más error.',
  },
  {
    id: 'tukey',
    label: 'Tukey HSD',
    latex: 'HSD = q_{\\alpha,\\,k,\\,gl_{error}} \\cdot \\sqrt{\\dfrac{CM_{error}}{2}\\left(\\dfrac{1}{n_i}+\\dfrac{1}{n_j}\\right)}',
    description: 'Umbral de diferencia significativa entre pares de medias tras rechazar H₀.',
  },
];
