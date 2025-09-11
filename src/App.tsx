import React from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';
import { SOAData, Period, Cycle, Week, EditableItemType } from './types/soa';

function App() {
  // This state will always hold the complete, unfiltered data.
  // All modifications should ultimately update this state.
  const [originalSoaData, setOriginalSoaData] = React.useState<SOAData>(() => generateSampleData());
  const headerManagement = useTimelineHeaderManagement();

  // Centralized data filtering logic for focus mode.
  // This function now explicitly takes the full, unfiltered data as input.
  const getFilteredData = React.useCallback((fullData: SOAData): SOAData => {
    if (!headerManagement.isFocusMode || !headerManagement.focusedHeaderId || !headerManagement.focusedHeaderType) {
      return fullData; // If not in focus mode, return the full data directly.
    }

    const focusedId = headerManagement.focusedHeaderId;
    const focusedType = headerManagement.focusedHeaderType;

    // Create a filtered copy of the data.
    // IMPORTANT: All filtering operations below must operate on 'fullData'
    // to ensure the original structure is not implicitly modified.
    const filteredData: SOAData = { ...fullData, periods: [] };
    const visibleDayIds: string[] = [];

    // Filter based on focused header type and ID
    for (const period of fullData.periods) { // Iterate over fullData.periods
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
    filteredData.activities = fullData.activities?.map(activity => ({ // Use fullData.activities
      ...activity,
      cells: activity.cells.filter(cell => visibleDayIds.includes(cell.dayId))
    })) || [];
    
    // Filter activity groups
    filteredData.activityGroups = fullData.activityGroups || []; // Use fullData.activityGroups
    
    // Filter static data arrays based on visible day IDs
    filteredData.timeRelativeCells = fullData.timeRelativeCells?.filter(cell => // Use fullData.timeRelativeCells
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.timeWindowCells = fullData.timeWindowCells?.filter(cell => // Use fullData.timeWindowCells
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.timeOfDayCells = fullData.timeOfDayCells?.filter(cell => // Use fullData.timeOfDayCells
      visibleDayIds.includes(cell.dayId)
    ) || [];
    
    filteredData.visitLinks = fullData.visitLinks?.filter(link => // Use fullData.visitLinks
      link.visitIds.some(visitId => visibleDayIds.includes(visitId))
    ) || [];

    return filteredData;
  }, [headerManagement.isFocusMode, headerManagement.focusedHeaderId, headerManagement.focusedHeaderType]);

  // This is the data that will actually be displayed by SOATable.
  // It's a derived state that updates when originalSoaData or focus mode changes.
  const displayedSoaData = React.useMemo(() => {
    // If not in focus mode, display the original, full data.
    if (!headerManagement.isFocusMode) {
      return originalSoaData;
    }
    // If in focus mode, display the filtered version of the original data.
    return getFilteredData(originalSoaData);
  }, [originalSoaData, headerManagement.isFocusMode, getFilteredData]);

  // This handler will always update the original, full data.
  // Any changes from SOATable will flow back to originalSoaData.
  const handleDataChange = (newData: SOAData) => {
    setOriginalSoaData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <SOATable
        data={displayedSoaData} // Pass the displayed (potentially filtered) data
        onDataChange={handleDataChange} // Pass the handler that updates the original data
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