import { writingTools } from '@/data/tools';
import { Trophy, BookOpen, Settings, Play, Sparkles, Library } from 'lucide-react';
import Link from 'next/link';

// 为静态导出生成首页
export default function HomePage() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-morandi-gray-100 via-white to-morandi-beige-100">
      {/* 头部 */}
      <header className="text-center mb-8 py-8">
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 shadow-lg shadow-morandi-blue-500/20 mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-morandi-gray-800 mb-4 bg-gradient-to-r from-morandi-blue-600 to-morandi-green-600 bg-clip-text text-transparent">
          六年级作文成长手册
        </h1>
        <p className="text-lg text-morandi-gray-600 max-w-2xl mx-auto">
          在规则内说真话 • 游戏化学习 • 七天掌握写作技巧
        </p>
      </header>

      {/* 介绍卡片 */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-400 p-6 mb-8 border border-morandi-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-morandi-gray-800 mb-4">
            开启你的写作成长之旅
          </h2>
          <p className="text-morandi-gray-600 mb-6">
            通过7个游戏化关卡，循序渐进掌握写作核心技巧
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-morandi-blue-50 text-morandi-blue-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-blue-500 rounded-full"></div>
              <span>观察发现</span>
            </div>
            <div className="flex items-center gap-2 bg-morandi-green-50 text-morandi-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
              <span>思考整理</span>
            </div>
            <div className="flex items-center gap-2 bg-morandi-pink-50 text-morandi-pink-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-pink-500 rounded-full"></div>
              <span>语言表达</span>
            </div>
          </div>
        </div>
      </div>

      {/* 工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.map((tool, index) => (
          <div
            key={tool.id}
            className="flex flex-col rounded-2xl p-6 border-2 bg-white border-morandi-gray-200 hover:border-morandi-blue-400 hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-morandi-gray-800">
                      {tool.name}
                    </h3>
                    <p className="text-morandi-gray-500 text-sm">{tool.title}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-morandi-gray-700 mb-5 line-clamp-2 flex-shrink-0">
              {tool.description}
            </p>

            <div className="space-y-3 mb-5 flex-grow">
              <div className="bg-gradient-to-r from-morandi-beige-50 to-morandi-beige-100 border border-morandi-beige-200 rounded-xl p-3">
                <div className="text-sm font-bold text-morandi-beige-800 mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-morandi-beige-500 rounded-full"></div>
                  口诀：{tool.mantra}
                </div>
                <div className="text-xs text-morandi-beige-700">
                  {tool.tips}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-morandi-gray-500 bg-morandi-gray-100 rounded-lg p-2">
                <span className="flex items-center gap-1">✅ {tool.suitableFor}</span>
                <span className="flex items-center gap-1">⚠️ {tool.caution}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex-shrink-0">
              <Link
                href={`/tools/${tool.id}`}
                className="w-full bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 hover:from-morandi-blue-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                开始学习
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-center gap-8 py-8">
        <Link
          href="/write"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-morandi-blue-600" />
          </div>
          <span className="font-medium">写作练习</span>
        </Link>

        <Link
          href="/essays"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-purple-100 rounded-lg">
            <Library className="w-5 h-5 text-morandi-purple-600" />
          </div>
          <span className="font-medium">我的作文</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-morandi-green-600" />
          </div>
          <span className="font-medium">设置</span>
        </Link>
      </div>
    </div>
  );
}