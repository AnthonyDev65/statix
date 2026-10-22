// =====================================================
// Statix — TheoryDocs
// -----------------------------------------------------
// Renderiza la documentación/teoría de un módulo a partir
// de src/content/theory.ts. Cada artículo lleva un id como
// ancla para que el buscador del header pueda hacer scroll.
// =====================================================
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { motion } from 'framer-motion';
import {
  BookOpen, Lightbulb, AlertTriangle, Info, FlaskConical, Hash,
} from 'lucide-react';
import type { DistributionType } from '@/types';
import type { TheoryArticle, TheoryBlock } from '@/content/theory';
import { getTheoryModule } from '@/content/theory';
import { MathText } from '@/components/MathText';

interface TheoryDocsProps {
  moduleId: DistributionType;
}

export function TheoryDocs({ moduleId }: TheoryDocsProps) {
  const mod = getTheoryModule(moduleId);
  if (!mod) return null;

  return (
    <section className="space-y-6 pt-8">
      <header>
        <h2 className="flex items-center gap-2.5 text-[22px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
          <BookOpen size={20} strokeWidth={1.75} className="text-v0-700 dark:text-v0-300" aria-hidden="true" />
          Teoría paso a paso
        </h2>
        <p className="mt-1.5 max-w-[65ch] text-[15px] leading-relaxed text-v0-600 dark:text-v0-300">
          {mod.tagline} Usa «Buscar un concepto» (Ctrl K) para saltar a cualquier tema.
        </p>
      </header>

      <div className="space-y-4">
        {mod.articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </section>
  );
}

function ArticleCard({ article, index }: { article: TheoryArticle; index: number }) {
  return (
    <motion.article
      id={article.id}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.04 }}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-v0-150 bg-v0-50 dark:border-v0-800 dark:bg-v0-900"
    >
      <div className="flex items-center gap-2.5 border-b border-v0-150 px-5 py-3 dark:border-v0-800">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-v0-150 bg-v0-50 dark:border-v0-800 dark:bg-v0-950">
          <Hash size={11} strokeWidth={2} className="text-v0-500 dark:text-v0-300" />
        </span>
        <h3 className="text-[15px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
          {article.title}
        </h3>
      </div>
      <div className="space-y-4 px-5 py-5">
        {article.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </motion.article>
  );
}

function Block({ block }: { block: TheoryBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="text-[13.5px] leading-relaxed text-v0-600 dark:text-v0-300">
          <MathText>{block.text}</MathText>
        </p>
      );

    case 'formula':
      return <BlockMath latex={block.latex} caption={block.caption} />;

    case 'params':
      return (
        <div className="overflow-hidden rounded-lg border border-v0-150 dark:border-v0-800">
          {block.items.map((p, i) => (
            <div
              key={p.symbol}
              className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4 ${
                i > 0 ? 'border-t border-v0-150 dark:border-v0-800' : ''
              }`}
            >
              <div className="flex w-40 flex-shrink-0 items-baseline gap-2">
                <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-v0-950 px-2 py-0.5 text-[13px] font-semibold text-v0-50 dark:bg-v0-50 dark:text-v0-950">
                  {p.symbol}
                </span>
                <span className="text-[13px] font-medium text-v0-800 dark:text-v0-200">
                  {p.name}
                </span>
              </div>
              <div className="flex-1 text-[13px] leading-relaxed text-v0-500/80 dark:text-v0-300">
                <MathText>{p.description}</MathText>
                {p.constraint && (
                  <span className="ml-1.5 inline-block rounded border border-v0-150 px-1.5 py-px text-[13px] text-v0-500 dark:border-v0-800 dark:text-v0-300">
                    <MathText>{p.constraint}</MathText>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      );

    case 'list':
      return block.ordered ? (
        <ol className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-v0-600 dark:text-v0-300">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-v0-100 text-[13px] font-semibold text-v0-700 dark:bg-v0-800 dark:text-v0-200">
                {i + 1}
              </span>
              <span className="pt-px"><MathText>{item}</MathText></span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-v0-600 dark:text-v0-300">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-v0-400 dark:bg-v0-500" />
              <span><MathText>{item}</MathText></span>
            </li>
          ))}
        </ul>
      );

    case 'callout':
      return <Callout block={block} />;

    case 'example':
      return (
        <div className="overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]">
          <div className="flex items-center gap-2 border-b border-emerald-500/15 px-4 py-2.5">
            <FlaskConical size={13} strokeWidth={1.9} className="text-emerald-600 dark:text-emerald-400" />
            <span className=" text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
              Ejemplo resuelto
            </span>
          </div>
          <div className="space-y-3 px-4 py-4">
            <p className="text-[13px] font-medium leading-relaxed text-v0-800 dark:text-v0-100">
              <MathText>{block.statement}</MathText>
            </p>
            <ol className="space-y-1.5">
              {block.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-v0-600 dark:text-v0-300">
                  <span className=" text-[13px] text-emerald-600/80 dark:text-emerald-400/80">
                    {i + 1}.
                  </span>
                  <span><MathText>{s}</MathText></span>
                </li>
              ))}
            </ol>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[13px] font-medium text-emerald-800 dark:text-emerald-300">
              {block.result}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

const CALLOUT_STYLES = {
  tip: {
    icon: Lightbulb,
    box: 'border-accent-500/20 bg-accent-500/[0.05]',
    accent: 'text-accent-600 dark:text-accent-400',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-amber-500/25 bg-amber-500/[0.05]',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  note: {
    icon: Info,
    box: 'border-v0-300 bg-v0-100/40 dark:border-v0-800 dark:bg-v0-800/30',
    accent: 'text-v0-600 dark:text-v0-300',
  },
} as const;

function Callout({ block }: { block: Extract<TheoryBlock, { kind: 'callout' }> }) {
  const style = CALLOUT_STYLES[block.tone];
  const Icon = style.icon;
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 ${style.box}`}>
      <Icon size={15} strokeWidth={1.9} className={`mt-0.5 flex-shrink-0 ${style.accent}`} />
      <div>
        {block.title && (
          <p className={`mb-0.5 text-[13px] font-semibold ${style.accent}`}>
            {block.title}
          </p>
        )}
        <p className="text-[13px] leading-relaxed text-v0-600 dark:text-v0-300">
          <MathText>{block.text}</MathText>
        </p>
      </div>
    </div>
  );
}

/** Fórmula en bloque (display mode) renderizada con KaTeX. */
function BlockMath({ latex, caption }: { latex: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
        strict: 'ignore',
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex]);

  return (
    <figure className="overflow-hidden rounded-lg border border-v0-150 bg-v0-75/40 dark:border-v0-800 dark:bg-v0-950/40">
      <div ref={ref} className="overflow-x-auto px-4 py-4 text-[15px] text-v0-950 dark:text-v0-50" />
      {caption && (
        <figcaption className="border-t border-v0-150 px-4 py-2 text-[13px] leading-relaxed text-v0-500 dark:border-v0-800 dark:text-v0-300">
          <MathText>{caption}</MathText>
        </figcaption>
      )}
    </figure>
  );
}
