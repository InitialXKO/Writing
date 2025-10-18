'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Key, Globe, RotateCcw, Save, Shield, Info } from 'lucide-react';
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
    alert('配置已保存');
  };

  const handleReset = () => {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
      resetProgress();
      alert('进度已重置');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-neutral-200">
        <div className="max-w-4xl mx-auto p-6">
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
                  <Key className="w-5 h-5 text-primary-600" />
                </div>
                设置
              </h1>
              <p className="text-neutral-600 text-sm">配置AI助手和管理学习进度</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* AI配置 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Key className="w-5 h-5 text-secondary-600" />
            </div>
            AI配置
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-warning-100 rounded-md">
                  <Shield className="w-4 h-4 text-warning-600" />
                </div>
                API密钥
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-...your-api-key"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
              <p className="mt-2 text-sm text-neutral-500">
                输入您的OpenAI或其他兼容API的密钥
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-primary-100 rounded-md">
                  <Globe className="w-4 h-4 text-primary-600" />
                </div>
                API端点 (可选)
              </label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
              <p className="mt-2 text-sm text-neutral-500">
                如果使用自定义API端点，请在此填写
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="moonshot-v1-8k">Moonshot v1 8k</option>
              </select>
              <p className="mt-2 text-sm text-neutral-500">
                选择要使用的AI模型
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </div>
          </div>
        </section>

        {/* 进度管理 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-danger-100 rounded-lg">
              <RotateCcw className="w-5 h-5 text-danger-600" />
            </div>
            进度管理
          </h2>

          <div className="p-5 bg-gradient-to-br from-danger-50 to-danger-100 border border-danger-200 rounded-xl">
            <h3 className="font-bold text-danger-800 mb-2 flex items-center gap-2">
              <div className="p-1 bg-danger-200 rounded-md">
                <RotateCcw className="w-4 h-4 text-danger-700" />
              </div>
              重置学习进度
            </h3>
            <p className="text-danger-700 text-sm mb-4">
              此操作将清除所有已完成的关卡和作文记录，恢复到初始状态。
            </p>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              重置所有进度
            </button>
          </div>
        </section>

        {/* 使用说明 */}
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Info className="w-5 h-5 text-primary-700" />
            </div>
            使用说明
          </h2>
          <div className="space-y-4 text-primary-700 bg-white/50 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
              <p>
                请在{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline hover:text-primary-800 font-medium"
                >
                  OpenAI官网
                </a>{" "}
                获取API密钥
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
              <p>也可以使用支持OpenAI格式的其他服务商，如DeepSeek、Moonshot等</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
              <p>作文批改功能需要在练习页面手动调用，系统不会自动提交内容</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
              <p>所有数据仅存储在您的浏览器中，不会上传到任何服务器</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}