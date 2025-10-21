'use client';

import { DailyChallenge } from '@/types';
import { Sparkles, CheckCircle, Calendar, Trophy, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface DailyChallengeProps {
  challenge: DailyChallenge;
  onSwap?: () => void;
  onMakeup?: () => void;
}

export default function DailyChallengeCard({ challenge, onSwap, onMakeup }: DailyChallengeProps) {
  // 确保日期是 Date 对象，如果不是则转换
  const challengeDate = typeof challenge.date === 'string'
    ? new Date(challenge.date)
    : challenge.date;

  const targetHref = challenge.recommendedToolId
    ? `/write?tool=${encodeURIComponent(challenge.recommendedToolId)}`
    : '/write';

  return (
    <div className="bg-gradient-to-br from-morandi-purple-50 to-morandi-purple-100 border border-morandi-purple-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-morandi-purple-800 flex items-center gap-2">
          <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-morandi-purple-700" />
          </div>
          每日挑战
        </h3>
        <div className="flex items-center gap-2 text-morandi-purple-700">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{challengeDate.toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-morandi-purple-800 bg-white/50 p-4 rounded-xl">
          {challenge.task}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-morandi-purple-700">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">连续 {challenge.streak} 天</span>
        </div>

        {challenge.completed ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-morandi-green-500 text-white shadow-md">
            <CheckCircle className="w-4 h-4" />
            已完成
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={targetHref}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              去完成
            </Link>
            {onSwap && (
              <button
                onClick={onSwap}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium bg-white text-morandi-purple-700 border border-morandi-purple-300 hover:bg-morandi-purple-50 shadow-sm whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                换一个
              </button>
            )}
            {challenge.canMakeup && onMakeup && (
              <button
                onClick={onMakeup}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium bg-white text-morandi-purple-700 border border-morandi-purple-300 hover:bg-morandi-purple-50 shadow-sm whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                补签
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}