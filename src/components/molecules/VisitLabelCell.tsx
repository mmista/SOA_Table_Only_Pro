import React from 'react';
import { VisitLinkIndicator } from '../atoms/VisitLinkIndicator';

interface VisitLabelCellProps {
  visitNumber: number;
  dayId: string;
  isLinked: boolean;
  isHighlighted: boolean;
  linkInfo?: { name?: string };
  linkedVisitNumbers: number[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpenVisitLinkPanel: (dayId: string) => void;
}

export const VisitLabelCell: React.FC<VisitLabelCellProps> = ({
  visitNumber,
  dayId,
  isLinked,
  isHighlighted,
  linkInfo,
  linkedVisitNumbers,
  onMouseEnter,
  onMouseLeave,
  onOpenVisitLinkPanel
}) => {
  const getTooltipText = () => {
    if (!isLinked) return undefined;
    return `Linked with: ${linkedVisitNumbers.map(num => `V${num}`).join(', ')}`;
  };

  return (
    <td 
      className={`
        border border-gray-300 px-3 py-2 text-center text-xs font-medium
        transition-all duration-200 relative
        ${isHighlighted ? 'bg-blue-100 border-blue-300' : ''}
        ${isLinked ? 'cursor-pointer hover:bg-blue-50' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={getTooltipText()}
      onClick={() => onOpenVisitLinkPanel(dayId)}
    >
      <div className="flex items-center justify-center space-x-1">
        <span>V{visitNumber}</span>
        <VisitLinkIndicator
          isLinked={isLinked}
          isHighlighted={isHighlighted}
          linkInfo={linkInfo}
        />
      </div>
    </td>
  );
};