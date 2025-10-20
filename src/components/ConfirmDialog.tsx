'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消'
}: ConfirmDialogProps) {
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
    <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto md:flex md:items-center md:justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-morandi-gray-200">
          <h2 className="text-xl font-bold text-morandi-gray-800">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-morandi-gray-100 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-morandi-gray-600" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="text-morandi-gray-700 whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="p-6 border-t border-morandi-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-morandi-gray-600 hover:text-morandi-gray-800 font-medium rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}