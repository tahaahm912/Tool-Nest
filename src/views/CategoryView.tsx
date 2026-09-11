import React, { useState, useMemo } from 'react';
import { Category } from '../types';
import { getToolsByCategory } from '../data/tools';
import { ToolGrid } from '../components/ToolGrid';
import { SearchBar } from '../components/SearchBar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { Link } from '../context/RouterContext';

interface CategoryViewProps {
  category: Category;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ category }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const allCategoryTools = useMemo(() => {
    return getToolsByCategory(category.id);
  }, [category.id]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allCategoryTools;
    const q = searchQuery.trim().toLowerCase();
    return allCategoryTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [allCategoryTools, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: category.name }]} />
      </div>

      {/* Category Header */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 dark:text-emerald-400 flex-shrink-0 shadow-sm">
              <DynamicIcon name={category.iconName} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {allCategoryTools.length} {allCategoryTools.length === 1 ? 'Tool' : 'Tools'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 flex-shrink-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search in ${category.name}...`}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid or Empty */}
      {filteredTools.length > 0 ? (
        <ToolGrid tools={filteredTools} />
      ) : (
        <EmptyState
          query={searchQuery}
          title={`No ${category.name.toLowerCase()} found`}
          description={`No tools in ${category.name} matched "${searchQuery}".`}
          onReset={() => setSearchQuery('')}
        />
      )}
    </div>
  );
};
