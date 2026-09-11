import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Search,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { TOOLS, getPopularTools, searchTools } from '../data/tools';
import { CategoryCard } from '../components/CategoryCard';
import { ToolCard } from '../components/ToolCard';
import { ToolGrid } from '../components/ToolGrid';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Link, useRouter } from '../context/RouterContext';

export const HomeView: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [directorySearch, setDirectorySearch] = useState('');

  const popularTools = useMemo(() => getPopularTools(), []);

  // Handle direct navigation to #popular-tools or /popular routes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const isPopularTarget =
      window.location.hash === '#popular-tools' ||
      currentPath.includes('#popular-tools') ||
      currentPath.startsWith('/popular');

    if (isPopularTarget) {
      const timer = setTimeout(() => {
        const elem = document.getElementById('popular-tools');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

  // Filter tools for the All Tools directory section
  const filteredTools = useMemo(() => {
    let list = TOOLS;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.categories.includes(selectedCategory as any));
    }
    if (directorySearch.trim()) {
      const q = directorySearch.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, directorySearch]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    // Set directory search and scroll down smoothly
    setDirectorySearch(heroSearch);
    const elem = document.getElementById('all-tools-directory');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-6 md:pt-20 md:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/60 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>40+ Free Online Browser Utilities</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.15] mb-6">
          Every Tool You Need.{' '}
          <span className="text-emerald-600 dark:text-emerald-400 block sm:inline">
            One Place.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Access fast, high-precision calculators, text tools, image tools, developer utilities, student calculators, and daily tools directly from your browser.
        </p>

        {/* Prominent Global Search Bar */}
        <div className="max-w-2xl mx-auto mb-5">
          <form onSubmit={handleHeroSearchSubmit}>
            <SearchBar
              value={heroSearch}
              onChange={setHeroSearch}
              placeholder="Search for a tool (e.g. Age Calculator, JSON Formatter, QR Code)..."
              size="lg"
            />
          </form>
        </div>

        {/* Quick popular tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium">Trending:</span>
          {['Age Calculator', 'Word Counter', 'JSON Formatter', 'QR Code Generator', 'GPA Calculator'].map(
            (toolName) => {
              const tool = TOOLS.find((t) => t.name.toLowerCase() === toolName.toLowerCase());
              if (!tool) return null;
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {tool.name}
                </Link>
              );
            }
          )}
        </div>
      </section>

      {/* 2. POPULAR TOOLS SECTION */}
      <section id="popular-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Star className="w-3.5 h-3.5 fill-emerald-500" />
              <span>Most Used Utilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
              Popular Tools
            </h2>
          </div>
          <Link
            href="/all-tools"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors self-start sm:self-auto"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ToolGrid tools={popularTools} />
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Organized For Speed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight mt-1 mb-3">
            Browse Tools by Category
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Find the exact utility tailored to your immediate task across all 6 core categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. ALL TOOLS DIRECTORY (SEARCHABLE & FILTERABLE IN REAL-TIME) */}
      <section id="all-tools-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
              Tools Directory
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Search and filter across all {TOOLS.length} available online utilities.
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchBar
              value={directorySearch}
              onChange={setDirectorySearch}
              placeholder="Filter directory..."
              size="md"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Tools Grid or Empty State */}
        {filteredTools.length > 0 ? (
          <ToolGrid tools={filteredTools} />
        ) : (
          <EmptyState
            query={directorySearch}
            onReset={() => {
              setDirectorySearch('');
              setSelectedCategory('all');
            }}
          />
        )}
      </section>
    </div>
  );
};
