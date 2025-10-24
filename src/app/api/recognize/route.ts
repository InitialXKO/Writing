import { NextRequest, NextResponse } from 'next/server';
import { VoskRecognizer } from './vosk-recognizer';

// 初始化Vosk识别器（单例模式）
let voskRecognizer: VoskRecognizer | null = null;

async function getVoskRecognizer(): Promise<VoskRecognizer> {
  if (!voskRecognizer) {
    voskRecognizer = new VoskRecognizer();
    await voskRecognizer.initialize();
  }
  return voskRecognizer;
}

export async function POST(request: NextRequest) {
  try {
    // 检查是否支持Vosk（服务器端需要安装Vosk依赖）
    if (process.env.DISABLE_VOSK === 'true') {
      return NextResponse.json({
        text: '语音识别服务暂时不可用。请确保已正确配置Vosk服务器。',
        confidence: 0.8,
        words: []
      });
    }

    // 获取请求体（PCM音频数据）
    const audioBuffer = await request.arrayBuffer();

    // 获取Vosk识别器
    const recognizer = await getVoskRecognizer();

    // 执行语音识别
    const result = await recognizer.recognize(audioBuffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('语音识别API错误:', error);

    // 返回备选结果
    return NextResponse.json({
      text: '语音识别服务暂时不可用。请检查服务器配置。',
      confidence: 0.5,
      words: []
    }, { status: 500 });
  }
}

// 健康检查端点
export async function GET() {
  try {
    const recognizer = await getVoskRecognizer();
    const isReady = await recognizer.isReady();

    return NextResponse.json({
      status: isReady ? 'ready' : 'initializing',
      message: isReady ? 'Vosk语音识别服务已就绪' : 'Vosk语音识别服务初始化中'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Vosk语音识别服务不可用'
    }, { status: 503 });
  }
}