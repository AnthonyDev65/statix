# Statix — Guía para explicar el proyecto en clase

> **Statix** es una calculadora profesional de estadística y probabilidad hecha como
> aplicación web de una sola página (SPA). Permite calcular distribuciones
> **Binomial**, **Hipergeométrica** y **Normal**, además de **intervalos de confianza**
> para la media y la proporción. Todo el cálculo ocurre en el navegador (no hay backend).

Este documento está pensado para que puedas **explicar cómo funciona el código** paso a
paso, señalando los **lugares clave**.

---

## 1. ¿Con qué está hecho? (stack tecnológico)

Definido en `package.json`:

| Herramienta | Para qué se usa |
|---|---|
| **React 18 + TypeScript** | Construir la interfaz por componentes, con tipos seguros |
| **Vite** | Servidor de desarrollo y empaquetado (`npm run dev`, `npm run build`) |
| **React Router** | Navegación entre páginas sin recargar (`/binomial`, `/normal`, …) |
| **React Hook Form + Zod** | Manejo de formularios y **validación** de los datos que escribe el usuario |
| **Recharts** | Dibujar las **gráficas** de las distribuciones |
| **Tailwind CSS** | Estilos (clases utilitarias en el `className`) |
| **Framer Motion** | Animaciones suaves de aparición |
| **jsPDF + KaTeX** | Exportar informes a PDF y renderizar fórmulas matemáticas |

**Idea para clase:** *"La app no usa servidor; todas las fórmulas estadísticas están
programadas en JavaScript/TypeScript y se ejecutan en el navegador del usuario."*

---

## 2. Arquitectura en capas (cómo está organizado)

El código vive en `src/` y está separado por responsabilidades. Esta separación es el
concepto más importante que puedes explicar:

```
src/
├── main.tsx              → Punto de entrada: arranca React
├── App.tsx               → Define las rutas (qué página se ve en cada URL)
│
├── pages/                → Una página por distribución (la "pantalla" completa)
│   ├── BinomialPage.tsx
│   ├── HypergeometricPage.tsx
│   ├── NormalPage.tsx
│   └── EstimationPage.tsx
│
├── components/           → Piezas de UI reutilizables (inputs, tarjetas, botones…)
│   ├── NumberInput.tsx   → ⭐ El campo donde se escriben los números
│   ├── InputField.tsx
│   ├── ResultCard.tsx / StatCard.tsx / ...
│
├── services/             → ⭐ LA LÓGICA: cálculos estadísticos puros
│   ├── statistics.service.ts
│   └── pdf.service.ts
│
├── utils/                → Funciones auxiliares
│   ├── math.utils.ts     → ⭐ Matemáticas base (Gamma, normal, erf…)
│   ├── validators.utils.ts → Reglas de validación (Zod)
│   └── formatters.utils.ts → Formato de números para mostrar
│
├── charts/               → Gráficas (Recharts)
├── context/              → Estado global (tema claro/oscuro, historial)
├── hooks/                → Hooks reutilizables (localStorage)
├── constants/            → Constantes (límites, niveles de confianza…)
├── formulas/             → Texto de las fórmulas que se muestran
└── types/                → ⭐ Definición de tipos (contratos de datos)
```

**Concepto clave para la clase:**
> La **interfaz** (pages/components) está separada de la **lógica de cálculo**
> (services/utils). Una página solo *recoge datos y muestra resultados*; **no sabe
> calcular** — para eso llama al "servicio". Esto se llama **separación de
> responsabilidades** y hace el código fácil de mantener y de probar.

---

## 3. El flujo de datos (lo más importante de entender)

Cuando el usuario usa la calculadora, los datos siguen siempre el mismo recorrido.
Tómalo como el guion central de tu explicación:

```
   Usuario escribe          Validación            Cálculo            Pantalla
  ┌──────────────┐      ┌───────────────┐    ┌──────────────┐   ┌──────────────┐
  │ NumberInput  │ ───▶ │ Zod schema    │──▶ │ statistics.  │──▶│ Cards +      │
  │ (UI)         │      │ (validators)  │    │ service.ts   │   │ Charts (UI)  │
  └──────────────┘      └───────────────┘    └──────────────┘   └──────────────┘
        │                                                              ▲
        └──── react-hook-form guarda el estado del formulario ────────┘
```

1. **Escribir** → el usuario teclea en un `NumberInput`.
2. **Guardar estado** → `react-hook-form` mantiene los valores actuales del formulario.
3. **Validar** → `Zod` comprueba que los datos sean correctos (ej. `0 ≤ p ≤ 1`).
4. **Calcular** → si son válidos, se llama a `statistics.service.ts`.
5. **Mostrar** → el resultado se pinta en tarjetas (`ResultCard`) y en una gráfica.

Lo especial: el cálculo se hace **en vivo** mientras escribes (ver `liveResults` más
abajo), no solo al pulsar un botón.

---

## 4. Lugares CLAVE en el código (qué abrir y mostrar)

### 🔑 4.1 — `src/App.tsx` — el mapa de la aplicación

Aquí se ve, de un vistazo, qué páginas existen y en qué URL viven:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/binomial" element={<BinomialPage />} />
  <Route path="/hypergeometric" element={<HypergeometricPage />} />
  <Route path="/normal" element={<NormalPage />} />
  <Route path="/estimation" element={<EstimationPage />} />
</Routes>
```

También envuelve todo en dos *Providers* (`ThemeProvider`, `HistoryProvider`) que dan
**estado global** a toda la app: el tema claro/oscuro y el historial de cálculos.

---

### 🔑 4.2 — `src/services/statistics.service.ts` — EL CEREBRO

Aquí están **todas las fórmulas estadísticas**. Es el archivo más importante para
explicar la parte de "matemáticas". Funciones puras: reciben números, devuelven números.

**Binomial** (`calculateBinomial`, línea ~44):
```ts
// P(X = x) = C(n,x) · p^x · (1-p)^(n-x)
export function binomialPmf(n, p, x) {
  return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}
// Media = n·p   Varianza = n·p·(1-p)
```

**Hipergeométrica** (`hypergeometricPmf`, línea ~65):
```ts
// P(X=x) = C(K,x)·C(N-K, n-x) / C(N,n)
// Se calcula con LOGARITMOS para evitar números gigantes:
const logNum = logCombination(K, x) + logCombination(N - K, n - x);
return Math.exp(logNum - logCombination(N, n));
```
> 💡 **Punto interesante para clase:** los números combinatorios crecen enormemente
> (C(5000, 2500) es astronómico). Por eso no se calculan directamente, sino con
> **logaritmos** y luego `Math.exp(...)`. Esto evita el desbordamiento numérico.

**Normal** (`calculateNormal`, línea ~126): calcula el **Z-score**, la probabilidad
según el modo (cola izquierda/derecha, acumulada o entre dos valores) y genera los
puntos de la **curva de campana** para graficar.

**Estimación** (línea ~196): calcula el **error estándar**, el **valor crítico Z** y el
**margen de error** para construir los intervalos de confianza.

---

### 🔑 4.3 — `src/utils/math.utils.ts` — las matemáticas de base

Es la "caja de herramientas" que usa el servicio. Aquí se implementan funciones que
JavaScript **no trae de fábrica**:

- `gamma(z)` → función Gamma (aproximación de **Lanczos**). Permite calcular factoriales
  y combinaciones de forma estable.
- `normalPdf` / `normalCdf` → densidad y acumulada de la normal. La CDF usa la función
  de error `erf` (aproximación de **Abramowitz & Stegun**).
- `normalQuantile(p)` → la **inversa** de la normal (algoritmo de **Beasley-Springer-Moro**),
  necesaria para obtener el Z crítico de un nivel de confianza.

> 💡 **Para clase:** *"El navegador no sabe calcular la integral de la curva normal, así
> que programamos aproximaciones numéricas conocidas."* Esto demuestra que detrás de un
> botón hay matemática real.

---

### 🔑 4.4 — `src/utils/validators.utils.ts` — las reglas (Zod)

Define qué entradas son válidas. Ejemplo (Binomial):
```ts
export const binomialSchema = z.object({
  n: z.coerce.number().int().min(1).max(100000),
  p: z.coerce.number().min(0).max(1),        // probabilidad entre 0 y 1
  x: z.coerce.number().int().min(0),
}).refine((d) => d.x <= d.n, { message: 'x no puede ser mayor que n', path: ['x'] });
```
Si el dato no cumple, aparece el **mensaje de error** debajo del campo y **no se calcula**.

---

### 🔑 4.5 — `src/pages/BinomialPage.tsx` — cómo se conecta todo

Esta página es el ejemplo perfecto de cómo se unen las piezas. Muestra el patrón que
repiten todas las páginas:

```tsx
// 1. Formulario con validación Zod
const { register, setValue, watch } = useForm({ resolver: zodResolver(binomialSchema) });
const values = watch();                       // valores actuales

// 2. Cálculo EN VIVO: cada vez que cambian los valores, recalcula
const liveResults = useMemo(() => {
  const parsed = binomialSchema.safeParse(values);
  if (!parsed.success) return null;           // si no es válido, no calcula
  return calculateBinomial(parsed.data);      // ← llama al servicio
}, [values]);

// 3. Pintar el input
<NumberInput
  label="Probabilidad (p)" min={0} max={1} step={0.01}
  value={values.p}
  onValueChange={(v) => setValue('p', v, { shouldValidate: true })}
/>
```

Fíjate en el patrón **estado → validar → calcular → mostrar**, todo reactivo.

---

### 🔑 4.6 — `src/components/NumberInput.tsx` — el campo de números

Es el componente con el que más interactúa el usuario. Internamente:
- Usa un **buffer de texto** propio para permitir escribir decimales (`0.`, `1.5`) y
  estados intermedios sin que se borren.
- Usa `type="text"` + `inputMode="decimal"` y filtra los caracteres con una expresión
  regular, en lugar de `type="number"` (que en los navegadores borra valores como `0.`).
- Aplica los límites (mín/máx) **al salir del campo** (`onBlur`), no en cada tecla.
- Tiene botones **+ / −** para incrementar/decrementar.

> 💡 Buen ejemplo de un detalle de **experiencia de usuario (UX)**: que se pueda escribir
> con el teclado de forma natural es más difícil de lo que parece.

---

### 🔑 4.7 — `src/charts/` — las gráficas

Tres gráficas hechas con Recharts:
- `DiscreteChart.tsx` → barras para Binomial e Hipergeométrica (función de masa).
- `NormalChart.tsx` → la curva de campana con el área sombreada.
- `ConfidenceChart.tsx` → el intervalo de confianza.

Reciben los datos que produce `statistics.service.ts` (los arrays `distribution` /
`shadedArea`) y solo se encargan de **dibujarlos**.

---

### 🔑 4.8 — `src/context/HistoryContext.tsx` — el historial

Guarda cada cálculo que hace el usuario para poder consultarlo después. Lo interesante:
- Usa el hook `useLocalStorage` (`src/hooks/useLocalStorage.ts`) para que el historial
  **persista aunque se cierre el navegador**.
- Limita el historial a 25 entradas (`LIMITS.MAX_HISTORY` en `constants/`).
- Expone funciones `add`, `remove`, `clear` a toda la app mediante el **Context API** de
  React (estado global sin tener que pasar props por todos lados).

---

### 🔑 4.9 — `src/types/index.ts` — los contratos de datos

Define con TypeScript la **forma exacta** de las entradas y resultados, por ejemplo:
```ts
export interface BinomialInputs  { n: number; p: number; x: number; }
export interface BinomialResults { probabilityExact: number; mean: number; /* … */ }
```
> 💡 **Para clase:** estos tipos son un "contrato": garantizan que la página y el servicio
> hablen el mismo idioma. Si te equivocas en un nombre, el editor te avisa antes de
> ejecutar. Es una gran ventaja de TypeScript frente a JavaScript normal.

---

## 5. Resumen de un cálculo, de principio a fin (ejemplo Binomial)

Sigue este recorrido en vivo durante la presentación:

1. El usuario abre `/binomial` → React Router muestra `BinomialPage.tsx`.
2. Escribe `n=20`, `p=0.3`, `x=6` en tres `NumberInput`.
3. `react-hook-form` guarda esos valores; `watch()` los entrega.
4. `binomialSchema.safeParse(values)` (Zod) los valida.
5. Si son válidos → `calculateBinomial({ n, p, x })` en `statistics.service.ts`.
6. Esa función usa `combination()` de `math.utils.ts` para aplicar la fórmula.
7. Devuelve probabilidades + media + varianza + el array para la gráfica.
8. La página pinta los `ResultCard` / `StatCard` y el `ProbabilityChart`.
9. Al pulsar calcular, se añade una entrada al **historial** (Context + localStorage).

---

## 6. Frases listas para usar en la exposición

- *"La aplicación separa la **interfaz** de la **lógica**: las páginas muestran, los
  servicios calculan."*
- *"Todas las fórmulas estadísticas están en `statistics.service.ts`; son funciones puras
  fáciles de probar."*
- *"Como el navegador no trae funciones estadísticas avanzadas, programamos aproximaciones
  numéricas clásicas (Lanczos, erf, Beasley-Springer-Moro)."*
- *"Validamos con Zod antes de calcular, así nunca se opera con datos inválidos."*
- *"El cálculo es reactivo y en vivo gracias a `useMemo` y `watch` de react-hook-form."*
- *"TypeScript nos da seguridad de tipos: los `types/` son contratos entre las capas."*

---

## 7. Cómo ejecutarlo (por si lo muestras en vivo)

```bash
npm install      # instalar dependencias (solo la primera vez)
npm run dev      # arrancar en modo desarrollo → abre http://localhost:5173
npm run build    # generar la versión de producción
```
