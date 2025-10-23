'use client';

import { useState, useEffect } from 'react';
import { useAppStore, generateActionItems } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { writingTools } from '@/data/tools';
import { Essay, EssayVersion } from '@/types';
import { ArrowLeft, Save, Sparkles, Edit3, Lightbulb, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import FeedbackModal from '@/components/FeedbackModal';
import ActionItemsList from '@/components/ActionItemsList';
import CompositionPaper from '@/components/CompositionPaper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

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

  // 计算已解锁练习的工具（自由写作始终可选）
  const availablePracticeTools = writingTools.filter(tool => {
    if (tool.id === 'free-writing') return true;
    const level = progress.levels.find(l => l.toolId === tool.id);
    return !!level?.testPassed;
  });

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

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig?.model,
          messages: [
            {
              role: 'system',
              content: '你是一位小学六年级作文指导老师，熟悉《六年级作文成长手册》的内容和要求。',
            },
            {
              role: 'user',
              content: overallPrompt,
            },
          ],
          temperature: 0.7,
          maxTokens: 1500,
          apiKey: aiConfig?.apiKey,
          baseURL: aiConfig?.baseURL,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (response.status === 429) {
        let warningMessage = '请求过于频繁，请稍后再试';
        if (contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(responseText);
            warningMessage = errorData?.error?.message || warningMessage;
          } catch (parseError) {
            console.error('整体批改限流信息解析失败:', parseError);
          }
        }
        if (typeof showWarning === 'function') {
          showWarning(warningMessage);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`整体批改请求失败: ${response.status} ${response.statusText}\n响应内容: ${responseText.substring(0, 200)}...`);
      }

      let data: any;
      try {
        if (contentType.includes('application/json')) {
          data = responseText ? JSON.parse(responseText) : {};
        } else {
          data = {
            choices: [
              {
                message: {
                  content: responseText,
                },
              },
            ],
          };
        }
      } catch (parseError) {
        throw new Error(`整体批改返回非JSON响应: ${(parseError as Error).message}`);
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('Invalid API response structure:', data);
        return;
      }

      const choice = data.choices[0];
      const overallFeedback =
        choice?.message?.content ??
        data.message ??
        data.response ??
        '';

      if (typeof overallFeedback === 'string' && overallFeedback.trim()) {
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
        setContent(essay.content);
        setSelectedTool(essay.toolUsed);
      }
    }

    if (versionId) {
      setEditingVersionId(versionId);
      if (essayId) {
        const essay = essays.find(e => e.id === essayId);
        if (essay && essay.versions) {
          const version = essay.versions.find(v => v.id === versionId);
          if (version) {
            setContent(version.content);
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

  const saveEssay = () => {
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

    if (editingEssayId) {
      // 如果是编辑已存在的作文，添加新版本
      if (editingVersionId) {
        // 如果是编辑特定版本，保存为新版本，基于该版本创建分支
        addEssayVersion(editingEssayId, content, feedback, actionItems, editingVersionId);
        showSuccess('新版本已保存到作文中');
      } else {
        // 如果是编辑当前版本，更新作文
        updateEssay(editingEssayId, {
          title,
          content,
          toolUsed: selectedTool,
        });
        showSuccess('作文已更新');
      }
    } else {
      // 保存新作文
      addEssay({
        title,
        content,
        toolUsed: selectedTool,
      });
      showSuccess('作文已保存到我的作文中');
    }

    // 如果完成了今日挑战，更新挑战状态
    if (challengeCompleted && dailyChallenge) {
      const updatedChallenge = {
        ...dailyChallenge,
        completed: true,
        streak: dailyChallenge.streak + 1
      };

      setDailyChallenge(updatedChallenge);
      // 更新习惯追踪连续天数（用于解锁条件）
      updateHabitTracker({ writingStreak: (progress.habitTracker?.writingStreak || 0) + 1 });

      // 显示完成提示（显示最新的 streak 数值）
      showSuccess(`恭喜完成今日挑战！连续写作天数：${updatedChallenge.streak}天`);
    }
  };

  const handleSubmit = async () => {
    if (isSaving) {
      showWarning('正在保存中，请稍候...');
      return;
    }

    if (!title.trim() || !content.trim()) {
      showWarning('请填写标题和内容');
      return;
    }

    // 检查行动项完成情况
    const completedActionItems = actionItems.filter(item => item.completed).length;
    const totalActionItems = actionItems.length;

    if (totalActionItems > 0 && completedActionItems < totalActionItems) {
      const handleConfirmSave = () => {
        setIsConfirmDialogOpen(false);
        setConfirmAction(null);
        // 继续保存作文的逻辑
        setIsSaving(true);
        try {
          saveEssay();
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
      saveEssay();
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

    if (!aiConfig?.apiKey) {
      if (typeof showWarning === 'function') {
        showWarning('未配置API密钥，系统将使用 Pollinations 公共通道，响应速度可能略慢。');
      }
    }

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

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig?.model,
          messages: [
            {
              role: 'system',
              content: '你是一位小学六年级作文指导老师，熟悉《六年级作文成长手册》的内容和要求。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          maxTokens: 1500,
          apiKey: aiConfig?.apiKey,
          baseURL: aiConfig?.baseURL,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (response.status === 429) {
        let warningMessage = '请求过于频繁，请稍后再试';
        if (contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(responseText);
            warningMessage = errorData?.error?.message || warningMessage;
          } catch (parseError) {
            console.error('AI批改限流信息解析失败:', parseError);
          }
        }
        if (typeof showWarning === 'function') {
          showWarning(warningMessage);
        }
        setFeedback('');
        setActionItems([]);
        return;
      }

      if (!response.ok) {
        console.error('API Error Response:', responseText);
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n响应内容: ${responseText.substring(0, 200)}...`);
      }

      let data: any;
      try {
        if (contentType.includes('application/json')) {
          data = responseText ? JSON.parse(responseText) : {};
        } else {
          data = {
            choices: [
              {
                message: {
                  content: responseText,
                },
              },
            ],
          };
        }
      } catch (parseError) {
        throw new Error(`AI响应解析失败: ${(parseError as Error).message}`);
      }

      let aiFeedback =
        data.choices?.[0]?.message?.content ??
        data.message ??
        data.response ??
        '';

      if (typeof aiFeedback !== 'string' || !aiFeedback.trim()) {
        aiFeedback = 'AI批改结果为空';
      }

      setFeedback(aiFeedback);

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
          title,
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
      setFeedback(`批改失败：${errorMessage}\n\n请检查您的AI配置是否正确（API密钥、基础URL、模型等），或稍后重试`);

      // 提供检查配置的选项
      const handleConfirmCheckConfig = () => {
        setIsConfirmDialogOpen(false);
        setConfirmAction(null);
        window.location.href = '/settings';
      };

      setConfirmDialogProps({
        title: 'AI批改失败',
        message: `AI批改失败：${errorMessage}\n\n建议检查AI配置是否正确，是否前往设置页面检查配置？`
      });
      setConfirmAction(() => handleConfirmCheckConfig);
      setIsConfirmDialogOpen(true);
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
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作文起个好名字"
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
              <CompositionPaper
                value={content}
                onChange={setContent}
                placeholder="开始你的创作吧...运用你学到的写作技巧"
                className="w-full"
              />
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
        onContentUpdate={setContent}
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