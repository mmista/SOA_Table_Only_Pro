import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Package, Monitor } from 'lucide-react';
import { VisitType } from '../types/soa';
import { CommentIcon } from './CommentIcon';

interface ActivityCellProps {
  isActive: boolean;
  visitType?: VisitType;
  footnote?: string;
  customText?: string;
  isHighlighted?: boolean;
  isLinked?: boolean;
  isRowHovered?: boolean;
  hasComment?: boolean;
  isSelected?: boolean;
  colspan?: number;
  rowspan?: number;
  isMergedPlaceholder?: boolean;
  onClick: (e: React.MouseEvent) => void;
  onRightClick: (e: React.MouseEvent) => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onCustomTextChange?: (newText: string) => void;
}

const visitTypeConfig = {
  'in-person': { icon: User, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'phone-call': { icon: Phone, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'drug-shipment': { icon: Package, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'remote-assessment': { icon: Monitor, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
};

export const ActivityCell: React.FC<ActivityCellProps> = ({
  isActive,
  visitType,
  footnote,
  customText,
  isHighlighted = false,
  isLinked = false,
  isRowHovered = false,
  hasComment = false,
  isSelected = false,
  colspan = 1,
  rowspan = 1,
  isMergedPlaceholder = false,
  onClick,
  onRightClick,
  onCommentClick,
  onMouseEnter,
  onMouseLeave,
  onCustomTextChange
}) => {
  // All hooks must be called before any early returns
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

  // Don't render anything if this is a merged placeholder
  if (isMergedPlaceholder) {
    return null;
  }

  const IconComponent = visitType ? visitTypeConfig[visitType].icon : null;
  const iconColor = visitType ? visitTypeConfig[visitType].color : '';
  const bgColor = visitType ? visitTypeConfig[visitType].bgColor : '';
  const borderColor = visitType ? visitTypeConfig[visitType].borderColor : '';

  const isMerged = colspan > 1 || rowspan > 1;

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
    // Base background color - row hover takes precedence over default
    const baseBackground = isRowHovered ? 'bg-gray-50' : 'bg-white';
    
    // Selection styling takes highest precedence
    if (isSelected) {
      return 'bg-blue-200 border-blue-400 border-2 ring-2 ring-blue-500 ring-opacity-50';
    }
    
    if (isHighlighted) {
      if (isActive && visitType) {
        return `${bgColor} ${borderColor} border-2 ring-2 ring-blue-400 ring-opacity-50`;
      } else if (isActive) {
        return 'bg-blue-100 border-blue-300 border-2 ring-2 ring-blue-400 ring-opacity-50';
      } else {
        return `${isRowHovered ? 'bg-gray-100' : 'bg-blue-50'} border-blue-200 border-2 ring-2 ring-blue-400 ring-opacity-50`;
      }
    }
    
    if (isActive && visitType) {
      return `${bgColor} ${borderColor} border-2`;
    } else if (isActive) {
      return `${isRowHovered ? 'bg-gray-100' : 'bg-blue-50'} border-blue-200 border-2`;
    } else {
      const hoverClasses = isRowHovered ? '' : 'hover:bg-gray-50 hover:border-gray-300';
      return `${baseBackground} border-gray-200 border ${hoverClasses} ${isLinked ? 'ring-1 ring-blue-200 ring-opacity-30' : ''}`;
    }
  };

  const getTitle = () => {
    let title = '';
    if (isMerged) {
      title += 'Merged cell - double-click to edit text';
    } else {
      title += 'Click to activate, right-click for options';
    }
    if (isLinked) title += ' • Linked visit';
    if (hasComment) title += ' • Has comment';
    return title;
  };

  return (
    <td 
      className={`
        relative px-2 py-3 text-center cursor-pointer select-none
        transition-all duration-200 group min-w-[60px]
        ${isMerged ? 'min-h-[60px]' : 'h-[60px]'}
        ${getCellStyle()}
      `}
      colSpan={colspan}
      rowSpan={rowspan}
      onClick={(e) => onClick(e)}
      onContextMenu={onRightClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={getTitle()}
    >
      {/* Comment icon in top-left corner */}
      {onCommentClick && (
        <div className="absolute top-1 left-1 z-[5]">
          <CommentIcon
            hasComment={hasComment}
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick(e);
            }}
            size="sm"
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Visit type icon */}
        {IconComponent && !isMerged && (
          <div className="flex items-center justify-center">
            <IconComponent 
              className={`w-5 h-5 ${iconColor}`}
              strokeWidth={1.5}
            />
          </div>
        )}
        
        {/* Custom text - editable for merged cells */}
        {isMerged && (
          <div className="mt-1 text-sm text-gray-700 font-medium leading-tight w-full px-2">
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
        
        {/* Custom text below icon for non-merged cells */}
        {!isMerged && customText && (
          <div className="mt-1 text-xs text-gray-600 font-medium leading-tight">
            {customText}
          </div>
        )}
      </div>
      
      {/* Footnote in top-right corner */}
      {footnote && !isMerged && (
        <div className="absolute top-1 right-1 text-xs font-semibold text-gray-700 leading-none z-[5]">
          {footnote}
        </div>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none rounded" />
      )}
      
      {/* Hover overlay */}
      <div className={`
        absolute inset-0 rounded transition-all duration-200 pointer-events-none
        ${isHighlighted ? 'ring-2 ring-blue-400 ring-opacity-75' : 
          isActive ? 'ring-1 ring-blue-300 ring-opacity-50' : 
          'group-hover:ring-1 group-hover:ring-gray-300 group-hover:ring-opacity-50'}
      `} />
    </td>
  );
};