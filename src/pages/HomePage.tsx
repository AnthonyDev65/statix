// =====================================================
// Statix — HomePage (Vercel-style hero)
// =====================================================
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, CheckCircle2, ChevronRight, Copy, Layers,
  Sigma, Sparkles, Target, Terminal, type LucideIcon,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from '@/constants';

const ICONS: Record<string, LucideIcon> = { Sigma, Layers, Activity, Target };

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
        {/* Grid de puntos — fondo característico de Vercel */}
        <div className="absolute inset-0 -z-10 bg-dots-light bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_70%)] dark:bg-dots-dark" />
        {/* Brillo superior */}
        <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-v0-50/60 to-transparent dark:from-v0-900/30" />

        <div className="px-7 pt-14 pb-12 sm:px-12 sm:pt-20 sm:pb-16">
          {/* Top badges */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-9 flex flex-wrap items-center gap-2"
          >
            <span className="inline-flex items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-2.5 py-1.5 font-mono text-[11.5px] font-medium text-v0-800 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              v1.0 — Shipped
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-v0-200/30 bg-v0-50 px-2.5 py-1.5 font-mono text-[11.5px] text-v0-500/70 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300/80">
              <Terminal size={11} strokeWidth={1.75} />
              npm i statix
            </span>
            <span className="hidden items-center gap-1.5 rounded-md border border-v0-200/30 bg-v0-50 px-2.5 py-1.5 font-mono text-[11.5px] text-v0-500/70 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300/80 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-v0-300 dark:bg-v0-600" />
              4 modules
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-[52px] font-semibold leading-[0.92] tracking-tightest text-v0-950 dark:text-v0-50 sm:text-[80px] lg:text-[104px]"
          >
            Probabilidad,
            <br />
            <span className="text-v0-400/70 dark:text-v0-600">en producción.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-7 max-w-xl text-balance text-[16px] leading-relaxed text-v0-500/70 dark:text-v0-300/80 sm:text-[17.5px]"
          >
            Calculadora profesional de Estadística y Probabilidad.
            Distribuciones binomial, hipergeométrica, normal y estimación
            de parámetros — con la precisión de una herramienta académica
            y la estética de software de producción.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/binomial"
              className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-md bg-v0-950 px-5 text-[14px] font-medium text-v0-50 transition-all duration-200 hover:bg-v0-800 hover:shadow-soft active:scale-[0.98] active:bg-v0-900 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-50 dark:active:bg-v0-100"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-black/10" />
              Empezar ahora
              <ArrowRight size={14} strokeWidth={1.75} className="relative transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/normal"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-5 text-[14px] font-medium text-v0-800 transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 active:scale-[0.98] dark:border-v0-700/30 dark:bg-v0-900 dark:text-v0-100 dark:hover:border-v0-600 dark:hover:bg-v0-900"
            >
              Ver curva normal
            </Link>
            <a
              href="#modules"
              className="inline-flex h-11 items-center gap-1 px-2 text-[14px] font-medium text-v0-500/70 transition-all duration-200 hover:text-v0-900 active:scale-[0.98] dark:text-v0-300/80 dark:hover:text-v0-100"
            >
              Explorar módulos
              <ChevronRight size={14} strokeWidth={1.75} />
            </a>
          </motion.div>

          {/* Terminal/CLI demo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 overflow-hidden rounded-lg border border-v0-950 bg-v0-950 text-v0-50 shadow-elevated dark:border-v0-50 dark:bg-v0-50 dark:text-v0-950"
          >
            <div className="flex items-center justify-between border-b border-v0-800 px-4 py-3 dark:border-v0-200/30">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-v0-700 dark:bg-v0-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-v0-700 dark:bg-v0-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-v0-700 dark:bg-v0-300" />
              </div>
              <span className="font-mono text-[11px] text-v0-400/70 dark:text-v0-500/70">
                statix · build.log
              </span>
              <div className="w-12" />
            </div>
            <div className="space-y-2 px-5 py-5 font-mono text-[13px] leading-relaxed sm:px-6">
              <p>
                <span className="text-emerald-500">$</span>
                <span className="ml-2 text-v0-300 dark:text-v0-600">statix</span>
                <span className="text-v0-50 dark:text-v0-950"> calculate binomial</span>
                <span className="text-v0-400/70 dark:text-v0-500/70"> --n=20 --p=0.3 --x=6</span>
              </p>
              <p className="text-v0-400/70 dark:text-v0-500/70">→ Building calculation…</p>
              <p className="text-v0-400/70 dark:text-v0-500/70">→ Validating parameters…</p>
              <p className="text-v0-400/70 dark:text-v0-500/70">→ Computing probability mass function…</p>
              <p className="mt-2 flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span className="text-v0-300 dark:text-v0-600">P(X = 6)</span>
                <span className="text-v0-50 dark:text-v0-950">=</span>
                <span className="font-semibold text-v0-50 dark:text-v0-950 tabular-nums">0.1916</span>
                <span className="text-v0-400/70 dark:text-v0-500/70">(19.16%)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span className="text-v0-300 dark:text-v0-600">E[X]</span>
                <span className="text-v0-50 dark:text-v0-950">=</span>
                <span className="font-semibold text-v0-50 dark:text-v0-950 tabular-nums">6.0000</span>
                <span className="text-v0-400/70 dark:text-v0-500/70">μ</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span className="text-v0-300 dark:text-v0-600">σ</span>
                <span className="text-v0-50 dark:text-v0-950">=</span>
                <span className="font-semibold text-v0-50 dark:text-v0-950 tabular-nums">2.0494</span>
                <span className="ml-1 inline-block h-3.5 w-1.5 animate-blink bg-v0-50 dark:bg-v0-900" />
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modules">
        <header className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
              /modules
            </p>
            <h2 className="mt-2.5 text-[32px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50 sm:text-[40px]">
              Cuatro módulos,
              <br className="sm:hidden" /> una plataforma.
            </h2>
          </div>
          <p className="hidden max-w-sm text-[13.5px] text-v0-500/70 dark:text-v0-300/80 lg:block">
            Cada uno corre en el navegador, persiste localmente y exporta a
            PDF con un solo clic.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {NAV_ITEMS.map((item, i) => {
            const Icon = ICONS[item.icon] ?? Sigma;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={item.path}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-v0-200/30 bg-v0-50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-v0-950 hover:shadow-soft dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-50"
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-medium tabular-nums text-v0-400/70 dark:text-v0-500/70">
                        0{i + 1}
                      </span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 transition-all duration-200 group-hover:border-v0-950 group-hover:bg-v0-950 group-hover:text-v0-50 dark:border-v0-800/30 dark:bg-v0-900 dark:group-hover:border-v0-50 dark:group-hover:bg-v0-50 dark:group-hover:text-v0-950">
                        <Icon
                          size={14}
                          strokeWidth={1.75}
                          className="text-v0-700 transition-colors group-hover:text-v0-50 dark:text-v0-300 dark:group-hover:text-v0-950"
                        />
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-v0-500/70 dark:text-v0-300/80">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11.5px] font-medium text-v0-500/70 transition-all duration-200 group-hover:gap-2.5 group-hover:text-v0-950 dark:text-v0-300/80 dark:group-hover:text-v0-50">
                    open <ArrowRight size={11} strokeWidth={1.75} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <header className="mb-7">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
            /features
          </p>
          <h2 className="mt-2.5 text-[32px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50 sm:text-[40px]">
            Construido para uso académico serio.
          </h2>
        </header>

        <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
          <div className="grid divide-y divide-v0-150/30 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              { icon: CheckCircle2, title: 'Resultados precisos', text: 'Función Gamma, normal estándar y cuantiles numéricos.' },
              { icon: Terminal, title: 'CLI mental', text: 'Cada acción se siente como ejecutar un comando: rápida, sin fricción.' },
              { icon: Sparkles, title: 'Fórmulas en LaTeX', text: 'Renderizado con KaTeX. Copia el resultado y pégalo en tu trabajo.' },
              { icon: Copy, title: 'Exporta a PDF', text: 'jsPDF con cabecera institucional, meta y secciones estructuradas.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                className="p-6 transition-colors hover:bg-v0-50/60 dark:hover:bg-v0-900/40"
              >
                <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
                  <f.icon size={14} strokeWidth={1.75} className="text-v0-800 dark:text-v0-200" />
                </span>
                <h3 className="text-[14px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
                  {f.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-v0-500/70 dark:text-v0-300/80">
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section>
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
          /stack
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {['React 18', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion',
            'Recharts', 'KaTeX', 'MathJS', 'Zod', 'jsPDF'].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-v0-200/30 bg-v0-50 px-2.5 py-1 font-mono text-[11.5px] text-v0-600 transition-colors hover:border-v0-300/60 hover:bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300 dark:hover:border-v0-700 dark:hover:bg-v0-900"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <p className="text-center font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
        <Terminal size={10} strokeWidth={1.75} className="mr-1 inline" />
        {APP_NAME} · {APP_TAGLINE}
      </p>
    </div>
  );
}
