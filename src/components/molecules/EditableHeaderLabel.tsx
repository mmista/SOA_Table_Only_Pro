import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Edit2, Check, X } from 'lucide-react';

interface EditableHeaderLabelProps {
  id: string;
  label: string;
  isEditing: boolean;
  isVisible: boolean;
  isFocused?: boolean;
  onStartEdit: (id: string) => void;
  onSaveLabel: (id: string, newLabel: string) => void;
  onCancelEdit: () => void;
  onToggleVisibility: (id: string) => void;
  onRightClick?: (e: React.MouseEvent, item: any, type: EditableItemType) => void;
  onExitFocus?: () => void;
  className?: string;
}

export const EditableHeaderLabel: React.FC<EditableHeaderLabelProps> = ({
  id,
  label,
  isEditing,
  isVisible,
  isFocused = false,
  onStartEdit,
  onSaveLabel,
  onCancelEdit,
  onToggleVisibility,
  onRightClick,
  onExitFocus,
  className = "sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]"
}) => {
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(label);
  }, [label, isEditing]);

  const handleSave = () => {
    onSaveLabel(id, editValue);
  };

  const handleCancel = () => {
    setEditValue(label);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onRightClick) {
      // Create a mock item for the header label
      const mockItem = { id, name: label };
      // Determine type based on id or label
      let type: EditableItemType = 'day';
      if (id.includes('period') || label.includes('PERIOD')) type = 'period';
      else if (id.includes('cycle') || label.includes('CYCLE')) type = 'cycle';
      else if (id.includes('week') || label.includes('WEEK')) type = 'week';
      else if (id.includes('time-relative')) type = 'time-relative-cell';
      else if (id.includes('time-of-day')) type = 'time-of-day-cell';
      else if (id.includes('allowed-window')) type = 'time-window-cell';
      
      onRightClick(e, mockItem, type);
    }
  };

  const handleExitFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExitFocus) {
      onExitFocus();
    }
  };

  const getFocusedStyle = () => {
    if (!isFocused) return '';
    return 'bg-blue-200 border-blue-400 border-2 ring-2 ring-blue-500 ring-opacity-50';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <td 
      className={`${isFocused ? getFocusedStyle() : className} group relative`}
      onContextMenu={handleRightClick}
      title={isFocused ? `Currently focused. Click X to exit focus mode.` : undefined}
    >
      {/* Focus exit button */}
      {isFocused && onExitFocus && (
        <div className="absolute top-1 right-1 z-[5]">
          <button
            onClick={handleExitFocus}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-75 rounded-full transition-colors"
            title="Exit focus mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="bg-white border border-blue-300 rounded px-2 py-1 text-xs font-medium text-gray-700 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 flex-1"
              placeholder="Enter header name"
            />
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                title="Save changes"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Cancel editing"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(id)}
              className="flex items-center space-x-1 text-left group-hover:text-blue-600 transition-colors flex-1 min-w-0"
              title="Click to rename"
            >
              {isFocused && (
                <Search className="w-3 h-3 text-blue-600 mr-1" />
              )}
              <span className="truncate">{label}</span>
              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
            
            <button
              onClick={handleToggleVisibility}
              className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0 ${isFocused ? 'mr-8' : ''}`}
              title="Hide this row"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </td>
  );
};