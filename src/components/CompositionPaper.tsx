'use client';

import { useState, useRef } from 'react';

interface CompositionPaperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CompositionPaper({
  value,
  onChange,
  placeholder = "开始你的创作吧...运用你学到的写作技巧",
  className = ""
}: CompositionPaperProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 稿纸规格
  const charsPerLine = 20;  // 每行字符数
  const linesPerPage = 25;  // 每页行数
  const charsPerHundred = 100;  // 每百字标记

  // 计算总格子数
  const totalCells = linesPerPage * charsPerLine;

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 稿纸网格背景 */}
      <div
        className="absolute inset-0 pointer-events-none border border-morandi-gray-300 rounded-xl bg-[#f8f5f0]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1c5b0 1px, transparent 1px),
            linear-gradient(to bottom, #d1c5b0 1px, transparent 1px)
          `,
          backgroundSize: `calc(100% / ${charsPerLine}) calc(100% / ${linesPerPage})`,
        }}
      >
        {/* 每百字标记线 */}
        <div
          className="absolute top-0 bottom-0 border-r-2 border-morandi-blue-300 opacity-60"
          style={{ left: '20%' }}
        ></div>
        <div
          className="absolute top-0 bottom-0 border-r-2 border-morandi-blue-300 opacity-60"
          style={{ left: '40%' }}
        ></div>
        <div
          className="absolute top-0 bottom-0 border-r-2 border-morandi-blue-300 opacity-60"
          style={{ left: '60%' }}
        ></div>
        <div
          className="absolute top-0 bottom-0 border-r-2 border-morandi-blue-300 opacity-60"
          style={{ left: '80%' }}
        ></div>

        {/* 每百字数字标记 */}
        <div className="absolute -top-6 left-[20%] transform -translate-x-1/2 text-xs text-morandi-blue-500 font-bold">100</div>
        <div className="absolute -top-6 left-[40%] transform -translate-x-1/2 text-xs text-morandi-blue-500 font-bold">200</div>
        <div className="absolute -top-6 left-[60%] transform -translate-x-1/2 text-xs text-morandi-blue-500 font-bold">300</div>
        <div className="absolute -top-6 left-[80%] transform -translate-x-1/2 text-xs text-morandi-blue-500 font-bold">400</div>
        <div className="absolute -top-6 left-full transform -translate-x-1/2 text-xs text-morandi-blue-500 font-bold">500</div>
      </div>

      {/* 透明文本输入区域 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          relative w-full h-full min-h-[600px] p-4 border border-transparent bg-transparent
          rounded-xl font-serif text-base resize-none focus:outline-none
          caret-morandi-blue-500 z-10
          ${isFocused ? 'ring-2 ring-morandi-blue-500 ring-inset' : ''}
        `}
        style={{
          lineHeight: `calc(100% / ${linesPerPage})`,
          letterSpacing: `calc(100% / ${charsPerLine} - 1ch)`,
          wordBreak: 'break-all',
        }}
      />

      {/* 字符计数显示 */}
      <div className="absolute bottom-2 right-2 text-xs text-morandi-gray-500 bg-white/80 px-2 py-1 rounded">
        {value.length} 字
      </div>
    </div>
  );
}