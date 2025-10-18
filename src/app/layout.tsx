import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '六年级作文成长手册',
  description: '游戏化作文学习平台 - 在规则内说真话',
  keywords: ['作文', '六年级', '写作', '语文学习', '游戏化学习'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
          {children}
        </div>
      </body>
    </html>
  );
}