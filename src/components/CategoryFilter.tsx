import React from 'react';
import { CATEGORIES } from '../data/categories';
import { TOOLS } from '../data/tools';
import { DynamicIcon } from './DynamicIcon';

interface CategoryFilterProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategoryId,
  onSelectCategory,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
      <button
        type="button"
        id="filter-all"
        onClick={() => onSelectCategory('all')}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
          selectedCategoryId === 'all'
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}
      >
        <span>All Tools</span>
        <span
          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
            selectedCategoryId === 'all'
              ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {TOOLS.length}
        </span>
      </button>

      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        const count = TOOLS.filter((t) => t.categories.includes(cat.id)).length;

        return (
          <button
            key={cat.id}
            type="button"
            id={`filter-${cat.id}`}
            onClick={() => onSelectCategory(cat.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <DynamicIcon name={cat.iconName} className="w-4 h-4 opacity-80" />
            <span>{cat.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                isSelected
                  ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
