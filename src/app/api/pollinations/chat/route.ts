import { NextResponse } from 'next/server';

type PollinationsRole = 'system' | 'user' | 'assistant';

type PollinationsMessage = {
  role: PollinationsRole;
  content: string;
};

type PollinationsRequestPayload = {
  messages: unknown;
  seed?: number;
  model?: string;
  fallbackModels?: string[];
  jsonMode?: boolean;
  timeoutMs?: number;
  apiKey?: string;
};

const POLLINATIONS_ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';
const POLLINATIONS_DEFAULT_MODELS = ['openai', 'claude-hybrid', 'mistral'];
const DEFAULT_SEED = 42;
const DEFAULT_TIMEOUT_MS = 20000;
const MAX_TIMEOUT_MS = 60000;
const MIN_INTERVAL_MS = 3000;
const MAX_CONCURRENT_REQUESTS_PER_IP = 1;
const RATE_LIMIT_CLEANUP_THRESHOLD = 1000;
const RATE_LIMIT_STALE_WINDOW_MS = 5 * 60 * 1000;

type RateLimitState = {
  lastRequestTime: number;
  activeRequests: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const sanitizeMessages = (messages: unknown): PollinationsMessage[] => {
  if (!Array.isArray(messages)) {
    throw new Error('messages 字段必须是数组');
  }

  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') {
        return null;
      }

      const { role, content } = message as Partial<PollinationsMessage>;

      if (!isNonEmptyString(role) || !isNonEmptyString(content)) {
        return null;
      }

      if (!['system', 'user', 'assistant'].includes(role)) {
        return null;
      }

      return {
        role: role as PollinationsRole,
        content,
      };
    })
    .filter((message): message is PollinationsMessage => Boolean(message));
};

const dedupeModels = (models: (string | undefined)[]): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();

  models.forEach((model) => {
    if (!isNonEmptyString(model)) {
      return;
    }
    const normalized = model.trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  });

  return result;
};

const cleanMarkdown = (data: string): string => {
  const match = data.match(/```([\s\S]*?)```/);
  return match ? match[1] : data;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
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

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
};

export async function POST(request: Request) {
  let payload: PollinationsRequestPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法的 JSON' }, { status: 400 });
  }

  let messages: PollinationsMessage[];
  try {
    messages = sanitizeMessages(payload.messages);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'messages 字段解析失败' },
      { status: 400 }
    );
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: 'messages 字段不能为空' }, { status: 400 });
  }

  const seed = typeof payload.seed === 'number' ? payload.seed : DEFAULT_SEED;
  const timeoutMs =
    typeof payload.timeoutMs === 'number' && payload.timeoutMs > 0
      ? Math.min(payload.timeoutMs, MAX_TIMEOUT_MS)
      : DEFAULT_TIMEOUT_MS;
  const jsonMode = Boolean(payload.jsonMode);

  const candidateModels = dedupeModels([
    payload.model,
    ...(Array.isArray(payload.fallbackModels) ? payload.fallbackModels : []),
    ...POLLINATIONS_DEFAULT_MODELS,
  ]);

  if (candidateModels.length === 0) {
    candidateModels.push('openai');
  }

  const ip = getClientIp(request);
  const now = Date.now();

  const authHeader = request.headers.get('authorization');
  const pollinationsKey =
    payload.apiKey ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined) ||
    process.env.POLLINATIONS_API_KEY ||
    process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY;

  const hasApiKey = isNonEmptyString(pollinationsKey);

  // 如果配置了 API Key，不应用紧缩的单 IP 频率限制
  if (!hasApiKey) {
    if (rateLimitStore.size > RATE_LIMIT_CLEANUP_THRESHOLD) {
      const cutoff = now - RATE_LIMIT_STALE_WINDOW_MS;
      rateLimitStore.forEach((value, key) => {
        if (value.activeRequests === 0 && value.lastRequestTime < cutoff) {
          rateLimitStore.delete(key);
        }
      });
    }

    const state = rateLimitStore.get(ip) ?? { lastRequestTime: 0, activeRequests: 0 };

    if (state.activeRequests >= MAX_CONCURRENT_REQUESTS_PER_IP) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试。您可以在“设置”中配置 Pollinations API Key 解除频率限制。', retryAfter: '3' },
        {
          status: 429,
          headers: {
            'Retry-After': '3',
          },
        }
      );
    }

    const elapsed = now - state.lastRequestTime;
    if (elapsed < MIN_INTERVAL_MS) {
      const retryAfter = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `请求过于频繁，请在 ${retryAfter} 秒后再试。建议在“设置”中配置 Pollinations API Key。`, retryAfter: retryAfter.toString() },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    state.activeRequests += 1;
    rateLimitStore.set(ip, state);
  }

  try {
    const errors: { model: string; error: string }[] = [];

    for (const model of candidateModels) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (hasApiKey) {
          headers['Authorization'] = `Bearer ${pollinationsKey}`;
        }

        const requestBody: Record<string, unknown> = {
          messages,
          model,
          seed,
        };

        if (jsonMode) {
          requestBody.response_format = { type: 'json_object' };
        }

        const response = await fetchWithTimeout(
          POLLINATIONS_ENDPOINT,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            cache: 'no-store',
          },
          timeoutMs
        );

        const raw = await response.text();
        let jsonRes: any = null;
        try {
          jsonRes = raw ? JSON.parse(raw) : null;
        } catch {
          // not json
        }

        if (!response.ok) {
          const errMsg = jsonRes?.error?.message || jsonRes?.error || raw.substring(0, 200);
          throw new Error(`HTTP ${response.status}: ${errMsg}`);
        }

        let contentText = '';
        if (jsonRes && Array.isArray(jsonRes.choices) && jsonRes.choices.length > 0) {
          contentText = jsonRes.choices[0]?.message?.content || '';
        } else {
          contentText = raw;
        }

        let content: unknown;
        if (jsonMode) {
          try {
            content = JSON.parse(contentText);
          } catch {
            content = cleanMarkdown(contentText);
          }
        } else {
          content = cleanMarkdown(contentText);
        }

        return NextResponse.json({
          content,
          model,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.name === 'AbortError'
              ? '请求 Pollinations 超时'
              : error.message
            : '未知错误';
        errors.push({ model, error: message });
      }
    }

    return NextResponse.json(
      { error: '所有模型均未能返回有效结果', attempts: errors },
      { status: 502 }
    );
  } finally {
    if (!hasApiKey) {
      const state = rateLimitStore.get(ip);
      if (state) {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
        state.lastRequestTime = Date.now();
        rateLimitStore.set(ip, state);
      }
    }
  }
}
