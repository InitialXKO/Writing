import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudentProgress, AIConfig, Essay, EssayVersion } from '@/types';
import { writingTools } from '@/data/tools';

interface AppState {
  // 学生进度
  progress: StudentProgress;
  setProgress: (progress: StudentProgress) => void;
  completeLevel: (toolId: string, score: number) => void;
  unlockNextLevel: () => void;

  // AI 配置
  aiConfig: AIConfig | null;
  setAIConfig: (config: AIConfig) => void;
  setAvailableModels: (models: string[]) => void; // 设置可用模型列表

  // 作文管理
  essays: Essay[];
  addEssay: (essay: Omit<Essay, 'id' | 'createdAt'>) => void;
  updateEssay: (id: string, updates: Partial<Essay>) => void;
  addEssayVersion: (essayId: string, content: string, feedback?: string) => void; // 添加作文版本

  // 重置进度
  resetProgress: () => void;
}

const initialState: StudentProgress = {
  currentLevel: 0,
  levels: writingTools.map(tool => ({
    toolId: tool.id,
    completed: false,
    score: 0,
    exercisesCompleted: 0,
  })),
  totalScore: 0,
  unlockedTools: ['tool-0'], // 默认解锁第一个工具
};

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
        if (currentIndex < writingTools.length - 1) {
          const nextToolId = writingTools[currentIndex + 1].id;
          if (!unlockedTools.includes(nextToolId)) {
            unlockedTools.push(nextToolId);
          }
        }

        set({
          progress: {
            ...progress,
            levels: updatedLevels,
            totalScore: updatedLevels.reduce((sum, level) => sum + (level.score || 0), 0),
            unlockedTools,
            currentLevel: Math.max(progress.currentLevel, currentIndex + 1)
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

      // AI 配置
      setAIConfig: (config) => set({ aiConfig: config }),
      setAvailableModels: (models) => set((state) => ({
        aiConfig: state.aiConfig ? { ...state.aiConfig, models } : { models, apiKey: '', model: 'gpt-4' }
      })),

      // 作文管理
      addEssay: (essayData) => {
        const essay: Essay = {
          ...essayData,
          id: Date.now().toString(),
          createdAt: new Date(),
          versions: [] // 初始化版本数组
        };
        set(state => ({ essays: [...state.essays, essay] }));
      },

      updateEssay: (id, updates) => {
        set(state => ({
          essays: state.essays.map(essay =>
            essay.id === id ? { ...essay, ...updates } : essay
          )
        }));
      },

      // 添加新版本到作文
      addEssayVersion: (essayId, content, feedback) => {
        set(state => ({
          essays: state.essays.map(essay => {
            if (essay.id === essayId) {
              const newVersion: EssayVersion = {
                id: Date.now().toString(),
                content,
                feedback,
                createdAt: new Date()
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

      // 重置
      resetProgress: () => set({
        progress: initialState,
        essays: []
      }),
    }),
    {
      name: 'writing-companion-storage',
      version: 1,
    }
  )
);