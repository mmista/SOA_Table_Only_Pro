  import { Users, Edit2, Palette, Unlink, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { ActivityGroup } from '../types/soa';
import { useState, useRef, useEffect } from 'react';

interface ActivityGroupHeaderProps {
  group: ActivityGroup;
  totalColumns: number;
  isCollapsed: boolean;
  isDragging?: boolean;
  isValidDropTarget?: boolean;
  dropZoneStyle?: string;
  forceShowColorPicker?: boolean;
  onToggleCollapse: (groupId: string) => void;
  onRename: (groupId: string, newName: string) => void;
  onChangeColor: (groupId: string, newColor: string) => void;
  onOpenColorPicker?: (groupId: string | null) => void;
  onUngroup: (groupId: string) => void;
  onRightClick: (e: React.MouseEvent, groupId: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const GROUP_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
];

export const ActivityGroupHeader: React.FC<ActivityGroupHeaderProps> = ({
  group,
  totalColumns,
  isCollapsed,
  isDragging = false,
  isValidDropTarget = false,
  dropZoneStyle = '',
  onToggleCollapse,
  onRename,
  onChangeColor,
  onOpenColorPicker,
  onUngroup,
  onRightClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== group.name) {
      onRename(group.id, editName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditName(group.name);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleColorChange = (newColor: string) => {
    onChangeColor(group.id, newColor);
  };

  const handleOpenColorPicker = () => {
    onOpenColorPicker?.(group.id);
  };

  return (
    <tr 
      className={`
        bg-gray-50 border-t-2 border-b border-gray-200 cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isValidDropTarget ? 'ring-1 ring-blue-300' : ''}
        ${dropZoneStyle}
      `}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <td 
        className="sticky left-0 bg-gray-50 px-4 py-3 z-[15] border-r border-gray-300"
        onContextMenu={(e) => onRightClick(e, group.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Collapse/Expand Button */}
            <button
              onClick={() => onToggleCollapse(group.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={isCollapsed ? 'Expand group' : 'Collapse group'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Group Icon with Color */}
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: group.color }}
            >
              <Users className="w-3 h-3 text-white" strokeWidth={2} />
            </div>

            {/* Group Name */}
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveName}
                  className="px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group name"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1 group"
              >
                <span>{group.name}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      </td>
      
      {/* Data columns area */}
      <td 
        className="bg-gray-50 border-l border-gray-300" 
        colSpan={totalColumns}
      >
        {/* Empty space for data columns */}
      </td>
    </tr>
  );
};