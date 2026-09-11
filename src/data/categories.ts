import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'calculators',
    name: 'Calculators',
    slug: 'calculators',
    description: 'Accurate and fast calculations for dates, percentages, loans, margins, and currency.',
    iconName: 'Calculator',
    color: 'emerald',
    badge: 'Finance & Math',
  },
  {
    id: 'text-tools',
    name: 'Text Tools',
    slug: 'text-tools',
    description: 'Format, count, clean, reverse, sort, and manipulate strings and text content effortlessly.',
    iconName: 'FileText',
    color: 'blue',
    badge: 'Writing & Formatting',
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    slug: 'image-tools',
    description: 'Client-side image compression, resizing, color inspection, and conversion with zero server uploads.',
    iconName: 'Image',
    color: 'violet',
    badge: 'Design & Graphics',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'Utilities for coders: JSON formatters, base64 and URL encoders, UUIDs, hash generation, and regex tests.',
    iconName: 'Code2',
    color: 'amber',
    badge: 'Engineering',
  },
  {
    id: 'student-tools',
    name: 'Student Tools',
    slug: 'student-tools',
    description: 'Tools to help you calculate grades, track attendance, and manage study sessions.',
    iconName: 'GraduationCap',
    color: 'cyan',
    badge: 'Academics',
  },
  {
    id: 'daily-tools',
    name: 'Daily Utilities',
    slug: 'daily-tools',
    description: 'Everyday productivity helpers: QR code generation, strong passwords, random numbers, and timers.',
    iconName: 'Sparkles',
    color: 'rose',
    badge: 'Productivity',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id || cat.slug === id);
};
