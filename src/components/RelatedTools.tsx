import React from 'react';
import { Sparkles } from 'lucide-react';
import { Tool } from '../types';
import { getToolBySlug } from '../data/tools';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  relatedSlugs: string[];
  currentToolId: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ relatedSlugs, currentToolId }) => {
  const tools = relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t && t.id !== currentToolId));

  if (tools.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Related Tools You Might Find Useful
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} compact />
        ))}
      </div>
    </section>
  );
};
