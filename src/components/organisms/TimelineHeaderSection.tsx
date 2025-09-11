import React from 'react';
import { SOAData, EditableItemType, Period, Cycle, Week, Day } from '../../types/soa';
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
  hasComment,
  onCommentClick
}) => {
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    headerId: string | null;
    headerType: EditableItemType | null;
    headerName: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    headerId: null,
    headerType: null,
    headerName: ''
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

  // Handle context menu
  const handleContextMenu = React.useCallback((e: React.MouseEvent, headerId: string, headerType: EditableItemType) => {
    e.preventDefault();
    
    // Only show context menu for timeline headers (period, cycle, week)
    if (!['period', 'cycle', 'week'].includes(headerType)) {
      return;
    }

    // Find the header name
    let headerName = '';
    if (headerType === 'period') {
      const period = data.periods.find(p => p.id === headerId);
      headerName = period?.name || '';
    } else if (headerType === 'cycle') {
      for (const period of data.periods) {
        const cycle = period.cycles.find(c => c.id === headerId);
        if (cycle) {
          headerName = cycle.name;
          break;
        }
      }
    } else if (headerType === 'week') {
      for (const period of data.periods) {
        for (const cycle of period.cycles) {
          const week = cycle.weeks.find(w => w.id === headerId);
          if (week) {
            headerName = week.name;
            break;
          }
        }
      }
    }

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      headerId,
      headerType,
      headerName
    });
  }, [data]);

  const handleCloseContextMenu = React.useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

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
    const isFocused = headerManagement.isHeaderFocused(item.id);
    const isValidDropTarget = dragState.isDragging && 
      dragState.draggedItem?.id !== item.id;
    
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
        isFocused={isFocused}
        isValidDropTarget={isValidDropTarget}
        hoveredDropZone={dragState.hoveredDropZone}
        hasComment={hasComment(item.id, type)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        onUnfocus={headerManagement.unfocusHeader}
        onMouseEnter={() => onItemHover(type, item.id)}
        onMouseLeave={() => onItemHover(type, null)}
        onClick={() => onItemClick(item, type)}
        setHoveredDropZone={setHoveredDropZone}
        onContextMenu={handleContextMenu}
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
  const getPeriodColspan = (period: Period): number => {
    return period.cycles.reduce((total: number, cycle: any) => {
      const cycleColspan = cycle.weeks.reduce((weekTotal: number, week: any) => {
        return weekTotal + week.days.length;
      }, 0);
      return total + cycleColspan;
    }, 0);
  };

  // Calculate colspan for cycles
  const getCycleColspan = (cycle: Cycle): number => {
    return cycle.weeks.reduce((total: number, week: any) => {
      return total + week.days.length;
    }, 0);
  };

  // Calculate colspan for weeks
  const getWeekColspan = (week: Week): number => {
    return week.days.length;
  };

  return (
    <>
      <thead>
        {/* Period Row */}
        <tr>
          {(() => {
            const header = getHeaderByType('period');
            return (
              <EditableHeaderLabel
                id={header?.id || 'period'}
                label={header?.label || 'PERIOD'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
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

        {/* Cycle Row */}
        <tr>
          {(() => {
            const header = getHeaderByType('cycle');
            return (
              <EditableHeaderLabel
                id={header?.id || 'cycle'}
                label={header?.label || 'CYCLE'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
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

        {/* Week Row */}
        <tr>
          {(() => {
            const header = getHeaderByType('week');
            return (
              <EditableHeaderLabel
                id={header?.id || 'week'}
                label={header?.label || 'WEEK'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
              />
            );
          })()}
          {data.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                renderDraggableCell(
                  week.name,
                  getWeekColspan(week),
                  'week',
                  week,
                  'bg-orange-100',
                  week.duration || undefined
                )
              )
            )
          )}
        </tr>

        {/* Day Row */}
        <tr>
          {(() => {
            const header = getHeaderByType('day');
            return (
              <EditableHeaderLabel
                id={header?.id || 'day'}
                label={header?.label || 'DAY'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
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
      </thead>

      {/* Context Menu */}
      <TimelineHeaderContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        headerId={contextMenu.headerId}
        headerType={contextMenu.headerType}
        headerName={contextMenu.headerName}
        isHeaderFocused={contextMenu.headerId ? headerManagement.isHeaderFocused(contextMenu.headerId) : false}
        isFocusMode={headerManagement.isFocusMode}
        onFocus={headerManagement.focusHeader}
        onUnfocus={headerManagement.unfocusHeader}
        onClose={handleCloseContextMenu}
      />
    </>
  );
};