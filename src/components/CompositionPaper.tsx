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

  // 将文本转换为字符数组，处理英文两个字母占一格的逻辑
  const characters = useMemo(() => {
    const chars = Array.from(value);
    const result = [];
    let i = 0;

    while (i < chars.length) {
      const char = chars[i];
      // 检查是否是英文字符（字母或数字）
      if (/[a-zA-Z0-9]/.test(char)) {
        // 检查下一个字符是否也是英文字符
        if (i + 1 < chars.length && /[a-zA-Z0-9]/.test(chars[i + 1])) {
          // 英文两个字母占一格，不添加空格
          result.push(char + chars[i + 1]);
          i += 2;
        } else {
          // 单个英文字母占一格
          result.push(char);
          i += 1;
        }
      } else {
        // 中文字符或其他符号占一格
        result.push(char);
        i += 1;
      }
    }

    return result;
  }, [value]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // 更新光标位置，需要转换为网格位置
    const textPosition = e.target.selectionStart || 0;

    // 将textarea中的字符位置转换为网格位置
    let gridPosition = 0;
    let currentTextIndex = 0;
    for (let i = 0; i < characters.length && currentTextIndex < textPosition; i++) {
      const char = characters[i];
      // 检查是否是两个连续的字母数字字符
      if (/^[a-zA-Z0-9]{2}$/.test(char)) {
        // 两个字母占一格
        if (currentTextIndex + 2 <= textPosition) {
          gridPosition += 1;
          currentTextIndex += 2;
        } else {
          break;
        }
      } else {
        // 单个字符占一格（包括单个字母和其他字符）
        if (currentTextIndex + 1 <= textPosition) {
          gridPosition += 1;
          currentTextIndex += 1;
        } else {
          break;
        }
      }
    }

    // 设置textarea的位置到光标所在的格子处（只设置top，不设置left）
    if (textareaRef.current && containerRef.current) {
      const rowIndex = Math.floor(gridPosition / charsPerLine);
      const gridTop = (rowIndex * (cellSize + 10)) + 16; // 10px是rowGap，16px是padding
      textareaRef.current.style.top = `${gridTop}px`;
      // 确保left保持为0，防止页面移动
      textareaRef.current.style.left = '0';
    }

    setCursorPosition(gridPosition);
  };

  // 处理光标位置变化
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const textPosition = textareaRef.current.selectionStart || 0;

      // 将textarea中的字符位置转换为网格位置
      let gridPosition = 0;
      let currentTextIndex = 0;
      for (let i = 0; i < characters.length && currentTextIndex < textPosition; i++) {
        const char = characters[i];
        // 检查是否是两个连续的字母数字字符
        if (/^[a-zA-Z0-9]{2}$/.test(char)) {
          // 两个字母占一格
          if (currentTextIndex + 2 <= textPosition) {
            gridPosition += 1;
            currentTextIndex += 2;
          } else {
            break;
          }
        } else {
          // 单个字符占一格（包括单个字母和其他字符）
          if (currentTextIndex + 1 <= textPosition) {
            gridPosition += 1;
            currentTextIndex += 1;
          } else {
            break;
          }
        }
      }

      // 设置textarea的位置到光标所在的格子处（只设置top，不设置left）
      if (textareaRef.current && containerRef.current) {
        const rowIndex = Math.floor(gridPosition / charsPerLine);
        const gridTop = (rowIndex * (cellSize + 10)) + 16; // 10px是rowGap，16px是padding
        textareaRef.current.style.top = `${gridTop}px`;
        // 确保left保持为0，防止页面移动
        textareaRef.current.style.left = '0';
      }

      setCursorPosition(gridPosition);
    }
  };

  // 处理格子点击事件
  const handleGridClick = (gridIndex: number) => {
    // 保存当前滚动位置
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (textareaRef.current && containerRef.current) {
      // 计算textarea中对应的字符位置
      let textIndex = 0;
      for (let i = 0; i < gridIndex; i++) {
        // 如果超出了当前字符数组的范围，需要扩展文本
        if (i >= characters.length) {
          textIndex += 1;
        } else {
          // 检查是否是两个连续的字母数字字符
          const char = characters[i];
          if (/^[a-zA-Z0-9]{2}$/.test(char)) {
            // 两个字母占一格
            textIndex += 2;
          } else {
            // 单个字符占一格（包括单个字母和其他字符）
            textIndex += 1;
          }
        }
      }

      // 如果点击的位置超出了当前文本长度，需要扩展文本
      if (textIndex > value.length) {
        // 创建足够长度的文本，用空格填充
        const newText = value.padEnd(textIndex, ' ');
        onChange(newText);
      }

      // 设置textarea的光标位置，防止滚动
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(textIndex, textIndex);

      // 设置textarea的位置到点击的格子处（只设置top，不设置left）
      // 在高亮代码内部设置位置
      const rowIndex = Math.floor(gridIndex / charsPerLine);
      const gridTop = (rowIndex * (cellSize + 10)) + 16; // 10px是rowGap，16px是padding
      textareaRef.current.style.top = `${gridTop}px`;
      // 确保left保持为0，防止页面移动
      textareaRef.current.style.left = '0';

      // 直接高亮用户点击的格子，确保不受其他事件影响
      setCursorPosition(gridIndex);
    }

    // 恢复滚动位置
    window.scrollTo(scrollX, scrollY);
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
        className="border border-gray-300 rounded-xl bg-amber-100 overflow-hidden relative"
        style={{
          minHeight: '900px',  // 最小高度为原来的1.5倍
          height: `${Math.max(900, Math.ceil(Math.max(charsPerLine * linesPerPage, characters.length + charsPerLine * 5) / 100) * 100 / charsPerLine * (cellSize + 10) + 32)}px`  // 根据格子数动态计算高度
        }}
        role="img"
        aria-label="作文稿纸背景"
      >
        {/* 网格背景和字符显示层合并 */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${charsPerLine}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(Math.max(linesPerPage, Math.ceil(characters.length / charsPerLine) + 5) / 100) * 100 / charsPerLine}, ${cellSize}px)`, // 格子数总是100的倍数
            padding: '1rem',
            columnGap: '0',  // 移除列间距
            rowGap: '10px',  // 添加行间距来创建白色间距
          }}
        >
          {Array.from({ length: Math.ceil(Math.max(charsPerLine * linesPerPage, characters.length + charsPerLine * 5) / 100) * 100 }).map((_, index) => {
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
                  flex items-center justify-center relative
                  ${isCursorAtPosition ? 'bg-amber-200 border-2 border-amber-400 shadow-md animate-pulse scale-105' : 'bg-white'}
                `}
                style={{
                  cursor: 'pointer',
                  borderTop: '1px solid #d97706', // 上边框
                  borderBottom: '1px solid #d97706', // 下边框
                  borderRight: '1px solid #d97706', // 右边框
                  ...(isLineStart && { borderLeft: '1px solid #d97706' }), // 每行起始格子的左边框
                  height: `${cellSize}px`, // 恢复原始高度
                  boxSizing: 'border-box', // 使用border-box来包含边框和padding
                  backgroundColor: 'white', // 确保背景色为白色
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGridClick(index);
                }}
              >
                {/* 字符显示 */}
                {char && (
                  <span
                    className="text-xl leading-none"
                    style={{
                      fontFamily: "'仿宋', 'FangSong', serif",
                      color: '#333',
                      // 如果是单个英文字母，添加左对齐样式
                      ...( /^[a-zA-Z0-9]$/.test(char) && {
                        transform: 'translateX(-8px)'
                      }),
                      // 如果是双字母字符，添加letter-spacing使其均匀分布
                      ...( /^[a-zA-Z0-9]{2}$/.test(char) && {
                        letterSpacing: '6px'
                      })
                    }}
                  >
                    {char}
                  </span>
                )}

                {/* 每百字标记 */}
                {isHundredMark && (
                  <div className="absolute bottom-0 right-0 text-[0.6rem] text-blue-600 font-bold bg-white px-0.5 rounded shadow transform translate-y-1/2 translate-x-1/2">
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
            absolute bg-transparent resize-none focus:outline-none
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
            height: '0',  // 设为零高度，完全不可见
            opacity: '0',  // 完全透明
            zIndex: '-1',  // 确保在最底层
            top: '0',
            left: '0',
            width: '70%', // 横向变窄为70%
            // 防止页面移动的额外样式
            position: 'absolute',
            margin: '0',
            transform: 'translateZ(0)', // 防止页面移动的硬件加速
          }}
          aria-label="作文输入区域"
          tabIndex={-1}
        />
      </div>

      {/* 字符计数显示 */}
      <div className="absolute top-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow" aria-live="polite">
        {value.trimEnd().length} 字
      </div>
    </div>
  );
}