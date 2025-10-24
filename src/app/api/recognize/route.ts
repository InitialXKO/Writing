import { NextRequest, NextResponse } from 'next/server';

// 创建一个模拟的识别器类用于构建时和Vosk不可用时
class MockVoskRecognizer {
  async initialize() {}
  async recognize() {
    return {
      text: '语音识别服务需要服务器端配置。请确保已正确安装Vosk依赖。',
      confidence: 0.8,
      words: []
    };
  }
  async isReady() {
    return false;
  }
}

// 只在服务器运行时导入Vosk模块
let VoskRecognizerClass: any = MockVoskRecognizer;

// 在服务器运行时尝试导入真实的Vosk识别器
if (typeof window === 'undefined') {
  // 使用动态导入避免构建时错误
  import('./vosk-recognizer').then((module) => {
    VoskRecognizerClass = module.VoskRecognizer;
    console.log('Vosk识别器模块加载成功');
  }).catch((error) => {
    console.log('Vosk识别器模块加载失败，使用模拟模式:', (error as Error).message);
  });
}

async function getVoskRecognizer() {
  const recognizer = new VoskRecognizerClass();
  await recognizer.initialize();
  return recognizer;
}

export async function POST(request: NextRequest) {
  try {
    // 检查是否禁用Vosk
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