'use client';

import { useState, useRef } from 'react';

export default function TestSpeechPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
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
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">语音识别测试</h1>

        <div className="mb-6">
          <p className="mb-4">点击下面的按钮开始语音识别测试：</p>

          {!isListening ? (
            <button
              onClick={startListening}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              开始语音识别
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              停止语音识别
            </button>
          )}
        </div>

        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px]">
          <h2 className="font-medium mb-2">识别结果：</h2>
          <p>{transcript}</p>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>请确保使用 Chrome、Edge 或 Safari 浏览器，并允许麦克风权限。</p>
        </div>
      </div>
    </div>
  );
}