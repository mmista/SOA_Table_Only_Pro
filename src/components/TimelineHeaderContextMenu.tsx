import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff, Focus, Focus as Unfocus } from 'lucide-react';
import { TimelineHeaderConfig } from '../hooks/useTimelineHeaderManagement';

interface TimelineHeaderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  header: TimelineHeaderConfig | null;
  isFocused: boolean;
  onHide: (headerId: string) => void;
  onShow: (headerId: string) => void;
  onFocus: (headerId: string, headerType: 'period' | 'cycle' | 'week') => void;
  onUnfocus: () => void;
  onClose: () => void;
}

export const TimelineHeaderContextMenu: React.FC<TimelineHeaderContextMenuProps> = ({
  isOpen,
  position,
  header,
  isFocused,
  onHide,
  onShow,
  onFocus,
  onUnfocus,
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

  if (!isOpen || !header) return null;

  const canFocus = header.type === 'period' || header.type === 'cycle' || header.type === 'week';

  // Calculate menu position to keep it within viewport
  const getMenuStyle = () => {
    const menuWidth = 200;
    const menuHeight = 150;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    if (left + menuWidth > viewportWidth - 20) {
      left = viewportWidth - menuWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    if (top + menuHeight > viewportHeight - 20) {
      top = position.y - menuHeight - 10;
    }
    if (top < 20) {
      top = 20;
    }
    
    return { left, top };
  };

  const menuStyle = getMenuStyle();

  const getTypeColor = () => {
    switch (header.type) {
      case 'period': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cycle': return 'text-green-600 bg-green-50 border-green-200';
      case 'week': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'day': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px]"
        style={{ 
          left: menuStyle.left, 
          top: menuStyle.top
        }}
      >
        {/* Header */}
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor()}`}>
            {header.type.toUpperCase()}
          </div>
          <span>{header.label}</span>
        </div>
        
        {/* Visibility Options */}
        {header.isVisible ? (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onHide(header.id);
              onClose();
            }}
          >
            <EyeOff className="w-4 h-4 text-gray-500" />
            <span>Hide</span>
          </button>
        ) : (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onShow(header.id);
              onClose();
            }}
          >
            <Eye className="w-4 h-4 text-green-500" />
            <span>Show</span>
          </button>
        )}
        
        {/* Focus Options - only for period, cycle, week */}
        {canFocus && (
          <>
            <div className="border-t border-gray-100 my-1" />
            
            {isFocused ? (
              <button
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onUnfocus();
                  onClose();
                }}
              >
                <Unfocus className="w-4 h-4 text-orange-500" />
                <span>Exit Focus</span>
              </button>
            ) : (
              <button
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onFocus(header.id, header.type as 'period' | 'cycle' | 'week');
                  onClose();
                }}
              >
                <Focus className="w-4 h-4 text-blue-500" />
                <span>Focus on this {header.type}</span>
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};