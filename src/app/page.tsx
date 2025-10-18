import { writingTools } from '@/data/tools';
import { Trophy, BookOpen, Settings, Play } from 'lucide-react';
import Link from 'next/link';

// 为静态导出生成首页
export default function HomePage() {
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

      {/* 介绍 */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            开启你的写作成长之旅
          </h2>
          <p className="text-gray-600 mb-6">
            通过7个游戏化关卡，循序渐进掌握写作核心技巧
          </p>
        </div>
      </div>

      {/* 工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.map((tool, index) => (
          <div
            key={tool.id}
            className="rounded-xl p-6 border-2 bg-white border-primary-200 hover:border-primary-400 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">{tool.title}</p>
              </div>
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
              <Link
                href={`/tools/${tool.id}`}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                开始学习
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-center gap-8">
        <Link
          href="/write"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          写作练习
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