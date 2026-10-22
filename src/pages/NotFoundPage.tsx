// =====================================================
// Statix — NotFoundPage (404)
// =====================================================
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <Logo className="h-12 w-12" />
      <h1 className="mt-6 text-[32px] font-semibold tracking-tighter text-v0-950 dark:text-v0-50">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-v0-700 dark:text-v0-200">
        Puede que el enlace esté mal escrito o que la página se haya movido. Elige un tema
        desde el menú o vuelve a empezar.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-md bg-v0-950 px-5 text-[15px] font-semibold text-v0-50 transition-colors hover:bg-v0-800 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200"
        >
          Volver al inicio
        </Link>
        <Link
          to="/docs"
          className="inline-flex h-11 items-center rounded-md border border-v0-150 bg-v0 px-5 text-[15px] font-medium text-v0-900 transition-colors hover:border-v0-300 dark:border-v0-800 dark:bg-v0-950 dark:text-v0-50 dark:hover:border-v0-600"
        >
          Ver la teoría
        </Link>
      </div>
    </div>
  );
}
