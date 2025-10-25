'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Mic, X, Loader2 } from 'lucide-react';

interface AudioCaptureResult {
  audioData: string;
  transcript: string;
}

interface MediaInputProps {
  onImageCapture: (imageData: string) => Promise<void>;
  onAudioCapture: (result: AudioCaptureResult) => Promise<void>;
  currentImage?: string;
  currentAudio?: string;
  onClear: () => void;
  onCancelRecognition?: () => void;
  disabled?: boolean;
  isRecognizing?: boolean;
}

export type { AudioCaptureResult };

export default function MediaInput({
  onImageCapture,
  onAudioCapture,
  currentImage,
  currentAudio,
  onClear,
  onCancelRecognition,
  disabled = false,
  isRecognizing = false
}: MediaInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasProcessingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const isActive = isProcessing || isRecognizing;

    if (isActive) {
      wasProcessingRef.current = true;
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setProgress(0);
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 92) {
            return prev;
          }
          const next = prev + Math.random() * 12 + 6;
          return next >= 92 ? 92 : next;
        });
      }, 450);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }

      if (wasProcessingRef.current) {
        setProgress(100);
        completionTimerRef.current = setTimeout(() => {
          setProgress(0);
          wasProcessingRef.current = false;
        }, 500);
      } else {
        setProgress(0);
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, [isProcessing, isRecognizing]);

  const resetProcessingState = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    setIsProcessing(false);
    wasProcessingRef.current = false;
    setProgress(0);
    setProgressMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleCancelProcessing = () => {
    resetProcessingState();
    onCancelRecognition?.();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    try {
      setProgressMessage('手写作文识别中，请稍候...');
      const base64Data = await readFileAsDataURL(file);
      await onImageCapture(base64Data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.info('图片上传识别已取消');
      } else {
        console.error('上传图片失败:', error);
        alert('上传图片失败');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProgressMessage('手写作文识别中，请稍候...');
      const base64Data = await readFileAsDataURL(file);
      await onImageCapture(base64Data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.info('拍照识别已取消');
      } else {
        console.error('拍照失败:', error);
        alert('拍照失败');
      }
    } finally {
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别，请使用 Chrome、Edge 或 Safari 浏览器');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = finalTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setFinalTranscript(finalText);
      setTranscript(finalText + interimText);
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      alert(`语音识别出错: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  };


  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      console.log('🎤 最终识别结果:', finalTranscript);
      
      setIsProcessing(true);
      setProgressMessage('正在处理语音识别结果...');
      
      try {
        await onAudioCapture({
          audioData: '',
          transcript: finalTranscript
        });
      } finally {
        setIsProcessing(false);
        setProgressMessage('');
        setTranscript('');
        setFinalTranscript('');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(Math.round(progress), 100);
  const showProgress = isRecognizing || isProcessing || progress > 0;

  if (showProgress) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-morandi-gray-300 rounded-xl bg-white text-center">
        <Loader2 className="w-12 h-12 text-morandi-blue-500 animate-spin" />
        <div>
          <p className="text-morandi-gray-700 font-medium">
            {progressMessage || '正在识别手写作文，请稍候...'}
          </p>
          <p className="text-xs text-morandi-gray-500 mt-1">如果识别时间较长，请稍候片刻</p>
        </div>
        <div className="w-full max-w-xs h-2 bg-morandi-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-morandi-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-morandi-gray-500 mb-2">{progressPercentage}%</p>
        {onCancelRecognition && isRecognizing && (
          <button
            onClick={handleCancelProcessing}
            className="px-6 py-2 bg-morandi-red-500 hover:bg-morandi-red-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            取消识别
          </button>
        )}
      </div>
    );
  }

  if (currentImage) {
    return (
      <div className="relative border-2 border-morandi-gray-300 rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-morandi-gray-700">手写作文图片</h3>
          <button
            onClick={onClear}
            disabled={disabled}
            className="p-2 text-morandi-gray-600 hover:text-morandi-red-600 hover:bg-morandi-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="清除图片并恢复稿纸"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <img
          src={currentImage}
          alt="手写作文"
          className="w-full h-auto max-h-[600px] object-contain rounded-lg shadow-md"
        />
      </div>
    );
  }

  if (currentAudio) {
    return (
      <div className="relative border-2 border-morandi-gray-300 rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-morandi-gray-700">语音作文</h3>
          <button
            onClick={onClear}
            disabled={disabled}
            className="p-2 text-morandi-gray-600 hover:text-morandi-red-600 hover:bg-morandi-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="清除音频并恢复稿纸"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <audio
          src={currentAudio}
          controls
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isRecording || isProcessing || isRecognizing}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-morandi-gray-300 rounded-xl hover:border-morandi-blue-500 hover:bg-morandi-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-8 h-8 text-morandi-blue-600" />
          <span className="text-sm font-medium text-morandi-gray-700">上传图片</span>
          <span className="text-xs text-morandi-gray-500">支持 JPG、PNG 等格式</span>
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || isRecording || isProcessing || isRecognizing}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-morandi-gray-300 rounded-xl hover:border-morandi-green-500 hover:bg-morandi-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-8 h-8 text-morandi-green-600" />
          <span className="text-sm font-medium text-morandi-gray-700">拍摄照片</span>
          <span className="text-xs text-morandi-gray-500">使用相机拍摄手写作文</span>
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || isProcessing || isRecognizing}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-morandi-gray-300 rounded-xl hover:border-morandi-pink-500 hover:bg-morandi-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-8 h-8 text-morandi-pink-600" />
            <span className="text-sm font-medium text-morandi-gray-700">语音录制</span>
            <span className="text-xs text-morandi-gray-500">录制你的作文朗读</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-morandi-pink-500 bg-morandi-pink-50 rounded-xl animate-pulse"
          >
            <div className="w-8 h-8 bg-morandi-pink-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-sm font-medium text-morandi-pink-700">停止识别</span>
          </button>
        )}
      </div>

      {isRecording && (
        <div className="mt-4 p-4 bg-morandi-pink-50 border border-morandi-pink-200 rounded-xl">
          <h4 className="text-sm font-medium text-morandi-pink-800 mb-2 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            实时识别
          </h4>
          <p className="text-sm text-morandi-gray-700 whitespace-pre-wrap min-h-[80px]">
            {transcript || '正在聆听，请开始说话...'}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
}
