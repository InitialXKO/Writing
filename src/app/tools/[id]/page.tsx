import { writingTools } from '@/data/tools';
import ToolPageClient from './tool-page-client';

// 为静态导出生成所有可能的路径
export async function generateStaticParams() {
  return writingTools.map((tool) => ({
    id: tool.id,
  }));
}

export default function ToolPage({ params }: { params: { id: string } }) {
  return <ToolPageClient params={params} />;
}