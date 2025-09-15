import React from 'react';
import { SOATable } from './components/SOATable';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';
import { SOAData, Period, Cycle, Week, EditableItemType } from './types/soa';

function App() {
  const [soaData, setSoaData] = React.useState<SOAData>(() => generateSampleData());
  const headerManagement = useTimelineHeaderManagement();

  // Centralized data filtering logic for focus mode
  const getFilteredData = React.useCallback((originalData: SOAData): SOAData => {
    // First, filter based on header visibility and active state
    let filteredData: SOAData = { ...originalData, periods: [] };
    
    // Get header states
    const periodHeader = headerManagement.headers?.find(h => h.type === 'period');
    const cycleHeader = headerManagement.headers?.find(h => h.type === 'cycle');
    const weekHeader = headerManagement.headers?.find(h => h.type === 'week');
    const dayHeader = headerManagement.headers?.find(h => h.type === 'day');
    
    // Check if headers are active and visible
    const isPeriodVisible = periodHeader ? (periodHeader.isActive && periodHeader.isVisible) : true;
    const isCycleVisible = cycleHeader ? (cycleHeader.isActive && cycleHeader.isVisible) : true;
    const isWeekVisible = weekHeader ? (weekHeader.isActive && weekHeader.isVisible) : true;
    const isDayVisible = dayHeader ? (dayHeader.isActive && dayHeader.isVisible) : true;
    
    // If any structural header is not visible, we need to handle the data structure carefully
    // For now, we'll keep the structure but filter based on focus mode if active
    
    // Apply focus mode filtering if active
    if (headerManagement.isFocusMode && headerManagement.focusedHeaderId && headerManagement.focusedHeaderType) {
      const focusedId = headerManagement.focusedHeaderId;
      const focusedType = headerManagement.focusedHeaderType;
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
    } else {
      // No focus mode - return original data structure
      // But we still need to respect header visibility for rendering
      filteredData = originalData;
    }
    
    return filteredData;
  }, [headerManagement.isFocusMode, headerManagement.focusedHeaderId, headerManagement.focusedHeaderType, headerManagement.headers]);

  // Additional filtering function to determine which rows should be rendered
  const shouldRenderRow = React.useCallback((rowType: string): boolean => {
    const header = headerManagement.headers?.find(h => h.type === rowType);
    return header ? (header.isActive && header.isVisible) : true;
  }, [headerManagement.headers]);

  // Get current data (filtered or original)
  const currentData = React.useMemo(() => getFilteredData(soaData), [soaData, getFilteredData]);

  const handleDataChange = (newData: SOAData) => {
    setSoaData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SOATable
        data={currentData}
        onDataChange={handleDataChange}
        headerManagement={headerManagement}
        shouldRenderRow={shouldRenderRow}
      />
    </div>
  );
}

export default App;