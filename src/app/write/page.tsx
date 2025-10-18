'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { writingTools } from '@/data/tools';
import { ArrowLeft, Send, Save, Sparkles, Edit3, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';

export default function WritePage() {
  const { addEssay, aiConfig } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTool, setSelectedTool] = useState(writingTools[0]?.id || '');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    // 保存到本地存储
    addEssay({
      title,
      content,
      toolUsed: selectedTool,
    });

    alert('作文已保存到我的作文中');
  };

  const handleAIReview = async () => {
    if (!content.trim()) {
      alert('请先填写作文内容');
      return;
    }

    if (!aiConfig?.apiKey) {
      alert('请先在设置中配置AI API密钥');
      return;
    }

    setIsGenerating(true);
    setFeedback('正在生成反馈...');

    try {
      // 模拟AI批改（实际项目中会调用API）
      const tool = writingTools.find(t => t.id === selectedTool);

      // 这里应该调用真实的AI API
      // 暂时使用模拟延迟来演示
      await new Promise(resolve => setTimeout(resolve, 2000));

      setFeedback(`作为作文导师，我看到了你运用了【${tool?.name}】的技巧：

✅ 优点：
1. 你很好地使用了具体的动作描写
2. 在关键场景使用了慢镜头技巧
3. 结尾有深度，不落俗套

❌ 改进建议：
1. 可以增加更多五感描写来增强画面感
2. 部分句子可以调整节奏，增加音乐感

继续加油！`);
    } catch (error) {
      setFeedback('批改失败，请检查API配置或稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedToolData = writingTools.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-neutral-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
              >
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                返回首页
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-primary-600" />
                  </div>
                  写作练习
                </h1>
                <p className="text-neutral-600 text-sm">运用写作工具，创作你的作文</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              保存作文
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 编辑区域 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <div className="p-1 bg-secondary-100 rounded-md">
                    <Zap className="w-4 h-4 text-secondary-600" />
                  </div>
                  选择工具
                </label>
                <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {selectedToolData?.name}
                </div>
              </div>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
              >
                {writingTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} - {tool.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-warning-100 rounded-md">
                  <Sparkles className="w-4 h-4 text-warning-600" />
                </div>
                作文标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作文起个好名字"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-success-100 rounded-md">
                  <Edit3 className="w-4 h-4 text-success-600" />
                </div>
                作文内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始你的创作吧...运用你学到的写作技巧"
                rows={20}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-base shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* AI反馈和提示区域 */}
        <div className="space-y-6">
          {/* 核心工具提示 */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-primary-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-primary-700" />
              </div>
              核心口诀
            </h2>
            <div className="bg-white/50 p-4 rounded-xl mb-4">
              <div className="text-lg font-bold text-primary-900">{selectedToolData?.mantra}</div>
            </div>
            <p className="text-primary-700 text-sm">{selectedToolData?.tips}</p>
          </div>

          {/* 正反案例 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Zap className="w-4 h-4 text-secondary-600" />
              </div>
              写作示范
            </h3>
            <div className="space-y-4">
              {selectedToolData?.examples.slice(0, 1).map((example, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-danger-700 mb-2">
                      <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
                      <span className="font-medium text-sm">避免这样写</span>
                    </div>
                    <p className="text-danger-800 text-sm">{example.bad}</p>
                  </div>

                  <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-success-700 mb-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="font-medium text-sm">推荐这样写</span>
                    </div>
                    <p className="text-success-800 text-sm">{example.good}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI反馈区域 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-secondary-600" />
              </div>
              AI智能批改
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                使用AI帮你检查作文，提供专业的修改建议。请确保已在设置中配置了API密钥。
              </p>

              <button
                onClick={handleAIReview}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    获取AI反馈
                  </>
                )}
              </button>

              {feedback && (
                <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <h3 className="font-bold text-neutral-800 mb-2 flex items-center gap-2">
                    <div className="p-1 bg-success-100 rounded-md">
                      <Zap className="w-4 h-4 text-success-600" />
                    </div>
                    批改反馈
                  </h3>
                  <div className="text-sm text-neutral-700 whitespace-pre-wrap bg-white p-3 rounded-lg">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}