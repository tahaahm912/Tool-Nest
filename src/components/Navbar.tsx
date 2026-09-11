import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  ChevronDown,
  Search,
  Menu,
  X,
  Sparkles,
  Layers,
  Star,
  Info,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { Link, useRouter } from '../context/RouterContext';
import { ThemeToggle } from './ThemeToggle';
import { DynamicIcon } from './DynamicIcon';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const { currentPath } = useRouter();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryOpen(false);
  }, [currentPath]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Wrench className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-none">
                  Tool<span className="text-emerald-600 dark:text-emerald-400">Nest</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Online Tools
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath === '/'
                    ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  id="categories-nav-button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isCategoryOpen || CATEGORIES.some((c) => currentPath === `/${c.slug}`)
                      ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
                  aria-expanded={isCategoryOpen}
                >
                  <Layers className="w-4 h-4 opacity-70" />
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      Tool Categories
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/${cat.slug}`}
                          onClick={() => setIsCategoryOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-neutral-600 dark:text-neutral-400 transition-colors">
                            <DynamicIcon name={cat.iconName} className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-white">
                              {cat.name}
                            </div>
                            <div className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1">
                              {cat.badge}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/#popular-tools"
                onClick={(e) => {
                  const elem = document.getElementById('popular-tools');
                  if (elem) {
                    e.preventDefault();
                    elem.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/#popular-tools');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <Star className="w-4 h-4 opacity-70" />
                <span>Popular Tools</span>
              </Link>

              <Link
                href="/all-tools"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath === '/all-tools' || currentPath === '/tools'
                    ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Sparkles className="w-4 h-4 opacity-70" />
                <span>Directory</span>
              </Link>

              <Link
                href="/about"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath === '/about'
                    ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/60'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Info className="w-4 h-4 opacity-70" />
                <span>About</span>
              </Link>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick search button */}
            <button
              type="button"
              id="global-search-trigger"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span className="hidden sm:inline">Search tools...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu trigger */}
            <button
              type="button"
              id="mobile-menu-trigger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Home
              </Link>
              <Link
                href="/all-tools"
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                All Tools Directory
              </Link>
              <Link
                href="/#popular-tools"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  const elem = document.getElementById('popular-tools');
                  if (elem) {
                    e.preventDefault();
                    elem.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/#popular-tools');
                  }
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Popular Tools
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                About ToolNest
              </Link>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="px-3 py-1 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};
