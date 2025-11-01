'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, Target, GitBranch, Zap, Brain, ChevronRight, FileText } from 'lucide-react';
import { writingTools } from '@/data/tools';

interface WritingToolGuideProps {
  toolId: string;
}

const WritingToolGuide = ({ toolId }: WritingToolGuideProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // 获取工具数据
  const tool = writingTools.find(t => t.id === toolId);

  // 如果没有找到工具或者工具没有指导内容，不显示组件
  if (!tool || !tool.guidance) {
    return null;
  }

  const guidance = tool.guidance;

  // 根据指导内容生成章节
  const sections = [];

  // 添加核心概念章节
  if (guidance.coreConcepts && guidance.coreConcepts.length > 0) {
    sections.push({
      id: 'coreConcepts',
      title: '核心概念',
      icon: <Target className="w-5 h-5 text-morandi-blue-600" />,
      color: 'blue',
      content: (
        <div className="space-y-3">
          {guidance.coreConcepts.map((concept, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <span className="text-morandi-blue-700">{concept}</span>
            </div>
          ))}
        </div>
      )
    });
  }

  // 添加技巧章节
  if (guidance.techniques && guidance.techniques.length > 0) {
    sections.push({
      id: 'techniques',
      title: '写作技巧',
      icon: <Zap className="w-5 h-5 text-morandi-green-600" />,
      color: 'green',
      content: (
        <ul className="space-y-3">
          {guidance.techniques.map((technique, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="mt-1 text-morandi-green-500">✨</div>
              <div>
                <span className="font-medium text-morandi-green-800">{technique.name}：</span>
                <span className="text-morandi-green-700">{technique.description}</span>
                {technique.examples && technique.examples.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {technique.examples.map((example, exIndex) => (
                      <div key={exIndex} className="text-sm text-morandi-green-600 bg-morandi-green-50 px-3 py-2 rounded-lg">
                        {example}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )
    });
  }

  // 添加练习阶段章节
  if (guidance.practiceStages && guidance.practiceStages.length > 0) {
    sections.push({
      id: 'practiceStages',
      title: '练习阶段',
      icon: <FileText className="w-5 h-5 text-morandi-purple-600" />,
      color: 'purple',
      content: (
        <div className="space-y-4">
          {guidance.practiceStages.map((stage, index) => (
            <div key={index} className="space-y-2">
              <span className="font-medium text-morandi-purple-800">{stage.stage}：</span>
              <ul className="list-disc list-inside text-morandi-purple-700 space-y-1">
                {stage.tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    });
  }

  // 添加自查清单章节
  if (guidance.selfCheck && guidance.selfCheck.length > 0) {
    sections.push({
      id: 'selfCheck',
      title: '自查清单',
      icon: <Brain className="w-5 h-5 text-morandi-indigo-600" />,
      color: 'indigo',
      content: (
        <div className="space-y-3">
          {guidance.selfCheck.map((check, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-1 text-morandi-indigo-500">🔍</div>
              <span className="text-morandi-indigo-700">{check}</span>
            </div>
          ))}
        </div>
      )
    });
  }

  const advancedTips = tool.tips || '技巧是忠实的仆人，真诚才是文字的王。灵活运用这些方法，写出属于你的独特文字。';

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
        {tool.title || tool.name}指南
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