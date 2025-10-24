'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Mic, X, Loader2 } from 'lucide-react';

interface MediaInputProps {
  onImageCapture: (imageData: string) => Promise<void>;
  onAudioCapture: (audioData: string) => Promise<void>;
  currentImage?: string;
  currentAudio?: string;
  onClear: () => void;
  disabled?: boolean;
}

export default function MediaInput({
  onImageCapture,
  onAudioCapture,
  currentImage,
  currentAudio,
  onClear,
  disabled = false
}: MediaInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        await onImageCapture(base64Data);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('读取文件失败');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('上传图片失败');
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        await onImageCapture(base64Data);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('读取照片失败');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('拍照失败:', error);
      alert('拍照失败');
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          setIsProcessing(true);
          try {
            await onAudioCapture(base64Data);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('启动录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-12 border-2 border-morandi-gray-300 rounded-xl bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-morandi-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-morandi-gray-600">正在处理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isRecording}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-morandi-gray-300 rounded-xl hover:border-morandi-blue-500 hover:bg-morandi-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-8 h-8 text-morandi-blue-600" />
          <span className="text-sm font-medium text-morandi-gray-700">上传图片</span>
          <span className="text-xs text-morandi-gray-500">支持 JPG、PNG 等格式</span>
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || isRecording}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-morandi-gray-300 rounded-xl hover:border-morandi-green-500 hover:bg-morandi-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-8 h-8 text-morandi-green-600" />
          <span className="text-sm font-medium text-morandi-gray-700">拍摄照片</span>
          <span className="text-xs text-morandi-gray-500">使用相机拍摄手写作文</span>
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
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
            <span className="text-sm font-medium text-morandi-pink-700">停止录音</span>
            <span className="text-xs text-morandi-pink-600 font-mono">{formatTime(recordingTime)}</span>
          </button>
        )}
      </div>

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
