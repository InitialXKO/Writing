'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface CompositionPaperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoIndent?: boolean; // 是否自动在段落开头空两格
}

export default function CompositionPaper({
  value,
  onChange,
  placeholder,
  className = "",
  autoIndent = true // 默认启用自动空两格
}: CompositionPaperProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(-1); // 默认为-1，表示没有光标位置
  const [prevValue, setPrevValue] = useState(value); // 用于跟踪前一个值
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步外部 value 到 prevValue，避免程序性更新后首个输入被误判为“包含之前新增的换行”，触发额外缩进
  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  // 根据屏幕宽度调整每行字符数
  const getCharsPerLine = () => {
    if (typeof window === 'undefined') {
      // 服务器端渲染时使用默认的桌面端字符数
      return 20;
    }

    const width = window.innerWidth;

    if (width < 768) {
      // 手机端：每行10个字符
      return 10;
    } else if (width < 1024) {
      // 平板端：每行15个字符
      return 15;
    } else {
      // 桌面端：每行20个字符
      return 20;
    }
  };

  const [charsPerLine, setCharsPerLine] = useState(getCharsPerLine());
  const linesPerPage = 25;

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setCharsPerLine(getCharsPerLine());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据容器宽度计算格子大小，确保格子是正方形
  const calculateCellSize = (currentCharsPerLine: number = charsPerLine) => {
    if (typeof window === 'undefined' || !containerRef.current) {
      // 服务器端渲染或容器未准备好时使用默认值
      return 36;
    }

    const containerWidth = containerRef.current.clientWidth;
    const padding = 32; // 1rem * 2
    const availableWidth = containerWidth - padding;
    const cellSize = Math.floor(availableWidth / currentCharsPerLine);

    // 确保格子不会太小
    return Math.max(20, cellSize);
  };

  const [cellSize, setCellSize] = useState(calculateCellSize());

  // 在客户端重新计算一次格子大小，确保与服务器端一致
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      setCellSize(calculateCellSize(charsPerLine));
    }
  }, [charsPerLine]);

  // 计算行间距，确保它正确更新
  const rowGap = Math.max(2, Math.floor(cellSize * 0.2)); // 行间距为格子大小的20%

  // 字符处理辅助函数，处理字符在网格中的位置计算
  const processCharacter = (
    char: string,
    currentIndex: number,
    currentRow: number,
    currentCol: number,
    text: string,
    charsPerLine: number
  ) => {
    let newRow = currentRow;
    let newCol = currentCol;
    let nextIndex = currentIndex;

    if (char === '\n') {
      // 遇到换行符，跳到下一行开头
      newRow++;
      newCol = 0;
    } else {
      // 移动到下一个格子
      // 检查是否是英文字符（字母或数字）
      if (/[a-zA-Z0-9]/.test(char)) {
        // 检查下一个字符是否也是英文字符
        if (currentIndex + 1 < text.length && /[a-zA-Z0-9]/.test(text[currentIndex + 1])) {
          // 英文两个字母占一格
          newCol++;
          if (newCol >= charsPerLine) {
            // 到达行末，跳到下一行
            newRow++;
            newCol = 0;
          }
          nextIndex += 1; // 跳过下一个字符
        } else {
          // 单个英文字母占一格
          newCol++;
          if (newCol >= charsPerLine) {
            // 到达行末，跳到下一行
            newRow++;
            newCol = 0;
          }
        }
      } else {
        // 中文字符或其他符号占一格
        newCol++;
        if (newCol >= charsPerLine) {
          // 到达行末，跳到下一行
          newRow++;
          newCol = 0;
        }
      }
    }

    return { newRow, newCol, nextIndex };
  };

  // 将网格索引转换为字符索引的辅助函数
  const calculateGridToCharPosition = (gridIndex: number, text: string, charsPerLine: number) => {
    const targetRow = Math.floor(gridIndex / charsPerLine);
    const targetCol = gridIndex % charsPerLine;

    let currentRow = 0;
    let currentCol = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (currentRow === targetRow && currentCol === targetCol) {
        return i;
      }

      const { newRow, newCol, nextIndex } = processCharacter(char, i, currentRow, currentCol, text, charsPerLine);
      currentRow = newRow;
      currentCol = newCol;
      i = nextIndex;
    }

    // 如果目标位置在现有文本之后，返回文本长度作为插入位置
    if (currentRow < targetRow || (currentRow === targetRow && currentCol < targetCol)) {
      return text.length;
    }

    return -1; // 没有找到对应的字符
  };

  // 将字符索引转换为网格索引的辅助函数
  const calculateCharToGridPosition = (charIndex: number, text: string, charsPerLine: number) => {
    let currentRow = 0;
    let currentCol = 0;

    for (let i = 0; i < text.length && i <= charIndex; i++) {
      if (i === charIndex) {
        return currentRow * charsPerLine + currentCol;
      }

      const char = text[i];
      const { newRow, newCol, nextIndex } = processCharacter(char, i, currentRow, currentCol, text, charsPerLine);
      currentRow = newRow;
      currentCol = newCol;
      i = nextIndex;
    }

    return currentRow * charsPerLine + currentCol; // 返回计算出的网格位置
  };

  // 将网格索引转换为字符索引
  const gridIndexToCharIndex = (gridIndex: number) => {
    return calculateGridToCharPosition(gridIndex, value, charsPerLine);
  };

  // 将字符索引转换为网格索引
  const charIndexToGridIndex = (charIndex: number) => {
    return calculateCharToGridPosition(charIndex, value, charsPerLine);
  };

  // 当容器大小或每行字符数变化时重新计算格子大小
  useEffect(() => {
    const updateCellSize = () => {
      setCellSize(calculateCellSize(charsPerLine));
    };

    updateCellSize();

    // 使用ResizeObserver监听容器大小变化
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(updateCellSize);
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [charsPerLine, containerRef]);

  // 将文本转换为字符数组，处理英文两个字母占一格的逻辑，并计算实际行数
  const { characters, actualRows } = useMemo(() => {
    const chars = Array.from(value);
    const result = [];
    let i = 0;

    while (i < chars.length) {
      const char = chars[i];
      // 检查是否是换行符
      if (char === '\n') {
        // 换行符占一个格子
        result.push(char);
        i += 1;
      }
      // 检查是否是英文字符（字母或数字）
      else if (/[a-zA-Z0-9]/.test(char)) {
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

    // 计算实际需要的行数，考虑换行符的影响
    const calculateActualRows = (chars: string[]) => {
      if (chars.length === 0) {
        return linesPerPage;
      }

      let rows = 1; // 至少有一行
      let currentCol = 0;

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (char === '\n') {
          // 遇到换行符，跳到下一行
          rows++;
          currentCol = 0;
        } else {
          // 移动到下一个格子
          currentCol++;
          if (currentCol >= charsPerLine) {
            // 到达行末，跳到下一行
            rows++;
            currentCol = 0;
          }
        }
      }

      // 确保至少有linesPerPage行
      return Math.max(rows, linesPerPage) + 5; // 额外添加5行用于继续输入
    };

    return {
      characters: result,
      actualRows: calculateActualRows(result)
    };
  }, [value, charsPerLine, linesPerPage]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    // 检查是否是回车输入，并处理段落开头空两格
    if (autoIndent && newValue.length > prevValue.length) {
      // 检查新增的字符中是否包含换行符
      const newCharacters = newValue.slice(prevValue.length);
      if (newCharacters.includes('\n')) {
        // 处理所有新增的换行符
        let processedValue = newValue;
        let cursorAdjustment = 0;
        const prevLength = prevValue.length;
        let offset = 0; // 记录由于插入空格导致的位置偏移

        // 遍历新增的字符，查找换行符
        for (let i = 0; i < newCharacters.length; i++) {
          const originalPos = prevLength + i;
          const actualPos = originalPos + offset; // 考虑偏移后的真实位置

          if (newCharacters[i] === '\n') {
            // 检查这个换行符是否需要添加缩进
            // 需要添加缩进的情况：
            // 1. 换行符在文本开头
            // 2. 换行符前面是普通字符（不是换行符）
            const isAtStart = actualPos === 0;
            const charBeforeNewLine = actualPos > 0 ? processedValue[actualPos - 1] : null;
            const isAfterRegularChar = charBeforeNewLine !== null && charBeforeNewLine !== '\n';

            if (isAtStart || isAfterRegularChar) {
              // 在新行开头插入两个全角空格
              const fullWidthSpace = '\u3000'; // 全角空格
              processedValue = processedValue.slice(0, actualPos + 1) + fullWidthSpace + fullWidthSpace + processedValue.slice(actualPos + 1);

              // 更新偏移量
              offset += 2;

              // 如果这个换行符在光标位置之前，需要调整光标位置
              if (originalPos < cursorPos) {
                cursorAdjustment += 2;
              }
            }
          }
        }

        if (processedValue !== newValue) {
          newValue = processedValue;
          // 调整光标位置
          if (cursorAdjustment > 0) {
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.setSelectionRange(cursorPos + cursorAdjustment, cursorPos + cursorAdjustment);
              }
            }, 0);
          }
        }
      } else if (newValue.length === prevValue.length + 1 && newValue[cursorPos - 1] === '\n') {
        // 处理单个换行符的简单情况
        // 检查换行符是否需要添加缩进
        const isAtStart = cursorPos === 1; // 光标在位置1，说明换行符在位置0（文本开头）
        const charBeforeNewLine = newValue[cursorPos - 2];
        const isAfterRegularChar = charBeforeNewLine !== '\n';

        if (isAtStart || isAfterRegularChar) {
          // 在新行开头插入两个全角空格
          const fullWidthSpace = '\u3000'; // 全角空格
          newValue = newValue.slice(0, cursorPos) + fullWidthSpace + fullWidthSpace + newValue.slice(cursorPos);

          // 调整光标位置
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(cursorPos + 2, cursorPos + 2);
            }
          }, 0);
        }
      }
    }

    // 更新prevValue
    setPrevValue(newValue);
    onChange(newValue);

    // 将textarea中的字符位置转换为网格位置
    const gridPosition = charIndexToGridIndex(cursorPos);

    // 设置textarea的位置到光标所在的格子处（只设置top，不设置left）
    if (textareaRef.current && containerRef.current) {
      const rowIndex = Math.floor(gridPosition / charsPerLine);
      const gridTop = (rowIndex * (cellSize + rowGap)) + 16; // rowGap和16px是padding
      textareaRef.current.style.top = `${gridTop}px`;
      // 确保left保持为0，防止页面移动
      textareaRef.current.style.left = '0';
    }

    // 如果转换结果无效，使用字符位置作为网格位置
    setCursorPosition(gridPosition >= 0 ? gridPosition : cursorPos);
  };

  // 处理光标位置变化
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const textPosition = textareaRef.current.selectionStart || 0;

      // 将textarea中的字符位置转换为网格位置
      const gridPosition = charIndexToGridIndex(textPosition);

      // 设置textarea的位置到光标所在的格子处（只设置top，不设置left）
      if (textareaRef.current && containerRef.current) {
        const rowIndex = Math.floor(gridPosition / charsPerLine);
        const gridTop = (rowIndex * (cellSize + rowGap)) + 16; // rowGap和16px是padding
        textareaRef.current.style.top = `${gridTop}px`;
        // 确保left保持为0，防止页面移动
        textareaRef.current.style.left = '0';
      }

      // 如果转换结果无效，使用字符位置作为网格位置
      setCursorPosition(gridPosition >= 0 ? gridPosition : textPosition);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;

    const textPosition = textareaRef.current.selectionStart || 0;
    const textEnd = textareaRef.current.selectionEnd || 0;

    // 只有在没有选中文本的情况下才处理自定义导航
    if (textPosition === textEnd) {
      // 处理上下键导航
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        // 将当前字符位置转换为网格位置
        const currentGridPos = charIndexToGridIndex(textPosition);
        const currentRow = Math.floor(currentGridPos / charsPerLine);
        const currentCol = currentGridPos % charsPerLine;

        // 计算新行
        const newRow = e.key === 'ArrowUp' ? currentRow - 1 : currentRow + 1;

        // 确保新行在有效范围内
        const maxRows = Math.ceil(value.length / charsPerLine);
        if (newRow >= 0 && newRow <= maxRows) {
          // 计算新位置
          const newGridPos = newRow * charsPerLine + currentCol;

          // 将网格位置转换回字符位置
          const newCharPos = gridIndexToCharIndex(newGridPos);

          // 如果找到了有效的字符位置，移动光标
          if (newCharPos >= 0) {
            textareaRef.current.setSelectionRange(newCharPos, newCharPos);
            // 触发光标位置变化事件
            handleSelectionChange();
          }
        }
      }
    }

    // 允许其他键盘事件正常处理
  };

  // 处理格子点击事件
  const handleGridClick = (gridIndex: number) => {
    // 保存当前滚动位置
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (textareaRef.current && containerRef.current) {
      // 计算textarea中对应的字符位置
      const charIndex = gridIndexToCharIndex(gridIndex);

      let textIndex = 0;
      let currentText = value; // 跟踪当前文本

      if (charIndex >= 0 && charIndex < value.length) {
        // 直接使用计算出的字符索引（在文本范围内）
        textIndex = charIndex;
      } else {
        // 点击位置在文本末尾之后或没有精确对应字符，需要扩展文本到目标位置
        // 确保有足够的空格来保证输入的字出现在所点击的空格子位置
        let newText = value;
        const targetRow = Math.floor(gridIndex / charsPerLine);
        const targetCol = gridIndex % charsPerLine;

        // 计算当前文本的网格布局状态
        let currentRow = 0;
        let currentCol = 0;

        // 计算当前文本占用的网格位置
        for (let i = 0; i < newText.length; i++) {
          const char = newText[i];
          if (char === '\n') {
            currentRow++;
            currentCol = 0;
          } else {
            // 检查是否是英文字符（字母或数字）
            if (/[a-zA-Z0-9]/.test(char)) {
              // 检查下一个字符是否也是英文字符
              if (i + 1 < newText.length && /[a-zA-Z0-9]/.test(newText[i + 1])) {
                // 英文两个字母占一格
                currentCol++;
                if (currentCol >= charsPerLine) {
                  currentRow++;
                  currentCol = 0;
                }
                i += 1; // 跳过下一个字符
              } else {
                // 单个英文字母占一格
                currentCol++;
                if (currentCol >= charsPerLine) {
                  currentRow++;
                  currentCol = 0;
                }
              }
            } else {
              // 中文字符或其他符号占一格
              currentCol++;
              if (currentCol >= charsPerLine) {
                currentRow++;
                currentCol = 0;
              }
            }
          }
        }

        // 采用线性单元填充算法：计算从文本末尾位置到目标网格位置需要前进的单元数
        const currentGridIndex = currentRow * charsPerLine + currentCol;
        const targetGridIndex = targetRow * charsPerLine + targetCol;
        const deltaCells = Math.max(0, targetGridIndex - currentGridIndex);

        if (deltaCells > 0) {
          let fill = '';
          for (let i = 0; i < deltaCells; i++) {
            const col = (currentCol + i) % charsPerLine;
            if (col === charsPerLine - 1) {
              fill += '\n';
            } else {
              fill += ' ';
            }
          }
          newText += fill;
          onChange(newText);
          currentText = newText;
          textIndex = newText.length;
        } else {
          // 目标位置在现有文本范围内，但可能没有字符占据该位置
          // 我们需要确保在该位置有足够的空格
          let insertPos = 0;
          currentRow = 0;
          currentCol = 0;
          let foundPosition = false;
          let prevRow = 0;
          let prevCol = 0;

          // 遍历现有文本，找到目标位置
          for (let i = 0; i < newText.length; i++) {
            // 如果刚好到达目标位置
            if (currentRow === targetRow && currentCol === targetCol) {
              insertPos = i;
              foundPosition = true;
              textIndex = insertPos;
              break;
            }

            const char = newText[i];
            prevRow = currentRow;
            prevCol = currentCol;

            if (char === '\n') {
              currentRow++;
              currentCol = 0;
            } else {
              // 检查是否是英文字符（字母或数字）
              if (/[a-zA-Z0-9]/.test(char)) {
                // 检查下一个字符是否也是英文字符
                if (i + 1 < newText.length && /[a-zA-Z0-9]/.test(newText[i + 1])) {
                  // 英文两个字母占一格
                  currentCol++;
                  if (currentCol >= charsPerLine) {
                    currentRow++;
                    currentCol = 0;
                  }
                  i += 1; // 跳过下一个字符
                } else {
                  // 单个英文字母占一格
                  currentCol++;
                  if (currentCol >= charsPerLine) {
                    currentRow++;
                    currentCol = 0;
                  }
                }
              } else {
                // 中文字符或其他符号占一格
                currentCol++;
                if (currentCol >= charsPerLine) {
                  currentRow++;
                  currentCol = 0;
                }
              }
            }

            // 如果已经超过了目标位置，就停止遍历
            if (currentRow > targetRow || (currentRow === targetRow && currentCol > targetCol)) {
              insertPos = i;
              foundPosition = true;

              // 如果越界发生在目标行（多半是遇到该行的换行符），在换行符前补足空格
              if (prevRow === targetRow) {
                const missing = targetCol - prevCol;
                if (missing > 0) {
                  const fill2 = ' '.repeat(missing);
                  newText = newText.slice(0, insertPos) + fill2 + newText.slice(insertPos);
                  onChange(newText);
                  currentText = newText;
                  textIndex = insertPos + missing;
                } else {
                  textIndex = insertPos;
                }
              } else {
                // 不是目标行，直接使用插入位置
                textIndex = insertPos;
              }

              break;
            }
          }

          // 如果没有找到目标位置，说明需要从当前位置扩展文本到目标位置
          if (!foundPosition) {
            // 如果需要换行
            if (targetRow > currentRow) {
              for (let i = currentRow; i < targetRow; i++) {
                newText += '\n';
              }
              currentCol = 0;
            }

            // 添加空格到目标列
            for (let i = currentCol; i < targetCol; i++) {
              newText += ' ';
            }

            // 更新文本
            onChange(newText);
            currentText = newText;
            textIndex = newText.length;
          }
        }
      }

      // 确保textIndex不会超出文本长度
      textIndex = Math.min(textIndex, currentText.length);

      // 计算目标行的可视位置
      const rowIndex = Math.floor(gridIndex / charsPerLine);
      const gridTop = (rowIndex * (cellSize + rowGap)) + 16; // rowGap和16px是padding

      // 推迟到下一帧设置光标与位置，避免 onChange 触发的重渲染覆盖选择位置
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus({ preventScroll: true });
          textareaRef.current.setSelectionRange(textIndex, textIndex);
          textareaRef.current.style.top = `${gridTop}px`;
          textareaRef.current.style.left = '0';
        }
        // 高亮用户点击的格子
        setCursorPosition(gridIndex);
      }, 0);
    }

    // 恢复滚动位置
    window.scrollTo(scrollX, scrollY);
  };

  // 获取实际用于高亮的光标位置
  // 确保cursorPosition是一个有效的数字
  const highlightedGridPosition = cursorPosition;

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
          minHeight: `${cellSize * linesPerPage * 1.5}px`,  // 最小高度根据格子大小调整
          height: `${Math.max(cellSize * linesPerPage * 1.5, actualRows * (cellSize + rowGap) + 32)}px`  // 根据实际行数动态计算高度
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
            gridTemplateRows: `repeat(${actualRows}, ${cellSize}px)`, // 使用计算的实际行数
            padding: '1rem',
            columnGap: '0',  // 移除列间距
            rowGap: `${rowGap}px`,  // 使用动态行间距
          }}
        >
          {Array.from({ length: actualRows * charsPerLine }).map((_, index) => {
            const rowIndex = Math.floor(index / charsPerLine);
            const colIndex = index % charsPerLine;
            const isHundredMark = (index + 1) % 100 === 0;
            const isLineStart = colIndex === 0;

            // 计算对应位置的字符索引
            let charIndex = -1;
            let currentRow = 0;
            let currentCol = 0;

            // 遍历字符数组，找到对应位置的字符
            for (let i = 0; i < characters.length; i++) {
              const char = characters[i];
              if (currentRow === rowIndex && currentCol === colIndex) {
                charIndex = i;
                break;
              }

              if (char === '\n') {
                // 遇到换行符，跳到下一行开头
                currentRow++;
                currentCol = 0;
              } else {
                // 移动到下一个格子
                currentCol++;
                if (currentCol >= charsPerLine) {
                  // 到达行末，跳到下一行
                  currentRow++;
                  currentCol = 0;
                }
              }

              // 如果已经超过了目标位置，停止遍历
              if (currentRow > rowIndex || (currentRow === rowIndex && currentCol > colIndex)) {
                break;
              }
            }

            // 获取对应位置的字符
            const char = charIndex >= 0 ? characters[charIndex] : '';
            // 高亮当前光标位置的格子
            // 确保highlightedGridPosition是一个有效的数字
            const isCursorAtPosition = isFocused && highlightedGridPosition >= 0 && index === highlightedGridPosition;

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
                {char && char !== '\n' && (
                  <span
                    className="text-xl leading-none"
                    style={{
                      fontFamily: "'仿宋', 'FangSong', serif",
                      color: '#333',
                      // 如果是单个英文字母，添加左对齐样式
                      ...( /^[a-zA-Z0-9]$/.test(char) && {
                        transform: `translateX(-${Math.max(4, Math.floor(cellSize * 0.2))}px)`
                      }),
                      // 如果是双字母字符，添加letter-spacing使其均匀分布
                      ...( /^[a-zA-Z0-9]{2}$/.test(char) && {
                        letterSpacing: `${Math.max(2, Math.floor(cellSize * 0.1))}px`
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
          onKeyDown={handleKeyDown}
          className={`
            absolute bg-transparent resize-none focus:outline-none
            text-transparent caret-transparent z-10
          `}
          style={{
            fontFamily: "'仿宋', 'FangSong', serif",
            fontSize: `${Math.max(16, Math.floor(cellSize * 0.6))}px`,
            lineHeight: `${Math.max(24, Math.floor(cellSize * 0.9))}px`,
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
            width: '100%', // 占满整个容器宽度
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