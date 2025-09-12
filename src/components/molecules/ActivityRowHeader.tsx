import React from 'react';
import { Minus } from 'lucide-react';
import { EditableText } from '../atoms/EditableText';
import { ActivityData } from '../../types/soa';

interface ActivityRowHeaderProps {
  activity: ActivityData;
  isEditing: boolean;
  isHovered: boolean;
  isSelected: boolean;
  groupColor?: string;
  onEdit: () => void;
  onSave: (newDescription: string) => void;
  onCancel: () => void;
  onRemove: () => void;
  onClick: (e: React.MouseEvent) => void;
  onRightClick: (e: React.MouseEvent) => void;
}

export const ActivityRowHeader: React.FC<ActivityRowHeaderProps> = ({
  activity,
  isEditing,
  isHovered,
  isSelected,
  groupColor,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  onClick,
  onRightClick
}) => {
  const getBackgroundStyle = () => {
    if (isSelected) {
      return 'bg-blue-100';
    }
    if (groupColor) {
      return isHovered ? 'bg-gray-50' : 'bg-white';
    }
    return isHovered ? 'bg-gray-50' : 'bg-white';
  };

  const getColorBarStyle = () => {
    if (isSelected) {
      return { backgroundColor: '#3B82F6' };
    }
    if (groupColor) {
      return { backgroundColor: groupColor };
    }
    return null;
  };

  return (
    <td 
      className={`sticky left-0 px-6 py-4 border-r border-gray-300 z-[15] border-b border-gray-300 transition-colors duration-150 cursor-pointer select-none relative min-w-[200px] max-w-[33vw] ${getBackgroundStyle()}`}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      {/* Colored bar indicator */}
      {(groupColor || isSelected) && (
        <div 
          className="absolute top-0 bottom-0 left-0 w-1 transition-colors duration-150"
          style={getColorBarStyle()}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <EditableText
            text={activity.description}
            isEditing={isEditing}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
          
          {isSelected && (
            <div className="text-xs text-blue-600 font-medium">
              Selected
            </div>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </td>
  );
};