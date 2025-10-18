'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-morandi-gray-100">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl font-bold text-morandi-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-morandi-gray-800 mb-4">页面未找到</h1>
        <p className="text-morandi-gray-600 mb-8">
          抱歉，您访问的页面不存在。可能是因为页面已被移除或URL输入有误。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          返回首页
        </Link>
      </div>
    </div>
  );
}