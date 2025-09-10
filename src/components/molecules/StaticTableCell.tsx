import React from 'react';
import { EditableItemType } from '../../types/soa';

interface StaticTableCellProps {
  content: string;
  dayId: string;
  type: EditableItemType;
  onClick: (dayId: string, content: string, type: EditableItemType) => void;
  className?: string;
}

export const StaticTableCell: React.FC<StaticTableCellProps> = ({
  content,
  dayId,
  type,
  onClick,
  className = "border border-gray-300 px-3 py-2 text-center text-xs"
}) => {
  return (
    <td 
      key={`${type}-${dayId}`} 
      className={`${className} cursor-pointer hover:bg-gray-50 transition-colors`}
      onClick={() => onClick(dayId, content, type)}
    >
      {content}
    </td>
  );
};