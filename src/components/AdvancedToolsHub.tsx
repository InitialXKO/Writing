'use client';

import { useState } from 'react';
import {
  Brain, Target, Building, Layers, MessageSquare, Puzzle,
  ChevronRight, ArrowLeft, CheckCircle, Sparkles, Lightbulb,
  AlertTriangle, GitBranch, Zap
} from 'lucide-react';
import { WritingTool } from '@/types';
import Link from 'next/link';
import { topLevelToolsConfig } from '@/lib/tool-config';

interface AdvancedToolsHubProps {
  tools: WritingTool[];
  onToolSelect: (toolId: string) => void;
  onBack: () => void;
}

// 图标映射
const iconMap: Record<string, JSX.Element> = {
  Brain: <Brain className="w-5 h-5" />,
  Building: <Building className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Puzzle: <Puzzle className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

const AdvancedToolsHub = ({ tools, onToolSelect, onBack }: AdvancedToolsHubProps) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toggleTool = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  // 获取所有需要密码解锁的高级工具
  const advancedTools = tools.filter(tool =>
    tool.id.startsWith('tool-') &&
    parseInt(tool.id.split('-')[1]) >= 7
  );

  // 使用共享配置，映射图标
  const topLevelTools = topLevelToolsConfig.map(tool => ({
    ...tool,
    icon: iconMap[tool.icon] || <Layers className="w-5 h-5" />
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-morandi-purple-600 to-morandi-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-morandi-purple-100 hover:text-white transition-colors mb-6 w-fit"
          >
            <div className="p-2 bg-morandi-purple-500/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </div>
            返回首页
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">高级思维工具集</h1>
                <p className="text-morandi-purple-100 text-lg">作文模式网络 - 从模板到动态模式组合</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-morandi-orange-50 to-morandi-red-50 border border-morandi-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-morandi-orange-800">
                <AlertTriangle className="w-5 h-5 text-morandi-orange-700" />
                <span className="font-bold">超纲警告</span>
              </div>
              <p className="text-morandi-orange-700">以下内容属于超纲知识，仅供学有余力的同学参考。请确保已熟练掌握基础写作工具后再学习这些高级技巧。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto p-6 space-y-8 pb-12">
        <div className="bg-morandi-purple-50 border border-morandi-purple-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Lightbulb className="w-5 h-5 text-morandi-purple-600" />
            </div>
            <div>
              <p className="text-morandi-purple-800 font-medium">作文思维方法</p>
              <p className="text-morandi-purple-700 text-sm">
                告别死记硬背的范文套路，用灵活的思维方法和表达技巧来构建你的独特文章。
                每一种方法都是一个实用工具，帮助你更好地组织思路，清晰地表达想法。
              </p>
            </div>
          </div>
        </div>

        {/* 超纲警告 */}
        <div className="bg-gradient-to-br from-morandi-orange-50 to-morandi-red-50 border border-morandi-orange-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-morandi-orange-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-morandi-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-morandi-orange-700" />
            </div>
            超纲警告
          </h3>
          <div className="space-y-4">
            <p className="text-morandi-orange-700">
              以下内容属于超纲知识，仅供学有余力的同学参考。请确保已熟练掌握基础写作工具后再学习这些高级技巧。
            </p>

            {/* 原AdvancedThinkingGuide内容 */}
            <div className="bg-white rounded-xl border border-morandi-orange-100 overflow-hidden">
              <div className="p-4 bg-morandi-blue-50 border-b border-morandi-blue-100">
                <h4 className="font-bold text-morandi-blue-800 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  思辨写作进阶指南
                </h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <span className="font-medium text-morandi-blue-800">效率与质量的冲突：</span>
                    <span className="text-morandi-blue-700">识别问题中的核心冲突点，比如"新与旧"蕴含传承与创新的张力</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <span className="font-medium text-morandi-blue-800">"假设"之问：</span>
                    <span className="text-morandi-blue-700">分析人们通常如何看待这个冲突，背后的错误假设是什么</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <span className="font-medium text-morandi-blue-800">"破局"之问：</span>
                    <span className="text-morandi-blue-700">如何跳出非此即彼的思维，找到更高维度的解决方案</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-morandi-orange-100 overflow-hidden">
              <div className="p-4 bg-morandi-pink-50 border-b border-morandi-pink-100">
                <h4 className="font-bold text-morandi-pink-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  避免三个思维陷阱
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1 text-morandi-pink-500">🚫</div>
                  <div>
                    <span className="font-medium text-morandi-pink-800">陷阱1：人云亦云</span>
                    <span className="text-morandi-pink-700">重复题干观点，没有个人见解</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 text-morandi-pink-500">🚫</div>
                  <div>
                    <span className="font-medium text-morandi-pink-800">陷阱2：二元对立</span>
                    <span className="text-morandi-pink-700">非黑即白，缺乏辩证思维</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 text-morandi-pink-500">🚫</div>
                  <div>
                    <span className="font-medium text-morandi-pink-800">陷阱3：空谈理论</span>
                    <span className="text-morandi-pink-700">脱离现实，没有实际价值</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-morandi-orange-100 overflow-hidden">
              <div className="p-4 bg-morandi-green-50 border-b border-morandi-green-100">
                <h4 className="font-bold text-morandi-green-800 flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  五步建构法
                </h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <span className="font-medium text-morandi-green-800">定位核心冲突：</span>
                    <span className="text-morandi-green-700">用"三分钟定题法"，确定要解决的根本问题</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <span className="font-medium text-morandi-green-800">确立强中心：</span>
                    <span className="text-morandi-green-700">写下一句核心论点，像建筑的承重墙，坚定而清晰</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <span className="font-medium text-morandi-green-800">选择主结构：</span>
                    <span className="text-morandi-green-700">根据论点选择最适合的思维结构</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <span className="font-medium text-morandi-green-800">填充论证：</span>
                    <span className="text-morandi-green-700">用论据和分析充实每个部分</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 bg-morandi-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <span className="font-medium text-morandi-green-800">检查逻辑：</span>
                    <span className="text-morandi-green-700">确保结论从前面论证中自然生长出来</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-morandi-orange-100 overflow-hidden">
              <div className="p-4 bg-morandi-indigo-50 border-b border-morandi-indigo-100">
                <h4 className="font-bold text-morandi-indigo-800 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  模式复用
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <span className="font-medium text-morandi-indigo-800">破题模式：</span>
                  <span className="text-morandi-indigo-700">识别冲突 → 破解假设 → 提出新解</span>
                </div>
                <div>
                  <span className="font-medium text-morandi-indigo-800">论证模式：</span>
                  <span className="text-morandi-indigo-700">观点 → 论据 → 分析 → 回扣</span>
                </div>
                <div>
                  <span className="font-medium text-morandi-indigo-800">深化模式：</span>
                  <span className="text-morandi-indigo-700">个人 → 社会 → 时代 → 未来</span>
                </div>
                <div className="text-sm text-morandi-indigo-600 bg-white p-3 rounded-lg border border-morandi-indigo-100">
                  <span className="font-medium">规则：</span>
                  每种模式都是工具，根据需要灵活选用，不要生搬硬套。
                </div>
              </div>
            </div>

            <div className="p-4 bg-morandi-orange-500/10 rounded-xl border border-morandi-orange-200">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Lightbulb className="w-5 h-5 text-morandi-orange-600" />
                </div>
                <div>
                  <p className="text-morandi-orange-800 font-medium">高阶提示</p>
                  <p className="text-morandi-orange-700 text-sm">
                    模式让你在约束中游刃有余；思考让你在创造中独一无二。
                    用理解文学的思路理解科学，用分析历史的眼光分析当下。
                    真正的创造力，往往产生于不同思维模式的碰撞与融合。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {topLevelTools.map((tool) => {
            const toolData = advancedTools.find(t => t.id === tool.id);
            const subTools = advancedTools.filter(t => tool.subTools.includes(t.id));

            return (
              <div key={tool.id} className="bg-white rounded-2xl shadow-card border border-morandi-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-morandi-gray-50 transition-colors"
                  onClick={() => toggleTool(tool.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-morandi-purple-100 rounded-lg text-morandi-purple-600">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-morandi-gray-800">{tool.name}</h3>
                      <p className="text-morandi-gray-600">{tool.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-6 h-6 text-morandi-gray-400 transition-transform ${activeTool === tool.id ? 'rotate-90' : ''}`} />
                </button>

                {activeTool === tool.id && (
                  <div className="border-t border-morandi-gray-200 p-6 bg-morandi-gray-50">
                    {/* 顶层工具信息 */}
                    {toolData && (
                      <div
                        className="p-4 bg-white rounded-lg border border-morandi-gray-200 mb-4 hover:border-morandi-purple-300 cursor-pointer transition-colors"
                        onClick={() => onToolSelect(tool.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-morandi-gray-800">{toolData.name}</h4>
                            <p className="text-sm text-morandi-gray-600">{toolData.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-morandi-purple-100 text-morandi-purple-800 px-2 py-1 rounded-full">
                              顶层工具
                            </span>
                            <ChevronRight className="w-4 h-4 text-morandi-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 子工具列表 */}
                    {subTools.length > 0 && (
                      <div className="mb-4 last:mb-0">
                        <h4 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-morandi-purple-500 rounded-full"></div>
                          支撑此工具的子工具
                          <span className="text-sm font-normal text-morandi-gray-600">掌握这些子工具，提升您的写作技能</span>
                        </h4>
                        <div className="space-y-3 pl-4 border-l-2 border-morandi-purple-200">
                          {subTools.map((subTool) => (
                            <div
                              key={subTool.id}
                              className="p-3 bg-white rounded-lg border border-morandi-gray-200 hover:border-morandi-purple-300 cursor-pointer transition-colors"
                              onClick={() => onToolSelect(subTool.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-morandi-gray-800">{subTool.name}</h5>
                                  <p className="text-sm text-morandi-gray-600">{subTool.title}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-morandi-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:from-morandi-blue-600 hover:to-morandi-blue-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-6 h-6" />
              返回首页继续学习
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedToolsHub;