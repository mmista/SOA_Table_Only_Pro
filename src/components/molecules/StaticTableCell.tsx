import React from 'react';

interface StaticTableCellProps {
  content: string;
  dayId: string;
  className?: string;
}

export const StaticTableCell: React.FC<StaticTableCellProps> = ({
  content,
  dayId,
  className = "border border-gray-300 px-3 py-2 text-center text-xs"
}) => {
  return (
    <td key={`${content.toLowerCase()}-${dayId}`} className={className}>
      {content}
    </td>
  );
};