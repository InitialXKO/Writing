import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudentProgress, AIConfig, Essay, EssayVersion, ActionItem, DailyChallenge, HabitTracker, WritingTool, LevelProgress, Achievement } from '@/types';
import { writingTools } from '@/data/tools';

interface AppState {
  // 学生进度
  progress: StudentProgress;
  setProgress: (progress: StudentProgress) => void;
  completeLevel: (toolId: string, score: number) => void;
  unlockNextLevel: () => void;
  // 新增测试通过方法
  passTest: (toolId: string) => void;

  // AI 配置
  aiConfig: AIConfig | null;
  setAIConfig: (config: AIConfig) => void;
  setAvailableModels: (models: string[]) => void; // 设置可用模型列表

  // 作文管理
  essays: Essay[];
  addEssay: (essay: Omit<Essay, 'id' | 'createdAt'>) => void;
  updateEssay: (id: string, updates: Partial<Essay>) => void;
  deleteEssay: (id: string) => void;
  addEssayVersion: (essayId: string, content: string, feedback?: string, actionItems?: ActionItem[]) => void; // 添加作文版本
  // 新增行动项更新方法
  updateActionItem: (essayId: string, versionId: string | null, actionItemId: string, completed: boolean) => void;

  // 习惯追踪
  setDailyChallenge: (challenge: DailyChallenge) => void;
  updateHabitTracker: (tracker: Partial<HabitTracker>) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => void;

  // 工具掌握程度
  updateToolMastery: (toolId: string, masteryLevel: number) => void;

  // 重置进度
  resetProgress: () => void;
}

// 检查工具是否可以解锁的辅助函数
export const canUnlockTool = (toolId: string, progress: StudentProgress, tools: WritingTool[]): boolean => {
  // 自由写作始终可用
  if (toolId === 'free-writing') return true;

  const tool = tools.find(t => t.id === toolId);
  if (!tool || !tool.unlockConditions) return true;

  const conditions = tool.unlockConditions;

  // 检查前置工具要求
  if (conditions.prerequisiteTools) {
    for (const prereqId of conditions.prerequisiteTools) {
      const prereqLevel = progress.levels.find(l => l.toolId === prereqId);
      if (!prereqLevel || !prereqLevel.testPassed) {
        return false;
      }
    }
  }

  // 检查掌握程度要求
  if (conditions.minMasteryLevel && conditions.prerequisiteTools) {
    const prereqLevels = conditions.prerequisiteTools.map(id =>
      progress.levels.find(l => l.toolId === id)
    ).filter(Boolean) as LevelProgress[];

    if (prereqLevels.length > 0) {
      const avgMastery = prereqLevels.reduce((sum, level) =>
        sum + (level.masteryLevel || 0), 0) / prereqLevels.length;
      if (avgMastery < conditions.minMasteryLevel) {
        return false;
      }
    }
  }

  // 检查练习次数要求
  if (conditions.minPracticeCount && conditions.prerequisiteTools) {
    const prereqLevels = conditions.prerequisiteTools.map(id =>
      progress.levels.find(l => l.toolId === id)
    ).filter(Boolean) as LevelProgress[];

    if (prereqLevels.length > 0) {
      const totalPractices = prereqLevels.reduce((sum, level) =>
        sum + (level.practiceCount || 0), 0);
      if (totalPractices < conditions.minPracticeCount) {
        return false;
      }
    }
  }

  // 检查连续写作天数要求
  if (conditions.minWritingStreak) {
    if ((progress.habitTracker?.writingStreak || 0) < conditions.minWritingStreak) {
      return false;
    }
  }

  return true;
};

// 生成行动项的辅助函数
export const generateActionItems = (feedback: string): ActionItem[] => {
  // 简单的行动项生成逻辑，实际应用中可以更复杂
  const items: ActionItem[] = [];

  // 检查反馈中是否提到了具体的修改建议
  if (feedback.includes("具体动作")) {
    items.push({
      id: `action-${Date.now()}-1`,
      task: "将抽象形容词改为具体动作描写",
      completed: false
    });
  }

  if (feedback.includes("慢镜头")) {
    items.push({
      id: `action-${Date.now()}-2`,
      task: "在关键场景添加慢镜头描写",
      completed: false
    });
  }

  if (feedback.includes("五感")) {
    items.push({
      id: `action-${Date.now()}-3`,
      task: "添加三种感官描写",
      completed: false
    });
  }

  if (feedback.includes("对比")) {
    items.push({
      id: `action-${Date.now()}-4`,
      task: "使用对比手法突出特点",
      completed: false
    });
  }

  // 如果没有特定的建议，添加通用的行动项
  if (items.length === 0) {
    items.push({
      id: `action-${Date.now()}-5`,
      task: "根据反馈修改作文中的一个问题",
      completed: false
    });
  }

  return items;
};

const initialState: StudentProgress = {
  currentLevel: 0,
  levels: writingTools.map(tool => ({
    toolId: tool.id,
    completed: false,
    score: 0,
    exercisesCompleted: 0,
    testPassed: false,
    practiceCount: 0, // 初始化练习次数
    masteryLevel: 0, // 初始化掌握程度
  })),
  totalScore: 0,
  unlockedTools: ['tool-0'], // 默认解锁第一个工具
  habitTracker: {
    writingStreak: 0,
    weeklyGoal: 0,
    achievements: []
  },
  dailyChallenge: {
    date: new Date(),
    task: "用'观察者之眼'描写你的文具盒，写出3个之前没注意到的细节",
    completed: false,
    streak: 0
  }
};

const genId = (): string => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : Date.now().toString());

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      progress: initialState,
      aiConfig: null,
      essays: [],

      // 进度管理
      setProgress: (progress) => set({ progress }),

      completeLevel: (toolId: string, score: number) => {
        const { progress } = get();
        const updatedLevels = progress.levels.map(level =>
          level.toolId === toolId
            ? {
                ...level,
                completed: true,
                score: Math.max(level.score || 0, score),
                completedAt: new Date(),
                exercisesCompleted: Math.max(level.exercisesCompleted, 1)
              }
            : level
        );

        const unlockedTools = [...progress.unlockedTools];
        const currentIndex = writingTools.findIndex(tool => tool.id === toolId);

        // 更新当前关卡
        const newCurrentLevel = Math.max(progress.currentLevel, currentIndex + 1);

        // 检查是否可以解锁后续工具
        for (let i = currentIndex + 1; i < writingTools.length; i++) {
          const nextToolId = writingTools[i].id;
          if (!unlockedTools.includes(nextToolId) && canUnlockTool(nextToolId, {...progress, levels: updatedLevels}, writingTools)) {
            unlockedTools.push(nextToolId);
          }
        }

        set({
          progress: {
            ...progress,
            levels: updatedLevels,
            totalScore: updatedLevels.reduce((sum, level) => sum + (level.score || 0), 0),
            unlockedTools,
            currentLevel: newCurrentLevel
          }
        });
      },

      unlockNextLevel: () => {
        const { progress } = get();
        if (progress.currentLevel < writingTools.length - 1) {
          const nextToolId = writingTools[progress.currentLevel + 1].id;
          set({
            progress: {
              ...progress,
              currentLevel: progress.currentLevel + 1,
              unlockedTools: [...progress.unlockedTools, nextToolId]
            }
          });
        }
      },

      // 测试通过
      passTest: (toolId: string) => {
        const { progress } = get();
        const updatedLevels = progress.levels.map(level =>
          level.toolId === toolId
            ? {
                ...level,
                testPassed: true
              }
            : level
        );

        // 检查是否可以解锁后续工具
        const currentIndex = writingTools.findIndex(tool => tool.id === toolId);
        const unlockedTools = [...progress.unlockedTools];

        // 检查是否可以解锁后续工具
        for (let i = currentIndex + 1; i < writingTools.length; i++) {
          const nextToolId = writingTools[i].id;
          if (!unlockedTools.includes(nextToolId) && canUnlockTool(nextToolId, {...progress, levels: updatedLevels}, writingTools)) {
            unlockedTools.push(nextToolId);
          }
        }

        set({
          progress: {
            ...progress,
            levels: updatedLevels,
            unlockedTools
          }
        });
      },

      // AI 配置
      setAIConfig: (config) => set({ aiConfig: config }),
      setAvailableModels: (models) => set((state) => ({
        aiConfig: state.aiConfig ? { ...state.aiConfig, models } : { models, apiKey: '', model: 'gpt-4' }
      })),

      // 作文管理
      addEssay: (essayData) => {
        const essay: Essay = {
          ...essayData,
          id: genId(),
          createdAt: new Date(),
          versions: [] // 初始化版本数组
        };
        set(state => {
          // 增加相关工具的练习次数
          const toolId = essayData.toolUsed;
          const updatedLevels = state.progress.levels.map(level => {
            if (level.toolId === toolId) {
              // 简单的掌握程度更新逻辑：每次练习增加10%，最多到100%
              const newMasteryLevel = Math.min(100, (level.masteryLevel || 0) + 10);
              return {
                ...level,
                practiceCount: (level.practiceCount || 0) + 1,
                masteryLevel: newMasteryLevel
              };
            }
            return level;
          });

          return {
            essays: [...state.essays, essay],
            progress: {
              ...state.progress,
              levels: updatedLevels
            }
          };
        });
      },

      updateEssay: (id, updates) => {
        set(state => ({
          essays: state.essays.map(essay =>
            essay.id === id ? { ...essay, ...updates } : essay
          )
        }));
      },

      deleteEssay: (id) => {
        set(state => ({
          essays: state.essays.filter(essay => essay.id !== id)
        }));
      },

      // 添加新版本到作文
      addEssayVersion: (essayId, content, feedback, actionItems) => {
        set(state => ({
          essays: state.essays.map(essay => {
            if (essay.id === essayId) {
              const newVersion: EssayVersion = {
                id: genId(),
                content,
                feedback,
                createdAt: new Date(),
                actionItems: actionItems || []
              };
              return {
                ...essay,
                versions: [...(essay.versions || []), newVersion]
              };
            }
            return essay;
          })
        }));
      },

      // 更新行动项
      updateActionItem: (essayId, versionId, actionItemId, completed) => {
        set(state => ({
          essays: state.essays.map(essay => {
            if (essay.id === essayId) {
              if (versionId) {
                // 更新版本中的行动项
                return {
                  ...essay,
                  versions: essay.versions?.map(version => {
                    if (version.id === versionId && version.actionItems) {
                      return {
                        ...version,
                        actionItems: version.actionItems.map(item =>
                          item.id === actionItemId ? { ...item, completed } : item
                        )
                      };
                    }
                    return version;
                  })
                };
              } else {
                // 更新作文中的行动项
                if (essay.actionItems) {
                  return {
                    ...essay,
                    actionItems: essay.actionItems.map(item =>
                      item.id === actionItemId ? { ...item, completed } : item
                    )
                  };
                }
              }
            }
            return essay;
          })
        }));
      },

      // 习惯追踪
      setDailyChallenge: (challenge) => {
        set(state => ({
          progress: {
            ...state.progress,
            dailyChallenge: challenge
          }
        }));
      },

      updateHabitTracker: (trackerUpdates) => {
        const { progress } = get();
        set({
          progress: {
            ...progress,
            habitTracker: {
              ...(progress.habitTracker || {
                writingStreak: 0,
                weeklyGoal: 0,
                achievements: []
              }),
              ...trackerUpdates
            }
          }
        });
      },

      addAchievement: (achievement) => {
        const { progress } = get();
        const newAchievement = {
          ...achievement,
          id: genId(),
          earnedAt: new Date()
        };

        set({
          progress: {
            ...progress,
            habitTracker: {
              ...(progress.habitTracker || {
                writingStreak: 0,
                weeklyGoal: 0,
                achievements: []
              }),
              achievements: [
                ...(progress.habitTracker?.achievements || []),
                newAchievement
              ]
            }
          }
        });
      },

      // 更新工具掌握程度
      updateToolMastery: (toolId: string, masteryLevel: number) => {
        const { progress } = get();
        const updatedLevels = progress.levels.map(level =>
          level.toolId === toolId
            ? {
                ...level,
                masteryLevel: Math.min(100, Math.max(0, masteryLevel)) // 限制在0-100之间
              }
            : level
        );

        set({
          progress: {
            ...progress,
            levels: updatedLevels
          }
        });
      },

      // 重置
      resetProgress: () => set({
        progress: initialState,
        essays: []
      }),
    }),
    {
      name: 'writing-companion-storage',
      version: 2, // 更新版本号
      partialize: (state) => ({
        progress: state.progress,
        essays: state.essays,
        aiConfig: state.aiConfig ? { ...state.aiConfig, apiKey: '' } : null,
      }),
    }
  )
);