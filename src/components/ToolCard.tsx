import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Tool } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Link } from '../context/RouterContext';
import { getCategoryById } from '../data/categories';

interface ToolCardProps {
  tool: Tool;
  compact?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, compact = false }) => {
  const primaryCategory = getCategoryById(tool.categories[0]);

  return (
    <div
      id={`tool-card-${tool.slug}`}
      className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 transition-all duration-200 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <DynamicIcon name={tool.iconName} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.isPopular && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                Popular
              </span>
            )}
            {tool.status === 'ready' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1.5 line-clamp-1">
          <Link href={tool.route} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {tool.name}
          </Link>
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
          {tool.description}
        </p>
      </div>

      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">
          {primaryCategory?.name || 'Utility'}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
          Open Tool
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
