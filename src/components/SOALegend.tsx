import React from 'react';
import { User, Phone, Package, Monitor } from 'lucide-react';

export const SOALegend: React.FC = () => {
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* Visit Types */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Visit Types</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
              <span>In-person visit</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              <span>Phone call</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
              <span>Drug shipment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              <span>Remote assessment</span>
            </div>
          </div>
        </div>

        {/* Cell Indicators */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Cell Indicators</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Active activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
              <span>Selected cell</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-200 border-2 border-purple-400 rounded"></div>
              <span>Selected time window cell</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xs">
                a
              </div>
              <span>Footnote reference</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Instructions</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Click to activate/deactivate cells</div>
            <div>• Shift+click to select cell ranges</div>
            <div>• Right-click for context menu</div>
            <div>• Double-click merged cells to edit text</div>
            <div>• Time window cells can be merged like activity cells</div>
            <div>• Drag timeline elements to reorganize</div>
          </div>
        </div>
      </div>
    </div>
  );
};