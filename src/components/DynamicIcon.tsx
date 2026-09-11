import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps extends LucideIcons.LucideProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  const IconComponent = (LucideIcons as Record<string, any>)[name] || LucideIcons.Wrench;
  return <IconComponent className={className} {...props} />;
};
