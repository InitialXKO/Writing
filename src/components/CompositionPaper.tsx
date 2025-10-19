'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface CompositionPaperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CompositionPaper({
  value,
  onChange,
  placeholder,
  className = ""
}: CompositionPaperProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 稿纸规格
  const charsPerLine = 20;  // 每行字符数
  const linesPerPage = 25;  // 每页行数
  const cellSize = 36;  // 每个格子的大小（正方形）- 增加到1.5倍
  const rowGap = 12;  // 横排之间的间隔 - 增加到1.5倍

  // 将文本转换为字符数组，处理emoji等多字节字符
  const characters = useMemo(() => Array.from(value), [value]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // 更新光标位置
    const position = e.target.selectionStart || 0;
    setCursorPosition(position);
  };

  // 处理光标位置变化
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart || 0;
      setCursorPosition(position);
    }
  };

  // 处理格子点击事件
  const handleGridClick = (index: number) => {
    if (textareaRef.current) {
      // 如果点击的位置超出了当前文本长度，需要扩展文本
      if (index > value.length) {
        // 创建足够长度的文本，用空格填充
        const newText = value.padEnd(index, ' ');
        onChange(newText);
      }

      // 设置textarea的光标位置
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index);
      // 直接高亮用户点击的格子，确保不受其他事件影响
      setCursorPosition(index);
    }
  };

  // 获取实际用于高亮的光标位置
  // 直接使用cursorPosition，因为每个格子对应一个字符位置
  const highlightedPosition = cursorPosition;

  return (
    <div className={`relative ${className}`} role="region" aria-label="作文稿纸">
      {/* 提示语 */}
      {placeholder && (
        <div className="text-morandi-gray-600 text-sm mb-2 px-4">
          {placeholder}
        </div>
      )}

      {/* 稿纸容器 */}
      <div
        ref={containerRef}
        className="border border-gray-300 rounded-xl bg-amber-50 overflow-hidden relative"
        style={{ height: '900px' }}  // 增加到1.5倍
        role="img"
        aria-label="作文稿纸背景"
      >
        {/* 网格背景和字符显示层合并 */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${charsPerLine}, 1fr)`,
            gridTemplateRows: `repeat(${linesPerPage}, ${cellSize}px)`,
            padding: '1rem',
            columnGap: '0',
            rowGap: `${rowGap}px`,
          }}
        >
          {Array.from({ length: charsPerLine * linesPerPage }).map((_, index) => {
            const rowIndex = Math.floor(index / charsPerLine);
            const colIndex = index % charsPerLine;
            const isHundredMark = (index + 1) % 100 === 0;
            const isLineStart = colIndex === 0;

            // 获取对应位置的字符
            const char = characters[index] || '';
            // 高亮当前光标位置的格子
            const isCursorAtPosition = isFocused && index === highlightedPosition;

            return (
              <div
                key={index}
                className={`
                  border border-gray-400 flex items-center justify-center relative
                  ${isHundredMark ? 'border-r-2 border-gray-400' : ''}
                  ${isLineStart ? 'border-l-2 border-gray-400' : ''}
                  ${isCursorAtPosition ? 'bg-blue-100 animate-pulse' : ''}
                `}
                onClick={() => handleGridClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {/* 字符显示 */}
                {char && (
                  <span
                    className="text-xl leading-none"
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
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyUp={handleSelectionChange}
          onSelect={handleSelectionChange}
          className={`
            absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none
            text-transparent caret-transparent z-10
          `}
          style={{
            fontFamily: "'仿宋', 'FangSong', serif",
            fontSize: '24px',
            lineHeight: '36px',
            letterSpacing: '0px',
            padding: '1rem',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            pointerEvents: 'none',  // 完全不响应鼠标事件
          }}
          aria-label="作文输入区域"
          tabIndex={-1}
        />
      </div>

      {/* 字符计数显示 */}
      <div className="absolute top-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow" aria-live="polite">
        {characters.length} 字
      </div>
    </div>
  );
}