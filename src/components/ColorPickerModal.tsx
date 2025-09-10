import React, { useState } from 'react';
import { X, Save, Palette, Check } from 'lucide-react';
import { GROUP_COLORS, COLOR_NAMES } from '../utils/constants';

interface ColorPickerModalProps {
  isOpen: boolean;
  groupId: string | null;
  groupName: string;
  currentColor: string;
  onClose: () => void;
  onSaveColor: (groupId: string, newColor: string) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  groupId,
  groupName,
  currentColor,
  onClose,
  onSaveColor
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  React.useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor, isOpen]);

  if (!isOpen || !groupId) return null;

  const handleSave = () => {
    if (selectedColor && groupId) {
      onSaveColor(groupId, selectedColor);
    }
    onClose();
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Change Group Color</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Changing color for group: <span className="font-medium text-purple-700">{groupName}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Current Color Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Color</h3>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {COLOR_NAMES[currentColor] || 'Custom Color'}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {currentColor}
                </div>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select New Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`
                    relative w-16 h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105
                    ${selectedColor === color 
                      ? 'border-gray-800 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={`${COLOR_NAMES[color] || 'Custom'} (${color})`}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Color Preview */}
          {selectedColor !== currentColor && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">New Color Preview</h3>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-blue-300"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {COLOR_NAMES[selectedColor] || 'Custom Color'}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {selectedColor}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color Usage Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">About Group Colors</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Group colors help visually organize related activities</div>
              <div>• The color appears as a left border on activity rows</div>
              <div>• All activities in this group will use the selected color</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!selectedColor}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Color</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};