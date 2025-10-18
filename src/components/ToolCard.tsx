import { WritingTool } from '@/types';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface ToolCardProps {
  tool: WritingTool;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export default function ToolCard({ tool, index, isUnlocked, isCompleted }: ToolCardProps) {
  return (
    <div
      className={`rounded-xl p-6 border-2 transition-all duration-300 ${
        isCompleted
          ? 'bg-gradient-to-br from-morandi-green-50 to-morandi-green-100 border-morandi-green-300'
          : isUnlocked
          ? 'bg-white border-morandi-blue-200 hover:border-morandi-blue-400 hover:shadow-md'
          : 'bg-morandi-gray-100 border-morandi-gray-300 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              isCompleted ? 'bg-morandi-green-500' : isUnlocked ? 'bg-morandi-blue-500' : 'bg-morandi-gray-400'
            }`}>
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold text-morandi-gray-800">
              {tool.name}
            </h3>
          </div>
          <p className="text-morandi-gray-600 text-sm">{tool.title}</p>
        </div>
        {isCompleted && (
          <div className="bg-morandi-green-100 text-morandi-green-800 px-3 py-1 rounded-full text-sm font-medium">
            已完成
          </div>
        )}
      </div>

      <p className="text-morandi-gray-700 mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="space-y-3">
        <div className="bg-morandi-beige-50 border border-morandi-beige-200 rounded-lg p-3">
          <div className="text-sm font-medium text-morandi-beige-800 mb-1">
            口诀：{tool.mantra}
          </div>
          <div className="text-xs text-morandi-beige-700">
            {tool.tips}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-morandi-gray-600">
          <span>✅ {tool.suitableFor}</span>
          <span>⚠️ {tool.caution}</span>
        </div>
      </div>

      <div className="mt-4">
        {isUnlocked ? (
          <Link
            href={`/tools/${tool.id}`}
            className="w-full bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isCompleted ? '重新学习' : '开始学习'}
            <Play className="w-4 h-4" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-morandi-gray-300 text-morandi-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
          >
            待解锁
          </button>
        )}
      </div>
    </div>
  );
}