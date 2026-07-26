# Diseño: Módulo ANOVA (Statix)

**Fecha:** 2026-07-26
**Estado:** Aprobado para planificación
**Versión objetivo:** 1.2.0

## Objetivo

Añadir un nuevo módulo **ANOVA (Análisis de la Varianza)** a Statix que permita:

1. Calcular ANOVA de **un factor** (one-way) y de **dos factores** (two-way), estos
   últimos tanto **con repetición** (interacción A×B) como **sin repetición** (bloques).
2. Introducir los datos mediante un **editor tipo hoja de cálculo (Excel-like)**:
   rejilla editable con capacidad de añadir/quitar filas y columnas, y un selector
   "1 factor / 2 factores" que cambia la interpretación de la misma rejilla.
3. Mostrar la **tabla ANOVA** clásica, el **test F** con valor-p y F crítico, la
   **decisión** sobre H₀, y comparaciones **post-hoc (Tukey HSD)**.
4. Ofrecer un apartado **colapsable "Cálculo paso a paso"** que desarrolla el
   procedimiento manual con las fórmulas y los números reales del usuario sustituidos.
5. Añadir **documentación teórica completa** de ANOVA (buscable en `/docs` y ⌘K).

No incluido (fuera de alcance): gráficas de resultados (boxplot/medias), y la
exportación del desarrollo paso a paso al PDF (el PDF mantiene el resumen actual).

## Enfoque arquitectónico

Sigue el patrón existente de `EstimationPage.tsx`: **una sola página con pestañas y
secciones reutilizando los componentes de la app**. Nada de páginas separadas ni wizard.

## Componentes y archivos

### Nuevos

- `src/pages/AnovaPage.tsx` — página del módulo. Selector 1/2 factores, editor de
  rejilla, cálculo en vivo, resultados y paso a paso.
- `src/components/DataGrid.tsx` — editor Excel-like: celdas numéricas editables,
  añadir/quitar filas y columnas, encabezados de fila/columna editables. Las celdas
  admiten varios valores separados por coma (réplicas). Emite una matriz de strings.
- `src/components/AnovaTable.tsx` — tabla ANOVA clásica (Fuente · SC · gl · CM · F ·
  valor-p), reutilizable para uno y dos factores.
- `src/components/AnovaSteps.tsx` — apartado colapsable (framer-motion) con el
  desarrollo manual: totales/medias, SC, gl, CM, F, comparación y decisión, con
  fórmulas KaTeX y sustitución numérica. Colapsado por defecto, bajo los resultados.
- `src/components/Collapsible.tsx` (o inline en AnovaSteps) — contenedor colapsable
  genérico, ya que no existe ninguno en `components/`.

### Modificados

- `src/utils/math.utils.ts` — añadir distribución F:
  - `incompleteBeta(x, a, b)` — beta incompleta regularizada (fracción continua,
    método Numerical Recipes `betai`/`betacf`).
  - `fCdf(f, d1, d2)` — CDF de F, para el valor-p.
  - `fQuantile(p, d1, d2)` — inversa por bisección, para el F crítico.
  - `studentizedRangeQ(k, dfError, alpha)` — valor crítico `q` del rango studentizado
    para Tukey, vía **tabla** (α = 0.05 y 0.01) indexada por k y gl del error, con
    interpolación. *Limitación conocida: `q` no tiene forma cerrada simple; el estándar
    en calculadoras es una tabla. Se documenta en la teoría.*
- `src/services/statistics.service.ts`:
  - `calculateAnovaOneWay(groups: number[][]): AnovaOneWayResult`
  - `calculateAnovaTwoWay(matrix: number[][][], opts): AnovaTwoWayResult` — detecta
    con/sin repetición según el nº de valores por celda.
  - `tukeyHSD(groups, mse, dfError, alpha): TukeyResult` — comparaciones por pares.
- `src/types/index.ts` — `DistributionType` añade `'anova'`; nuevas interfaces
  `AnovaOneWayResult`, `AnovaTwoWayResult`, `AnovaTableRow`, `TukeyComparison`.
- `src/utils/validators.utils.ts` — esquemas Zod para la rejilla (mín. 2 grupos, mín.
  2 datos por grupo en one-way; rejilla rectangular en two-way; números finitos).
- `src/formulas/formulas.ts` — `ANOVA_FORMULAS` (SC entre/dentro/total, gl, CM, F).
- `src/content/theory.ts` — módulo de teoría ANOVA (ver abajo).
- `src/constants/index.ts` — `NAV_ITEMS` añade ANOVA (icono `TableProperties`).
- `src/App.tsx` — ruta `/anova`.
- `src/components/Sidebar.tsx` — icono ANOVA en el mapa `ICONS`.
- `src/pages/DocsPage.tsx` — icono ANOVA en el mapa `ICONS`.
- `src/content/changelog.ts` — entrada v1.2.0 (marcada `current`), degradar 1.1.0.

## Interpretación de la rejilla

Una única matriz editable, interpretada por el selector:

- **1 factor:** cada **columna** es un grupo/tratamiento; las filas son observaciones.
  Columnas de distinta longitud permitidas (celdas vacías se ignoran → desbalanceado OK).
- **2 factores:** **filas = niveles del factor A**, **columnas = niveles del factor B**;
  cada celda contiene una o varias observaciones (réplicas separadas por coma).
  - **Con/sin repetición se auto-detecta:** si alguna celda tiene >1 valor → modelo con
    interacción A×B; si todas tienen exactamente 1 → bloques (sin interacción). El diseño
    detectado se muestra en pantalla (p. ej. "2 factores con repetición, r = 3").

## Fórmulas del cálculo

**Un factor** (k grupos, N total):

- SC_entre = Σ nⱼ(x̄ⱼ − x̄)²; SC_dentro = ΣΣ(xᵢⱼ − x̄ⱼ)²; SC_total = SC_entre + SC_dentro
- gl_entre = k−1; gl_dentro = N−k; CM = SC/gl; F = CM_entre / CM_dentro
- valor-p = 1 − fCdf(F, k−1, N−k); F crítico = fQuantile(1−α, k−1, N−k)

**Dos factores con repetición** (a niveles A, b niveles B, r réplicas):

- SC_A, SC_B, SC_AB (interacción), SC_error, SC_total con sus gl (a−1, b−1,
  (a−1)(b−1), ab(r−1)); tres estadísticos F (A, B, A×B).

**Dos factores sin repetición** (bloques): SC_A, SC_B, SC_error; gl (a−1, b−1,
(a−1)(b−1)); dos estadísticos F.

**Tukey HSD** (cuando se rechaza H₀): HSD = q(k, gl_error, α)·√(CM_error/n); pares con
|x̄ᵢ − x̄ⱼ| > HSD son significativos.

## Contenido de documentación (theory.ts)

Módulo ANOVA con artículos buscables:

1. ¿Qué es el ANOVA? (idea, para qué sirve, relación con el test t)
2. Supuestos (normalidad, homocedasticidad, independencia)
3. Hipótesis y el estadístico F (H₀: todas las medias iguales; razón de varianzas)
4. La tabla ANOVA (fuentes, SC, gl, CM, F, valor-p)
5. ANOVA de un factor (fórmulas y cuándo usarlo)
6. ANOVA de dos factores (con y sin repetición; qué es la interacción)
7. Comparaciones post-hoc: Tukey HSD (por qué, y la limitación de la tabla q)
8. Ejemplo resuelto paso a paso

## Validación y errores

Zod, mensajes en español, cálculo en vivo como el resto de módulos:

- One-way: ≥ 2 grupos; cada grupo ≥ 2 observaciones numéricas finitas.
- Two-way: rejilla rectangular completa (sin celdas vacías); ≥ 2 niveles por factor.
- Estado vacío / inválido: tarjeta placeholder como en las demás páginas.

## Criterios de aceptación

- [ ] `/anova` accesible desde el sidebar y con ruta registrada.
- [ ] Rejilla Excel-like: añadir/quitar filas y columnas; encabezados editables.
- [ ] Selector 1/2 factores reinterpreta la rejilla correctamente.
- [ ] ANOVA de un factor: tabla, F, valor-p, F crítico y decisión correctos.
- [ ] ANOVA de dos factores con y sin repetición (auto-detección) correctos.
- [ ] Tukey HSD lista pares significativos cuando se rechaza H₀.
- [ ] Apartado "Cálculo paso a paso" colapsable con números reales sustituidos.
- [ ] Documentación ANOVA visible en `/docs`, en la página, y buscable con ⌘K.
- [ ] Changelog v1.2.0 registrado.
- [ ] `npm run build` / typecheck sin errores.
