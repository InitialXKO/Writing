'use client';

import { useState, useRef, useEffect } from 'react';

interface RecognitionResult {
  text: string;
  confidence: number;
  words: { word: string; start: number; end: number }[];
}

interface UseVoiceRecognitionReturn {
  isRecognizing: boolean;
  recognitionResults: Record<string, RecognitionResult>;
  recognizeSegment: (segmentId: string, audioBlob: Blob) => Promise<void>;
  cancelRecognition: (segmentId: string) => void;
}

// Vosk识别器 - 调用服务器端API
class VoskRecognizer {
  private isProcessing: boolean = false;
  private apiEndpoint: string;

  constructor() {
    // 根据环境设置API端点
    this.apiEndpoint = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001/api/recognize'
      : '/api/recognize'; // 生产环境使用相对路径
  }

  async recognize(audioBlob: Blob): Promise<RecognitionResult> {
    this.isProcessing = true;

    try {
      // 将音频Blob转换为16kHz单声道PCM格式
      const pcmBuffer = await this.convertAudioToPCM(audioBlob);

      // 调用Vosk API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: pcmBuffer,
      });

      if (!response.ok) {
        throw new Error(`Vosk API请求失败: ${response.status}`);
      }

      const result = await response.json();

      this.isProcessing = false;
      return {
        text: result.text || '',
        confidence: result.confidence || 0.9,
        words: result.words || []
      };
    } catch (error) {
      this.isProcessing = false;

      // 如果Vosk API调用失败，使用浏览器内置的SpeechRecognition作为备选方案
      console.warn('Vosk识别失败，尝试使用浏览器内置API:', error);
      return this.fallbackToBrowserSpeechRecognition(audioBlob);
    }
  }

  // 将音频转换为16kHz单声道PCM格式
  private async convertAudioToPCM(audioBlob: Blob): Promise<ArrayBuffer> {
    try {
      // 创建一个AudioContext来处理音频
      const audioContext = new AudioContext({ sampleRate: 16000 });

      // 将Blob转换为AudioBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 如果是多声道，转换为单声道
      const monoBuffer = this.convertToMono(audioBuffer);

      // 转换为PCM数据
      const pcmData = this.audioBufferToPCM(monoBuffer);

      audioContext.close();
      return pcmData;
    } catch (error) {
      console.error('音频转换失败:', error);
      // 如果转换失败，直接返回原始ArrayBuffer
      return audioBlob.arrayBuffer();
    }
  }

  // 将多声道音频转换为单声道
  private convertToMono(audioBuffer: AudioBuffer): AudioBuffer {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer;
    }

    const monoBuffer = new AudioContext().createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const monoData = monoBuffer.getChannelData(0);
    const numChannels = audioBuffer.numberOfChannels;

    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < numChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i];
      }
      monoData[i] = sum / numChannels;
    }

    return monoBuffer;
  }

  // 将AudioBuffer转换为PCM数据
  private audioBufferToPCM(audioBuffer: AudioBuffer): ArrayBuffer {
    const samples = audioBuffer.length;
    const pcmBuffer = new ArrayBuffer(samples * 2); // 16-bit PCM
    const pcmView = new DataView(pcmBuffer);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      // 将浮点数转换为16-bit整数
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      pcmView.setInt16(i * 2, intSample, true); // little-endian
    }

    return pcmBuffer;
  }

  // 浏览器内置SpeechRecognition备选方案
  private async fallbackToBrowserSpeechRecognition(audioBlob: Blob): Promise<RecognitionResult> {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        // 如果浏览器不支持语音识别，返回模拟结果
        resolve({
          text: "语音识别功能需要浏览器支持或配置Vosk服务器。",
          confidence: 0.8,
          words: []
        });
        return;
      }

      // 创建临时音频元素来播放并识别
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve({
          text: transcript,
          confidence: event.results[0][0].confidence || 0.8,
          words: []
        });
      };

      recognition.onerror = () => {
        resolve({
          text: "浏览器语音识别失败。",
          confidence: 0.5,
          words: []
        });
      };

      // 开始播放音频并识别
      audio.play();
      recognition.start();
    });
  }

  cancel() {
    this.isProcessing = false;
  }

  isProcessing(): boolean {
    return this.isProcessing;
  }

  destroy() {
    // 无需特殊清理
  }
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<Record<string, RecognitionResult>>({});

  const recognizerRef = useRef<VoskRecognizer | null>(null);
  const recognitionControllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    // 初始化Vosk识别器
    recognizerRef.current = new VoskRecognizer();

    return () => {
      // 清理所有正在进行的识别
      Object.values(recognitionControllersRef.current).forEach(controller => {
        controller.abort();
      });

      // 销毁识别器
      if (recognizerRef.current) {
        recognizerRef.current.destroy();
      }
    };
  }, []);

  const recognizeSegment = async (segmentId: string, audioBlob: Blob) => {
    if (!recognizerRef.current) {
      throw new Error('识别器未初始化');
    }

    setIsRecognizing(true);

    try {
      // 创建新的AbortController用于取消识别
      const controller = new AbortController();
      recognitionControllersRef.current[segmentId] = controller;

      // 执行识别
      const result = await recognizerRef.current.recognize(audioBlob);

      // 检查是否被取消
      if (controller.signal.aborted) {
        return;
      }

      // 更新识别结果
      setRecognitionResults(prev => ({
        ...prev,
        [segmentId]: result
      }));

      // 清理控制器
      delete recognitionControllersRef.current[segmentId];
    } catch (error) {
      console.error(`识别分段 ${segmentId} 时出错:`, error);
      throw error;
    } finally {
      // 检查是否还有正在进行的识别
      const hasActiveRecognition = Object.keys(recognitionControllersRef.current).length > 0;
      if (!hasActiveRecognition) {
        setIsRecognizing(false);
      }
    }
  };

  const cancelRecognition = (segmentId: string) => {
    if (recognitionControllersRef.current[segmentId]) {
      recognitionControllersRef.current[segmentId].abort();
      delete recognitionControllersRef.current[segmentId];

      // 检查是否还有正在进行的识别
      const hasActiveRecognition = Object.keys(recognitionControllersRef.current).length > 0;
      if (!hasActiveRecognition) {
        setIsRecognizing(false);
      }
    }
  };

  return {
    isRecognizing,
    recognitionResults,
    recognizeSegment,
    cancelRecognition
  };
};