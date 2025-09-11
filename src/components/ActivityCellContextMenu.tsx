import React, { useEffect, useRef } from 'react';
import { Merge, Split, CheckSquare, Square, User, Phone, Package, Monitor, X, Type } from 'lucide-react';
import { VisitType } from '../types/soa';

interface ActivityCellContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedCells: Set<string>;
  selectedTimeWindowCells: Set<string>;
  clickedCell: { activityId: string; dayId: string } | null;
  clickedTimeWindowCell: string | null;
  isMergedCell: boolean;
  isMergedTimeWindowCell: boolean;
  onMerge: () => void;
  onUnmerge: () => void;
  onMergeTimeWindow: () => void;
  onUnmergeTimeWindow: () => void;
  onActivateSelected: (visitType?: VisitType) => void;
  onClearSelected: () => void;
  onSetVisitTypeForSingleCell: () => void;
  onAddTextToSingleCell: () => void;
  onClose: () => void;
}

const visitTypes: { type: VisitType; icon: React.ComponentType<any>; label: string; color: string }[] = [
  { type: 'in-person', icon: User, label: 'In-person visit', color: 'text-blue-500' },
  { type: 'phone-call', icon: Phone, label: 'Phone call', color: 'text-green-500' },
  { type: 'drug-shipment', icon: Package, label: 'Drug shipment', color: 'text-purple-500' },
  { type: 'remote-assessment', icon: Monitor, label: 'Remote assessment', color: 'text-orange-500' }
];

export const ActivityCellContextMenu: React.FC<ActivityCellContextMenuProps> = ({
  isOpen,
  position,
  selectedCells,
  selectedTimeWindowCells,
  clickedCell,
  clickedTimeWindowCell,
  isMergedCell,
  isMergedTimeWindowCell,
  onMerge,
  onUnmerge,
  onMergeTimeWindow,
  onUnmergeTimeWindow,
  onActivateSelected,
  onClearSelected,
  onSetVisitTypeForSingleCell,
  onAddTextToSingleCell,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasSelection = selectedCells.size > 0;
  const hasMultipleSelection = selectedCells.size > 1;
  const hasTimeWindowSelection = selectedTimeWindowCells.size > 0;
  const hasMultipleTimeWindowSelection = selectedTimeWindowCells.size > 1;
  const isSingleCellContext = selectedCells.size === 0 || (selectedCells.size === 1 && clickedCell);
  const isTimeWindowContext = clickedTimeWindowCell !== null;

  // Calculate menu position to keep it within viewport
  const getMenuStyle = () => {
    const menuWidth = 250;
    const menuHeight = 300; // Approximate height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position
    if (left + menuWidth > viewportWidth - 20) {
      left = viewportWidth - menuWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    // Adjust vertical position
    if (top + menuHeight > viewportHeight - 20) {
      top = position.y - menuHeight - 10;
    }
    if (top < 20) {
      top = 20;
    }
    
    return { left, top };
  };

  const menuStyle = getMenuStyle();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[250px] max-w-[300px]"
        style={{ 
          left: menuStyle.left, 
          top: menuStyle.top
        }}
      >
        {/* Header */}
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
          {hasSelection ? `${selectedCells.size} activity cell${selectedCells.size !== 1 ? 's' : ''} selected` : 
           hasTimeWindowSelection ? `${selectedTimeWindowCells.size} time window cell${selectedTimeWindowCells.size !== 1 ? 's' : ''} selected` :
           isTimeWindowContext ? 'Time Window Cell Options' :
           'Cell Options'}
        </div>
        
        {/* Activity Cell Merge/Unmerge Options */}
        {hasMultipleSelection && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onMerge();
              onClose();
            }}
          >
            <Merge className="w-4 h-4 text-blue-500" />
            <span>Merge selected activity cells</span>
          </button>
        )}
        
        {isMergedCell && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onUnmerge();
              onClose();
            }}
          >
            <Split className="w-4 h-4 text-orange-500" />
            <span>Unmerge activity cells</span>
          </button>
        )}
        
        {/* Time Window Cell Merge/Unmerge Options */}
        {hasMultipleTimeWindowSelection && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onMergeTimeWindow();
              onClose();
            }}
          >
            <Merge className="w-4 h-4 text-purple-500" />
            <span>Merge selected time window cells</span>
          </button>
        )}
        
        {isMergedTimeWindowCell && (
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              onUnmergeTimeWindow();
              onClose();
            }}
          >
            <Split className="w-4 h-4 text-orange-500" />
            <span>Unmerge time window cells</span>
          </button>
        )}
        
        {/* Bulk Operations */}
        {hasSelection && (
          <>
            <div className="border-t border-gray-100 my-1" />
            
            {/* Activate with visit type submenu */}
            <div className="px-3 py-1 text-xs font-medium text-gray-500">
              Activate Selected
            </div>
            
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onActivateSelected();
                onClose();
              }}
            >
              <CheckSquare className="w-4 h-4 text-green-500" />
              <span>Activate without visit type</span>
            </button>
            
            {visitTypes.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onActivateSelected(type);
                  onClose();
                }}
              >
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
                <span>Activate with {label.toLowerCase()}</span>
              </button>
            ))}
            
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                onClearSelected();
                onClose();
              }}
            >
              <Square className="w-4 h-4" />
              <span>Clear selected cells</span>
            </button>
          </>
        )}
        
        {/* Single Cell Options */}
        {isSingleCellContext && (
          <>
            <div className="border-t border-gray-100 my-1" />
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onAddTextToSingleCell();
                onClose();
              }}
            >
              <Type className="w-4 h-4 text-indigo-500" />
              <span>Add Text</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onSetVisitTypeForSingleCell();
                onClose();
              }}
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Set visit type</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};