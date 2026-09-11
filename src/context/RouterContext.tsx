import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToolBySlug } from '../data/tools';
import { getCategoryById } from '../data/categories';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (window.location.pathname || '/') + (window.location.search || '') + (window.location.hash || '');
    }
    return '/';
  });

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);

      if (path.includes('#')) {
        const hashId = path.split('#')[1];
        setTimeout(() => {
          const elem = document.getElementById(hashId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const fullPath = (window.location.pathname || '/') + (window.location.search || '') + (window.location.hash || '');
      setCurrentPath(fullPath);

      if (window.location.hash) {
        const hashId = window.location.hash.replace('#', '');
        setTimeout(() => {
          const elem = document.getElementById(hashId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update SEO Title and Description based on active path
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Strip search and hash to evaluate clean route
    const pathWithoutQuery = currentPath.split('?')[0];
    const cleanPath = (pathWithoutQuery.split('#')[0] || '/').replace(/\/$/, '') || '/';

    let pageTitle = 'ToolNest - Every Tool You Need. One Place.';
    let pageDesc =
      'Every tool you need in one place. Free, fast, and secure online calculators, text tools, image tools, developer utilities, and daily tools.';

    if (cleanPath === '/' || cleanPath === '/popular' || cleanPath === '/popular-tools') {
      pageTitle = 'ToolNest - Every Tool You Need. One Place.';
      pageDesc = 'Access 40+ free online calculators, text utilities, image editors, developer tools, and daily productivity tools directly in your browser.';
    } else if (cleanPath.startsWith('/tools/')) {
      const slug = cleanPath.replace('/tools/', '');
      const tool = getToolBySlug(slug);
      if (tool) {
        pageTitle = `${tool.name} - Free Online Tool | ToolNest`;
        pageDesc = `${tool.description} Fast, free, browser-based online ${tool.name}.`;
      } else {
        pageTitle = 'Tool Not Found - ToolNest';
      }
    } else if (cleanPath === '/tools' || cleanPath === '/all-tools') {
      pageTitle = 'All Online Tools - Directory | ToolNest';
      pageDesc = 'Explore our comprehensive directory of 40+ free online tools for calculations, text editing, graphics, programming, and school.';
    } else if (cleanPath === '/about') {
      pageTitle = 'About ToolNest - Modern Online Tools Platform';
      pageDesc = 'Learn about ToolNest, our mission to provide clean, fast, private, and zero-bloat browser utilities for everyone.';
    } else if (cleanPath === '/privacy') {
      pageTitle = 'Privacy Policy - ToolNest';
      pageDesc = 'ToolNest privacy guarantee: Client-side processing ensures your data never leaves your device.';
    } else if (cleanPath === '/terms') {
      pageTitle = 'Terms of Service - ToolNest';
      pageDesc = 'Terms and conditions for using ToolNest free online developer and productivity tools.';
    } else if (cleanPath === '/contact') {
      pageTitle = 'Contact & Feedback - ToolNest';
      pageDesc = 'Get in touch with the ToolNest team for tool requests, feedback, or inquiries.';
    } else {
      // Check if it matches a category slug
      const catSlug = cleanPath.replace(/^\//, '');
      const category = getCategoryById(catSlug);
      if (category) {
        pageTitle = `${category.name} - Free Online Utilities | ToolNest`;
        pageDesc = `${category.description} Free, browser-based ${category.name.toLowerCase()} with no registration.`;
      }
    }

    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', pageDesc);
    }
  }, [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, className = '', children, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // allow normal handling for new tabs / external links
    if (e.metaKey || e.ctrlKey || href.startsWith('http') || href.startsWith('mailto:')) {
      if (onClick) onClick(e);
      return;
    }

    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
