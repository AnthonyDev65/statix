// =====================================================
// Statix - App
// =====================================================
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { BinomialPage } from '@/pages/BinomialPage';
import { HypergeometricPage } from '@/pages/HypergeometricPage';
import { NormalPage } from '@/pages/NormalPage';
import { EstimationPage } from '@/pages/EstimationPage';
import { AnovaPage } from '@/pages/AnovaPage';
import { DocsPage } from '@/pages/DocsPage';
import { ChangelogPage } from '@/pages/ChangelogPage';

export function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/binomial" element={<BinomialPage />} />
              <Route path="/hypergeometric" element={<HypergeometricPage />} />
              <Route path="/normal" element={<NormalPage />} />
              <Route path="/estimation" element={<EstimationPage />} />
              <Route path="/anova" element={<AnovaPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </HistoryProvider>
    </ThemeProvider>
  );
}
