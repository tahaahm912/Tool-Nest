import React, { useState } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Download,
  Share2,
  BookOpen,
  Info,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Tool } from '../types';
import { Breadcrumbs } from './Breadcrumbs';
import { DynamicIcon } from './DynamicIcon';
import { RelatedTools } from './RelatedTools';
import { getCategoryById } from '../data/categories';

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
  onReset?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  copyLabel?: string;
  downloadLabel?: string;
  copySuccess?: boolean;
  downloadSuccess?: boolean;
  customActions?: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  onReset,
  onCopy,
  onDownload,
  copyLabel = 'Copy Output',
  downloadLabel = 'Download',
  copySuccess = false,
  downloadSuccess = false,
  customActions,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const primaryCategory = getCategoryById(tool.categories[0]);

  const breadcrumbs = [
    {
      label: primaryCategory?.name || 'Tools',
      href: primaryCategory ? `/${primaryCategory.slug}` : '/all-tools',
    },
    { label: tool.name },
  ];

  const handleShareTool = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* 1. Breadcrumb navigation */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* 2, 3, 4. Tool Header: Icon, Name, Description & Category badges */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 mb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 dark:text-emerald-400 flex-shrink-0 shadow-sm">
            <DynamicIcon name={tool.iconName} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {tool.name}
              </h1>
              {tool.categories.map((catId) => {
                const cat = getCategoryById(catId);
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    {cat?.name || catId}
                  </span>
                );
              })}
            </div>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Quick action bar: Share link */}
        <div className="flex items-center gap-2 self-start flex-shrink-0">
          <button
            type="button"
            id="share-tool-button"
            onClick={handleShareTool}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Tool</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5, 6, 7. Main tool interface card with header actions (Reset, Copy, Download) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden mb-12">
        {/* Top Control Bar for tool actions */}
        <div className="px-5 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interactive Tool Workspace</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {customActions}

            {onCopy && (
              <button
                type="button"
                id="tool-copy-button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyLabel}</span>
                  </>
                )}
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                id="tool-download-button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white shadow-sm transition-colors"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadLabel}</span>
                  </>
                )}
              </button>
            )}

            {onReset && (
              <button
                type="button"
                id="tool-reset-button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Main Tool Area */}
        <div className="p-6 sm:p-8">{children}</div>
      </div>

      {/* 8 & 9. "How to Use" and "About This Tool" Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        {/* 8. How to Use */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base mb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3>How to Use {tool.name}</h3>
          </div>
          <ol className="space-y-3">
            {tool.howToUse.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 font-semibold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 9. About This Tool */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base mb-4">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3>About This Tool</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tool.about}
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Execution: Browser Sandbox</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Client-Side Privacy</span>
          </div>
        </div>
      </div>

      {/* 10. Related Tools section */}
      <RelatedTools
        relatedSlugs={tool.relatedToolSlugs}
        currentToolId={tool.id}
      />
    </div>
  );
};
