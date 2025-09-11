import React from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';
import { SOAData, Period, Cycle, Week, EditableItemType } from './types/soa';

function App() {
  const [soaData, setSoaData] = React.useState<SOAData>(() => generateSampleData());
  const headerManagement = useTimelineHeaderManagement();

  // Centralized data filtering logic for focus mode
  const getFilteredData = React.useCallback((originalData: SOAData): SOAData => {
    if (!headerManagement.isFocusMode || !headerManagement.focusedHeaderId || !headerManagement.focusedHeaderType) {
      return originalData;
    }

    const focusedId = headerManagement.focusedHeaderId;
    const focusedType = headerManagement.focusedHeaderType;

    // Create a filtered copy of the data
    const filteredData: SOAData = { ...originalData, periods: [] };
    const visibleDayIds: string[] = [];

    // Filter based on focused header type and ID
    for (const period of originalData.periods) {
      if (focusedType === 'period' && period.id === focusedId) {
        filteredData.periods.push(period);
        // Collect all day IDs from this period
        period.cycles.forEach(cycle => {
          cycle.weeks.forEach(week => {
            week.days.forEach(day => {
              visibleDayIds.push(day.id);
            });
          });
        });
        break;
      }
      
      const filteredPeriod: Period = { ...period, cycles: [] };
      let shouldIncludePeriod = false;

      for (const cycle of period.cycles) {
        if (focusedType === 'cycle' && cycle.id === focusedId) {
          filteredPeriod.cycles.push(cycle);
          // Collect all day IDs from this cycle
          cycle.weeks.forEach(week => {
            week.days.forEach(day => {
              visibleDayIds.push(day.id);
            });
          });
          shouldIncludePeriod = true;
          break;
        }
        
        const filteredCycle: Cycle = { ...cycle, weeks: [] };
        let shouldIncludeCycle = false;

        for (const week of cycle.weeks) {
          if (focusedType === 'week' && week.id === focusedId) {
            filteredCycle.weeks.push(week);
            // Collect all day IDs from this week
            week.days.forEach(day => {
              visibleDayIds.push(day.id);
            });
            shouldIncludeCycle = true;
            break;
          }
          
          const filteredWeek: Week = { ...week, days: [] };
          let shouldIncludeWeek = false;

          for (const day of week.days) {
            if (focusedType === 'day' && day.id === focusedId) {
              filteredWeek.days.push(day);
              visibleDayIds.push(day.id);
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

    // Filter activities - keep all activities but filter their cells
    filteredData.activities = originalData.activities?.map(activity => ({
      ...activity,
      cells: activity.cells.filter(cell => visibleDayIds.includes(cell.dayId))
    })) || [];
    
    // Filter activity groups
    filteredData.activityGroups = originalData.activityGroups || [];
    
    // Filter static data arrays based on visible day IDs
    filteredData.timeRelativeCells = originalData.timeRelativeCells?.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.timeWindowCells = originalData.timeWindowCells?.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.timeOfDayCells = originalData.timeOfDayCells?.filter(cell => 
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.visitLinks = originalData.visitLinks?.filter(link => 
      link.visitIds.some(visitId => visibleDayIds.includes(visitId))
    ) || [];

    return filteredData;
  }, [headerManagement.isFocusMode, headerManagement.focusedHeaderId, headerManagement.focusedHeaderType]);

  // Get current data (filtered or original)
  const currentData = React.useMemo(() => getFilteredData(soaData), [soaData, getFilteredData]);

  const handleDataChange = (newData: SOAData) => {
    setSoaData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <SOATable
        data={currentData}
        fullData={soaData}
        onDataChange={handleDataChange}
        headerManagement={headerManagement}
      />
      
      {/* Legend positioned at bottom of content flow - not sticky/fixed */}
      <div className="mt-6">
        <SOALegend />
      </div>
    </div>
  );
}

export default App;