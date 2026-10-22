// =====================================================
// Statix — Logo
// Evolución del logo original (cuadro negro, trazo blanco, punto azul).
// El trazo es la función de distribución acumulada de la normal: una "S"
// que sube de 0 a 1 y termina en el punto azul, el resultado.
// =====================================================

/** Trazo de la marca en una retícula de 32×32. */
const LOGO_PATH = 'M6 23C12 23 14.6 19.8 16 16C17.4 12.2 20 9 26 9';
const LOGO_DOT = { cx: 26, cy: 9, r: 2.4 };

export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-[22%] bg-v0-950 text-v0-50 transition-transform duration-300 hover:scale-105 dark:bg-v0-50 dark:text-v0-950 ${className}`}
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" aria-hidden="true">
        <path d={LOGO_PATH} stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle {...LOGO_DOT} fill="#0070F3" />
      </svg>
    </span>
  );
}
