'use client';

import { Achievement } from '@/types';
import { Trophy, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <Card className="border-morandi-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-morandi-yellow-400 to-morandi-orange-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-morandi-gray-800 mb-1">{achievement.title}</h4>
            <p className="text-sm text-morandi-gray-600 mb-2">{achievement.description}</p>
            <Badge variant="outline" className="text-xs text-morandi-gray-500 border-morandi-gray-300">
              <Star className="w-3 h-3 text-morandi-yellow-500 mr-1" />
              获得于 {(typeof achievement.earnedAt === 'string' ? new Date(achievement.earnedAt) : achievement.earnedAt).toLocaleDateString('zh-CN')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}