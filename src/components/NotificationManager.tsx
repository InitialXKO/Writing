'use client';

import { useState } from 'react';
import Notification from './Notification';

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}

// 导出通知管理器实例和添加通知的方法
let notificationManager: { addNotification: (notification: Omit<NotificationItem, 'id'>) => void } | null = null;

export const setNotificationManager = (manager: { addNotification: (notification: Omit<NotificationItem, 'id'>) => void }) => {
  notificationManager = manager;
};

export const showNotification = (notification: Omit<NotificationItem, 'id'>) => {
  if (notificationManager) {
    notificationManager.addNotification(notification);
  } else {
    console.warn('Notification manager not initialized');
  }
};