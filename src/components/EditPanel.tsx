import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { EditContext } from '../types/soa';

interface EditPanelProps {
  context: EditContext;
  onSave: (item: any) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  context,
  onSave,
  onDelete,
  onCancel
}) => {
  const [name, setName] = useState(context.item.name);
  const [itemValue, setItemValue] = useState(context.item.duration || '');
  const [cellValue, setCellValue] = useState('');

  useEffect(() => {
    if (context.type === 'time-relative-cell' || context.type === 'time-window-cell' || context.type === 'time-of-day-cell') {
      setCellValue((context.item as any).value?.toString() || '');
    } else {
      setName((context.item as any).name || '');
      setItemValue((context.item as any).duration || '');
    }
  }, [context.item]);

  const handleSave = () => {
    if (context.type === 'time-relative-cell' || context.type === 'time-window-cell') {
      onSave({
        ...context.item,
        value: Number(cellValue) || 0
      });
    } else if (context.type === 'time-of-day-cell') {
      onSave({
        ...context.item,
        value: cellValue
      });
    } else if (context.type === 'day') {
      onSave({
        ...context.item,
        name,
        duration: itemValue ? Number(itemValue) : undefined
      });
    } else {
      onSave({
        ...context.item,
        name,
        duration: itemValue || undefined
      });
    }
  };

  const getTypeLabel = () => {
    switch (context.type) {
      case 'period': return 'Period';
      case 'cycle': return 'Cycle';
      case 'week': return 'Week';
      case 'day': return 'Day';
      case 'time-relative-cell': return 'Time Relative';
      case 'time-window-cell': return 'Time Window';
      case 'time-of-day-cell': return 'Time of Day';
      default: return 'Item';
    }
  };

  const getTypeColor = () => {
    switch (context.type) {
      case 'period': return 'text-blue-600 bg-blue-50';
      case 'cycle': return 'text-green-600 bg-green-50';
      case 'week': return 'text-orange-600 bg-orange-50';
      case 'day': return 'text-purple-600 bg-purple-50';
      case 'time-relative-cell': return 'text-indigo-600 bg-indigo-50';
      case 'time-window-cell': return 'text-pink-600 bg-pink-50';
      case 'time-of-day-cell': return 'text-teal-600 bg-teal-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDurationUnit = () => {
    switch (context.type) {
      case 'period': return 'days';
      case 'cycle': return 'days';
      case 'week': return 'days';
      case 'day': return 'hours';
      default: return 'units';
    }
  };

  const renderInput = () => {
    if (context.type === 'time-relative-cell') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours
          </label>
          <input
            type="number"
            value={cellValue}
            onChange={(e) => setCellValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter hours"
            min="0"
          />
        </div>
      );
    } else if (context.type === 'time-window-cell') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Window (Hours)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">±</span>
            <input
              type="number"
              value={cellValue}
              onChange={(e) => setCellValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter hours"
              min="0"
            />
            <span className="text-gray-500">h</span>
          </div>
        </div>
      );
    } else if (context.type === 'time-of-day-cell') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time of Day
          </label>
          <select
            value={cellValue}
            onChange={(e) => setCellValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
      );
    } else {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTypeLabel()} Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${getTypeLabel().toLowerCase()} name`}
            />
          </div>

          {(context.type === 'period' || context.type === 'cycle' || context.type === 'week') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter additional notes or description"
                rows={3}
              />
            </div>
          ) : context.type === 'day' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration ({getDurationUnit()})
              </label>
              <input
                type="number"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Duration in ${getDurationUnit()}`}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Specify the duration for this {getTypeLabel().toLowerCase()}
              </p>
            </div>
          ) : null}
        </>
      );
    }
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 z-50 w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
              {getTypeLabel()}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Edit {getTypeLabel()}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {renderInput()}

        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Properties</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>ID: <span className="font-mono">{context.item.id}</span></div>
            <div>Type: <span className="capitalize">{context.type}</span></div>
            {(context.item as any).duration && (context.type === 'period' || context.type === 'cycle' || context.type === 'week') && (
              <div>Current Notes: {(context.item as any).duration}</div>
            )}
            {(context.item as any).duration && context.type === 'day' && (
              <div>Current Duration: {(context.item as any).duration} {getDurationUnit()}</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          {(context.type === 'period' || context.type === 'cycle' || context.type === 'week' || context.type === 'day') && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};