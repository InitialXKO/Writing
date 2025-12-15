'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <Card className="bg-gradient-to-br from-morandi-purple-50 to-morandi-purple-100 border-morandi-purple-200 shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl text-morandi-purple-800 flex items-center gap-2">
          <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
            <Lock className="w-5 h-5 text-morandi-purple-700" />
          </div>
          不要恐慌
        </CardTitle>
        <CardDescription className="text-morandi-purple-700">
          此工具需要输入密码才能解锁
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-morandi-purple-800 mb-2">
              输入密码
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-morandi-purple-300 focus:ring-morandi-purple-500 focus:border-morandi-purple-500"
              placeholder="请输入密码"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Card className="bg-morandi-red-50 border-morandi-red-200">
              <CardContent className="p-3 flex items-center gap-2 text-morandi-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !password}
            className={`w-full ${
              isSubmitting || !password
                ? 'bg-morandi-gray-200 text-morandi-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-morandi-purple-500 to-morandi-purple-600 hover:from-morandi-purple-600 hover:to-morandi-purple-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-morandi-purple-200 border-t-morandi-purple-600 rounded-full animate-spin mr-2"></div>
                验证中...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                解锁工具
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}