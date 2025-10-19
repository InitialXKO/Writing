'use client';

import { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { ActionItem } from '@/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  feedback: string;
  actionItems?: ActionItem[];
  onActionItemUpdate?: (id: string, completed: boolean) => void;
}

export default function FeedbackModal({ isOpen, onClose, content, feedback, actionItems, onActionItemUpdate }: FeedbackModalProps) {
  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActionItemToggle = (id: string, completed: boolean) => {
    if (onActionItemUpdate) {
      onActionItemUpdate(id, completed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-morandi-gray-200">
          <h2 className="text-2xl font-bold text-morandi-gray-800">AI批改反馈</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-morandi-gray-100 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X className="w-6 h-6 text-morandi-gray-600" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* 原文区域 */}
          <div className="flex-1 border-r border-morandi-gray-200 flex flex-col">
            <div className="p-4 bg-morandi-blue-50 border-b border-morandi-gray-200">
              <h3 className="font-bold text-morandi-blue-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-morandi-blue-500 rounded-full"></div>
                你的原文
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap font-sans text-morandi-gray-700">
                {content}
              </pre>
            </div>
          </div>

          {/* 批改反馈和行动项区域 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-morandi-green-50 border-b border-morandi-gray-200">
              <h3 className="font-bold text-morandi-green-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-morandi-green-500 rounded-full"></div>
                AI批改意见
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-morandi-gray-700 whitespace-pre-wrap mb-6">
                {feedback || '暂无批改意见'}
              </div>

              {/* 行动项区域 */}
              {actionItems && actionItems.length > 0 && (
                <div className="border-t border-morandi-gray-200 pt-6">
                  <h4 className="font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-1 bg-morandi-green-100 rounded-md">
                      <CheckCircle className="w-4 h-4 text-morandi-green-600" />
                    </div>
                    修改任务
                  </h4>
                  <div className="space-y-3">
                    {actionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          item.completed
                            ? 'bg-morandi-green-50 border-morandi-green-200'
                            : 'bg-white border-morandi-gray-200 hover:border-morandi-blue-300'
                        }`}
                      >
                        <button
                          onClick={() => handleActionItemToggle(item.id, !item.completed)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            item.completed
                              ? 'bg-morandi-green-500 text-white'
                              : 'border-2 border-morandi-gray-300 hover:border-morandi-blue-500'
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 bg-morandi-gray-400 rounded-full"></div>
                          )}
                        </button>
                        <span className={`flex-1 ${
                          item.completed
                            ? 'text-morandi-green-800 line-through'
                            : 'text-morandi-gray-700'
                        }`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-morandi-gray-600">
                    完成这些任务后，记得重新提交作文获取新的反馈。
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t border-morandi-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white font-medium rounded-xl transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}