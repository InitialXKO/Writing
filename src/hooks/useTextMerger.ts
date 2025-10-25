'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { getActualEndpoint } from '@/lib/utils';

interface SegmentData {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface MergeResult {
  mergedText: string;
  wordCount: number;
  processingTime: number;
}

interface UseTextMergerReturn {
  isMerging: boolean;
  mergeResult: MergeResult | null;
  mergeSegments: (segments: SegmentData[]) => Promise<void>;
  resetMerge: () => void;
}

export const useTextMerger = (): UseTextMergerReturn => {
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const { aiConfig } = useAppStore();

  const mergeSegments = useCallback(async (segments: SegmentData[]) => {
    if (segments.length === 0) {
      setMergeResult({
        mergedText: '',
        wordCount: 0,
        processingTime: 0
      });
      return;
    }

    if (segments.length === 1) {
      const text = segments[0].text;
      setMergeResult({
        mergedText: text,
        wordCount: text.length,
        processingTime: 0
      });
      return;
    }

    setIsMerging(true);
    const startTime = Date.now();

    try {
      // 如果有AI配置，使用AI合并文本
      if (aiConfig?.apiKey) {
        const mergedText = await mergeTextsWithAI(segments, aiConfig);
        const processingTime = Date.now() - startTime;

        setMergeResult({
          mergedText,
          wordCount: mergedText.length,
          processingTime
        });
      } else {
        // 如果没有AI配置，使用简单的文本拼接并去重叠
        const mergedText = mergeTextSegments(segments);
        const processingTime = Date.now() - startTime;

        setMergeResult({
          mergedText,
          wordCount: mergedText.length,
          processingTime
        });
      }
    } catch (error) {
      console.error('文本合并出错:', error);
      // 出错时使用简单拼接作为备选方案
      const mergedText = mergeTextSegments(segments);
      const processingTime = Date.now() - startTime;

      setMergeResult({
        mergedText,
        wordCount: mergedText.length,
        processingTime
      });
    } finally {
      setIsMerging(false);
    }
  }, [aiConfig]);

  const resetMerge = useCallback(() => {
    setMergeResult(null);
    setIsMerging(false);
  }, []);

  return {
    isMerging,
    mergeResult,
    mergeSegments,
    resetMerge
  };
};

// 使用AI合并文本段落
const mergeTextsWithAI = async (segments: SegmentData[], aiConfig: any): Promise<string> => {
  // 构建提示词
  let prompt = `你是一个专业的文本编辑器，请将以下语音识别的文本片段合并成一篇连贯、通顺的文章。注意以下几点：
1. 相邻片段可能有重叠内容，请识别并去除重复部分
2. 保持原文的语义完整性
3. 确保文章的逻辑连贯性
4. 不要添加任何额外的内容，只做合并和去重处理
5. 保持语言的自然流畅性

以下是文本片段：\n\n`;

  segments.forEach((segment, index) => {
    prompt += `片段${index + 1}（${segment.startTime}ms-${segment.endTime}ms）:\n${segment.text}\n\n`;
  });

  prompt += `请提供合并后的完整文本：`;

  try {
    // 调用AI API
    const endpoint = getActualEndpoint(aiConfig.baseURL);
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文本编辑器，擅长处理语音识别文本的合并和优化。请仔细分析相邻片段的重叠部分，确保合并后的文本自然流畅。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI合并文本失败:', error);
    // 如果AI合并失败，回退到简单合并
    return mergeTextSegments(segments);
  }
};

// 简单的文本段落合并（去重叠）
const mergeTextSegments = (segments: SegmentData[]): string => {
  if (segments.length === 0) return '';
  if (segments.length === 1) return segments[0].text;

  let mergedText = segments[0].text;

  for (let i = 1; i < segments.length; i++) {
    const currentText = segments[i].text;

    // 简单的重叠检测和去除
    const overlap = findOverlap(mergedText, currentText);
    if (overlap) {
      mergedText += currentText.substring(overlap.length);
    } else {
      // 如果没有检测到重叠，简单连接
      mergedText += ' ' + currentText;
    }
  }

  return mergedText;
};

// 简单的重叠文本检测
const findOverlap = (text1: string, text2: string): string | null => {
  // 从text2的开始部分查找与text1结尾部分的重叠
  const minLength = Math.min(text1.length, text2.length, 50); // 最多检查50个字符

  for (let i = minLength; i > 0; i--) {
    const suffix = text1.slice(-i);
    const prefix = text2.slice(0, i);

    // 简单的文本匹配（可以进一步优化）
    if (suffix === prefix) {
      return suffix;
    }
  }

  return null;
};