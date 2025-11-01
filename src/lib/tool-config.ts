// 顶层工具配置
export const topLevelToolsConfig = [
  {
    id: 'tool-59',
    name: '作文步骤',
    icon: 'FileText',
    description: '终极写作指南：让技巧为你的心声服务',
    subTools: ['tool-1', 'tool-4', 'tool-6', 'tool-51', 'tool-52', 'tool-53', 'tool-54', 'tool-55', 'tool-56', 'tool-57', 'tool-58']
  },
  {
    id: 'tool-40',
    name: '思路整理法',
    icon: 'Brain',
    description: '帮你把脑子里乱糟糟的想法，整理成别人能看懂的文章',
    subTools: [
      'tool-7', 'tool-8', 'tool-21'
    ]
  },
  {
    id: 'tool-41',
    name: '框架搭建法',
    icon: 'Building',
    description: '教你如何搭建文章骨架，让观点清楚表达',
    subTools: [
      'tool-9', 'tool-10', 'tool-22', 'tool-23', 'tool-24', 'tool-25', 'tool-58' // 添加一波三折
    ]
  },
  {
    id: 'tool-42',
    name: '表达美化技能',
    icon: 'MessageSquare',
    description: '让你的文字更有感染力，打动读者',
    subTools: [
      'tool-11', 'tool-12', 'tool-13', 'tool-14', 'tool-29', 'tool-51', 'tool-52', 'tool-53', 'tool-54', 'tool-55', 'tool-56', 'tool-57' // 添加所有专项工具
    ]
  },
  {
    id: 'tool-43',
    name: '深度思考能力',
    icon: 'Target',
    description: '帮你深入思考问题本质，写出独特见解',
    subTools: [
      'tool-15', 'tool-26', 'tool-27', 'tool-5', 'tool-20', 'tool-28', 'tool-58' // 添加一波三折
    ]
  },
  {
    id: 'tool-44',
    name: '文章润色技能',
    icon: 'Sparkles',
    description: '让你的文章更有质感，读起来更舒服',
    subTools: [
      'tool-32', 'tool-30', 'tool-31', 'tool-33', 'tool-34', 'tool-35', 'tool-36', 'tool-37', 'tool-38', 'tool-39'
    ]
  },
  {
    id: 'tool-45',
    name: '方法组合工具',
    icon: 'Puzzle',
    description: '建立你的方法百宝箱，积累常用的思考方法',
    subTools: []
  },
  {
    id: 'tool-46',
    name: '最后检查工具',
    icon: 'CheckCircle',
    description: '考场上7分钟的把关，快速检查文章质量',
    subTools: []
  }
];

// 顶层工具ID列表（用于导航逻辑）
export const topLevelToolIds = topLevelToolsConfig.map(tool => tool.id);

// 子工具到顶层工具的映射
export const subToolToParentMap: Record<string, string> = {};

// 构建子工具到顶层工具的映射
topLevelToolsConfig.forEach(tool => {
  tool.subTools.forEach(subToolId => {
    subToolToParentMap[subToolId] = tool.id;
  });
});

// 复用的子工具列表
export const sharedSubTools = ['tool-1', 'tool-4', 'tool-5', 'tool-6', 'tool-15', 'tool-51', 'tool-54', 'tool-58'];