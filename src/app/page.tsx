'use client';

import { useState, useEffect } from 'react';
import { writingTools } from '@/data/tools';
import { useAppStore } from '@/lib/store';
import { canUnlockTool } from '@/lib/store'; // 导入解锁条件检查函数
import { Trophy, BookOpen, Settings, Play, Sparkles, Library, Star, Lock } from 'lucide-react';
import Link from 'next/link';
import DailyChallengeCard from '@/components/DailyChallenge';
import AchievementCard from '@/components/AchievementCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 为静态导出生成首页
export default function HomePage() {
  const { progress, essays, setDailyChallenge, addAchievement, updateHabitTracker } = useAppStore();
  const [currentChallenge, setCurrentChallenge] = useState(progress.dailyChallenge);

  // 计算可用于每日挑战的工具（不包含未解锁的工具）
  const getAvailableToolsForChallenge = () => {
    return writingTools.filter(tool => {
      if (tool.id === 'free-writing') return true;
      const level = progress.levels.find(l => l.toolId === tool.id);
      return !!level?.testPassed;
    });
  };

  const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateDailyChallenge = () => {
    const available = getAvailableToolsForChallenge();
    const selected = available.length > 0 ? pickRandom(available) : writingTools[0];
    const exercises = selected.exercises || [];
    const task = exercises.length > 0 ? pickRandom(exercises) : '自由写作：记录今天让你印象最深刻的一个瞬间（30字以内）';
    return {
      date: new Date(),
      task,
      completed: false,
      streak: currentChallenge?.streak || 0,
      recommendedToolId: selected.id,
      canMakeup: false,
    };
  };

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

  // 换一个每日挑战（仅从已解锁工具中挑选）
  const handleSwapChallenge = () => {
    const available = getAvailableToolsForChallenge();

    // 如果没有可用工具，直接返回
    if (available.length === 0) {
      return;
    }

    let newTask = currentChallenge!.task;
    let selectedTool = writingTools[0];
    let maxAttempts = 10; // 防止无限循环
    let attempts = 0;

    // 循环直到找到不同的任务或达到最大尝试次数
    while (newTask === currentChallenge!.task && attempts < maxAttempts && available.some(tool => (tool.exercises?.length || 0) > 1)) {
      const selected = available.length > 0 ? pickRandom(available) : writingTools[0];
      selectedTool = selected;
      const exercises = selected.exercises || [];

      // 如果当前工具只有一个练习，则尝试其他工具
      if (exercises.length <= 1 && newTask === currentChallenge!.task) {
        // 寻找有多个练习的工具
        const toolsWithMultipleExercises = available.filter(tool => (tool.exercises?.length || 0) > 1);
        if (toolsWithMultipleExercises.length > 0) {
          const selectedWithMultiple = pickRandom(toolsWithMultipleExercises);
          selectedTool = selectedWithMultiple;
          const multipleExercises = selectedWithMultiple.exercises || [];
          if (multipleExercises.length > 0) {
            newTask = pickRandom(multipleExercises);
          } else {
            newTask = '自由写作：记录今天让你印象最深刻的一个瞬间（30字以内）';
          }
        } else {
          // 如果所有工具都只有一个练习，则随机选择
          newTask = exercises.length > 0 ? pickRandom(exercises) : '自由写作：记录今天让你印象最深刻的一个瞬间（30字以内）';
        }
      } else {
        newTask = exercises.length > 0 ? pickRandom(exercises) : '自由写作：记录今天让你印象最深刻的一个瞬间（30字以内）';
      }

      attempts++;
    }

    // 如果尝试了多次仍然相同，则添加一个随机后缀来强制变化
    if (newTask === currentChallenge!.task) {
      newTask += ` (${Math.floor(Math.random() * 1000)})`;
    }

    const updated = {
      ...currentChallenge!,
      task: newTask,
      recommendedToolId: selectedTool.id,
      completed: false,
    };
    setCurrentChallenge(updated);
    setDailyChallenge(updated);
  };

  // 补签：如果昨天未完成，可补签一次，仅增加连续天数
  const handleMakeup = () => {
    if (!currentChallenge?.canMakeup) return;
    const updated = {
      ...currentChallenge!,
      streak: (currentChallenge?.streak || 0) + 1,
      canMakeup: false,
    };
    setCurrentChallenge(updated);
    setDailyChallenge(updated);
    // 同步更新习惯追踪连续天数
    updateHabitTracker({ writingStreak: (progress.habitTracker?.writingStreak || 0) + 1 });
  };

  // 检查是否需要生成新的每日挑战
  useEffect(() => {
    if (!currentChallenge) return;

    const today = new Date().toDateString();
    const challengeDate = new Date(currentChallenge.date).toDateString();

    if (today !== challengeDate) {
      // 生成新的每日挑战：仅使用已解锁（可练习）的工具
      let newChallenge = generateDailyChallenge();
      // 如果上一日未完成，则开启一次补签机会
      if (!currentChallenge.completed) {
        newChallenge = { ...newChallenge, canMakeup: true };
      }
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
            onSwap={handleSwapChallenge}
            onMakeup={handleMakeup}
          />
        </div>
      )}

      {/* 习惯追踪 */}
      <Card className="max-w-4xl mx-auto mb-8 border-morandi-gray-200 shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-morandi-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-morandi-green-600" />
              </div>
              习惯追踪
            </CardTitle>
            <Badge variant="secondary" className="bg-morandi-green-50 text-morandi-green-700 border-morandi-green-200">
              连续 {progress.habitTracker?.writingStreak || 0} 天
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-morandi-blue-50 border-morandi-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-morandi-blue-700">
                  {progress.levels.filter(l => l.completed).length}
                </div>
                <div className="text-sm text-morandi-blue-600">关卡完成</div>
              </CardContent>
            </Card>
            <Card className="bg-morandi-green-50 border-morandi-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-morandi-green-700">
                  {essays?.length || 0}
                </div>
                <div className="text-sm text-morandi-green-600">作文篇数</div>
              </CardContent>
            </Card>
            <Card className="bg-morandi-purple-50 border-morandi-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-morandi-purple-700">
                  {progress.habitTracker?.writingStreak || 0}
                </div>
                <div className="text-sm text-morandi-purple-600">连续天数</div>
              </CardContent>
            </Card>
            <Card className="bg-morandi-pink-50 border-morandi-pink-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-morandi-pink-700">
                  {progress.habitTracker?.achievements?.length || 0}
                </div>
                <div className="text-sm text-morandi-pink-600">成就解锁</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 成就展示 */}
      {progress.habitTracker?.achievements && progress.habitTracker.achievements.length > 0 && (
        <Card className="max-w-4xl mx-auto mb-8 border-morandi-gray-200 shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-morandi-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-morandi-yellow-600" />
              </div>
              我的成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.habitTracker.achievements.slice(0, 4).map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 介绍卡片 */}
      <Card className="max-w-4xl mx-auto mb-8 border-morandi-gray-200 shadow-card hover:shadow-card-hover transition-all duration-400">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">开启你的写作成长之旅</CardTitle>
          <CardDescription className="text-base">
            通过7个游戏化关卡，循序渐进掌握写作核心技巧
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="flex items-center gap-2 bg-morandi-blue-50 text-morandi-blue-700 border-morandi-blue-200 hover:bg-morandi-blue-100 px-4 py-2">
              <div className="w-2 h-2 bg-morandi-blue-500 rounded-full"></div>
              <span>观察发现</span>
            </Badge>
            <Badge className="flex items-center gap-2 bg-morandi-green-50 text-morandi-green-700 border-morandi-green-200 hover:bg-morandi-green-100 px-4 py-2">
              <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
              <span>思考整理</span>
            </Badge>
            <Badge className="flex items-center gap-2 bg-morandi-pink-50 text-morandi-pink-700 border-morandi-pink-200 hover:bg-morandi-pink-100 px-4 py-2">
              <div className="w-2 h-2 bg-morandi-pink-500 rounded-full"></div>
              <span>语言表达</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 基本工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.filter(tool => {
          // 只显示基本工具（tool-0到tool-6）、自由写作工具和作文步骤工具
          const toolNumber = tool.id.startsWith('tool-') ? parseInt(tool.id.split('-')[1]) : -1;
          return tool.id === 'free-writing' || tool.id === 'writing-steps' || (toolNumber >= 0 && toolNumber <= 6);
        }).map((tool, index) => {
          const level = progress.levels.find(l => l.toolId === tool.id);
          // 自由写作工具始终是已解锁的
          const isUnlocked = tool.id === 'free-writing' || progress.unlockedTools.includes(tool.id);
          // 检查是否可以解锁（但尚未解锁）
          const canUnlock = tool.id !== 'free-writing' && !isUnlocked && canUnlockTool(tool.id, progress, writingTools);

          return (
            <Card
              key={tool.id}
              className={`flex flex-col transition-all duration-400 hover:-translate-y-1 ${
                isUnlocked
                  ? 'border-morandi-gray-200 hover:border-morandi-blue-400 hover:shadow-card-hover'
                  : 'border-morandi-gray-100 opacity-60'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
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
                      <CardTitle className="text-xl text-morandi-gray-800">
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="text-morandi-gray-500">
                        {tool.title}
                      </CardDescription>
                    </div>
                  </div>
                  {level?.completed && (
                    <Badge className="bg-morandi-green-100 text-morandi-green-800 border-morandi-green-200 hover:bg-morandi-green-200">
                      <Trophy className="w-4 h-4 mr-1" />
                      完成
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-grow pb-4">
                <p className="text-morandi-gray-700 line-clamp-2">
                  {tool.description}
                </p>

                <Card className="bg-gradient-to-r from-morandi-beige-50 to-morandi-beige-100 border-morandi-beige-200">
                  <CardContent className="p-3">
                    <div className="text-sm font-bold text-morandi-beige-800 mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 bg-morandi-beige-500 rounded-full"></div>
                      <span className="whitespace-pre-line">口诀：{tool.mantra}</span>
                    </div>
                    <div className="text-xs text-morandi-beige-700">
                      {tool.tips}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center text-xs text-morandi-gray-500 bg-morandi-gray-100 rounded-lg p-2">
                  <span className="flex items-center gap-1">✅ {tool.suitableFor}</span>
                  <span className="flex items-center gap-1">⚠️ {tool.caution}</span>
                </div>

                {!isUnlocked && tool.id !== 'free-writing' && tool.unlockConditions && (
                  <Card className="bg-morandi-purple-50 border-morandi-purple-200">
                    <CardContent className="p-2 text-xs">
                      <div className="font-medium text-morandi-purple-700 mb-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        解锁条件：
                      </div>
                      <div className="space-y-1 text-morandi-purple-600">
                        {tool.unlockConditions.prerequisiteTools && (
                          <div>前置: {tool.unlockConditions.prerequisiteTools.length}个工具</div>
                        )}
                        {tool.unlockConditions.minMasteryLevel && (
                          <div>掌握: ≥{tool.unlockConditions.minMasteryLevel}%</div>
                        )}
                        {tool.unlockConditions.minPracticeCount && (
                          <div>练习: ≥{tool.unlockConditions.minPracticeCount}次</div>
                        )}
                        {tool.unlockConditions.minWritingStreak && (
                          <div>连续: ≥{tool.unlockConditions.minWritingStreak}天</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                {isUnlocked ? (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 hover:from-morandi-blue-600 hover:to-morandi-green-700 text-white shadow-md hover:shadow-lg"
                  >
                    <Link href={`/tools/${tool.id}`}>
                      {level?.completed ? '再次学习' : '开始学习'}
                      <Play className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : canUnlock ? (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-morandi-yellow-500 to-morandi-orange-600 hover:from-morandi-yellow-600 hover:to-morandi-orange-700 text-white shadow-md hover:shadow-lg"
                  >
                    <Link href={`/tools/${tool.id}`}>
                      可以解锁
                      <Lock className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-morandi-gray-200 text-morandi-gray-400 cursor-not-allowed"
                  >
                    未解锁
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 高级工具集入口 */}
      <Card className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-morandi-purple-500 to-morandi-indigo-600 border-0 text-white shadow-card hover:shadow-card-hover transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">高级思维工具集</h3>
                <p className="text-purple-100">作文思维方法 - 从套路到灵活运用</p>
              </div>
            </div>
            <Button
              asChild
              className="bg-white text-morandi-purple-600 font-bold hover:bg-morandi-purple-50 whitespace-nowrap"
            >
              <Link href="/tools/advanced-tools">
                解锁高级工具
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-center gap-4 py-8 flex-wrap">
        <Button
          asChild
          variant="ghost"
          className="text-morandi-gray-600 hover:text-morandi-blue-600 hover:bg-morandi-blue-50 h-auto py-3 px-4"
        >
          <Link href="/write" className="flex items-center gap-2">
            <div className="p-2 bg-morandi-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-morandi-blue-600" />
            </div>
            <span className="font-medium">写作练习</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className="text-morandi-gray-600 hover:text-morandi-purple-600 hover:bg-morandi-purple-50 h-auto py-3 px-4"
        >
          <Link href="/essays" className="flex items-center gap-2">
            <div className="p-2 bg-morandi-purple-100 rounded-lg">
              <Library className="w-5 h-5 text-morandi-purple-600" />
            </div>
            <span className="font-medium">我的作文</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className="text-morandi-gray-600 hover:text-morandi-green-600 hover:bg-morandi-green-50 h-auto py-3 px-4"
        >
          <Link href="/settings" className="flex items-center gap-2">
            <div className="p-2 bg-morandi-green-100 rounded-lg">
              <Settings className="w-5 h-5 text-morandi-green-600" />
            </div>
            <span className="font-medium">设置</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}