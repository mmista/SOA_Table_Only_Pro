import React, { useState } from 'react';
import { GripVertical, Plus, Search, X } from 'lucide-react';
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
  isValidDropTarget: boolean;
  hoveredDropZone: string | null;
  hasComment?: boolean;
  isFocused?: boolean;
  onDragStart: (item: any, type: EditableItemType) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onAddItem: (type: EditableItemType, id: string, side: 'left' | 'right') => void;
  setHoveredDropZone: (zoneId: string | null) => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent, item: any, type: EditableItemType) => void;
  onExitFocus?: () => void;
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
  isValidDropTarget,
  hoveredDropZone,
  hasComment = false,
  isFocused = false,
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
  onExitFocus
}) => {
  const [dragOver, setDragOver] = useState<'before' | 'after' | 'inside' | null>(null);

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
    if (onRightClick) {
      onRightClick(e, item, type);
    }
  };

  const handleExitFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExitFocus) {
      onExitFocus();
    }
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

  const getFocusedStyle = () => {
    if (!isFocused) return '';
    
    switch (type) {
      case 'period': return 'bg-blue-200 border-blue-400 border-2 ring-2 ring-blue-500 ring-opacity-50';
      case 'cycle': return 'bg-green-200 border-green-400 border-2 ring-2 ring-green-500 ring-opacity-50';
      case 'week': return 'bg-orange-200 border-orange-400 border-2 ring-2 ring-orange-500 ring-opacity-50';
      default: return 'bg-gray-200 border-gray-400 border-2 ring-2 ring-gray-500 ring-opacity-50';
    }
  };

  return (
    <td
      key={item.id}
      colSpan={colSpan}
      className={`
        relative border border-gray-300 px-3 py-2 text-center text-sm font-medium 
        ${isFocused ? getFocusedStyle() : bgColor} cursor-pointer hover:bg-opacity-80 transition-all duration-200 
        group
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isValidDropTarget ? 'ring-1 ring-blue-300' : ''}
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
      title={isFocused ? `Currently focused on ${type}: ${item.name}. Click X to exit focus mode.` : undefined}
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
      
      {/* Focus exit button */}
      {isFocused && onExitFocus && (
        <div className="absolute top-1 right-8 z-[5]">
          <button
            onClick={handleExitFocus}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-75 rounded-full transition-colors"
            title="Exit focus mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      {/* Drag Handle */}
      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className={`w-3 h-3 ${getTypeColor()}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {isFocused && (
          <div className="flex items-center space-x-1 mb-1">
            <Search className={`w-3 h-3 ${getTypeColor()}`} />
            <span className="text-xs font-medium text-gray-600 uppercase">FOCUSED</span>
          </div>
        )}
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