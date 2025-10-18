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
          ? 'bg-gradient-to-br from-success-50 to-success-100 border-success-300'
          : isUnlocked
          ? 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-md'
          : 'bg-neutral-100 border-neutral-300 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              isCompleted ? 'bg-success-500' : isUnlocked ? 'bg-primary-500' : 'bg-neutral-400'
            }`}>
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">
              {tool.name}
            </h3>
          </div>
          <p className="text-neutral-600 text-sm">{tool.title}</p>
        </div>
        {isCompleted && (
          <div className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium">
            已完成
          </div>
        )}
      </div>

      <p className="text-neutral-700 mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="space-y-3">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
          <div className="text-sm font-medium text-warning-800 mb-1">
            口诀：{tool.mantra}
          </div>
          <div className="text-xs text-warning-700">
            {tool.tips}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-neutral-600">
          <span>✅ {tool.suitableFor}</span>
          <span>⚠️ {tool.caution}</span>
        </div>
      </div>

      <div className="mt-4">
        {isUnlocked ? (
          <Link
            href={`/tools/${tool.id}`}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isCompleted ? '重新学习' : '开始学习'}
            <Play className="w-4 h-4" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-neutral-300 text-neutral-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
          >
            待解锁
          </button>
        )}
      </div>
    </div>
  );
}