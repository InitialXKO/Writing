import { WritingTool } from '@/types';

export const writingTools: WritingTool[] = [
  {
    id: 'tool-0',
    name: '观察者之眼',
    title: '发现别人没看见的细节',
    description: '学会用心观察，找到生活中被忽略的精彩细节',
    mantra: '素材源于五分钟的凝视',
    tips: '选择一个场景（如课桌、教室窗台、排队的第一/最后一个路人），写下3个你之前没注意到的细节',
    suitableFor: '观察类、场景描写',
    caution: '不要走马观花，要真正静下心来观察',
    examples: [
      {
        bad: '教室里很热闹',
        good: '同桌的铅笔盒里，橡皮被咬得坑坑洼洼，数学书的边角已经卷起，却用透明胶带仔细地粘好了'
      }
    ],
    exercises: [
      '观察你的文具盒，写出3个之前没注意到的细节',
      '描述教室窗台上的植物，注意叶子的形状和颜色变化',
      '写一段放学路上的观察，聚焦在平时忽略的细节'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"观察者之眼"技巧？',
      options: [
        '教室里很热闹',
        '同桌的铅笔盒里，橡皮被咬得坑坑洼洼，数学书的边角已经卷起，却用透明胶带仔细地粘好了'
      ],
      correctAnswer: 1,
      explanation: '第二句通过仔细观察，发现了同桌文具盒里的具体细节，体现了"观察者之眼"的技巧'
    },
    // 第一个工具无解锁条件
    unlockConditions: {}
  },
  {
    id: 'tool-1',
    name: '具体化',
    title: '拒绝空话，写出具体动作',
    description: '用具体的动作和细节代替抽象的形容词',
    mantra: '不说"很"，写动作',
    tips: '把"很高兴"变成具体的动作描写',
    suitableFor: '人物、事件、场景描写',
    caution: '别每句都用，会很累',
    examples: [
      {
        bad: '他很高兴',
        good: '他猛地从座位上弹起来，把试卷高高举过头顶，像一面胜利的旗帜'
      }
    ],
    exercises: [
      '把"她很伤心"改写成具体动作',
      '描述一个紧张的时刻，不要用"紧张"这个词',
      '写一段开心的场景，全用动作表现'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"具体化"技巧？',
      options: [
        '他很高兴',
        '他猛地从座位上弹起来，把试卷高高举过头顶，像一面胜利的旗帜'
      ],
      correctAnswer: 1,
      explanation: '第二句用具体动作（弹起来、举过头顶）代替了抽象形容词（很高兴），体现了"具体化"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0'], // 需要先掌握观察者之眼
      minMasteryLevel: 60, // 观察者之眼掌握程度至少60%
      minPracticeCount: 2 // 至少完成2次练习
    }
  },
  {
    id: 'tool-2',
    name: '慢镜头',
    title: '关键时刻放大描写',
    description: '在最重要的瞬间，把1秒钟的动作放大成一段话',
    mantra: '高潮必放慢',
    tips: '加上内心想法和环境细节',
    suitableFor: '高潮、关键动作',
    caution: '全文最多用两次，别拖沓',
    examples: [
      {
        bad: '我接过了接力棒',
        good: '我颤抖着伸手，指尖刚碰到冰凉的接力棒——就是现在！——我猛地握紧，感觉全身的血液都冲向了双腿，像离弦的箭一样冲了出去'
      }
    ],
    exercises: [
      '描写接水的瞬间，放慢到3句话',
      '写一段上台前的紧张时刻',
      '描述一个重要的决定时刻'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"慢镜头"技巧？',
      options: [
        '我接过了接力棒',
        '我颤抖着伸手，指尖刚碰到冰凉的接力棒——就是现在！——我猛地握紧，感觉全身的血液都冲向了双腿，像离弦的箭一样冲了出去'
      ],
      correctAnswer: 1,
      explanation: '第二句将一个瞬间的动作（接过接力棒）放大成一段详细描写，体现了"慢镜头"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0', 'tool-1'], // 需要先掌握观察者之眼和具体化
      minMasteryLevel: 70, // 前两个工具掌握程度至少70%
      minPracticeCount: 3, // 至少完成3次练习
      minWritingStreak: 3 // 连续写作至少3天
    }
  },
  {
    id: 'tool-3',
    name: '五感法',
    title: '让读者身临其境',
    description: '用眼(形色)、耳(声音)、鼻(气味)、舌(味道)、身(触感)描写',
    mantra: '五感齐用，身临其境',
    tips: '至少使用3种感官描写',
    suitableFor: '场景、环境、氛围营造',
    caution: '要自然融合，不要生硬罗列',
    examples: [
      {
        bad: '教室里很安静',
        good: '午后的阳光透过窗帘缝隙，在桌面投下斑驳的光影（视觉）。只有笔尖划过纸张的沙沙声（听觉），偶尔传来远处操场的哨声（听觉）。空气中飘着淡淡的粉笔灰味道（嗅觉）'
      }
    ],
    exercises: [
      '描写下雨的教室，用3种感官',
      '写一段食堂午饭时的场景',
      '描述一个让你印象深刻的节日'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"五感法"技巧？',
      options: [
        '教室里很安静',
        '午后的阳光透过窗帘缝隙，在桌面投下斑驳的光影（视觉）。只有笔尖划过纸张的沙沙声（听觉），偶尔传来远处操场的哨声（听觉）。空气中飘着淡淡的粉笔灰味道（嗅觉）'
      ],
      correctAnswer: 1,
      explanation: '第二句运用了视觉、听觉、嗅觉三种感官描写，体现了"五感法"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0', 'tool-1', 'tool-2'], // 需要先掌握前三个工具
      minMasteryLevel: 75, // 前三个工具掌握程度至少75%
      minPracticeCount: 4, // 至少完成4次练习
      minWritingStreak: 5 // 连续写作至少5天
    }
  },
  {
    id: 'tool-4',
    name: '对比法',
    title: '通过对比突出特点',
    description: '用对比手法让人物或事物特点更鲜明',
    mantra: '有对比，才有张力',
    tips: '可以对比现在与过去、人物之间、理想与现实',
    suitableFor: '人物刻画、主题深化',
    caution: '对比要合理，不要夸张',
    examples: [
      {
        bad: '他很认真',
        good: '当别人在追逐打闹时，他正埋头计算着复杂的数学题；当大家在讨论最新的游戏时，他却在思考那道困扰了他三天的物理难题'
      }
    ],
    exercises: [
      '用对比手法描写两个性格不同的同学',
      '写一段现在与过去的对比',
      '描写理想中的课堂与现实课堂的对比'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"对比法"技巧？',
      options: [
        '他很认真',
        '当别人在追逐打闹时，他正埋头计算着复杂的数学题；当大家在讨论最新的游戏时，他却在思考那道困扰了他三天的物理难题'
      ],
      correctAnswer: 1,
      explanation: '第二句通过对比"别人"和"他"的行为，突出了他的认真特点，体现了"对比法"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0', 'tool-1', 'tool-2', 'tool-3'], // 需要先掌握前四个工具
      minMasteryLevel: 80, // 前四个工具掌握程度至少80%
      minPracticeCount: 5, // 至少完成5次练习
      minWritingStreak: 7 // 连续写作至少7天
    }
  },
  {
    id: 'tool-5',
    name: '深度挖掘',
    title: '从事情表面看到深层意义',
    description: '通过提问挖掘事件的深层意义',
    mantra: '深度是"没想到"',
    tips: '问自己：这件事让我对什么有了新的认识？',
    suitableFor: '结尾升华、主题深化',
    caution: '别写成"我懂得了..."的大道理',
    examples: [
      {
        bad: '我懂得了友谊的珍贵',
        good: '原来，真正的友谊不是形影不离，而是在你需要时，有人愿意为你停留五分钟'
      }
    ],
    exercises: [
      '写一段关于失败的感悟',
      '描述一次让你成长的经历',
      '写一段关于离别的思考'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"深度挖掘"技巧？',
      options: [
        '我懂得了友谊的珍贵',
        '原来，真正的友谊不是形影不离，而是在你需要时，有人愿意为你停留五分钟'
      ],
      correctAnswer: 1,
      explanation: '第二句从表面现象挖掘出深层意义，体现了"深度挖掘"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0', 'tool-1', 'tool-2', 'tool-3', 'tool-4'], // 需要先掌握前五个工具
      minMasteryLevel: 85, // 前五个工具掌握程度至少85%
      minPracticeCount: 6, // 至少完成6次练习
      minWritingStreak: 10 // 连续写作至少10天
    }
  },
  {
    id: 'tool-6',
    name: '节奏感',
    title: '用长短句变化制造音乐感',
    description: '短句造紧张，长句造舒缓',
    mantra: '长短配，有呼吸',
    tips: '自然变化，不要刻意',
    suitableFor: '全文节奏调节',
    caution: '自然就好，别为了长短而刻意',
    examples: [
      {
        bad: '我很紧张。我走上台。我开始讲话。',
        good: '我紧张极了。深吸一口气，迈开沉重的步伐走上台，在全场目光的注视下——开始！'
      }
    ],
    exercises: [
      '写一段紧张的场景，注意句式变化',
      '描述一个平静的时刻，用舒缓的节奏',
      '练习使用破折号和感叹号'
    ],
    comprehensionTest: {
      question: '以下哪句运用了"节奏感"技巧？',
      options: [
        '我很紧张。我走上台。我开始讲话。',
        '我紧张极了。深吸一口气，迈开沉重的步伐走上台，在全场目光的注视下——开始！'
      ],
      correctAnswer: 1,
      explanation: '第二句通过长短句的变化制造了节奏感，体现了"节奏感"技巧'
    },
    unlockConditions: {
      prerequisiteTools: ['tool-0', 'tool-1', 'tool-2', 'tool-3', 'tool-4', 'tool-5'], // 需要先掌握前六个工具
      minMasteryLevel: 90, // 前六个工具掌握程度至少90%
      minPracticeCount: 7, // 至少完成7次练习
      minWritingStreak: 14 // 连续写作至少14天
    }
  },
  {
    id: 'free-writing',
    name: '自由写作',
    title: '诚实的记录者',
    description: '写作不是为了当一个"好学生"，而是为了当一个"诚实的记录者"。你的生活，你的感受，你的视角本身就价值连城',
    mantra: '写作不是为了当一个"好学生"\n而是为了当一个"诚实的记录者"',
    tips: '你的生活，你的感受，你的视角本身就价值连城',
    suitableFor: '任何写作场景',
    caution: '不要担心写得好不好，重要的是开始写',
    examples: [
      {
        bad: '不要担心写得好不好，重要的是开始写',
        good: '写作，是生命本身的呼吸。它没有规则，唯一的裁判是你的内心。它是你与世界对话的方式，是你整理思想的工具，是你抵抗遗忘的武器。\n\n现在，请从这里开始：\n\n去写吧。就从那个让你心弦一颤的瞬间开始写起。写下你的困惑、你的骄傲、你的尴尬与你的热爱。因为这个世界，只有一个你。你的故事，值得被永恒地记录。'
      }
    ],
    exercises: [
      '写下今天让你印象最深刻的一个瞬间',
      '描述一个让你感到困惑的事情',
      '记录一个你最近的梦境'
    ],
    comprehensionTest: {
      question: '自由写作的核心理念是什么？',
      options: [
        '写作是为了得到好成绩',
        '写作是为了当一个"诚实的记录者"',
        '写作必须遵循严格的规则'
      ],
      correctAnswer: 1,
      explanation: '自由写作的核心理念是当一个"诚实的记录者"，记录自己的生活、感受和视角。'
    },
    // 自由写作无解锁条件，始终可用
    unlockConditions: {}
  }
];