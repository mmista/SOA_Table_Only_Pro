import React from 'react';
import { SOAData, EditableItemType } from '../../types/soa';
import { DraggableCell } from '../DraggableCell';

interface TimelineHeaderSectionProps {
  data: SOAData;
  dragState: {
    isDragging: boolean;
    draggedItem: any;
    draggedType: EditableItemType;
    hoveredDropZone: string | null;
  };
  hoveredItems: {
    period: string | null;
    cycle: string | null;
    week: string | null;
    day: string | null;
  };
  onDragStart: (item: any, type: EditableItemType) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => void;
  onItemHover: (type: EditableItemType, id: string | null) => void;
  onItemClick: (item: any, type: EditableItemType) => void;
  onAddItem: (type: EditableItemType, id: string, side: 'left' | 'right') => void;
  setHoveredDropZone: (zoneId: string | null) => void;
  validateDrop: (dragType: EditableItemType, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => boolean;
  hasComment: (cellId: string, cellType: string) => boolean;
  onCommentClick: (cellId: string, cellType: 'period' | 'cycle' | 'week' | 'day', position: { x: number; y: number }) => void;
}

export const TimelineHeaderSection: React.FC<TimelineHeaderSectionProps> = ({
  data,
  dragState,
  hoveredItems,
  onDragStart,
  onDragEnd,
  onDrop,
  onItemHover,
  onItemClick,
  onAddItem,
  setHoveredDropZone,
  validateDrop,
  hasComment,
  onCommentClick
}) => {
  const renderDraggableCell = (
    title: string,
    colSpan: number,
    type: EditableItemType,
    item: any,
    bgColor: string,
    subtitle?: string
  ) => {
    const isHovered = hoveredItems[type] === item.id;
    const isDragging = dragState.isDragging && dragState.draggedItem?.id === item.id;
    const isValidDropTarget = dragState.isDragging && 
      dragState.draggedItem?.id !== item.id &&
      (validateDrop(dragState.draggedType, type, 'before') ||
       validateDrop(dragState.draggedType, type, 'after') ||
       validateDrop(dragState.draggedType, type, 'inside'));
    
    return (
      <DraggableCell
        key={item.id}
        title={title}
        subtitle={subtitle}
        colSpan={colSpan}
        type={type}
        item={item}
        bgColor={bgColor}
        isDragging={isDragging}
        isHovered={isHovered}
        isValidDropTarget={isValidDropTarget}
        hoveredDropZone={dragState.hoveredDropZone}
        hasComment={hasComment(item.id, type)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        onMouseEnter={() => onItemHover(type, item.id)}
        onMouseLeave={() => onItemHover(type, null)}
        onClick={() => onItemClick(item, type)}
        onAddItem={onAddItem}
        setHoveredDropZone={setHoveredDropZone}
        onCommentClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onCommentClick(item.id, type, {
            x: rect.left + rect.width / 2,
            y: rect.bottom + 5
          });
        }}
      />
    );
  };

  // Calculate colspan for periods
  const getPeriodColspan = (period: any): number => {
    return period.cycles.reduce((total: number, cycle: any) => {
      return total + cycle.weeks.reduce((weekTotal: number, week: any) => {
        return weekTotal + week.days.length;
      }, 0);
    }, 0);
  };

  // Calculate colspan for cycles
  const getCycleColspan = (cycle: any): number => {
    return cycle.weeks.reduce((total: number, week: any) => {
      return total + week.days.length;
    }, 0);
  };

  return (
    <thead>
      {/* Period Row */}
      <tr>
        <th className="sticky left-0 border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold w-48 z-[15]">
          <span className="font-normal text-xs text-gray-500 uppercase tracking-wider">PERIOD</span>
        </th>
        {data.periods.map(period => 
          renderDraggableCell(
            period.name,
            getPeriodColspan(period),
            'period',
            period,
            'bg-blue-100',
            `${period.duration || getPeriodColspan(period)} days`
          )
        )}
      </tr>

      {/* Cycle Row */}
      <tr>
        <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
          CYCLE
        </td>
        {data.periods.map(period =>
          period.cycles.map(cycle => 
            renderDraggableCell(
              cycle.name,
              getCycleColspan(cycle),
              'cycle',
              cycle,
              'bg-green-100',
              `${cycle.duration || getCycleColspan(cycle)} days`
            )
          )
        )}
      </tr>

      {/* Week Row */}
      <tr>
        <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
          WEEK
        </td>
        {data.periods.map(period =>
          period.cycles.map(cycle =>
            cycle.weeks.map(week =>
              renderDraggableCell(
                week.name,
                week.days.length,
                'week',
                week,
                'bg-orange-100',
                `${week.duration || 7} days`
              )
            )
          )
        )}
      </tr>

      {/* Day Row */}
      <tr>
        <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
          DAY
        </td>
        {data.periods.map(period =>
          period.cycles.map(cycle =>
            cycle.weeks.map(week =>
              week.days.map(day =>
                renderDraggableCell(
                  day.name,
                  1,
                  'day',
                  day,
                  'bg-purple-100',
                  undefined
                )
              )
            )
          )
        )}
      </tr>
    </thead>
  );
};