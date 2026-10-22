# Statix

Calculadora de estadística y probabilidad para estudiantes y docentes. Muestra resultados, fórmulas y gráficos paso a paso, con una interfaz clara y consistente en tema claro u oscuro.

## Módulos

- **Binomial `B(n, p)`**: `P(X = x)`, `P(X ≤ x)`, `P(X ≥ x)`, media, varianza y desviación estándar.
- **Hipergeométrica `H(N, K, n)`**: probabilidades exacta, acumulada y de cola superior; media y varianza con corrección por población finita.
- **Normal `N(μ, σ)`**: puntaje Z, probabilidad (entre dos valores, acumulada, cola izquierda/derecha) y curva con área sombreada.
- **Estimación**: intervalos de confianza para
  - la media, con *t* de Student (σ desconocida) o *z* (σ conocida);
  - la proporción, con los métodos de Wald y Wilson.
- **ANOVA**: de uno y dos factores, con tabla ANOVA, desarrollo paso a paso y comparaciones múltiples de Tukey HSD.
- **Teoría / Docs**: explicaciones de cada tema con buscador global (`Ctrl+K` / `⌘K`).
- **Changelog**: historial de versiones dentro de la app.

## Funciones generales

- **Modo simple / completo**: el modo simple muestra solo lo esencial; el completo añade fórmulas, pasos y detalles.
- **Tema claro / oscuro**, guardado en `localStorage`.
- **Historial** de cálculos recientes en el navegador.
- **Exportación a PDF** (jsPDF, cargado solo al exportar) y copia del resumen al portapapeles.
- Validación de formularios con Zod + React Hook Form.

## Stack

React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router, Recharts, KaTeX, Framer Motion, Lucide, jsPDF. Pruebas con Vitest.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # sirve el build localmente
npm test         # vitest run
npm run lint     # eslint (flat config en eslint.config.js)
```

## Estructura

```
src/
├── pages/       # Una página por módulo (rutas cargadas de forma diferida)
├── components/  # Componentes de UI reutilizables
├── charts/      # Gráficos (Recharts)
├── layouts/     # MainLayout
├── context/     # Tema, modo de UI e historial
├── services/    # Cálculos estadísticos y exportación a PDF
├── utils/       # Utilidades numéricas, ANOVA, formateo y validación
├── formulas/    # Fórmulas en LaTeX
├── content/     # Teoría y changelog
├── hooks/  types/  constants/
```

## Despliegue (Docker + nginx)

El `Dockerfile` hace un build multietapa: `node:20-alpine` ejecuta `npm ci` y `npm run build`, y `nginx:1.27-alpine` sirve `dist/` en el puerto 80. El `nginx.conf` incluye:

- fallback SPA (`try_files … /index.html`) para que rutas como `/binomial` funcionen al recargar;
- caché inmutable de 1 año para `/assets/` (archivos con hash) y `no-cache` para `index.html`;
- compresión gzip.

```bash
docker build -t statix .
docker run -p 8080:80 statix   # http://localhost:8080
```

Pensado para desplegarse en Dokploy (o cualquier plataforma que construya desde el `Dockerfile`).
