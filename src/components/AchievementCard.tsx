'use client';

import { Achievement } from '@/types';
import { Trophy, Star } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-morandi-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-morandi-yellow-400 to-morandi-orange-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-morandi-gray-800">{achievement.title}</h4>
          <p className="text-sm text-morandi-gray-600 mb-2">{achievement.description}</p>
          <div className="flex items-center gap-2 text-xs text-morandi-gray-500">
            <Star className="w-3 h-3 text-morandi-yellow-500" />
            <span>获得于 {new Date(achievement.earnedAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}