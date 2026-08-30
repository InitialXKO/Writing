'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@gradio/client';
import { useAppStore, generateActionItems } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { writingTools } from '@/data/tools';
import { getActualEndpoint } from '@/lib/utils';
import { Essay, EssayVersion, AIConfig } from '@/types';
import { ArrowLeft, Save, Sparkles, Edit3, Lightbulb, Zap, CheckCircle, Mic, Volume2 } from 'lucide-react';
import Link from 'next/link';
import FeedbackModal from '@/components/FeedbackModal';
import ActionItemsList from '@/components/ActionItemsList';
import CompositionPaper from '@/components/CompositionPaper';
import MediaInput, { AudioCaptureResult } from '@/components/MediaInput';
import { useNotificationContext } from '@/contexts/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import VoiceRecognitionPanel from '@/components/VoiceRecognitionPanel';

interface VersionNode extends EssayVersion {
  order: number;
  children: VersionNode[];
}

const getTimestamp = (value: Date | string): number => {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
};

// 在文本中找到指定内容的位置
const findTextPosition = (content: string, text: string): { before: string; after: string } | null => {
  if (!content || !text) return null;

  const index = content.indexOf(text);
  if (index === -1) return null;

  // 获取内容前后的上下文
  const beforeContext = content.substring(0, index).trim().split('\n').slice(-2).join(' ');
  const afterContext = content.substring(index + text.length).trim().split('\n').slice(0, 2).join(' ');

  return {
    before: beforeContext || '[开头]',
    after: afterContext || '[结尾]'
  };
};

// 计算两个版本之间的文本差异（增强实现）
const calculateTextDiff = (oldContent: string, newContent: string, useDetailedDiff: boolean = true): { added: string[]; removed: string[]; modified: string[]; shouldUseFullContent: boolean } => {
  if (!oldContent && !newContent) {
    return { added: [], removed: [], modified: [], shouldUseFullContent: false };
  }

  if (!oldContent) {
    return { added: [newContent], removed: [], modified: [], shouldUseFullContent: true };
  }

  if (!newContent) {
    return { added: [], removed: [oldContent], modified: [], shouldUseFullContent: true };
  }

  // 简单的行级差异检测
  const oldLines = oldContent.split('\n').filter(line => line.trim());
  const newLines = newContent.split('\n').filter(line => line.trim());

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  // 如果不需要详细差异，直接返回
  if (!useDetailedDiff) {
    return { added, removed, modified, shouldUseFullContent: true };
  }

  // 找出新增的行
  newLines.forEach(line => {
    if (!oldLines.includes(line) && line.trim()) {
      // 只取行的前20个字符作为标识
      added.push(line.substring(0, 20) + (line.length > 20 ? '...' : ''));
    }
  });

  // 找出删除的行
  oldLines.forEach(line => {
    if (!newLines.includes(line) && line.trim()) {
      // 只取行的前20个字符作为标识
      removed.push(line.substring(0, 20) + (line.length > 20 ? '...' : ''));
    }
  });

  // 简单的修改检测（在同一位置的行如果有变化则视为修改）
  for (let i = 0; i < Math.min(oldLines.length, newLines.length); i++) {
    if (oldLines[i] !== newLines[i] && oldLines[i].trim() && newLines[i].trim()) {
      // 只取行的前20个字符作为标识
      modified.push(`行${i + 1}: "${oldLines[i].substring(0, 10)}" → "${newLines[i].substring(0, 10)}"`);
    }
  }

  // 计算差异描述的总长度
  const diffDescriptionLength =
    added.join('').length +
    removed.join('').length +
    modified.join('').length;

  // 如果差异描述长度接近或大于原文长度，建议使用完整内容
  const shouldUseFullContent = diffDescriptionLength >= oldContent.length * 0.8;

  return { added, removed, modified, shouldUseFullContent };
};

// 将文本分割成段落作为关键位置
const splitTextIntoSegments = (content: string): string[] => {
  if (!content) return [];

  // 按段落分割（两个换行符）
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  // 如果段落太少，按单个换行符分割
  if (paragraphs.length < 3) {
    return content.split('\n').filter(p => p.trim());
  }

  return paragraphs;
};

// 生成内容位置的自然语言描述
const generatePositionDescription = (content: string, target: string): string => {
  if (!content || !target) return '[未知位置]';

  // 使用findTextPosition获取精确的前后上下文
  const position = findTextPosition(content, target);
  if (!position) return '[位置未找到]';

  // 使用splitTextIntoSegments将文本分割成关键位置以获得更自然的描述
  const segments = splitTextIntoSegments(content);

  // 找到目标内容在哪个段落
  let targetIndex = -1;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].includes(target)) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    // 如果在段落中找不到，使用findTextPosition的结果
    if (position.before === '[开头]' && position.after === '[结尾]') {
      return '[开头部分]';
    } else if (position.before === '[开头]') {
      return `"${position.after.substring(0, 15)}"之前`;
    } else if (position.after === '[结尾]') {
      return `"${position.before.substring(0, 15)}"之后`;
    } else {
      return `"${position.before.substring(0, 15)}"和"${position.after.substring(0, 15)}"之间`;
    }
  }

  // 生成位置描述
  const beforeSegment = targetIndex > 0 ? segments[targetIndex - 1].substring(0, 15) : '[开头]';
  const afterSegment = targetIndex < segments.length - 1 ? segments[targetIndex + 1].substring(0, 15) : '[结尾]';

  // 如果是开头或结尾，使用不同的描述
  if (targetIndex === 0 && segments.length === 1) {
    return '[开头部分]';
  } else if (targetIndex === 0) {
    return `"${afterSegment}"之前`;
  } else if (targetIndex === segments.length - 1) {
    return `"${beforeSegment}"之后`;
  } else {
    return `"${beforeSegment}"和"${afterSegment}"之间`;
  }
};

const formatDateTime = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  // 使用本地化格式而不是UTC格式
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const buildVersionNodes = (versions: EssayVersion[]): { roots: VersionNode[]; nodeMap: Map<string, VersionNode> } => {
  const nodeMap = new Map<string, VersionNode>();
  // 基于创建时间排序，确保 order 反映时间顺序
  const sortedVersions = [...versions].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  sortedVersions.forEach((version, index) => {
    nodeMap.set(version.id, {
      ...version,
      order: index + 1,
      children: [],
    });
  });

  nodeMap.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    }
  });

  const sortNodes = (nodes: VersionNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(child => sortNodes(child.children));
  };

  const roots: VersionNode[] = [];
  nodeMap.forEach(node => {
    if (!node.parentId || !nodeMap.has(node.parentId)) {
      roots.push(node);
    }
  });

  sortNodes(roots);

  return { roots, nodeMap };
};

const formatVersionNode = (node: VersionNode, nodeMap: Map<string, VersionNode>, depth = 0): string => {
  const indent = '  '.repeat(depth);
  const createdAt = formatDateTime(node.createdAt);
  const parentOrder = node.parentId ? nodeMap.get(node.parentId)?.order : undefined;

  let result = `${indent}- 版本 ${node.order}`;
  if (parentOrder) {
    result += `（基于版本 ${parentOrder}）`;
  }
  if (createdAt) {
    result += `\n${indent}  创建时间：${createdAt}`;
  }

  // 确保 content 是字符串，避免 null 或 undefined 导致的错误
  const content = node.content ?? '';
  const indentedContent = content.replace(/\n/g, `\n${indent}  `);
  result += `\n${indent}  内容：\n${indent}  ${indentedContent}`;

  if (node.children.length > 0) {
    const childrenText = node.children.map(child => formatVersionNode(child, nodeMap, depth + 1)).join('\n');
    result += `\n${childrenText}`;
  }

  return result;
};

// 获取最新版本信息（保留用于向后兼容）
const prepareEssayHistoryData = (essay: Essay, maxVersions = 10) => {
  let versions = essay.versions ?? [];

  if (versions.length === 0) {
    return {
      latestLabel: '当前内容',
      latestContent: essay.content,
      formattedHistory: `该作文目前只有一个版本。\n内容：\n${essay.content}`,
    };
  }

  // 限制版本数量，只取最近的N个版本
  if (versions.length > maxVersions) {
    versions = [...versions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxVersions);
  }

  const latestVersion = versions.reduce((latest, current) => {
    const latestTime = getTimestamp(latest.createdAt);
    const currentTime = getTimestamp(current.createdAt);
    if (currentTime > latestTime) {
      return current;
    }
    return latest;
  }, versions[0]);

  const latestOrder = versions.findIndex(v => v.id === latestVersion.id) + 1;

  return {
    latestLabel: `版本 ${latestOrder}`,
    latestContent: latestVersion.content,
    formattedHistory: '', // 不再生成完整的格式化历史，因为我们使用了简化版本
  };
};

// 生成简化版本历史，优化上下文长度
const generateSimplifiedVersionHistory = (essay: Essay): string => {
  const versions = essay.versions ?? [];

  if (versions.length === 0) {
    return `该作文目前只有一个版本。\n内容：\n${essay.content}`;
  }

  // 按创建时间排序版本
  const sortedVersions = [...versions].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 如果只有一个版本，直接返回完整内容
  if (sortedVersions.length === 1) {
    const version = sortedVersions[0];
    return `版本1：[完整内容]\n${version.content}`;
  }

  // 生成版本演进描述
  let result = '版本演进：\n';

  // 第一版显示完整内容
  const firstVersion = sortedVersions[0];
  result += `- 版本1：[完整内容]\n${firstVersion.content}\n\n`;

  // 中间版本显示差异（使用精确位置描述）
  for (let i = 1; i < sortedVersions.length - 1; i++) {
    const currentVersion = sortedVersions[i];
    const parentVersion = currentVersion.parentId
      ? sortedVersions.find(v => v.id === currentVersion.parentId)
      : sortedVersions[i - 1];

    const parentOrder = parentVersion
      ? sortedVersions.indexOf(parentVersion) + 1
      : i;

    if (parentVersion) {
      // 使用calculateTextDiff计算差异
      const diff = calculateTextDiff(parentVersion.content, currentVersion.content);

      // 如果差异描述长度接近或大于原文长度，直接使用完整内容
      if (diff.shouldUseFullContent) {
        result += `- 版本${i + 1}：基于版本${parentOrder}，内容有较大变化\n${currentVersion.content}\n`;
      } else {
        const removedItems: string[] = [];
        const addedItems: string[] = [];
        const modifiedItems: string[] = [];

        // 处理删除的行
        diff.removed.forEach(removedLine => {
          if (removedLine.trim()) {
            // 为删除的行生成位置描述
            const positionDesc = generatePositionDescription(parentVersion.content, removedLine.substring(0, 20));
            removedItems.push(`${positionDesc}删除"${removedLine.substring(0, 20) + (removedLine.length > 20 ? '...' : '')}"`);
          }
        });

        // 处理新增的行
        diff.added.forEach(addedLine => {
          if (addedLine.trim()) {
            // 为新增的行生成位置描述
            const positionDesc = generatePositionDescription(currentVersion.content, addedLine.substring(0, 20));
            addedItems.push(`${positionDesc}新增"${addedLine.substring(0, 20) + (addedLine.length > 20 ? '...' : '')}"`);
          }
        });

        // 处理修改的行
        diff.modified.forEach(modifiedLine => {
          modifiedItems.push(`修改${modifiedLine}`);
        });

        let diffDescription = '';
        if (removedItems.length > 0) {
          diffDescription += removedItems.join('，');
          if (removedItems.length > 1) {
            diffDescription += `等${removedItems.length}处`;
          }
        }
        if (addedItems.length > 0) {
          if (diffDescription) diffDescription += '，';
          diffDescription += addedItems.join('，');
          if (addedItems.length > 1) {
            diffDescription += `等${addedItems.length}处`;
          }
        }
        if (modifiedItems.length > 0) {
          if (diffDescription) diffDescription += '，';
          diffDescription += modifiedItems.join('，');
          if (modifiedItems.length > 1) {
            diffDescription += `等${modifiedItems.length}处`;
          }
        }

        if (diffDescription) {
          result += `- 版本${i + 1}：基于版本${parentOrder}，${diffDescription}\n`;
        } else {
          result += `- 版本${i + 1}：基于版本${parentOrder}\n`;
        }
      }
    } else {
      result += `- 版本${i + 1}：基于版本${parentOrder}\n`;
    }

    result += '\n';
  }

  // 最后一版显示完整内容
  const lastVersion = sortedVersions[sortedVersions.length - 1];
  const lastOrder = sortedVersions.length;
  result += `- 版本${lastOrder}：[完整内容]\n${lastVersion.content}`;

  return result;
};

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const POLLINATIONS_DEFAULT_MODELS = ['openai', 'mistral', 'llama'] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const AUTO_TITLE_FALLBACKS = ['习作', '小练笔', '随笔练习', '课堂小记'];

const normalizeWhitespace = (text: string): string =>
  text.replace(/\u3000/g, ' ').replace(/\s+/g, ' ').trim();

const cleanSentenceEdges = (text: string): string =>
  text.replace(/^[“"『「《【（(]+/, '').replace(/[”"』」》】）)]+$/, '').trim();

const stripEnumerations = (text: string): string =>
  text.replace(/^[\d一二三四五六七八九十]+[\.、．-]\s*/u, '').replace(/^[(（][^)）]*[)）]/u, '').trim();

const stripPunctuation = (text: string): string =>
  text
    .replace(/[。！？!?、，,；;:：…·—\-~“”"‘’'《》〈〉【】（）()「」\[\]]/gu, '')
    .replace(/\s+/g, '')
    .trim();

const deriveAutoTitleCandidate = (segment: string): string | null => {
  if (!segment) return null;
  let candidate = cleanSentenceEdges(segment);
  candidate = stripEnumerations(candidate);
  if (!candidate) return null;

  const leadingPhrases = ['今天', '那天', '那次', '这次', '有一次', '记得', '后来', '当时', '我们的', '我的', '我和', '我觉得', '我喜欢', '这是一次', '一次'];
  for (const phrase of leadingPhrases) {
    if (candidate.startsWith(phrase) && candidate.length - phrase.length >= 2) {
      candidate = candidate.slice(phrase.length);
      break;
    }
  }

  candidate = stripPunctuation(candidate);
  if (!candidate) return null;

  if (candidate.length > 14) {
    candidate = candidate.slice(0, 14);
  }

  if (candidate.length < 2) {
    return null;
  }

  if (/^\d+$/u.test(candidate)) {
    return null;
  }

  return candidate;
};

const scoreAutoTitleCandidate = (candidate: string, rawSegment: string): number => {
  let score = 0;
  const length = candidate.length;

  if (length >= 4 && length <= 8) {
    score += 3;
  } else if (length >= 3 && length <= 12) {
    score += 2;
  } else if (length >= 2) {
    score += 1;
  }

  const uniqueChars = new Set(candidate).size;
  score += Math.min(uniqueChars, 6) * 0.3;

  if (/[，、]/u.test(rawSegment)) {
    score -= 0.3;
  }

  if (/^[\d一二三四五六七八九十]+[\.、]/u.test(rawSegment.trim())) {
    score -= 0.5;
  }

  if (rawSegment.length > 40) {
    score -= 0.2;
  }

  return score;
};

const generateAutomaticTitle = (content: string): { title: string; isFallback: boolean } => {
  const normalized = normalizeWhitespace(content || '');
  if (!normalized) {
    return { title: AUTO_TITLE_FALLBACKS[0], isFallback: true };
  }

  const segments = normalized
    .split(/[\r\n]+/)
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => line.split(/(?<=[。！？!?])/u))
    .map(segment => segment.trim())
    .filter(Boolean);

  let bestCandidate: { title: string; score: number } | null = null;

  for (const segment of segments) {
    const candidate = deriveAutoTitleCandidate(segment);
    if (!candidate) continue;
    const score = scoreAutoTitleCandidate(candidate, segment);
    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = { title: candidate, score };
    }
  }

  if (bestCandidate && bestCandidate.score >= 1.5) {
    return { title: bestCandidate.title, isFallback: false };
  }

  const fallbackIndex = normalized.length % AUTO_TITLE_FALLBACKS.length;
  return { title: AUTO_TITLE_FALLBACKS[fallbackIndex], isFallback: true };
};

const callOpenAIChatCompletion = async (
  messages: ChatMessage[],
  config: AIConfig,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> => {
  const { temperature = 0.7, maxTokens = 1500 } = options;
  const endpoint = getActualEndpoint(config.baseURL);
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API请求失败: ${response.status} ${response.statusText}\n响应内容: ${errorText.substring(0, 200)}...`
    );
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    throw new Error(
      `API返回非JSON响应，内容类型: ${contentType || 'unknown'}\n响应内容预览: ${responseText.substring(
        0,
        200
      )}...`
    );
  }

  const data = await response.json();

  if (!data?.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error('API响应结构不符合预期，缺少choices字段');
  }

  const content = data.choices[0]?.message?.content;
  if (!isNonEmptyString(content)) {
    throw new Error('AI响应内容为空或格式不正确');
  }

  return content;
};

const callPollinationsChatWithFallback = async (
  messages: ChatMessage[],
  options: {
    preferredModel?: string;
    fallbackModels?: string[];
    seed?: number;
    timeoutMs?: number;
    maxRetries?: number;
  } = {}
): Promise<{ content: string; model: string }> => {
  const { preferredModel, fallbackModels, seed = 42, timeoutMs, maxRetries = 2 } = options;

  const orderedModels = Array.from(
    new Set(
      [preferredModel, ...(fallbackModels ?? []), ...POLLINATIONS_DEFAULT_MODELS].filter(isNonEmptyString)
    )
  );

  const primaryModel = orderedModels[0] ?? 'openai';
  const secondaryModels = orderedModels.slice(1);

  const executeRequest = async (attempt: number): Promise<{ content: string; model: string }> => {
    const pollinationsApiKey = useAppStore.getState().aiConfig?.pollinationsApiKey;
    const response = await fetch('/api/pollinations/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        seed,
        model: primaryModel,
        fallbackModels: secondaryModels,
        timeoutMs,
        jsonMode: false,
        apiKey: pollinationsApiKey,
      }),
    });

    if (response.status === 429 && attempt < maxRetries) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const parsedRetryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN;
      const waitMs = Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0 ? parsedRetryAfter * 1000 : 3000;
      const waitSeconds = Math.max(1, Math.round(waitMs / 1000));
      console.info(
        `[Pollinations] 命中速率限制，${waitSeconds} 秒后重试（第 ${attempt + 1} 次重试）`
      );
      await sleep(waitMs);
      return executeRequest(attempt + 1);
    }

    const text = await response.text();
    let data: { content?: string; model?: string; error?: string; retryAfter?: string | number } | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Pollinations代理返回的响应无法解析: ${text.substring(0, 200)}...`);
    }

    if (!response.ok) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const fallbackRetryAfter =
        data?.retryAfter && Number.isFinite(Number(data.retryAfter)) ? String(data.retryAfter) : undefined;
      const retryAfter = retryAfterHeader || fallbackRetryAfter;
      const errorMessage = data?.error || 'Pollinations代理请求失败';
      if (retryAfter) {
        throw new Error(`${errorMessage}（请在 ${retryAfter} 秒后重试）`);
      }
      throw new Error(errorMessage);
    }

    if (!data || !isNonEmptyString(data.content)) {
      throw new Error('Pollinations代理未返回有效的内容');
    }

    return { content: data.content, model: data.model ?? primaryModel };
  };

  return executeRequest(0);
};

function WriteContent() {
  const { addEssay, updateEssay, addEssayVersion, updateEssayVersion, essays, aiConfig, progress, setDailyChallenge, updateHabitTracker } = useAppStore();
  const { showSuccess, showError, showWarning } = useNotificationContext();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmDialogProps, setConfirmDialogProps] = useState({ title: '', message: '' });
  const [isSaving, setIsSaving] = useState(false); // 防止并发保存
  const [isGenerating, setIsGenerating] = useState(false); // 防止并发AI生成
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTool, setSelectedTool] = useState('free-writing');
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingEssayId, setEditingEssayId] = useState<string | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);

  // 媒体输入相关状态
  const [contentType, setContentType] = useState<'text' | 'image' | 'audio'>('text');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const recognitionAbortControllerRef = useRef<AbortController | null>(null);

  // 计算已解锁练习的工具（自由写作始终可选）
  const availablePracticeTools = writingTools.filter(tool => {
    if (tool.id === 'free-writing') return true;
    const level = progress.levels.find(l => l.toolId === tool.id);
    return !!level?.testPassed;
  });

  const clearMediaState = () => {
    setContentType('text');
    setImageUrl('');
    setAudioUrl('');
    setTranscribedText('');
    setIsRecognizing(false);
  };

  const handleCancelRecognition = () => {
    console.log('→ 取消图片识别');
    if (recognitionAbortControllerRef.current) {
      recognitionAbortControllerRef.current.abort();
      recognitionAbortControllerRef.current = null;
    }
    setIsRecognizing(false);
    clearMediaState();
    if (typeof showWarning === 'function') {
      showWarning('已取消识别');
    }
  };

  // 使用 Pollinations Vision API 进行 OCR（降级方案）
  const recognizeWithPollinations = async (base64Image: string, signal: AbortSignal): Promise<string> => {
    console.log('→ 尝试使用 Pollinations Vision API 进行 OCR...');
    const pollinationsApiKey = useAppStore.getState().aiConfig?.pollinationsApiKey;
    const response = await fetch('/api/pollinations/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl: base64Image,
        prompt: '请识别这张图片中的所有手写文字，直接输出识别的文字内容，不要添加任何解释或格式。',
        maxTokens: 800,
        timeoutMs: 45000,
        apiKey: pollinationsApiKey,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(error.error || `Pollinations Vision API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const rawText = (data.description || '').trim();
    
    if (!rawText) {
      throw new Error('Pollinations Vision API 未返回识别结果');
    }

    const normalizedText = rawText
      .replace(/```[\s\S]*?```/g, (block: string) => block.replace(/```/g, '').trim())
      .replace(/^[#>*\-\s]+/gm, (line: string) => line.replace(/^[#>*\-\s]+/, ''))
      .replace(/^(?:OCR|识别|内容)(?:结果)?[:：]\s*/gi, '')
      .replace(/\r/g, '')
      .trim();

    if (!normalizedText) {
      throw new Error('Pollinations Vision API 返回的内容为空');
    }

    console.log('✓ Pollinations Vision API 识别成功，文本长度:', normalizedText.length);
    return normalizedText;
  };

  // 处理图片上传或拍摄
  const handleImageCapture = async (base64Image: string) => {
    if (recognitionAbortControllerRef.current) {
      recognitionAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    recognitionAbortControllerRef.current = abortController;

    const GRADIO_TIMEOUT = 30000;
    let gradioTimeoutHandle: NodeJS.Timeout | null = null;

    try {
      setImageUrl(base64Image);
      setAudioUrl('');
      setContentType('image');
      setTranscribedText('');

      setIsRecognizing(true);
      if (typeof showWarning === 'function') {
        showWarning('正在识别手写作文，请稍候...');
      }

      console.log('→ 开始图片识别（优先使用 Gradio OCR）');
      const response = await fetch(base64Image, { signal: abortController.signal });
      const imageBlob = await response.blob();
      console.log('✓ 图片加载完成，准备处理分辨率...');

      if (abortController.signal.aborted) {
        throw new DOMException('识别已取消', 'AbortError');
      }

      const MAX_DIMENSION = 800;
      let processedBlob = imageBlob;

      try {
        const imageBitmap = await createImageBitmap(imageBlob);
        const originalWidth = imageBitmap.width;
        const originalHeight = imageBitmap.height;

        if (originalWidth > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / originalWidth;
          const targetWidth = Math.round(originalWidth * scale);
          const targetHeight = Math.round(originalHeight * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

            const downsampledBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Downsampling failed'));
                  }
                },
                'image/jpeg',
                0.92
              );
            });

            processedBlob = downsampledBlob;
            console.log('✓ 图片已下采样:', {
              originalWidth,
              originalHeight,
              targetWidth,
              targetHeight,
              originalSize: imageBlob.size,
              downsampledSize: downsampledBlob.size,
            });
          }
        }
      } catch (downsampleError) {
        console.warn('⚠ 图片下采样失败，使用原图继续:', downsampleError);
      }

      const imageFile = new File([processedBlob], `handwriting-${Date.now()}.jpg`, {
        type: processedBlob.type || 'image/jpeg'
      });
      console.log('✓ 图片准备完成，连接 OCR 服务...');

      let recognizedText = '';
      let usedFallback = false;

      try {
        const client = await Client.connect('axiilay/DeepSeek-OCR-Demo');
        console.log('✓ OCR 服务已连接，开始识别...');

        if (abortController.signal.aborted) {
          throw new DOMException('识别已取消', 'AbortError');
        }

        const gradioPromise = client.predict('/process_image', {
          image: imageFile,
          model_size: 'Tiny',
          task_type: 'Free OCR',
          is_eval_mode: true,
        });

        const timeoutPromise = new Promise((_, reject) => {
          gradioTimeoutHandle = setTimeout(() => {
            console.warn('⚠ Gradio OCR 超时，准备降级到 Pollinations Vision API');
            reject(new Error('Gradio OCR 超时'));
          }, GRADIO_TIMEOUT);
        });

        const result = await Promise.race([gradioPromise, timeoutPromise]);

        if (gradioTimeoutHandle) {
          clearTimeout(gradioTimeoutHandle);
          gradioTimeoutHandle = null;
        }

        if (abortController.signal.aborted) {
          throw new DOMException('识别已取消', 'AbortError');
        }

        console.log('✓ Gradio OCR 识别完成，处理结果...');
        const data = Array.isArray((result as { data?: unknown }).data)
          ? ((result as { data: unknown[] }).data)
          : [];

        const markdownText = typeof data[1] === 'string' ? data[1] : '';
        const plainText = typeof data[2] === 'string' ? data[2] : '';
        recognizedText = (plainText || markdownText || '').trim();

        if (!recognizedText) {
          throw new Error('Gradio OCR 未返回识别结果');
        }

        console.log('✓ Gradio OCR 识别成功，文本长度:', recognizedText.length);
      } catch (gradioError) {
        if (gradioTimeoutHandle) {
          clearTimeout(gradioTimeoutHandle);
          gradioTimeoutHandle = null;
        }

        if (gradioError instanceof DOMException && gradioError.name === 'AbortError') {
          throw gradioError;
        }

        console.warn('⚠ Gradio OCR 失败，降级到 Pollinations Vision API:', gradioError);
        
        if (typeof showWarning === 'function') {
          showWarning('主识别服务失败，正在尝试备用识别方案...');
        }

        usedFallback = true;

        try {
          recognizedText = await recognizeWithPollinations(base64Image, abortController.signal);
        } catch (pollinationsError) {
          console.error('✗ Pollinations Vision API 也失败了:', pollinationsError);
          throw new Error(`所有识别方案都失败了。主服务错误: ${gradioError instanceof Error ? gradioError.message : '未知错误'}，备用服务错误: ${pollinationsError instanceof Error ? pollinationsError.message : '未知错误'}`);
        }
      }

      if (recognizedText) {
        setTranscribedText(recognizedText);

        const currentContent = content.trim();
        
        if (typeof showWarning === 'function') {
          showWarning('正在智能校正标点和错别字...');
        }

        try {
          let promptContent: string;
          
          if (currentContent) {
            // 稿纸有内容，让AI合并并去重
            promptContent = `你是小学六年级作文指导老师。现在学生通过拍照手写作文继续写作。

稿纸已有内容：
${currentContent}

新识别的手写内容：
${recognizedText}

请完成以下任务：
1. 仔细对比两段内容，识别出哪些是重复的，哪些是新增的
2. 如果手写内容包含了稿纸已有的部分，只保留新增的部分
3. 将新增内容接在稿纸内容后面，形成完整连贯的文章
4. 校正标点符号（确保句号、逗号、问号等使用正确）
5. 纠正明显的OCR识别错误和同音字错误
6. 严格保持学生原有的语气、用词和表达方式
7. 不要改变文章的意思和风格

重要：只输出校正后的完整文章内容，不要重复内容，不要添加任何解释或评论。`;
          } else {
            // 稿纸为空，只需校正新内容
            promptContent = `请对以下手写文字识别文本进行校正：

${recognizedText}

要求：
1. 校正标点符号
2. 纠正明显的OCR识别错误和同音字错误
3. 保持原有语气和表达方式
4. 只输出校正后的文本，不要添加解释

校正后的文本：`;
          }

          const messages: ChatMessage[] = [
            {
              role: 'system',
              content: '你是一位小学六年级作文指导老师，擅长校正标点符号和OCR识别错误，同时严格保持学生原有的语气和表达方式。',
            },
            {
              role: 'user',
              content: promptContent,
            },
          ];

          const usingCustomApi = isNonEmptyString(aiConfig?.apiKey);
          let correctedText: string;

          if (usingCustomApi && aiConfig) {
            correctedText = await callOpenAIChatCompletion(messages, aiConfig, {
              temperature: 0.3,
              maxTokens: 2000,
            });
          } else {
            const { content: pollinationsResponse } = await callPollinationsChatWithFallback(messages, {
              preferredModel: 'openai',
            });
            correctedText = pollinationsResponse;
          }

          const finalText = correctedText.trim();
          console.log('✓ AI校正完成，原文长度:', currentContent.length, '识别长度:', recognizedText.length, '结果长度:', finalText.length);
          setContent(finalText);
          setTranscribedText(finalText);

          const method = usedFallback ? '（使用备用识别方案）' : '';
          if (typeof showSuccess === 'function') {
            showSuccess(`手写文字识别成功${method}，已智能校正！`);
          }
        } catch (error) {
          console.error('AI校正失败:', error);
          // AI校正失败时，直接使用识别内容（不合并，避免重复）
          setContent(recognizedText);
          setTranscribedText(recognizedText);
          const method = usedFallback ? '（使用备用识别方案）' : '';
          if (typeof showWarning === 'function') {
            showWarning(`手写文字识别成功${method}，但智能校正失败`);
          }
        }
      } else {
        console.warn('⚠ 识别完成但未获取到文本');
        if (typeof showWarning === 'function') {
          showWarning('识别完成，但未获取到文本，请检查图片清晰度');
        }
      }
    } catch (error) {
      if (gradioTimeoutHandle) {
        clearTimeout(gradioTimeoutHandle);
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.info('✓ 识别已被取消');
        return;
      }

      console.error('✗ 图片识别失败:', error);
      if (typeof showError === 'function') {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        showError(`图片识别失败: ${errorMessage}`);
      }
      clearMediaState();
    } finally {
      if (gradioTimeoutHandle) {
        clearTimeout(gradioTimeoutHandle);
      }
      if (recognitionAbortControllerRef.current === abortController) {
        recognitionAbortControllerRef.current = null;
      }
      setIsRecognizing(false);
    }
  };

  // 处理音频录制
  const handleAudioCapture = async ({ audioData, transcript }: AudioCaptureResult) => {
    try {
      console.log('📝 handleAudioCapture 收到参数:', {
        audioDataLength: audioData?.length || 0,
        transcriptLength: transcript?.length || 0,
        transcript: transcript
      });

      const normalizedTranscript = transcript?.trim();
      console.log('📝 归一化后的转录文本:', normalizedTranscript);

      if (audioData) {
        setAudioUrl(audioData);
        setContentType('audio');
      } else {
        setAudioUrl('');
        setContentType('text');
      }

      if (normalizedTranscript) {
        setTranscribedText(normalizedTranscript);

        const currentContent = content.trim();
        
        console.log('🔍 语音识别调试信息:', {
          稿纸内容长度: currentContent.length,
          稿纸内容前50字: currentContent.substring(0, 50),
          识别内容长度: normalizedTranscript.length,
          识别内容前50字: normalizedTranscript.substring(0, 50),
          识别内容后50字: normalizedTranscript.substring(Math.max(0, normalizedTranscript.length - 50)),
        });
        
        if (typeof showWarning === 'function') {
          showWarning('正在智能校正标点和错别字...');
        }

        try {
          let promptContent: string;
          
          if (currentContent) {
            // 稿纸有内容，让AI合并并去重
            promptContent = `你是小学六年级作文指导老师。现在学生通过语音继续写作文。

稿纸已有内容：
${currentContent}

新的语音识别内容：
${normalizedTranscript}

请完成以下任务：
1. 仔细对比两段内容，识别出哪些是重复的，哪些是新增的
2. 如果语音识别内容包含了稿纸已有的部分，只保留新增的部分
3. 将新增内容接在稿纸内容后面，形成完整连贯的文章
4. 校正标点符号（确保句号、逗号、问号等使用正确）
5. 纠正明显的同音字错误（如"的地得"等）
6. 严格保持学生原有的语气、用词和表达方式
7. 不要改变文章的意思和风格

重要：只输出校正后的完整文章内容，不要重复内容，不要添加任何解释或评论。`;
          } else {
            // 稿纸为空，只需校正新内容
            promptContent = `请对以下语音识别文本进行校正：

${normalizedTranscript}

要求：
1. 校正标点符号
2. 纠正明显的同音字错误
3. 保持原有语气和表达方式
4. 只输出校正后的文本，不要添加解释

校正后的文本：`;
          }

          const messages: ChatMessage[] = [
            {
              role: 'system',
              content: '你是一位小学六年级作文指导老师，擅长校正标点符号和语音识别错误，同时严格保持学生原有的语气和表达方式。',
            },
            {
              role: 'user',
              content: promptContent,
            },
          ];

          const usingCustomApi = isNonEmptyString(aiConfig?.apiKey);
          let correctedText: string;

          if (usingCustomApi && aiConfig) {
            correctedText = await callOpenAIChatCompletion(messages, aiConfig, {
              temperature: 0.3,
              maxTokens: 2000,
            });
          } else {
            const { content: pollinationsResponse } = await callPollinationsChatWithFallback(messages, {
              preferredModel: 'openai',
            });
            correctedText = pollinationsResponse;
          }

          const finalText = correctedText.trim();
          console.log('✅ AI校正完成，原文长度:', currentContent.length, '识别长度:', normalizedTranscript.length, '结果长度:', finalText.length);
          setContent(finalText);
          setTranscribedText(finalText);

          if (typeof showSuccess === 'function') {
            showSuccess('语音识别成功，已智能校正！');
          }
        } catch (error) {
          console.error('AI校正失败:', error);
          // AI校正失败时，直接使用识别内容（不合并，避免重复）
          setContent(normalizedTranscript);
          setTranscribedText(normalizedTranscript);
          if (typeof showWarning === 'function') {
            showWarning('语音识别成功，但智能校正失败');
          }
        }
      } else {
        console.warn('⚠️ 转录文本为空');
        setTranscribedText('');
        setContent('');
        if (typeof showWarning === 'function') {
          showWarning('识别未捕捉到语音内容，请重试或注意语速和清晰度');
        }
      }
    } catch (error) {
      console.error('语音识别处理失败:', error);
      if (typeof showError === 'function') {
        showError('语音识别处理失败，请重试');
      }
      handleClearMedia();
    }
  };

  // 清除媒体并恢复稿纸
  const handleClearMedia = () => {
    if (recognitionAbortControllerRef.current) {
      recognitionAbortControllerRef.current.abort();
      recognitionAbortControllerRef.current = null;
    }
    clearMediaState();
  };

  const handleContentUpdate = (value: string) => {
    setContent(value);
    if (contentType !== 'text') {
      setTranscribedText(value);
    }
  };

  const handleReCapture = () => {
    handleClearMedia();
    setIsFeedbackModalOpen(false);
  };

  const runOverallReview = async (essayId: string) => {
    const { essays: currentEssays } = useAppStore.getState();
    const essay = currentEssays.find(item => item.id === essayId);
    if (!essay) {
      return;
    }

    const { latestLabel, latestContent } = prepareEssayHistoryData(essay);
    const simplifiedHistory = generateSimplifiedVersionHistory(essay);

    const overallPrompt = `请作为小学六年级作文指导老师，基于自由写作的评价标准，对作文《${essay.title}》进行整体批改。请关注学生在不同版本中的进步，以及仍可提升的方向。

最新版本（${latestLabel}）：
${latestContent}

版本历史演进：
${simplifiedHistory}

请按照以下格式输出整体反馈：
⭐ 星星1：[引用具体亮点]
⭐ 星星2：[引用具体亮点]
🙏 愿望：[给出下一步改进建议]

请保持温暖、鼓励的语气，同时指出持续精进的方向。`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位小学六年级作文指导老师，熟悉《六年级作文成长手册》的内容和要求。',
      },
      {
        role: 'user',
        content: overallPrompt,
      },
    ];

    const usingCustomApi = isNonEmptyString(aiConfig?.apiKey);

    try {
      let overallFeedback: string;
      if (usingCustomApi && aiConfig) {
        overallFeedback = await callOpenAIChatCompletion(messages, aiConfig, {
          temperature: 0.7,
          maxTokens: 1500,
        });
      } else {
        const { content: pollinationsFeedback, model: usedModel } = await callPollinationsChatWithFallback(
          messages,
          {
            preferredModel: 'openai',
            seed: 42,
            maxRetries: 3,
          }
        );
        overallFeedback = pollinationsFeedback;
        console.info('[Pollinations] 使用模型进行整体批改:', usedModel);
      }

      if (overallFeedback) {
        updateEssay(essayId, { feedback: overallFeedback });
      }
    } catch (error: unknown) {
      console.error('整体批改失败:', error);
      if (typeof showError === 'function') {
        const errorMessage = error instanceof Error ? error.message : String(error);
        showError(`整体批改失败: ${errorMessage || '未知错误'}`);
      }
    }
  };

  // 从URL参数中获取预选的工具和题材（只在组件初始化时执行一次）
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    const topicParam = searchParams.get('topic');
    const essayId = searchParams.get('essayId');
    const versionId = searchParams.get('versionId');

    // 设置编辑状态
    if (essayId) {
      setEditingEssayId(essayId);
      const essay = essays.find(e => e.id === essayId);
      if (essay) {
        setTitle(essay.title);
        setSelectedTool(essay.toolUsed);
        const essayContent = essay.transcribedText || essay.content || '';
        setContent(essayContent);
        setTranscribedText(essay.transcribedText || '');
        setContentType(essay.contentType || 'text');
        setImageUrl(essay.imageUrl || '');
        setAudioUrl(essay.audioUrl || '');
      }
    }

    if (versionId) {
      setEditingVersionId(versionId);
      if (essayId) {
        const essay = essays.find(e => e.id === essayId);
        if (essay && essay.versions) {
          const version = essay.versions.find(v => v.id === versionId);
          if (version) {
            const versionContent = version.transcribedText || version.content || '';
            setContent(versionContent);
            setTranscribedText(version.transcribedText || '');
            setContentType(version.contentType || essay?.contentType || 'text');
            setImageUrl(version.imageUrl || '');
            setAudioUrl(version.audioUrl || '');
          }
        }
      }
    }

    if (toolParam && writingTools.some(tool => tool.id === toolParam)) {
      const level = progress.levels.find(l => l.toolId === toolParam);
      const isPracticeUnlocked = toolParam === 'free-writing' || !!level?.testPassed;
      if (isPracticeUnlocked) {
        setSelectedTool(toolParam);
      } else {
        // 如果目标工具未解锁练习，则回退到第一个可用工具
        setSelectedTool(availablePracticeTools[0]?.id || 'free-writing');
      }
    } else if (!essayId) {
      // 只有在不是编辑模式时才设置默认工具
      setSelectedTool(availablePracticeTools[0]?.id || 'free-writing');
    }

    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
      // 如果有题材要求，可以将其作为默认内容或提示
      if (!content) {
        setContent(`请围绕以下主题进行写作：${decodeURIComponent(topicParam)}\n\n`);
      }
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 当可用工具列表发生变化时，检查当前选择的工具是否仍然有效
  useEffect(() => {
    if (selectedTool !== 'free-writing') {
      const currentTool = availablePracticeTools.find(tool => tool.id === selectedTool);
      // 如果当前选择的工具不再可用，则重置为默认工具
      if (!currentTool) {
        setSelectedTool(availablePracticeTools[0]?.id || 'free-writing');
      }
    }
  }, [availablePracticeTools, selectedTool]);

  const resolveEssayTitle = (currentTitle: string, sourceContent: string) => {
    const trimmed = currentTitle.trim();
    if (trimmed && trimmed !== '无标题') {
      return { title: trimmed, generated: false, usedFallback: false };
    }
    const { title: autoTitle, isFallback } = generateAutomaticTitle(sourceContent);
    return { title: autoTitle, generated: true, usedFallback: isFallback };
  };

  const saveEssay = async () => {
    // 检查是否完成了今日的每日挑战
    const today = new Date().toDateString();
    const dailyChallenge = progress.dailyChallenge;
    let challengeCompleted = false;

    if (dailyChallenge && !dailyChallenge.completed) {
      const challengeDate = new Date(dailyChallenge.date).toDateString();
      if (today === challengeDate) {
        challengeCompleted = true;
      }
    }

    const contentForTitle = (transcribedText || content).trim();
    const { title: finalTitle, generated: autoGenerated, usedFallback } = resolveEssayTitle(title, contentForTitle);
    const originalTrimmedTitle = title.trim();
    const titleChanged = finalTitle !== originalTrimmedTitle;

    if (titleChanged) {
      setTitle(finalTitle);
    }

    const autoTitleNote = autoGenerated
      ? (usedFallback
        ? `内容暂不够集中，暂用标题「${finalTitle}」`
        : `已为你生成标题「${finalTitle}」`)
      : '';
    const appendNote = autoTitleNote ? `（${autoTitleNote}）` : '';

    if (editingEssayId) {
      if (editingVersionId) {
        if (titleChanged) {
          updateEssay(editingEssayId, { title: finalTitle });
        }
        addEssayVersion(editingEssayId, content, feedback, actionItems, editingVersionId, {
          contentType,
          imageUrl,
          audioUrl,
          transcribedText
        });
        showSuccess(`新版本已保存到作文中${appendNote}`);
      } else {
        updateEssay(editingEssayId, {
          title: finalTitle,
          content,
          toolUsed: selectedTool,
          contentType,
          imageUrl,
          audioUrl,
          transcribedText
        });
        showSuccess(`作文已更新${appendNote}`);
      }
    } else {
      addEssay({
        title: finalTitle,
        content,
        toolUsed: selectedTool,
        contentType,
        imageUrl,
        audioUrl,
        transcribedText
      });
      showSuccess(`作文已保存到我的作文中${appendNote}`);
    }

    // 如果完成了今日挑战，更新挑战状态
    if (challengeCompleted && dailyChallenge) {
      const updatedChallenge = {
        ...dailyChallenge,
        completed: true,
        streak: dailyChallenge.streak + 1
      };

      setDailyChallenge(updatedChallenge);
      updateHabitTracker({ writingStreak: (progress.habitTracker?.writingStreak || 0) + 1 });
      showSuccess(`恭喜完成今日挑战！连续写作天数：${updatedChallenge.streak}天`);
    }
  };

  const handleSubmit = async () => {
    if (isSaving) {
      showWarning('正在保存中，请稍候...');
      return;
    }

    if (contentType === 'text') {
      if (!content.trim()) {
        showWarning('请填写作文内容');
        return;
      }
    } else if (contentType === 'image') {
      if (!imageUrl) {
        showWarning('请上传或拍摄手写作文图片');
        return;
      }
      if (!content.trim()) {
        showWarning('手写作文正在识别中，请稍候或手动补充识别结果');
        return;
      }
    } else if (contentType === 'audio') {
      if (!audioUrl) {
        showWarning('请录制语音作文');
        return;
      }
      if (!content.trim()) {
        showWarning('语音转录尚未完成，请稍候或手动补充文本');
        return;
      }
    }

    // 检查行动项完成情况
    const completedActionItems = actionItems.filter(item => item.completed).length;
    const totalActionItems = actionItems.length;

    if (totalActionItems > 0 && completedActionItems < totalActionItems) {
      const handleConfirmSave = async () => {
        setIsConfirmDialogOpen(false);
        setConfirmAction(null);
        // 继续保存作文的逻辑
        setIsSaving(true);
        try {
          await saveEssay();
        } finally {
          setIsSaving(false);
        }
      };

      setConfirmDialogProps({
        title: '确认保存',
        message: `您还有 ${totalActionItems - completedActionItems} 个修改任务未完成。确定要保存作文吗？`
      });
      setConfirmAction(() => handleConfirmSave);
      setIsConfirmDialogOpen(true);
      return;
    }

    // 如果没有未完成的行动项，直接保存
    setIsSaving(true);
    try {
      await saveEssay();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIReview = async (reviewContent?: string) => {
    if (isGenerating) {
      showWarning('AI正在生成反馈中，请稍候...');
      return;
    }

    // 处理可能意外传入的事件对象
    let contentToReview: string;
    if (reviewContent === undefined || reviewContent === null) {
      contentToReview = content;
    } else if (typeof reviewContent === 'string') {
      contentToReview = reviewContent;
    } else {
      // 如果传入的是事件对象或其他非字符串类型，使用当前content
      contentToReview = content;
    }

    // 确保contentToReview是字符串类型
    if (typeof contentToReview !== 'string') {
      showError(`作文内容类型错误: content类型=${typeof content}, contentToReview类型=${typeof contentToReview}`);
      return;
    }

    if (!contentToReview.trim()) {
      showWarning('请先填写作文内容');
      return;
    }

    const contentForTitle = (transcribedText || contentToReview).trim();
    const { title: ensuredTitle, generated: autoGeneratedTitle, usedFallback: usedFallbackTitle } = resolveEssayTitle(title, contentForTitle);
    const trimmedCurrentTitle = title.trim();
    const titleNeedsUpdate = ensuredTitle !== trimmedCurrentTitle;

    if (titleNeedsUpdate) {
      setTitle(ensuredTitle);
      if (editingEssayId) {
        updateEssay(editingEssayId, { title: ensuredTitle });
      }
      if (autoGeneratedTitle) {
        showSuccess(
          usedFallbackTitle
            ? `内容暂不够集中，暂用标题「${ensuredTitle}」`
            : `已为你生成标题「${ensuredTitle}」`
        );
      }
    }

    const usingCustomApi = isNonEmptyString(aiConfig?.apiKey);

    setIsGenerating(true);
    setFeedback('正在生成反馈...');

    try {
      // 检查是否为自由写作
      const isFreeWriting = selectedTool === 'free-writing';
      const tool = isFreeWriting ? null : writingTools.find(t => t.id === selectedTool);

      // 获取原文内容用于对比
      let originalContent = '';
      if (editingEssayId) {
        const essay = essays.find(e => e.id === editingEssayId);
        if (essay) {
          if (editingVersionId && essay.versions) {
            // 如果是编辑特定版本，获取该版本的原文
            const version = essay.versions.find(v => v.id === editingVersionId);
            originalContent = version?.content || essay.content;
          } else {
            // 如果是编辑当前版本，获取当前内容作为原文
            originalContent = essay.content;
          }
        }
      }

      // 构建AI批改提示词
      let prompt = `你是一位小学六年级作文指导老师，熟悉《六年级作文成长手册》的内容和要求。请根据以下内容对学生的作文进行批改：\n\n`;

      // 添加批改上下文标识
      if (editingEssayId) {
        prompt += `【作文批改】这是对已有作文的批改，请关注学生的写作进展和改进情况。\n\n`;
      }

      // 添加写作工具信息（如果是自由写作则特殊处理）
      if (isFreeWriting) {
        prompt += `写作模式：自由写作 - 学生选择不使用特定写作工具\n\n`;
      } else {
        prompt += `写作工具：${tool?.name} - ${tool?.title}\n`;
        prompt += `工具口诀：${tool?.mantra}\n`;
        prompt += `工具说明：${tool?.description}\n`;
        prompt += `适用场景：${tool?.suitableFor}\n`;
        prompt += `注意事项：${tool?.caution}\n\n`;
      }

      // 添加手册核心要求
      prompt += `手册核心要求：\n`;
      prompt += `1. 选材要真实具体，避免宏大叙事和老套情节\n`;
      prompt += `2. 描写要具体化，用动作、细节代替抽象形容词\n`;
      prompt += `3. 关键时刻要用慢镜头放大描写\n`;
      prompt += `4. 运用五感描写增强画面感\n`;
      prompt += `5. 通过对比突出特点\n`;
      prompt += `6. 挖掘事件深层意义，避免说教\n`;
      prompt += `7. 注意句式节奏变化\n\n`;

      // 添加原文和修改后的内容
      if (originalContent && originalContent !== contentToReview) {
        prompt += `原文：\n${originalContent}\n\n`;
        prompt += `修改后的文章：\n${contentToReview}\n\n`;
        if (editingEssayId) {
          prompt += `请对比原文和修改后的文章，关注学生的写作进展和对写作技巧的掌握情况，指出修改的优点和可以进一步改进的地方。\n\n`;
        } else {
          prompt += `请对比原文和修改后的文章，指出修改的优点和可以进一步改进的地方。\n\n`;
        }
      } else {
        prompt += `学生作文：\n${contentToReview}\n\n`;
      }

      // 根据是否为自由写作调整反馈格式
      if (isFreeWriting) {
        prompt += `请按照以下鼓励性格式提供反馈：
⭐ 星星1：我最喜欢的一句话/一个细节是...
⭐ 星星2：我印象最深刻的画面是...
🙏 愿望：我希望作者能把______再写多一点

请以温暖、鼓励的语调提供反馈，重点发现学生作文中的亮点和创意，给出具体的赞美和温和的建议。`;
      } else {
        prompt += `请按照以下格式提供反馈：
作为作文导师，我看到了你运用了【${tool?.name}】的技巧：

✅ 优点：
1. [具体指出学生作文中运用了哪些手册中的技巧，引用原文例子]
2. [指出作文中的亮点，引用原文例子]
3. [肯定学生的创意或独特表达，引用原文例子]

❌ 改进建议：
1. [针对所选工具的具体建议，结合手册要求]
2. [指出可以加强的地方，给出具体修改建议]
3. [其他方面的建议，如结构、语言等]`;
      }

      if (originalContent && originalContent !== contentToReview) {
        if (editingEssayId) {
          prompt += `\n\n🔄 修改对比：
1. [关注学生的写作进展和对写作技巧的掌握情况，指出修改后改进的地方]
2. [建议可以进一步优化的地方，帮助学生持续提升]`;
        } else {
          prompt += `\n\n🔄 修改对比：
1. [指出修改后改进的地方]
2. [建议可以进一步优化的地方]`;
        }
      }

      prompt += `\n\n💡 写作小贴士：
[结合手册内容给出一个具体的写作建议或技巧提醒]

继续加油！`;

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: '你是一位小学六年级作文指导老师，熟悉《六年级作文成长手册》的内容和要求。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      let aiFeedback: string;
      if (usingCustomApi && aiConfig) {
        aiFeedback = await callOpenAIChatCompletion(messages, aiConfig, {
          temperature: 0.7,
          maxTokens: 1500,
        });
      } else {
        const { content: pollinationsFeedback, model: usedModel } = await callPollinationsChatWithFallback(
          messages,
          {
            preferredModel: 'openai',
            seed: 42,
            maxRetries: 3,
          }
        );
        aiFeedback = pollinationsFeedback;
        console.info('[Pollinations] 使用模型进行作文批改:', usedModel);
      }

      setFeedback(aiFeedback);

      // 生成行动项
      const generatedActionItems = generateActionItems(aiFeedback);
      setActionItems(generatedActionItems);

      let targetEssayId: string | null = null;

      if (editingEssayId) {
        targetEssayId = editingEssayId;

        if (contentToReview !== originalContent) {
          let parentId = editingVersionId || undefined;
          if (!editingVersionId) {
            const currentState = useAppStore.getState();
            const currentEssay = currentState.essays.find(e => e.id === editingEssayId);
            if (currentEssay?.versions && currentEssay.versions.length > 0) {
              // parentId = currentEssay.versions[currentEssay.versions.length - 1].id;
            }
          }
          addEssayVersion(editingEssayId, contentToReview, aiFeedback, generatedActionItems, parentId);

          const updatedEssay = useAppStore.getState().essays.find(e => e.id === editingEssayId);
          const lastVersion = updatedEssay?.versions?.[updatedEssay.versions.length - 1];
          if (lastVersion) {
            setEditingVersionId(lastVersion.id);
          }
        } else {
          const currentState = useAppStore.getState();
          const currentEssay = currentState.essays.find(e => e.id === editingEssayId);
          let versionIdToUpdate = editingVersionId;

          if (!versionIdToUpdate && currentEssay?.versions) {
            const matchingVersion = [...currentEssay.versions].reverse().find(version => version.content === contentToReview);
            if (matchingVersion) {
              versionIdToUpdate = matchingVersion.id;
              if (!editingVersionId) {
                setEditingVersionId(matchingVersion.id);
              }
            }
          }

          if (versionIdToUpdate) {
            updateEssayVersion(editingEssayId, versionIdToUpdate, {
              feedback: aiFeedback,
              actionItems: generatedActionItems,
            });
          } else {
            addEssayVersion(editingEssayId, contentToReview, aiFeedback, generatedActionItems, editingVersionId || undefined);
            const updatedEssay = useAppStore.getState().essays.find(e => e.id === editingEssayId);
            const lastVersion = updatedEssay?.versions?.[updatedEssay.versions.length - 1];
            if (lastVersion) {
              setEditingVersionId(lastVersion.id);
            }
          }
        }
      } else {
        const essayId = addEssay({
          title: ensuredTitle,
          content: contentToReview,
          toolUsed: selectedTool,
        });
        addEssayVersion(essayId, contentToReview, aiFeedback, generatedActionItems);
        setEditingEssayId(essayId);

        const updatedEssay = useAppStore.getState().essays.find(e => e.id === essayId);
        const lastVersion = updatedEssay?.versions?.[updatedEssay.versions.length - 1];
        if (lastVersion) {
          setEditingVersionId(lastVersion.id);
        }

        targetEssayId = essayId;
      }

      if (targetEssayId) {
        void runOverallReview(targetEssayId);
      }

      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error('AI批改失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const suggestion = usingCustomApi
        ? '请检查您的AI配置是否正确（API密钥、基础URL、模型等），或稍后重试'
        : '请稍后重试，或稍微降低请求频率（Pollinations 文本接口建议间隔约 3 秒）。';
      setFeedback(`批改失败：${errorMessage}\n\n${suggestion}`);

      if (usingCustomApi && aiConfig) {
        const handleConfirmCheckConfig = () => {
          setIsConfirmDialogOpen(false);
          setConfirmAction(null);
          window.location.href = '/settings';
        };

        setConfirmDialogProps({
          title: 'AI批改失败',
          message: `AI批改失败：${errorMessage}\n\n建议检查您的AI配置是否正确，是否前往设置页面检查配置？`
        });
        setConfirmAction(() => handleConfirmCheckConfig);
        setIsConfirmDialogOpen(true);
      } else {
        if (typeof showError === 'function') {
          showError(`AI批改失败：${errorMessage}`);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReReview = async (newContent: string) => {
    // 调用AI批改函数进行重新批改，使用传递的内容
    await handleAIReview(newContent);
  };

  const selectedToolData = writingTools.find(t => t.id === selectedTool);

  const handleActionItemUpdate = (id: string, completed: boolean) => {
    setActionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-gray-100 to-white">
      {/* 头部 */}
      <div className="bg-white shadow-card border-b border-morandi-gray-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-morandi-gray-600 hover:text-morandi-blue-600 transition-colors p-2 rounded-lg hover:bg-morandi-blue-50"
              >
                <div className="p-2 bg-morandi-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                返回首页
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-morandi-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-morandi-blue-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-morandi-blue-600" />
                  </div>
                  写作练习
                </h1>
                <p className="text-morandi-gray-600 text-sm">运用写作工具，创作你的作文</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              保存作文
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 编辑区域 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            {/* 显示当前题材要求 */}
            {topic && (
              <div className="mb-6 p-4 bg-morandi-beige-50 border border-morandi-beige-200 rounded-xl">
                <div className="flex items-center gap-2 text-morandi-beige-700 mb-2">
                  <div className="p-1 bg-morandi-beige-100 rounded-md">
                    <Sparkles className="w-4 h-4 text-morandi-beige-600" />
                  </div>
                  <span className="font-medium">写作题材要求</span>
                </div>
                <p className="text-morandi-beige-800 bg-white p-3 rounded-lg">
                  {topic}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-morandi-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-morandi-green-100 rounded-md">
                    <Zap className="w-4 h-4 text-morandi-green-600" />
                  </div>
                  选择工具
                </label>
                <div className="text-xs bg-morandi-blue-100 text-morandi-blue-800 px-2 py-1 rounded-full">
                  {selectedToolData?.name}
                </div>
              </div>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 bg-white shadow-sm"
              >
                {availablePracticeTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.id === 'free-writing' ? '自由写作 - 不使用特定工具' : `${tool.name} - ${tool.title}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-beige-100 rounded-md">
                  <Sparkles className="w-4 h-4 text-morandi-beige-600" />
                </div>
                作文标题
                <span className="text-xs text-morandi-gray-500 font-normal">（留空时将自动生成）</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作文起个好名字，或留空由系统自动生成"
                className="w-full px-4 py-3 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-morandi-gray-700 mb-2 flex items-center gap-2">
                <div className="p-1 bg-morandi-green-100 rounded-md">
                  <Edit3 className="w-4 h-4 text-morandi-green-600" />
                </div>
                作文内容
              </label>

              {contentType === 'text' ? (
                <>
                  <CompositionPaper
                    value={content}
                    onChange={handleContentUpdate}
                    placeholder="开始你的创作吧...运用你学到的写作技巧"
                    className="w-full"
                  />

                  <div className="mt-6 p-4 bg-morandi-blue-50 border border-morandi-blue-100 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-morandi-blue-800">或者试试手写/语音输入</h3>
                      <span className="text-xs text-morandi-blue-600">上传后将替换稿纸</span>
                    </div>
                    <MediaInput
                      onImageCapture={handleImageCapture}
                      onAudioCapture={handleAudioCapture}
                      currentImage={imageUrl}
                      currentAudio={audioUrl}
                      onClear={handleClearMedia}
                      onCancelRecognition={handleCancelRecognition}
                      isRecognizing={isRecognizing}
                    />
                  </div>
                </>
              ) : (
                <>
                  <MediaInput
                    onImageCapture={handleImageCapture}
                    onAudioCapture={handleAudioCapture}
                    currentImage={contentType === 'image' ? imageUrl : ''}
                    currentAudio={contentType === 'audio' ? audioUrl : ''}
                    onClear={handleClearMedia}
                    onCancelRecognition={handleCancelRecognition}
                    isRecognizing={isRecognizing}
                  />

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-morandi-gray-700 mb-2">识别结果（可在此修改文本）</label>
                    <textarea
                      value={content}
                      onChange={(e) => handleContentUpdate(e.target.value)}
                      className="w-full min-h-[200px] p-4 border border-morandi-gray-300 rounded-xl focus:ring-2 focus:ring-morandi-blue-500 focus:border-morandi-blue-500 bg-white"
                      placeholder="系统会自动识别你的手写或语音，如果有误可以在这里修改~"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI反馈和提示区域 */}
        <div className="space-y-6">
          {/* 核心工具提示 */}
          <div className="bg-gradient-to-br from-morandi-blue-50 to-morandi-blue-100 border border-morandi-blue-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-morandi-blue-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-blue-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-morandi-blue-700" />
              </div>
              核心口诀
            </h2>
            <div className="text-2xl font-bold text-morandi-blue-900 mb-3 bg-white/50 p-4 rounded-xl whitespace-pre-line">
              {selectedToolData?.mantra}
            </div>
            <p className="text-morandi-blue-700 bg-white/50 p-4 rounded-xl">{selectedToolData?.tips}</p>
          </div>

          {/* 写作示范 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            <h3 className="text-2xl font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-green-100 rounded-lg">
                <Zap className="w-4 h-4 text-morandi-green-600" />
              </div>
              写作示范
            </h3>
            <div className="space-y-4">
              {selectedToolData?.examples.slice(0, 1).map((example, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-morandi-pink-50 border border-morandi-pink-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-morandi-pink-700 mb-2">
                      <div className="w-2 h-2 bg-morandi-pink-500 rounded-full"></div>
                      <span className="font-medium text-sm">避免这样写</span>
                    </div>
                    <p className="text-morandi-pink-800 text-sm">{example.bad}</p>
                  </div>
                  <div className="bg-morandi-green-50 border border-morandi-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-morandi-green-700 mb-2">
                      <div className="w-2 h-2 bg-morandi-green-500 rounded-full"></div>
                      <span className="font-medium text-sm">推荐这样写</span>
                    </div>
                    <p className="text-morandi-green-800 text-sm">{example.good}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 行动任务 */}
          {actionItems.length > 0 && (
            <ActionItemsList
              items={actionItems}
              onUpdate={handleActionItemUpdate}
            />
          )}

          {/* AI反馈区域 */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
            <h2 className="text-lg font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-morandi-green-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-morandi-green-600" />
              </div>
              AI智能批改
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-morandi-gray-600">
                使用AI帮你检查作文，提供专业的修改建议。请确保已在<a href="/settings" className="text-morandi-blue-600 hover:underline">设置页面</a>中配置了AI参数。
              </p>

              <button
                onClick={() => handleAIReview()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    获取AI反馈
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* 批改反馈模态框 */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        content={content}
        feedback={feedback}
        actionItems={actionItems}
        onActionItemUpdate={handleActionItemUpdate}
        onReReview={handleReReview}
        onContentUpdate={handleContentUpdate}
        contentType={contentType}
        imageUrl={imageUrl}
        audioUrl={audioUrl}
        onReCapture={handleReCapture}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={confirmDialogProps.title}
        message={confirmDialogProps.message}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setConfirmAction(null);
        }}
      />

    </div>
  );
}

import { Suspense } from 'react';

export default function WritePage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <WriteContent />
    </Suspense>
  );
}