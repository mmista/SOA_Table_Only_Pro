import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff, Focus, X, Minimize2 } from 'lucide-react';
import { EditableItemType } from '../types/soa';

interface TimelineHeaderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  headerId: string | null;
  headerType: EditableItemType | null;
  headerName: string;
  isHeaderMinimized: boolean;
  isHeaderFocused: boolean;
  isFocusMode: boolean;
  onMinimize: (headerId: string) => void;
  onUnminimize: (headerId: string) => void;
  onFocus: (headerId: string, headerType: EditableItemType) => void;
  onUnfocus: () => void;
  onClose: () => void;
}

export const TimelineHeaderContextMenu: React.FC<TimelineHeaderContextMenuProps> = ({
  isOpen,
  position,
  headerId,
  headerType,
  headerName,
  isHeaderMinimized,
  isHeaderFocused,
  isFocusMode,
  onMinimize,
  onUnminimize,
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

  if (!isOpen || !headerId || !headerType) return null;

  const getTypeColor = () => {
    switch (headerType) {
      case 'period': return 'text-blue-600 bg-blue-50';
      case 'cycle': return 'text-green-600 bg-green-50';
      case 'week': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate menu position to keep it within viewport
  const getMenuStyle = () => {
    const menuWidth = 250;
    const menuHeight = 200;
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

  const handleMinimize = () => {
    onMinimize(headerId);
    onClose();
  };

  const handleUnminimize = () => {
    onUnminimize(headerId);
    onClose();
  };

  const handleFocus = () => {
    onFocus(headerId, headerType);
    onClose();
  };

  const handleUnfocus = () => {
    onUnfocus();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[250px]"
        style={{ 
          left: menuStyle.left, 
          top: menuStyle.top
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 mb-1">
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
              {headerType.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900">{headerName}</span>
          </div>
        </div>
        
        {/* Focus Options */}
        {!isFocusMode && !isHeaderFocused && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleFocus}
          >
            <Focus className="w-4 h-4 text-blue-500" />
            <span>Focus on this {headerType}</span>
          </button>
        )}
        
        {isHeaderFocused && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleUnfocus}
          >
            <X className="w-4 h-4 text-red-500" />
            <span>Exit focus mode</span>
          </button>
        )}
        
        {/* Minimize/Unminimize Options */}
        {!isFocusMode && (
          <>
            <div className="border-t border-gray-100 my-1" />
            
            {!isHeaderMinimized ? (
              <button
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleMinimize}
              >
                <Minimize2 className="w-4 h-4 text-orange-500" />
                <span>Minimize {headerType}</span>
              </button>
            ) : (
              <button
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleUnminimize}
              >
                <Eye className="w-4 h-4 text-green-500" />
                <span>Restore {headerType}</span>
              </button>
            )}
          </>
        )}
        
        {/* Info */}
        <div className="border-t border-gray-100 mt-1 pt-1">
          <div className="px-3 py-1 text-xs text-gray-500">
            {isFocusMode ? (
              isHeaderFocused ? 
                'This header is currently focused' : 
                'Another header is focused'
            ) : (
              'Right-click for more options'
            )}
          </div>
        </div>
      </div>
    </>
  );
};