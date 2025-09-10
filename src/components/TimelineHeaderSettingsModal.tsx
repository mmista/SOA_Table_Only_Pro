import React, { useState } from 'react';
import { X, Settings, Eye, EyeOff, Power, PowerOff, Edit2, Check, X as XIcon } from 'lucide-react';
import { TimelineHeaderConfig } from '../hooks/useTimelineHeaderManagement';

interface TimelineHeaderSettingsModalProps {
  isOpen: boolean;
  headers: TimelineHeaderConfig[];
  activeHeaders: TimelineHeaderConfig[];
  inactiveHeaders: TimelineHeaderConfig[];
  editingHeaderId: string | null;
  onClose: () => void;
  onStartEdit: (headerId: string) => void;
  onSaveLabel: (headerId: string, newLabel: string) => void;
  onCancelEdit: () => void;
  onToggleVisibility: (headerId: string) => void;
  onDisableHeader: (headerId: string) => void;
  onEnableHeader: (headerId: string) => void;
}

export const TimelineHeaderSettingsModal: React.FC<TimelineHeaderSettingsModalProps> = ({
  isOpen,
  headers,
  activeHeaders,
  inactiveHeaders,
  editingHeaderId,
  onClose,
  onStartEdit,
  onSaveLabel,
  onCancelEdit,
  onToggleVisibility,
  onDisableHeader,
  onEnableHeader
}) => {
  const [editValue, setEditValue] = useState('');

  React.useEffect(() => {
    if (editingHeaderId) {
      const header = headers.find(h => h.id === editingHeaderId);
      setEditValue(header?.label || '');
    }
  }, [editingHeaderId, headers]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (editingHeaderId) {
      onSaveLabel(editingHeaderId, editValue);
    }
  };

  const handleCancel = () => {
    onCancelEdit();
    setEditValue('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'period': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cycle': return 'text-green-600 bg-green-50 border-green-200';
      case 'week': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'day': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'time-relative': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'time-of-day': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'allowed-window': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'visit': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderHeaderItem = (header: TimelineHeaderConfig, isActive: boolean) => (
    <div
      key={header.id}
      className={`
        flex items-center justify-between p-4 border rounded-lg transition-all duration-200
        ${isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-75'}
      `}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(header.type)}`}>
          {header.type.toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          {editingHeaderId === header.id ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter header name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartEdit(header.id)}
              className="flex items-center space-x-2 text-left hover:text-blue-600 transition-colors group"
              disabled={!isActive}
            >
              <span className="font-medium text-sm truncate">
                {header.label}
              </span>
              {isActive && (
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        {/* Visibility toggle - only for active headers */}
        {isActive && (
          <button
            onClick={() => onToggleVisibility(header.id)}
            className={`
              p-2 rounded-md transition-colors
              ${header.isVisible 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={header.isVisible ? 'Hide from table' : 'Show in table'}
          >
            {header.isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Active/Inactive toggle */}
        <button
          onClick={() => isActive ? onDisableHeader(header.id) : onEnableHeader(header.id)}
          className={`
            p-2 rounded-md transition-colors
            ${isActive 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-green-600 hover:bg-green-50'
            }
          `}
          title={isActive ? 'Disable header (remove from table)' : 'Enable header (add to table)'}
        >
          {isActive ? (
            <PowerOff className="w-4 h-4" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Timeline Header Settings
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage visibility and activation of timeline header rows
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Active Headers Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Headers
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {activeHeaders.length} active
                </span>
              </div>
              
              <div className="space-y-3">
                {activeHeaders.length > 0 ? (
                  activeHeaders.map(header => renderHeaderItem(header, true))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PowerOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active headers</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Inactive Headers Section */}
            {inactiveHeaders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Disabled Headers
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {inactiveHeaders.length} disabled
                  </span>
                </div>
                
                <div className="space-y-3">
                  {inactiveHeaders.map(header => renderHeaderItem(header, false))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Visible in table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span>Hidden from table</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <PowerOff className="w-4 h-4 text-red-600" />
                    <span>Disable header</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};