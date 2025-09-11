import React from 'react';
import { SOAData, EditableItemType } from '../../types/soa';
import { DraggableCell } from '../DraggableCell';
import { EditableHeaderLabel } from '../molecules/EditableHeaderLabel';
import { TimelineHeaderContextMenu } from '../TimelineHeaderContextMenu';

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
  headerManagement,
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
  const [contextMenuState, setContextMenuState] = React.useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    header: any;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    header: null
  });

  // Helper function to get header by type from centralized state
  const getHeaderByType = (type: string) => {
    return headerManagement.headers?.find(header => header.type === type);
  };

  // Check if a header type should be visible
  const isHeaderVisible = (type: string) => {
    const header = getHeaderByType(type);
    return header ? (header.isActive && header.isVisible) : false;
  };

  const handleHeaderRightClick = (e: React.MouseEvent, item: any, type: EditableItemType) => {
    e.preventDefault();
    const headerConfig = headerManagement.headers?.find(h => h.type === type);
    if (headerConfig) {
      setContextMenuState({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        header: { ...headerConfig, item }
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenuState(prev => ({ ...prev, isOpen: false }));
  };

  const renderDraggableCell = (
    title: string,
    colSpan: number,
    type: EditableItemType,
    item: any,
    bgColor: string,
    subtitle?: string
  ) => {
    const headerConfig = headerManagement.headers?.find(h => h.type === type);
    const isVisible = headerConfig?.isVisible ?? true;
    const isHovered = hoveredItems[type] === item.id;
    const isDragging = dragState.isDragging && dragState.draggedItem?.id === item.id;
    const isValidDropTarget = dragState.isDragging && 
      dragState.draggedItem?.id !== item.id &&
      (validateDrop(dragState.draggedType, type, 'before') ||
       validateDrop(dragState.draggedType, type, 'after') ||
       validateDrop(dragState.draggedType, type, 'inside'));
    const isFocused = headerManagement.focusedHeaderId === item.id;
    const adjustedColSpan = isVisible ? colSpan : 1;
    
    return (
      <DraggableCell
        key={item.id}
        title={title}
        subtitle={subtitle}
        colSpan={adjustedColSpan}
        type={type}
        item={item}
        bgColor={bgColor}
        isVisible={isVisible}
        isFocused={isFocused}
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
        onRightClick={(e) => handleHeaderRightClick(e, item, type)}
        onShowHeader={headerManagement.showHeader}
        onUnfocusAllHeaders={headerManagement.unfocusAllHeaders}
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
  const getPeriodColspan = (period: any, considerVisibility: boolean = true): number => {
    return period.cycles.reduce((total: number, cycle: any) => {
      return total + cycle.weeks.reduce((weekTotal: number, week: any) => {
        return weekTotal + week.days.reduce((dayTotal: number, day: any) => {
          if (!considerVisibility) return dayTotal + 1;
          const dayHeader = headerManagement.headers?.find(h => h.type === 'day');
          return dayTotal + (dayHeader?.isVisible ? 1 : 1); // Always count as 1 for layout
        }, 0);
      }, 0);
    }, 0);
  };

  // Calculate colspan for cycles
  const getCycleColspan = (cycle: any, considerVisibility: boolean = true): number => {
    return cycle.weeks.reduce((total: number, week: any) => {
      return total + week.days.reduce((dayTotal: number, day: any) => {
        if (!considerVisibility) return dayTotal + 1;
        const dayHeader = headerManagement.headers?.find(h => h.type === 'day');
        return dayTotal + (dayHeader?.isVisible ? 1 : 1); // Always count as 1 for layout
      }, 0);
    }, 0);
  };

  // Calculate colspan for weeks
  const getWeekColspan = (week: any, considerVisibility: boolean = true): number => {
    return week.days.reduce((total: number, day: any) => {
      if (!considerVisibility) return total + 1;
      const dayHeader = headerManagement.headers?.find(h => h.type === 'day');
      return total + (dayHeader?.isVisible ? 1 : 1); // Always count as 1 for layout
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
    <>
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
              getPeriodColspan(period, true),
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
                getCycleColspan(cycle, true),
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
                  getWeekColspan(week, true),
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
    
    {/* Context Menu */}
    <TimelineHeaderContextMenu
      isOpen={contextMenuState.isOpen}
      position={contextMenuState.position}
      header={contextMenuState.header}
      isFocused={headerManagement.focusedHeaderId === contextMenuState.header?.item?.id}
      onHide={headerManagement.hideHeader}
      onShow={headerManagement.showHeader}
      onFocus={headerManagement.focusHeader}
      onUnfocus={headerManagement.unfocusAllHeaders}
      onClose={handleCloseContextMenu}
    />
    </>
  );
};