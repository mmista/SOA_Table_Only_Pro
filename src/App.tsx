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

  // Create filtered data based on focus state
  const filteredSoaData = React.useMemo(() => {
    if (!focusedTimelineItem) {
      return soaData;
    }

    const { id: focusedId, type: focusedType } = focusedTimelineItem;
    
    // Helper function to check if an item should be included
    const shouldIncludeItem = (itemId: string, itemType: EditableItemType, parentIds: string[] = []): boolean => {
      // Always include the focused item
      if (itemId === focusedId && itemType === focusedType) {
        return true;
      }
      
      // Include ancestors of the focused item
      if (parentIds.includes(focusedId)) {
        return true;
      }
      
      return false;
    };

    // Filter periods based on focus
    const filteredPeriods = soaData.periods.filter(period => {
      if (focusedType === 'period') {
        return period.id === focusedId;
      }
      
      // Check if this period contains the focused item
      const containsFocusedItem = period.cycles.some(cycle => {
        if (focusedType === 'cycle') {
          return cycle.id === focusedId;
        }
        return cycle.weeks.some(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => day.id === focusedId);
        });
      });
      
      return containsFocusedItem;
    }).map(period => {
      if (focusedType === 'period' && period.id === focusedId) {
        return period; // Include all cycles, weeks, and days
      }
      
      // Filter cycles within this period
      const filteredCycles = period.cycles.filter(cycle => {
        if (focusedType === 'cycle') {
          return cycle.id === focusedId;
        }
        
        // Check if this cycle contains the focused item
        return cycle.weeks.some(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => day.id === focusedId);
        });
      }).map(cycle => {
        if (focusedType === 'cycle' && cycle.id === focusedId) {
          return cycle; // Include all weeks and days
        }
        
        // Filter weeks within this cycle
        const filteredWeeks = cycle.weeks.filter(week => {
          if (focusedType === 'week') {
            return week.id === focusedId;
          }
          return week.days.some(day => day.id === focusedId);
        }).map(week => {
          if (focusedType === 'week' && week.id === focusedId) {
            return week; // Include all days
          }
          return week;
        });
        
        return { ...cycle, weeks: filteredWeeks };
      });
      
      return { ...period, cycles: filteredCycles };
    });

    return { ...soaData, periods: filteredPeriods };
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