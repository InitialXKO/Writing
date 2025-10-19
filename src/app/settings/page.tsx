'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getActualEndpoint } from '@/lib/utils';
import { ArrowLeft, Key, Globe, RotateCcw, Save, Shield, Info, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { aiConfig, setAIConfig, setAvailableModels, resetProgress } = useAppStore();
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');
  const [baseURL, setBaseURL] = useState(aiConfig?.baseURL || '');
  const [model, setModel] = useState(aiConfig?.model || 'gpt-4');
  const [models, setModels] = useState<string[]>(aiConfig?.models || []);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  // 同步本地状态与全局 AI 配置（处理持久化后的回显）
  useEffect(() => {
    setApiKey(aiConfig?.apiKey || '');
    setBaseURL(aiConfig?.baseURL || '');
    setModel(aiConfig?.model || 'gpt-4');
    setModels(aiConfig?.models || []);
  }, [aiConfig]);

  // 使用通用工具函数 getActualEndpoint(baseURL)

  // 从供应商拉取模型列表
  const fetchModels = async () => {
    if (!apiKey) {
      alert('请先填写API密钥');
      return;
    }

    setIsFetchingModels(true);
    try {
      const endpoint = getActualEndpoint(baseURL);
      const response = await fetch(`${endpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const modelNames = data.data.map((model: any) => model.id).filter(Boolean);
        setModels(modelNames);
        // 保存模型列表到store
        setAvailableModels(modelNames);
        alert('模型列表获取成功');
      } else {
        throw new Error('响应格式不正确');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      alert('获取模型列表失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsFetchingModels(false);
    }
  };

  // 测试连接
  const testConnection = async () => {
    if (!apiKey) {
      alert('请先填写API密钥');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);
    setConnectionMessage('');

    try {
      const endpoint = getActualEndpoint(baseURL);
      const response = await fetch(`${endpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setConnectionStatus('success');
      setConnectionMessage('连接成功');
    } catch (error) {
      console.error('连接测试失败:', error);
      setConnectionStatus('error');
      setConnectionMessage('连接失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    setAIConfig({
      apiKey,
      baseURL,
      model,
      models: aiConfig?.models || [], // 保留现有的模型列表
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
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-morandi-gray-200">
        <div className="max-w-4xl mx-auto p-6">
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
                  <Key className="w-5 h-5 text-morandi-blue-600" />
                </div>
                设置
              </h1>
              <p className="text-morandi-gray-600 text-sm">配置AI助手和管理学习进度</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* AI配置 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
          <h2 className="text-xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-morandi-green-100 rounded-lg">
              <Key className="w-5 h-5 text-morandi-green-600" />
            </div>
            AI配置
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-pink-100 rounded-md">
                  <Shield className="w-4 h-4 text-morandi-pink-600" />
                </div>
                API密钥
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-...your-api-key"
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 shadow-sm"
              />
              <p className="mt-2 text-sm text-morandi-gray-500">
                输入您的OpenAI或其他兼容API的密钥
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-blue-100 rounded-md">
                  <Globe className="w-4 h-4 text-morandi-blue-600" />
                </div>
                API端点 (可选)
              </label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="例如: https://api.openai.com/v1 或 api.openai.com"
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 shadow-sm"
              />
              <p className="mt-2 text-sm text-morandi-gray-500">
                支持完整URL或简写格式，系统会自动补全协议和路径
              </p>
              {baseURL && (
                <div className="mt-2 p-3 bg-morandi-gray-50 rounded-lg">
                  <p className="text-sm text-morandi-gray-600">
                    实际使用端点: <span className="font-mono text-morandi-blue-600">{getActualEndpoint(baseURL)}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2">
                模型
              </label>
              <div className="flex gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 bg-white shadow-sm"
                >
                  {models.length > 0 ? (
                    models.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="deepseek-chat">DeepSeek Chat</option>
                      <option value="moonshot-v1-8k">Moonshot v1 8k</option>
                    </>
                  )}
                </select>
                <button
                  onClick={fetchModels}
                  disabled={isFetchingModels || !apiKey}
                  className="px-4 py-3 bg-morandi-blue-500 text-white rounded-xl hover:bg-morandi-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isFetchingModels ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  获取模型
                </button>
              </div>
              <p className="mt-2 text-sm text-morandi-gray-500">
                选择要使用的AI模型，点击"获取模型"从供应商拉取模型列表
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={testConnection}
                disabled={isTestingConnection || !apiKey}
                className="flex items-center gap-2 bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </div>
            {connectionStatus && (
              <div className={`mt-4 p-4 rounded-xl ${connectionStatus === 'success' ? 'bg-morandi-green-50 border border-morandi-green-200' : 'bg-morandi-pink-50 border border-morandi-pink-200'}`}>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-morandi-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-morandi-pink-600" />
                  )}
                  <span className={`font-medium ${connectionStatus === 'success' ? 'text-morandi-green-800' : 'text-morandi-pink-800'}`}>
                    {connectionMessage}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 进度管理 */}
        <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
          <h2 className="text-xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-morandi-pink-100 rounded-lg">
              <RotateCcw className="w-5 h-5 text-morandi-pink-600" />
            </div>
            进度管理
          </h2>

          <div className="p-5 bg-gradient-to-br from-morandi-pink-50 to-morandi-pink-100 border border-morandi-pink-200 rounded-xl">
            <h3 className="font-bold text-morandi-pink-800 mb-2 flex items-center gap-2">
              <div className="p-1 bg-morandi-pink-200 rounded-md">
                <RotateCcw className="w-4 h-4 text-morandi-pink-700" />
              </div>
              重置学习进度
            </h3>
            <p className="text-morandi-pink-700 text-sm mb-4">
              此操作将清除所有已完成的关卡和作文记录，恢复到初始状态。
            </p>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-morandi-pink-500 to-morandi-pink-600 hover:from-morandi-pink-600 hover:to-morandi-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              重置所有进度
            </button>
          </div>
        </section>

        {/* 使用说明 */}
        <section className="bg-gradient-to-br from-morandi-blue-50 to-morandi-blue-100 border border-morandi-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-morandi-blue-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-morandi-blue-500/20 rounded-lg">
              <Info className="w-5 h-5 text-morandi-blue-700" />
            </div>
            使用说明
          </h2>
          <div className="space-y-4 text-morandi-blue-700 bg-white/50 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-morandi-blue-500 rounded-full flex-shrink-0"></div>
              <p>
                请在{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-morandi-blue-600 underline hover:text-morandi-blue-800 font-medium"
                >
                  OpenAI官网
                </a>{" "}
                获取API密钥
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-morandi-blue-500 rounded-full flex-shrink-0"></div>
              <p>也可以使用支持OpenAI格式的其他服务商，如DeepSeek、Moonshot等</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-morandi-blue-500 rounded-full flex-shrink-0"></div>
              <p>作文批改功能需要在练习页面手动调用，系统不会自动提交内容</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 bg-morandi-blue-500 rounded-full flex-shrink-0"></div>
              <p>所有数据仅存储在您的浏览器中，不会上传到任何服务器</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}