import React, { useState } from 'react';
import { SOAData, Period, Cycle, Week, Day, EditContext, EditableItemType, ActivityData, ActivityCell, VisitType } from '../types/soa';
import { EditPanel } from './EditPanel';
import { EmptyGroupModal } from './EmptyGroupModal';
import { VisitTypeSelector } from './VisitTypeSelector';
import { CommentModal } from './CommentModal';
import { ActivityCellContextMenu } from './ActivityCellContextMenu';
import { TableHeader } from './molecules/TableHeader';
import { TimelineHeaderSection } from './organisms/TimelineHeaderSection';
import { StaticRowsSection } from './organisms/StaticRowsSection';
import { ActivityRowsSection } from './organisms/ActivityRowsSection';
import { useDragDrop } from '../hooks/useDragDrop';
import { useVisitLinks } from '../hooks/useVisitLinks';
import { useComments } from '../hooks/useComments';

interface SOATableProps {
  data: SOAData;
  onDataChange: (data: SOAData) => void;
  headerManagement: ReturnType<typeof import('../hooks/useTimelineHeaderManagement').useTimelineHeaderManagement>;
}

interface HoverState {
  type: EditableItemType;
  id: string;
  side: 'left' | 'right';
}

export const SOATable: React.FC<SOATableProps> = ({ data, onDataChange, headerManagement }) => {
  const [hoveredCell, setHoveredCell] = useState<HoverState | null>(null);
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const [showMoveSuccess, setShowMoveSuccess] = useState(false);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ description?: string }>({});
  const [hoveredActivityRow, setHoveredActivityRow] = useState<string | null>(null);
  const [visitTypeSelector, setVisitTypeSelector] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    activityId: string;
    dayId: string;
  } | null>(null);
  
  // New states for cell selection and context menu
  const [selectedActivityCells, setSelectedActivityCells] = useState<Set<string>>(new Set());
  const [selectionStartCell, setSelectionStartCell] = useState<{ activityId: string; dayId: string } | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    clickedCell: { activityId: string; dayId: string } | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    clickedCell: null
  });
  
  // Comments hook
  const {
    commentModal,
    commentStats,
    hasComment,
    getComment,
    saveComment,
    deleteComment,
    openCommentModal,
    closeCommentModal
  } = useComments();
  
  // Debug logging
  const logActivityState = (context: string) => {
    console.log(`=== ${context} ===`);
    console.log('Current activities count:', activities.length);
    if (activities.length > 0) {
      console.log('First activity cells count:', activities[0].cells.length);
      console.log('Sample day IDs from activities:', activities[0].cells.slice(0, 5).map(c => c.dayId));
    }
    
    const allDays: string[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          week.days.forEach(day => {
            allDays.push(day.id);
          });
        });
      });
    });
    console.log('Current data structure days count:', allDays.length);
    console.log('Sample day IDs from data:', allDays.slice(0, 5));
    console.log('========================');
  };
  
  const {
    dragState,
    history,
    emptyGroup,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    validateDrop,
    setHoveredDropZone,
    undo,
    canUndo,
    handleKeepEmptyGroup,
    handleDeleteEmptyGroup,
    closeEmptyGroupModal
  } = useDragDrop(data, onDataChange);

  const {
    isVisitLinked,
    getLinkedVisits,
    getVisitLinkInfo,
    handleVisitHover,
    handleActivityCellHover,
    shouldHighlightVisit,
    shouldHighlightActivityCell
  } = useVisitLinks(data);

  // Show success animation when a move completes
  const showSuccessAnimation = () => {
    setShowMoveSuccess(true);
    setTimeout(() => {
      setShowMoveSuccess(false);
    }, 2000);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper function to get cell key
  const getCellKey = (activityId: string, dayId: string) => `${activityId}_${dayId}`;

  // Helper function to parse cell key
  const parseCellKey = (key: string) => {
    const [activityId, dayId] = key.split('_');
    return { activityId, dayId };
  };

  // Helper function to get activity and day indices
  const getActivityDayIndices = (activityId: string, dayId: string) => {
    const activityIndex = activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return null;

    const allDays: Day[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDays.push(...week.days);
        });
      });
    });

    const dayIndex = allDays.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return null;

    return { activityIndex, dayIndex };
  };

  // Helper function to check if a cell is merged
  const isCellMerged = (activityId: string, dayId: string) => {
    const cell = getActivityCell(activityId, dayId);
    return cell && ((cell.colspan && cell.colspan > 1) || (cell.rowspan && cell.rowspan > 1));
  };

  // Initialize activities data
  React.useEffect(() => {
    console.log('🔄 Activities useEffect triggered');
    logActivityState('BEFORE ACTIVITIES RECREATION');
    
    // Get all days from the data structure
    const allDays: Day[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDays.push(...week.days);
        });
      });
    });

    console.log('📊 Current activities count:', activities.length);
    
    // If no activities exist, create initial ones
    if (activities.length === 0) {
      console.log('🆕 Creating initial activities');
      const trialActivities = [
        { description: 'Informed Consent', category: 'visit' as const },
        { description: 'Medical History', category: 'visit' as const },
        { description: 'Physical Examination', category: 'visit' as const },
        { description: 'Vital Signs', category: 'visit' as const },
        { description: 'Laboratory Tests', category: 'lab' as const },
        { description: 'ECG', category: 'other' as const },
        { description: 'Drug Administration', category: 'other' as const },
        { description: 'Adverse Event Assessment', category: 'questionnaire' as const }
      ];

      const initialActivities: ActivityData[] = trialActivities.map((activity, activityIndex) => ({
        id: `activity-${activityIndex}`,
        description: activity.description,
        category: activity.category,
        cells: allDays.map((day, dayIndex) => {
          const activityName = activity.description;
          let isActive = false;
          let visitType: VisitType | undefined;
          let footnote: string | undefined;
          let customText: string | undefined;
          
          if (activityName === 'Informed Consent' && dayIndex === 0) {
            isActive = true;
            visitType = 'in-person';
            footnote = 'a';
          }
          if (activityName === 'Medical History' && dayIndex === 0) {
            isActive = true;
            visitType = 'in-person';
            footnote = 'a';
          }
          if (activityName === 'Physical Examination' && (dayIndex === 0 || dayIndex % 7 === 0)) {
            isActive = true;
            visitType = 'in-person';
            footnote = String.fromCharCode(97 + (dayIndex % 4)); // a, b, c, d
          }
          if (activityName === 'Vital Signs' && dayIndex % 2 === 0) {
            isActive = true;
            visitType = dayIndex % 4 === 0 ? 'in-person' : 'remote-assessment';
            footnote = dayIndex < 4 ? 'a' : undefined;
            if (dayIndex === 1) customText = 'Baseline';
          }
          if (activityName === 'Laboratory Tests' && (dayIndex === 0 || dayIndex === 7 || dayIndex === 14)) {
            isActive = true;
            visitType = 'in-person';
            footnote = 'x';
          }
          if (activityName === 'ECG' && (dayIndex === 0 || dayIndex === 7 || dayIndex === 14)) {
            isActive = true;
            visitType = 'in-person';
            footnote = 'x';
          }
          if (activityName === 'Drug Administration' && dayIndex > 0 && dayIndex < 15) {
            isActive = true;
            visitType = 'drug-shipment';
          }
          if (activityName === 'Adverse Event Assessment' && dayIndex > 0) {
            isActive = true;
            visitType = dayIndex % 3 === 0 ? 'phone-call' : 'remote-assessment';
          }
          
          return {
            dayId: day.id,
            isActive,
            visitType,
            footnote,
            customText
          };
        })
      }));

      setActivities(initialActivities);
    } else {
      console.log('🔄 Updating existing activities to match new day structure');
      
      // Update existing activities to match the new day structure
      setActivities(prevActivities => {
        return prevActivities.map(activity => {
          // Create a map of existing cells by dayId for quick lookup
          const existingCellsMap = new Map(
            activity.cells.map(cell => [cell.dayId, cell])
          );
          
          // Create new cells array matching the current day structure
          const newCells = allDays.map(day => {
            // If we have existing data for this day, keep it
            const existingCell = existingCellsMap.get(day.id);
            if (existingCell) {
              return existingCell;
            }
            
            // Otherwise create a new inactive cell
            return {
              dayId: day.id,
              isActive: false
            };
          });
          
          return {
            ...activity,
            cells: newCells
          };
        });
      });
    }
  }, [data]);

  const handleActivityEdit = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setEditingActivity(activityId);
      setEditValues({ description: activity.description });
    }
  };

  const handleActivitySave = (activityId: string, newDescription: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, description: newDescription }
        : activity
    ));
    setEditingActivity(null);
    setEditValues({});
  };

  const handleActivityCancel = () => {
    setEditingActivity(null);
    setEditValues({});
  };

  const handleAddActivity = () => {
    const newActivity: ActivityData = {
      id: generateId(),
      description: 'New Activity',
      category: 'other',
      cells: data.periods.flatMap(period =>
        period.cycles.flatMap(cycle =>
          cycle.weeks.flatMap(week =>
            week.days.map(day => ({
              dayId: day.id,
              isActive: false
            }))
          )
        )
      )
    };
    setActivities(prev => [...prev, newActivity]);
  };

  const handleRemoveActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  const getTotalDays = () => {
    return data.periods.reduce((total, period) => {
      return total + period.cycles.reduce((cycleTotal, cycle) => {
        return cycleTotal + cycle.weeks.reduce((weekTotal, week) => {
          return weekTotal + week.days.length;
        }, 0);
      }, 0);
    }, 0);
  };

  const handleAddItem = (type: EditableItemType, id: string, side: 'left' | 'right') => {
    const newData = { ...data };
    
    if (type === 'period') {
      const periodIndex = newData.periods.findIndex(p => p.id === id);
      const insertIndex = side === 'right' ? periodIndex + 1 : periodIndex;
      const newPeriod: Period = {
        id: generateId(),
        name: `Period ${newData.periods.length + 1}`,
        cycles: [{
          id: generateId(),
          name: 'Cycle 1',
          weeks: [{
            id: generateId(),
            name: 'Week 1',
            days: [{
              id: generateId(),
              name: 'Day 1'
            }]
          }]
        }]
      };
      newData.periods.splice(insertIndex, 0, newPeriod);
    } else if (type === 'cycle') {
      for (const period of newData.periods) {
        const cycleIndex = period.cycles.findIndex(c => c.id === id);
        if (cycleIndex !== -1) {
          const insertIndex = side === 'right' ? cycleIndex + 1 : cycleIndex;
          const newCycle: Cycle = {
            id: generateId(),
            name: `Cycle ${period.cycles.length + 1}`,
            weeks: [{
              id: generateId(),
              name: 'Week 1',
              days: [{
                id: generateId(),
                name: 'Day 1'
              }]
            }]
          };
          period.cycles.splice(insertIndex, 0, newCycle);
          break;
        }
      }
    } else if (type === 'week') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          const weekIndex = cycle.weeks.findIndex(w => w.id === id);
          if (weekIndex !== -1) {
            const insertIndex = side === 'right' ? weekIndex + 1 : weekIndex;
            const newWeek: Week = {
              id: generateId(),
              name: `Week ${cycle.weeks.length + 1}`,
              days: [{
                id: generateId(),
                name: 'Day 1'
              }]
            };
            cycle.weeks.splice(insertIndex, 0, newWeek);
            break;
          }
        }
      }
    } else if (type === 'day') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          for (const week of cycle.weeks) {
            const dayIndex = week.days.findIndex(d => d.id === id);
            if (dayIndex !== -1) {
              const insertIndex = side === 'right' ? dayIndex + 1 : dayIndex;
              const newDay: Day = {
                id: generateId(),
                name: `Day ${week.days.length + 1}`
              };
              week.days.splice(insertIndex, 0, newDay);
              break;
            }
          }
        }
      }
    }

    onDataChange(newData);
  };

  const handleCellClick = (item: any, type: EditableItemType) => {
    setEditContext({ item, type });
  };

  // Enhanced drop handler with success animation
  const handleDropWithAnimation = (targetId: string, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => {
    console.log('🚀 Starting drag drop operation');
    logActivityState('BEFORE DROP');
    handleDrop(targetId, targetType, position);
    console.log('✅ Drop completed, data structure updated');
    showSuccessAnimation();
  };

  const handleEditSave = (updatedItem: any) => {
    const newData = { ...data };
    
    // Find and update the item in the data structure
    if (editContext?.type === 'period') {
      const periodIndex = newData.periods.findIndex(p => p.id === updatedItem.id);
      if (periodIndex !== -1) {
        newData.periods[periodIndex] = { ...newData.periods[periodIndex], ...updatedItem };
      }
    } else if (editContext?.type === 'cycle') {
      for (const period of newData.periods) {
        const cycleIndex = period.cycles.findIndex(c => c.id === updatedItem.id);
        if (cycleIndex !== -1) {
          period.cycles[cycleIndex] = { ...period.cycles[cycleIndex], ...updatedItem };
          break;
        }
      }
    } else if (editContext?.type === 'week') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          const weekIndex = cycle.weeks.findIndex(w => w.id === updatedItem.id);
          if (weekIndex !== -1) {
            cycle.weeks[weekIndex] = { ...cycle.weeks[weekIndex], ...updatedItem };
            break;
          }
        }
      }
    } else if (editContext?.type === 'day') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          for (const week of cycle.weeks) {
            const dayIndex = week.days.findIndex(d => d.id === updatedItem.id);
            if (dayIndex !== -1) {
              week.days[dayIndex] = { ...week.days[dayIndex], ...updatedItem };
              break;
            }
          }
        }
      }
    }

    onDataChange(newData);
    setEditContext(null);
  };

  const handleDelete = () => {
    if (!editContext) return;

    const newData = { ...data };
    
    if (editContext.type === 'period') {
      newData.periods = newData.periods.filter(p => p.id !== editContext.item.id);
    } else if (editContext.type === 'cycle') {
      for (const period of newData.periods) {
        period.cycles = period.cycles.filter(c => c.id !== editContext.item.id);
      }
    } else if (editContext.type === 'week') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          cycle.weeks = cycle.weeks.filter(w => w.id !== editContext.item.id);
        }
      }
    } else if (editContext.type === 'day') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          for (const week of cycle.weeks) {
            week.days = week.days.filter(d => d.id !== editContext.item.id);
          }
        }
      }
    }

    onDataChange(newData);
    setEditContext(null);
  };

  // New function to handle activity cell clicks with selection logic
  const handleActivityCellClick = (activityId: string, dayId: string, event: React.MouseEvent) => {
    const cellKey = getCellKey(activityId, dayId);
    
    if (event.shiftKey) {
      // Shift+click for range selection
      if (!selectionStartCell) {
        // Start new selection
        setSelectionStartCell({ activityId, dayId });
        setSelectedActivityCells(new Set([cellKey]));
      } else {
        // Complete range selection
        const startIndices = getActivityDayIndices(selectionStartCell.activityId, selectionStartCell.dayId);
        const endIndices = getActivityDayIndices(activityId, dayId);
        
        if (startIndices && endIndices) {
          const newSelection = new Set<string>();
          
          const minActivityIndex = Math.min(startIndices.activityIndex, endIndices.activityIndex);
          const maxActivityIndex = Math.max(startIndices.activityIndex, endIndices.activityIndex);
          const minDayIndex = Math.min(startIndices.dayIndex, endIndices.dayIndex);
          const maxDayIndex = Math.max(startIndices.dayIndex, endIndices.dayIndex);
          
          // Get all days for indexing
          const allDays: Day[] = [];
          data.periods.forEach(period => {
            period.cycles.forEach(cycle => {
              cycle.weeks.forEach(week => {
                allDays.push(...week.days);
              });
            });
          });
          
          // Select rectangular range
          for (let aIdx = minActivityIndex; aIdx <= maxActivityIndex; aIdx++) {
            for (let dIdx = minDayIndex; dIdx <= maxDayIndex; dIdx++) {
              if (activities[aIdx] && allDays[dIdx]) {
                newSelection.add(getCellKey(activities[aIdx].id, allDays[dIdx].id));
              }
            }
          }
          
          setSelectedActivityCells(newSelection);
        }
      }
    } else {
      // Regular click - clear selection and toggle cell
      setSelectedActivityCells(new Set());
      setSelectionStartCell(null);
      
      // Get all linked visits for this day
      const linkedVisits = getLinkedVisits(dayId);
      
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            cells: activity.cells.map(cell => {
              // Update the clicked cell and all linked cells
              if (cell.dayId === dayId || linkedVisits.includes(cell.dayId)) {
                return { 
                  ...cell, 
                  isActive: !cell.isActive,
                  // Clear visit type and footnote when deactivating
                  visitType: cell.isActive ? undefined : cell.visitType,
                  footnote: cell.isActive ? undefined : cell.footnote,
                  customText: cell.isActive ? undefined : cell.customText
                };
              }
              return cell;
            })
          };
        }
        return activity;
      }));
    }
  };

  const handleActivityCellRightClick = (e: React.MouseEvent, activityId: string, dayId: string) => {
    e.preventDefault();
    
    const cellKey = getCellKey(activityId, dayId);
    
    // If right-clicking on a non-selected cell, clear selection and select this cell
    if (!selectedActivityCells.has(cellKey)) {
      setSelectedActivityCells(new Set([cellKey]));
      setSelectionStartCell({ activityId, dayId });
    }
    
    setContextMenuState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      clickedCell: { activityId, dayId }
    });
  };

  const handleVisitTypeSelect = (visitType: VisitType | undefined) => {
    if (!visitTypeSelector) return;
    
    // Get all linked visits for this day
    const linkedVisits = getLinkedVisits(visitTypeSelector.dayId);
    
    setActivities(prev => prev.map(activity => {
      if (activity.id === visitTypeSelector.activityId) {
        return {
          ...activity,
          cells: activity.cells.map(cell => {
            // Update the selected cell and all linked cells
            if (cell.dayId === visitTypeSelector.dayId || linkedVisits.includes(cell.dayId)) {
              return { ...cell, visitType, isActive: visitType ? true : cell.isActive };
            }
            return cell;
          })
        };
      }
      return activity;
    }));
    
    setVisitTypeSelector(null);
  };

  // New function to handle custom text changes
  const handleActivityCellCustomTextChange = (activityId: string, dayId: string, newText: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          cells: activity.cells.map(cell => {
            if (cell.dayId === dayId) {
              return { ...cell, customText: newText };
            }
            return cell;
          })
        };
      }
      return activity;
    }));
  };

  // New function to merge selected cells
  const mergeSelectedCells = () => {
    if (selectedActivityCells.size < 2) return;
    
    // Parse selected cells to get activity and day indices
    const selectedCellsData = Array.from(selectedActivityCells).map(key => {
      const { activityId, dayId } = parseCellKey(key);
      const indices = getActivityDayIndices(activityId, dayId);
      return { activityId, dayId, indices };
    }).filter(item => item.indices !== null);
    
    if (selectedCellsData.length === 0) return;
    
    // Find the bounds of the selection
    const activityIndices = selectedCellsData.map(item => item.indices!.activityIndex);
    const dayIndices = selectedCellsData.map(item => item.indices!.dayIndex);
    
    const minActivityIndex = Math.min(...activityIndices);
    const maxActivityIndex = Math.max(...activityIndices);
    const minDayIndex = Math.min(...dayIndices);
    const maxDayIndex = Math.max(...dayIndices);
    
    const colspan = maxDayIndex - minDayIndex + 1;
    const rowspan = maxActivityIndex - minActivityIndex + 1;
    
    // Get all days for indexing
    const allDays: Day[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDays.push(...week.days);
        });
      });
    });
    
    // Find the top-left cell (main cell)
    const mainActivityId = activities[minActivityIndex].id;
    const mainDayId = allDays[minDayIndex].id;
    
    setActivities(prev => prev.map((activity, activityIndex) => {
      return {
        ...activity,
        cells: activity.cells.map((cell, cellIndex) => {
          const dayIndex = allDays.findIndex(d => d.id === cell.dayId);
          
          // Check if this cell is within the merge area
          if (activityIndex >= minActivityIndex && activityIndex <= maxActivityIndex &&
              dayIndex >= minDayIndex && dayIndex <= maxDayIndex) {
            
            if (activity.id === mainActivityId && cell.dayId === mainDayId) {
              // This is the main cell
              return {
                ...cell,
                colspan,
                rowspan,
                customText: cell.customText || 'Continuous',
                isActive: true
              };
            } else {
              // This is a placeholder cell
              return {
                ...cell,
                isMergedPlaceholder: true,
                isActive: false,
                visitType: undefined,
                footnote: undefined,
                customText: undefined
              };
            }
          }
          
          return cell;
        })
      };
    }));
    
    // Clear selection
    setSelectedActivityCells(new Set());
    setSelectionStartCell(null);
  };

  // New function to unmerge a cell
  const unmergeCell = (activityId: string, dayId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          cells: activity.cells.map(cell => {
            if (cell.dayId === dayId) {
              // Reset the main merged cell
              return {
                ...cell,
                colspan: undefined,
                rowspan: undefined
              };
            }
            return cell;
          })
        };
      } else {
        // Reset any placeholder cells that were part of this merge
        return {
          ...activity,
          cells: activity.cells.map(cell => {
            if (cell.isMergedPlaceholder) {
              // We need to check if this placeholder was part of the unmerged cell
              // For simplicity, we'll reset all placeholders - in a real app you'd track this more precisely
              return {
                ...cell,
                isMergedPlaceholder: false
              };
            }
            return cell;
          })
        };
      }
    }));
  };

  // New function to activate selected cells
  const activateSelectedCells = (visitType?: VisitType) => {
    if (selectedActivityCells.size === 0) return;
    
    setActivities(prev => prev.map(activity => {
      return {
        ...activity,
        cells: activity.cells.map(cell => {
          const cellKey = getCellKey(activity.id, cell.dayId);
          if (selectedActivityCells.has(cellKey)) {
            return {
              ...cell,
              isActive: true,
              visitType,
              footnote: undefined,
              customText: undefined
            };
          }
          return cell;
        })
      };
    }));
    
    // Clear selection
    setSelectedActivityCells(new Set());
    setSelectionStartCell(null);
  };

  // New function to clear selected cells
  const clearSelectedCells = () => {
    if (selectedActivityCells.size === 0) return;
    
    setActivities(prev => prev.map(activity => {
      return {
        ...activity,
        cells: activity.cells.map(cell => {
          const cellKey = getCellKey(activity.id, cell.dayId);
          if (selectedActivityCells.has(cellKey)) {
            return {
              ...cell,
              isActive: false,
              visitType: undefined,
              footnote: undefined,
              customText: undefined
            };
          }
          return cell;
        })
      };
    }));
    
    // Clear selection
    setSelectedActivityCells(new Set());
    setSelectionStartCell(null);
  };

  const handleCommentClick = (
    e: React.MouseEvent,
    cellId: string,
    cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day'
  ) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    openCommentModal(cellId, cellType, {
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const getActivityCell = (activityId: string, dayId: string): ActivityCell | undefined => {
    const activity = activities.find(a => a.id === activityId);
    return activity?.cells.find(c => c.dayId === dayId);
  };

  // Create hover state for timeline items
  const hoveredItems = {
    period: hoveredCell?.type === 'period' ? hoveredCell.id : null,
    cycle: hoveredCell?.type === 'cycle' ? hoveredCell.id : null,
    week: hoveredCell?.type === 'week' ? hoveredCell.id : null,
    day: hoveredCell?.type === 'day' ? hoveredCell.id : null
  };

  const handleItemHover = (type: EditableItemType, id: string | null) => {
    if (id) {
      setHoveredCell({ type, id, side: 'left' });
    } else {
      setHoveredCell(null);
    }
  };

  return (
    <>
      <div className="flex flex-1 bg-gray-50 w-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <TableHeader
              totalDays={getTotalDays()}
              commentStats={commentStats}
              selectedCellsCount={selectedActivityCells.size}
              dragState={dragState}
              showMoveSuccess={showMoveSuccess}
              canUndo={canUndo}
              historyLength={history.length}
              onUndo={undo}
            />
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <TimelineHeaderSection
                  data={data}
                 headers={headerManagement.headers}
                  dragState={dragState}
                  hoveredItems={hoveredItems}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDropWithAnimation}
                  onItemHover={handleItemHover}
                  onItemClick={handleCellClick}
                  onAddItem={handleAddItem}
                  setHoveredDropZone={setHoveredDropZone}
                  validateDrop={validateDrop}
                  hasComment={hasComment}
                  onCommentClick={handleCommentClick}
                 visibleHeaders={headerManagement.visibleHeaders}
                 editingHeaderId={headerManagement.editingHeaderId}
                 startEditingHeader={headerManagement.startEditingHeader}
                 saveHeaderLabel={headerManagement.saveHeaderLabel}
                 cancelEditingHeader={headerManagement.cancelEditingHeader}
                 hideHeader={headerManagement.hideHeader}
                />
                
                <tbody>
                  <StaticRowsSection
                    data={data}
                    isVisitLinked={isVisitLinked}
                    getLinkedVisits={getLinkedVisits}
                    getVisitLinkInfo={getVisitLinkInfo}
                    shouldHighlightVisit={shouldHighlightVisit}
                    handleVisitHover={handleVisitHover}
                  />
                  
                  <ActivityRowsSection
                    data={data}
                    activities={activities}
                    editingActivity={editingActivity}
                    hoveredActivityRow={hoveredActivityRow}
                    selectedActivityCells={selectedActivityCells}
                    getTotalDays={getTotalDays}
                    getActivityCell={getActivityCell}
                    getCellKey={getCellKey}
                    isVisitLinked={isVisitLinked}
                    shouldHighlightActivityCell={shouldHighlightActivityCell}
                    hasComment={hasComment}
                    onActivityEdit={handleActivityEdit}
                    onActivitySave={handleActivitySave}
                    onActivityCancel={handleActivityCancel}
                    onActivityRemove={handleRemoveActivity}
                    onActivityCellClick={handleActivityCellClick}
                    onActivityCellRightClick={handleActivityCellRightClick}
                    onActivityCellCustomTextChange={handleActivityCellCustomTextChange}
                    onCommentClick={handleCommentClick}
                    onActivityCellHover={handleActivityCellHover}
                    onActivityRowHover={setHoveredActivityRow}
                    onAddActivity={handleAddActivity}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {editContext && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setEditContext(null)}
            />
            {/* Edit Panel */}
            <EditPanel
              context={editContext}
              onSave={handleEditSave}
              onDelete={handleDelete}
              onCancel={() => setEditContext(null)}
            />
          </>
        )}
      </div>
      
      <CommentModal
        isOpen={commentModal.isOpen}
        position={commentModal.position}
        cellId={commentModal.cellId}
        cellType={commentModal.cellType}
        existingComment={commentModal.existingComment}
        onSave={saveComment}
        onDelete={deleteComment}
        onClose={closeCommentModal}
      />
      
      <VisitTypeSelector
        isOpen={visitTypeSelector?.isOpen || false}
        position={visitTypeSelector?.position || { x: 0, y: 0 }}
        currentVisitType={visitTypeSelector ? getActivityCell(visitTypeSelector.activityId, visitTypeSelector.dayId)?.visitType : undefined}
        onSelect={handleVisitTypeSelect}
        onClose={() => setVisitTypeSelector(null)}
      />
      
      <ActivityCellContextMenu
        isOpen={contextMenuState.isOpen}
        position={{ x: contextMenuState.x, y: contextMenuState.y }}
        selectedCells={selectedActivityCells}
        clickedCell={contextMenuState.clickedCell}
        isMergedCell={contextMenuState.clickedCell ? isCellMerged(contextMenuState.clickedCell.activityId, contextMenuState.clickedCell.dayId) : false}
        onMerge={mergeSelectedCells}
        onUnmerge={() => {
          if (contextMenuState.clickedCell) {
            unmergeCell(contextMenuState.clickedCell.activityId, contextMenuState.clickedCell.dayId);
          }
        }}
        onActivateSelected={activateSelectedCells}
        onClearSelected={clearSelectedCells}
        onSetVisitTypeForSingleCell={() => {
          if (contextMenuState.clickedCell) {
            setVisitTypeSelector({
              isOpen: true,
              position: { x: contextMenuState.x, y: contextMenuState.y },
              activityId: contextMenuState.clickedCell.activityId,
              dayId: contextMenuState.clickedCell.dayId
            });
          }
        }}
        onClose={() => setContextMenuState({ isOpen: false, x: 0, y: 0, clickedCell: null })}
      />
      
      <EmptyGroupModal
        isOpen={!!emptyGroup}
        groupName={emptyGroup?.name || ''}
        groupType={emptyGroup?.type || 'day'}
        onKeepEmpty={handleKeepEmptyGroup}
        onDelete={handleDeleteEmptyGroup}
        onClose={closeEmptyGroupModal}
      />
    </>
  );
};