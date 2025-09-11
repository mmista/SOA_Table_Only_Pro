import React from 'react';
import { MessageSquare, CheckCircle, Undo2, Settings, Database, Trash2 } from 'lucide-react';
import { StatsBadge } from '../atoms/StatsBadge';
import { DragIndicator } from '../atoms/DragIndicator';
import { SuccessIndicator } from '../atoms/SuccessIndicator';

interface TableHeaderProps {
  title?: string;
  totalDays: number;
  commentStats: { total: number };
  selectedCellsCount: number;
  selectedTimeWindowCellsCount: number;
  dragState: {
    isDragging: boolean;
    draggedType: string;
    draggedItem?: { name: string };
  };
  showMoveSuccess: boolean;
  canUndo: boolean;
  historyLength: number;
  isFocusModeActive: boolean;
  focusedTimelineItem: { id: string; type: string } | null;
  onUndo: () => void;
  onOpenHeaderSettings: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
  onExitFocus: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title = "Schedule of Activities (SOA) Editor",
  totalDays,
  commentStats,
  selectedCellsCount,
  selectedTimeWindowCellsCount,
  dragState,
  showMoveSuccess,
  canUndo,
  historyLength,
  isFocusModeActive,
  focusedTimelineItem,
  onUndo,
  onOpenHeaderSettings,
  onLoadSampleData,
  onClearData,
  onExitFocus
}) => {
  const getFocusedItemName = () => {
    if (!focusedTimelineItem) return '';
    const typeLabel = focusedTimelineItem.type.charAt(0).toUpperCase() + focusedTimelineItem.type.slice(1);
    return `${typeLabel} Focus Active`;
  };

  return (
    <div className="p-4 bg-gray-800 text-white flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <span>{title}</span>
          
          {isFocusModeActive && (
            <StatsBadge
              icon={<Search className="w-3 h-3" />}
              count={1}
              label={getFocusedItemName()}
              colorClass="bg-yellow-100 text-yellow-700"
            />
          )}
          
          <StatsBadge
            icon={<MessageSquare className="w-3 h-3" />}
            count={commentStats.total}
            label="comment"
            colorClass="bg-blue-100 text-blue-700"
          />
          
          <StatsBadge
            icon={<CheckCircle className="w-3 h-3" />}
            count={selectedCellsCount}
            label="activity cell"
            colorClass="bg-green-100 text-green-700"
          />
          
          <StatsBadge
            icon={<CheckCircle className="w-3 h-3" />}
            count={selectedTimeWindowCellsCount}
            label="time window cell"
            colorClass="bg-purple-100 text-purple-700"
          />
        </h1>
        
        <p className="text-gray-300 text-sm mt-1">
          Clinical Trial Timeline - {totalDays} total study days
          
          <DragIndicator
            isDragging={dragState.isDragging}
            draggedType={dragState.draggedType}
            draggedItemName={dragState.draggedItem?.name || ''}
          />
          
          <SuccessIndicator
            show={showMoveSuccess}
            message="Move completed successfully"
          />
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {isFocusModeActive && (
          <button
            onClick={onExitFocus}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
            title="Exit Focus Mode"
          >
            <Search className="w-4 h-4" />
            <span>Exit Focus</span>
          </button>
        )}
        
        <button
          onClick={onLoadSampleData}
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-white"
          title="Load Sample Data"
        >
          <Database className="w-4 h-4" />
          <span>Sample Data</span>
        </button>
        
        <button
          onClick={onClearData}
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-white"
          title="Clear All Data"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Data</span>
        </button>
        
        <button
          onClick={onOpenHeaderSettings}
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-white"
          title="Timeline Header Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Headers</span>
        </button>
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${canUndo 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Undo2 className="w-4 h-4" />
          <span>Undo</span>
          {historyLength > 0 && (
            <span className="bg-blue-500 text-xs px-1 rounded">
              {historyLength}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};