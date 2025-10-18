// 理解测试
export interface ComprehensionTest {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

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
  // 新增理解测试
  comprehensionTest?: ComprehensionTest;
}

// 关卡进度
export interface LevelProgress {
  toolId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  exercisesCompleted: number;
  // 新增测试通过状态
  testPassed?: boolean;
}

// 每日挑战
export interface DailyChallenge {
  date: Date;
  task: string;
  completed: boolean;
  streak: number; // 连续天数
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

// 习惯追踪
export interface HabitTracker {
  writingStreak: number;
  weeklyGoal: number;
  achievements: Achievement[];
}

// 学生进度
export interface StudentProgress {
  currentLevel: number;
  levels: LevelProgress[];
  totalScore: number;
  unlockedTools: string[];
  // 新增习惯追踪
  dailyChallenge?: DailyChallenge;
  habitTracker?: HabitTracker;
}

// AI 配置
export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  models?: string[]; // 可用模型列表
}

// 行动项
export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
}

// 作文版本
export interface EssayVersion {
  id: string;
  content: string;
  feedback?: string;
  createdAt: Date;
  // 新增行动项
  actionItems?: ActionItem[];
}

// 作文数据
export interface Essay {
  id: string;
  title: string;
  content: string;
  toolUsed: string;
  createdAt: Date;
  feedback?: string;
  versions?: EssayVersion[]; // 历史版本
  // 新增行动项
  actionItems?: ActionItem[];
}