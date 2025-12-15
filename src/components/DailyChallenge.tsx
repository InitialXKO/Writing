'use client';

import { DailyChallenge } from '@/types';
import { Sparkles, CheckCircle, Calendar, Trophy, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <Card className="bg-gradient-to-br from-morandi-purple-50 to-morandi-purple-100 border-morandi-purple-200 shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-morandi-purple-800 flex items-center gap-2">
            <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-morandi-purple-700" />
            </div>
            每日挑战
          </CardTitle>
          <Badge variant="secondary" className="bg-white/50 text-morandi-purple-700 border-morandi-purple-300">
            <Calendar className="w-4 h-4 mr-1" />
            {challengeDate.toLocaleDateString('zh-CN')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Card className="bg-white/50 border-white/80">
          <CardContent className="p-4">
            <p className="text-morandi-purple-800">
              {challenge.task}
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge className="bg-morandi-purple-200 text-morandi-purple-700 border-morandi-purple-300 hover:bg-morandi-purple-300">
            <Trophy className="w-4 h-4 mr-1" />
            连续 {challenge.streak} 天
          </Badge>

          {challenge.completed ? (
            <Badge className="bg-morandi-green-500 text-white border-0 hover:bg-morandi-green-600 px-4 py-2 shadow-md">
              <CheckCircle className="w-4 h-4 mr-1" />
              已完成
            </Badge>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                className="bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white shadow-md hover:shadow-lg"
              >
                <Link href={targetHref}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  去完成
                </Link>
              </Button>
              {onSwap && (
                <Button
                  onClick={onSwap}
                  variant="outline"
                  className="bg-white text-morandi-purple-700 border-morandi-purple-300 hover:bg-morandi-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  换一个
                </Button>
              )}
              {challenge.canMakeup && onMakeup && (
                <Button
                  onClick={onMakeup}
                  variant="outline"
                  className="bg-white text-morandi-purple-700 border-morandi-purple-300 hover:bg-morandi-purple-50"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  补签
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}