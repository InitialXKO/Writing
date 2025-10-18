'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DailyChallenge } from '@/types';
import { Sparkles, CheckCircle, Calendar, Trophy } from 'lucide-react';

interface DailyChallengeProps {
  challenge: DailyChallenge;
  onComplete: () => void;
}

export default function DailyChallengeCard({ challenge, onComplete }: DailyChallengeProps) {
  const [isCompleted, setIsCompleted] = useState(challenge.completed);
  const { updateHabitTracker } = useAppStore();

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();

      // 更新习惯追踪器
      updateHabitTracker({
        writingStreak: challenge.streak + 1,
        weeklyGoal: Math.min((challenge.streak + 1) / 7, 1) // 简化的周目标进度
      });
    }
  };

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
          <span className="text-sm font-medium">{challenge.date.toLocaleDateString('zh-CN')}</span>
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

        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            isCompleted
              ? 'bg-morandi-green-500 text-white'
              : 'bg-gradient-to-r from-morandi-purple-500 to-morandi-purple-600 hover:from-morandi-purple-600 hover:to-morandi-purple-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              已完成
            </>
          ) : (
            '完成挑战'
          )}
        </button>
      </div>
    </div>
  );
}