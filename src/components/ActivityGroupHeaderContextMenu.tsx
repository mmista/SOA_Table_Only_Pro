import React, { useEffect, useRef } from 'react';
import { Unlink, Edit2, Palette } from 'lucide-react';

interface ActivityGroupHeaderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  groupId: string | null;
  groupName: string;
  onUngroup: (groupId: string) => void;
  onRename: (groupId: string) => void;
  onChangeColor: (groupId: string) => void;
  onClose: () => void;
}

export const ActivityGroupHeaderContextMenu: React.FC<ActivityGroupHeaderContextMenuProps> = ({
  isOpen,
  position,
  groupId,
  groupName,
  onUngroup,
  onRename,
  onChangeColor,
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

  if (!isOpen || !groupId) return null;

  // Calculate menu position to keep it within viewport
  const getMenuStyle = () => {
    const menuWidth = 250;
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
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
          Group: {groupName}
        </div>
        
        {/* Rename Group */}
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => {
            onRename(groupId);
            onClose();
          }}
        >
          <Edit2 className="w-4 h-4 text-green-500" />
          <span>Rename Group</span>
        </button>
        
        {/* Change Color */}
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => {
            onChangeColor(groupId);
            onClose();
          }}
        >
          <Palette className="w-4 h-4 text-purple-500" />
          <span>Change Group Color</span>
        </button>
        
        {/* Ungroup */}
        <div className="border-t border-gray-100 my-1" />
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          onClick={() => {
            onUngroup(groupId);
            onClose();
          }}
        >
          <Unlink className="w-4 h-4" />
          <span>Ungroup Activities</span>
        </button>
      </div>
    </>
  );
};