import { writingTools } from '@/data/tools';
import { ArrowLeft, CheckCircle, Play, Edit, Award, Sparkles, Lightbulb } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md w-full mx-4">
          <div className="inline-block p-3 bg-danger-100 rounded-full mb-4">
            <div className="w-12 h-12 text-danger-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">工具未找到</h1>
          <p className="text-neutral-600 mb-6">抱歉，您访问的写作工具不存在。</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-primary-500 to-secondary-600 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-600 hover:to-secondary-700 transition-all shadow-md"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-100 hover:text-white transition-colors mb-6 w-fit"
          >
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </div>
            返回首页
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
                <p className="text-primary-100 text-lg">{tool.title}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-100">
                <Lightbulb className="w-5 h-5" />
                <span className="font-medium">核心口诀</span>
              </div>
              <p className="text-white font-bold text-lg mt-1">{tool.mantra}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto p-6 space-y-8 pb-12">
        {/* 工具介绍 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-primary-600" />
            </div>
            工具介绍
          </h2>
          <p className="text-neutral-700 text-lg leading-relaxed">
            {tool.description}
          </p>
        </section>

        {/* 口诀和提示 */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200 rounded-2xl p-6">
            <h3 className="font-bold text-warning-800 mb-4 flex items-center gap-2 text-lg">
              <div className="p-2 bg-warning-500/20 rounded-lg">
                <Play className="w-5 h-5 text-warning-700" />
              </div>
              口诀秘籍
            </h3>
            <div className="text-2xl font-bold text-warning-900 mb-3 bg-white/50 p-4 rounded-xl">
              {tool.mantra}
            </div>
            <p className="text-warning-700 bg-white/50 p-4 rounded-xl">{tool.tips}</p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-6">
            <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2 text-lg">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Edit className="w-5 h-5 text-primary-700" />
              </div>
              使用指南
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                <div className="mt-1">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <div className="font-medium text-success-800">适用场景</div>
                  <div className="text-success-700 text-sm">{tool.suitableFor}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                <div className="mt-1 text-warning-500">⚠️</div>
                <div>
                  <div className="font-medium text-warning-800">注意事项</div>
                  <div className="text-warning-700 text-sm">{tool.caution}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 正反案例 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Award className="w-5 h-5 text-secondary-600" />
            </div>
            正反案例对比
          </h2>

          <div className="space-y-6">
            {tool.examples.map((example, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4">
                <div className="bg-danger-50 border border-danger-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-danger-700 mb-3">
                    <div className="p-2 bg-danger-100 rounded-lg">
                      <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                    </div>
                    <span className="font-bold">避免这样写</span>
                  </div>
                  <p className="text-danger-800 bg-white/50 p-4 rounded-lg">{example.bad}</p>
                </div>

                <div className="bg-success-50 border border-success-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-success-700 mb-3">
                    <div className="p-2 bg-success-100 rounded-lg">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    </div>
                    <span className="font-bold">推荐这样写</span>
                  </div>
                  <p className="text-success-800 bg-white/50 p-4 rounded-lg">{example.good}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 练习题目 */}
        <section className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-secondary-500/20 rounded-lg">
              <Edit className="w-5 h-5 text-secondary-700" />
            </div>
            实战练习
          </h2>
          <div className="space-y-4">
            {tool.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-secondary-100">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-neutral-700 flex-1">{exercise}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-success-500 to-success-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:from-success-600 hover:to-success-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <CheckCircle className="w-6 h-6" />
            返回首页继续学习
          </Link>
          <p className="text-neutral-600 mt-3">完成练习后记得保存并获取AI反馈哦！</p>
        </div>
      </div>
    </div>
  );
}