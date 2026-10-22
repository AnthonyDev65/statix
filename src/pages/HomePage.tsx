// =====================================================
// Statix — HomePage
// Un "informe impreso" de la estadística: mosaico de gráficos históricos,
// el tablero de Galton en vivo y una entrada por pregunta.
// =====================================================
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { APP_NAME, NAV_GROUPS, NAV_ITEMS } from '@/constants';
import { GaltonLive } from '@/components/home/GaltonLive';

const EASE = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -80px 0px' },
};

/** Temas en preparación: se listan para que se vea hacia dónde crece Statix. */
const UPCOMING = [
  { question: '¿Cuántas llegadas por hora puedo esperar?', topic: 'Distribución de Poisson' },
  { question: '¿Mi muestra contradice lo que se afirma?', topic: 'Pruebas de hipótesis' },
  { question: '¿Cómo resumo y dibujo mis datos?', topic: 'Estadística descriptiva' },
  { question: '¿Dos variables están relacionadas?', topic: 'Correlación y regresión' },
];

export function HomePage() {
  return (
    <div className="-mx-4 -mt-8 sm:-mx-6 sm:-mt-10 lg:-mx-10">
      <Masthead />

      {/* Título y entrada */}
      <section className="px-4 pb-24 pt-12 sm:px-6 lg:px-10 lg:pb-32 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[42%_1fr]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            className="order-2 max-w-[34ch] text-pretty text-[19px] leading-relaxed text-v0-700 dark:text-v0-200 lg:order-1 lg:pt-3 lg:text-[20px]"
          >
            Probabilidades, intervalos de confianza y ANOVA, con la fórmula, el gráfico y la
            explicación de cada número en la misma página.
          </motion.p>
          <div className="order-1 lg:order-2">
            <h1 className="text-[clamp(48px,6.2vw,96px)] font-semibold leading-[0.92] tracking-tightest text-v0-950 dark:text-v0-50">
              <MaskedLine delay={0}>Del azar</MaskedLine>
              <MaskedLine delay={0.11}>a la campana</MaskedLine>
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <Link
                to="/binomial"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-v0-950 px-6 text-[16px] font-semibold text-v0-50 transition-[background-color,transform] duration-150 hover:bg-v0-800 active:scale-[0.98] dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200"
              >
                Empezar por la binomial
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a
                href="#preguntas"
                className="text-[16px] font-semibold text-v0-950 underline-offset-4 hover:underline dark:text-v0-50"
              >
                Ver todos los temas
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tablero de Galton */}
      <section className="border-y border-v0-150 bg-v0 px-4 py-24 dark:border-v0-800 dark:bg-v0-900 sm:px-6 lg:px-10 lg:py-32">
        <motion.div {...reveal} transition={{ duration: 0.6, ease: EASE }} className="mb-12 grid gap-6 lg:grid-cols-[42%_1fr]">
          <h2 className="max-w-[14ch] text-[clamp(34px,3.6vw,52px)] font-semibold leading-[1] tracking-tighter text-v0-950 dark:text-v0-50">
            Mueve n y mira nacer la campana
          </h2>
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-v0-700 dark:text-v0-200">
            En 1889 Francis Galton dejó caer bolas entre clavos: cada clavo es un ensayo con
            dos salidas, y el montón final dibuja una campana. Aquí puedes repetir el experimento
            sin bolas.
          </p>
        </motion.div>
        <motion.div {...reveal} transition={{ duration: 0.6, delay: 0.08, ease: EASE }}>
          <GaltonLive />
        </motion.div>
      </section>

      {/* Entrada por pregunta */}
      <section id="preguntas" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <motion.h2
          {...reveal}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-[20ch] text-[clamp(36px,4.2vw,64px)] font-semibold leading-[0.98] tracking-tighter text-v0-950 dark:text-v0-50 lg:pl-[3vw]"
        >
          Empieza por la pregunta que tienes
        </motion.h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-[42%_1fr]">
          <motion.figure
            {...reveal}
            transition={{ duration: 0.7, ease: EASE }}
            className="order-2 self-end lg:order-1 lg:pr-12"
          >
            <img
              src="/images/gauss.webp"
              width={900}
              height={1147}
              alt="Retrato al óleo de Carl Friedrich Gauss en 1840, con gorro negro y abrigo oscuro"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full max-w-[340px] rounded-md object-cover grayscale contrast-[1.05]"
            />
            <figcaption className="mt-3 text-[14px] text-v0-600 dark:text-v0-300">
              Carl Friedrich Gauss, 1840. La curva normal lleva su nombre.
            </figcaption>
          </motion.figure>

          <div className="order-1 lg:order-2">
            {NAV_GROUPS.map((group, gi) => (
              <motion.div
                key={group.id}
                {...reveal}
                transition={{ duration: 0.5, delay: gi * 0.08, ease: EASE }}
                className={gi > 0 ? 'mt-11' : ''}
              >
                <h3 className="mb-2 text-[15px] font-semibold text-v0-950 dark:text-v0-50">
                  {group.label}
                </h3>
                <ul>
                  {NAV_ITEMS.filter((i) => i.group === group.id).map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className="group -mx-3 grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 rounded-md px-3 py-3 transition-colors hover:bg-v0-100 dark:hover:bg-v0-900 sm:grid-cols-[1fr_minmax(0,220px)_auto]"
                      >
                        <span className="text-[17px] font-medium text-v0-950 dark:text-v0-50">
                          {item.question}
                        </span>
                        <span className="col-start-1 text-[15px] text-v0-600 dark:text-v0-300 sm:col-start-2">
                          {item.short}{' '}
                          <span className="text-v0-600 dark:text-v0-300">{item.notation}</span>
                        </span>
                        <ArrowRight
                          size={17}
                          aria-hidden="true"
                          className="col-start-2 row-start-1 text-v0-950 transition-transform group-hover:translate-x-1 dark:text-v0-50 sm:col-start-3"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.16, ease: EASE }} className="mt-11">
              <h3 className="mb-2 text-[15px] font-semibold text-v0-600 dark:text-v0-300">
                En preparación
              </h3>
              <ul>
                {UPCOMING.map((u) => (
                  <li
                    key={u.topic}
                    className="grid grid-cols-1 gap-x-6 gap-y-1 py-3 sm:grid-cols-[1fr_minmax(0,220px)_17px]"
                  >
                    <span className="text-[17px] text-v0-600 dark:text-v0-300">{u.question}</span>
                    <span className="text-[15px] text-v0-500 dark:text-v0-300">{u.topic}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cómo funciona: lo que escribes y lo que recibes */}
      <section className="border-y border-v0-150 bg-v0 px-4 py-24 dark:border-v0-800 dark:bg-v0-900 sm:px-6 lg:px-10 lg:py-32">
        <div className="lg:pl-[42%]">
          <motion.h2
            {...reveal}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[28px] font-semibold tracking-tighter text-v0-950 dark:text-v0-50"
          >
            Un cálculo, tres respuestas
          </motion.h2>

          <div className="mt-12 max-w-[560px] space-y-20">
            <Exchange
              say="Primero, escribe los datos de tu problema."
              call={
                <div className="flex flex-wrap gap-2" data-ui>
                  {[['Ensayos (n)', '20'], ['Probabilidad (p)', '0,30'], ['Éxitos (x)', '6']].map(([l, v]) => (
                    <div key={l} className="min-w-[132px] flex-1 rounded-md bg-v0-50 px-3 py-2.5 dark:bg-v0-950">
                      <span className="block text-[13px] text-v0-600 dark:text-v0-300">{l}</span>
                      <span className="text-[18px] font-semibold tabular-nums text-v0-950 dark:text-v0-50">{v}</span>
                    </div>
                  ))}
                </div>
              }
              response={
                <p className="text-[16px] text-v0-800 dark:text-v0-100">
                  <span className="text-v0-600 dark:text-v0-300">P(X = 6) =</span>{' '}
                  <strong className="text-[28px] font-semibold tabular-nums text-v0-950 dark:text-v0-50">0,1916</strong>
                </p>
              }
            />
            <Exchange
              say="Después, lee qué significa en palabras."
              call={
                <p className="text-[16px] text-v0-700 dark:text-v0-200">
                  ¿Y eso es mucho o poco?
                </p>
              }
              response={
                <p className="text-[16px] leading-relaxed text-v0-800 dark:text-v0-100">
                  Si repites el experimento 100 veces, en unas 19 obtendrás exactamente 6 éxitos.
                  Lo más habitual es sacar 6, porque la media es n·p = 6.
                </p>
              }
            />
            <Exchange
              wide
              say="Por último, comprueba de dónde sale."
              call={
                <p className="text-[16px] text-v0-700 dark:text-v0-200">
                  Activa el modo Aprender para ver la fórmula y la teoría.
                </p>
              }
              response={
                <div className="space-y-2 text-[18px] text-v0-900 dark:text-v0-50">
                  <p className="tabular-nums">P(X = x) = C(n, x) · pˣ · (1 − p)ⁿ⁻ˣ</p>
                  <p className="tabular-nums text-v0-700 dark:text-v0-200">
                    = C(20, 6) · 0,3⁶ · 0,7¹⁴ = 38 760 · 0,000729 · 0,006782 = 0,1916
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MaskedLine({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function BrandCurve({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="4 6 24 20" fill="none" className={className} aria-hidden="true">
      <path d="M6 23C12 23 14.6 19.8 16 16C17.4 12.2 20 9 26 9" stroke="#FAFAFA" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="26" cy="9" r="1.6" fill="#0070F3" />
    </svg>
  );
}

/** Mosaico sin separaciones de gráficos históricos y bloques de color. */
function Masthead() {
  const img = 'h-full w-full object-cover grayscale contrast-[1.05]';
  return (
    <div className="grid h-[38vh] min-h-[260px] grid-cols-3 grid-rows-2 border-b border-v0-150 dark:border-v0-800 lg:h-[46vh] lg:max-h-[520px] lg:grid-cols-5">
      <div className="row-span-2 overflow-hidden bg-v0-900">
        <img
          src="/images/galton-box.webp"
          width={1000}
          height={1500}
          alt="Tablero de Galton de madera: bolas que caen entre clavos y se apilan formando una campana"
          className={`${img} animate-[drift_24s_ease-in-out_infinite_alternate] motion-reduce:animate-none`}
        />
      </div>
      <div className="col-span-2 overflow-hidden lg:col-span-2">
        <img
          src="/images/nightingale-mortality.webp"
          width={1600}
          height={876}
          alt="Diagrama de áreas polares de Florence Nightingale sobre las causas de muerte en el ejército, 1858"
          className={img}
        />
      </div>
      <div className="hidden bg-accent-500 p-5 lg:flex lg:items-end">
        <p className="text-[clamp(28px,3vw,44px)] font-semibold leading-none tracking-tighter text-white">1858</p>
      </div>
      {/* La marca de Statix a gran escala: la acumulada que termina en el punto azul. */}
      <div className="row-span-2 hidden items-center justify-center bg-v0-950 dark:bg-v0-900 lg:flex">
        <BrandCurve className="w-3/4" />
      </div>
      <div className="flex items-center justify-center bg-v0-950 dark:bg-v0-900 lg:hidden">
        <BrandCurve className="w-2/3" />
      </div>
      <div className="overflow-hidden lg:col-span-2">
        <img
          src="/images/minard.webp"
          width={1600}
          height={763}
          alt="Mapa de Charles Minard de 1869 sobre la campaña de Napoleón en Rusia: el ancho de la franja muestra los soldados"
          className={img}
        />
      </div>
      <div className="hidden overflow-hidden lg:block">
        <img
          src="/images/playfair-piecharts.webp"
          width={1600}
          height={877}
          alt="Gráficos circulares de William Playfair de 1801 comparando la población y la extensión de las naciones de Europa"
          className={img}
        />
      </div>
    </div>
  );
}

function Exchange({
  say, call, response, wide = false,
}: {
  say: string;
  call: React.ReactNode;
  response: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease: EASE }}>
      <p className="text-[20px] font-medium text-v0-950 dark:text-v0-50">{say}</p>
      <div className="mt-4 rounded-md bg-v0-100 p-5 dark:bg-v0-800">{call}</div>
      <div
        className={`mt-4 rounded-md border border-v0-150 bg-v0 p-5 dark:border-v0-800 dark:bg-v0-900 sm:ml-14 ${
          wide ? 'lg:max-w-[720px]' : ''
        }`}
      >
        {response}
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="flex min-h-[80dvh] flex-col justify-between bg-v0-950 px-4 pb-6 pt-12 text-v0-50 dark:bg-v0-900 sm:px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-8 text-[16px] lg:grid-cols-4">
        <div>
          <p className="font-semibold">Probabilidad</p>
          <ul className="mt-2 space-y-1.5 text-v0-300">
            {NAV_ITEMS.filter((i) => i.group === 'probabilidad').map((i) => (
              <li key={i.id}><Link className="hover:text-v0-50 hover:underline" to={i.path}>{i.short}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Inferencia</p>
          <ul className="mt-2 space-y-1.5 text-v0-300">
            {NAV_ITEMS.filter((i) => i.group === 'inferencia').map((i) => (
              <li key={i.id}><Link className="hover:text-v0-50 hover:underline" to={i.path}>{i.short}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Aprender</p>
          <ul className="mt-2 space-y-1.5 text-v0-300">
            <li><Link className="hover:text-v0-50 hover:underline" to="/docs">Teoría y fórmulas</Link></li>
            <li><Link className="hover:text-v0-50 hover:underline" to="/changelog">Novedades</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Proyecto</p>
          <ul className="mt-2 space-y-1.5 text-v0-300">
            <li><a className="hover:text-v0-50 hover:underline" href="https://github.com/AnthonyDev65" target="_blank" rel="noopener noreferrer">Código en GitHub</a></li>
            <li>Funciona en tu navegador, sin cuenta</li>
          </ul>
        </div>
      </div>

      <div>
        <svg viewBox="0 0 300 70" className="mt-16 w-full" role="img" aria-label={APP_NAME}>
          <text
            x="-4"
            y="64"
            textLength="306"
            lengthAdjust="spacingAndGlyphs"
            className="fill-current text-[86px] font-semibold tracking-tighter"
          >
            {APP_NAME}
          </text>
        </svg>
        <p className="mt-4 max-w-[110ch] text-[13px] leading-relaxed text-v0-300">
          Imágenes: tablero de Galton,{' '}
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:Galton_box.jpg">“Galton box”</a>,
          exhibición de Estes Objethos Atelier, foto de Rodrigo.Argenton,{' '}
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
          {' '}<a className="underline" href="https://commons.wikimedia.org/wiki/File:Nightingale-mortality.jpg">Florence Nightingale, 1858</a>;
          {' '}<a className="underline" href="https://commons.wikimedia.org/wiki/File:Minard.png">Charles Minard, 1869</a>;
          {' '}<a className="underline" href="https://commons.wikimedia.org/wiki/File:Playfair_piecharts.jpg">William Playfair, 1801</a>;
          {' '}<a className="underline" href="https://commons.wikimedia.org/wiki/File:Carl_Friedrich_Gauss_1840_by_Jensen.jpg">Christian Albrecht Jensen, retrato de Gauss, 1840</a>.
          Dominio público salvo indicación. Todas vía Wikimedia Commons, convertidas a escala de grises.
        </p>
      </div>
    </footer>
  );
}
