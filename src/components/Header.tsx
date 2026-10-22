// =====================================================
// Statix — Header
// Barra sólida: marca, buscador de conceptos, modo y tema.
// =====================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Github } from 'lucide-react';
import { APP_NAME } from '@/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModeToggle } from '@/components/ModeToggle';
import { SearchModal } from '@/components/SearchModal';
import { Logo } from '@/components/Logo';
import { useUIMode } from '@/context/UIModeContext';

const GITHUB_URL = 'https://github.com/AnthonyDev65';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { simpleMode } = useUIMode();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

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
      <header className="sticky top-0 z-40 w-full border-b border-v0-150 bg-v0/90 backdrop-blur-md dark:border-v0-800 dark:bg-v0-950/90">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onMenuClick}
            className={`-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-v0-600 transition-colors hover:bg-v0-100 hover:text-v0-900 active:scale-95 dark:text-v0-300 dark:hover:bg-v0-800 dark:hover:text-v0-50 ${
              simpleMode ? '' : 'lg:hidden'
            }`}
            aria-label="Abrir menú"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label={`${APP_NAME}, inicio`}>
            <Logo />
            <span translate="no" className="text-[18px] font-semibold tracking-vercel text-v0-950 dark:text-v0-50">
              {APP_NAME}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2.5 rounded-md border border-v0-150 bg-v0-50 px-3 text-[14px] text-v0-600 transition-colors hover:border-v0-300 hover:text-v0-900 dark:border-v0-800 dark:bg-v0-900 dark:text-v0-300 dark:hover:border-v0-600 dark:hover:text-v0-50 sm:inline-flex lg:min-w-[260px]"
            >
              <Search size={15} strokeWidth={1.9} />
              <span className="flex-1 text-left">Buscar un concepto…</span>
              <kbd className="hidden font-sans text-[13px] text-v0-600 dark:text-v0-300 lg:inline">
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-v0-600 transition-colors hover:bg-v0-100 hover:text-v0-900 active:scale-95 dark:text-v0-300 dark:hover:bg-v0-800 dark:hover:text-v0-50 sm:hidden"
              aria-label="Buscar un concepto"
            >
              <Search size={19} strokeWidth={1.9} />
            </button>

            <ModeToggle />

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 items-center justify-center rounded-md text-v0-600 transition-colors hover:bg-v0-100 hover:text-v0-900 active:scale-95 dark:text-v0-300 dark:hover:bg-v0-800 dark:hover:text-v0-50 sm:inline-flex"
              aria-label="Código fuente en GitHub"
            >
              <Github size={17} strokeWidth={1.75} />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
