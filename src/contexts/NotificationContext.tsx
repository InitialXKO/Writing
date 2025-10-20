'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useNotification } from '@/lib/hooks/useNotification';
import Notification from '@/components/Notification';

interface NotificationContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotification();

  const showSuccess = (message: string, duration?: number) => {
    addNotification({ type: 'success', message, duration });
  };

  const showError = (message: string, duration?: number) => {
    addNotification({ type: 'error', message, duration });
  };

  const showWarning = (message: string, duration?: number) => {
    addNotification({ type: 'warning', message, duration });
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}