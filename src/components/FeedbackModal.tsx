'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  feedback: string;
}

export default function FeedbackModal({ isOpen, onClose, content, feedback }: FeedbackModalProps) {
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

          {/* 批改反馈区域 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-morandi-green-50 border-b border-morandi-gray-200">
              <h3 className="font-bold text-morandi-green-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-morandi-green-500 rounded-full"></div>
                AI批改意见
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-morandi-gray-700 whitespace-pre-wrap">
                {feedback || '暂无批改意见'}
              </div>
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