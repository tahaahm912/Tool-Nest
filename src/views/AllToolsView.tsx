import React, { useState, useMemo } from 'react';
import { TOOLS } from '../data/tools';
import { ToolGrid } from '../components/ToolGrid';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyState } from '../components/EmptyState';

export const AllToolsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    let list = TOOLS;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.categories.includes(selectedCategory as any));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'All Tools Directory' }]} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            All Online Tools
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Browse our complete collection of {TOOLS.length} free, browser-based utilities.
          </p>
        </div>

        <div className="w-full md:w-80">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search across all tools..."
            size="md"
          />
        </div>
      </div>

      <div className="mb-8">
        <CategoryFilter
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {filteredTools.length > 0 ? (
        <ToolGrid tools={filteredTools} />
      ) : (
        <EmptyState
          query={query}
          onReset={() => {
            setQuery('');
            setSelectedCategory('all');
          }}
        />
      )}
    </div>
  );
};
