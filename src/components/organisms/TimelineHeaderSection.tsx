import React from 'react';
import { SOAData, EditableItemType } from '../../types/soa';
import { DraggableCell } from '../DraggableCell';
import { EditableHeaderLabel } from '../molecules/EditableHeaderLabel';

interface TimelineHeaderSectionProps {
  data: SOAData;
  headerManagement: ReturnType<typeof import('../../hooks/useTimelineHeaderManagement').useTimelineHeaderManagement>;
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
  focusedTimelineItem: { id: string; type: EditableItemType } | null;
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
  onRightClick: (e: React.MouseEvent, item: any, type: EditableItemType) => void;
  onExitFocus: () => void;
}

export const TimelineHeaderSection: React.FC<TimelineHeaderSectionProps> = ({
  data,
  headerManagement,
  dragState,
  hoveredItems,
  focusedTimelineItem,
  onDragStart,
  onDragEnd,
  onDrop,
  onItemHover,
  onItemClick,
  onAddItem,
  setHoveredDropZone,
  validateDrop,
  hasComment,
  onCommentClick,
  onRightClick,
  onExitFocus
}) => {

  // Helper function to get header by type from centralized state
  const getHeaderByType = (type: string) => {
    return headerManagement.headers?.find(header => header.type === type);
  };

  // Check if a header type should be visible
  const isHeaderVisible = (type: string) => {
    const header = getHeaderByType(type);
    return header ? (header.isActive && header.isVisible) : false;
  };

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
    const isFocused = focusedTimelineItem?.id === item.id && focusedTimelineItem?.type === type;
    
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
        isFocused={isFocused}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        onMouseEnter={() => onItemHover(type, item.id)}
        onMouseLeave={() => onItemHover(type, null)}
        onClick={() => onItemClick(item, type)}
        onAddItem={onAddItem}
        setHoveredDropZone={setHoveredDropZone}
        onRightClick={onRightClick}
        onExitFocus={onExitFocus}
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

  // Calculate total columns for the hidden container
  const getTotalColumns = () => {
    return data.periods.reduce((total, period) => {
      return total + period.cycles.reduce((cycleTotal, cycle) => {
        return cycleTotal + cycle.weeks.reduce((weekTotal, week) => {
          return weekTotal + week.days.length;
        }, 0);
      }, 0);
    }, 0);
  };

  return (
    <thead>
      {/* Period Row */}
      {isHeaderVisible('period') && (
        <tr>
          {(() => {
            const header = getHeaderByType('period');
            return (
              <EditableHeaderLabel
                id={header?.id || 'period'}
                label={header?.label || 'PERIOD'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
                onToggleVisibility={headerManagement.hideHeader}
              />
            );
          })()}
          {data.periods.map(period => 
            renderDraggableCell(
              period.name,
              getPeriodColspan(period),
              'period',
              period,
              'bg-blue-100',
              period.duration || undefined
            )
          )}
        </tr>
      )}

      {/* Cycle Row */}
      {isHeaderVisible('cycle') && (
        <tr>
          {(() => {
            const header = getHeaderByType('cycle');
            return (
              <EditableHeaderLabel
                id={header?.id || 'cycle'}
                label={header?.label || 'CYCLE'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
                onToggleVisibility={headerManagement.hideHeader}
              />
            );
          })()}
          {data.periods.map(period =>
            period.cycles.map(cycle => 
              renderDraggableCell(
                cycle.name,
                getCycleColspan(cycle),
                'cycle',
                cycle,
                'bg-green-100',
                cycle.duration || undefined
              )
            )
          )}
        </tr>
      )}

      {/* Week Row */}
      {isHeaderVisible('week') && (
        <tr>
          {(() => {
            const header = getHeaderByType('week');
            return (
              <EditableHeaderLabel
                id={header?.id || 'week'}
                label={header?.label || 'WEEK'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
                onToggleVisibility={headerManagement.hideHeader}
              />
            );
          })()}
          {data.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                renderDraggableCell(
                  week.name,
                  week.days.length,
                  'week',
                  week,
                  'bg-orange-100',
                  week.duration || undefined
                )
              )
            )
          )}
        </tr>
      )}

      {/* Day Row */}
      {isHeaderVisible('day') && (
        <tr>
          {(() => {
            const header = getHeaderByType('day');
            return (
              <EditableHeaderLabel
                id={header?.id || 'day'}
                label={header?.label || 'DAY'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
                onToggleVisibility={headerManagement.hideHeader}
              />
            );
          })()}
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
      )}
    </thead>
  );
};