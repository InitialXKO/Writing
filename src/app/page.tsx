'use client';

import { useState, useEffect } from 'react';
import { writingTools } from '@/data/tools';
import { useAppStore } from '@/lib/store';
import { Trophy, BookOpen, Settings, Play, Sparkles, Library, Calendar, Star } from 'lucide-react';
import Link from 'next/link';
import DailyChallengeCard from '@/components/DailyChallenge';
import AchievementCard from '@/components/AchievementCard';

// 为静态导出生成首页
export default function HomePage() {
  const { progress, essays, setDailyChallenge, addAchievement } = useAppStore();
  const [currentChallenge, setCurrentChallenge] = useState(progress.dailyChallenge);

  // 处理每日挑战完成
  const handleChallengeComplete = () => {
    // 更新挑战状态
    const updatedChallenge = {
      ...currentChallenge!,
      completed: true,
      streak: (currentChallenge?.streak || 0) + 1
    };

    setCurrentChallenge(updatedChallenge);
    setDailyChallenge(updatedChallenge);

    // 解锁成就
    const { habitTracker } = progress;
    if (habitTracker) {
      // 检查是否解锁连续写作成就
      const streak = (currentChallenge?.streak || 0) + 1;
      if (streak === 1) {
        addAchievement({
          title: "写作新手",
          description: "完成第一次写作挑战",
          icon: "📝"
        });
      } else if (streak === 7) {
        addAchievement({
          title: "一周坚持",
          description: "连续7天完成写作挑战",
          icon: "🏆"
        });
      } else if (streak === 30) {
        addAchievement({
          title: "写作达人",
          description: "连续30天完成写作挑战",
          icon: "🌟"
        });
      }
    }
  };

  // 检查是否需要生成新的每日挑战
  useEffect(() => {
    if (!currentChallenge) return;

    const today = new Date().toDateString();
    const challengeDate = new Date(currentChallenge.date).toDateString();

    if (today !== challengeDate) {
      // 生成新的每日挑战
      const newChallenge = {
        date: new Date(),
        task: "用'慢镜头'描写一个紧张瞬间，30字以内",
        completed: false,
        streak: currentChallenge.streak || 0
      };

      setCurrentChallenge(newChallenge);
      setDailyChallenge(newChallenge);
    }
  }, [currentChallenge, setDailyChallenge]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-morandi-gray-100 via-white to-morandi-beige-100">
      {/* 头部 */}
      <header className="text-center mb-8 py-8">
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 shadow-lg shadow-morandi-blue-500/20 mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-morandi-gray-800 mb-4 bg-gradient-to-r from-morandi-blue-600 to-morandi-green-600 bg-clip-text text-transparent">
          六年级作文成长手册
        </h1>
        <p className="text-lg text-morandi-gray-600 max-w-2xl mx-auto">
          在规则内说真话 • 游戏化学习 • 七天掌握写作技巧
        </p>
      </header>

      {/* 每日挑战 */}
      {currentChallenge && (
        <div className="max-w-4xl mx-auto mb-8">
          <DailyChallengeCard
            challenge={currentChallenge}
          />
        </div>
      )}

      {/* 习惯追踪 */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card p-6 mb-8 border border-morandi-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-morandi-gray-800 flex items-center gap-2">
            <div className="p-2 bg-morandi-green-100 rounded-lg">
              <Trophy className="w-5 h-5 text-morandi-green-600" />
            </div>
            习惯追踪
          </h2>
          <div className="text-sm text-morandi-gray-600">
            连续写作: {progress.habitTracker?.writingStreak || 0} 天
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-morandi-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-morandi-blue-700">
              {progress.levels.filter(l => l.completed).length}
            </div>
            <div className="text-sm text-morandi-blue-600">关卡完成</div>
          </div>
          <div className="bg-morandi-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-morandi-green-700">
              {essays?.length || 0}
            </div>
            <div className="text-sm text-morandi-green-600">作文篇数</div>
          </div>
          <div className="bg-morandi-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-morandi-purple-700">
              {progress.habitTracker?.writingStreak || 0}
            </div>
            <div className="text-sm text-morandi-purple-600">连续天数</div>
          </div>
          <div className="bg-morandi-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-morandi-pink-700">
              {progress.habitTracker?.achievements?.length || 0}
            </div>
            <div className="text-sm text-morandi-pink-600">成就解锁</div>
          </div>
        </div>
      </div>

      {/* 成就展示 */}
      {progress.habitTracker?.achievements && progress.habitTracker.achievements.length > 0 && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card p-6 mb-8 border border-morandi-gray-200">
          <h2 className="text-xl font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-morandi-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-morandi-yellow-600" />
            </div>
            我的成就
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.habitTracker.achievements.slice(0, 4).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* 介绍卡片 */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-400 p-6 mb-8 border border-morandi-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-morandi-gray-800 mb-4">
            开启你的写作成长之旅
          </h2>
          <p className="text-morandi-gray-600 mb-6">
            通过7个游戏化关卡，循序渐进掌握写作核心技巧
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-morandi-blue-50 text-morandi-blue-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-blue-500 rounded-full"></div>
              <span>观察发现</span>
            </div>
            <div className="flex items-center gap-2 bg-morandi-green-50 text-morandi-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
              <span>思考整理</span>
            </div>
            <div className="flex items-center gap-2 bg-morandi-pink-50 text-morandi-pink-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-morandi-pink-500 rounded-full"></div>
              <span>语言表达</span>
            </div>
          </div>
        </div>
      </div>

      {/* 工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.map((tool, index) => {
          const level = progress.levels.find(l => l.toolId === tool.id);
          // 自由写作工具始终是已解锁的
          const isUnlocked = tool.id === 'free-writing' || progress.unlockedTools.includes(tool.id);

          return (
            <div
              key={tool.id}
              className={`flex flex-col rounded-2xl p-6 border-2 bg-white transition-all duration-400 hover:-translate-y-1 ${
                isUnlocked
                  ? 'border-morandi-gray-200 hover:border-morandi-blue-400 hover:shadow-card-hover'
                  : 'border-morandi-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center text-sm font-bold shadow-md ${
                      level?.completed
                        ? 'bg-gradient-to-r from-morandi-green-500 to-morandi-green-600'
                        : isUnlocked
                          ? 'bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600'
                          : 'bg-morandi-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-morandi-gray-800">
                        {tool.name}
                      </h3>
                      <p className="text-morandi-gray-500 text-sm">{tool.title}</p>
                    </div>
                  </div>
                </div>
                {level?.completed && (
                  <div className="p-2 bg-morandi-green-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-morandi-green-600" />
                  </div>
                )}
              </div>

              <p className="text-morandi-gray-700 mb-5 line-clamp-2 flex-shrink-0">
                {tool.description}
              </p>

              <div className="space-y-3 mb-5 flex-grow">
                <div className="bg-gradient-to-r from-morandi-beige-50 to-morandi-beige-100 border border-morandi-beige-200 rounded-xl p-3">
                  <div className="text-sm font-bold text-morandi-beige-800 mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-morandi-beige-500 rounded-full"></div>
                    <span className="whitespace-pre-line">口诀：{tool.mantra}</span>
                  </div>
                  <div className="text-xs text-morandi-beige-700">
                    {tool.tips}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-morandi-gray-500 bg-morandi-gray-100 rounded-lg p-2">
                  <span className="flex items-center gap-1">✅ {tool.suitableFor}</span>
                  <span className="flex items-center gap-1">⚠️ {tool.caution}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 flex-shrink-0">
                {isUnlocked ? (
                  <Link
                    href={`/tools/${tool.id}`}
                    className="w-full bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 hover:from-morandi-blue-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {level?.completed ? '再次学习' : '开始学习'}
                    <Play className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-morandi-gray-200 text-morandi-gray-400 font-medium py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    未解锁
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-center gap-8 py-8">
        <Link
          href="/write"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-morandi-blue-600" />
          </div>
          <span className="font-medium">写作练习</span>
        </Link>

        <Link
          href="/essays"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-purple-100 rounded-lg">
            <Library className="w-5 h-5 text-morandi-purple-600" />
          </div>
          <span className="font-medium">我的作文</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50"
        >
          <div className="p-2 bg-morandi-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-morandi-green-600" />
          </div>
          <span className="font-medium">设置</span>
        </Link>
      </div>
    </div>
  );
}