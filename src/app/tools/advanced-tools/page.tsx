'use client';

import { useState } from 'react';
import { writingTools } from '@/data/tools';
import { useAppStore } from '@/lib/store';
import AdvancedToolsHub from '@/components/AdvancedToolsHub';
import PasswordInput from '@/components/PasswordInput';
import { ArrowLeft, CheckCircle, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';

export default function AdvancedToolsPage() {
  const { progress, setProgress } = useAppStore();
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);

  const handleToolSelect = (toolId: string) => {
    window.location.href = `/tools/${toolId}`;
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleUnlock = () => {
    setIsPasswordUnlocked(true);
    // 更新进度状态，标记高级工具集为已解锁
    const updatedUnlockedTools = [...progress.unlockedTools, 'advanced-tools'];
    setProgress({
      ...progress,
      unlockedTools: updatedUnlockedTools
    });
  };

  if (!isPasswordUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-morandi-purple-600 to-morandi-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-morandi-purple-100 hover:text-white transition-colors mb-6 w-fit"
            >
              <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </div>
              返回首页
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">高级思维工具集</h1>
                  <p className="text-morandi-purple-100 text-lg">作文思维方法 - 从套路到灵活运用</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-morandi-orange-50 to-morandi-red-50 border border-morandi-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-morandi-orange-800">
                  <AlertTriangle className="w-5 h-5 text-morandi-orange-700" />
                  <span className="font-bold">超纲警告</span>
                </div>
                <p className="text-morandi-orange-700">以下内容属于超纲知识，仅供学有余力的同学参考。请确保已熟练掌握基础写作工具后再学习这些高级技巧。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-6xl mx-auto p-6 space-y-8 pb-12">
          <div className="bg-morandi-purple-50 border border-morandi-purple-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Lightbulb className="w-5 h-5 text-morandi-purple-600" />
              </div>
              <div>
                <p className="text-morandi-purple-800 font-medium">作文思维方法</p>
                <p className="text-morandi-purple-700 text-sm">
                  告别死记硬背的范文套路，用灵活的思维方法和表达技巧来构建你的独特文章。
                  每一种方法都是一个实用工具，帮助你更好地组织思路，清晰地表达想法。
                </p>
              </div>
            </div>
          </div>

          <section>
            <PasswordInput
              toolId="advanced-tools"
              correctPassword="42"
              onUnlock={handleUnlock}
            />
          </section>

          <div className="text-center pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBack}
                className="bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:from-morandi-blue-600 hover:to-morandi-blue-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="w-6 h-6" />
                返回首页继续学习
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdvancedToolsHub
      tools={writingTools}
      onToolSelect={handleToolSelect}
      onBack={handleBack}
    />
  );
}