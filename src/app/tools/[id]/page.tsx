'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { writingTools } from '@/data/tools';
import { ArrowLeft, CheckCircle, Play, Edit, Award } from 'lucide-react';

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const { progress, completeLevel } = useAppStore();

  const toolId = params.id as string;
  const tool = writingTools.find(t => t.id === toolId);
  const levelProgress = progress.levels.find(l => l.toolId === toolId);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">工具未找到</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isUnlocked = progress.unlockedTools.includes(toolId);
  const isCompleted = levelProgress?.completed;

  const handleComplete = () => {
    completeLevel(toolId, 85); // 基础分数
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
              <p className="text-blue-100 text-lg">{tool.title}</p>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span className="font-medium">已完成</span>
              </div>
            )}
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

        {/* 完成按钮 */}
        {isUnlocked && !isCompleted && (
          <div className="text-center">
            <button
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <CheckCircle className="w-6 h-6" />
              完成学习，解锁下一关
            </button>
            <p className="text-gray-600 mt-2">
              完成练习后点击这里记录你的进步
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-center">
            <div className="bg-green-100 border border-green-300 rounded-xl p-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                恭喜！你已经掌握了这个工具
              </h3>
              <p className="text-green-700">
                继续学习其他工具，全面提升写作能力
              </p>
            </div>
          </div>
        )}

        {!isUnlocked && (
          <div className="text-center">
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
              <div className="text-gray-500 text-lg">
                请先完成前面的工具学习来解锁此内容
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}