// =====================================================
// Statix — ScrollToHash
// -----------------------------------------------------
// Cuando la URL incluye un #ancla (p. ej. al saltar desde el
// buscador), desplaza la vista hasta el artículo de teoría
// correspondiente, reintentando hasta que la página monte.
// =====================================================
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let raf = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // resalte breve para ubicar el artículo
        el.classList.add('ring-2', 'ring-accent-500/40');
        window.setTimeout(() => el.classList.remove('ring-2', 'ring-accent-500/40'), 1400);
        return;
      }
      if (tries++ < 30) raf = window.requestAnimationFrame(tryScroll);
    };

    raf = window.requestAnimationFrame(tryScroll);
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
