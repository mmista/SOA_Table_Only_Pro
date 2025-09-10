import React from 'react';
import { SOAData } from '../../types/soa';
import { TimelineHeaderConfig } from '../../hooks/useTimelineHeaderManagement';
import { StaticTableCell } from '../molecules/StaticTableCell';
import { VisitLabelCell } from '../molecules/VisitLabelCell';
import { EditableHeaderLabel } from '../molecules/EditableHeaderLabel';

interface StaticRowsSectionProps {
  data: SOAData;
  headers: TimelineHeaderConfig[];
  visibleHeaders: TimelineHeaderConfig[];
  editingHeaderId: string | null;
  startEditingHeader: (headerId: string) => void;
  saveHeaderLabel: (headerId: string, newLabel: string) => void;
  cancelEditingHeader: () => void;
  hideHeader: (headerId: string) => void;
  isVisitLinked: (dayId: string) => boolean;
  getLinkedVisits: (dayId: string) => string[];
  getVisitLinkInfo: (dayId: string) => { name?: string } | null;
  shouldHighlightVisit: (dayId: string) => boolean;
  handleVisitHover: (dayId: string | null) => void;
}

export const StaticRowsSection: React.FC<StaticRowsSectionProps> = ({
  data,
  headers,
  visibleHeaders,
  editingHeaderId,
  startEditingHeader,
  saveHeaderLabel,
  cancelEditingHeader,
  hideHeader,
  isVisitLinked,
  getLinkedVisits,
  getVisitLinkInfo,
  shouldHighlightVisit,
  handleVisitHover
}) => {

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
    return headers?.find(header => header.type === type);
  };

  const isHeaderVisible = (type: string) => {
    const header = getHeaderByType(type);
    return header ? header.isVisible : false;
  };

  return (
    <>
      {/* Time of Day Row */}
      {isHeaderVisible('time-of-day') && (
        <tr>
          {(() => {
            const header = getHeaderByType('time-of-day');
            return (
          <EditableHeaderLabel
                id={header?.id || 'time-of-day'}
                label={header?.label || 'TIME OF DAY'}
                isEditing={editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
            onStartEdit={startEditingHeader}
            onSaveLabel={saveHeaderLabel}
            onCancelEdit={cancelEditingHeader}
            onToggleVisibility={hideHeader}
          />
            );
          })()}
          {data.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                week.days.map((day, dayIndex) => (
                  <StaticTableCell
                    key={`time-${day.id}`}
                    content={dayIndex % 2 === 0 ? 'Morning' : 'Afternoon'}
                    dayId={day.id}
                  />
                ))
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
                label={header?.label || 'ALLOWED WINDOW'}
                isEditing={editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
            onStartEdit={startEditingHeader}
            onSaveLabel={saveHeaderLabel}
            onCancelEdit={cancelEditingHeader}
            onToggleVisibility={hideHeader}
          />
            );
          })()}
          {data.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                week.days.map((day, dayIndex) => (
                  <StaticTableCell
                    key={`window-${day.id}`}
                    content={dayIndex % 3 === 0 ? '±1d' : dayIndex % 3 === 1 ? '±2h' : '±4h'}
                    dayId={day.id}
                  />
                ))
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
                isEditing={editingHeaderId === header?.id}
                isVisible={header?.isVisible || false}
            onStartEdit={startEditingHeader}
            onSaveLabel={saveHeaderLabel}
            onCancelEdit={cancelEditingHeader}
            onToggleVisibility={hideHeader}
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
                    />
                  );
                })
              )
            )
          )}
        </tr>
      )}
    </>
  );
};