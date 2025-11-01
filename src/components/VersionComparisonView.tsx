'use client';

import { useState } from 'react';
import { Essay, EssayVersion } from '@/types';
import { Trash2, Edit3, History } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/lib/store';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface VersionComparisonViewProps {
  essay: Essay;
  versions: EssayVersion[];
  selectedVersion: EssayVersion | null;
  onVersionSelect: (version: EssayVersion) => void;
  onVersionDelete: (versionId: string) => void;
}

export default function VersionComparisonView({
  essay,
  versions,
  selectedVersion,
  onVersionSelect,
  onVersionDelete
}: VersionComparisonViewProps) {
  const { showSuccess, showError } = useNotificationContext();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  const handleDeleteVersion = (versionId: string) => {
    setVersionToDelete(versionId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (versionToDelete) {
      onVersionDelete(versionToDelete);
      showSuccess('版本已删除');
    }
    setIsConfirmDialogOpen(false);
    setVersionToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setVersionToDelete(null);
  };

  // 检查是否可以删除版本（不能删除主版本）
  const canDeleteVersion = (version: EssayVersion) => {
    // 如果只有一个版本，不能删除
    if (versions.length <= 1) return false;
    // 如果是主版本（没有parentId），且只有一个主版本，不能删除
    const mainVersions = versions.filter(v => !v.parentId);
    if (!version.parentId && mainVersions.length <= 1) return false;
    return true;
  };

  return (
    <div className="mb-6">
      <h3 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
        <div className="p-1 bg-morandi-green-100 rounded-md">
          <History className="w-4 h-4 text-morandi-green-600" />
        </div>
        修改历史 - 版本对比
      </h3>

      {/* 版本列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {versions.map((version) => {
          const isSelected = selectedVersion?.id === version.id;
          const isMainVersion = !version.parentId;
          const canDelete = canDeleteVersion(version);

          return (
            <div
              key={version.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-morandi-blue-500 bg-morandi-blue-50'
                  : 'border-morandi-gray-200 hover:border-morandi-blue-300 hover:bg-morandi-blue-50'
              }`}
              onClick={() => onVersionSelect(version)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-morandi-gray-700">
                      {(() => {
                        const actualIndex = versions.findIndex(v => v.id === version.id);
                        return `版本 ${actualIndex !== -1 ? actualIndex + 1 : 'N/A'}`;
                      })()}
                      {isMainVersion && (
                        <span className="text-xs text-morandi-green-600 ml-1">(主版本)</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-morandi-gray-500 mt-1 block">
                    {(typeof version.createdAt === 'string' ? new Date(version.createdAt) : version.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/write?essayId=${essay.id}&versionId=${version.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-morandi-blue-600 hover:text-morandi-blue-800 hover:bg-morandi-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Link>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVersion(version.id);
                      }}
                      className="p-1 text-morandi-gray-400 hover:text-morandi-red-500 hover:bg-morandi-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {version.feedback && (
                <div className="mt-2 text-xs text-morandi-gray-600 bg-white p-2 rounded">
                  <div className="line-clamp-2">
                    <ReactMarkdown>
                      {String(version.feedback?.substring(0, 80) || '') + (version.feedback?.length > 80 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 详细对比视图 */}
      {selectedVersion && (
        <div className="bg-gradient-to-br from-morandi-gray-50 to-white rounded-2xl p-6 border border-morandi-gray-200">
          <h4 className="font-bold text-morandi-gray-800 mb-4 text-lg">
            {(() => {
              const actualIndex = versions.findIndex(v => v.id === selectedVersion.id);
              return `版本 ${actualIndex !== -1 ? actualIndex + 1 : 'N/A'} 详情`;
            })()}
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 文章内容 */}
            <div className="bg-morandi-blue-50 p-4 rounded-lg border border-morandi-blue-200">
              <h5 className="font-bold text-morandi-blue-800 mb-3 flex items-center gap-2">
                <div className="p-1 bg-morandi-blue-100 rounded-md">
                  <Edit3 className="w-4 h-4 text-morandi-blue-600" />
                </div>
                文章内容
              </h5>
              <div className="bg-white p-4 rounded border border-morandi-blue-100 min-h-64">
                <pre className="whitespace-pre-wrap font-sans text-morandi-gray-700 text-sm">
                  {selectedVersion.content}
                </pre>
              </div>
            </div>

            {/* 批改反馈 */}
            <div className="bg-morandi-green-50 p-4 rounded-lg border border-morandi-green-200">
              <h5 className="font-bold text-morandi-green-800 mb-3 flex items-center gap-2">
                <div className="p-1 bg-morandi-green-100 rounded-md">
                  <History className="w-4 h-4 text-morandi-green-600" />
                </div>
                批改反馈
              </h5>
              {selectedVersion.feedback ? (
                <div className="bg-white p-4 rounded border border-morandi-green-100 min-h-64">
                  <div className="text-morandi-gray-700 prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {String(selectedVersion.feedback || '')}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded border border-morandi-green-100 min-h-64 flex items-center justify-center text-morandi-gray-500">
                  <p>暂无批改反馈</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="删除版本"
        message="确定要删除这个版本吗？此操作不可撤销。"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="删除"
        cancelText="取消"
      />
    </div>
  );
}