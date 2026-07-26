// =====================================================
// Statix - Documentación / Teoría de los módulos
// -----------------------------------------------------
// Contenido educativo estructurado y BUSCABLE. Cada artículo
// pertenece a un módulo y expone `keywords` para el buscador
// del header. El texto admite matemática en línea con $...$
// (se renderiza con KaTeX en <MathText />).
// =====================================================
import type { DistributionType } from '@/types';

/** Parámetro de entrada explicado en detalle */
export interface TheoryParam {
  symbol: string;       // 'n', 'p', 'μ'…
  name: string;         // nombre legible
  description: string;  // qué representa (admite $...$)
  constraint?: string;  // restricción/dominio
}

/** Bloques de contenido (unión discriminada) */
export type TheoryBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'formula'; latex: string; caption?: string }
  | { kind: 'params'; items: TheoryParam[] }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'callout'; tone: 'tip' | 'warning' | 'note'; title?: string; text: string }
  | { kind: 'example'; statement: string; steps: string[]; result: string };

/** Artículo de teoría (unidad buscable y enlazable por ancla) */
export interface TheoryArticle {
  id: string;                  // ancla para el scroll, ej: 'binomial-que-es'
  moduleId: DistributionType;
  title: string;
  summary: string;             // resumen corto (se muestra en el buscador)
  keywords: string[];          // términos para la búsqueda
  blocks: TheoryBlock[];
}

export interface TheoryModule {
  id: DistributionType;
  label: string;
  path: string;
  tagline: string;
  articles: TheoryArticle[];
}

// =====================================================
// BINOMIAL
// =====================================================
const BINOMIAL: TheoryModule = {
  id: 'binomial',
  label: 'Distribución Binomial',
  path: '/binomial',
  tagline: 'Cuenta éxitos en n ensayos independientes con probabilidad constante.',
  articles: [
    {
      id: 'binomial-que-es',
      moduleId: 'binomial',
      title: '¿Qué es la distribución binomial?',
      summary: 'Modela el número de éxitos en n ensayos independientes con probabilidad fija p.',
      keywords: ['binomial', 'qué es', 'definición', 'éxito', 'fracaso', 'bernoulli', 'ensayos', 'discreta'],
      blocks: [
        {
          kind: 'paragraph',
          text: 'La distribución **binomial** describe un experimento que se repite un número fijo de veces y en el que cada repetición (llamada *ensayo de Bernoulli*) solo puede terminar en uno de dos resultados: **éxito** o **fracaso**. La variable aleatoria $X$ cuenta cuántos éxitos ocurren en total.',
        },
        {
          kind: 'paragraph',
          text: 'Es una distribución **discreta**: $X$ solo puede tomar valores enteros $0, 1, 2, \\dots, n$. Por ejemplo, el número de caras al lanzar una moneda 10 veces, o el número de piezas defectuosas en un lote de 50.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Las 4 condiciones (regla BINS)',
          text: 'Se usa la binomial cuando: (1) hay un número **fijo** de ensayos $n$; (2) cada ensayo tiene solo **dos** resultados; (3) los ensayos son **independientes**; y (4) la probabilidad de éxito $p$ es **constante** en todos ellos.',
        },
      ],
    },
    {
      id: 'binomial-parametros',
      moduleId: 'binomial',
      title: 'Parámetros de la binomial (n, p, x)',
      summary: 'n = ensayos, p = probabilidad de éxito, x = éxitos a evaluar.',
      keywords: ['parámetros', 'n', 'p', 'x', 'ensayos', 'probabilidad', 'éxitos', 'binomial'],
      blocks: [
        {
          kind: 'params',
          items: [
            { symbol: 'n', name: 'Número de ensayos', description: 'Cuántas veces se repite el experimento. Es un valor fijo decidido de antemano.', constraint: 'entero $\\ge 1$' },
            { symbol: 'p', name: 'Probabilidad de éxito', description: 'Probabilidad de que un ensayo individual sea un éxito. Es la misma en cada ensayo.', constraint: '$0 \\le p \\le 1$' },
            { symbol: 'x', name: 'Número de éxitos', description: 'El valor concreto cuya probabilidad quieres calcular, p. ej. $P(X = x)$.', constraint: 'entero $0 \\le x \\le n$' },
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          text: 'La probabilidad de **fracaso** se suele llamar $q = 1 - p$. Identifícala bien: en "el 30% pasa la prueba", el éxito es pasar, $p = 0.3$ y $q = 0.7$.',
        },
      ],
    },
    {
      id: 'binomial-formulas',
      moduleId: 'binomial',
      title: 'Fórmulas de la binomial',
      summary: 'PMF, acumulada, media n·p y varianza n·p·(1-p).',
      keywords: ['fórmula', 'pmf', 'función de masa', 'media', 'esperanza', 'varianza', 'desviación', 'combinatorio', 'binomial'],
      blocks: [
        { kind: 'paragraph', text: 'La probabilidad de obtener **exactamente** $x$ éxitos se calcula con la *función de masa de probabilidad* (PMF):' },
        { kind: 'formula', latex: 'P(X = x) = \\binom{n}{x}\\, p^{x}\\,(1-p)^{\\,n-x}', caption: 'El término $\\binom{n}{x}=\\frac{n!}{x!(n-x)!}$ cuenta de cuántas formas pueden ordenarse los x éxitos.' },
        { kind: 'paragraph', text: 'Para "como máximo $x$ éxitos" se suman las probabilidades desde 0 hasta $x$ (función acumulada):' },
        { kind: 'formula', latex: 'P(X \\le x) = \\sum_{k=0}^{x} \\binom{n}{k} p^{k}(1-p)^{n-k}' },
        { kind: 'paragraph', text: 'La media (valor esperado), la varianza y la desviación estándar resumen la distribución:' },
        { kind: 'formula', latex: 'E[X] = n\\,p \\qquad \\mathrm{Var}(X) = n\\,p\\,(1-p) \\qquad \\sigma = \\sqrt{n\\,p\\,(1-p)}' },
      ],
    },
    {
      id: 'binomial-ejemplo',
      moduleId: 'binomial',
      title: 'Cómo resolver un ejercicio binomial',
      summary: 'Procedimiento paso a paso con un ejemplo resuelto.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'cómo calcular', 'binomial'],
      blocks: [
        {
          kind: 'list',
          ordered: true,
          items: [
            'Identifica el **éxito** y calcula $p$ (y $q = 1-p$).',
            'Determina $n$ (número de ensayos) y el valor $x$ que pide el problema.',
            'Decide qué probabilidad necesitas: exacta $P(X=x)$, acumulada $P(X\\le x)$ o $P(X \\ge x)$.',
            'Sustituye en la fórmula correspondiente (o introduce los datos en la calculadora).',
          ],
        },
        {
          kind: 'example',
          statement: 'Una máquina produce 30% de piezas defectuosas. Si se toman 20 piezas, ¿cuál es la probabilidad de que exactamente 6 sean defectuosas?',
          steps: [
            'Éxito = pieza defectuosa, por lo tanto $p = 0.30$ y $q = 0.70$.',
            'Datos: $n = 20$, $x = 6$.',
            'Se pide la probabilidad exacta: $P(X = 6) = \\binom{20}{6}(0.30)^{6}(0.70)^{14}$.',
            'Evaluando: $\\binom{20}{6} = 38760$.',
          ],
          result: 'P(X = 6) ≈ 0.1916  (19.16%). Media E[X] = 20·0.3 = 6 piezas.',
        },
      ],
    },
  ],
};

// =====================================================
// HIPERGEOMÉTRICA
// =====================================================
const HYPERGEOMETRIC: TheoryModule = {
  id: 'hypergeometric',
  label: 'Distribución Hipergeométrica',
  path: '/hypergeometric',
  tagline: 'Éxitos en una muestra tomada SIN reemplazo de una población finita.',
  articles: [
    {
      id: 'hyper-que-es',
      moduleId: 'hypergeometric',
      title: '¿Qué es la distribución hipergeométrica?',
      summary: 'Cuenta éxitos al extraer una muestra sin reemplazo de una población finita.',
      keywords: ['hipergeométrica', 'qué es', 'definición', 'sin reemplazo', 'población finita', 'muestreo', 'discreta'],
      blocks: [
        {
          kind: 'paragraph',
          text: 'La distribución **hipergeométrica** modela el número de éxitos $X$ cuando se extrae una muestra de tamaño $n$ **sin reemplazo** de una población finita de tamaño $N$ que contiene exactamente $K$ éxitos.',
        },
        {
          kind: 'paragraph',
          text: 'Como cada elemento extraído **no se devuelve**, la probabilidad de éxito **cambia** en cada extracción. Esa es la diferencia esencial con la binomial.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '¿Binomial o hipergeométrica?',
          text: 'Si el muestreo es **con reemplazo** (o la población es enorme) → binomial. Si es **sin reemplazo** de una población finita → hipergeométrica. Regla práctica: si $n$ es menor al 5% de $N$, la binomial es una buena aproximación.',
        },
      ],
    },
    {
      id: 'hyper-parametros',
      moduleId: 'hypergeometric',
      title: 'Parámetros (N, K, n, x)',
      summary: 'N = población, K = éxitos en la población, n = muestra, x = éxitos observados.',
      keywords: ['parámetros', 'N', 'K', 'n', 'x', 'población', 'muestra', 'hipergeométrica'],
      blocks: [
        {
          kind: 'params',
          items: [
            { symbol: 'N', name: 'Tamaño de la población', description: 'Total de elementos disponibles (p. ej. 52 cartas, 200 tornillos).', constraint: 'entero $\\ge 1$' },
            { symbol: 'K', name: 'Éxitos en la población', description: 'Cuántos elementos de la población son del tipo "éxito" (p. ej. 4 ases, 12 defectuosos).', constraint: '$0 \\le K \\le N$' },
            { symbol: 'n', name: 'Tamaño de la muestra', description: 'Cuántos elementos se extraen, todos a la vez o sin reposición.', constraint: '$1 \\le n \\le N$' },
            { symbol: 'x', name: 'Éxitos observados', description: 'Número de éxitos en la muestra cuya probabilidad se evalúa.', constraint: '$\\max(0,\\,n-(N-K)) \\le x \\le \\min(n,K)$' },
          ],
        },
      ],
    },
    {
      id: 'hyper-formulas',
      moduleId: 'hypergeometric',
      title: 'Fórmulas de la hipergeométrica',
      summary: 'PMF con combinatorios, media n·K/N y varianza con corrección finita.',
      keywords: ['fórmula', 'pmf', 'media', 'varianza', 'factor de corrección', 'combinatorio', 'hipergeométrica'],
      blocks: [
        { kind: 'paragraph', text: 'La probabilidad de obtener exactamente $x$ éxitos combina tres números combinatorios:' },
        { kind: 'formula', latex: 'P(X = x) = \\dfrac{\\dbinom{K}{x}\\dbinom{N-K}{\\,n-x\\,}}{\\dbinom{N}{n}}', caption: 'Formas de elegir x éxitos × formas de elegir el resto de fracasos, entre todas las muestras posibles.' },
        { kind: 'paragraph', text: 'La media se parece a la binomial usando la proporción de éxitos $K/N$. La varianza incluye un **factor de corrección por población finita** $\\frac{N-n}{N-1}$:' },
        { kind: 'formula', latex: 'E[X] = n\\,\\dfrac{K}{N} \\qquad \\mathrm{Var}(X) = n\\,\\dfrac{K}{N}\\Big(1-\\dfrac{K}{N}\\Big)\\dfrac{N-n}{N-1}' },
      ],
    },
    {
      id: 'hyper-ejemplo',
      moduleId: 'hypergeometric',
      title: 'Ejemplo resuelto (hipergeométrica)',
      summary: 'Cartas: probabilidad de obtener ases sin reemplazo.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'cartas', 'hipergeométrica'],
      blocks: [
        {
          kind: 'example',
          statement: 'De una baraja de 52 cartas se reparten 5. ¿Cuál es la probabilidad de obtener exactamente 2 ases?',
          steps: [
            'Población: $N = 52$. Éxitos en la población: $K = 4$ ases.',
            'Muestra: $n = 5$ cartas. Éxitos buscados: $x = 2$.',
            'Aplicamos la PMF: $P(X=2) = \\dfrac{\\binom{4}{2}\\binom{48}{3}}{\\binom{52}{5}}$.',
            '$\\binom{4}{2}=6$, $\\binom{48}{3}=17296$, $\\binom{52}{5}=2598960$.',
          ],
          result: 'P(X = 2) = (6 · 17296) / 2598960 ≈ 0.0399  (3.99%).',
        },
      ],
    },
  ],
};

// =====================================================
// NORMAL
// =====================================================
const NORMAL: TheoryModule = {
  id: 'normal',
  label: 'Distribución Normal',
  path: '/normal',
  tagline: 'Variable continua con forma de campana, definida por su media y desviación.',
  articles: [
    {
      id: 'normal-que-es',
      moduleId: 'normal',
      title: '¿Qué es la distribución normal?',
      summary: 'Distribución continua simétrica en forma de campana, base de la inferencia.',
      keywords: ['normal', 'gauss', 'campana', 'qué es', 'definición', 'continua', 'simétrica'],
      blocks: [
        {
          kind: 'paragraph',
          text: 'La distribución **normal** (o de Gauss) es una distribución **continua** con forma de campana simétrica. Aparece en innumerables fenómenos naturales (estaturas, errores de medición, promedios) y es la base de gran parte de la estadística inferencial.',
        },
        {
          kind: 'paragraph',
          text: 'Queda totalmente determinada por dos parámetros: la **media** $\\mu$ (dónde está centrada) y la **desviación estándar** $\\sigma$ (qué tan ancha/dispersa es). Al ser continua, las probabilidades se calculan como **áreas bajo la curva**, no en puntos individuales.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Regla empírica 68 – 95 – 99.7',
          text: 'Aproximadamente el 68% de los datos cae dentro de $\\mu \\pm 1\\sigma$, el 95% dentro de $\\mu \\pm 2\\sigma$ y el 99.7% dentro de $\\mu \\pm 3\\sigma$.',
        },
      ],
    },
    {
      id: 'normal-parametros',
      moduleId: 'normal',
      title: 'Parámetros y modos (μ, σ, x, modo)',
      summary: 'media, desviación, valor x y el tipo de probabilidad (cola/entre/acumulada).',
      keywords: ['parámetros', 'media', 'mu', 'sigma', 'desviación', 'x', 'modo', 'cola', 'normal'],
      blocks: [
        {
          kind: 'params',
          items: [
            { symbol: 'μ', name: 'Media', description: 'Centro de la campana. La curva es simétrica respecto a $\\mu$.', constraint: 'cualquier número real' },
            { symbol: 'σ', name: 'Desviación estándar', description: 'Mide la dispersión. A mayor $\\sigma$, más ancha y baja es la campana.', constraint: '$\\sigma > 0$' },
            { symbol: 'x', name: 'Valor de interés', description: 'El punto sobre el que se calcula la probabilidad. En el modo "entre" se usan dos: $x$ y $x_2$.', constraint: 'número real' },
            { symbol: 'modo', name: 'Tipo de área', description: 'Qué probabilidad se busca: acumulada $P(X\\le x)$, cola izquierda, cola derecha $P(X\\ge x)$ o entre dos valores $P(a\\le X\\le b)$.' },
          ],
        },
      ],
    },
    {
      id: 'normal-z',
      moduleId: 'normal',
      title: 'Estandarización y puntaje Z',
      summary: 'Convierte cualquier valor x a un Z para usar la normal estándar.',
      keywords: ['z', 'z-score', 'puntaje z', 'estandarización', 'tabla z', 'phi', 'normal estándar'],
      blocks: [
        { kind: 'paragraph', text: 'Para calcular probabilidades se transforma $x$ en un **puntaje Z**, que indica a **cuántas desviaciones estándar** está $x$ de la media:' },
        { kind: 'formula', latex: 'Z = \\dfrac{x - \\mu}{\\sigma}' },
        { kind: 'paragraph', text: 'Así cualquier normal se reduce a la **normal estándar** ($\\mu=0$, $\\sigma=1$), cuya área acumulada se denota $\\Phi(z)$ y se obtiene de una tabla Z o de la calculadora:' },
        { kind: 'formula', latex: 'P(X \\le x) = \\Phi\\!\\left(\\dfrac{x-\\mu}{\\sigma}\\right)' },
        { kind: 'formula', latex: 'f(x) = \\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^{2}}', caption: 'Función de densidad: la altura de la curva (no es una probabilidad directa).' },
        {
          kind: 'callout',
          tone: 'tip',
          text: 'Por simetría: $P(X \\ge x) = 1 - P(X \\le x)$ y $P(a \\le X \\le b) = \\Phi(z_b) - \\Phi(z_a)$.',
        },
      ],
    },
    {
      id: 'normal-ejemplo',
      moduleId: 'normal',
      title: 'Ejemplo resuelto (normal)',
      summary: 'Probabilidad usando estandarización y tabla Z.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'z', 'normal'],
      blocks: [
        {
          kind: 'example',
          statement: 'El CI de una población es normal con μ = 100 y σ = 15. ¿Qué proporción tiene un CI mayor a 130?',
          steps: [
            'Estandarizamos: $Z = \\dfrac{130 - 100}{15} = 2$.',
            'Se pide cola derecha: $P(X > 130) = P(Z > 2)$.',
            'De la tabla: $\\Phi(2) = P(Z \\le 2) \\approx 0.9772$.',
            'Por complemento: $P(Z > 2) = 1 - 0.9772$.',
          ],
          result: 'P(X > 130) ≈ 0.0228  (2.28% de la población).',
        },
      ],
    },
  ],
};

// =====================================================
// ESTIMACIÓN
// =====================================================
const ESTIMATION: TheoryModule = {
  id: 'estimation',
  label: 'Estimación de Parámetros',
  path: '/estimation',
  tagline: 'Intervalos de confianza para estimar la media o la proporción poblacional.',
  articles: [
    {
      id: 'est-que-es',
      moduleId: 'estimation',
      title: '¿Qué es un intervalo de confianza?',
      summary: 'Rango plausible para un parámetro poblacional, con un nivel de confianza dado.',
      keywords: ['estimación', 'intervalo de confianza', 'ic', 'qué es', 'inferencia', 'parámetro', 'confianza'],
      blocks: [
        {
          kind: 'paragraph',
          text: 'La **estimación por intervalos** usa los datos de una **muestra** para construir un rango de valores —el **intervalo de confianza (IC)**— dentro del cual se espera que esté el verdadero **parámetro poblacional** (la media $\\mu$ o la proporción $p$).',
        },
        {
          kind: 'paragraph',
          text: 'Todo IC tiene la forma **estimación puntual ± margen de error**. El margen depende del nivel de confianza y de la variabilidad de los datos.',
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: 'Interpretación correcta',
          text: 'Un IC del 95% significa que, si repitiéramos el muestreo muchas veces, el 95% de los intervalos construidos contendría al parámetro. **No** significa "hay 95% de probabilidad de que el parámetro esté en este intervalo concreto".',
        },
      ],
    },
    {
      id: 'est-parametros',
      moduleId: 'estimation',
      title: 'Parámetros (n, x̄, s, p̂, confianza)',
      summary: 'Datos de la muestra y el nivel de confianza para construir el intervalo.',
      keywords: ['parámetros', 'n', 'media muestral', 'x barra', 'desviación', 's', 'p gorro', 'p hat', 'nivel de confianza', 'estimación'],
      blocks: [
        {
          kind: 'params',
          items: [
            { symbol: 'n', name: 'Tamaño de la muestra', description: 'Número de observaciones recogidas. A mayor $n$, más estrecho el intervalo.', constraint: 'entero $\\ge 2$' },
            { symbol: 'x̄', name: 'Media muestral', description: 'Promedio de la muestra. Es la estimación puntual de la media $\\mu$ (IC de la media).' },
            { symbol: 's', name: 'Desviación estándar muestral', description: 'Mide la dispersión de los datos de la muestra (IC de la media).', constraint: '$s > 0$' },
            { symbol: 'p̂', name: 'Proporción muestral', description: 'Fracción de éxitos observada, $\\hat p = x/n$. Estima la proporción poblacional $p$ (IC de la proporción).', constraint: '$0 \\le \\hat p \\le 1$' },
            { symbol: 'confianza', name: 'Nivel de confianza', description: 'Qué tan seguros queremos estar (90%, 95%, 99%…). Define el valor crítico $z_{\\alpha/2}$.', constraint: 'p. ej. 0.95' },
          ],
        },
      ],
    },
    {
      id: 'est-formulas',
      moduleId: 'estimation',
      title: 'Fórmulas de los intervalos',
      summary: 'Error estándar, margen de error e IC para media y proporción.',
      keywords: ['fórmula', 'error estándar', 'margen de error', 'z crítico', 'alfa', 'intervalo', 'media', 'proporción', 'estimación'],
      blocks: [
        { kind: 'paragraph', text: 'El **valor crítico** $z_{\\alpha/2}$ se obtiene del nivel de confianza, donde $\\alpha = 1 - \\text{confianza}$ (para 95%, $z_{\\alpha/2}\\approx 1.96$).' },
        { kind: 'paragraph', text: '**Intervalo para la media** (error estándar $s/\\sqrt{n}$):' },
        { kind: 'formula', latex: 'IC_{\\mu} = \\bar{x} \\;\\pm\\; z_{\\alpha/2}\\,\\dfrac{s}{\\sqrt{n}}' },
        { kind: 'paragraph', text: '**Intervalo para la proporción** (error estándar $\\sqrt{\\hat p(1-\\hat p)/n}$):' },
        { kind: 'formula', latex: 'IC_{p} = \\hat{p} \\;\\pm\\; z_{\\alpha/2}\\,\\sqrt{\\dfrac{\\hat{p}\\,(1-\\hat{p})}{n}}' },
        { kind: 'callout', tone: 'note', text: 'Para el IC de proporción conviene que $n\\hat p \\ge 5$ y $n(1-\\hat p) \\ge 5$, de modo que la aproximación normal sea válida.' },
      ],
    },
    {
      id: 'est-ejemplo',
      moduleId: 'estimation',
      title: 'Ejemplo resuelto (intervalo para la media)',
      summary: 'Construcción de un IC del 95% paso a paso.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'intervalo', 'media', 'estimación'],
      blocks: [
        {
          kind: 'example',
          statement: 'Una muestra de n = 36 baterías tiene una duración media de x̄ = 50 h con s = 6 h. Construye un IC del 95% para la duración media poblacional.',
          steps: [
            'Confianza 95% → $\\alpha = 0.05$ → $z_{\\alpha/2} = 1.96$.',
            'Error estándar: $SE = \\dfrac{s}{\\sqrt{n}} = \\dfrac{6}{\\sqrt{36}} = 1$.',
            'Margen de error: $E = 1.96 \\times 1 = 1.96$.',
            'Intervalo: $50 \\pm 1.96$.',
          ],
          result: 'IC₉₅% = (48.04 h, 51.96 h). Con 95% de confianza, la duración media está en ese rango.',
        },
      ],
    },
  ],
};

// =====================================================
// ANOVA
// =====================================================
const ANOVA: TheoryModule = {
  id: 'anova',
  label: 'ANOVA (Análisis de la Varianza)',
  path: '/anova',
  tagline: 'Compara las medias de tres o más grupos mediante la razón de sus varianzas.',
  articles: [
    {
      id: 'anova-que-es',
      moduleId: 'anova',
      title: '¿Qué es el ANOVA?',
      summary: 'Prueba si tres o más grupos tienen medias distintas comparando varianzas.',
      keywords: ['anova', 'análisis de la varianza', 'qué es', 'medias', 'grupos', 'factor', 'f'],
      blocks: [
        { kind: 'paragraph', text: 'El **ANOVA** (*Analysis of Variance*) es una prueba que compara las **medias de tres o más grupos** a la vez. En lugar de hacer muchas pruebas $t$ por pares (que inflan el error), el ANOVA usa una sola prueba basada en la razón de dos estimaciones de la varianza.' },
        { kind: 'paragraph', text: 'La idea central: si los grupos realmente tienen la misma media, la variación **entre** los grupos debería ser parecida a la variación **dentro** de cada grupo. Si la variación entre grupos es mucho mayor, es señal de que las medias difieren.' },
        { kind: 'callout', tone: 'note', title: 'Un factor vs. dos factores', text: 'El **ANOVA de un factor** estudia el efecto de una sola variable de agrupación (p. ej. el método de enseñanza). El **de dos factores** estudia dos variables a la vez (p. ej. método y turno) y puede detectar su **interacción**.' },
      ],
    },
    {
      id: 'anova-supuestos',
      moduleId: 'anova',
      title: 'Supuestos del ANOVA',
      summary: 'Normalidad, igualdad de varianzas (homocedasticidad) e independencia.',
      keywords: ['supuestos', 'normalidad', 'homocedasticidad', 'varianzas iguales', 'independencia', 'anova'],
      blocks: [
        { kind: 'list', ordered: false, items: [
          '**Normalidad:** dentro de cada grupo, los datos siguen (aprox.) una distribución normal.',
          '**Homocedasticidad:** todos los grupos tienen la misma varianza poblacional $\\sigma^2$.',
          '**Independencia:** las observaciones son independientes entre sí y entre grupos.',
        ] },
        { kind: 'callout', tone: 'warning', title: 'Ojo', text: 'Si las varianzas son muy distintas o las muestras muy pequeñas y sesgadas, el valor-p del ANOVA puede no ser fiable. Conviene revisar los supuestos antes de concluir.' },
      ],
    },
    {
      id: 'anova-hipotesis',
      moduleId: 'anova',
      title: 'Hipótesis y el estadístico F',
      summary: 'H₀: todas las medias son iguales. F es la razón de cuadrados medios.',
      keywords: ['hipótesis', 'h0', 'nula', 'estadístico f', 'razón de varianzas', 'valor-p', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'La hipótesis nula afirma que **todas las medias son iguales**; la alternativa, que **al menos una** difiere:' },
        { kind: 'formula', latex: 'H_0:\\; \\mu_1 = \\mu_2 = \\dots = \\mu_k \\qquad H_1:\\; \\text{alguna } \\mu_j \\text{ difiere}' },
        { kind: 'paragraph', text: 'El estadístico de prueba es el cociente entre el cuadrado medio entre grupos y el cuadrado medio del error:' },
        { kind: 'formula', latex: 'F = \\dfrac{CM_{entre}}{CM_{dentro}}', caption: 'Bajo $H_0$, $F$ sigue una distribución $F$ con $(k-1,\\, N-k)$ grados de libertad.' },
        { kind: 'callout', tone: 'tip', text: 'Se rechaza $H_0$ si $F > F_{crítico}$ (o equivalentemente si el **valor-p** $< \\alpha$). Statix calcula el valor-p exacto con la CDF de la distribución $F$.' },
      ],
    },
    {
      id: 'anova-tabla',
      moduleId: 'anova',
      title: 'La tabla ANOVA',
      summary: 'Fuente, suma de cuadrados, grados de libertad, cuadrado medio, F y valor-p.',
      keywords: ['tabla anova', 'suma de cuadrados', 'grados de libertad', 'cuadrado medio', 'fuente', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'Los resultados se resumen en la **tabla ANOVA**. Cada fila es una *fuente de variación* con su suma de cuadrados ($SC$), grados de libertad ($gl$), cuadrado medio ($CM = SC/gl$) y, si procede, el estadístico $F$.' },
        { kind: 'params', items: [
          { symbol: 'SC', name: 'Suma de cuadrados', description: 'Variabilidad atribuida a cada fuente.', constraint: '$\\ge 0$' },
          { symbol: 'gl', name: 'Grados de libertad', description: 'Entre grupos $k-1$; error $N-k$; total $N-1$.' },
          { symbol: 'CM', name: 'Cuadrado medio', description: 'Varianza estimada: $CM = SC / gl$.' },
          { symbol: 'F', name: 'Estadístico F', description: 'Razón $CM_{entre}/CM_{dentro}$.' },
        ] },
      ],
    },
    {
      id: 'anova-un-factor',
      moduleId: 'anova',
      title: 'ANOVA de un factor',
      summary: 'Un solo criterio de agrupación; columnas = grupos.',
      keywords: ['un factor', 'one-way', 'unifactorial', 'entre grupos', 'dentro de grupos', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'En el **ANOVA de un factor** se compara un único factor con $k$ niveles (grupos). En Statix, **cada columna de la rejilla es un grupo** y las filas son sus observaciones (los grupos pueden tener distinto tamaño).' },
        { kind: 'formula', latex: 'SC_{entre} = \\sum_j n_j(\\bar{x}_j-\\bar{x})^2 \\qquad SC_{dentro} = \\sum_j\\sum_i (x_{ij}-\\bar{x}_j)^2' },
        { kind: 'formula', latex: 'F = \\dfrac{SC_{entre}/(k-1)}{SC_{dentro}/(N-k)}' },
      ],
    },
    {
      id: 'anova-dos-factores',
      moduleId: 'anova',
      title: 'ANOVA de dos factores',
      summary: 'Dos factores a la vez; con repetición aparece la interacción A×B.',
      keywords: ['dos factores', 'two-way', 'bifactorial', 'interacción', 'bloques', 'repetición', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'El **ANOVA de dos factores** analiza dos variables simultáneamente. En la rejilla, las **filas son los niveles del factor A** y las **columnas los del factor B**.' },
        { kind: 'paragraph', text: 'Si cada celda tiene **una** observación, es un diseño **sin repetición** (en bloques): se estiman los efectos de A y B pero no su interacción. Si cada celda tiene **varias** réplicas, el diseño es **con repetición** y aparece la **interacción A×B**, que mide si el efecto de un factor depende del nivel del otro.' },
        { kind: 'formula', latex: 'SC_{total} = SC_{A} + SC_{B} + SC_{AB} + SC_{error}', caption: 'Con repetición. Sin repetición desaparece $SC_{AB}$ y su variación pasa al error.' },
        { kind: 'callout', tone: 'note', title: 'Auto-detección', text: 'Statix detecta el diseño automáticamente: si escribes más de un valor por celda (separados por coma), asume repetición y calcula la interacción.' },
      ],
    },
    {
      id: 'anova-tukey',
      moduleId: 'anova',
      title: 'Comparaciones post-hoc: Tukey HSD',
      summary: 'Tras rechazar H₀, identifica qué pares de medias difieren.',
      keywords: ['post-hoc', 'tukey', 'hsd', 'comparaciones múltiples', 'pares', 'rango studentizado', 'anova'],
      blocks: [
        { kind: 'paragraph', text: 'El ANOVA solo dice *si* hay diferencias, no *entre quiénes*. Cuando se rechaza $H_0$, la prueba **Tukey HSD** compara todos los pares de medias controlando el error global.' },
        { kind: 'formula', latex: 'HSD = q_{\\alpha,\\,k,\\,gl_{error}}\\;\\sqrt{\\dfrac{CM_{error}}{2}\\left(\\tfrac{1}{n_i}+\\tfrac{1}{n_j}\\right)}' },
        { kind: 'paragraph', text: 'Dos grupos difieren significativamente si $|\\bar{x}_i-\\bar{x}_j| > HSD$. El valor $q$ proviene de la distribución del **rango studentizado**.' },
        { kind: 'callout', tone: 'warning', title: 'Nota técnica', text: 'El valor crítico $q$ no tiene forma cerrada simple; Statix lo obtiene de una tabla estándar (α = 0.05 y 0.01) interpolando en los grados de libertad, como es habitual en las calculadoras.' },
      ],
    },
    {
      id: 'anova-ejemplo',
      moduleId: 'anova',
      title: 'Ejemplo resuelto (un factor)',
      summary: 'Procedimiento completo con tres grupos, paso a paso.',
      keywords: ['ejemplo', 'ejercicio', 'resolver', 'paso a paso', 'cómo calcular', 'anova'],
      blocks: [
        { kind: 'example',
          statement: 'Tres métodos de estudio dan las notas: A = {6, 8, 4, 5, 3, 4}, B = {8, 12, 9, 11, 6, 8}, C = {13, 9, 11, 8, 7, 12}. ¿Difieren las medias con α = 0.05?',
          steps: [
            'Medias: $\\bar{x}_A=5$, $\\bar{x}_B=9$, $\\bar{x}_C=10$; media global $\\bar{x}=8$ ($N=18$, $k=3$).',
            'Entre grupos: $SC_{entre}=6[(5-8)^2+(9-8)^2+(10-8)^2]=6\\cdot14=84$, con $gl=k-1=2$.',
            'Dentro: $SC_{dentro}=$ suma de $(x_{ij}-\\bar{x}_j)^2 = 72$, con $gl=N-k=15$.',
            'Cuadrados medios: $CM_{entre}=84/2=42$; $CM_{dentro}=72/15=4.8$.',
            'Estadístico: $F=42/4.8=8.75$. Crítico $F_{0.05}(2,15)\\approx 3.68$.',
          ],
          result: 'F = 8.75 > 3.68 → se rechaza H₀: al menos un método tiene media distinta.',
        },
      ],
    },
  ],
};

// =====================================================
// EXPORTS
// =====================================================
export const THEORY_MODULES: TheoryModule[] = [
  BINOMIAL,
  HYPERGEOMETRIC,
  NORMAL,
  ESTIMATION,
  ANOVA,
];

/** Índice plano de artículos (para el buscador) */
export const THEORY_ARTICLES: TheoryArticle[] = THEORY_MODULES.flatMap(
  (m) => m.articles,
);

/** Devuelve el módulo de teoría por su id */
export function getTheoryModule(id: DistributionType): TheoryModule | undefined {
  return THEORY_MODULES.find((m) => m.id === id);
}
