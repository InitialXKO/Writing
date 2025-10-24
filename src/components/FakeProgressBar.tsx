'use client';

import { useState, useEffect, useRef } from 'react';

interface FakeProgressBarProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export default function FakeProgressBar({ isActive, onComplete, duration = 3000 }: FakeProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      // 重置进度
      setProgress(0);

      // 计算每100ms增加的进度百分比
      const increment = 100 / (duration / 100);

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + increment;

          // 如果进度达到100%，清理interval并调用onComplete
          if (newProgress >= 100) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (onComplete) {
              onComplete();
            }
            return 100;
          }

          return newProgress;
        });
      }, 100);
    } else {
      // 如果不活跃，清理interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setProgress(0);
    }

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onComplete, duration]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full bg-morandi-gray-200 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-morandi-purple-500 to-morandi-blue-500 h-2.5 rounded-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}