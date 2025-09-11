import React from 'react';
import { SOAData, TimeRelativeCell, TimeWindowCell as TimeWindowCellInterface, TimeOfDayCell, EditableItemType, Period, Cycle, Week, Day } from '../../types/soa';
import { TimelineHeaderConfig, useTimelineHeaderManagement } from '../../hooks/useTimelineHeaderManagement';
import { StaticTableCell } from '../molecules/StaticTableCell';
import { VisitLabelCell } from '../molecules/VisitLabelCell';
import { EditableHeaderLabel } from '../molecules/EditableHeaderLabel';
import { HiddenHeadersContainer } from '../molecules/HiddenHeadersContainer';
import { TimeWindowCell } from '../molecules/TimeWindowCell';

interface StaticRowsSectionProps {
  data: SOAData;
  headerManagement: ReturnType<typeof useTimelineHeaderManagement>;
  timeRelativeCells: TimeRelativeCell[];
  timeWindowCells: TimeWindowCellInterface[];
  timeOfDayCells: TimeOfDayCell[];
  totalColumns: number;
  selectedTimeWindowCells: Set<string>;
  isVisitLinked: (dayId: string) => boolean;
  getLinkedVisits: (dayId: string) => string[];
  getVisitLinkInfo: (dayId: string) => { name?: string } | null;
  shouldHighlightVisit: (dayId: string) => boolean;
  handleVisitHover: (dayId: string | null) => void;
  onStaticCellClick: (dayId: string, content: string, type: EditableItemType) => void;
  onTimeWindowCellClick: (dayId: string, event: React.MouseEvent) => void;
  onTimeWindowCellRightClick: (e: React.MouseEvent, dayId: string) => void;
  onTimeWindowCellCustomTextChange: (dayId: string, newText: string) => void;
  onOpenVisitLinkPanel: (dayId: string) => void;
}

export const StaticRowsSection: React.FC<StaticRowsSectionProps> = ({
  data,
  headerManagement,
  timeRelativeCells,
  timeWindowCells,
  timeOfDayCells,
  totalColumns,
  selectedTimeWindowCells,
  isVisitLinked,
  getLinkedVisits,
  getVisitLinkInfo,
  shouldHighlightVisit,
  handleVisitHover,
  onStaticCellClick,
  onTimeWindowCellClick,
  onTimeWindowCellRightClick,
  onTimeWindowCellCustomTextChange,
  onOpenVisitLinkPanel
}) => {

  // Filter data based on focus mode (same logic as TimelineHeaderSection)
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

  // Helper function to get cell value by dayId
  const getCellValue = (cells: any[], dayId: string, defaultValue: string) => {
    const cell = cells.find(c => c.dayId === dayId);
    return cell ? cell.value : defaultValue;
  };

  // Calculate visit number for a given day
  const calculateVisitNumber = (targetDayId: string, useCurrentData: boolean = true): number => {
    const dataToUse = useCurrentData ? currentData : data;
    let visitNumber = 1;
    
    for (const period of dataToUse.periods) {
      for (const cycle of period.cycles) {
        for (const week of cycle.weeks) {
          for (const day of week.days) {
            if (day.id === targetDayId) {
              return visitNumber;
            }
            visitNumber++;
          }
        }
      }
    }
    
    return visitNumber;
  };

  // Get linked visit numbers for tooltip
  const getLinkedVisitNumbers = (dayId: string): number[] => {
    const linkedDayIds = getLinkedVisits(dayId);
    // Use original data for visit numbers to maintain consistency
    return linkedDayIds.map(linkedDayId => calculateVisitNumber(linkedDayId, false));
  };

  // Check if a header type should be visible
  const getHeaderByType = (type: string) => {
    return headerManagement.headers?.find(header => header.type === type);
  };

  const isHeaderVisible = (type: string) => {
    const header = getHeaderByType(type);
    return header ? (header.isActive && header.isVisible) : false;
  };

  return (
    <>
      {/* Time Relative Row */}
      {isHeaderVisible('time-relative') && (
        <tr>
          {(() => {
            const header = getHeaderByType('time-relative');
            return (
          <EditableHeaderLabel
                id={header?.id || 'time-relative'}
                label={header?.label || 'TIME RELATIVE (H)'}
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
                week.days.map((day) => {
                  const value = getCellValue(timeRelativeCells, day.id, 24);
                  return (
                    <StaticTableCell
                      key={`time-relative-${day.id}`}
                      content={value.toString()}
                      dayId={day.id}
                      type="time-relative-cell"
                      onClick={onStaticCellClick}
                    />
                  );
                })
              )
            )
          )}
        </tr>
      )}

      {/* Allowed Window Row */}
      {isHeaderVisible('allowed-window') && (
        <tr>
          {(() => {
            const header = getHeaderByType('allowed-window');
            return (
              <EditableHeaderLabel
                id={header?.id || 'allowed-window'}
                label={header?.label || 'TIME WINDOW (H)'}
                isEditing={headerManagement.editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
                onStartEdit={headerManagement.startEditingHeader}
                onSaveLabel={headerManagement.saveHeaderLabel}
                onCancelEdit={headerManagement.cancelEditingHeader}
                onToggleVisibility={headerManagement.hideHeader}
              />
            );
          })()}
          {currentData.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                week.days.map((day) => {
                  const cellData = timeWindowCells.find(cell => cell.dayId === day.id);
                  const value = cellData?.value || 24;
                  const isSelected = selectedTimeWindowCells.has(day.id);
                  const isMerged = cellData && ((cellData.colspan && cellData.colspan > 1) || (cellData.rowspan && cellData.rowspan > 1));
                  const isMergedPlaceholder = cellData?.isMergedPlaceholder;
                  
                  // Don't render anything if this is a merged placeholder
                  if (isMergedPlaceholder) {
                    return null;
                  }
                  
                  return (
                    <TimeWindowCell
                      key={`window-${day.id}`}
                      dayId={day.id}
                      value={value}
                      customText={cellData?.customText}
                      isSelected={isSelected}
                      isMerged={isMerged}
                      colspan={cellData?.colspan}
                      rowspan={cellData?.rowspan}
                      onClick={(e) => onTimeWindowCellClick(day.id, e)}
                      onRightClick={(e) => onTimeWindowCellRightClick(e, day.id)}
                      onCustomTextChange={(newText) => onTimeWindowCellCustomTextChange(day.id, newText)}
                    />
                  );
                })
              )
            )
          )}
        </tr>
      )}

      {/* Time of Day Row */}
      {isHeaderVisible('time-of-day') && (
        <tr>
          {(() => {
            const header = getHeaderByType('time-of-day');
            return (
          <EditableHeaderLabel
                id={header?.id || 'time-of-day'}
                label={header?.label || 'TIME OF DAY'}
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
                week.days.map((day) => {
                  const value = getCellValue(timeOfDayCells, day.id, 'Morning');
                  return (
                    <StaticTableCell
                      key={`time-${day.id}`}
                      content={value}
                      dayId={day.id}
                      type="time-of-day-cell"
                      onClick={onStaticCellClick}
                    />
                  );
                })
              )
            )
          )}
        </tr>
      )}


      {/* Visit Label Row */}
      {isHeaderVisible('visit') && (
        <tr>
          {(() => {
            const header = getHeaderByType('visit');
            return (
          <EditableHeaderLabel
                id={header?.id || 'visit'}
                label={header?.label || 'VISIT LABEL'}
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
                week.days.map((day) => {
                  const visitNumber = calculateVisitNumber(day.id, false); // Use original data for consistent numbering
                  const isLinked = isVisitLinked(day.id);
                  const linkInfo = getVisitLinkInfo(day.id);
                  const isHighlighted = shouldHighlightVisit(day.id);
                  const linkedVisitNumbers = getLinkedVisitNumbers(day.id);
                  
                  return (
                    <VisitLabelCell
                      key={`visit-${day.id}`}
                      visitNumber={visitNumber}
                      dayId={day.id}
                      isLinked={isLinked}
                      isHighlighted={isHighlighted}
                      linkInfo={linkInfo}
                      linkedVisitNumbers={linkedVisitNumbers}
                      onMouseEnter={() => handleVisitHover(day.id)}
                      onMouseLeave={() => handleVisitHover(null)}
                      onOpenVisitLinkPanel={onOpenVisitLinkPanel}
                    />
                  );
                })
              )
            )
          )}
        </tr>
      )}
      
      {/* Hidden Headers Container - positioned at the end of all headers */}
      {headerManagement.hasHiddenHeaders && (
        <HiddenHeadersContainer
          hiddenHeaders={headerManagement.hiddenHeaders}
          isExpanded={headerManagement.isHiddenContainerExpanded}
          onToggleExpanded={headerManagement.toggleHiddenContainer}
          onRestoreHeader={headerManagement.showHeader}
          onRestoreAll={headerManagement.restoreAllHeaders}
          totalColumns={totalColumns}
        />
      )}
    </>
  );
};