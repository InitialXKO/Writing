'use client';

import { useState, useRef } from 'react';

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

// 使用浏览器内置的SpeechRecognition作为语音识别引擎
class BrowserSpeechRecognizer {
  async recognize(audioBlob: Blob): Promise<RecognitionResult> {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        return {
          text: "您的浏览器不支持语音识别，请使用 Chrome、Edge 或 Safari 浏览器。",
          confidence: 0.0,
          words: []
        };
      }

      // 创建音频元素用于播放
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = false;

      return new Promise((resolve, reject) => {
        let finalTranscript = '';
        let hasReceivedResult = false;

        recognition.onresult = (event: any) => {
          hasReceivedResult = true;
          let transcript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }

          finalTranscript += transcript;
        };

        recognition.onerror = (event: any) => {
          console.error('语音识别错误:', event.error);
          URL.revokeObjectURL(audioUrl);
          
          if (event.error === 'no-speech') {
            resolve({
              text: '',
              confidence: 0.0,
              words: []
            });
          } else {
            reject(new Error(`语音识别失败: ${event.error}`));
          }
        };

        recognition.onend = () => {
          URL.revokeObjectURL(audioUrl);
          
          resolve({
            text: finalTranscript.trim(),
            confidence: 0.9,
            words: []
          });
        };

        // 开始识别
        recognition.start();

        // 播放音频以触发识别
        audioElement.play().catch(err => {
          console.warn('播放音频失败:', err);
        });

        // 设置超时
        setTimeout(() => {
          if (!hasReceivedResult) {
            recognition.stop();
            URL.revokeObjectURL(audioUrl);
            resolve({
              text: '',
              confidence: 0.0,
              words: []
            });
          }
        }, 30000);
      });
    } catch (error) {
      console.error('语音识别出错:', error);
      return {
        text: '',
        confidence: 0.0,
        words: []
      };
    }
  }
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [recognitionResults, setRecognitionResults] = useState<Record<string, RecognitionResult>>({});
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognizerRef = useRef<BrowserSpeechRecognizer | null>(null);
  const currentSegmentRef = useRef<string | null>(null);

  // 初始化识别器
  if (!recognizerRef.current) {
    recognizerRef.current = new BrowserSpeechRecognizer();
  }

  const recognizeSegment = async (segmentId: string, audioBlob: Blob) => {
    if (!recognizerRef.current || isRecognizing) {
      return;
    }

    setIsRecognizing(true);
    currentSegmentRef.current = segmentId;

    try {
      const result = await recognizerRef.current.recognize(audioBlob);
      
      if (currentSegmentRef.current === segmentId) {
        setRecognitionResults(prev => ({
          ...prev,
          [segmentId]: result
        }));
      }
    } catch (error) {
      console.error(`识别分段 ${segmentId} 时出错:`, error);
      
      if (currentSegmentRef.current === segmentId) {
        setRecognitionResults(prev => ({
          ...prev,
          [segmentId]: {
            text: '',
            confidence: 0.0,
            words: []
          }
        }));
      }
    } finally {
      if (currentSegmentRef.current === segmentId) {
        setIsRecognizing(false);
        currentSegmentRef.current = null;
      }
    }
  };

  const cancelRecognition = (segmentId: string) => {
    if (currentSegmentRef.current === segmentId) {
      currentSegmentRef.current = null;
      setIsRecognizing(false);
    }
  };

  return {
    isRecognizing,
    recognitionResults,
    recognizeSegment,
    cancelRecognition
  };
}
