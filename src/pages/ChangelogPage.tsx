// =====================================================
// Statix — ChangelogPage (historial de versiones)
// =====================================================
import { motion } from 'framer-motion';
import { GitCommitVertical, Plus, Wrench, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { CHANGELOG, type ChangeKind } from '@/content/changelog';

const KIND_META: Record<ChangeKind, { label: string; icon: typeof Plus; accent: string; chip: string }> = {
  added:   { label: 'Nuevo',    icon: Plus,    accent: 'text-emerald-600 dark:text-emerald-400', chip: 'border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400' },
  fixed:   { label: 'Arreglo',  icon: Wrench,  accent: 'text-amber-600 dark:text-amber-400',     chip: 'border-amber-500/25 bg-amber-500/[0.06] text-amber-700 dark:text-amber-400' },
  changed: { label: 'Cambio',   icon: RefreshCw, accent: 'text-accent-600 dark:text-accent-400', chip: 'border-accent-500/25 bg-accent-500/[0.06] text-accent-700 dark:text-accent-400' },
};

export function ChangelogPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Changelog"
        description="Historial de versiones de Statix. Aquí se registra todo lo que se añade, se arregla o se cambia en cada lanzamiento."
        icon={GitCommitVertical}
        badge={`v${CHANGELOG[0]?.version ?? '1.0.0'}`}
        status={{ label: 'Actualizado', tone: 'shipped' }}
      />

      <div className="relative space-y-8 before:absolute before:left-[7px] before:top-2 before:h-full before:w-px before:bg-v0-150/40 dark:before:bg-v0-800/40">
        {CHANGELOG.map((entry, i) => (
          <motion.section
            key={entry.version}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative pl-8"
          >
            {/* Punto en la línea de tiempo */}
            <span className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center">
              <span className={`h-3.5 w-3.5 rounded-full border-2 ${
                entry.current
                  ? 'border-emerald-500 bg-emerald-500/30'
                  : 'border-v0-300 bg-v0-50 dark:border-v0-600 dark:bg-v0-900'
              }`} />
            </span>

            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <h2 className="text-[20px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
                v{entry.version}
              </h2>
              {entry.current && (
                <span className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] px-2 py-0.5 font-mono text-[10.5px] font-medium text-emerald-700 dark:text-emerald-400">
                  actual
                </span>
              )}
              <span className="font-mono text-[11.5px] text-v0-400/70 dark:text-v0-500/70">
                {entry.date}
              </span>
            </div>
            <p className="mb-4 text-[13.5px] text-v0-600 dark:text-v0-300">{entry.title}</p>

            <ul className="space-y-2">
              {entry.changes.map((c, j) => {
                const meta = KIND_META[c.kind];
                const Icon = meta.icon;
                return (
                  <li
                    key={j}
                    className="flex items-start gap-3 rounded-lg border border-v0-150/30 bg-v0-50 px-4 py-2.5 dark:border-v0-800/30 dark:bg-v0-900"
                  >
                    <span className={`mt-0.5 inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.05em] ${meta.chip}`}>
                      <Icon size={10} strokeWidth={2.2} />
                      {meta.label}
                    </span>
                    <span className="flex-1 text-[13px] leading-relaxed text-v0-700 dark:text-v0-200">
                      {c.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
