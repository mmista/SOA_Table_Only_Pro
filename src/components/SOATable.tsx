import React, { useState } from 'react';
import { SOAData, Period, Cycle, Week, Day, EditContext, EditableItemType, ActivityData, ActivityCell, VisitType } from '../types/soa';
import { EditPanel } from './EditPanel';
import { EmptyGroupModal } from './EmptyGroupModal';
import { VisitTypeSelector } from './VisitTypeSelector';
import { CommentModal } from './CommentModal';
import { ActivityCellContextMenu } from './ActivityCellContextMenu';
import { TimelineHeaderSettingsModal } from './TimelineHeaderSettingsModal';
import { ActivityHeaderContextMenu } from './ActivityHeaderContextMenu';
import { ActivityGroupHeaderContextMenu } from './ActivityGroupHeaderContextMenu';
import { ActivityGroup } from '../types/soa';
import { TableHeader } from './molecules/TableHeader';
import { TimelineHeaderSection } from './organisms/TimelineHeaderSection';
import { StaticRowsSection } from './organisms/StaticRowsSection';
import { ActivityRowsSection } from './organisms/ActivityRowsSection';
import { VisitLinkPanel } from './VisitLinkPanel';
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

// Define the state for the VisitLinkPanel
interface VisitLinkPanelState {
  isOpen: boolean;
  dayId: string | null;
}

export const SOATable: React.FC<SOATableProps> = ({ data, onDataChange, headerManagement }) => {
  const [hoveredCell, setHoveredCell] = useState<HoverState | null>(null);
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const [showMoveSuccess, setShowMoveSuccess] = useState(false);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [activityGroups, setActivityGroups] = useState<ActivityGroup[]>(data.activityGroups || []);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ description?: string }>({});
  const [hoveredActivityRow, setHoveredActivityRow] = useState<string | null>(null);
  const [showHeaderSettingsModal, setShowHeaderSettingsModal] = useState(false);
  const [visitTypeSelector, setVisitTypeSelector] = useState<{
    isOpen: boolean,
    position: { x: number, y: number },
    activityId: string,
    dayId: string,
  
  const [groupHeaderContextMenu, setGroupHeaderContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    groupId: string | null;
    groupName: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, groupId: null, groupName: '' });
  } | null>(null);
  
  // New states for cell selection and context menu
  const [selectedActivityCells, setSelectedActivityCells] = useState<Set<string>>(new Set());
  const [selectionStartCell, setSelectionStartCell] = useState<{ activityId: string; dayId: string } | null>(null);
  const [selectedTimeWindowCells, setSelectedTimeWindowCells] = useState<Set<string>>(new Set());
  const [timeWindowSelectionStart, setTimeWindowSelectionStart] = useState<string | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    clickedCell: { activityId: string; dayId: string } | null;
    clickedTimeWindowCell: string | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    clickedCell: null,
    clickedTimeWindowCell: null
  });
  
  // State for VisitLinkPanel
  const [visitLinkPanelState, setVisitLinkPanelState] = useState<VisitLinkPanelState>({ isOpen: false, dayId: null });
  
  // State for Activity Header Selection and Grouping
  const [selectedActivityHeaders, setSelectedActivityHeaders] = useState<Set<string>>(new Set());
  const [activityHeaderContextMenuState, setActivityHeaderContextMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    clickedActivityId: string | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    clickedActivityId: null
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
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
    shouldHighlightActivityCell,
    updateVisitLinks,
    unlinkAllVisits,
    cleanUpVisitLinks
  } = useVisitLinks(data, onDataChange);

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

  // Activity Header Selection and Grouping Functions
  const handleActivityHeaderClick = (activityId: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      // Shift+click for multi-selection
      setSelectedActivityHeaders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(activityId)) {
          newSet.delete(activityId);
        } else {
          newSet.add(activityId);
        }
        return newSet;
      });
    } else {
      // Regular click - select only this activity
      setSelectedActivityHeaders(new Set([activityId]));
    }
  };

  const handleActivityHeaderRightClick = (e: React.MouseEvent, activityId: string) => {
    e.preventDefault();
    
    // If right-clicking on a non-selected activity, clear selection and select this activity
    if (!selectedActivityHeaders.has(activityId)) {
      setSelectedActivityHeaders(new Set([activityId]));
    }
    
    setActivityHeaderContextMenuState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      clickedActivityId: activityId
    });
  };

  const handleActivityGroupHeaderRightClick = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    const group = activityGroups.find(g => g.id === groupId);
    setGroupHeaderContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      groupId: groupId,
      groupName: group?.name || 'Unknown Group'
    });
  };

  const generateGroupId = () => `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getNextGroupNumber = () => {
    const existingNumbers = activityGroups
      .map(group => {
        const match = group.name.match(/^Group (\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    return existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  };

  const groupSelectedActivityHeaders = () => {
    if (selectedActivityHeaders.size < 2) return;
    
    const groupId = generateGroupId();
    const groupNumber = getNextGroupNumber();
    const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const defaultColor = defaultColors[activityGroups.length % defaultColors.length];
    
    const newGroup: ActivityGroup = {
      id: groupId,
      name: `Group ${groupNumber}`,
      color: defaultColor,
      activityIds: Array.from(selectedActivityHeaders)
    };
    
    // Update activities with group ID
    setActivities(prev => prev.map(activity => 
      selectedActivityHeaders.has(activity.id) 
        ? { ...activity, groupId }
        : activity
    ));
    
    // Add new group
    setActivityGroups(prev => [...prev, newGroup]);
    
    // Clear selection
    setSelectedActivityHeaders(new Set());
  };

  const ungroupActivityGroup = (groupId: string) => {
    // Remove group ID from activities
    setActivities(prev => prev.map(activity => 
      activity.groupId === groupId 
        ? { ...activity, groupId: undefined }
        : activity
    ));
    
    // Remove group
    setActivityGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Remove from collapsed groups if it was collapsed
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
  };

  const renameActivityGroup = (groupId: string, newName: string) => {
    setActivityGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: newName }
        : group
    ));
  };

  const changeActivityGroupColor = (groupId: string, newColor: string) => {
    setActivityGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, color: newColor }
        : group
    ));
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
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

  // Function to open the VisitLinkPanel
  const openVisitLinkPanel = (dayId: string) => {
    setVisitLinkPanelState({ isOpen: true, dayId });
  };

  // Function to close the VisitLinkPanel
  const closeVisitLinkPanel = () => {
    setVisitLinkPanelState({ isOpen: false, dayId: null });
  };

  // Helper to get all day objects for the VisitLinkPanel
  const getAllDayObjects = (): Day[] => {
    const allDayObjects: Day[] = [];
    data.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDayObjects.push(...week.days);
        });
      });
    });
    return allDayObjects;
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
    } else if (editContext?.type === 'time-relative-cell') {
      if (!newData.timeRelativeCells) newData.timeRelativeCells = [];
      const cellIndex = newData.timeRelativeCells.findIndex(c => c.dayId === updatedItem.id);
      if (cellIndex !== -1) {
        newData.timeRelativeCells[cellIndex] = { ...newData.timeRelativeCells[cellIndex], value: updatedItem.value };
      } else {
        newData.timeRelativeCells.push({
          id: `time-relative-${updatedItem.id}`,
          dayId: updatedItem.id,
          value: updatedItem.value
        });
      }
    } else if (editContext?.type === 'time-window-cell') {
      if (!newData.timeWindowCells) newData.timeWindowCells = [];
      const cellIndex = newData.timeWindowCells.findIndex(c => c.dayId === updatedItem.id);
      if (cellIndex !== -1) {
        newData.timeWindowCells[cellIndex] = { ...newData.timeWindowCells[cellIndex], value: updatedItem.value };
      } else {
        newData.timeWindowCells.push({
          id: `time-window-${updatedItem.id}`,
          dayId: updatedItem.id,
          value: updatedItem.value
        });
      }
    } else if (editContext?.type === 'time-of-day-cell') {
      if (!newData.timeOfDayCells) newData.timeOfDayCells = [];
      const cellIndex = newData.timeOfDayCells.findIndex(c => c.dayId === updatedItem.id);
      if (cellIndex !== -1) {
        newData.timeOfDayCells[cellIndex] = { ...newData.timeOfDayCells[cellIndex], value: updatedItem.value };
      } else {
        newData.timeOfDayCells.push({
          id: `time-of-day-${updatedItem.id}`,
          dayId: updatedItem.id,
          value: updatedItem.value
        });
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

  const handleStaticCellClick = (dayId: string, content: string, type: EditableItemType) => {
    if (type === 'time-window-cell') {
      // Don't open edit context for time window cells, they have their own selection logic
      return;
    }
    
    if (type !== 'time-window-cell') {
      // Create a mock item for the edit context
      const item = {
        id: dayId,
        value: type === 'time-relative-cell' || type === 'time-window-cell' 
          ? parseInt(content.replace(/[^\d]/g, '')) || 0
          : content.replace('±', '').replace('h', '')
      };
      
      setEditContext({ item, type });
    }
  };

  // New function to handle time window cell clicks with selection logic
  const handleTimeWindowCellClick = (dayId: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      // Shift+click for range selection
      if (!timeWindowSelectionStart) {
        // Start new selection
        setTimeWindowSelectionStart(dayId);
        setSelectedTimeWindowCells(new Set([dayId]));
      } else {
        // Complete range selection
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
        
        const startIndex = allDays.indexOf(timeWindowSelectionStart);
        const endIndex = allDays.indexOf(dayId);
        
        if (startIndex !== -1 && endIndex !== -1) {
          const newSelection = new Set<string>();
          const minIndex = Math.min(startIndex, endIndex);
          const maxIndex = Math.max(startIndex, endIndex);
          
          for (let i = minIndex; i <= maxIndex; i++) {
            newSelection.add(allDays[i]);
          }
          
          setSelectedTimeWindowCells(newSelection);
        }
      }
    } else {
      // Regular click - clear selection
      setSelectedTimeWindowCells(new Set());
      setTimeWindowSelectionStart(null);
    }
  };

  const handleTimeWindowCellRightClick = (e: React.MouseEvent, dayId: string) => {
    e.preventDefault();
    
    // If right-clicking on a non-selected cell, clear selection and select this cell
    if (!selectedTimeWindowCells.has(dayId)) {
      setSelectedTimeWindowCells(new Set([dayId]));
      setTimeWindowSelectionStart(dayId);
    }
    
    setContextMenuState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      clickedCell: null,
      clickedTimeWindowCell: dayId
    });
  };

  // Function to merge selected time window cells
  const mergeSelectedTimeWindowCells = () => {
    if (selectedTimeWindowCells.size < 2) return;
    
    // Get all days in order
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
    
    // Find the bounds of the selection
    const selectedDayIndices = Array.from(selectedTimeWindowCells).map(dayId => allDays.indexOf(dayId)).filter(index => index !== -1);
    
    if (selectedDayIndices.length === 0) return;
    
    const minIndex = Math.min(...selectedDayIndices);
    const maxIndex = Math.max(...selectedDayIndices);
    const colspan = maxIndex - minIndex + 1;
    
    // Find the main cell (leftmost)
    const mainDayId = allDays[minIndex];
    
    // Update time window cells
    const newData = { ...data };
    if (!newData.timeWindowCells) newData.timeWindowCells = [];
    
    // Update existing cells or create new ones
    const updatedCells = [...newData.timeWindowCells];
    
    // Set main cell with colspan
    const mainCellIndex = updatedCells.findIndex(cell => cell.dayId === mainDayId);
    if (mainCellIndex !== -1) {
      updatedCells[mainCellIndex] = {
        ...updatedCells[mainCellIndex],
        colspan,
        customText: 'Continuous'
      };
    } else {
      updatedCells.push({
        id: `time-window-${mainDayId}`,
        dayId: mainDayId,
        value: 24,
        colspan,
        customText: 'Continuous'
      });
    }
    
    // Set placeholder cells
    for (let i = minIndex + 1; i <= maxIndex; i++) {
      const dayId = allDays[i];
      const cellIndex = updatedCells.findIndex(cell => cell.dayId === dayId);
      if (cellIndex !== -1) {
        updatedCells[cellIndex] = {
          ...updatedCells[cellIndex],
          isMergedPlaceholder: true
        };
      } else {
        updatedCells.push({
          id: `time-window-${dayId}`,
          dayId: dayId,
          value: 24,
          isMergedPlaceholder: true
        });
      }
    }
    
    newData.timeWindowCells = updatedCells;
    onDataChange(newData);
    
    // Clear selection
    setSelectedTimeWindowCells(new Set());
    setTimeWindowSelectionStart(null);
  };

  // Function to unmerge a time window cell
  const unmergeTimeWindowCell = (dayId: string) => {
    const newData = { ...data };
    if (!newData.timeWindowCells) return;
    
    // Find the main cell
    const mainCell = newData.timeWindowCells.find(cell => cell.dayId === dayId && cell.colspan);
    if (!mainCell) return;
    
    // Reset the main cell
    const updatedCells = newData.timeWindowCells.map(cell => {
      if (cell.dayId === dayId) {
        return {
          ...cell,
          colspan: undefined,
          customText: undefined
        };
      }
      // Reset any placeholder cells
      if (cell.isMergedPlaceholder) {
        return {
          ...cell,
          isMergedPlaceholder: false
        };
      }
      return cell;
    });
    
    newData.timeWindowCells = updatedCells;
    onDataChange(newData);
  };

  // Function to handle custom text changes for time window cells
  const handleTimeWindowCellCustomTextChange = (dayId: string, newText: string) => {
    const newData = { ...data };
    if (!newData.timeWindowCells) newData.timeWindowCells = [];
    
    const updatedCells = newData.timeWindowCells.map(cell => {
      if (cell.dayId === dayId) {
        return { ...cell, customText: newText };
      }
      return cell;
    });
    
    newData.timeWindowCells = updatedCells;
    onDataChange(newData);
  };

  return (
    <>
      <div className="flex flex-1 bg-gray-50 w-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <TableHeader
              title="SOA Builder - Prototype"
              totalDays={getTotalDays()}
              commentStats={commentStats}
              selectedCellsCount={selectedActivityCells.size}
              selectedTimeWindowCellsCount={selectedTimeWindowCells.size}
              dragState={dragState}
              showMoveSuccess={showMoveSuccess}
              canUndo={canUndo}
              historyLength={history.length}
              onUndo={undo}
              onOpenHeaderSettings={() => setShowHeaderSettingsModal(true)}
            />
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <TimelineHeaderSection
                  data={data}
                  headerManagement={headerManagement}
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
                />
                
                <tbody>
                  <StaticRowsSection
                    data={data}
                    headerManagement={headerManagement}
                    timeRelativeCells={data.timeRelativeCells || []}
                    timeWindowCells={data.timeWindowCells || []}
                    timeOfDayCells={data.timeOfDayCells || []}
                    totalColumns={getTotalDays()}
                    isVisitLinked={isVisitLinked}
                    getLinkedVisits={getLinkedVisits}
                    getVisitLinkInfo={getVisitLinkInfo}
                    shouldHighlightVisit={shouldHighlightVisit}
                    handleVisitHover={handleVisitHover}
                    onStaticCellClick={handleStaticCellClick}
                    onOpenVisitLinkPanel={openVisitLinkPanel}
                    selectedTimeWindowCells={selectedTimeWindowCells}
                    onTimeWindowCellClick={handleTimeWindowCellClick}
                    onTimeWindowCellRightClick={handleTimeWindowCellRightClick}
                    onTimeWindowCellCustomTextChange={handleTimeWindowCellCustomTextChange}
                  />
                  
                  <ActivityRowsSection
                    data={data}
                    activities={activities}
                    activityGroups={activityGroups}
                    selectedActivityHeaders={selectedActivityHeaders}
                    collapsedGroups={collapsedGroups}
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
                    onActivityHeaderClick={handleActivityHeaderClick}
                    onActivityHeaderRightClick={handleActivityHeaderRightClick}
                    onActivityCellClick={handleActivityCellClick}
                    onActivityCellRightClick={handleActivityCellRightClick}
                    onActivityCellCustomTextChange={handleActivityCellCustomTextChange}
                    onCommentClick={handleCommentClick}
                    onActivityCellHover={handleActivityCellHover}
                    onActivityRowHover={setHoveredActivityRow}
                    onAddActivity={handleAddActivity}
                    onToggleGroupCollapse={toggleGroupCollapse}
                    onRenameGroup={renameActivityGroup}
                    onChangeGroupColor={changeActivityGroupColor}
                    onUngroupGroup={ungroupActivityGroup}
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
      
      <TimelineHeaderSettingsModal
        isOpen={showHeaderSettingsModal}
        headers={headerManagement.headers}
        activeHeaders={headerManagement.activeHeaders}
        inactiveHeaders={headerManagement.inactiveHeaders}
        editingHeaderId={headerManagement.editingHeaderId}
        onClose={() => setShowHeaderSettingsModal(false)}
        onStartEdit={headerManagement.startEditingHeader}
        onSaveLabel={headerManagement.saveHeaderLabel}
        onCancelEdit={headerManagement.cancelEditingHeader}
        onToggleVisibility={(headerId) => {
          const header = headerManagement.headers.find(h => h.id === headerId);
          if (header?.isVisible) {
            headerManagement.hideHeader(headerId);
          } else {
            headerManagement.showHeader(headerId);
          }
        }}
        onDisableHeader={headerManagement.disableHeader}
        onEnableHeader={headerManagement.enableHeader}
      />
      
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
        selectedTimeWindowCells={selectedTimeWindowCells}
        clickedCell={contextMenuState.clickedCell}
        clickedTimeWindowCell={contextMenuState.clickedTimeWindowCell}
        isMergedCell={contextMenuState.clickedCell ? isCellMerged(contextMenuState.clickedCell.activityId, contextMenuState.clickedCell.dayId) : false}
        isMergedTimeWindowCell={contextMenuState.clickedTimeWindowCell ? 
          (data.timeWindowCells?.find(cell => cell.dayId === contextMenuState.clickedTimeWindowCell && cell.colspan)?.colspan || 0) > 1 : false}
        onMerge={mergeSelectedCells}
        onUnmerge={() => {
          if (contextMenuState.clickedCell) {
            unmergeCell(contextMenuState.clickedCell.activityId, contextMenuState.clickedCell.dayId);
          }
        }}
        onMergeTimeWindow={mergeSelectedTimeWindowCells}
        onUnmergeTimeWindow={() => {
          if (contextMenuState.clickedTimeWindowCell) {
            unmergeTimeWindowCell(contextMenuState.clickedTimeWindowCell);
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
        onClose={() => setContextMenuState({ isOpen: false, x: 0, y: 0, clickedCell: null, clickedTimeWindowCell: null })}
      />
      
      <ActivityHeaderContextMenu
        isOpen={activityHeaderContextMenuState.isOpen}
        position={{ x: activityHeaderContextMenuState.x, y: activityHeaderContextMenuState.y }}
        selectedActivityHeaders={selectedActivityHeaders}
        clickedActivityId={activityHeaderContextMenuState.clickedActivityId}
        activityGroups={activityGroups}
        activities={activities}
        onGroup={groupSelectedActivityHeaders}
        onUngroup={ungroupActivityGroup}
        onRename={(groupId) => {
          const group = activityGroups.find(g => g.id === groupId);
          if (group) {
            const newName = prompt('Enter new group name:', group.name);
            if (newName && newName.trim() !== group.name) {
              renameActivityGroup(groupId, newName.trim());
            }
          }
        }}
        onChangeColor={(groupId) => {
          // This will be handled by the color picker in ActivityGroupHeader
          console.log('Change color for group:', groupId);
        }}
        onClose={() => setActivityHeaderContextMenuState({ isOpen: false, x: 0, y: 0, clickedActivityId: null })}
      />
      
      <EmptyGroupModal
        isOpen={!!emptyGroup}
        groupName={emptyGroup?.name || ''}
        groupType={emptyGroup?.type || 'day'}
        onKeepEmpty={handleKeepEmptyGroup}
        onDelete={handleDeleteEmptyGroup}
        onClose={closeEmptyGroupModal}
      />

      {/* Group Header Context Menu */}
      <ActivityGroupHeaderContextMenu
        isOpen={groupHeaderContextMenu.isOpen}
        position={groupHeaderContextMenu.position}
        groupId={groupHeaderContextMenu.groupId}
        groupName={groupHeaderContextMenu.groupName}
        onUngroup={handleUngroupGroup}
        onRename={handleRenameGroup}
        onChangeColor={handleChangeGroupColor}
        onClose={() => setGroupHeaderContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Visit Link Panel */}
      <VisitLinkPanel
        isOpen={visitLinkPanelState.isOpen}
        onClose={closeVisitLinkPanel}
        currentDayId={visitLinkPanelState.dayId || ''}
        allDays={getAllDayObjects()}
        existingVisitLinks={data.visitLinks || []}
        onSaveLinks={updateVisitLinks}
        onUnlinkAll={unlinkAllVisits}
      />
    </>
  );
};