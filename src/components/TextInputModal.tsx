import React, { useState, useEffect, useRef } from 'react';
import { Type, Save, X } from 'lucide-react';

interface TextInputModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentText?: string;
  onSave: (text: string) => void;
  onClose: () => void;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  isOpen,
  position,
  currentText = '',
  onSave,
  onClose
}) => {
  const [text, setText] = useState(currentText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(currentText);
  }, [currentText, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen]);

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
    onSave(text);
  };

  const handleCancel = () => {
    setText(currentText);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Calculate modal position to keep it within viewport
  const getModalStyle = () => {
    const modalWidth = 320;
    const modalHeight = 200;
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
            <Type className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-900">Add Text to Cell</span>
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
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cell Text
              </label>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter instructional text or notes..."
                className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-500">
            Press Ctrl+Enter to save, Esc to cancel
          </p>
        </div>
      </div>
    </>
  );
};