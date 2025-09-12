import React from 'react';
import { SOAData, EditableItemType, Period, Cycle, Week, Day } from '../types/soa';
import { DraggableCell } from './DraggableCell';

interface TimelineHeadersProps {
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

export const TimelineHeaders: React.FC<TimelineHeadersProps> = ({
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
  // Calculate total days for proper column spanning
  const getTotalDays = () => {
    return data.periods.reduce((total, period) => {
      return total + period.cycles.reduce((cycleTotal, cycle) => {
        return cycleTotal + cycle.weeks.reduce((weekTotal, week) => {
          return weekTotal + week.days.length;
        }, 0);
      }, 0);
    }, 0);
  };

  // Get all days in order for proper mapping
  const getAllDays = (): Day[] => {
    const allDays: Day[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDays.push(...week.days);
        });
      });
    });
    return allDays;
  };

  // Calculate colspan for periods
  const getPeriodColspan = (period: Period): number => {
    return period.cycles.reduce((total, cycle) => {
      return total + cycle.weeks.reduce((weekTotal, week) => {
        return weekTotal + week.days.length;
      }, 0);
    }, 0);
  };

  // Calculate colspan for cycles
  const getCycleColspan = (cycle: Cycle): number => {
    return cycle.weeks.reduce((total, week) => {
      return total + week.days.length;
    }, 0);
  };

  // Calculate colspan for weeks
  const getWeekColspan = (week: Week): number => {
    return week.days.length;
  };

  const totalDays = getTotalDays();

  return (
    <thead>
      {/* Period Row */}
      <tr>
        <th className="sticky left-0 z-[15] bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 min-w-[200px]">
          ACTIVITY DESCRIPTION
        </th>
        {data.periods.map((period) => (
          <DraggableCell
            key={period.id}
            title={period.name}
            subtitle={period.duration ? `${period.duration} days` : undefined}
            colSpan={getPeriodColspan(period)}
            type="period"
            item={period}
            bgColor="bg-blue-100 text-blue-800"
            isDragging={dragState.isDragging && dragState.draggedItem?.id === period.id}
            isHovered={hoveredItems.period === period.id}
            isValidDropTarget={dragState.isDragging && validateDrop(dragState.draggedType, 'period', 'before')}
            hoveredDropZone={dragState.hoveredDropZone}
            hasComment={hasComment(period.id, 'period')}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            onMouseEnter={() => onItemHover('period', period.id)}
            onMouseLeave={() => onItemHover('period', null)}
            onClick={() => onItemClick(period, 'period')}
            onAddItem={onAddItem}
            setHoveredDropZone={setHoveredDropZone}
            onCommentClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onCommentClick(period.id, 'period', {
                x: rect.left + rect.width / 2,
                y: rect.bottom + 5
              });
            }}
          />
        ))}
      </tr>

      {/* Cycle Row */}
      <tr>
        <th className="sticky left-0 z-[15] bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
          CYCLE
        </th>
        {data.periods.map((period) =>
          period.cycles.map((cycle) => (
            <DraggableCell
              key={cycle.id}
              title={cycle.name}
              subtitle={cycle.duration ? `${cycle.duration} days` : undefined}
              colSpan={getCycleColspan(cycle)}
              type="cycle"
              item={cycle}
              bgColor="bg-green-100 text-green-800"
              isDragging={dragState.isDragging && dragState.draggedItem?.id === cycle.id}
              isHovered={hoveredItems.cycle === cycle.id}
              isValidDropTarget={dragState.isDragging && validateDrop(dragState.draggedType, 'cycle', 'before')}
              hoveredDropZone={dragState.hoveredDropZone}
              hasComment={hasComment(cycle.id, 'cycle')}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onMouseEnter={() => onItemHover('cycle', cycle.id)}
              onMouseLeave={() => onItemHover('cycle', null)}
              onClick={() => onItemClick(cycle, 'cycle')}
              onAddItem={onAddItem}
              setHoveredDropZone={setHoveredDropZone}
              onCommentClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onCommentClick(cycle.id, 'cycle', {
                  x: rect.left + rect.width / 2,
                  y: rect.bottom + 5
                });
              }}
            />
          ))
        )}
      </tr>

      {/* Week Row */}
      <tr>
        <th className="sticky left-0 z-[15] bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
          WEEK
        </th>
        {data.periods.map((period) =>
          period.cycles.map((cycle) =>
            cycle.weeks.map((week) => (
              <DraggableCell
                key={week.id}
                title={week.name}
                subtitle={week.duration ? `${week.duration} days` : undefined}
                colSpan={getWeekColspan(week)}
                type="week"
                item={week}
                bgColor="bg-orange-100 text-orange-800"
                isDragging={dragState.isDragging && dragState.draggedItem?.id === week.id}
                isHovered={hoveredItems.week === week.id}
                isValidDropTarget={dragState.isDragging && validateDrop(dragState.draggedType, 'week', 'before')}
                hoveredDropZone={dragState.hoveredDropZone}
                hasComment={hasComment(week.id, 'week')}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
                onMouseEnter={() => onItemHover('week', week.id)}
                onMouseLeave={() => onItemHover('week', null)}
                onClick={() => onItemClick(week, 'week')}
                onAddItem={onAddItem}
                setHoveredDropZone={setHoveredDropZone}
                onCommentClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onCommentClick(week.id, 'week', {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 5
                  });
                }}
              />
            ))
          )
        )}
      </tr>

      {/* Day Row */}
      <tr>
        <th className="sticky left-0 z-[15] bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
          DAY
        </th>
        {data.periods.map((period) =>
          period.cycles.map((cycle) =>
            cycle.weeks.map((week) =>
              week.days.map((day) => (
                <DraggableCell
                  key={day.id}
                  title={day.name}
                  subtitle={day.duration ? `${day.duration}h` : undefined}
                  colSpan={1}
                  type="day"
                  item={day}
                  bgColor="bg-purple-100 text-purple-800"
                  isDragging={dragState.isDragging && dragState.draggedItem?.id === day.id}
                  isHovered={hoveredItems.day === day.id}
                  isValidDropTarget={dragState.isDragging && validateDrop(dragState.draggedType, 'day', 'before')}
                  hoveredDropZone={dragState.hoveredDropZone}
                  hasComment={hasComment(day.id, 'day')}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  onMouseEnter={() => onItemHover('day', day.id)}
                  onMouseLeave={() => onItemHover('day', null)}
                  onClick={() => onItemClick(day, 'day')}
                  onAddItem={onAddItem}
                  setHoveredDropZone={setHoveredDropZone}
                  onCommentClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onCommentClick(day.id, 'day', {
                      x: rect.left + rect.width / 2,
                      y: rect.bottom + 5
                    });
                  }}
                />
              ))
            )
          )
        )}
      </tr>

      {/* Visit Labels Row */}
      <tr>
        <th className="sticky left-0 z-[15] bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
          VISIT LABEL
        </th>
        {getAllDays().map((day, index) => (
          <th
            key={`visit-${day.id}`}
            className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-600 bg-gray-50 min-w-[60px]"
          >
            V{index + 1}
          </th>
        ))}
      </tr>
    </thead>
  );
};