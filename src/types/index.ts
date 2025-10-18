// 写作工具类型定义
export interface WritingTool {
  id: string;
  name: string;
  title: string;
  description: string;
  mantra: string; // 口诀
  tips: string;
  suitableFor: string;
  caution: string;
  examples: {
    bad: string;
    good: string;
  }[];
  exercises: string[];
}

// 关卡进度
export interface LevelProgress {
  toolId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  exercisesCompleted: number;
}

// 学生进度
export interface StudentProgress {
  currentLevel: number;
  levels: LevelProgress[];
  totalScore: number;
  unlockedTools: string[];
}

// AI 配置
export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

// 作文数据
export interface Essay {
  id: string;
  title: string;
  content: string;
  toolUsed: string;
  createdAt: Date;
  feedback?: string;
}