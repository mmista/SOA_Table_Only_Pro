import React from 'react';
import { SOAData, TimeRelativeCell, TimeWindowCell as TimeWindowCellInterface, TimeOfDayCell, EditableItemType } from '../../types/soa';
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

  // Helper function to get cell value by dayId
  const getCellValue = (cells: any[], dayId: string, defaultValue: string) => {
    const cell = cells.find(c => c.dayId === dayId);
    return cell ? cell.value : defaultValue;
  };

  // Calculate visit number for a given day
  const calculateVisitNumber = (targetDayId: string): number => {
    let visitNumber = 1;
    
    for (const period of data.periods) {
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
    return linkedDayIds.map(linkedDayId => calculateVisitNumber(linkedDayId));
  };

  // Check if a header type should be visible
  const getHeaderByType = (type: string) => {
    return headerManagement.headers?.find(header => header.type === type);
  };

  const isHeaderVisible = (type: string) => {
    const header = getHeaderByType(type);
    return header ? (header.isActive && header.isVisible) : false;
  };

  // Check if a day should be rendered based on focus mode
  const shouldRenderDay = (dayId: string) => {
    const dayHeader = getHeaderByType('day');
    if (!dayHeader) return true;
    
    // If in focus mode, only render if this day is visible
    if (headerManagement.focusedHeaderType === 'day') {
      return dayHeader.isVisible;
    }
    
    // Check parent visibility for focus modes
    if (headerManagement.focusedHeaderType) {
      // Find the parent of this day and check if it should be visible
      for (const period of data.periods) {
        for (const cycle of period.cycles) {
          for (const week of cycle.weeks) {
            const day = week.days.find(d => d.id === dayId);
            if (day) {
              if (headerManagement.focusedHeaderType === 'period') {
                const periodHeader = headerManagement.headers?.find(h => h.type === 'period');
                return periodHeader?.isVisible || false;
              } else if (headerManagement.focusedHeaderType === 'cycle') {
                const cycleHeader = headerManagement.headers?.find(h => h.type === 'cycle');
                return cycleHeader?.isVisible || false;
              } else if (headerManagement.focusedHeaderType === 'week') {
                const weekHeader = headerManagement.headers?.find(h => h.type === 'week');
                return weekHeader?.isVisible || false;
              }
            }
          }
        }
      }
    }
    
    return true;
  };

  // Render day cell or thin strip
  const renderDayCell = (day: any, content: React.ReactNode, key: string) => {
    const shouldRender = shouldRenderDay(day.id);
    const dayHeader = getHeaderByType('day');
    
    if (!shouldRender || !dayHeader?.isVisible) {
      return (
        <td
          key={key}
          className="min-w-[24px] max-w-[24px] w-[24px] bg-gray-200 border border-gray-300 text-center cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={() => {
            if (headerManagement.focusedHeaderType) {
              headerManagement.unfocusAllHeaders();
            } else {
              headerManagement.showHeader('day');
            }
          }}
          title={`Show ${day.name}`}
        >
          <div className="flex flex-col items-center justify-center h-full py-1">
            <Eye className="w-2 h-2 text-gray-600 mb-1" />
            <span className="text-xs font-bold text-gray-600 transform -rotate-90 origin-center">
              {day.name.charAt(0)}
            </span>
          </div>
        </td>
      );
    }
    
    return content;
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
                  return renderDayCell(day, (
                    <StaticTableCell
                      key={`time-relative-${day.id}`}
                      content={value.toString()}
                      dayId={day.id}
                      type="time-relative-cell"
                      onClick={onStaticCellClick}
                    />
                  ), `time-relative-${day.id}`);
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
          {data.periods.map(period =>
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
                  
                  return renderDayCell(day, (
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
                  ), `window-${day.id}`);
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
                  return renderDayCell(day, (
                    <StaticTableCell
                      key={`time-${day.id}`}
                      content={value}
                      dayId={day.id}
                      type="time-of-day-cell"
                      onClick={onStaticCellClick}
                    />
                  ), `time-${day.id}`);
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
                  const visitNumber = calculateVisitNumber(day.id);
                  const isLinked = isVisitLinked(day.id);
                  const linkInfo = getVisitLinkInfo(day.id);
                  const isHighlighted = shouldHighlightVisit(day.id);
                  const linkedVisitNumbers = getLinkedVisitNumbers(day.id);
                  
                  return renderDayCell(day, (
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
                  ), `visit-${day.id}`);
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