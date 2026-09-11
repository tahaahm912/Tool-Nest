import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  query?: string;
  onReset?: () => void;
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  query,
  onReset,
  title = 'No tools found',
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 my-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 mb-4">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {title}
      </h3>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6 leading-relaxed">
        {description ||
          (query
            ? `We couldn't find any tools matching "${query}". Try searching with different keywords or browse all categories.`
            : 'There are currently no tools matching your selected filters.')}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Search & Filters</span>
        </button>
      )}
    </div>
  );
};
