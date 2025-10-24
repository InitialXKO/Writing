'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  audioBlob: Blob | null;
  transcript: string;
  isProcessed: boolean;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  segments: VoiceSegment[];
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  addTranscriptToSegment: (segmentId: string, transcript: string) => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [segments, setSegments] = useState<VoiceSegment[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const segmentAudioChunksRef = useRef<Record<string, Blob[]>>({});
  const startTimeRef = useRef<number>(0);
  const segmentStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSegmentIdRef = useRef<string>('');

  // 分段时长设置（毫秒）
  const SEGMENT_DURATION = 20000; // 20秒
  const OVERLAP_DURATION = 2000;  // 2秒重叠

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const createNewSegment = (isFirst: boolean = false) => {
    const now = Date.now();
    const segmentId = `segment-${now}`;
    const segment: VoiceSegment = {
      id: segmentId,
      startTime: isFirst ? now : now - OVERLAP_DURATION,
      endTime: 0,
      duration: 0,
      audioBlob: null,
      transcript: '',
      isProcessed: false
    };

    // 为新分段初始化音频缓冲区
    segmentAudioChunksRef.current[segmentId] = [];

    setSegments(prev => [...prev, segment]);
    segmentStartTimeRef.current = now;
    currentSegmentIdRef.current = segmentId;

    // 设置下一个分段的定时器
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
    }

    segmentTimerRef.current = setTimeout(() => {
      // 保存当前分段并创建新分段
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        // 强制保存当前数据
        mediaRecorderRef.current.requestData();
        // 创建新的分段
        createNewSegment(false);
      }
    }, SEGMENT_DURATION - OVERLAP_DURATION);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      segmentAudioChunksRef.current = {};

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && currentSegmentIdRef.current) {
          // 将数据添加到当前分段
          if (!segmentAudioChunksRef.current[currentSegmentIdRef.current]) {
            segmentAudioChunksRef.current[currentSegmentIdRef.current] = [];
          }
          segmentAudioChunksRef.current[currentSegmentIdRef.current].push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const now = Date.now();

        // 为所有分段创建音频blob
        setSegments(prev => {
          return prev.map(segment => {
            if (segment.audioBlob === null && segmentAudioChunksRef.current[segment.id]) {
              const audioBlob = new Blob(segmentAudioChunksRef.current[segment.id], { type: 'audio/webm' });
              return {
                ...segment,
                endTime: segment.endTime || now,
                duration: segment.duration || (now - segment.startTime),
                audioBlob
              };
            }
            return segment;
          });
        });

        // 清理音频缓冲区
        segmentAudioChunksRef.current = {};
      };

      // 开始录制，每5秒保存一次数据
      mediaRecorder.start(5000);
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      setRecordingTime(0);

      // 创建第一个分段
      createNewSegment(true);

      // 启动计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('无法访问麦克风，请检查权限设置');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // 停止所有音频轨道
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
      }

      // 更新所有未完成分段的时间
      const now = Date.now();
      setSegments(prev => {
        return prev.map(segment => {
          if (segment.endTime === 0) {
            return {
              ...segment,
              endTime: now,
              duration: now - segment.startTime
            };
          }
          return segment;
        });
      });
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setSegments([]);
    segmentAudioChunksRef.current = {};
  };

  const addTranscriptToSegment = (segmentId: string, transcript: string) => {
    setSegments(prev =>
      prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, transcript, isProcessed: true }
          : segment
      )
    );
  };

  return {
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
  };
};