'use client';

import { ChevronRight } from 'lucide-react';
import { WritingTool } from '@/types';

interface SubToolsListProps {
  tools: WritingTool[];
  onToolSelect: (toolId: string) => void;
  title: string;
  description: string;
}

const SubToolsList = ({ tools, onToolSelect, title, description }: SubToolsListProps) => {
  if (tools.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-morandi-gray-200 overflow-hidden">
      <div className="p-4 bg-morandi-gray-50 border-b border-morandi-gray-200">
        <h3 className="font-bold text-morandi-gray-800">{title}</h3>
        <p className="text-sm text-morandi-gray-600">{description}</p>
      </div>
      <div className="p-4 space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="p-3 bg-morandi-gray-50 rounded-lg hover:bg-morandi-purple-50 cursor-pointer transition-colors"
            onClick={() => onToolSelect(tool.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-morandi-gray-800">{tool.name}</h4>
                <p className="text-sm text-morandi-gray-600">{tool.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-morandi-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubToolsList;