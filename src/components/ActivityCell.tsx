import React from 'react';
import { User, Phone, Package, Monitor } from 'lucide-react';
import { VisitType } from '../types/soa';
import { CommentIcon } from './CommentIcon';

interface ActivityCellProps {
  isActive: boolean;
  visitType?: VisitType;
  footnote?: string;
  customText?: string;
  isHighlighted?: boolean;
  isLinked?: boolean;
  isRowHovered?: boolean;
  hasComment?: boolean;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const visitTypeConfig = {
  'in-person': { icon: User, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'phone-call': { icon: Phone, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'drug-shipment': { icon: Package, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'remote-assessment': { icon: Monitor, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
};

export const ActivityCell: React.FC<ActivityCellProps> = ({
  isActive,
  visitType,
  footnote,
  customText,
  isHighlighted = false,
  isLinked = false,
  isRowHovered = false,
  hasComment = false,
  onClick,
  onRightClick,
  onCommentClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const IconComponent = visitType ? visitTypeConfig[visitType].icon : null;
  const iconColor = visitType ? visitTypeConfig[visitType].color : '';
  const bgColor = visitType ? visitTypeConfig[visitType].bgColor : '';
  const borderColor = visitType ? visitTypeConfig[visitType].borderColor : '';
  const iconLabel = visitType ? visitTypeConfig[visitType].label : '';

  const getCellStyle = () => {
    // Base background color - row hover takes precedence over default
    // This prevents flickering by maintaining consistent background during hover
    const baseBackground = isRowHovered ? 'bg-gray-50' : 'bg-white';
    
    if (isHighlighted) {
      if (isActive && visitType) {
        return `${bgColor} ${borderColor} border-2 ring-2 ring-blue-400 ring-opacity-50`;
      } else if (isActive) {
        return 'bg-blue-100 border-blue-300 border-2 ring-2 ring-blue-400 ring-opacity-50';
      } else {
        return `${isRowHovered ? 'bg-gray-100' : 'bg-blue-50'} border-blue-200 border-2 ring-2 ring-blue-400 ring-opacity-50`;
      }
    }
    
    if (isActive && visitType) {
      return `${bgColor} ${borderColor} border-2`;
    } else if (isActive) {
      return `${isRowHovered ? 'bg-gray-100' : 'bg-blue-50'} border-blue-200 border-2`;
    } else {
      // For inactive cells, use row hover state and disable individual cell hover when row is hovered
      const hoverClasses = isRowHovered ? '' : 'hover:bg-gray-50 hover:border-gray-300';
      return `${baseBackground} border-gray-200 border ${hoverClasses} ${isLinked ? 'ring-1 ring-blue-200 ring-opacity-30' : ''}`;
    }
  };

  return (
    <td 
      className={`
        relative px-2 py-3 text-center cursor-pointer select-none
        transition-all duration-200 group min-w-[60px] h-[60px]
        ${getCellStyle()}
      `}
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={`${iconLabel || 'Click to activate, right-click for visit type'}${isLinked ? ' • Linked visit' : ''}${hasComment ? ' • Has comment' : ''}`}
    >
      {/* Comment icon in top-left corner */}
      {onCommentClick && (
        <div className="absolute top-1 left-1 z-[5]">
          <CommentIcon
            hasComment={hasComment}
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick(e);
            }}
            size="sm"
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Visit type icon */}
        {IconComponent && (
          <div className="flex items-center justify-center">
            <IconComponent 
              className={`w-5 h-5 ${iconColor}`}
              strokeWidth={1.5}
            />
          </div>
        )}
        
        {/* Custom text below icon */}
        {customText && (
          <div className="mt-1 text-xs text-gray-600 font-medium leading-tight">
            {customText}
          </div>
        )}
      </div>
      
      {/* Footnote in top-right corner */}
      {footnote && (
        <div className="absolute top-1 right-1 text-xs font-semibold text-gray-700 leading-none z-[5]">
          {footnote}
        </div>
      )}
      
      {/* Hover overlay */}
      <div className={`
        absolute inset-0 rounded transition-all duration-200 pointer-events-none
        ${isHighlighted ? 'ring-2 ring-blue-400 ring-opacity-75' : 
          isActive ? 'ring-1 ring-blue-300 ring-opacity-50' : 
          'group-hover:ring-1 group-hover:ring-gray-300 group-hover:ring-opacity-50'}
      `} />
    </td>
  );
};