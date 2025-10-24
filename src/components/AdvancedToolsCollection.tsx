'use client';

import { useState } from 'react';
import { Lightbulb, Target, GitBranch, Zap, Brain, ChevronRight, FileText, Copy, Layers, Puzzle, Building, MessageSquare, Sparkles } from 'lucide-react';
import { WritingTool } from '@/types';

interface AdvancedToolsCollectionProps {
  tools: WritingTool[];
  onToolSelect: (toolId: string) => void;
}

const AdvancedToolsCollection = ({ tools, onToolSelect }: AdvancedToolsCollectionProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // 获取所有需要密码解锁的高级工具
  const advancedTools = tools.filter(tool =>
    tool.id.startsWith('tool-') &&
    parseInt(tool.id.split('-')[1]) >= 7
  );

  // 按类别分组工具
  const toolCategories = [
    {
      id: 'thinking',
      name: '核心思维模式',
      icon: <Brain className="w-5 h-5" />,
      tools: advancedTools.filter(tool =>
        ['tool-7', 'tool-8'].includes(tool.id)
      ),
      description: '决定文章的"灵魂"与"骨架"'
    },
    {
      id: 'structure',
      name: '宏观结构模式',
      icon: <Building className="w-5 h-5" />,
      tools: advancedTools.filter(tool =>
        ['tool-9'].includes(tool.id)
      ),
      description: '选择文章的"行军路线图"'
    },
    {
      id: 'paragraph',
      name: '段落发展模式',
      icon: <Layers className="w-5 h-5" />,
      tools: advancedTools.filter(tool =>
        ['tool-10'].includes(tool.id)
      ),
      description: '构建文章的"标准化乐高积木"'
    },
    {
      id: 'rhetoric',
      name: '语言修辞模式',
      icon: <MessageSquare className="w-5 h-5" />,
      tools: advancedTools.filter(tool =>
        ['tool-11'].includes(tool.id)
      ),
      description: '打磨文章的"锋芒与质感"'
    },
    {
      id: 'system',
      name: '系统思维工具',
      icon: <Puzzle className="w-5 h-5" />,
      tools: advancedTools.filter(tool =>
        ['tool-12'].includes(tool.id)
      ),
      description: '用建筑师视角写作'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-morandi-purple-50 to-morandi-indigo-50 rounded-2xl p-6 border border-morandi-purple-200">
      <h3 className="text-2xl font-bold text-morandi-purple-800 mb-6 flex items-center gap-2">
        <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-morandi-purple-700" />
        </div>
        高级思维工具集
      </h3>

      <div className="mb-6 p-4 bg-morandi-purple-500/10 rounded-xl border border-morandi-purple-200">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Lightbulb className="w-5 h-5 text-morandi-purple-600" />
          </div>
          <div>
            <p className="text-morandi-purple-800 font-medium">作文模式网络</p>
            <p className="text-morandi-purple-700 text-sm">
              将写作从一套僵化的"范文模板"，提升为一个由可复用思维模式和表达模式动态组合的创造性系统。
              每个模式都是一个工具，让你像架构师一样灵活、有深度地构建任何文章。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {toolCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl border border-morandi-purple-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-morandi-purple-50 transition-colors"
              onClick={() => toggleSection(category.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-morandi-purple-100 rounded-lg text-morandi-purple-600">
                  {category.icon}
                </div>
                <div>
                  <span className="font-bold text-morandi-gray-800">{category.name}</span>
                  <span className="text-sm text-morandi-gray-600 ml-2">{category.description}</span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-morandi-gray-500 transition-transform ${activeSection === category.id ? 'rotate-90' : ''}`} />
            </button>
            {activeSection === category.id && (
              <div className="p-4 bg-morandi-purple-50 border-t border-morandi-purple-100">
                <div className="space-y-3">
                  {category.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-3 bg-white rounded-lg border border-morandi-purple-100 hover:border-morandi-purple-300 cursor-pointer transition-colors"
                      onClick={() => onToolSelect(tool.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-morandi-gray-800">{tool.name}</h4>
                          <p className="text-sm text-morandi-gray-600">{tool.title}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-morandi-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-morandi-blue-50 rounded-xl border border-morandi-blue-200">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Target className="w-5 h-5 text-morandi-blue-600" />
          </div>
          <div>
            <p className="text-morandi-blue-800 font-medium">RPC实战演练</p>
            <p className="text-morandi-blue-700 text-sm">
              这个网络的力量不在于孤立地使用某个模式，而在于根据写作任务，进行动态的模式组合（RPC）。
              从模板的奴隶，成为模式的驾驭者！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedToolsCollection;