import { writingTools } from '@/data/tools';
import { ArrowLeft, CheckCircle, Play, Edit, Award } from 'lucide-react';
import Link from 'next/link';

// 为静态导出生成所有可能的路径
export async function generateStaticParams() {
  return writingTools.map((tool) => ({
    id: tool.id,
  }));
}

export default function ToolPage({ params }: { params: { id: string } }) {
  const toolId = params.id;
  const tool = writingTools.find(t => t.id === toolId);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">工具未找到</h1>
          <Link
            href="/"
            className="bg-primary-500 text-white px-6 py-2 rounded-lg inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
              <p className="text-blue-100 text-lg">{tool.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* 工具介绍 */}
        <section className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">工具介绍</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            {tool.description}
          </p>
        </section>

        {/* 口诀和提示 */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Play className="w-5 h-5" />
              口诀秘籍
            </h3>
            <div className="text-2xl font-bold text-yellow-900 mb-2">
              {tool.mantra}
            </div>
            <p className="text-yellow-700">{tool.tips}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              使用指南
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>适用：{tool.suitableFor}</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <div className="w-4 h-4 text-orange-500">⚠️</div>
                <span>注意：{tool.caution}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 正反案例 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">正反案例对比</h2>

          {tool.examples.map((example, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">避免这样写</span>
                </div>
                <p className="text-red-800">{example.bad}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">推荐这样写</span>
                </div>
                <p className="text-green-800">{example.good}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 练习题目 */}
        <section className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-purple-800 mb-4">
            实战练习
          </h2>
          <div className="space-y-4">
            {tool.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1">{exercise}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:shadow-lg transition-all duration-300 inline-block"
          >
            返回首页继续学习
          </Link>
        </div>
      </div>
    </div>
  );
}