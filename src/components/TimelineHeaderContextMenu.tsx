import React, { useEffect, useRef } from 'react';
import { Search, Edit2, Plus } from 'lucide-react';
import { EditableItemType } from '../types/soa';

interface TimelineHeaderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  clickedItem: { id: string; name: string; type: EditableItemType } | null;
  onFocus: (id: string, type: EditableItemType) => void;
  onEdit: (item: any, type: EditableItemType) => void;
  onAddItem: (type: EditableItemType, id: string, side: 'left' | 'right') => void;
  onClose: () => void;
}

export const TimelineHeaderContextMenu: React.FC<TimelineHeaderContextMenuProps> = ({
  isOpen,
  position,
  clickedItem,
  onFocus,
  onEdit,
  onAddItem,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !clickedItem) return null;

  const getTypeLabel = (type: EditableItemType) => {
    switch (type) {
      case 'period': return 'Period';
      case 'cycle': return 'Cycle';
      case 'week': return 'Week';
      case 'day': return 'Day';
      default: return 'Item';
    }
  };

  // Calculate menu position to keep it within viewport
  const getMenuStyle = () => {
    const menuWidth = 280;
    const menuHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position
    if (left + menuWidth > viewportWidth - 20) {
      left = viewportWidth - menuWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    // Adjust vertical position
    if (top + menuHeight > viewportHeight - 20) {
      top = position.y - menuHeight - 10;
    }
    if (top < 20) {
      top = 20;
    }
    
    return { left, top };
  };

  const menuStyle = getMenuStyle();

  // Only show focus option for period, cycle, and week
  const canFocus = ['period', 'cycle', 'week'].includes(clickedItem.type);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[280px]"
        style={{ 
          left: menuStyle.left, 
          top: menuStyle.top
        }}
      >
        {/* Header */}
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
          {getTypeLabel(clickedItem.type)}: {clickedItem.name}
        </div>
        
        {/* Focus Option */}
        {canFocus && (
          <>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              onClick={() => {
                onFocus(clickedItem.id, clickedItem.type);
                onClose();
              }}
            >
              <Search className="w-4 h-4 text-blue-500" />
              <span>Focus on {getTypeLabel(clickedItem.type)}: {clickedItem.name}</span>
            </button>
            <div className="border-t border-gray-100 my-1" />
          </>
        )}
        
        {/* Edit Option */}
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => {
            onEdit(clickedItem, clickedItem.type);
            onClose();
          }}
        >
          <Edit2 className="w-4 h-4 text-green-500" />
          <span>Edit {getTypeLabel(clickedItem.type)}</span>
        </button>
        
        {/* Add Options */}
        {clickedItem.type !== 'day' && (
          <>
            <div className="border-t border-gray-100 my-1" />
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onAddItem(clickedItem.type, clickedItem.id, 'left');
                onClose();
              }}
            >
              <Plus className="w-4 h-4 text-purple-500" />
              <span>Add {getTypeLabel(clickedItem.type)} Before</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onAddItem(clickedItem.type, clickedItem.id, 'right');
                onClose();
              }}
            >
              <Plus className="w-4 h-4 text-purple-500" />
              <span>Add {getTypeLabel(clickedItem.type)} After</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};