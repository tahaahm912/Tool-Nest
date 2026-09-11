import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Link } from '../context/RouterContext';
import { getToolsByCategory } from '../data/tools';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const tools = getToolsByCategory(category.id);
  const toolCount = tools.length;

  return (
    <div
      id={`category-card-${category.slug}`}
      className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 transition-all duration-200 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <DynamicIcon name={category.iconName} className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {toolCount} {toolCount === 1 ? 'Tool' : 'Tools'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
          <Link href={`/${category.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {category.name}
          </Link>
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <span>Browse {category.name}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
