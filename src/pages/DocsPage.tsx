// =====================================================
// Statix — DocsPage (centro de documentación)
// -----------------------------------------------------
// Índice único de toda la teoría: agrupa los artículos por
// módulo y enlaza a cada uno (navega a la página del módulo
// y hace scroll a su ancla).
// =====================================================
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowUpRight, Sigma, Layers, Activity, Target, TableProperties, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { THEORY_MODULES } from '@/content/theory';

const ICONS: Record<string, LucideIcon> = {
  binomial: Sigma,
  hypergeometric: Layers,
  normal: Activity,
  estimation: Target,
  anova: TableProperties,
};

export function DocsPage() {
  const totalArticles = THEORY_MODULES.reduce((acc, m) => acc + m.articles.length, 0);

  return (
    <div className="space-y-12">
      <PageHeader
        title="Documentación"
        description="Toda la teoría de Statix en un solo lugar: qué es cada distribución, qué significa cada parámetro, sus fórmulas y ejemplos resueltos paso a paso. Pulsa ⌘K para buscar cualquier tema."
        icon={BookOpen}
        badge={`${totalArticles} artículos`}
        status={{ label: 'Docs', tone: 'shipped' }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {THEORY_MODULES.map((mod, i) => {
          const Icon = ICONS[mod.id] ?? BookOpen;
          return (
            <motion.section
              key={mod.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900"
            >
              <div className="flex items-start gap-3 border-b border-v0-150/30 px-5 py-4 dark:border-v0-800/30">
                <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-950">
                  <Icon size={15} strokeWidth={1.75} className="text-v0-700 dark:text-v0-300" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
                    {mod.label}
                  </h2>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-v0-500/70 dark:text-v0-300/80">
                    {mod.tagline}
                  </p>
                </div>
              </div>

              <ul className="flex-1 divide-y divide-v0-150/30 dark:divide-v0-800/30">
                {mod.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`${mod.path}#${article.id}`}
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-v0-75 dark:hover:bg-v0-800/30"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-v0-800 dark:text-v0-100">
                          {article.title}
                        </span>
                        <span className="block truncate text-[11.5px] text-v0-500/70 dark:text-v0-400">
                          {article.summary}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.9}
                        className="flex-shrink-0 text-v0-300 transition-all group-hover:translate-x-0.5 group-hover:text-v0-700 dark:text-v0-600 dark:group-hover:text-v0-200"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                to={mod.path}
                className="flex items-center justify-between border-t border-v0-150/30 px-5 py-3 font-mono text-[11.5px] font-medium text-v0-500/70 transition-colors hover:text-v0-900 dark:border-v0-800/30 dark:text-v0-300/80 dark:hover:text-v0-50"
              >
                Abrir calculadora
                <ArrowUpRight size={12} strokeWidth={1.9} />
              </Link>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
