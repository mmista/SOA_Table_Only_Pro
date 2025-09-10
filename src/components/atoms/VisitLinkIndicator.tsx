import React from 'react';
import { Link } from 'lucide-react';

interface VisitLinkIndicatorProps {
  isLinked: boolean;
  isHighlighted: boolean;
  linkInfo?: { name?: string };
}

export const VisitLinkIndicator: React.FC<VisitLinkIndicatorProps> = ({
  isLinked,
  isHighlighted,
  linkInfo
}) => {
  if (!isLinked) return null;

  return (
    <>
      <Link className="w-3 h-3 text-blue-500" strokeWidth={2} />
      {isHighlighted && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          {linkInfo?.name || 'Linked visits'}
        </div>
      )}
    </>
  );
};