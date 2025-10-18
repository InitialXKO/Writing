'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Edit3, Eye, Trash2, History, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Essay, EssayVersion } from '@/types';

export default function EssaysPage() {
  const { essays, updateEssay } = useAppStore();
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<EssayVersion | null>(null);

  const handleDeleteEssay = (id: string) => {
    if (confirm('确定要删除这篇作文吗？此操作不可撤销。')) {
      updateEssay(id, { id: '' } as any); // 通过设置id为空来标记删除
      if (selectedEssay?.id === id) {
        setSelectedEssay(null);
        setSelectedVersion(null);
      }
    }
  };

  // 过滤掉已删除的作文
  const activeEssays = essays.filter(essay => essay.id);

  // 获取当前显示的内容（选中的版本或当前作文）
  const getCurrentContent = () => {
    if (selectedVersion) {
      return selectedVersion.content;
    }
    return selectedEssay?.content || '';
  };

  // 获取当前显示的反馈（选中的版本或当前作文）
  const getCurrentFeedback = () => {
    if (selectedVersion) {
      return selectedVersion.feedback;
    }
    return selectedEssay?.feedback || '';
  };

  // 获取当前显示的标题（选中的版本会显示版本信息）
  const getCurrentTitle = () => {
    if (selectedVersion && selectedEssay) {
      const versionIndex = selectedEssay.versions?.findIndex(v => v.id === selectedVersion.id);
      return `${selectedEssay.title} - 版本 ${versionIndex !== undefined && versionIndex >= 0 ? selectedEssay.versions!.length - versionIndex : 'N/A'}`;
    }
    return selectedEssay?.title || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-morandi-gray-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-2 rounded-lg hover:bg-morandi-blue-50"
            >
              <div className="p-2 bg-morandi-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </div>
              返回首页
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-morandi-gray-800 flex items-center gap-2">
                <div className="p-2 bg-morandi-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-morandi-green-600" />
                </div>
                我的作文
              </h1>
              <p className="text-morandi-gray-600 text-sm">管理你的所有作文和修改历史</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 作文列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            <h2 className="text-xl font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-blue-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-morandi-blue-600" />
              </div>
              作文列表
              <span className="text-sm font-normal text-morandi-gray-500 ml-2">
                ({activeEssays.length}篇)
              </span>
            </h2>

            {activeEssays.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-morandi-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-morandi-gray-400" />
                </div>
                <p className="text-morandi-gray-500">还没有保存的作文</p>
                <Link
                  href="/write"
                  className="mt-4 inline-block bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  去写作文
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {activeEssays.map((essay) => (
                  <div
                    key={essay.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedEssay?.id === essay.id
                        ? 'border-morandi-blue-500 bg-morandi-blue-50'
                        : 'border-morandi-gray-200 hover:border-morandi-blue-300 hover:bg-morandi-blue-50'
                    }`}
                    onClick={() => {
                      setSelectedEssay(essay);
                      setSelectedVersion(null);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-morandi-gray-800 truncate">{essay.title}</h3>
                        <p className="text-sm text-morandi-gray-600 mt-1 truncate">
                          {essay.content.substring(0, 50)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-morandi-gray-500">
                          <span>{new Date(essay.createdAt).toLocaleDateString()}</span>
                          {essay.versions && essay.versions.length > 0 && (
                            <span className="flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {essay.versions.length}个版本
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEssay(essay.id);
                        }}
                        className="p-2 text-morandi-gray-400 hover:text-morandi-red-500 hover:bg-morandi-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 作文详情和操作 */}
        <div className="lg:col-span-2">
          {selectedEssay ? (
            <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-morandi-gray-800">{getCurrentTitle()}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-morandi-gray-600">
                    <span>{new Date(selectedEssay.createdAt).toLocaleDateString()}</span>
                    <span>使用工具：{selectedEssay.toolUsed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedVersion ? (
                    <Link
                      href={`/write?essayId=${selectedEssay.id}&versionId=${selectedVersion.id}`}
                      className="flex items-center gap-2 bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      基于此版本编辑
                    </Link>
                  ) : (
                    <Link
                      href={`/write?essayId=${selectedEssay.id}`}
                      className="flex items-center gap-2 bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      编辑当前版本
                    </Link>
                  )}
                </div>
              </div>

              {/* 版本历史 */}
              {selectedEssay.versions && selectedEssay.versions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
                    <div className="p-1 bg-morandi-green-100 rounded-md">
                      <History className="w-4 h-4 text-morandi-green-600" />
                    </div>
                    修改历史
                  </h3>
                  <div className="space-y-2">
                    {selectedEssay.versions.map((version, index) => {
                      const isSelected = selectedVersion?.id === version.id;
                      return (
                        <div
                          key={version.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-morandi-blue-500 bg-morandi-blue-50'
                              : 'border-morandi-gray-200 hover:border-morandi-blue-300 hover:bg-morandi-blue-50'
                          }`}
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-morandi-gray-700">
                                版本 {selectedEssay.versions!.length - index}
                              </span>
                              <span className="text-xs text-morandi-gray-500">
                                {new Date(version.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/write?essayId=${selectedEssay.id}&versionId=${version.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-morandi-blue-600 hover:text-morandi-blue-800 flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                编辑
                              </Link>
                            </div>
                          </div>
                          {version.feedback && (
                            <div className="mt-2 text-sm text-morandi-gray-600 bg-white p-2 rounded">
                              <span className="font-medium">批改意见：</span>
                              {version.feedback.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 内容区域 */}
              <div>
                <h3 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
                  <div className="p-1 bg-morandi-blue-100 rounded-md">
                    <Edit3 className="w-4 h-4 text-morandi-blue-600" />
                  </div>
                  {selectedVersion ? '版本内容' : '当前版本内容'}
                </h3>
                <div className="bg-morandi-gray-50 p-4 rounded-lg border border-morandi-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-morandi-gray-700">
                    {getCurrentContent()}
                  </pre>
                </div>
              </div>

              {/* 批改意见 */}
              {getCurrentFeedback() && (
                <div className="mt-6">
                  <h3 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
                    <div className="p-1 bg-morandi-green-100 rounded-md">
                      <Sparkles className="w-4 h-4 text-morandi-green-600" />
                    </div>
                    批改意见
                  </h3>
                  <div className="bg-morandi-green-50 p-4 rounded-lg border border-morandi-green-200">
                    <div className="text-morandi-gray-700 whitespace-pre-wrap">
                      {getCurrentFeedback()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-12 border border-morandi-gray-200 text-center">
              <div className="p-4 bg-morandi-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-morandi-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-morandi-gray-800 mb-2">选择一篇作文</h3>
              <p className="text-morandi-gray-600">
                从左侧列表中选择一篇作文来查看详情和修改历史
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}