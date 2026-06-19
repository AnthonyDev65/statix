# Statix

> **Calculadora Profesional de Estadística y Probabilidad** — software académico con apariencia de SaaS premium, pensado para estudiantes universitarios, profesores, investigadores y profesionales.

Statix resuelve con precisión y de forma visualmente impecable problemas de cuatro áreas fundamentales de la estadística:

- **Distribución Binomial** — ensayos independientes con probabilidad constante
- **Distribución Hipergeométrica** — muestreo sin reemplazo de poblaciones finitas
- **Distribución Normal** — variable continua con curva de campana
- **Estimación de Parámetros** — intervalos de confianza para media y proporción

---

## ✨ Características

- **Resultados precisos**: algoritmos con función Gamma, normal estándar y cuantiles (Beasley-Springer-Moro).
- **Visualización interactiva**: gráficos con Recharts (barras, curvas, áreas sombreadas).
- **Fórmulas renderizadas** con KaTeX.
- **Modo oscuro** y persistencia de preferencias y cálculos recientes en `localStorage`.
- **Exportación a PDF** con jsPDF y copia rápida al portapapeles.
- **Validación en tiempo real** con Zod + React Hook Form.
- **Animaciones fluidas** con Framer Motion.
- **Diseño mobile-first** inspirado en Linear, Stripe, Vercel, Arc y Notion.
- **Historial de cálculos** persistido en el navegador.
- **Botones "Ejemplo" y "Limpiar"** en cada módulo.

---

## 🎨 Diseño

| Token          | Valor      |
| -------------- | ---------- |
| Fondo          | `#F8FAFC`  |
| Tarjetas       | `#FFFFFF`  |
| Primario       | `#2563EB`  |
| Secundario     | `#1E293B`  |
| Éxito          | `#16A34A`  |
| Advertencia     | `#F59E0B`  |
| Tipografía     | Inter 400/500/600/700 |
| Bordes         | rounded-2xl |
| Sombras        | soft / elevated / glow |

---

## 🧱 Stack

- **React 18** + **TypeScript** (estricto)
- **Vite 5**
- **Tailwind CSS 3** con tema personalizado
- **Framer Motion** para animaciones
- **Recharts** para gráficos
- **KaTeX** para fórmulas
- **MathJS** + utilidades numéricas propias
- **React Hook Form** + **Zod** para validación
- **Lucide React** para iconografía
- **jsPDF** para exportación a PDF
- **React Router DOM** para navegación

---

## 🗂️ Arquitectura

```
src/
├── components/     # Componentes UI reutilizables
├── pages/          # Páginas: Home, Binomial, Hipergeométrica, Normal, Estimación
├── hooks/          # Custom hooks (useLocalStorage, useDebouncedCallback, useIsMobile)
├── services/       # statistics.service, pdf.service
├── utils/          # math.utils, formatters, validators (Zod)
├── types/          # Tipos globales
├── constants/      # Constantes y configuración
├── layouts/        # MainLayout
├── charts/         # ProbabilityChart, DistributionChart, ConfidenceChart
├── formulas/       # Definiciones LaTeX de fórmulas
├── context/        # ThemeContext, HistoryContext
└── assets/         # Recursos estáticos
```

Capas separadas para UI, lógica de cálculo, fórmulas, exportación y persistencia. Tipado estricto en todos los módulos.

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Vista previa del build
npm run preview
```

La aplicación se abrirá en `http://localhost:5173`.

---

## 📐 Módulos

### 1. Distribución Binomial `B(n, p)`
- Entradas: `n`, `p`, `x`
- Salidas: `P(X = x)`, `P(X ≤ x)`, `P(X ≥ x)`, media, varianza y desviación estándar.
- Fórmulas: PMF, CDF, esperanza, varianza y desviación.

### 2. Distribución Hipergeométrica `H(N, K, n)`
- Entradas: `N`, `K`, `n`, `x`
- Salidas: probabilidades exacta, acumulada y de cola superior; media, varianza y desviación.
- Fórmulas: PMF, esperanza y varianza con corrección por población finita.

### 3. Distribución Normal `N(μ, σ²)`
- Entradas: `μ`, `σ`, `x`, `x2` (opcional), modo (`between`, `cumulative`, `left-tail`, `right-tail`).
- Salidas: puntaje Z, probabilidad, densidad, curva normal con área sombreada.

### 4. Estimación de Parámetros
- **Media**: error estándar, margen de error, intervalo de confianza.
- **Proporción**: error estándar, margen de error, intervalo de confianza.
- Visualización de IC con límites, centro, margen de error e indicador visual.

---

## 🧪 Validación

Cada formulario valida en tiempo real con Zod, mostrando mensajes específicos y deshabilitando acciones inválidas. Restricciones relevantes:

- `0 ≤ p ≤ 1` para probabilidades y proporciones
- `0 ≤ x ≤ n` para binomial
- `n ≥ 2` para media muestral; `np̂ ≥ 5` y `n(1-p̂) ≥ 5` para proporción
- Cuantiles críticos `z` derivados del nivel de confianza

---

## 💾 Persistencia

- **Tema** (`light` / `dark`) en `localStorage` clave `statix:theme`.
- **Historial** de cálculos (últimos 25) en `statix:history`.
- Reset manual desde el panel "Cálculos recientes".

---

## 📤 Exportación

- **PDF** mediante `jsPDF` con cabecera institucional, metadatos y secciones estructuradas.
- **Copiar al portapapeles** genera un resumen en texto plano listo para pegar en trabajos, apuntes o emails.

---

## 📝 Licencia

MIT — usa, modifica y distribuye libremente con atribución.

---

> *Statix — hecho con rigor matemático y obsesión por el detalle.*
