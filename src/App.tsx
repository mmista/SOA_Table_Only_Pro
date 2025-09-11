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
    
    // Deep filtering function that preserves hierarchy
    const filteredPeriods = soaData.periods.filter(period => {
      if (focusedType === 'period') {
        return period.id === focusedId;
      }
      
      // Check if this period contains the focused item at any level
      const containsFocusedItem = period.cycles.some(cycle => {
        if (focusedType === 'cycle') {
          return cycle.id === focusedId;
        }
        return cycle.weeks.some(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => {
            if (focusedType === 'day') {
              return day.id === focusedId;
            }
            return false;
          });
        });
      });
      
      return containsFocusedItem;
    }).map(period => {
      // If focusing on this specific period, return it as-is
      if (focusedType === 'period' && period.id === focusedId) {
        return period;
      }
      
      // Otherwise, filter down to only the relevant cycles
      const filteredCycles = period.cycles.filter(cycle => {
        if (focusedType === 'cycle') {
          return cycle.id === focusedId;
        }
        
        // Check if this cycle contains the focused week or day
        return cycle.weeks.some(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => {
            if (focusedType === 'day') {
              return day.id === focusedId;
            }
            return false;
          });
        });
      }).map(cycle => {
        // If focusing on this specific cycle, return it as-is
        if (focusedType === 'cycle' && cycle.id === focusedId) {
          return cycle;
        }
        
        // Otherwise, filter down to only the relevant weeks
        const filteredWeeks = cycle.weeks.filter(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => {
            if (focusedType === 'day') {
              return day.id === focusedId;
            }
            return false;
          });
        }).map(week => {
          // If focusing on this specific week, return it as-is
          if (focusedType === 'week' && week.id === focusedId) {
            return week;
          }
          
          // If focusing on a specific day, filter to only that day
          if (focusedType === 'day') {
            const filteredDays = week.days.filter(day => day.id === focusedId);
            return { ...week, days: filteredDays };
          }
          
          return week;
        });
        
        return { ...cycle, weeks: filteredWeeks };
      });
      
      return { ...period, cycles: filteredCycles };
    });

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