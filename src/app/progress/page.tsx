import { writingTools } from '@/data/tools';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import ClientProgress from './client-progress';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-neutral-200">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
              >
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                返回首页
              </Link>
              <h1 className="text-2xl font-bold text-neutral-800">学习进度</h1>
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