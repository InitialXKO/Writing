'use client';

import { useAppStore } from '@/lib/store';
import { WritingTool } from '@/types';
import { Star, BookOpen, Calendar, Edit, Trophy, Target, FileText } from 'lucide-react';

interface ClientProgressProps {
  tools: WritingTool[];
}

export default function ClientProgress({ tools }: ClientProgressProps) {
  const { progress, essays } = useAppStore();

  const completedCount = progress.levels.filter(level => level.completed).length;
  const totalTools = tools.length;
  const progressPercentage = Math.round((completedCount / totalTools) * 100);

  return (
    <>
      {/* 进度概览 */}
      <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
        <h2 className="text-xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
          <div className="p-2 bg-morandi-beige-100 rounded-lg">
            <Trophy className="w-5 h-5 text-morandi-beige-600" />
          </div>
          学习概览
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-5 bg-gradient-to-br from-morandi-blue-50 to-morandi-blue-100 rounded-xl border border-morandi-blue-200">
            <div className="inline-flex p-3 bg-morandi-blue-500 text-white rounded-full mb-3">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-morandi-blue-700">{completedCount}</div>
            <div className="text-morandi-blue-800 font-medium">已掌握工具</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-morandi-green-50 to-morandi-green-100 rounded-xl border border-morandi-green-200">
            <div className="inline-flex p-3 bg-morandi-green-500 text-white rounded-full mb-3">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-morandi-green-700">{progress.totalScore}</div>
            <div className="text-morandi-green-800 font-medium">累计得分</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-morandi-pink-50 to-morandi-pink-100 rounded-xl border border-morandi-pink-200">
            <div className="inline-flex p-3 bg-morandi-pink-500 text-white rounded-full mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-morandi-pink-700">{essays.length}</div>
            <div className="text-morandi-pink-800 font-medium">作文数量</div>
          </div>
        </div>

        {/* 总体进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-morandi-gray-700">总体进度</span>
            <span className="text-sm font-bold text-morandi-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-morandi-gray-200 rounded-full h-3">
            <div
              className="h-3 bg-gradient-to-r from-morandi-blue-500 to-morandi-green-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* 工具进度条 */}
      <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
        <h2 className="text-xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
          <div className="p-2 bg-morandi-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-morandi-blue-600" />
          </div>
          工具掌握进度
        </h2>

        <div className="space-y-5">
          {tools.map((tool, index) => {
            const levelProgress = progress.levels.find(l => l.toolId === tool.id);
            const isCompleted = levelProgress?.completed;

            return (
              <div key={tool.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 text-white'
                    : 'bg-morandi-gray-200 text-morandi-gray-600'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-morandi-gray-800">{tool.name}</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {isCompleted ? (
                        <>
                          <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
                          <span className="text-morandi-green-600">已完成</span>
                        </>
                      ) : (
                        <span className="text-morandi-gray-500">未完成</span>
                      )}
                    </span>
                  </div>

                  <div className="w-full bg-morandi-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-morandi-green-400 to-morandi-green-500'
                          : 'bg-gradient-to-r from-morandi-gray-300 to-morandi-gray-400'
                      }`}
                      style={{ width: isCompleted ? '100%' : '30%' }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 作文列表 */}
      <section className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
        <h2 className="text-xl font-bold text-morandi-gray-800 mb-6 flex items-center gap-2">
          <div className="p-2 bg-morandi-green-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-morandi-green-600" />
          </div>
          我的作文
        </h2>

        {essays.length === 0 ? (
          <div className="text-center py-12 text-morandi-gray-500">
            <div className="inline-flex p-4 bg-morandi-gray-100 rounded-full mb-4">
              <BookOpen className="w-12 h-12 text-morandi-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-morandi-gray-700 mb-2">还没有写过作文</h3>
            <p className="text-morandi-gray-500">开始学习工具并练习写作吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {essays.map((essay) => {
              const tool = tools.find(t => t.id === essay.toolUsed);

              return (
                <div key={essay.id} className="border border-morandi-gray-200 rounded-xl p-5 hover:shadow-card transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-morandi-gray-800 text-lg">
                      {essay.title}
                    </h3>
                    <span className="bg-gradient-to-r from-morandi-blue-100 to-morandi-blue-200 text-morandi-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {tool?.name || '通用'}
                    </span>
                  </div>

                  <p className="text-morandi-gray-600 text-sm mb-4 line-clamp-2 bg-morandi-gray-50 p-3 rounded-lg">
                    {essay.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-morandi-gray-500">
                    <div className="flex items-center gap-2 bg-morandi-gray-100 px-2 py-1 rounded">
                      <Calendar className="w-3 h-3" />
                      {(typeof essay.createdAt === 'string' ? new Date(essay.createdAt) : essay.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    <button className="flex items-center gap-1 text-morandi-blue-600 hover:text-morandi-blue-700 font-medium">
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