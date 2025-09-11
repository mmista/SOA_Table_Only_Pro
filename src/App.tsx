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
    
    // Helper function to find parent hierarchy for any item
    const findItemHierarchy = (targetId: string, targetType: EditableItemType) => {
      for (const period of soaData.periods) {
        if (targetType === 'period' && period.id === targetId) {
          return { period, cycle: null, week: null, day: null };
        }
        
        for (const cycle of period.cycles) {
          if (targetType === 'cycle' && cycle.id === targetId) {
            return { period, cycle, week: null, day: null };
          }
          
          for (const week of cycle.weeks) {
            if (targetType === 'week' && week.id === targetId) {
              return { period, cycle, week, day: null };
            }
            
            for (const day of week.days) {
              if (targetType === 'day' && day.id === targetId) {
                return { period, cycle, week, day };
              }
            }
          }
        }
      }
      return null;
    };

    const hierarchy = findItemHierarchy(focusedId, focusedType);
    if (!hierarchy) {
      return soaData; // Fallback if item not found
    }

    // Build filtered structure based on focus type
    let filteredPeriods: Period[] = [];

    if (focusedType === 'period') {
      // Show only the focused period with all its children
      filteredPeriods = [hierarchy.period];
    } else if (focusedType === 'cycle') {
      // Show parent period but only with the focused cycle
      filteredPeriods = [{
        ...hierarchy.period,
        cycles: [hierarchy.cycle!]
      }];
    } else if (focusedType === 'week') {
      // Show parent period and cycle but only with the focused week
      filteredPeriods = [{
        ...hierarchy.period,
        cycles: [{
          ...hierarchy.cycle!,
          weeks: [hierarchy.week!]
        }]
      }];
    } else if (focusedType === 'day') {
      // Show parent period, cycle, and week but only with the focused day
      filteredPeriods = [{
        ...hierarchy.period,
        cycles: [{
          ...hierarchy.cycle!,
          weeks: [{
            ...hierarchy.week!,
            days: [hierarchy.day!]
          }]
        }]
      }];
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