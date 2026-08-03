// =====================================================
// Statix — MainLayout
// =====================================================
import { useState, type ReactNode } from 'react';
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
    <div className="min-h-screen bg-v0-50 text-v0-950 dark:bg-v0-950 dark:text-v0-50">
      <ScrollToHash />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={simpleMode}
        />
        <main className="min-h-[calc(100vh-4rem)] flex-1 px-5 pb-20 pt-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
