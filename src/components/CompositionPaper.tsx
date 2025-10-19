'use client';

import { useState, useRef, useEffect } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 稿纸规格
  const charsPerLine = 20;  // 每行字符数
  const linesPerPage = 25;  // 每页行数

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 稿纸容器 */}
      <div
        ref={containerRef}
        className="border border-morandi-gray-300 rounded-xl bg-amber-50 overflow-hidden relative"
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${charsPerLine}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${linesPerPage}, minmax(0, 1fr))`,
            height: '600px',
            padding: '1rem',
            gap: '0',
          }}
        >
          {Array.from({ length: charsPerLine * linesPerPage }).map((_, index) => {
            const rowIndex = Math.floor(index / charsPerLine);
            const colIndex = index % charsPerLine;
            const isHundredMark = (index + 1) % 100 === 0;
            const isLineStart = colIndex === 0;

            return (
              <div
                key={index}
                className={`
                  border border-amber-200
                  ${isHundredMark ? 'border-r-2 border-blue-400' : ''}
                  ${isLineStart ? 'border-l-2 border-amber-300' : ''}
                `}
                style={{
                  minHeight: '24px',
                }}
              >
                {/* 每百字标记 */}
                {isHundredMark && rowIndex === 0 && (
                  <div className="absolute -top-6 -ml-2 text-xs text-blue-600 font-bold bg-white px-1 rounded">
                    {index + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 文本输入区域 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            relative w-full h-full min-h-[600px] p-4 bg-transparent resize-none focus:outline-none
            font-serif text-lg leading-6 caret-blue-500 z-10
            ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
          `}
          style={{
            fontFamily: "'仿宋', 'FangSong', serif",
            letterSpacing: '0.1em',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
          }}
        />
      </div>

      {/* 字符计数显示 */}
      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded shadow">
        {Array.from(value).length} 字
      </div>
    </div>
  );
}