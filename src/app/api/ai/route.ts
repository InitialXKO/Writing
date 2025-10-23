import { NextRequest, NextResponse } from 'next/server';
import { getActualEndpoint } from '@/lib/utils';

const POLLINATIONS_BASE_URL = 'https://text.pollinations.ai';
const POLLINATIONS_TIMEOUT_MS = 20_000;
const RATE_LIMIT_WINDOW_MS = 3_000; // Pollinations 推荐约 3 秒 1 次

interface PollinationsModel {
  provider: string;
  model: string;
  label: string;
}

const POLLINATIONS_FALLBACK_MODELS: PollinationsModel[] = [
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    label: 'OpenAI GPT-4o mini (Pollinations)',
  },
  {
    provider: 'mistral',
    model: 'mistral-small-latest',
    label: 'Mistral Small Latest (Pollinations)',
  },
  {
    provider: 'meta',
    model: 'llama-3.1-70b-instruct',
    label: 'Meta Llama 3.1 70B Instruct (Pollinations)',
  },
];

const globalScope = globalThis as unknown as {
  __pollinationsRateLimitMap?: Map<string, number>;
};

if (!globalScope.__pollinationsRateLimitMap) {
  globalScope.__pollinationsRateLimitMap = new Map<string, number>();
}

const pollinationsRateLimitMap = globalScope.__pollinationsRateLimitMap;

const createResponse = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });

const getClientIp = (req: NextRequest): string => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return req.ip ?? 'unknown';
};

const fetchWithTimeout = async (input: string, init: RequestInit, timeout = POLLINATIONS_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const normalisePollinationsPayload = (raw: any, model: PollinationsModel) => {
  if (raw && typeof raw === 'object' && raw.choices && Array.isArray(raw.choices)) {
    const firstChoice = raw.choices[0];
    if (firstChoice?.message?.content) {
      return {
        ...raw,
        model: raw.model ?? `${model.provider}:${model.model}`,
        choices: raw.choices.map((choice: any, index: number) => ({
          index,
          finish_reason: choice.finish_reason ?? 'stop',
          message: {
            role: choice.message?.role ?? 'assistant',
            content: choice.message?.content ?? '',
          },
          provider: model.provider,
        })),
      };
    }
  }

  if (raw && typeof raw === 'object' && typeof raw.response === 'string') {
    return {
      id: `pollinations-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: `${model.provider}:${model.model}`,
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: raw.response,
          },
          provider: model.provider,
        },
      ],
    };
  }

  if (typeof raw === 'string') {
    return {
      id: `pollinations-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: `${model.provider}:${model.model}`,
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: raw,
          },
          provider: model.provider,
        },
      ],
    };
  }

  return {
    id: `pollinations-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: `${model.provider}:${model.model}`,
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: JSON.stringify(raw ?? {}),
        },
        provider: model.provider,
      },
    ],
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { messages, model, temperature, maxTokens, apiKey, baseURL } = body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return createResponse({ error: { message: 'messages 参数必须为非空数组' } }, 400);
    }

    const resolvedTemperature = typeof temperature === 'number' ? temperature : 0.7;
    const resolvedMaxTokens = typeof maxTokens === 'number' ? maxTokens : 1500;

    if (typeof apiKey === 'string' && apiKey.trim()) {
      const endpoint = getActualEndpoint(typeof baseURL === 'string' && baseURL ? baseURL : undefined);

      const upstreamResponse = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: typeof model === 'string' && model.trim() ? model : 'gpt-4',
          messages,
          temperature: resolvedTemperature,
          max_tokens: resolvedMaxTokens,
        }),
      });

      const responseText = await upstreamResponse.text();
      const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';

      return new NextResponse(responseText, {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
        },
      });
    }

    const clientIp = getClientIp(req);
    const now = Date.now();
    const lastHit = pollinationsRateLimitMap.get(clientIp) ?? 0;
    const elapsed = now - lastHit;

    if (elapsed < RATE_LIMIT_WINDOW_MS) {
      const retryAfterMs = RATE_LIMIT_WINDOW_MS - elapsed;
      return createResponse(
        {
          error: {
            message: '请求过于频繁，请稍后再试（Pollinations 限流保护）',
            type: 'rate_limit',
            retry_after: Math.ceil(retryAfterMs / 1000),
          },
        },
        429,
      );
    }

    pollinationsRateLimitMap.set(clientIp, now);

    let lastError: unknown = null;

    const preferredModelIndex = POLLINATIONS_FALLBACK_MODELS.findIndex(
      (item) => typeof model === 'string' && model.toLowerCase().includes(item.model.toLowerCase()),
    );

    const orderedModels = preferredModelIndex > -1
      ? [
          POLLINATIONS_FALLBACK_MODELS[preferredModelIndex],
          ...POLLINATIONS_FALLBACK_MODELS.filter((_, idx) => idx !== preferredModelIndex),
        ]
      : POLLINATIONS_FALLBACK_MODELS;

    for (const candidate of orderedModels) {
      try {
        const pollinationsResponse = await fetchWithTimeout(
          `${POLLINATIONS_BASE_URL}/${candidate.provider}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: candidate.model,
              messages,
              temperature: resolvedTemperature,
              max_tokens: resolvedMaxTokens,
              stream: false,
            }),
          },
          POLLINATIONS_TIMEOUT_MS,
        );

        if (!pollinationsResponse.ok) {
          const errorPreview = await pollinationsResponse.text();
          lastError = new Error(
            `模型 ${candidate.provider}/${candidate.model} 调用失败: ${pollinationsResponse.status} ${pollinationsResponse.statusText} - ${errorPreview.substring(0, 200)}...`,
          );
          continue;
        }

        const contentType = pollinationsResponse.headers.get('content-type') ?? '';
        let parsed: any;

        if (contentType.includes('application/json')) {
          try {
            parsed = await pollinationsResponse.json();
          } catch (error) {
            lastError = error;
            continue;
          }
        } else {
          const textPayload = await pollinationsResponse.text();
          parsed = textPayload;
        }

        const normalised = normalisePollinationsPayload(parsed, candidate);
        return createResponse({ ...normalised, provider: candidate.provider });
      } catch (error) {
        lastError = error;
      }
    }

    return createResponse(
      {
        error: {
          message: `Pollinations 模型全部调用失败: ${lastError instanceof Error ? lastError.message : '未知错误'}`,
        },
      },
      502,
    );
  } catch (error) {
    console.error('AI 路由处理失败:', error);
    return createResponse(
      {
        error: {
          message: error instanceof Error ? error.message : '服务器内部错误',
        },
      },
      500,
    );
  }
}
