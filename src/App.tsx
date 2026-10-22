// =====================================================
// Statix - App
// =====================================================
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { UIModeProvider } from '@/context/UIModeContext';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';

const BinomialPage = lazy(() =>
  import('@/pages/BinomialPage').then((m) => ({ default: m.BinomialPage })),
);
const HypergeometricPage = lazy(() =>
  import('@/pages/HypergeometricPage').then((m) => ({ default: m.HypergeometricPage })),
);
const NormalPage = lazy(() =>
  import('@/pages/NormalPage').then((m) => ({ default: m.NormalPage })),
);
const EstimationPage = lazy(() =>
  import('@/pages/EstimationPage').then((m) => ({ default: m.EstimationPage })),
);
const AnovaPage = lazy(() =>
  import('@/pages/AnovaPage').then((m) => ({ default: m.AnovaPage })),
);
const DocsPage = lazy(() =>
  import('@/pages/DocsPage').then((m) => ({ default: m.DocsPage })),
);
const ChangelogPage = lazy(() =>
  import('@/pages/ChangelogPage').then((m) => ({ default: m.ChangelogPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="py-24 text-center text-[15px] text-v0-600 dark:text-v0-300"
    >
      Cargando…
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <UIModeProvider>
        <HistoryProvider>
          <BrowserRouter>
            <MainLayout>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/binomial" element={<BinomialPage />} />
                  <Route path="/hypergeometric" element={<HypergeometricPage />} />
                  <Route path="/normal" element={<NormalPage />} />
                  <Route path="/estimation" element={<EstimationPage />} />
                  <Route path="/anova" element={<AnovaPage />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="/changelog" element={<ChangelogPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </MainLayout>
          </BrowserRouter>
        </HistoryProvider>
      </UIModeProvider>
    </ThemeProvider>
  );
}
