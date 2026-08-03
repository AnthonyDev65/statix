// =====================================================
// Statix — SearchModal (command palette)
// -----------------------------------------------------
// Busca por título / palabras clave en la documentación
// (src/content/theory.ts) y navega al artículo correspondiente,
// haciendo scroll hasta su ancla.
// =====================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, X, FileText } from 'lucide-react';
import { THEORY_ARTICLES, getTheoryModule } from '@/content/theory';
import type { TheoryArticle } from '@/content/theory';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/** Quita acentos y pasa a minúsculas para comparar sin diacríticos. */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

interface Indexed {
  article: TheoryArticle;
  moduleLabel: string;
  path: string;
  haystack: string;
}

const INDEX: Indexed[] = THEORY_ARTICLES.map((article) => {
  const mod = getTheoryModule(article.moduleId);
  return {
    article,
    moduleLabel: mod?.label ?? '',
    path: mod?.path ?? '/',
    haystack: normalize(
      [article.title, article.summary, mod?.label ?? '', ...article.keywords].join(' '),
    ),
  };
});

export function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resultados: si no hay consulta, mostramos todo (agrupado por orden natural).
  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return INDEX;
    const terms = q.split(/\s+/);
    return INDEX.filter((it) => terms.every((t) => it.haystack.includes(t)));
  }, [query]);

  // Al abrir: limpiar y enfocar.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // foco tras el montaje/animación
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Mantener el índice activo dentro de rango.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  const select = (it: Indexed | undefined) => {
    if (!it) return;
    onClose();
    navigate(`${it.path}#${it.article.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-v0-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en la documentación"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-v0-200/40 bg-v0-50 shadow-elevated dark:border-v0-700/40 dark:bg-v0-900"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-v0-150/40 px-4 dark:border-v0-800/40">
              <Search size={16} strokeWidth={1.9} className="flex-shrink-0 text-v0-400 dark:text-v0-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar teoría: binomial, media, z-score, intervalo…"
                className="h-12 w-full bg-transparent text-[14px] text-v0-950 placeholder:text-v0-400/70 focus:outline-none dark:text-v0-50 dark:placeholder:text-v0-500/70"
              />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-v0-400 transition-colors hover:text-v0-700 dark:text-v0-500 dark:hover:text-v0-200"
                aria-label="Cerrar"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-v0-500/70 dark:text-v0-400">
                  Sin resultados para “{query}”.
                </p>
              ) : (
                <ul>
                  {results.map((it, i) => (
                    <li key={it.article.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => select(it)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === active
                            ? 'bg-v0-100 dark:bg-v0-800/60'
                            : 'hover:bg-v0-75 dark:hover:bg-v0-800/30'
                        }`}
                      >
                        <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-v0-200/40 bg-v0-50 dark:border-v0-700/40 dark:bg-v0-900">
                          <FileText size={13} strokeWidth={1.75} className="text-v0-500 dark:text-v0-300" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-v0-950 dark:text-v0-50">
                            {it.article.title}
                          </span>
                          <span className="block truncate text-[11.5px] text-v0-500/70 dark:text-v0-400">
                            {it.moduleLabel} · {it.article.summary}
                          </span>
                        </span>
                        {i === active && (
                          <CornerDownLeft size={13} strokeWidth={1.9} className="flex-shrink-0 text-v0-400 dark:text-v0-500" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer con atajos */}
            <div className="flex items-center justify-between border-t border-v0-150/40 px-4 py-2 dark:border-v0-800/40">
              <span className="font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
                {results.length} resultado{results.length === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-3 font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
                <span className="flex items-center gap-1"><Key>↑</Key><Key>↓</Key> navegar</span>
                <span className="flex items-center gap-1"><Key>↵</Key> abrir</span>
                <span className="flex items-center gap-1"><Key>esc</Key> cerrar</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-v0-200/40 bg-v0-50 px-1 text-[10px] text-v0-500/70 dark:border-v0-700/40 dark:bg-v0-800 dark:text-v0-300/80">
      {children}
    </kbd>
  );
}
