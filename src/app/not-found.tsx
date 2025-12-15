'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-morandi-gray-100 via-white to-morandi-beige-100 p-4">
      <Card className="max-w-md border-morandi-gray-200 shadow-card">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-morandi-gray-300 mb-4">404</div>
          <CardTitle className="text-3xl text-morandi-gray-800">页面未找到</CardTitle>
          <CardDescription className="text-base">
            抱歉，您访问的页面不存在。可能是因为页面已被移除或URL输入有误。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            asChild
            className="bg-morandi-blue-500 hover:bg-morandi-blue-600 text-white shadow-md"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              返回首页
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}