'use client';

import { useState, useEffect } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextMerger } from '@/hooks/useTextMerger';
import { Mic, Square, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import FakeProgressBar from '@/components/FakeProgressBar';

interface VoiceRecognitionPanelProps {
  onTextInsert: (text: string) => void;
}

export default function VoiceRecognitionPanel({ onTextInsert }: VoiceRecognitionPanelProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    segments,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    addTranscriptToSegment
  } = useVoiceRecorder();

  const {
    isRecognizing,
    recognitionResults,
    recognizeSegment,
    cancelRecognition
  } = useVoiceRecognition();

  const {
    isMerging,
    mergeResult,
    mergeSegments,
    resetMerge
  } = useTextMerger();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFakeProgress, setShowFakeProgress] = useState(false);

  // 当有新的识别结果时，更新分段的转录文本
  useEffect(() => {
    segments.forEach(segment => {
      if (!segment.isProcessed && recognitionResults[segment.id]) {
        const result = recognitionResults[segment.id];
        addTranscriptToSegment(segment.id, result.text);
      }
    });
  }, [recognitionResults, segments, addTranscriptToSegment]);

  // 当录音停止且有新分段时，自动开始识别
  useEffect(() => {
    if (!isRecording && segments.length > 0) {
      const unprocessedSegments = segments.filter(segment => segment.audioBlob && !segment.isProcessed);

      if (unprocessedSegments.length > 0) {
        // 显示假进度条
        setShowFakeProgress(true);

        // 找到未处理的分段并开始识别
        unprocessedSegments.forEach(segment => {
          if (segment.audioBlob) {
            recognizeSegment(segment.id, segment.audioBlob)
              .catch(error => {
                console.error(`识别分段 ${segment.id} 失败:`, error);
              });
          }
        });
      }
    }
  }, [isRecording, segments, recognizeSegment]);

  // 当所有分段都被处理后，自动开始合并
  useEffect(() => {
    if (!isRecognizing && segments.length > 0 && segments.every(s => s.isProcessed)) {
      const segmentData = segments.map(segment => ({
        id: segment.id,
        text: segment.transcript,
        startTime: segment.startTime,
        endTime: segment.endTime
      }));

      mergeSegments(segmentData);
    }
  }, [isRecognizing, segments, mergeSegments]);

  // 当合并完成时，隐藏假进度条
  useEffect(() => {
    if (mergeResult) {
      setShowFakeProgress(false);
    }
  }, [mergeResult]);

  // 当所有处理都完成时，隐藏假进度条
  useEffect(() => {
    if (!isRecognizing && !isMerging && mergeResult) {
      setShowFakeProgress(false);
    }
  }, [isRecognizing, isMerging, mergeResult]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : '录音启动失败');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReset = () => {
    resetRecording();
    resetMerge();
    setError(null);
  };

  const handleInsertText = () => {
    if (mergeResult?.mergedText) {
      onTextInsert(mergeResult.mergedText);
      handleReset();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const processedSegments = segments.filter(s => s.isProcessed).length;
  const totalSegments = segments.length;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
      <h3 className="text-lg font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
        <div className="p-2 bg-morandi-purple-100 rounded-lg">
          <Mic className="w-5 h-5 text-morandi-purple-600" />
        </div>
        语音转写
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 录音控制 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-mono font-bold text-morandi-gray-800">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-morandi-gray-600">
              分段: {processedSegments}/{totalSegments}
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">录音中</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex-1 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Mic className="w-5 h-5" />
              开始录音
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeRecording}
              className="flex-1 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Play className="w-5 h-5" />
              继续录音
            </button>
          ) : (
            <button
              onClick={pauseRecording}
              className="flex-1 bg-gradient-to-r from-morandi-yellow-500 to-morandi-orange-600 hover:from-morandi-yellow-600 hover:to-morandi-orange-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Pause className="w-5 h-5" />
              暂停录音
            </button>
          )}

          {isRecording && (
            <button
              onClick={handleStopRecording}
              className="bg-gradient-to-r from-morandi-red-500 to-morandi-red-600 hover:from-morandi-red-600 hover:to-morandi-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Square className="w-5 h-5" />
              结束
            </button>
          )}

          {(segments.length > 0 || isRecording) && (
            <button
              onClick={handleReset}
              className="bg-morandi-gray-200 hover:bg-morandi-gray-300 text-morandi-gray-700 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 假进度条 - 显示在录音停止后的处理阶段 */}
      {showFakeProgress && (
        <div className="mb-6">
          <div className="p-4 bg-morandi-blue-50 border border-morandi-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-morandi-blue-700 mb-3">
              <div className="w-3 h-3 border-2 border-morandi-blue-700 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">正在处理语音...</span>
            </div>
            <FakeProgressBar
              isActive={showFakeProgress}
              duration={5000}
              onComplete={() => {
                // 进度条完成后自动隐藏
                setShowFakeProgress(false);
              }}
            />
            <p className="text-morandi-blue-600 text-sm mt-2">
              {isRecognizing
                ? `已完成 ${processedSegments} / ${totalSegments} 个分段的识别`
                : isMerging
                ? '正在使用AI优化识别结果的连贯性'
                : '正在处理语音数据...'
              }
            </p>
          </div>
        </div>
      )}

      {/* 识别和合并状态 */}
      {(isRecognizing || isMerging || mergeResult) && !showFakeProgress && (
        <div className="mb-6">
          <div className="space-y-4">
            {isRecognizing && (
              <div className="p-4 bg-morandi-blue-50 border border-morandi-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-morandi-blue-700 mb-2">
                  <div className="w-3 h-3 border-2 border-morandi-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">正在识别语音...</span>
                </div>
                <p className="text-morandi-blue-600 text-sm">
                  已完成 {processedSegments} / {totalSegments} 个分段的识别
                </p>
              </div>
            )}

            {isMerging && (
              <div className="p-4 bg-morandi-purple-50 border border-morandi-purple-200 rounded-xl">
                <div className="flex items-center gap-2 text-morandi-purple-700 mb-2">
                  <div className="w-3 h-3 border-2 border-morandi-purple-700 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">正在合并文本...</span>
                </div>
                <p className="text-morandi-purple-600 text-sm">
                  正在使用AI优化识别结果的连贯性
                </p>
              </div>
            )}

            {mergeResult && !isRecognizing && !isMerging && (
              <div className="p-4 bg-morandi-green-50 border border-morandi-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-morandi-green-700">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">识别完成</span>
                  </div>
                  <div className="text-sm text-morandi-green-600">
                    {mergeResult.wordCount} 字 | 耗时 {mergeResult.processingTime}ms
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-morandi-green-100 max-h-32 overflow-y-auto">
                  <p className="text-morandi-gray-700 text-sm whitespace-pre-wrap">
                    {mergeResult.mergedText}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInsertText}
                    className="flex-1 bg-gradient-to-r from-morandi-green-500 to-morandi-green-600 hover:from-morandi-green-600 hover:to-morandi-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    插入到作文中
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-morandi-gray-200 hover:bg-morandi-gray-300 text-morandi-gray-700 font-medium py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 分段详情 */}
      {segments.length > 0 && (
        <div>
          <h4 className="font-medium text-morandi-gray-700 mb-3">录音分段</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`p-3 rounded-lg border text-sm ${
                  segment.isProcessed
                    ? 'bg-morandi-green-50 border-morandi-green-200'
                    : 'bg-morandi-gray-50 border-morandi-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-morandi-gray-700">
                      分段 {index + 1}
                    </span>
                    {segment.isProcessed && (
                      <span className="text-xs bg-morandi-green-100 text-morandi-green-800 px-2 py-1 rounded-full">
                        已识别
                      </span>
                    )}
                  </div>
                  <span className="text-morandi-gray-500 text-xs">
                    {Math.round(segment.duration / 1000)}s
                  </span>
                </div>
                {segment.isProcessed && segment.transcript && (
                  <p className="text-morandi-gray-600 mt-2 line-clamp-2">
                    {segment.transcript}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}