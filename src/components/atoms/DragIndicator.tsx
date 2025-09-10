import React from 'react';

interface DragIndicatorProps {
  isDragging: boolean;
  draggedType: string;
  draggedItemName: string;
}

export const DragIndicator: React.FC<DragIndicatorProps> = ({
  isDragging,
  draggedType,
  draggedItemName
}) => {
  if (!isDragging) return null;

  return (
    <span className="ml-2 text-yellow-300">
      • Dragging {draggedType}: "{draggedItemName}"
    </span>
  );
};