'use client';

import { useState, useEffect } from 'react';
import { Essay, EssayVersion } from '@/types';
import { Edit3, History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/lib/store';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface SimplifiedVersionHistoryProps {
  essay: Essay;
  selectedVersion: EssayVersion | null;
  onVersionSelect: (version: EssayVersion) => void;
}

// 扩展版本类型以包含兄弟节点信息
interface ExtendedEssayVersion extends EssayVersion {
  prevSiblingId?: string;
  nextSiblingId?: string;
  childrenIds?: string[];
}

export default function SimplifiedVersionHistory({
  essay,
  selectedVersion,
  onVersionSelect
}: SimplifiedVersionHistoryProps) {
  const { deleteEssayVersion } = useAppStore();
  const { showSuccess, showError } = useNotificationContext();
  const [currentViewPath, setCurrentViewPath] = useState<EssayVersion[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [versionToDelete, setVersionToDelete] = useState<{essayId: string, versionId: string} | null>(null);

  // 构建带兄弟关系的版本树
  const buildVersionTreeWithSiblings = (versions: EssayVersion[]): ExtendedEssayVersion[] => {
    // 创建版本映射
    const versionMap = new Map<string, ExtendedEssayVersion>();
    versions.forEach(version => {
      versionMap.set(version.id, { ...version, childrenIds: [] });
    });

    // 构建父子关系和兄弟关系
    versions.forEach(version => {
      if (version.parentId) {
        const parent = versionMap.get(version.parentId);
        if (parent) {
          parent.childrenIds = parent.childrenIds || [];
          parent.childrenIds.push(version.id);
        }
      }
    });

    // 为每个节点添加兄弟节点信息
    versions.forEach(version => {
      if (version.parentId) {
        const parent = versionMap.get(version.parentId);
        if (parent && parent.childrenIds) {
          const siblings = parent.childrenIds;
          const currentIndex = siblings.indexOf(version.id);
          if (currentIndex > 0) {
            versionMap.get(version.id)!.prevSiblingId = siblings[currentIndex - 1];
          }
          if (currentIndex < siblings.length - 1) {
            versionMap.get(version.id)!.nextSiblingId = siblings[currentIndex + 1];
          }
        }
      } else {
        // 没有父节点的版本（根节点或游离节点）
        // 这里可以处理游离节点的兄弟关系
        const noParentVersions = versions.filter(v => !v.parentId);
        const currentIndex = noParentVersions.findIndex(v => v.id === version.id);
        if (currentIndex > 0) {
          versionMap.get(version.id)!.prevSiblingId = noParentVersions[currentIndex - 1].id;
        }
        if (currentIndex < noParentVersions.length - 1) {
          versionMap.get(version.id)!.nextSiblingId = noParentVersions[currentIndex + 1].id;
        }
      }
    });

    return Array.from(versionMap.values());
  };

  // 初始化显示路径
  const initializeViewPath = (versions: EssayVersion[]) => {
    if (versions.length === 0) {
      setCurrentViewPath([]);
      return;
    }

    // 构建带兄弟关系的版本树
    const extendedVersions = buildVersionTreeWithSiblings(versions);
    const versionMap = new Map<string, ExtendedEssayVersion>();
    extendedVersions.forEach(v => versionMap.set(v.id, v));

    // 默认显示主分支路径（从第一个根节点开始）
    const noParentVersions = versions.filter(v => !v.parentId);
    if (noParentVersions.length === 0) {
      setCurrentViewPath([]);
      return;
    }

    // 选择第一个无父节点的版本作为起始点
    const startVersion = noParentVersions[0];
    const path: EssayVersion[] = [startVersion];

    // 向下追溯子节点（总是选择第一个子节点）
    let currentVersion: ExtendedEssayVersion | undefined = versionMap.get(startVersion.id);
    while (currentVersion && currentVersion.childrenIds && currentVersion.childrenIds.length > 0) {
      const firstChildId = currentVersion.childrenIds[0];
      const childVersion = versionMap.get(firstChildId);
      if (childVersion) {
        path.push(childVersion);
        currentVersion = childVersion;
      } else {
        break;
      }
    }

    setCurrentViewPath(path);
  };

  // 切换到兄弟版本
  const switchToSibling = (versionId: string, direction: 'prev' | 'next') => {
    const versions = essay.versions || [];
    if (versions.length === 0) return;

    // 构建带兄弟关系的版本树
    const extendedVersions = buildVersionTreeWithSiblings(versions);
    const versionMap = new Map<string, ExtendedEssayVersion>();
    extendedVersions.forEach(v => versionMap.set(v.id, v));

    const currentVersion = versionMap.get(versionId);
    if (!currentVersion) return;

    // 找到要切换到的兄弟版本ID
    const siblingId = direction === 'prev' ? currentVersion.prevSiblingId : currentVersion.nextSiblingId;
    if (!siblingId) return;

    const siblingVersion = versionMap.get(siblingId);
    if (!siblingVersion) return;

    // 更新显示路径
    const newPath = currentViewPath.map(v => {
      if (v.id === versionId) {
        return siblingVersion;
      }
      return v;
    });

    // 更新该节点之后的所有子孙节点（总是选择第一个子节点）
    const updateChildVersions = (parentId: string, pathIndex: number) => {
      const parentVersion = versionMap.get(parentId);
      if (parentVersion && parentVersion.childrenIds && parentVersion.childrenIds.length > 0) {
        const firstChildId = parentVersion.childrenIds[0];
        const childVersion = versionMap.get(firstChildId);
        if (childVersion) {
          if (pathIndex < newPath.length) {
            newPath[pathIndex] = childVersion;
          } else {
            newPath.push(childVersion);
          }
          // 递归更新更深层的子节点
          updateChildVersions(childVersion.id, pathIndex + 1);
        }
      } else {
        // 如果没有子节点，截断路径
        newPath.splice(pathIndex);
      }
    };

    // 从切换节点的下一个位置开始更新子节点
    const switchIndex = newPath.findIndex(v => v.id === siblingId);
    if (switchIndex !== -1) {
      updateChildVersions(siblingId, switchIndex + 1);
    }

    setCurrentViewPath(newPath);

    // 检查是否需要更新选中状态
    let shouldUpdateSelection = false;

    // 情况1: 如果当前选中的版本就是被切换的版本，则更新选中状态为切换后的版本
    if (selectedVersion?.id === versionId) {
      shouldUpdateSelection = true;
    }

    // 情况2: 检查当前选中的版本是否是被切换版本的子版本
    if (selectedVersion && selectedVersion.parentId === versionId) {
      shouldUpdateSelection = true;
    }

    // 情况3: 如果没有选中任何版本，但当前显示路径中的最后一个版本是被切换版本或其子版本
    if (!selectedVersion && currentViewPath.length > 0) {
      const lastVersion = currentViewPath[currentViewPath.length - 1];
      // 如果最后一个版本就是被切换的版本
      if (lastVersion.id === versionId) {
        shouldUpdateSelection = true;
      }
      // 如果最后一个版本是被切换版本的子版本
      else if (lastVersion.parentId === versionId) {
        shouldUpdateSelection = true;
      }
      // 如果最后一个版本的父版本是被切换的版本（即被切换版本是最后一个版本的祖父节点等）
      else {
        let currentParentId = lastVersion.parentId;
        while (currentParentId) {
          if (currentParentId === versionId) {
            shouldUpdateSelection = true;
            break;
          }
          const parentVersion = versions.find(v => v.id === currentParentId);
          currentParentId = parentVersion?.parentId;
        }
      }
    }

    // 如果需要更新选中状态，则选中切换后的版本
    if (shouldUpdateSelection) {
      onVersionSelect(siblingVersion);
    }
  };

  // 导航到指定版本
  const navigateToVersion = (versionId: string) => {
    const versions = essay.versions || [];
    if (versions.length === 0) return;

    // 构建带兄弟关系的版本树
    const extendedVersions = buildVersionTreeWithSiblings(versions);
    const versionMap = new Map<string, ExtendedEssayVersion>();
    extendedVersions.forEach(v => versionMap.set(v.id, v));

    // 构建从根到目标版本的路径
    const path: EssayVersion[] = [];
    let currentId: string | undefined = versionId;

    // 向上追溯到根版本，构建路径
    const tempPath: EssayVersion[] = [];
    while (currentId) {
      const version = versions.find(v => v.id === currentId);
      if (version) {
        tempPath.unshift(version);
        currentId = version.parentId || undefined;
      } else {
        break;
      }
    }
    path.push(...tempPath);

    // 向下追溯子节点（总是选择第一个子节点）
    let currentVersion = versionMap.get(versionId);
    if (currentVersion) {
      while (currentVersion && currentVersion.childrenIds && currentVersion.childrenIds.length > 0) {
        const firstChildId = currentVersion.childrenIds[0];
        const childVersion = versionMap.get(firstChildId);
        if (childVersion) {
          path.push(childVersion);
          currentVersion = childVersion;
        } else {
          break;
        }
      }
    }

    setCurrentViewPath(path);
    const targetVersion = versions.find(v => v.id === versionId);
    if (targetVersion) {
      onVersionSelect(targetVersion);
    }
  };

  // 处理删除版本
  const handleDeleteVersion = (essayId: string, versionId: string) => {
    setVersionToDelete({ essayId, versionId });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (versionToDelete) {
      deleteEssayVersion(versionToDelete.essayId, versionToDelete.versionId);
      showSuccess('版本已删除');
      // 如果删除的是当前选中的版本，需要清除选中状态
      if (selectedVersion?.id === versionToDelete.versionId) {
        onVersionSelect({} as EssayVersion); // 这里需要更好的处理
      }
    }
    setIsConfirmDialogOpen(false);
    setVersionToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setVersionToDelete(null);
  };

  // 检查是否可以删除版本
  const canDeleteVersion = (version: EssayVersion) => {
    if (!essay.versions) return false;
    // 如果只有一个版本，不能删除
    if (essay.versions.length <= 1) return false;
    // 如果是主版本（没有parentId），且只有一个主版本，不能删除
    const mainVersions = essay.versions.filter(v => !v.parentId);
    if (!version.parentId && mainVersions.length <= 1) return false;
    return true;
  };

  // 初始化显示路径
  useEffect(() => {
    if (essay.versions && essay.versions.length > 0) {
      initializeViewPath(essay.versions);
    } else {
      setCurrentViewPath([]);
    }
  }, [essay]);

  // 当选中版本变化时，更新显示路径
  useEffect(() => {
    if (selectedVersion && essay.versions) {
      navigateToVersion(selectedVersion.id);
    }
  }, [selectedVersion, essay.versions]);

  if (!essay.versions || essay.versions.length === 0) {
    return null;
  }

  // 构建带兄弟关系的版本树
  const extendedVersions = buildVersionTreeWithSiblings(essay.versions);
  const versionMap = new Map<string, ExtendedEssayVersion>();
  extendedVersions.forEach(v => versionMap.set(v.id, v));

  return (
    <div className="mb-6">
      <h3 className="font-bold text-morandi-gray-800 mb-3 flex items-center gap-2">
        <div className="p-1 bg-morandi-green-100 rounded-md">
          <History className="w-4 h-4 text-morandi-green-600" />
        </div>
        修改历史
      </h3>
      <div className="space-y-2">
        {currentViewPath.map((version, index) => {
          const isSelected = selectedVersion?.id === version.id;
          const extendedVersion = versionMap.get(version.id);
          const hasPrevSibling = !!extendedVersion?.prevSiblingId;
          const hasNextSibling = !!extendedVersion?.nextSiblingId;
          const hasSiblings = hasPrevSibling || hasNextSibling;

          return (
            <div key={version.id} className="relative">
              {/* 版本项 */}
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-morandi-blue-500 bg-morandi-blue-50'
                    : 'border-morandi-gray-200 hover:border-morandi-blue-300 hover:bg-morandi-blue-50'
                }`}
              >
                {/* 卡片头部 - 版本信息和操作按钮 */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-morandi-gray-700">
                      {(() => {
                        // 计算版本在所有版本中的实际索引
                        const actualIndex = essay.versions ? essay.versions.findIndex(v => v.id === version.id) : -1;
                        return `版本 ${actualIndex !== -1 ? actualIndex + 1 : 'N/A'}`;
                      })()}
                      {!version.parentId && (
                        <span className="text-xs text-morandi-gray-500 ml-1">(主版本)</span>
                      )}
                      {version.parentId && (
                        <span className="text-xs text-morandi-gray-500 ml-1">
                          (基于版本 {essay.versions ? essay.versions.findIndex(v => v.id === version.parentId) + 1 : 'N/A'})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-morandi-gray-500">
                      {(typeof version.createdAt === 'string' ? new Date(version.createdAt) : version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionSelect(version);
                      }}
                      className="text-sm text-morandi-blue-600 hover:text-morandi-blue-800 flex items-center gap-1"
                    >
                      查看详情
                    </button>
                    <Link
                      href={`/write?essayId=${essay.id}&versionId=${version.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-morandi-blue-600 hover:text-morandi-blue-800 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      编辑
                    </Link>
                    {canDeleteVersion(version) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(essay.id, version.id);
                        }}
                        className="text-sm text-morandi-gray-500 hover:text-morandi-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    )}
                  </div>
                </div>

                {/* 左右两栏布局 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 左侧 - 文章内容 */}
                  <div className="bg-morandi-blue-50 p-3 rounded border border-morandi-blue-100">
                    <h4 className="text-xs font-medium text-morandi-blue-700 mb-2">文章内容</h4>
                    <div className="text-sm text-morandi-gray-700 bg-white p-2 rounded min-h-24">
                      <pre className="whitespace-pre-wrap font-sans text-xs">
                        {version.content.substring(0, 150) + (version.content.length > 150 ? '...' : '')}
                      </pre>
                    </div>
                  </div>

                  {/* 右侧 - 批改反馈 */}
                  <div className="bg-morandi-green-50 p-3 rounded border border-morandi-green-100">
                    <h4 className="text-xs font-medium text-morandi-green-700 mb-2">批改反馈</h4>
                    {version.feedback ? (
                      <div className="text-sm text-morandi-gray-700 bg-white p-2 rounded min-h-24">
                        <div className="prose prose-xs max-w-none">
                          <ReactMarkdown>
                            {String(version.feedback.substring(0, 150) || '') + (version.feedback.length > 150 ? '...' : '')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-morandi-gray-500 bg-white p-2 rounded min-h-24 flex items-center justify-center">
                        <p>暂无批改反馈</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 兄弟版本切换指示器 */}
              {hasSiblings && (
                <div className="ml-8 mt-2 flex items-center">
                  {/* 左侧指示器 */}
                  {hasPrevSibling && (
                    <button
                      className="p-1 text-morandi-gray-500 hover:text-morandi-blue-600 hover:bg-morandi-blue-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchToSibling(version.id, 'prev');
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* 中间指示器 */}
                  <span className="text-xs text-morandi-gray-400 mx-2">
                    {(() => {
                      // 计算当前版本在兄弟节点中的位置
                      if (extendedVersion && extendedVersion.parentId) {
                        const parent = versionMap.get(extendedVersion.parentId);
                        if (parent && parent.childrenIds) {
                          const siblings = parent.childrenIds;
                          const currentIndex = siblings.indexOf(version.id);
                          return `${currentIndex + 1}/${siblings.length}`;
                        }
                      } else {
                        // 处理无父节点的版本（根节点或游离节点）
                        const noParentVersions = essay.versions?.filter(v => !v.parentId) || [];
                        const currentIndex = noParentVersions.findIndex(v => v.id === version.id);
                        return `${currentIndex + 1}/${noParentVersions.length}`;
                      }
                      return '1/1';
                    })()}
                  </span>

                  {/* 右侧指示器 */}
                  {hasNextSibling && (
                    <button
                      className="p-1 text-morandi-gray-500 hover:text-morandi-blue-600 hover:bg-morandi-blue-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchToSibling(version.id, 'next');
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}