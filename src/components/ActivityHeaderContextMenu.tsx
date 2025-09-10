import React, { useEffect, useRef } from 'react';
import { Users, Unlink, Edit2, Palette } from 'lucide-react';
import { ActivityGroup } from '../types/soa';

interface ActivityHeaderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedActivityHeaders: Set<string>;
  clickedActivityId: string | null;
  activityGroups: ActivityGroup[];
  activities: any[];
  onGroup: () => void;
  onUngroup: (groupId: string) => void;
  onRename: (groupId: string) => void;
  onChangeColor: (groupId: string) => void;
  onClose: () => void;
}

export const ActivityHeaderContextMenu: React.FC<ActivityHeaderContextMenuProps> = ({
  isOpen,
  position,
  selectedActivityHeaders,
  clickedActivityId,
  activityGroups,
  activities,
  onGroup,
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

  if (!isOpen) return null;

  const hasMultipleSelection = selectedActivityHeaders.size > 1;
  const selectedActivities = activities.filter(activity => selectedActivityHeaders.has(activity.id));
  
  // Check if all selected activities are ungrouped or belong to different groups
  const canGroup = hasMultipleSelection && selectedActivities.every(activity => !activity.groupId);
  
  // Check if single selection belongs to a group
  const singleActivityGroup = selectedActivityHeaders.size === 1 && clickedActivityId ? 
    activities.find(activity => activity.id === clickedActivityId)?.groupId : null;
  
  const currentGroup = singleActivityGroup ? 
    activityGroups.find(group => group.id === singleActivityGroup) : null;

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
          {hasMultipleSelection ? `${selectedActivityHeaders.size} activities selected` : 'Activity Options'}
        </div>
        
        {/* Group Activities */}
        {canGroup && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onGroup();
              onClose();
            }}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Group Activities</span>
          </button>
        )}
        
        {/* Group Management Options */}
        {currentGroup && (
          <>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onRename(currentGroup.id);
                onClose();
              }}
            >
              <Edit2 className="w-4 h-4 text-green-500" />
              <span>Rename Group "{currentGroup.name}"</span>
            </button>
            
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onChangeColor(currentGroup.id);
                onClose();
              }}
            >
              <Palette className="w-4 h-4 text-purple-500" />
              <span>Change Group Color</span>
            </button>
            
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                onUngroup(currentGroup.id);
                onClose();
              }}
            >
              <Unlink className="w-4 h-4" />
              <span>Ungroup Activities</span>
            </button>
          </>
        )}
        
        {/* No options available */}
        {!canGroup && !currentGroup && (
          <div className="px-3 py-2 text-sm text-gray-500">
            No grouping options available
          </div>
        )}
      </div>
    </>
  );
};