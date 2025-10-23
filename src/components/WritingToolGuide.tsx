'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, Target, GitBranch, Zap, Brain, ChevronRight, FileText, Copy } from 'lucide-react';

interface WritingToolGuideProps {
  toolId: string;
}

const WritingToolGuide = ({ toolId }: WritingToolGuideProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // 根据不同工具ID显示不同的指南内容
  const getGuideContent = () => {
    switch (toolId) {
      case 'tool-7': // 思辨写作
        return {
          title: '思辨写作进阶指南',
          sections: [
            {
              id: 'thinkingMethod',
              title: '思辨思维法',
              icon: <Brain className="w-5 h-5 text-morandi-blue-600" />,
              color: 'blue',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <span className="font-medium text-morandi-blue-800">识别冲突：</span>
                      <span className="text-morandi-blue-700">找到问题中的核心矛盾点</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <span className="font-medium text-morandi-blue-800">分析假设：</span>
                      <span className="text-morandi-blue-700">探究背后的思维模式和假设</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <span className="font-medium text-morandi-blue-800">突破局限：</span>
                      <span className="text-morandi-blue-700">找到更高维度的解决方案</span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'avoidTraps',
              title: '避免思维陷阱',
              icon: <AlertTriangle className="w-5 h-5 text-morandi-pink-600" />,
              color: 'pink',
              content: (
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-morandi-pink-500">🚫</div>
                    <div>
                      <span className="font-medium text-morandi-pink-800">人云亦云：</span>
                      <span className="text-morandi-pink-700">缺乏独立思考，重复他人观点</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-morandi-pink-500">🚫</div>
                    <div>
                      <span className="font-medium text-morandi-pink-800">二元对立：</span>
                      <span className="text-morandi-pink-700">非黑即白的简单化思维</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 text-morandi-pink-500">🚫</div>
                    <div>
                      <span className="font-medium text-morandi-pink-800">空谈理论：</span>
                      <span className="text-morandi-pink-700">脱离实际，缺乏具体分析</span>
                    </div>
                  </li>
                </ul>
              )
            }
          ],
          advancedTips: '模式让你在约束中游刃有余；思考让你在创造中独一无二。用理解文学的思路理解科学，用分析历史的眼光分析当下。'
        };

      case 'tool-8': // 三问思维法
        return {
          title: '三问思维法指南',
          sections: [
            {
              id: 'threeQuestions',
              title: '三问思维流程',
              icon: <Target className="w-5 h-5 text-morandi-green-600" />,
              color: 'green',
              content: (
                <ol className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <span className="font-medium text-morandi-green-800">冲突识别：</span>
                      <span className="text-morandi-green-700">找到问题的核心矛盾</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <span className="font-medium text-morandi-green-800">假设分析：</span>
                      <span className="text-morandi-green-700">探究思维定势和偏见</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <span className="font-medium text-morandi-green-800">破局思考：</span>
                      <span className="text-morandi-green-700">寻找创新解决方案</span>
                    </div>
                  </li>
                </ol>
              )
            }
          ],
          advancedTips: '三问思维法让你跳出常规思维，从多个角度审视问题，找到更深层的理解。'
        };

      case 'tool-9': // 宏观结构模式
        return {
          title: '结构设计指南',
          sections: [
            {
              id: 'structurePatterns',
              title: '结构模式选择',
              icon: <GitBranch className="w-5 h-5 text-morandi-purple-600" />,
              color: 'purple',
              content: (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-morandi-purple-800">总分总结构：</span>
                    <span className="text-morandi-purple-700">开篇点题 → 分点论述 → 总结升华</span>
                  </div>
                  <div>
                    <span className="font-medium text-morandi-purple-800">对比结构：</span>
                    <span className="text-morandi-purple-700">正反对比 → 利弊分析 → 得出结论</span>
                  </div>
                  <div>
                    <span className="font-medium text-morandi-purple-800">递进结构：</span>
                    <span className="text-morandi-purple-700">现象 → 原因 → 影响 → 对策</span>
                  </div>
                </div>
              )
            }
          ],
          advancedTips: '结构是文章的骨架，好的结构能让观点清晰、逻辑严密。'
        };

      case 'tool-10': // 段落发展模式
        return {
          title: '段落发展指南',
          sections: [
            {
              id: 'paragraphDevelopment',
              title: '段落构建方法',
              icon: <FileText className="w-5 h-5 text-morandi-indigo-600" />,
              color: 'indigo',
              content: (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-morandi-indigo-800">点题开头：</span>
                    <span className="text-morandi-indigo-700">明确段落主旨，开门见山</span>
                  </div>
                  <div>
                    <span className="font-medium text-morandi-indigo-800">分层论述：</span>
                    <span className="text-morandi-indigo-700">多角度、多层面展开论述</span>
                  </div>
                  <div>
                    <span className="font-medium text-morandi-indigo-800">例证支撑：</span>
                    <span className="text-morandi-indigo-700">用具体事例佐证观点</span>
                  </div>
                  <div>
                    <span className="font-medium text-morandi-indigo-800">回扣主题：</span>
                    <span className="text-morandi-indigo-700">段落结尾呼应开头，强化中心</span>
                  </div>
                </div>
              )
            }
          ],
          advancedTips: '好的段落要主题明确、层次分明、论证充分、首尾呼应。'
        };

      default:
        return {
          title: '写作工具指南',
          sections: [],
          advancedTips: '每个写作工具都有其独特的价值，关键在于灵活运用、融会贯通。'
        };
    }
  };

  const { title, sections, advancedTips } = getGuideContent();

  if (sections.length === 0) {
    return null; // 如果没有对应的指南内容，不显示组件
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-morandi-blue-50',
        border: 'border-morandi-blue-100',
        iconBg: 'bg-morandi-blue-100',
        text: 'text-morandi-blue-600'
      },
      pink: {
        bg: 'bg-morandi-pink-50',
        border: 'border-morandi-pink-100',
        iconBg: 'bg-morandi-pink-100',
        text: 'text-morandi-pink-600'
      },
      green: {
        bg: 'bg-morandi-green-50',
        border: 'border-morandi-green-100',
        iconBg: 'bg-morandi-green-100',
        text: 'text-morandi-green-600'
      },
      purple: {
        bg: 'bg-morandi-purple-50',
        border: 'border-morandi-purple-100',
        iconBg: 'bg-morandi-purple-100',
        text: 'text-morandi-purple-600'
      },
      indigo: {
        bg: 'bg-morandi-indigo-50',
        border: 'border-morandi-indigo-100',
        iconBg: 'bg-morandi-indigo-100',
        text: 'text-morandi-indigo-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-gradient-to-br from-morandi-purple-50 to-morandi-indigo-50 rounded-2xl p-6 border border-morandi-purple-200">
      <h3 className="text-2xl font-bold text-morandi-purple-800 mb-6 flex items-center gap-2">
        <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
          <Lightbulb className="w-6 h-6 text-morandi-purple-700" />
        </div>
        {title}
      </h3>

      <div className="space-y-4">
        {sections.map((section) => {
          const colorClasses = getColorClasses(section.color);
          return (
            <div key={section.id} className="bg-white rounded-xl border border-morandi-purple-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-morandi-purple-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${colorClasses.iconBg} rounded-lg`}>
                    {section.icon}
                  </div>
                  <span className="font-bold text-morandi-gray-800">{section.title}</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-morandi-gray-500 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
              </button>
              {activeSection === section.id && (
                <div className={`p-4 ${colorClasses.bg} border-t ${colorClasses.border}`}>
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {advancedTips && (
        <div className="mt-6 p-4 bg-morandi-purple-500/10 rounded-xl border border-morandi-purple-200">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Lightbulb className="w-5 h-5 text-morandi-purple-600" />
            </div>
            <div>
              <p className="text-morandi-purple-800 font-medium">高阶提示</p>
              <p className="text-morandi-purple-700 text-sm">{advancedTips}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingToolGuide;