'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { writingTools } from '@/data/tools';
import { ArrowLeft, Send, Save, Sparkles, Edit3, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';

function WriteContent() {
  const { addEssay, aiConfig } = useAppStore();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTool, setSelectedTool] = useState(writingTools[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 从URL参数中获取预选的工具和题材
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    const topicParam = searchParams.get('topic');

    if (toolParam && writingTools.some(tool => tool.id === toolParam)) {
      setSelectedTool(toolParam);
    }

    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
      // 如果有题材要求，可以将其作为默认内容或提示
      if (!content) {
        setContent(`请围绕以下主题进行写作：${decodeURIComponent(topicParam)}\n\n`);
      }
    }
  }, [searchParams, content]);

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
      // 没有API密钥时直接跳转到设置页面
      window.location.href = '/settings';
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
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-morandi-gray-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-2 rounded-lg hover:bg-morandi-blue-50"
              >
                <div className="p-2 bg-morandi-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                返回首页
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-morandi-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-morandi-blue-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-morandi-blue-600" />
                  </div>
                  写作练习
                </h1>
                <p className="text-morandi-gray-600 text-sm">运用写作工具，创作你的作文</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
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
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            {/* 显示当前题材要求 */}
            {topic && (
              <div className="mb-6 p-4 bg-morandi-beige-50 border border-morandi-beige-200 rounded-xl">
                <div className="flex items-center gap-2 text-morandi-beige-700 mb-2">
                  <div className="p-1 bg-morandi-beige-100 rounded-md">
                    <Sparkles className="w-4 h-4 text-morandi-beige-600" />
                  </div>
                  <span className="font-medium">写作题材要求</span>
                </div>
                <p className="text-morandi-beige-800 bg-white p-3 rounded-lg">
                  {topic}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-morandi-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-morandi-green-100 rounded-md">
                    <Zap className="w-4 h-4 text-morandi-green-600" />
                  </div>
                  选择工具
                </label>
                <div className="text-xs bg-morandi-blue-100 text-morandi-blue-800 px-2 py-1 rounded-full">
                  {selectedToolData?.name}
                </div>
              </div>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 bg-white shadow-sm"
              >
                {writingTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} - {tool.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-beige-100 rounded-md">
                  <Sparkles className="w-4 h-4 text-morandi-beige-600" />
                </div>
                作文标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作文起个好名字"
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-green-100 rounded-md">
                  <Edit3 className="w-4 h-4 text-morandi-green-600" />
                </div>
                作文内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始你的创作吧...运用你学到的写作技巧"
                rows={20}
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 font-sans text-base shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* AI反馈和提示区域 */}
        <div className="space-y-6">
          {/* 核心工具提示 */}
          <div className="bg-gradient-to-br from-morandi-blue-50 to-morandi-blue-100 border border-morandi-blue-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-morandi-blue-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-blue-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-morandi-blue-700" />
              </div>
              核心口诀
            </h2>
            <div className="bg-white/50 p-4 rounded-xl mb-4">
              <div className="text-lg font-bold text-morandi-blue-900">{selectedToolData?.mantra}</div>
            </div>
            <p className="text-morandi-blue-700 text-sm">{selectedToolData?.tips}</p>
          </div>

          {/* 正反案例 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            <h3 className="font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-green-100 rounded-lg">
                <Zap className="w-4 h-4 text-morandi-green-600" />
              </div>
              写作示范
            </h3>
            <div className="space-y-4">
              {selectedToolData?.examples.slice(0, 1).map((example, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-morandi-pink-50 border border-morandi-pink-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-morandi-pink-700 mb-2">
                      <div className="w-2 h-2 bg-morandi-pink-500 rounded-full"></div>
                      <span className="font-medium text-sm">避免这样写</span>
                    </div>
                    <p className="text-morandi-pink-800 text-sm">{example.bad}</p>
                  </div>

                  <div className="bg-morandi-green-50 border border-morandi-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-morandi-green-700 mb-2">
                      <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
                      <span className="font-medium text-sm">推荐这样写</span>
                    </div>
                    <p className="text-morandi-green-800 text-sm">{example.good}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI反馈区域 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            <h2 className="text-lg font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-green-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-morandi-green-600" />
              </div>
              AI智能批改
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-morandi-gray-600">
                使用AI帮你检查作文，提供专业的修改建议。请确保已在设置中配置了API密钥。
              </p>

              <button
                onClick={handleAIReview}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
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
                <div className="mt-4 p-4 bg-morandi-gray-50 border border-morandi-gray-200 rounded-xl">
                  <h3 className="font-bold text-morandi-gray-800 mb-2 flex items-center gap-2">
                    <div className="p-1 bg-morandi-green-100 rounded-md">
                      <Zap className="w-4 h-4 text-morandi-green-600" />
                    </div>
                    批改反馈
                  </h3>
                  <div className="text-sm text-morandi-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg">
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

import { Suspense } from 'react';

export default function WritePage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <WriteContent />
    </Suspense>
  );
}