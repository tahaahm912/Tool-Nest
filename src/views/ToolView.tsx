import React from 'react';
import { Tool } from '../types';
import { ToolLayout } from '../components/ToolLayout';
import { ToolRenderer } from '../tools/ToolRenderer';

interface ToolViewProps {
  tool: Tool;
}

export const ToolView: React.FC<ToolViewProps> = ({ tool }) => {
  return (
    <ToolLayout tool={tool}>
      <ToolRenderer tool={tool} />
    </ToolLayout>
  );
};
