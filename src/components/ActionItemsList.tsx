'use client';

import { useState } from 'react';
import { ActionItem } from '@/types';
import { CheckCircle, Circle } from 'lucide-react';

interface ActionItemProps {
  item: ActionItem;
  onUpdate: (id: string, completed: boolean) => void;
}

function ActionItemComponent({ item, onUpdate }: ActionItemProps) {
  const handleToggle = () => {
    onUpdate(item.id, !item.completed);
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        item.completed
          ? 'bg-morandi-green-50 border-morandi-green-200'
          : 'bg-white border-morandi-gray-200 hover:border-morandi-blue-300'
      }`}
    >
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          item.completed
            ? 'bg-morandi-green-500 text-white'
            : 'border-2 border-morandi-gray-300 hover:border-morandi-blue-500'
        }`}
      >
        {item.completed ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
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
  );
}

interface ActionItemsListProps {
  items: ActionItem[];
  onUpdate: (id: string, completed: boolean) => void;
}

export default function ActionItemsList({ items, onUpdate }: ActionItemsListProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-morandi-gray-800 flex items-center gap-2">
          <div className="p-2 bg-morandi-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-morandi-green-600" />
          </div>
          行动任务
        </h3>
        <div className="text-sm font-medium text-morandi-gray-600">
          {completedCount}/{items.length} 完成
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ActionItemComponent
            key={item.id}
            item={item}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {completedCount === items.length && items.length > 0 && (
        <div className="mt-4 p-3 bg-morandi-green-50 border border-morandi-green-200 rounded-lg text-center">
          <p className="text-morandi-green-800 font-medium">
            恭喜！所有任务都已完成 🎉
          </p>
        </div>
      )}
    </div>
  );
}