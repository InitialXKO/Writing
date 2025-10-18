'use client';

import { useAppStore } from '@/lib/store';
import { writingTools } from '@/data/tools';
import { Trophy, BookOpen, Settings, Play } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { progress } = useAppStore();

  const completedCount = progress.levels.filter(level => level.completed).length;
  const totalTools = writingTools.length;
  const progressPercentage = Math.round((completedCount / totalTools) * 100);

  return (
    <div className="min-h-screen p-6">
      {/* 头部 */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          六年级作文成长手册
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          在规则内说真话 • 游戏化学习 • 七天掌握写作技巧
        </p>
      </header>

      {/* 进度概览 */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            学习进度
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {completedCount}/{totalTools}
            </div>
            <div className="text-sm text-gray-500">工具已解锁</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="text-center text-sm text-gray-600">
          已完成 {progressPercentage}% - 继续加油！
        </div>
      </div>

      {/* 工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.map((tool, index) => {
          const levelProgress = progress.levels.find(l => l.toolId === tool.id);
          const isUnlocked = progress.unlockedTools.includes(tool.id);
          const isCompleted = levelProgress?.completed;

          return (
            <div
              key={tool.id}
              className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300'
                  : isUnlocked
                  ? 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-md'
                  : 'bg-gray-100 border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      isCompleted ? 'bg-green-500' : isUnlocked ? 'bg-primary-500' : 'bg-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">{tool.title}</p>
                </div>
                {isCompleted && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    已完成
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {tool.description}
              </p>

              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">
                    口诀：{tool.mantra}
                  </div>
                  <div className="text-xs text-yellow-700">
                    {tool.tips}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
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
                    className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
                  >
                    待解锁
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link
          href="/progress"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          我的作文
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <Settings className="w-5 h-5" />
          设置
        </Link>
      </div>
    </div>
  );
}