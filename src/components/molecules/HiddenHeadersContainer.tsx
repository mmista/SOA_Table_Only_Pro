import React from 'react';
import { ChevronDown, ChevronRight, Eye, RotateCcw } from 'lucide-react';
import { TimelineHeaderConfig } from '../../hooks/useTimelineHeaderManagement';

interface HiddenHeadersContainerProps {
  hiddenHeaders: TimelineHeaderConfig[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRestoreHeader: (headerId: string) => void;
  onRestoreAll: () => void;
  totalColumns: number;
}

export const HiddenHeadersContainer: React.FC<HiddenHeadersContainerProps> = ({
  hiddenHeaders,
  isExpanded,
  onToggleExpanded,
  onRestoreHeader,
  onRestoreAll,
  totalColumns
}) => {
  if (hiddenHeaders.length === 0) {
    return null;
  }

  return (
    <tr className="bg-gray-100 border-t-2 border-gray-300">
      <td 
        className="sticky left-0 bg-gray-100 px-4 py-2 z-[15] border-r border-gray-300"
        colSpan={1}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleExpanded}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-medium">
              {hiddenHeaders.length} Hidden Row{hiddenHeaders.length !== 1 ? 's' : ''}
            </span>
          </button>
          
          {hiddenHeaders.length > 1 && (
            <button
              onClick={onRestoreAll}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              title="Restore all hidden rows"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore All</span>
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {hiddenHeaders.map((header) => (
              <div
                key={header.id}
                className="flex items-center justify-between bg-white rounded px-3 py-2 border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {header.label}
                  </span>
                </div>
                
                <button
                  onClick={() => onRestoreHeader(header.id)}
                  className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                  title="Restore this row"
                >
                  <Eye className="w-3 h-3" />
                  <span>Show</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </td>
      
      <td 
        className="bg-gray-100 border-l border-gray-300" 
        colSpan={totalColumns}
      >
        {/* Empty space when collapsed */}
      </td>
    </tr>
  );
};