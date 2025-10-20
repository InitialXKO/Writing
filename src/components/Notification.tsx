'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Notification({ type, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-morandi-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-morandi-pink-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-morandi-yellow-600" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-morandi-green-50 border-morandi-green-200';
      case 'error':
        return 'bg-morandi-pink-50 border-morandi-pink-200';
      case 'warning':
        return 'bg-morandi-yellow-50 border-morandi-yellow-200';
      default:
        return 'bg-white border-morandi-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-morandi-green-800';
      case 'error':
        return 'text-morandi-pink-800';
      case 'warning':
        return 'text-morandi-yellow-800';
      default:
        return 'text-morandi-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg transition-all duration-300 transform ${getBackgroundColor()} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className={`flex-1 text-sm font-medium ${getTextColor()}`}>
          {message}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}