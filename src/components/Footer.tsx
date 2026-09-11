import React from 'react';
import { Wrench, Shield, Zap, Sparkles, Heart } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { getPopularTools } from '../data/tools';
import { Link } from '../context/RouterContext';

export const Footer: React.FC = () => {
  const popularTools = getPopularTools().slice(0, 6);

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 mt-20 transition-colors">
      {/* Privacy guarantee banner */}
      <div className="border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">Privacy First Guarantee:</span>
            <span>All tool operations run locally in your browser. Your data is never saved on a remote server.</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              100% Free
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              No Registration Required
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                Tool<span className="text-emerald-600 dark:text-emerald-400">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Every tool you need in one place. ToolNest brings together high-precision calculators, text formatting tools, image processors, developer utilities, and daily tools in a clean, fast, and accessible interface.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                Next-Gen Tools
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                Client-Side Engine
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-sm">
              {popularTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.route}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform / Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/all-tools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  All Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  About ToolNest
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-12 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} ToolNest Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for high-performance productivity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
