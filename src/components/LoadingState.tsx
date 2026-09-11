import React from 'react';

export const LoadingState: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-11 h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="w-16 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="w-3/4 h-5 rounded bg-neutral-200 dark:bg-neutral-800 mb-2.5" />
          <div className="w-full h-4 rounded bg-neutral-100 dark:bg-neutral-800/60 mb-2" />
          <div className="w-2/3 h-4 rounded bg-neutral-100 dark:bg-neutral-800/60 mb-5" />
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
            <div className="w-20 h-3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="w-16 h-3 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
};
