export type CategoryId =
  | 'calculators'
  | 'text-tools'
  | 'image-tools'
  | 'developer-tools'
  | 'student-tools'
  | 'daily-tools';

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  color: string;
  badge: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  categories: CategoryId[];
  iconName: string;
  route: string;
  keywords: string[];
  isPopular?: boolean;
  isNew?: boolean;
  status?: 'ready' | 'beta' | 'placeholder';
  howToUse: string[];
  about: string;
  relatedToolSlugs: string[];
}

export type ThemeMode = 'light' | 'dark';
