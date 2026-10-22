// =====================================================
// Statix — MainLayout
// =====================================================
import { useState, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ScrollToHash } from '@/components/ScrollToHash';
import { useUIMode } from '@/context/UIModeContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { simpleMode } = useUIMode();
  return (
    // reducedMotion="user": respeta prefers-reduced-motion en todas las animaciones.
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-v0-50 text-v0-950 dark:bg-v0-950 dark:text-v0-50">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-v0-950 focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-medium focus:text-v0-50"
        >
          Saltar al contenido
        </a>
        <ScrollToHash />
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={simpleMode}
          />
          <main
            id="contenido"
            tabIndex={-1}
            className="min-h-[calc(100dvh-4rem)] min-w-0 flex-1 px-4 pb-24 pt-8 outline-none sm:px-6 sm:pt-10 lg:px-10"
          >
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
