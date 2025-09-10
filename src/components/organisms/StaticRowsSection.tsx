import React from 'react';
import { SOAData } from '../../types/soa';
import { StaticTableCell } from '../molecules/StaticTableCell';
import { VisitLabelCell } from '../molecules/VisitLabelCell';
import { useTimelineHeaderManagement } from '../../hooks/useTimelineHeaderManagement';

interface StaticRowsSectionProps {
  data: SOAData;
  isVisitLinked: (dayId: string) => boolean;
  getLinkedVisits: (dayId: string) => string[];
  getVisitLinkInfo: (dayId: string) => { name?: string } | null;
  shouldHighlightVisit: (dayId: string) => boolean;
  handleVisitHover: (dayId: string | null) => void;
}

export const StaticRowsSection: React.FC<StaticRowsSectionProps> = ({
  data,
  isVisitLinked,
  getLinkedVisits,
  getVisitLinkInfo,
  shouldHighlightVisit,
  handleVisitHover
}) => {
  const { visibleHeaders } = useTimelineHeaderManagement();

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
  const isHeaderVisible = (type: string) => {
    return visibleHeaders.some(header => header.type === type);
  };

  return (
    <>
      {/* Time of Day Row */}
      {isHeaderVisible('visit') && (
        <tr>
          <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
            TIME OF DAY
          </td>
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
      {isHeaderVisible('visit') && (
        <tr>
          <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
            ALLOWED WINDOW
          </td>
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
          <td className="sticky left-0 border border-gray-300 bg-gray-50 px-4 py-2 font-normal text-xs text-gray-500 uppercase tracking-wider z-[15]">
            {visibleHeaders.find(h => h.type === 'visit')?.label || 'VISIT LABEL'}
          </td>
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