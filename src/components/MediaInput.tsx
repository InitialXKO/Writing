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
  disabled?: boolean;
  // 进度状态回调函数
  onProgressStart?: () => void;
  onProgressUpdate?: (progress: number, message: string) => void;
  onProgressComplete?: (success: boolean, message?: string) => void;
}

export type { AudioCaptureResult };

export default function MediaInput({
  onImageCapture,
  onAudioCapture,
  currentImage,
  currentAudio,
  onClear,
  disabled = false,
  onProgressStart,
  onProgressUpdate,
  onProgressComplete
}: MediaInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscriptDisplay, setFinalTranscriptDisplay] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasProcessingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    console.log('isProcessing changed:', isProcessing);
    if (isProcessing) {
      wasProcessingRef.current = true;
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      // 不再自动重置进度，让处理逻辑自己控制
      // setProgress(0);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
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
  }, [isProcessing]);

  // 添加调试日志来追踪关键状态变化
  useEffect(() => {
    console.log('Progress changed:', progress);
  }, [progress]);

  useEffect(() => {
    console.log('Show completion changed:', showCompletion);
  }, [showCompletion]);

  useEffect(() => {
    console.log('Current image changed:', currentImage ? 'has image' : 'no image');
  }, [currentImage]);


  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  };

  // 下采样图片到合适尺寸的函数
  const resizeImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;

        // 计算缩放比例
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(Math.min(scaleX, scaleY), 1); // 不放大图片

        // 如果图片尺寸已经在合理范围内，直接返回原图
        if (scale >= 1) {
          resolve(file);
          return;
        }

        // 计算新尺寸
        const newWidth = Math.floor(width * scale);
        const newHeight = Math.floor(height * scale);

        // 创建canvas进行缩放
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }

        // 在canvas上绘制缩放后的图片
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // 转换为Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片转换失败'));
          }
        }, 'image/jpeg', 0.8); // 使用JPEG格式并设置质量为80%
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };

      img.src = url;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setIsProcessing(true);
    if (onProgressStart) onProgressStart();
    setProgressMessage('正在上传图片...');
    if (onProgressUpdate) onProgressUpdate(10, '正在上传图片...');
    setProgress(10);
    setShowCompletion(false);

    // 模拟上传进度
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 40) {
          clearInterval(uploadInterval);
          return prev;
        }
        const newProgress = prev + Math.random() * 15 + 5;
        if (onProgressUpdate) onProgressUpdate(newProgress, '正在上传图片...');
        return newProgress;
      });
    }, 200);

    try {
      // 等待上传进度达到40%
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 下采样图片
      setProgressMessage('正在优化图片...');
      if (onProgressUpdate) onProgressUpdate(40, '正在优化图片...');
      const resizedBlob = await resizeImage(file);
      const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });

      const base64Data = await readFileAsDataURL(resizedFile);

      // 更新进度到60%
      setProgress(60);
      if (onProgressUpdate) onProgressUpdate(60, '正在进行图片识别...');
      setProgressMessage('正在进行图片识别...');

      // 模拟识别进度
      const recognitionInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(recognitionInterval);
            return prev;
          }
          const newProgress = prev + Math.random() * 8 + 4;
          if (onProgressUpdate) onProgressUpdate(newProgress, '正在进行图片识别...');
          return newProgress;
        });
      }, 300);

      // 添加调试信息
      console.log('发送图片到Pollinations API进行OCR识别');

      // 模拟处理进度到90%
      setProgress(90);
      if (onProgressUpdate) onProgressUpdate(90, '正在处理...');
      setProgressMessage('正在处理...');

      // 调用回调函数进行AI识别，等待解析完成
      await onImageCapture(base64Data);

      // 在AI识别完成后，通知父组件处理已完成
      setIsProcessing(false);
      setProgress(100);
      if (onProgressUpdate) onProgressUpdate(100, '处理完成');
      setProgressMessage('处理完成');
      setShowCompletion(true);
      if (onProgressComplete) onProgressComplete(true, '处理完成');
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('上传图片失败');

      // 出错时也重置状态
      setIsProcessing(false);
      setProgressMessage('');
      setProgress(0);
      setShowCompletion(false);
      if (onProgressComplete) onProgressComplete(false, '上传图片失败');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    if (onProgressStart) onProgressStart();
    setProgressMessage('正在处理拍照...');
    if (onProgressUpdate) onProgressUpdate(10, '正在处理拍照...');
    setProgress(10);
    setShowCompletion(false);

    // 模拟拍照处理进度
    const processInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 40) {
          clearInterval(processInterval);
          return prev;
        }
        const newProgress = prev + Math.random() * 15 + 5;
        if (onProgressUpdate) onProgressUpdate(newProgress, '正在处理拍照...');
        return newProgress;
      });
    }, 200);

    try {
      // 等待处理进度达到40%
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 下采样图片
      setProgressMessage('正在优化图片...');
      if (onProgressUpdate) onProgressUpdate(40, '正在优化图片...');
      const resizedBlob = await resizeImage(file);
      const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });

      const base64Data = await readFileAsDataURL(resizedFile);

      // 更新进度到60%
      setProgress(60);
      if (onProgressUpdate) onProgressUpdate(60, '正在进行图片识别...');
      setProgressMessage('正在进行图片识别...');

      // 模拟识别进度
      const recognitionInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(recognitionInterval);
            return prev;
          }
          const newProgress = prev + Math.random() * 8 + 4;
          if (onProgressUpdate) onProgressUpdate(newProgress, '正在进行图片识别...');
          return newProgress;
        });
      }, 300);

      // 模拟处理进度到90%
      setProgress(90);
      if (onProgressUpdate) onProgressUpdate(90, '正在处理...');
      setProgressMessage('正在处理...');

      // 调用回调函数进行AI识别，等待解析完成
      await onImageCapture(base64Data);

      // 在AI识别完成后，通知父组件处理已完成
      setIsProcessing(false);
      setProgress(100);
      if (onProgressUpdate) onProgressUpdate(100, '处理完成');
      setProgressMessage('处理完成');
      setShowCompletion(true);
      if (onProgressComplete) onProgressComplete(true, '处理完成');
    } catch (error) {
      console.error('拍照失败:', error);
      alert('拍照失败');

      // 出错时也重置状态
      setIsProcessing(false);
      setProgressMessage('');
      setProgress(0);
      setShowCompletion(false);
      if (onProgressComplete) onProgressComplete(false, '拍照失败');
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 检查支持的音频格式，优先使用支持的格式
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      // 如果都不支持，使用默认配置
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = null;

      mediaRecorder.start();

      setIsRecording(true);
      setRecordingTime(0);
      setInterimTranscript('正在录音...');
      setFinalTranscriptDisplay('');

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('启动录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 将录制的音频数据转换为WAV格式
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();

        // 解码音频数据
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // 创建WAV文件头和数据
        const wavBuffer = encodeWav(audioBuffer);

        // 创建新的WAV Blob
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

        audioContext.close();
        resolve(wavBlob);
      } catch (error) {
        console.error('音频格式转换失败:', error);
        reject(error);
      }
    });
  };

  // WAV编码函数
  const encodeWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * numChannels * bytesPerSample;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV文件头
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // 写入音频数据
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      setInterimTranscript('');
      setFinalTranscriptDisplay('正在处理录音...');

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();

        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => {
              try {
                // 创建录制的音频Blob
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });

                setIsProcessing(true);
                setProgressMessage('正在转换音频格式...');
                setProgress(10);

                console.log('原始音频格式:', audioBlob.type, '大小:', audioBlob.size);

                // 转换为WAV格式
                const wavBlob = await convertToWav(audioBlob);
                console.log('转换后的WAV格式:', wavBlob.type, '大小:', wavBlob.size);

                const reader = new FileReader();
                reader.onload = async (event) => {
                  const base64Data = event.target?.result as string;

                  try {
                    // 设置初始进度
                    setProgress(20);
                    setProgressMessage('正在上传音频...');

                    // 模拟上传进度
                    const uploadInterval = setInterval(() => {
                      setProgress(prev => {
                        if (prev >= 40) {
                          clearInterval(uploadInterval);
                          return prev;
                        }
                        return prev + Math.random() * 15 + 5;
                      });
                    }, 200);

                    // 等待上传进度达到40%
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // 移除 data:audio/wav;base64, 前缀以获取纯base64数据
                    const pureBase64Data = base64Data.split(',')[1] || base64Data;

                    // 更新进度到60%
                    setProgress(60);
                    setProgressMessage('正在进行语音识别...');

                    // 模拟识别进度
                    const recognitionInterval = setInterval(() => {
                      setProgress(prev => {
                        if (prev >= 90) {
                          clearInterval(recognitionInterval);
                          return prev;
                        }
                        return prev + Math.random() * 8 + 4;
                      });
                    }, 300);

                    // 使用Pollinations API进行语音识别
                    // API只支持wav和mp3格式，我们使用wav格式
                    const payload = {
                      model: 'openai-audio',
                      messages: [{
                        role: 'user',
                        content: [
                          { type: 'text', text: '请转录这段音频中的中文内容。请尽力识别所有可听清的部分，对于模糊或难以辨认的部分，请尽量推测正确内容。请保持原始语气和用词，不要进行润色、评论或分析，只输出识别结果：' },
                          {
                            type: 'input_audio',
                            input_audio: {
                              data: pureBase64Data,
                              format: 'wav'
                            }
                          }
                        ]
                      }]
                    };

                    console.log('发送语音识别请求到Pollinations API，数据大小:', pureBase64Data.length);
                    const apiResponse = await fetch('https://text.pollinations.ai/openai?referrer=growsnova.com', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });

                    console.log('API响应状态:', apiResponse.status);
                    if (!apiResponse.ok) {
                      const errorText = await apiResponse.text();
                      console.error('API请求失败:', apiResponse.status, apiResponse.statusText, errorText);
                      throw new Error(`API请求失败: ${apiResponse.status} ${apiResponse.statusText}`);
                    }

                    const result = await apiResponse.json();
                    console.log('语音识别API响应:', result);
                    const transcript = result.choices?.[0]?.message?.content?.trim() || '';
                    console.log('识别文本:', transcript);

                    // 模拟处理进度到90%
                    setProgress(90);
                    setProgressMessage('正在处理...');

                    // 调用回调函数进行AI识别，等待解析完成
                    await onAudioCapture({
                      audioData: base64Data,
                      transcript: transcript
                    });

                    // AI响应解析完成，设置进度为100%
                    setProgress(100);
                    setProgressMessage('识别完成！');
                    setShowCompletion(true);
                    // 不调用setIsProcessing(false)，保持处理状态以便进度条模态框继续显示

                    // 保持进度条显示状态，不自动重置
                    // 用户可以通过点击模态框中的确认按钮来重置状态
                  } catch (error) {
                    console.error('语音识别处理失败:', error);
                    alert('语音识别失败，请重试');

                    // 出错时也重置状态
                    setIsProcessing(false);
                    setProgressMessage('');
                    setProgress(0);
                    setFinalTranscriptDisplay('');
                    setShowCompletion(false);
                  }

                  resolve();
                };
                reader.readAsDataURL(wavBlob);

              } catch (error) {
                console.error('音频处理失败:', error);
                alert('音频处理失败，请重试');
                setIsProcessing(false);
                setProgressMessage('');
                setProgress(0);
                setFinalTranscriptDisplay('');
                setShowCompletion(false);
                resolve();
              }

              if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
              }
            };
          } else {
            resolve();
          }
        });
      } else if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(Math.round(progress), 100);

  // 如果有图片且不在处理过程中，显示图片
  // 如果正在处理，优先显示进度条模态框
  if (currentImage && !isProcessing && progress === 0 && !showCompletion) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  // 如果有音频且不在处理过程中，显示音频
  // 如果正在处理，优先显示进度条模态框
  if (currentAudio && !isProcessing && progress === 0 && !showCompletion) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  return (
    <>
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

        {isRecording && (finalTranscriptDisplay || interimTranscript) && (
          <div className="mt-4 p-4 bg-morandi-pink-50 border border-morandi-pink-200 rounded-xl">
            <h4 className="text-sm font-medium text-morandi-pink-800 mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              实时识别
            </h4>
            <div className="text-sm text-morandi-gray-700 space-y-1">
              {finalTranscriptDisplay && (
                <p className="font-medium">{finalTranscriptDisplay}</p>
              )}
              {interimTranscript && (
                <p className="text-morandi-gray-500 italic">{interimTranscript}</p>
              )}
            </div>
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
    </>
  );
}
