import React, { useState, useRef, useEffect } from 'react';

interface TimeWindowCellProps {
  dayId: string;
  value: number;
  customText?: string;
  isSelected?: boolean;
  isMerged?: boolean;
  colspan?: number;
  rowspan?: number;
  onClick: (e: React.MouseEvent) => void;
  onRightClick: (e: React.MouseEvent) => void;
  onCustomTextChange?: (newText: string) => void;
}

export const TimeWindowCell: React.FC<TimeWindowCellProps> = ({
  dayId,
  value,
  customText,
  isSelected = false,
  isMerged = false,
  colspan = 1,
  rowspan = 1,
  onClick,
  onRightClick,
  onCustomTextChange
}) => {
  const [isEditingCustomText, setIsEditingCustomText] = useState(false);
  const [editText, setEditText] = useState(customText || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingCustomText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingCustomText]);

  useEffect(() => {
    setEditText(customText || '');
  }, [customText]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMerged && onCustomTextChange) {
      setIsEditingCustomText(true);
    }
  };

  const handleTextSave = () => {
    if (onCustomTextChange) {
      onCustomTextChange(editText.trim() || 'Continuous');
    }
    setIsEditingCustomText(false);
  };

  const handleTextCancel = () => {
    setEditText(customText || '');
    setIsEditingCustomText(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTextCancel();
    }
  };

  const getCellStyle = () => {
    if (isSelected) {
      return 'bg-blue-200 border-blue-400 border-2 ring-2 ring-blue-500 ring-opacity-50';
    }
    
    return 'border border-gray-300 hover:bg-gray-50 transition-colors';
  };

  const getTitle = () => {
    let title = '';
    if (isMerged) {
      title += 'Merged cell - double-click to edit text';
    } else {
      title += 'Click to select, Shift+click for range selection';
    }
    return title;
  };

  return (
    <td 
      className={`
        px-3 py-2 text-center cursor-pointer select-none text-xs
        transition-all duration-200 min-w-[60px]
        ${isMerged ? 'min-h-[40px]' : 'h-[40px]'}
        ${getCellStyle()}
      `}
      colSpan={colspan}
      rowSpan={rowspan}
      onClick={onClick}
      onContextMenu={onRightClick}
      onDoubleClick={handleDoubleClick}
      title={getTitle()}
    >
      {/* Main content area */}
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Custom text - editable for merged cells */}
        {isMerged && (
          <div className="text-sm text-gray-700 font-medium leading-tight w-full px-2">
            {isEditingCustomText ? (
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleTextSave}
                onKeyDown={handleKeyDown}
                className="w-full text-center bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description..."
              />
            ) : (
              <div 
                className="cursor-text hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                title="Double-click to edit"
              >
                {customText || 'Continuous'}
              </div>
            )}
          </div>
        )}
        
        {/* Default value display for non-merged cells */}
        {!isMerged && (
          <span>±{value}h</span>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none rounded" />
      )}
    </td>
  );
};