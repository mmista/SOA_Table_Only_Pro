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

  // Get header by type for editing functionality
  const getHeaderByType = (type: string) => {
    return headerManagement.headers?.find(header => header.type === type);
  };

  return (
    <>
      {/* Time Relative Row */}
      <tr>
        {(() => {
          const header = getHeaderByType('time-relative');
          return (
            <EditableHeaderLabel
              id={header?.id || 'time-relative'}
              label={header?.label || 'TIME RELATIVE (H)'}
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
              week.days.map((day) => {
                const value = getCellValue(data.timeRelativeCells || [], day.id, 24);
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

      {/* Allowed Window Row */}
      <tr>
        {(() => {
          const header = getHeaderByType('allowed-window');
          return (
            <EditableHeaderLabel
              id={header?.id || 'allowed-window'}
              label={header?.label || 'TIME WINDOW (H)'}
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
              week.days.map((day) => {
                const cellData = (data.timeWindowCells || []).find(cell => cell.dayId === day.id);
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

      {/* Time of Day Row */}
      <tr>
        {(() => {
          const header = getHeaderByType('time-of-day');
          return (
            <EditableHeaderLabel
              id={header?.id || 'time-of-day'}
              label={header?.label || 'TIME OF DAY'}
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
              week.days.map((day) => {
                const value = getCellValue(data.timeOfDayCells || [], day.id, 'Morning');
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


      {/* Visit Label Row */}
      <tr>
        {(() => {
          const header = getHeaderByType('visit');
          return (
            <EditableHeaderLabel
              id={header?.id || 'visit'}
              label={header?.label || 'VISIT LABEL'}
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
              week.days.map((day) => {
                const visitNumber = calculateVisitNumber(day.id);
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
    </>
  );
};