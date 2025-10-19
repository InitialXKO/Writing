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
  const containerRef = useRef<HTMLDivElement>(null);

  // 稿纸规格
  const charsPerLine = 20;  // 每行字符数
  const linesPerPage = 25;  // 每页行数

  // 将文本转换为字符数组，处理emoji等多字节字符
  const characters = Array.from(value);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 稿纸容器 */}
      <div
        ref={containerRef}
        className="border border-gray-300 rounded-xl bg-amber-50 overflow-hidden relative"
        style={{ height: '600px' }}
      >
        {/* 网格背景和字符显示层合并 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${charsPerLine}, 1fr)`,
            gridTemplateRows: `repeat(${linesPerPage}, 1fr)`,
            padding: '1rem',
            gap: '0',
          }}
        >
          {Array.from({ length: charsPerLine * linesPerPage }).map((_, index) => {
            const rowIndex = Math.floor(index / charsPerLine);
            const colIndex = index % charsPerLine;
            const isHundredMark = (index + 1) % 100 === 0;
            const isLineStart = colIndex === 0;

            // 获取对应位置的字符
            const char = characters[index] || '';

            return (
              <div
                key={index}
                className={`
                  border border-gray-200 flex items-center justify-center relative
                  ${isHundredMark ? 'border-r-2 border-blue-500' : ''}
                  ${isLineStart ? 'border-l-2 border-gray-400' : ''}
                `}
              >
                {/* 字符显示 */}
                {char && (
                  <span
                    className="text-base leading-none"
                    style={{
                      fontFamily: "'仿宋', 'FangSong', serif",
                      color: '#333'
                    }}
                  >
                    {char}
                  </span>
                )}

                {/* 每百字标记 */}
                {isHundredMark && rowIndex === 0 && (
                  <div className="absolute -top-6 right-0 text-xs text-blue-600 font-bold bg-white px-1 rounded shadow">
                    {index + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 透明文本输入区域 */}
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            absolute inset-0 w-full h-full p-4 bg-transparent resize-none focus:outline-none
            text-transparent caret-blue-500 z-10
            ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
          `}
          style={{
            fontFamily: "'仿宋', 'FangSong', serif",
            fontSize: '16px',
            lineHeight: '1.2',
            letterSpacing: 'normal',
          }}
        />
      </div>

      {/* 字符计数显示 */}
      <div className="absolute top-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow">
        {characters.length} 字
      </div>
    </div>
  );
}