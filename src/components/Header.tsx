// =====================================================
// Statix — Header (Vercel-style)
// =====================================================
import { useEffect, useState } from 'react';
import { Menu, Search, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModeToggle } from '@/components/ModeToggle';
import { SearchModal } from '@/components/SearchModal';
import { useUIMode } from '@/context/UIModeContext';

const GITHUB_URL = 'https://github.com/AnthonyDev65';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { simpleMode } = useUIMode();

  // Atajo global ⌘K / Ctrl+K para abrir el buscador de teoría.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-v0-150/30 bg-v0-50/80 backdrop-blur-md dark:border-v0-800/30 dark:bg-v0-950/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-5 sm:px-7 lg:px-10">
        {/* Botón menú mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          className={`-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-v0-500/70 transition-all duration-200 hover:bg-v0-75 hover:text-v0-900 active:scale-95 active:bg-v0-100 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100 dark:active:bg-v0-800 ${
            simpleMode ? '' : 'lg:hidden'
          }`}
          aria-label="Abrir menú"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        {/* Logo + nombre */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <Logo />
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
              {APP_NAME}
            </span>
            <span className="hidden font-mono text-[11px] font-medium text-v0-400/70 dark:text-v0-500/70 sm:inline">
              / v1.0
            </span>
          </div>
        </motion.a>

        {/* Separador + tagline (desktop) */}
        <div className="mx-2 hidden h-5 w-px bg-v0-150 dark:bg-v0-800 lg:block" />
        <span className="hidden font-mono text-[12px] text-v0-500/70 dark:text-v0-300/80 lg:inline">
          {APP_TAGLINE}
        </span>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          {/* Buscador de teoría (desktop) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 items-center gap-2 rounded-md border border-v0-150/30 bg-v0-50 px-3 font-mono text-[11.5px] text-v0-500/70 transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 hover:text-v0-800 active:scale-[0.98] dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300/80 dark:hover:border-v0-700 dark:hover:bg-v0-800 dark:hover:text-v0-200 sm:inline-flex"
            aria-label="Buscar en la documentación"
          >
            <Search size={12} strokeWidth={2} />
            <span>Buscar teoría</span>
            <span className="ml-2 flex items-center gap-0.5">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>

          {/* Buscador (mobile, solo icono) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-v0-500/70 transition-all duration-200 hover:bg-v0-75 hover:text-v0-900 active:scale-95 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100 sm:hidden"
            aria-label="Buscar en la documentación"
          >
            <Search size={18} strokeWidth={1.9} />
          </button>

          {/* Status badge — Vercel style: dot pulsante + texto mono */}
          {!simpleMode && (
            <span className="hidden items-center gap-2 rounded-md border border-v0-150/30 bg-v0-50 px-2.5 py-1.5 font-mono text-[11px] font-medium text-v0-700 transition-colors dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-200 md:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Ready
            </span>
          )}

          {/* GitHub icon */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 w-10 items-center justify-center rounded-md text-v0-500/70 transition-all duration-200 hover:bg-v0-75 hover:text-v0-900 active:scale-95 active:bg-v0-100 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100 dark:active:bg-v0-800 sm:inline-flex"
            aria-label="Repositorio en GitHub"
          >
            <Github size={16} strokeWidth={1.75} />
          </a>

          {/* Toggle Simple / Completo */}
          <ModeToggle />

          <div className="mx-0.5 hidden h-6 w-px bg-v0-150 dark:bg-v0-800 sm:block" />

          <ThemeToggle />
        </div>
      </div>
    </header>
    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function Logo() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-v0-950 transition-transform duration-300 hover:scale-105 dark:bg-v0-50">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 17.5L10 9L13.5 13L18 6.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-v0-50 dark:text-v0-950"
        />
        <circle cx="18" cy="6.5" r="1.8" className="fill-accent-500" />
      </svg>
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-v0-200/30 bg-v0-50 px-1 font-mono text-[10px] font-medium text-v0-500/70 dark:border-v0-700/30 dark:bg-v0-800 dark:text-v0-300/80">
      {children}
    </kbd>
  );
}
