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
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const segmentStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const segment: VoiceSegment = {
      id: `segment-${now}`,
      startTime: isFirst ? now : now - OVERLAP_DURATION,
      endTime: 0,
      duration: 0,
      audioBlob: null,
      transcript: '',
      isProcessed: false
    };

    setSegments(prev => [...prev, segment]);
    segmentStartTimeRef.current = now;

    // 设置下一个分段的定时器
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
    }

    segmentTimerRef.current = setTimeout(() => {
      // 保存当前分段并创建新分段
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        // 这里需要实现分段逻辑
        // 为了简化，我们先创建新的分段
        createNewSegment(false);
      }
    }, SEGMENT_DURATION);
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const now = Date.now();

        // 更新最后一个分段
        setSegments(prev => {
          if (prev.length > 0) {
            const lastSegment = prev[prev.length - 1];
            return prev.map(segment =>
              segment.id === lastSegment.id
                ? {
                    ...segment,
                    endTime: now,
                    duration: now - segment.startTime,
                    audioBlob
                  }
                : segment
            );
          }
          return prev;
        });

        audioChunksRef.current = [];
      };

      // 开始录制
      mediaRecorder.start();
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

      // 更新最后一个分段的时间
      const now = Date.now();
      setSegments(prev => {
        if (prev.length > 0) {
          const lastSegment = prev[prev.length - 1];
          return prev.map(segment =>
            segment.id === lastSegment.id
              ? { ...segment, endTime: now, duration: now - segment.startTime }
              : segment
          );
        }
        return prev;
      });
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setSegments([]);
    audioChunksRef.current = [];
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