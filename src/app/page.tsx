'use client';

import { useState, useEffect } from 'react';
import { writingTools } from '@/data/tools';
import { useAppStore } from '@/lib/store';
import { canUnlockTool } from '@/lib/store'; // 导入解锁条件检查函数
import { Trophy, BookOpen, Settings, Play, Sparkles, Library, Star, Lock } from 'lucide-react';
import Link from 'next/link';
import DailyChallengeCard from '@/components/DailyChallenge';
import AchievementCard from '@/components/AchievementCard';

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

      {/* 基本工具卡片网格 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {writingTools.filter(tool => {
          // 只显示基本工具（tool-0到tool-6）和自由写作工具
          const toolNumber = tool.id.startsWith('tool-') ? parseInt(tool.id.split('-')[1]) : -1;
          return tool.id === 'free-writing' || (toolNumber >= 0 && toolNumber <= 6);
        }).map((tool, index) => {
          const level = progress.levels.find(l => l.toolId === tool.id);
          // 自由写作工具始终是已解锁的
          const isUnlocked = tool.id === 'free-writing' || progress.unlockedTools.includes(tool.id);
          // 检查是否可以解锁（但尚未解锁）
          const canUnlock = tool.id !== 'free-writing' && !isUnlocked && canUnlockTool(tool.id, progress, writingTools);

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

                {/* 解锁条件简要显示 */}
                {!isUnlocked && tool.id !== 'free-writing' && tool.unlockConditions && (
                  <div className="text-xs bg-morandi-purple-50 border border-morandi-purple-200 rounded-lg p-2">
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
                  </div>
                )}
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
                ) : canUnlock ? (
                  <Link
                    href={`/tools/${tool.id}`}
                    className="w-full bg-gradient-to-r from-morandi-yellow-500 to-morandi-orange-600 hover:from-morandi-yellow-600 hover:to-morandi-orange-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    可以解锁
                    <Lock className="w-4 h-4" />
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

      {/* 高级工具集入口 */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-morandi-purple-500 to-morandi-indigo-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">高级思维工具集</h3>
              <p className="text-purple-100">作文模式网络 - 从模板到动态模式组合</p>
            </div>
          </div>
          <Link
            href="/tools/advanced-tools"
            className="bg-white text-morandi-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-morandi-purple-50 transition-colors whitespace-nowrap"
          >
            解锁高级工具
          </Link>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="max-w-4xl mx-auto flex justify-center gap-8 py-8 flex-wrap gap-y-4">
        <Link
          href="/write"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50 whitespace-nowrap"
        >
          <div className="p-2 bg-morandi-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-morandi-blue-600" />
          </div>
          <span className="font-medium">写作练习</span>
        </Link>

        <Link
          href="/essays"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50 whitespace-nowrap"
        >
          <div className="p-2 bg-morandi-purple-100 rounded-lg">
            <Library className="w-5 h-5 text-morandi-purple-600" />
          </div>
          <span className="font-medium">我的作文</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-3 rounded-xl hover:bg-morandi-blue-50 whitespace-nowrap"
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