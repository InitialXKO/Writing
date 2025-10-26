import { NextResponse } from 'next/server';

const POLLINATIONS_VISION_ENDPOINT = 'https://text.pollinations.ai/';
const DEFAULT_VISION_MODEL = 'openai';
const DEFAULT_VISION_PROMPT = '请用中文对这张图片进行OCR。';
const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_TIMEOUT_MS = 120_000;
const MIN_VISION_INTERVAL_MS = 60_000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastVisionRequestTime = 0;
let visionQueuePromise: Promise<unknown> = Promise.resolve();

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const enqueueVisionRequest = <T,>(task: () => Promise<T>) => {
  const run = async () => {
    const now = Date.now();
    const elapsed = now - lastVisionRequestTime;
    if (elapsed < MIN_VISION_INTERVAL_MS) {
      await sleep(MIN_VISION_INTERVAL_MS - elapsed);
    }

    const startedAt = Date.now();
    try {
      const result = await task();
      const finishedAt = Date.now();
      lastVisionRequestTime = finishedAt;
      return { result, startedAt, finishedAt };
    } catch (error) {
      lastVisionRequestTime = Date.now();
      throw error;
    }
  };

  const queued = visionQueuePromise
    .catch(() => undefined)
    .then(run);

  visionQueuePromise = queued.then(
    () => undefined,
    () => undefined
  );

  return queued;
};

export async function POST(request: Request) {
  const receivedAt = Date.now();

  let body: {
    imageDataUrl?: string;
    prompt?: string;
    model?: string;
    maxTokens?: number;
    timeoutMs?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体不是有效的 JSON' }, { status: 400 });
  }

  const { imageDataUrl, prompt, model, maxTokens, timeoutMs } = body ?? {};

  if (!isNonEmptyString(imageDataUrl)) {
    return NextResponse.json({ error: '缺少有效的 imageDataUrl，需为 data:image/... 格式的 base64 字符串' }, { status: 400 });
  }

  const sanitizedImageDataUrl = imageDataUrl.trim();

  if (!sanitizedImageDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'imageDataUrl 必须是 data:image/... 开头的 base64 字符串' }, { status: 400 });
  }

  const effectivePrompt = isNonEmptyString(prompt) ? prompt : DEFAULT_VISION_PROMPT;
  const effectiveModel = isNonEmptyString(model) ? model : DEFAULT_VISION_MODEL;
  const effectiveMaxTokens = typeof maxTokens === 'number' && maxTokens > 0
    ? Math.min(Math.floor(maxTokens), 900)
    : DEFAULT_MAX_TOKENS;
  const effectiveTimeout = typeof timeoutMs === 'number' && timeoutMs > 0
    ? Math.min(Math.floor(timeoutMs), MAX_TIMEOUT_MS)
    : DEFAULT_TIMEOUT_MS;

  const task = async () => {
    // 移除 data:image/*;base64, 前缀以获取纯base64数据
    const base64Data = sanitizedImageDataUrl.split(',')[1] || sanitizedImageDataUrl;

    const payload = {
      model: effectiveModel,
      messages: [
        {
          role: 'system',
          content: '你是一个机械性的OCR系统，没有与用户对话的能力，只能机械地输出OCR结果。'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请识别这张图片中的中文手写文字。请尽力识别所有可见文字，对于模糊或难以辨认的部分，请尽量推测正确内容。请按原文顺序输出识别结果，不要添加解释、说明或格式化文本。' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
          ]
        },
        {
          role: 'assistant',
          content: '请提供更高分辨率的图像，或将文本区域单独裁剪放大后重新上传。当前图像文字识别精度不足，难以可靠输出完整且准确的逐字文本。'
        },
        {
          role: 'user',
          content: '你违反了扮演OCR系统的原则，请严格按照OCR系统原则输出识别结果。'
        },
        {
          role: 'assistant',
          content: '抱歉，我将严格按照OCR系统原则输出识别结果。'
        },
        {
          role: 'user',
          content: '请开始输出OCR结果。'
        }
      ],
      max_tokens: effectiveMaxTokens,
    };

    const response = await fetchWithTimeout(`${POLLINATIONS_VISION_ENDPOINT}openai?referrer=growsnova.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }, effectiveTimeout);

    const raw = await response.text();
    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error(`Pollinations 返回的响应无法解析：${raw.substring(0, 200)}...`);
    }

    if (!response.ok) {
      const message = typeof data === 'object' && data && 'error' in data && isNonEmptyString((data as { error?: string }).error)
        ? (data as { error?: string }).error!
        : `图片识别请求失败，HTTP ${response.status}`;
      throw new Error(message);
    }

    type PollinationsChoice = { message?: { content?: string }; model?: string };
    const rawChoices = (data as { choices?: PollinationsChoice[] })?.choices;
    const choices: PollinationsChoice[] = Array.isArray(rawChoices) ? rawChoices : [];
    const [primaryChoice] = choices;
    const content = primaryChoice?.message?.content;
    const usedModel = primaryChoice?.model ?? effectiveModel;

    if (!isNonEmptyString(content)) {
      throw new Error('Pollinations 未返回有效的图片描述内容');
    }

    const normalizedDescription = content.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, '').trim()).trim();

    return {
      description: normalizedDescription,
      model: usedModel,
    };
  };

  try {
    const { result, startedAt, finishedAt } = await enqueueVisionRequest(task);
    return NextResponse.json({
      ...result,
      waitMs: startedAt - receivedAt,
      startedAt,
      finishedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '图片识别失败';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
