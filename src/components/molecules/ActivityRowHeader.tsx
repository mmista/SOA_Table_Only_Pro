import React from 'react';
import { Minus } from 'lucide-react';
import { CategoryDot } from '../atoms/CategoryDot';
import { EditableText } from '../atoms/EditableText';
import { ActivityData } from '../../types/soa';

interface ActivityRowHeaderProps {
  activity: ActivityData;
  isEditing: boolean;
  isHovered: boolean;
  onEdit: () => void;
  onSave: (newDescription: string) => void;
  onCancel: () => void;
  onRemove: () => void;
}

export const ActivityRowHeader: React.FC<ActivityRowHeaderProps> = ({
  activity,
  isEditing,
  isHovered,
  onEdit,
  onSave,
  onCancel,
  onRemove
}) => {
  return (
    <td className={`sticky left-0 px-6 py-4 border-r border-gray-300 z-[15] border-b border-gray-300 transition-colors duration-150 ${isHovered ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CategoryDot category={activity.category} />
          
          <EditableText
            text={activity.description}
            isEditing={isEditing}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
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