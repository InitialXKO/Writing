'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Key, Globe, RotateCcw, Save } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { aiConfig, setAIConfig, resetProgress } = useAppStore();
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');
  const [baseURL, setBaseURL] = useState(aiConfig?.baseURL || '');
  const [model, setModel] = useState(aiConfig?.model || 'gpt-4');

  const handleSave = () => {
    setAIConfig({
      apiKey,
      baseURL,
      model,
    });
  };

  const handleReset = () => {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
      resetProgress();
      alert('进度已重置');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回首页
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">设置</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* AI配置 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-500" />
            AI配置
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-...your-api-key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                输入您的OpenAI或其他兼容API的密钥
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API端点 (可选)
              </label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                如果使用自定义API端点，请在此填写
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="moonshot-v1-8k">Moonshot v1 8k</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                选择要使用的AI模型
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </div>
          </div>
        </section>

        {/* 进度管理 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-red-500" />
            进度管理
          </h2>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">重置学习进度</h3>
            <p className="text-red-700 text-sm mb-4">
              此操作将清除所有已完成的关卡和作文记录，恢复到初始状态。
            </p>
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              重置所有进度
            </button>
          </div>
        </section>

        {/* 使用说明 */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            使用说明
          </h2>
          <div className="space-y-3 text-blue-700">
            <p>
              1. 请在{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                OpenAI官网
              </a>{" "}
              获取API密钥
            </p>
            <p>
              2. 也可以使用支持OpenAI格式的其他服务商，如DeepSeek、Moonshot等
            </p>
            <p>
              3. 作文批改功能需要在练习页面手动调用，系统不会自动提交内容
            </p>
            <p>
              4. 所有数据仅存储在您的浏览器中，不会上传到任何服务器
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}