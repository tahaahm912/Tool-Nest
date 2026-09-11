import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { ToolView } from './views/ToolView';
import { AllToolsView } from './views/AllToolsView';
import { AboutView, PrivacyView, TermsView, ContactView, NotFoundView } from './views/InformationalViews';
import { getToolBySlug } from './data/tools';
import { getCategoryById } from './data/categories';

const AppContent: React.FC = () => {
  const { currentPath } = useRouter();

  // Extract pure pathname (strip query params and hash)
  const pathWithoutQuery = currentPath.split('?')[0];
  const pathname = pathWithoutQuery.split('#')[0] || '/';

  // Normalize path without trailing slash (except root)
  const normalizedPath = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  const renderContent = () => {
    // 1. Home & Popular Tools routes
    if (
      normalizedPath === '/' ||
      normalizedPath === '' ||
      normalizedPath === '/popular' ||
      normalizedPath === '/popular-tools'
    ) {
      return <HomeView />;
    }

    // 2. All tools directory
    if (normalizedPath === '/all-tools' || normalizedPath === '/tools') {
      return <AllToolsView />;
    }

    // 3. Individual tool routes: /tools/:slug
    if (normalizedPath.startsWith('/tools/')) {
      const slug = normalizedPath.replace('/tools/', '');
      const tool = getToolBySlug(slug);
      if (tool) {
        return <ToolView tool={tool} />;
      }
      return <NotFoundView />;
    }

    // 4. Category routes: /calculators, /student-tools, /category/:slug, etc.
    const potentialCatSlug = normalizedPath.replace(/^\/(category\/)?/, '');
    const category = getCategoryById(potentialCatSlug);
    if (category) {
      return <CategoryView category={category} />;
    }

    // 5. Static & Informational pages
    if (normalizedPath === '/about') {
      return <AboutView />;
    }
    if (normalizedPath === '/privacy') {
      return <PrivacyView />;
    }
    if (normalizedPath === '/terms') {
      return <TermsView />;
    }
    if (normalizedPath === '/contact') {
      return <ContactView />;
    }

    // 6. 404 Fallback
    return <NotFoundView />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:bg-emerald-500/30 dark:selection:text-emerald-300">
      <Navbar />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ThemeProvider>
  );
}
