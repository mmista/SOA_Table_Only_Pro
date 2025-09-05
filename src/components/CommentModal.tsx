import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Save, Trash2, X } from 'lucide-react';

interface CommentModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  cellId: string;
  cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day';
  existingComment?: string;
  onSave: (cellId: string, cellType: string, comment: string) => void;
  onDelete: (cellId: string, cellType: string) => void;
  onClose: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  position,
  cellId,
  cellType,
  existingComment = '',
  onSave,
  onDelete,
  onClose
}) => {
  const [comment, setComment] = useState(existingComment);
  const [isEditing, setIsEditing] = useState(!existingComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComment(existingComment);
    setIsEditing(!existingComment);
  }, [existingComment, isOpen]);

  useEffect(() => {
    if (isOpen && isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (comment.trim()) {
      onSave(cellId, cellType, comment.trim());
      setIsEditing(false);
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(cellId, cellType);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setComment(existingComment);
    setIsEditing(false);
    if (!existingComment) {
      onClose();
    }
  };

  const getCellTypeLabel = () => {
    switch (cellType) {
      case 'activity': return 'Activity Cell';
      case 'period': return 'Period';
      case 'cycle': return 'Cycle';
      case 'week': return 'Week';
      case 'day': return 'Day';
      default: return 'Cell';
    }
  };

  const getCellTypeColor = () => {
    switch (cellType) {
      case 'activity': return 'text-indigo-600 bg-indigo-50';
      case 'period': return 'text-blue-600 bg-blue-50';
      case 'cycle': return 'text-green-600 bg-green-50';
      case 'week': return 'text-orange-600 bg-orange-50';
      case 'day': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate modal position to keep it within viewport
  const getModalStyle = () => {
    const modalWidth = 320;
    const modalHeight = isEditing ? 200 : 150;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position
    if (left + modalWidth > viewportWidth - 20) {
      left = viewportWidth - modalWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    // Adjust vertical position
    if (top + modalHeight > viewportHeight - 20) {
      top = position.y - modalHeight - 10;
    }
    if (top < 20) {
      top = 20;
    }
    
    return { left, top };
  };

  const modalStyle = getModalStyle();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-80 animate-in fade-in duration-200"
        style={{ 
          left: modalStyle.left, 
          top: modalStyle.top
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">Comment</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCellTypeColor()}`}>
                {getCellTypeLabel()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment..."
                className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
              />
              <div className="flex justify-between">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex space-x-2">
                  {existingComment && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!comment.trim()}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                {comment}
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {isEditing && (
          <div className="px-3 pb-2">
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to save, Esc to cancel
            </p>
          </div>
        )}
      </div>
    </>
  );
};