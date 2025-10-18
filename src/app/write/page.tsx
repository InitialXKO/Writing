'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { writingTools } from '@/data/tools';
import { ArrowLeft, Send, Save, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回首页
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">写作练习</h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                保存作文
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 编辑区域 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择工具
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {writingTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} - {tool.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作文标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作文起个好名字"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作文内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始你的创作吧..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* AI反馈区域 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI智能批改
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                使用AI帮你检查作文，提供专业的修改建议。请确保已在设置中配置了API密钥。
              </p>

              <button
                onClick={handleAIReview}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">批改反馈</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 工具提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3">写作提示</h3>
            <div className="space-y-2 text-blue-700">
              {writingTools
                .find(t => t.id === selectedTool)
                ?.examples.map((example, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">避免：</div>
                    <div className="ml-2">{example.bad}</div>
                    <div className="font-medium mt-1">推荐：</div>
                    <div className="ml-2">{example.good}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}