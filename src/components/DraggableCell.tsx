import React, { useState } from 'react';
import { GripVertical, Plus, Eye, X } from 'lucide-react';
import { EditableItemType } from '../types/soa';
import { CommentIcon } from './CommentIcon';

interface DraggableCellProps {
  title: string;
  subtitle?: string;
  colSpan: number;
  type: EditableItemType;
  item: any;
  bgColor: string;
  isDragging: boolean;
  isHovered: boolean;
  isVisible: boolean;
  isFocused: boolean;
  isValidDropTarget: boolean;
  hoveredDropZone: string | null;
  hasComment?: boolean;
  onDragStart: (item: any, type: EditableItemType) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onAddItem: (type: EditableItemType, id: string, side: 'left' | 'right') => void;
  setHoveredDropZone: (zoneId: string | null) => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent) => void;
  onShowHeader?: (id: string) => void;
  onUnfocusAllHeaders?: () => void;
}

export const DraggableCell: React.FC<DraggableCellProps> = ({
  title,
  subtitle,
  colSpan,
  type,
  item,
  bgColor,
  isDragging,
  isHovered,
  isVisible,
  isFocused,
  isValidDropTarget,
  hoveredDropZone,
  hasComment = false,
  onDragStart,
  onDragEnd,
  onDrop,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onAddItem,
  setHoveredDropZone,
  onCommentClick,
  onRightClick,
  onShowHeader,
  onUnfocusAllHeaders
}) => {
  const [dragOver, setDragOver] = useState<'before' | 'after' | 'inside' | null>(null);

  // If not visible, render as thin strip
  if (!isVisible) {
    return (
      <td
        className="min-w-[24px] max-w-[24px] w-[24px] bg-gray-200 border border-gray-300 text-center cursor-pointer hover:bg-gray-300 transition-colors relative"
        onClick={() => onShowHeader?.(item.id)}
        title={`Show ${title}`}
      >
        <div className="flex flex-col items-center justify-center h-full py-1">
          <Eye className="w-3 h-3 text-gray-600 mb-1" />
          <span className="text-xs font-bold text-gray-600 transform -rotate-90 origin-center">
            {title.charAt(0)}
          </span>
        </div>
      </td>
    );
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(item, type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!isValidDropTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    let position: 'before' | 'after' | 'inside';
    
    if (x < width * 0.25) {
      position = 'before';
    } else if (x > width * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }
    
    setDragOver(position);
    setHoveredDropZone(`${item.id}-${position}`);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(null);
      setHoveredDropZone(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragOver && isValidDropTarget) {
      onDrop(item.id, type, dragOver);
    }
    setDragOver(null);
    setHoveredDropZone(null);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick?.(e);
  };

  const getDropZoneStyle = () => {
    if (!dragOver || !isValidDropTarget) return '';
    
    switch (dragOver) {
      case 'before':
        return 'border-l-4 border-l-blue-500';
      case 'after':
        return 'border-r-4 border-r-blue-500';
      case 'inside':
        return 'ring-2 ring-blue-500 ring-inset';
      default:
        return '';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'period': return 'text-blue-600';
      case 'cycle': return 'text-green-600';
      case 'week': return 'text-orange-600';
      case 'day': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTitleStyle = () => {
    switch (type) {
      case 'period': return 'text-lg font-semibold leading-tight';
      case 'cycle': return 'text-base font-medium leading-tight';
      case 'week': return 'text-sm font-medium leading-tight';
      case 'day': return 'text-sm font-medium leading-tight';
      default: return 'text-sm font-medium leading-tight';
    }
  };

  const getSubtitleStyle = () => {
    switch (type) {
      case 'period': return 'text-xs font-normal text-gray-500';
      case 'cycle': return 'text-xs font-normal text-gray-500';
      case 'week': return 'text-xs font-normal text-gray-500';
      case 'day': return 'text-xs font-normal text-gray-500';
      default: return 'text-xs font-normal text-gray-500';
    }
  };
  return (
    <td
      key={item.id}
      colSpan={colSpan}
      className={`
        relative border border-gray-300 px-3 py-2 text-center text-sm font-medium 
        ${bgColor} cursor-pointer hover:bg-opacity-80 transition-all duration-200 
        group
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isValidDropTarget ? 'ring-1 ring-blue-300' : ''}
        ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${getDropZoneStyle()}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onContextMenu={handleRightClick}
    >
      {/* Comment icon in top-right corner */}
      {onCommentClick && (
        <div className="absolute top-1 right-1 z-[5]">
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
      
      {/* Drag Handle */}
      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical className={`w-3 h-3 ${getTypeColor()}`} />
      </div>

      {/* Focus Exit Button */}
      {isFocused && onUnfocusAllHeaders && (
        <div className="absolute top-1 right-8 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnfocusAllHeaders();
            }}
            className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            title="Exit focus mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className={getTitleStyle()}>
          {title}
        </div>
        {subtitle && (
          <div className={getSubtitleStyle()}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Drop Zone Indicators */}
      {dragOver && isValidDropTarget && (
        <>
          {dragOver === 'before' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 z-20" />
          )}
          {dragOver === 'after' && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 z-20" />
          )}
          {dragOver === 'inside' && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-30 z-0" />
          )}
        </>
      )}

      {/* Focus indicator */}
      {isFocused && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none z-30" />
      )}

      {/* Add Buttons */}
      {isHovered && !isDragging && (
        <>
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
            onClick={(e) => {
              e.stopPropagation();
              onAddItem(type, item.id, 'left');
            }}
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
            onClick={(e) => {
              e.stopPropagation();
              onAddItem(type, item.id, 'right');
            }}
          >
            <Plus className="w-3 h-3" />
          </button>
        </>
      )}

      {/* Tooltip */}
      {dragOver && isValidDropTarget && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-40">
          Drop {dragOver === 'inside' ? 'inside' : dragOver} {type}
        </div>
      )}
    </td>
  );
};