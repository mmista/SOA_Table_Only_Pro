import React, { useState, useEffect } from 'react';
import { X, Link, Save, Trash2, Unlink } from 'lucide-react';
import { Day, VisitLink } from '../types/soa';

interface VisitLinkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentDayId: string;
  allDays: Day[];
  existingVisitLinks: VisitLink[];
  onSaveLinks: (currentDayId: string, selectedLinkedDayIds: string[], linkGroupName?: string) => void;
  onUnlinkAll: (dayId: string) => void;
}

export const VisitLinkPanel: React.FC<VisitLinkPanelProps> = ({
  isOpen,
  onClose,
  currentDayId,
  allDays,
  existingVisitLinks,
  onSaveLinks,
  onUnlinkAll,
}) => {
  const [selectedLinkedDayIds, setSelectedLinkedDayIds] = useState<Set<string>>(new Set());
  const [linkGroupName, setLinkGroupName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Find the existing link group for the currentDayId
      const currentLinkGroup = existingVisitLinks.find(link =>
        link.visitIds.includes(currentDayId)
      );

      if (currentLinkGroup) {
        setSelectedLinkedDayIds(new Set(currentLinkGroup.visitIds));
        setLinkGroupName(currentLinkGroup.name || '');
      } else {
        // If not part of an existing group, start with only the current day selected
        setSelectedLinkedDayIds(new Set([currentDayId]));
        setLinkGroupName('');
      }
    }
  }, [isOpen, currentDayId, existingVisitLinks]);

  if (!isOpen) return null;

  const handleCheckboxChange = (dayId: string, isChecked: boolean) => {
    setSelectedLinkedDayIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(dayId);
      } else {
        newSet.delete(dayId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSaveLinks(currentDayId, Array.from(selectedLinkedDayIds), linkGroupName.trim() || undefined);
    onClose();
  };

  const handleUnlink = () => {
    if (window.confirm(`Are you sure you want to unlink V${allDays.findIndex(d => d.id === currentDayId) + 1} from all its linked groups?`)) {
      onUnlinkAll(currentDayId);
      onClose();
    }
  };

  const getVisitNumber = (dayId: string): number => {
    return allDays.findIndex(d => d.id === dayId) + 1;
  };

  const currentDayName = allDays.find(day => day.id === currentDayId)?.name || `V${getVisitNumber(currentDayId)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Manage Visit Links</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Currently managing links for: <span className="font-medium text-blue-700">{currentDayName} (V{getVisitNumber(currentDayId)})</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="linkGroupName" className="block text-sm font-medium text-gray-700 mb-2">
              Link Group Name (optional)
            </label>
            <input
              type="text"
              id="linkGroupName"
              value={linkGroupName}
              onChange={(e) => setLinkGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Baseline Assessments"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Visits to Link:</h3>
            <div className="space-y-2">
              {allDays.map(day => {
                const isCurrentlyLinked = existingVisitLinks.some(link =>
                  link.visitIds.includes(currentDayId) && link.visitIds.includes(day.id)
                );
                const isSelected = selectedLinkedDayIds.has(day.id);

                return (
                  <label key={day.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleCheckboxChange(day.id, e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="text-sm text-gray-800">
                      {day.name} (V{getVisitNumber(day.id)})
                    </span>
                    {isCurrentlyLinked && (
                      <Link className="w-4 h-4 text-blue-500 ml-auto" title="Already linked in this group" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={selectedLinkedDayIds.size < 1}
          >
            <Save className="w-4 h-4" />
            <span>Save Links</span>
          </button>
          <button
            onClick={handleUnlink}
            className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <Unlink className="w-4 h-4" />
            <span>Unlink All</span>
          </button>
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