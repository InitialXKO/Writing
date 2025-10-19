'use client';

import { useState } from 'react';
import { writingTools } from '@/data/tools';
import { useAppStore, canUnlockTool } from '@/lib/store'; // 导入解锁条件检查函数
import { ArrowLeft, CheckCircle, Play, Edit, Award, Sparkles, Lightbulb, ShieldCheck, Lock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ComprehensionTest from '@/components/ComprehensionTest';

export default function ToolPageClient({ params }: { params: { id: string } }) {
  const toolId = params.id;
  const tool = writingTools.find(t => t.id === toolId);
  const { progress, passTest } = useAppStore();
  const [testPassed, setTestPassed] = useState(false);

  // 检查测试是否已经通过
  const level = progress.levels.find(l => l.toolId === toolId);
  const isTestPassed = level?.testPassed || testPassed;

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-morandi-gray-100 to-morandi-gray-200">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md w-full mx-4">
          <div className="inline-block p-3 bg-morandi-pink-100 rounded-full mb-4">
            <div className="w-12 h-12 text-morandi-pink-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-morandi-gray-800 mb-4">工具未找到</h1>
          <p className="text-morandi-gray-600 mb-6">抱歉，您访问的写作工具不存在。</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-morandi-blue-600 hover:to-morandi-green-700 transition-all shadow-md"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleTestPass = () => {
    setTestPassed(true);
    passTest(toolId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-morandi-blue-600 to-morandi-green-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-morandi-blue-100 hover:text-white transition-colors mb-6 w-fit"
          >
            <div className="p-2 bg-morandi-blue-500/20 rounded-lg">
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
                <p className="text-morandi-blue-100 text-lg">{tool.title}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-morandi-blue-100">
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
        <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
          <h2 className="text-2xl font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-morandi-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-morandi-blue-600" />
            </div>
            工具介绍
          </h2>
          <p className="text-morandi-gray-700 text-lg leading-relaxed">
            {tool.description}
          </p>
        </section>

        {/* 解锁条件 */}
        {tool.id !== 'free-writing' && tool.unlockConditions && (
          <section className="bg-gradient-to-br from-morandi-purple-50 to-morandi-purple-100 border border-morandi-purple-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-morandi-purple-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-morandi-purple-700" />
              </div>
              解锁条件
            </h2>
            <div className="space-y-4">
              {tool.unlockConditions.prerequisiteTools && tool.unlockConditions.prerequisiteTools.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="mt-1">
                    <BookOpen className="w-5 h-5 text-morandi-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-morandi-purple-800">前置工具要求</div>
                    <div className="text-morandi-purple-700 text-sm">
                      需要先掌握以下工具：
                      {tool.unlockConditions.prerequisiteTools.map((prereqId, index) => {
                        const prereqTool = writingTools.find(t => t.id === prereqId);
                        const prereqLevel = progress.levels.find(l => l.toolId === prereqId);
                        const isCompleted = prereqLevel?.testPassed;
                        return (
                          <span key={prereqId} className={`ml-2 ${isCompleted ? 'text-morandi-green-600' : 'text-morandi-red-500'}`}>
                            {prereqTool?.name}{index < tool.unlockConditions!.prerequisiteTools!.length - 1 ? '、' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {tool.unlockConditions.minMasteryLevel && (
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="mt-1">
                    <ShieldCheck className="w-5 h-5 text-morandi-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-morandi-purple-800">掌握程度要求</div>
                    <div className="text-morandi-purple-700 text-sm">
                      前置工具平均掌握程度需达到 {tool.unlockConditions.minMasteryLevel}%
                    </div>
                  </div>
                </div>
              )}
              {tool.unlockConditions.minPracticeCount && (
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="mt-1">
                    <Edit className="w-5 h-5 text-morandi-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-morandi-purple-800">练习次数要求</div>
                    <div className="text-morandi-purple-700 text-sm">
                      前置工具总练习次数需达到 {tool.unlockConditions.minPracticeCount} 次
                    </div>
                  </div>
                </div>
              )}
              {tool.unlockConditions.minWritingStreak && (
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="mt-1">
                    <Award className="w-5 h-5 text-morandi-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-morandi-purple-800">连续写作天数要求</div>
                    <div className="text-morandi-purple-700 text-sm">
                      连续写作天数需达到 {tool.unlockConditions.minWritingStreak} 天
                      (当前: {progress.habitTracker?.writingStreak || 0} 天)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 口诀和提示 */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-morandi-beige-50 to-morandi-beige-100 border border-morandi-beige-200 rounded-2xl p-6">
            <h3 className="font-bold text-morandi-beige-800 mb-4 flex items-center gap-2 text-lg">
              <div className="p-2 bg-morandi-beige-500/20 rounded-lg">
                <Play className="w-5 h-5 text-morandi-beige-700" />
              </div>
              口诀秘籍
            </h3>
            <div className="text-2xl font-bold text-morandi-beige-900 mb-3 bg-white/50 p-4 rounded-xl whitespace-pre-line">
              {tool.mantra}
            </div>
            <p className="text-morandi-beige-700 bg-white/50 p-4 rounded-xl">{tool.tips}</p>
          </div>

          <div className="bg-gradient-to-br from-morandi-blue-50 to-morandi-blue-100 border border-morandi-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-morandi-blue-800 mb-4 flex items-center gap-2 text-lg">
              <div className="p-2 bg-morandi-blue-500/20 rounded-lg">
                <Edit className="w-5 h-5 text-morandi-blue-700" />
              </div>
              使用指南
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                <div className="mt-1">
                  <CheckCircle className="w-5 h-5 text-morandi-green-600" />
                </div>
                <div>
                  <div className="font-medium text-morandi-green-800">适用场景</div>
                  <div className="text-morandi-green-700 text-sm">{tool.suitableFor}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                <div className="mt-1 text-morandi-pink-500">⚠️</div>
                <div>
                  <div className="font-medium text-morandi-pink-800">注意事项</div>
                  <div className="text-morandi-pink-700 text-sm">{tool.caution}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 理解测试 */}
        {!isTestPassed && tool.comprehensionTest && (
          <section>
            <ComprehensionTest
              test={tool.comprehensionTest}
              onPass={handleTestPass}
            />
          </section>
        )}

        {/* 测试通过提示 */}
        {isTestPassed && (
          <section className="bg-morandi-green-50 border border-morandi-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-morandi-green-500 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-morandi-green-800">恭喜！理解测试通过</h3>
                <p className="text-morandi-green-700 text-sm">
                  您已掌握{tool.name}工具的核心技巧，可以继续学习下一个写作工具了。
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 正反案例 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
          <h2 className="text-2xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-morandi-green-100 rounded-lg">
              <Award className="w-5 h-5 text-morandi-green-600" />
            </div>
            正反案例对比
          </h2>

          <div className="space-y-6">
            {tool.examples.map((example, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4">
                <div className="bg-morandi-pink-50 border border-morandi-pink-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-morandi-pink-700 mb-3">
                    <div className="p-2 bg-morandi-pink-100 rounded-lg">
                      <div className="w-3 h-3 bg-morandi-pink-500 rounded-full"></div>
                    </div>
                    <span className="font-bold">避免这样写</span>
                  </div>
                  <p className="text-morandi-pink-800 bg-white/50 p-4 rounded-lg">{example.bad}</p>
                </div>

                <div className="bg-morandi-green-50 border border-morandi-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-morandi-green-700 mb-3">
                    <div className="p-2 bg-morandi-green-100 rounded-lg">
                      <div className="w-3 h-3 bg-morandi-green-500 rounded-full"></div>
                    </div>
                    <span className="font-bold">推荐这样写</span>
                  </div>
                  <p className="text-morandi-green-800 bg-white/50 p-4 rounded-lg">{example.good}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 练习题目 */}
        <section className="bg-gradient-to-br from-morandi-green-50 to-morandi-green-100 border border-morandi-green-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-morandi-green-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-morandi-green-500/20 rounded-lg">
              <Edit className="w-5 h-5 text-morandi-green-700" />
            </div>
            实战练习
          </h2>
          <div className="space-y-4">
            {tool.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-morandi-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-morandi-gray-700 mb-3">{exercise}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-morandi-blue-100 text-morandi-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {tool.name}
                      </span>
                      <Link
                        href={`/write?tool=${toolId}&topic=${encodeURIComponent(exercise)}`}
                        className="bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-1 px-3 rounded-full text-xs transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Edit className="w-3 h-3 inline mr-1" />
                        练习此题材
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/write?tool=${toolId}`}
              className="bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:from-morandi-blue-600 hover:to-morandi-blue-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Edit className="w-6 h-6" />
              立即练习此工具
            </Link>
            <Link
              href="/"
              className="bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:from-morandi-green-600 hover:to-morandi-green-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-6 h-6" />
              返回首页继续学习
            </Link>
          </div>
          <p className="text-morandi-gray-600 mt-3">完成练习后记得保存并获取AI反馈哦！</p>
        </div>
      </div>
    </div>
  );
}