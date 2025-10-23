'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Lock, Unlock } from 'lucide-react';

interface PasswordInputProps {
  toolId: string;
  correctPassword: string;
  onUnlock: () => void;
}

export default function PasswordInput({ toolId, correctPassword, onUnlock }: PasswordInputProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { progress, setProgress } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // 检查密码是否正确
    if (password === correctPassword) {
      // 更新进度状态，标记工具为已解锁
      const updatedUnlockedTools = [...progress.unlockedTools, toolId];
      setProgress({
        ...progress,
        unlockedTools: updatedUnlockedTools
      });

      // 调用解锁回调
      onUnlock();
    } else {
      setError('密码错误，请重试');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-gradient-to-br from-morandi-purple-50 to-morandi-purple-100 border border-morandi-purple-200 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-morandi-purple-800 mb-4 flex items-center gap-2">
        <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
          <Lock className="w-5 h-5 text-morandi-purple-700" />
        </div>
        超纲警告
      </h2>
      <p className="text-morandi-purple-700 mb-4">
        此工具属于超纲内容，需要输入密码才能解锁
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-morandi-purple-800 mb-1">
            输入密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-morandi-purple-300 rounded-lg focus:ring-2 focus:ring-morandi-purple-500 focus:border-morandi-purple-500"
            placeholder="请输入密码"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="text-morandi-red-600 text-sm bg-morandi-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
            isSubmitting || !password
              ? 'bg-morandi-gray-200 text-morandi-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-morandi-purple-500 to-morandi-purple-600 hover:from-morandi-purple-600 hover:to-morandi-purple-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-morandi-purple-200 border-t-morandi-purple-600 rounded-full animate-spin"></div>
              验证中...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              解锁工具
            </>
          )}
        </button>
      </form>
    </div>
  );
}