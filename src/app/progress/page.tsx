import { writingTools } from '@/data/tools';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import ClientProgress from './client-progress';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回首页
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">学习进度</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <ClientProgress tools={writingTools} />
      </div>
    </div>
  );
}