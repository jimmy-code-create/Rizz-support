import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { SearchPaletteProvider } from '@/components/search/SearchPalette';

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const HelpPage = lazy(() => import('@/pages/HelpPage').then((module) => ({ default: module.HelpPage })));
const ArticlePage = lazy(() => import('@/pages/ArticlePage').then((module) => ({ default: module.ArticlePage })));
const FaqsPage = lazy(() => import('@/pages/FaqsPage').then((module) => ({ default: module.FaqsPage })));
const SubmitPage = lazy(() => import('@/pages/SubmitPage').then((module) => ({ default: module.SubmitPage })));
const TrackPage = lazy(() => import('@/pages/TrackPage').then((module) => ({ default: module.TrackPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

export function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ToastProvider>
            <SearchPaletteProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="help" element={<HelpPage />} />
                  <Route path="help/:slug" element={<ArticlePage />} />
                  <Route path="faqs" element={<FaqsPage />} />
                  <Route path="submit" element={<SubmitPage />} />
                  <Route path="track" element={<TrackPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </SearchPaletteProvider>
          </ToastProvider>
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}
