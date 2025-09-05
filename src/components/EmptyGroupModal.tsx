import React from 'react';
import { AlertTriangle, Check, Trash2 } from 'lucide-react';
import { EditableItemType } from '../types/soa';

interface EmptyGroupModalProps {
  isOpen: boolean;
  groupName: string;
  groupType: EditableItemType;
  onKeepEmpty: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EmptyGroupModal: React.FC<EmptyGroupModalProps> = ({
  isOpen,
  groupName,
  groupType,
  onKeepEmpty,
  onDelete,
  onClose
}) => {
  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (groupType) {
      case 'period': return 'Period';
      case 'cycle': return 'Cycle';
      case 'week': return 'Week';
      default: return 'Group';
    }
  };

  const getTypeColor = () => {
    switch (groupType) {
      case 'period': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cycle': return 'text-green-600 bg-green-50 border-green-200';
      case 'week': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleKeepEmpty = () => {
    onKeepEmpty();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Empty {getTypeLabel()} Detected
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              The {getTypeLabel().toLowerCase()} <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getTypeColor()}`}>
                {groupName}
              </span> is now empty.
            </p>
            <p className="text-sm text-gray-500">
              What would you like to do with this empty {getTypeLabel().toLowerCase()}?
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleKeepEmpty}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Keep Empty</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete {getTypeLabel()}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};