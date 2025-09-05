import React from 'react';
import { User, Phone, Package, Monitor, X } from 'lucide-react';
import { VisitType } from '../types/soa';

interface VisitTypeSelectorProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentVisitType?: VisitType;
  onSelect: (visitType: VisitType | undefined) => void;
  onClose: () => void;
}

const visitTypes: { type: VisitType; icon: React.ComponentType<any>; label: string; color: string }[] = [
  { type: 'in-person', icon: User, label: 'In-person visit', color: 'text-blue-500 hover:bg-blue-50' },
  { type: 'phone-call', icon: Phone, label: 'Phone call', color: 'text-green-500 hover:bg-green-50' },
  { type: 'drug-shipment', icon: Package, label: 'Drug shipment', color: 'text-purple-500 hover:bg-purple-50' },
  { type: 'remote-assessment', icon: Monitor, label: 'Remote assessment', color: 'text-orange-500 hover:bg-orange-50' }
];

export const VisitTypeSelector: React.FC<VisitTypeSelectorProps> = ({
  isOpen,
  position,
  currentVisitType,
  onSelect,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Selector menu */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[180px]"
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
          Select Visit Type
        </div>
        
        {visitTypes.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            className={`
              w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors
              ${color} ${currentVisitType === type ? 'bg-gray-100' : ''}
            `}
            onClick={() => onSelect(type)}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            <span>{label}</span>
            {currentVisitType === type && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
        
        {/* Clear option */}
        {currentVisitType && (
          <>
            <div className="border-t border-gray-100 my-1" />
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              onClick={() => onSelect(undefined)}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
              <span>Clear visit type</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};