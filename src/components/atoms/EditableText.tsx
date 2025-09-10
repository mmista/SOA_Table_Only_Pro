import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
  text: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newText: string) => void;
  onCancel: () => void;
  className?: string;
  maxWidth?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  text,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  className = "text-sm font-medium text-gray-900 hover:text-blue-600",
  maxWidth = "max-w-[180px]"
}) => {
  const [editValue, setEditValue] = useState(text);

  React.useEffect(() => {
    setEditValue(text);
  }, [text, isEditing]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleCancel = () => {
    setEditValue(text);
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyPress}
          autoFocus
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-700">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={handleCancel} className="text-red-600 hover:text-red-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onEdit}
      className={`${className} flex items-center space-x-1 text-left group`}
    >
      <span className={`${maxWidth} truncate`}>{text}</span>
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};