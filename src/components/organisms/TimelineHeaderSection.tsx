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
  validateDrop,
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

  // Filter data based on focus mode
  const getFilteredData = React.useCallback((originalData: SOAData): SOAData => {
    if (!headerManagement.isFocusMode || !headerManagement.focusedHeaderId || !headerManagement.focusedHeaderType) {
      return originalData;
    }

    const focusedId = headerManagement.focusedHeaderId;
    const focusedType = headerManagement.focusedHeaderType;

    // Create a deep copy of the data
    const filteredData: SOAData = {
      ...originalData,
      periods: []
    };

    // Filter based on focused header type and ID
    for (const period of originalData.periods) {
      if (focusedType === 'period' && period.id === focusedId) {
        filteredData.periods.push(period);
        break;
      }
      
      const filteredPeriod: Period = { ...period, cycles: [] };
      let shouldIncludePeriod = false;

      for (const cycle of period.cycles) {
        if (focusedType === 'cycle' && cycle.id === focusedId) {
          filteredPeriod.cycles.push(cycle);
          shouldIncludePeriod = true;
          break;
        }
        
        const filteredCycle: Cycle = { ...cycle, weeks: [] };
        let shouldIncludeCycle = false;

        for (const week of cycle.weeks) {
          if (focusedType === 'week' && week.id === focusedId) {
            filteredCycle.weeks.push(week);
            shouldIncludeCycle = true;
            break;
          }
          
          const filteredWeek: Week = { ...week, days: [] };
          let shouldIncludeWeek = false;

          for (const day of week.days) {
            if (focusedType === 'day' && day.id === focusedId) {
              filteredWeek.days.push(day);
              shouldIncludeWeek = true;
              break;
            }
          }

          if (shouldIncludeWeek) {
            filteredCycle.weeks.push(filteredWeek);
            shouldIncludeCycle = true;
          }
        }

        if (shouldIncludeCycle) {
          filteredPeriod.cycles.push(filteredCycle);
          shouldIncludePeriod = true;
        }
      }

      if (shouldIncludePeriod) {
        filteredData.periods.push(filteredPeriod);
      }
    }

    return filteredData;
  }, [headerManagement.isFocusMode, headerManagement.focusedHeaderId, headerManagement.focusedHeaderType]);

  // Get current data (filtered or original)
  const currentData = React.useMemo(() => getFilteredData(data), [data, getFilteredData]);

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
      const period = currentData.periods.find(p => p.id === headerId);
      headerName = period?.name || '';
    } else if (headerType === 'cycle') {
      for (const period of currentData.periods) {
        const cycle = period.cycles.find(c => c.id === headerId);
        if (cycle) {
          headerName = cycle.name;
          break;
        }
      }
    } else if (headerType === 'week') {
      for (const period of currentData.periods) {
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
  }, [currentData]);

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
    const isMinimized = headerManagement.isHeaderMinimized(item.id);
    const isFocused = headerManagement.isHeaderFocused(item.id);
    const isValidDropTarget = dragState.isDragging && 
      dragState.draggedItem?.id !== item.id &&
      (validateDrop(dragState.draggedType, type, 'before') ||
       validateDrop(dragState.draggedType, type, 'after') ||
       validateDrop(dragState.draggedType, type, 'inside'));
    
    // Calculate dynamic colSpan based on minimized state
    const dynamicColSpan = isMinimized ? 1 : colSpan;
    
    return (
      <DraggableCell
        key={item.id}
        title={title}
        subtitle={subtitle}
        colSpan={dynamicColSpan}
        type={type}
        item={item}
        bgColor={bgColor}
        isDragging={isDragging}
        isHovered={isHovered}
        isMinimized={isMinimized}
        isFocused={isFocused}
        isValidDropTarget={isValidDropTarget}
        hoveredDropZone={dragState.hoveredDropZone}
        hasComment={hasComment(item.id, type)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        onUnminimize={headerManagement.unminimizeHeader}
        onUnfocus={headerManagement.unfocusHeader}
        onMouseEnter={() => onItemHover(type, item.id)}
        onMouseLeave={() => onItemHover(type, null)}
        onClick={() => onItemClick(item, type)}
        onAddItem={onAddItem}
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
    if (headerManagement.isHeaderMinimized(`period-${period.id}`) || headerManagement.isHeaderMinimized(period.id)) {
      return 1;
    }
    return period.cycles.reduce((total: number, cycle: any) => {
      const cycleColspan = headerManagement.isHeaderMinimized(cycle.id) ? 1 : 
        cycle.weeks.reduce((weekTotal: number, week: any) => {
          const weekColspan = headerManagement.isHeaderMinimized(week.id) ? 1 : week.days.length;
          return weekTotal + weekColspan;
        }, 0);
      return total + cycleColspan;
    }, 0);
  };

  // Calculate colspan for cycles
  const getCycleColspan = (cycle: Cycle): number => {
    if (headerManagement.isHeaderMinimized(cycle.id)) {
      return 1;
    }
    return cycle.weeks.reduce((total: number, week: any) => {
      const weekColspan = headerManagement.isHeaderMinimized(week.id) ? 1 : week.days.length;
      return total + weekColspan;
    }, 0);
  };

  // Calculate colspan for weeks
  const getWeekColspan = (week: Week): number => {
    if (headerManagement.isHeaderMinimized(week.id)) {
      return 1;
    }
    return week.days.length;
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
                  onToggleVisibility={headerManagement.hideHeaderRow}
                />
              );
            })()}
            {currentData.periods.map(period => 
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
                  onToggleVisibility={headerManagement.hideHeaderRow}
                />
              );
            })()}
            {currentData.periods.map(period =>
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
                  onToggleVisibility={headerManagement.hideHeaderRow}
                />
              );
            })()}
            {currentData.periods.map(period =>
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
                  onToggleVisibility={headerManagement.hideHeaderRow}
                />
              );
            })()}
            {currentData.periods.map(period =>
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
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        headerId={contextMenu.headerId}
        headerType={contextMenu.headerType}
        headerName={contextMenu.headerName}
        isHeaderMinimized={contextMenu.headerId ? headerManagement.isHeaderMinimized(contextMenu.headerId) : false}
        isHeaderFocused={contextMenu.headerId ? headerManagement.isHeaderFocused(contextMenu.headerId) : false}
        isFocusMode={headerManagement.isFocusMode}
        onMinimize={headerManagement.minimizeHeader}
        onUnminimize={headerManagement.unminimizeHeader}
        onFocus={headerManagement.focusHeader}
        onUnfocus={headerManagement.unfocusHeader}
        onClose={handleCloseContextMenu}
      />
    </>
  );
};