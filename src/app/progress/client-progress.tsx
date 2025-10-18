'use client';

import { useAppStore } from '@/lib/store';
import { WritingTool } from '@/types';
import { Star, BookOpen, Calendar, Edit } from 'lucide-react';

interface ClientProgressProps {
  tools: WritingTool[];
}

export default function ClientProgress({ tools }: ClientProgressProps) {
  const { progress, essays } = useAppStore();

  const completedCount = progress.levels.filter(level => level.completed).length;
  const totalTools = tools.length;

  return (
    <>
      {/* 进度概览 */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          学习概览
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
            <div className="text-blue-800">已掌握工具</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{progress.totalScore}</div>
            <div className="text-green-800">累计得分</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{essays.length}</div>
            <div className="text-purple-800">作文数量</div>
          </div>
        </div>

        {/* 工具进度条 */}
        <div className="space-y-4">
          {tools.map((tool, index) => {
            const levelProgress = progress.levels.find(l => l.toolId === tool.id);
            const isCompleted = levelProgress?.completed;

            return (
              <div key={tool.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{tool.name}</span>
                    <span className="text-sm text-gray-500">
                      {isCompleted ? `得分：${levelProgress.score}` : '未完成'}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 作文列表 */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          我的作文
        </h2>

        {essays.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">还没有写过作文</p>
            <p className="text-sm mt-2">开始学习工具并练习写作吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {essays.map((essay) => {
              const tool = tools.find(t => t.id === essay.toolUsed);

              return (
                <div key={essay.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {essay.title}
                    </h3>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                      {tool?.name || '通用'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {essay.content.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {essay.createdAt.toLocaleDateString('zh-CN')}
                    </div>
                    <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                      <Edit className="w-3 h-3" />
                      查看详情
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}