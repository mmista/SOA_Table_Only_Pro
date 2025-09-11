import React from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';
import { SOAData, EditableItemType, Period, Cycle, Week } from './types/soa';

function App() {
  const [soaData, setSoaData] = React.useState<SOAData>(() => generateSampleData());
  const [focusedTimelineItem, setFocusedTimelineItem] = React.useState<{ id: string; type: EditableItemType } | null>(null);
  const [isFocusModeActive, setIsFocusModeActive] = React.useState(false);
  const headerManagement = useTimelineHeaderManagement();

  const handleDataChange = (newData: SOAData) => {
    setSoaData(newData);
  };

  const handleFocusTimelineItem = (id: string, type: EditableItemType) => {
    setFocusedTimelineItem({ id, type });
    setIsFocusModeActive(true);
  };

  const handleExitFocusMode = () => {
    setFocusedTimelineItem(null);
    setIsFocusModeActive(false);
  };

  // Helper function to get all day IDs from a structure
  const getAllDayIds = (periods: Period[]): string[] => {
    const dayIds: string[] = [];
    periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          week.days.forEach(day => {
            dayIds.push(day.id);
          });
        });
      });
    });
    return dayIds;
  };

  // Create filtered data based on focus state with proper deep filtering
  const filteredSoaData = React.useMemo(() => {
    if (!focusedTimelineItem) {
      return soaData;
    }

    const { id: focusedId, type: focusedType } = focusedTimelineItem;
    
    // New precise filtering logic
    const filteredPeriods: Period[] = [];
    
    for (const period of soaData.periods) {
      // Check if this period should be included
      let shouldIncludePeriod = false;
      let filteredCycles: Cycle[] = [];
      
      if (focusedType === 'period' && period.id === focusedId) {
        // Focus on this specific period - include it entirely
        shouldIncludePeriod = true;
        filteredCycles = period.cycles;
      } else {
        // Check cycles within this period
        for (const cycle of period.cycles) {
          let shouldIncludeCycle = false;
          let filteredWeeks: Week[] = [];
          
          if (focusedType === 'cycle' && cycle.id === focusedId) {
            // Focus on this specific cycle - include it entirely
            shouldIncludeCycle = true;
            filteredWeeks = cycle.weeks;
          } else {
            // Check weeks within this cycle
            for (const week of cycle.weeks) {
              let shouldIncludeWeek = false;
              let filteredDays = week.days;
              
              if (focusedType === 'week' && week.id === focusedId) {
                // Focus on this specific week - include it entirely
                shouldIncludeWeek = true;
              } else if (focusedType === 'day') {
                // Focus on a specific day - only include that day
                const focusedDay = week.days.find(day => day.id === focusedId);
                if (focusedDay) {
                  shouldIncludeWeek = true;
                  filteredDays = [focusedDay];
                }
              }
              
              if (shouldIncludeWeek) {
                filteredWeeks.push({ ...week, days: filteredDays });
              }
            }
          }
          
          if (shouldIncludeCycle || filteredWeeks.length > 0) {
            filteredCycles.push({ ...cycle, weeks: filteredWeeks });
            shouldIncludePeriod = true;
          }
        }
      }
      
      if (shouldIncludePeriod) {
        filteredPeriods.push({ ...period, cycles: filteredCycles });
      }
    }

    // Get all visible day IDs from the filtered structure
    const visibleDayIds = getAllDayIds(filteredPeriods);
    
    // Filter activities, time cells, and visit links to only include data for visible days
    const filteredActivities = soaData.activities.map(activity => ({
      ...activity,
      cells: activity.cells.filter(cell => visibleDayIds.includes(cell.dayId))
    }));
    
    const filteredTimeRelativeCells = soaData.timeRelativeCells.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    );
    
    const filteredTimeWindowCells = soaData.timeWindowCells.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    );
    
    const filteredTimeOfDayCells = soaData.timeOfDayCells.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    );
    
    const filteredVisitLinks = soaData.visitLinks.filter(link => 
      link.visitIds.some(visitId => visibleDayIds.includes(visitId))
    );

    return {
      ...soaData,
      periods: filteredPeriods,
      activities: filteredActivities,
      timeRelativeCells: filteredTimeRelativeCells,
      timeWindowCells: filteredTimeWindowCells,
      timeOfDayCells: filteredTimeOfDayCells,
      visitLinks: filteredVisitLinks
    };
  }, [soaData, focusedTimelineItem]);
  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <SOATable
        data={soaData}
        displayData={filteredSoaData}
        onDataChange={handleDataChange}
        headerManagement={headerManagement}
        isFocusModeActive={isFocusModeActive}
        focusedTimelineItem={focusedTimelineItem}
        onFocusTimelineItem={handleFocusTimelineItem}
        onExitFocusMode={handleExitFocusMode}
      />
      
      {/* Legend positioned at bottom of content flow - not sticky/fixed */}
      <div className="mt-6">
        <SOALegend />
      </div>
    </div>
  );
}

export default App;