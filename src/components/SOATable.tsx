import React, { useState, useCallback, useMemo } from 'react';
import { SOAData, ActivityData, ActivityGroup, ActivityCell, EditContext, EditableItemType, VisitType, TimeRelativeCell, TimeWindowCell, TimeOfDayCell } from '../types/soa';
import { useDragDrop } from '../hooks/useDragDrop';
import { useComments } from '../hooks/useComments';
import { useVisitLinks } from '../hooks/useVisitLinks';
import { useTimelineHeaderManagement } from '../hooks/useTimelineHeaderManagement';
import { generateSampleData, generateEmptyData } from '../utils/presetData';
import { GROUP_COLORS } from '../utils/constants';

// Component imports
import { TableHeader } from './molecules/TableHeader';
import { TimelineHeaderSection } from './organisms/TimelineHeaderSection';
import { StaticRowsSection } from './organisms/StaticRowsSection';
import { ActivityRowsSection } from './organisms/ActivityRowsSection';
import { EditPanel } from './EditPanel';
import { CommentModal } from './CommentModal';
import { EmptyGroupModal } from './EmptyGroupModal';
import { ActivityCellContextMenu } from './ActivityCellContextMenu';
import { ActivityHeaderContextMenu } from './ActivityHeaderContextMenu';
import { VisitTypeSelector } from './VisitTypeSelector';
import { TextInputModal } from './TextInputModal';
import { VisitLinkPanel } from './VisitLinkPanel';
import { TimelineHeaderSettingsModal } from './TimelineHeaderSettingsModal';

interface SOATableProps {
  data: SOAData;
  fullData: SOAData;
  onDataChange: (data: SOAData) => void;
  headerManagement: ReturnType<typeof useTimelineHeaderManagement>;
}

export const SOATable: React.FC<SOATableProps> = ({ 
  data, 
  fullData, 
  onDataChange, 
  headerManagement 
}) => {
  // Initialize drag and drop with fullData instead of data
  const dragDropHook = useDragDrop(fullData, onDataChange);
  const commentsHook = useComments();
  const visitLinksHook = useVisitLinks(fullData, onDataChange);

  // State management
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const [selectedActivityCells, setSelectedActivityCells] = useState<Set<string>>(new Set());
  const [selectedTimeWindowCells, setSelectedTimeWindowCells] = useState<Set<string>>(new Set());
  const [selectedActivityHeaders, setSelectedActivityHeaders] = useState<Set<string>>(new Set());
  const [lastSelectedCell, setLastSelectedCell] = useState<string | null>(null);
  const [lastSelectedTimeWindowCell, setLastSelectedTimeWindowCell] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [hoveredActivityRow, setHoveredActivityRow] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showMoveSuccess, setShowMoveSuccess] = useState(false);
  const [hoveredItems, setHoveredItems] = useState<{
    period: string | null;
    cycle: string | null;
    week: string | null;
    day: string | null;
  }>({
    period: null,
    cycle: null,
    week: null,
    day: null
  });

  // Context menus and modals
  const [activityCellContextMenu, setActivityCellContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    clickedCell: { activityId: string; dayId: string } | null;
    clickedTimeWindowCell: string | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    clickedCell: null,
    clickedTimeWindowCell: null
  });

  const [activityHeaderContextMenu, setActivityHeaderContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    clickedActivityId: string | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    clickedActivityId: null
  });

  const [visitTypeSelector, setVisitTypeSelector] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    cellKey: string | null;
    currentVisitType?: VisitType;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    cellKey: null
  });

  const [textInputModal, setTextInputModal] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    cellKey: string | null;
    currentText?: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    cellKey: null
  });

  const [visitLinkPanel, setVisitLinkPanel] = useState<{
    isOpen: boolean;
    currentDayId: string | null;
  }>({
    isOpen: false,
    currentDayId: null
  });

  const [headerSettingsModal, setHeaderSettingsModal] = useState(false);

  // Helper functions that work with fullData
  const getCellKey = useCallback((activityId: string, dayId: string) => {
    return `${activityId}:${dayId}`;
  }, []);

  const getActivityCell = useCallback((activityId: string, dayId: string): ActivityCell | undefined => {
    const activity = fullData.activities?.find(a => a.id === activityId);
    return activity?.cells.find(cell => cell.dayId === dayId);
  }, [fullData.activities]);

  const getTotalDays = useCallback(() => {
    return fullData.periods.reduce((total, period) => {
      return total + period.cycles.reduce((cycleTotal, cycle) => {
        return cycleTotal + cycle.weeks.reduce((weekTotal, week) => {
          return weekTotal + week.days.length;
        }, 0);
      }, 0);
    }, 0);
  }, [fullData.periods]);

  const getAllDays = useCallback(() => {
    const allDays: any[] = [];
    fullData.periods.forEach(period => {
      period.cycles.forEach(cycle => {
        cycle.weeks.forEach(week => {
          allDays.push(...week.days);
        });
      });
    });
    return allDays;
  }, [fullData.periods]);

  // Data modification functions that work with fullData
  const updateFullData = useCallback((updater: (data: SOAData) => SOAData) => {
    const newData = updater(JSON.parse(JSON.stringify(fullData)));
    onDataChange(newData);
  }, [fullData, onDataChange]);

  const updateActivityCell = useCallback((activityId: string, dayId: string, updates: Partial<ActivityCell>) => {
    updateFullData(data => {
      const activity = data.activities?.find(a => a.id === activityId);
      if (activity) {
        const cellIndex = activity.cells.findIndex(cell => cell.dayId === dayId);
        if (cellIndex !== -1) {
          activity.cells[cellIndex] = { ...activity.cells[cellIndex], ...updates };
        } else {
          activity.cells.push({
            dayId,
            isActive: false,
            ...updates
          });
        }
      }
      return data;
    });
  }, [updateFullData]);

  const updateTimeWindowCell = useCallback((dayId: string, updates: Partial<TimeWindowCell>) => {
    updateFullData(data => {
      if (!data.timeWindowCells) data.timeWindowCells = [];
      const cellIndex = data.timeWindowCells.findIndex(cell => cell.dayId === dayId);
      if (cellIndex !== -1) {
        data.timeWindowCells[cellIndex] = { ...data.timeWindowCells[cellIndex], ...updates };
      } else {
        data.timeWindowCells.push({
          id: `time-window-${dayId}`,
          dayId,
          value: 24,
          ...updates
        });
      }
      return data;
    });
  }, [updateFullData]);

  // Activity cell operations
  const handleActivityCellClick = useCallback((activityId: string, dayId: string, event: React.MouseEvent) => {
    const cellKey = getCellKey(activityId, dayId);
    
    if (event.shiftKey && lastSelectedCell) {
      // Range selection logic
      const allCells: string[] = [];
      fullData.periods.forEach(period => {
        period.cycles.forEach(cycle => {
          cycle.weeks.forEach(week => {
            week.days.forEach(day => {
              fullData.activities?.forEach(activity => {
                allCells.push(getCellKey(activity.id, day.id));
              });
            });
          });
        });
      });

      const startIndex = allCells.indexOf(lastSelectedCell);
      const endIndex = allCells.indexOf(cellKey);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const rangeStart = Math.min(startIndex, endIndex);
        const rangeEnd = Math.max(startIndex, endIndex);
        const rangeCells = allCells.slice(rangeStart, rangeEnd + 1);
        
        setSelectedActivityCells(new Set(rangeCells));
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedActivityCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey);
        } else {
          newSet.add(cellKey);
        }
        return newSet;
      });
    } else {
      // Single select and toggle activation
      const cellData = getActivityCell(activityId, dayId);
      const newActiveState = !cellData?.isActive;
      
      updateActivityCell(activityId, dayId, { isActive: newActiveState });
      setSelectedActivityCells(new Set([cellKey]));
    }
    
    setLastSelectedCell(cellKey);
  }, [getCellKey, lastSelectedCell, fullData, getActivityCell, updateActivityCell]);

  const handleActivityCellRightClick = useCallback((e: React.MouseEvent, activityId: string, dayId: string) => {
    e.preventDefault();
    const cellKey = getCellKey(activityId, dayId);
    
    if (!selectedActivityCells.has(cellKey)) {
      setSelectedActivityCells(new Set([cellKey]));
    }
    
    setActivityCellContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      clickedCell: { activityId, dayId },
      clickedTimeWindowCell: null
    });
  }, [getCellKey, selectedActivityCells]);

  const handleTimeWindowCellClick = useCallback((dayId: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedTimeWindowCell) {
      // Range selection for time window cells
      const allDays = getAllDays();
      const startIndex = allDays.findIndex(day => day.id === lastSelectedTimeWindowCell);
      const endIndex = allDays.findIndex(day => day.id === dayId);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const rangeStart = Math.min(startIndex, endIndex);
        const rangeEnd = Math.max(startIndex, endIndex);
        const rangeDays = allDays.slice(rangeStart, rangeEnd + 1);
        
        setSelectedTimeWindowCells(new Set(rangeDays.map(day => day.id)));
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedTimeWindowCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dayId)) {
          newSet.delete(dayId);
        } else {
          newSet.add(dayId);
        }
        return newSet;
      });
    } else {
      // Single select
      setSelectedTimeWindowCells(new Set([dayId]));
    }
    
    setLastSelectedTimeWindowCell(dayId);
  }, [lastSelectedTimeWindowCell, getAllDays]);

  const handleTimeWindowCellRightClick = useCallback((e: React.MouseEvent, dayId: string) => {
    e.preventDefault();
    
    if (!selectedTimeWindowCells.has(dayId)) {
      setSelectedTimeWindowCells(new Set([dayId]));
    }
    
    setActivityCellContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      clickedCell: null,
      clickedTimeWindowCell: dayId
    });
  }, [selectedTimeWindowCells]);

  // Merge operations
  const handleMergeActivityCells = useCallback(() => {
    if (selectedActivityCells.size < 2) return;

    const cellKeys = Array.from(selectedActivityCells);
    const cells = cellKeys.map(key => {
      const [activityId, dayId] = key.split(':');
      return { activityId, dayId, cell: getActivityCell(activityId, dayId) };
    }).filter(item => item.cell);

    if (cells.length < 2) return;

    // Group by activity
    const cellsByActivity = cells.reduce((acc, { activityId, dayId, cell }) => {
      if (!acc[activityId]) acc[activityId] = [];
      acc[activityId].push({ dayId, cell });
      return acc;
    }, {} as Record<string, Array<{ dayId: string; cell: ActivityCell }>>);

    updateFullData(data => {
      Object.entries(cellsByActivity).forEach(([activityId, activityCells]) => {
        if (activityCells.length < 2) return;

        const activity = data.activities?.find(a => a.id === activityId);
        if (!activity) return;

        // Sort cells by day order
        const allDays = getAllDays();
        const sortedCells = activityCells.sort((a, b) => {
          const aIndex = allDays.findIndex(day => day.id === a.dayId);
          const bIndex = allDays.findIndex(day => day.id === b.dayId);
          return aIndex - bIndex;
        });

        const firstCell = sortedCells[0];
        const colspan = sortedCells.length;

        // Update first cell
        const firstCellIndex = activity.cells.findIndex(cell => cell.dayId === firstCell.dayId);
        if (firstCellIndex !== -1) {
          activity.cells[firstCellIndex] = {
            ...activity.cells[firstCellIndex],
            colspan,
            customText: 'Continuous'
          };
        }

        // Mark other cells as merged placeholders
        sortedCells.slice(1).forEach(({ dayId }) => {
          const cellIndex = activity.cells.findIndex(cell => cell.dayId === dayId);
          if (cellIndex !== -1) {
            activity.cells[cellIndex] = {
              ...activity.cells[cellIndex],
              isMergedPlaceholder: true
            };
          }
        });
      });

      return data;
    });

    setSelectedActivityCells(new Set());
  }, [selectedActivityCells, getActivityCell, updateFullData, getAllDays]);

  const handleUnmergeActivityCells = useCallback(() => {
    if (selectedActivityCells.size !== 1) return;

    const cellKey = Array.from(selectedActivityCells)[0];
    const [activityId, dayId] = cellKey.split(':');
    const cellData = getActivityCell(activityId, dayId);

    if (!cellData?.colspan || cellData.colspan <= 1) return;

    updateFullData(data => {
      const activity = data.activities?.find(a => a.id === activityId);
      if (!activity) return data;

      // Find the merged cell
      const cellIndex = activity.cells.findIndex(cell => cell.dayId === dayId);
      if (cellIndex === -1) return data;

      const mergedCell = activity.cells[cellIndex];
      const colspan = mergedCell.colspan || 1;

      // Remove colspan and customText from the first cell
      activity.cells[cellIndex] = {
        ...mergedCell,
        colspan: undefined,
        customText: undefined
      };

      // Find and restore placeholder cells
      const allDays = getAllDays();
      const startIndex = allDays.findIndex(day => day.id === dayId);
      
      for (let i = 1; i < colspan; i++) {
        const targetDayIndex = startIndex + i;
        if (targetDayIndex < allDays.length) {
          const targetDayId = allDays[targetDayIndex].id;
          const placeholderIndex = activity.cells.findIndex(cell => 
            cell.dayId === targetDayId && cell.isMergedPlaceholder
          );
          
          if (placeholderIndex !== -1) {
            activity.cells[placeholderIndex] = {
              ...activity.cells[placeholderIndex],
              isMergedPlaceholder: undefined
            };
          }
        }
      }

      return data;
    });

    setSelectedActivityCells(new Set());
  }, [selectedActivityCells, getActivityCell, updateFullData, getAllDays]);

  const handleMergeTimeWindowCells = useCallback(() => {
    if (selectedTimeWindowCells.size < 2) return;

    const dayIds = Array.from(selectedTimeWindowCells);
    const allDays = getAllDays();
    
    // Sort by day order
    const sortedDayIds = dayIds.sort((a, b) => {
      const aIndex = allDays.findIndex(day => day.id === a);
      const bIndex = allDays.findIndex(day => day.id === b);
      return aIndex - bIndex;
    });

    const firstDayId = sortedDayIds[0];
    const colspan = sortedDayIds.length;

    updateFullData(data => {
      if (!data.timeWindowCells) data.timeWindowCells = [];

      // Update first cell
      const firstCellIndex = data.timeWindowCells.findIndex(cell => cell.dayId === firstDayId);
      if (firstCellIndex !== -1) {
        data.timeWindowCells[firstCellIndex] = {
          ...data.timeWindowCells[firstCellIndex],
          colspan,
          customText: 'Continuous'
        };
      } else {
        data.timeWindowCells.push({
          id: `time-window-${firstDayId}`,
          dayId: firstDayId,
          value: 24,
          colspan,
          customText: 'Continuous'
        });
      }

      // Mark other cells as merged placeholders
      sortedDayIds.slice(1).forEach(dayId => {
        const cellIndex = data.timeWindowCells!.findIndex(cell => cell.dayId === dayId);
        if (cellIndex !== -1) {
          data.timeWindowCells![cellIndex] = {
            ...data.timeWindowCells![cellIndex],
            isMergedPlaceholder: true
          };
        } else {
          data.timeWindowCells!.push({
            id: `time-window-${dayId}`,
            dayId,
            value: 24,
            isMergedPlaceholder: true
          });
        }
      });

      return data;
    });

    setSelectedTimeWindowCells(new Set());
  }, [selectedTimeWindowCells, getAllDays, updateFullData]);

  const handleUnmergeTimeWindowCells = useCallback(() => {
    if (selectedTimeWindowCells.size !== 1) return;

    const dayId = Array.from(selectedTimeWindowCells)[0];
    const cellData = fullData.timeWindowCells?.find(cell => cell.dayId === dayId);

    if (!cellData?.colspan || cellData.colspan <= 1) return;

    updateFullData(data => {
      if (!data.timeWindowCells) return data;

      const cellIndex = data.timeWindowCells.findIndex(cell => cell.dayId === dayId);
      if (cellIndex === -1) return data;

      const mergedCell = data.timeWindowCells[cellIndex];
      const colspan = mergedCell.colspan || 1;

      // Remove colspan and customText from the first cell
      data.timeWindowCells[cellIndex] = {
        ...mergedCell,
        colspan: undefined,
        customText: undefined
      };

      // Find and restore placeholder cells
      const allDays = getAllDays();
      const startIndex = allDays.findIndex(day => day.id === dayId);
      
      for (let i = 1; i < colspan; i++) {
        const targetDayIndex = startIndex + i;
        if (targetDayIndex < allDays.length) {
          const targetDayId = allDays[targetDayIndex].id;
          const placeholderIndex = data.timeWindowCells!.findIndex(cell => 
            cell.dayId === targetDayId && cell.isMergedPlaceholder
          );
          
          if (placeholderIndex !== -1) {
            data.timeWindowCells![placeholderIndex] = {
              ...data.timeWindowCells![placeholderIndex],
              isMergedPlaceholder: undefined
            };
          }
        }
      }

      return data;
    });

    setSelectedTimeWindowCells(new Set());
  }, [selectedTimeWindowCells, fullData.timeWindowCells, updateFullData, getAllDays]);

  // Bulk operations
  const handleActivateSelectedCells = useCallback((visitType?: VisitType) => {
    selectedActivityCells.forEach(cellKey => {
      const [activityId, dayId] = cellKey.split(':');
      updateActivityCell(activityId, dayId, {
        isActive: true,
        visitType
      });
    });
    setSelectedActivityCells(new Set());
  }, [selectedActivityCells, updateActivityCell]);

  const handleClearSelectedCells = useCallback(() => {
    selectedActivityCells.forEach(cellKey => {
      const [activityId, dayId] = cellKey.split(':');
      updateActivityCell(activityId, dayId, {
        isActive: false,
        visitType: undefined,
        footnote: undefined,
        customText: undefined
      });
    });
    setSelectedActivityCells(new Set());
  }, [selectedActivityCells, updateActivityCell]);

  // Activity management
  const handleAddActivity = useCallback(() => {
    const newActivityId = `activity-${Date.now()}`;
    const allDays = getAllDays();
    
    updateFullData(data => {
      if (!data.activities) data.activities = [];
      
      const newActivity: ActivityData = {
        id: newActivityId,
        description: 'New Activity',
        category: 'other',
        cells: allDays.map(day => ({
          dayId: day.id,
          isActive: false
        }))
      };
      
      data.activities.push(newActivity);
      return data;
    });
  }, [getAllDays, updateFullData]);

  const handleActivityEdit = useCallback((activityId: string) => {
    setEditingActivity(activityId);
  }, []);

  const handleActivitySave = useCallback((activityId: string, newDescription: string) => {
    updateFullData(data => {
      const activity = data.activities?.find(a => a.id === activityId);
      if (activity) {
        activity.description = newDescription;
      }
      return data;
    });
    setEditingActivity(null);
  }, [updateFullData]);

  const handleActivityCancel = useCallback(() => {
    setEditingActivity(null);
  }, []);

  const handleActivityRemove = useCallback((activityId: string) => {
    updateFullData(data => {
      if (data.activities) {
        data.activities = data.activities.filter(a => a.id !== activityId);
      }
      return data;
    });
  }, [updateFullData]);

  // Activity header selection
  const handleActivityHeaderClick = useCallback((activityId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
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
      setSelectedActivityHeaders(new Set([activityId]));
    }
  }, []);

  const handleActivityHeaderRightClick = useCallback((e: React.MouseEvent, activityId: string) => {
    e.preventDefault();
    
    if (!selectedActivityHeaders.has(activityId)) {
      setSelectedActivityHeaders(new Set([activityId]));
    }
    
    setActivityHeaderContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      clickedActivityId: activityId
    });
  }, [selectedActivityHeaders]);

  // Activity grouping
  const handleGroupActivities = useCallback(() => {
    if (selectedActivityHeaders.size < 2) return;

    const groupId = `group-${Date.now()}`;
    const selectedActivityIds = Array.from(selectedActivityHeaders);
    
    updateFullData(data => {
      // Create new group
      if (!data.activityGroups) data.activityGroups = [];
      
      const newGroup: ActivityGroup = {
        id: groupId,
        name: 'New Group',
        color: GROUP_COLORS[data.activityGroups.length % GROUP_COLORS.length],
        activityIds: selectedActivityIds
      };
      
      data.activityGroups.push(newGroup);
      
      // Update activities to reference the group
      if (data.activities) {
        data.activities.forEach(activity => {
          if (selectedActivityIds.includes(activity.id)) {
            activity.groupId = groupId;
          }
        });
      }
      
      return data;
    });
    
    setSelectedActivityHeaders(new Set());
  }, [selectedActivityHeaders, updateFullData]);

  const handleUngroupActivities = useCallback((groupId: string) => {
    updateFullData(data => {
      // Remove group reference from activities
      if (data.activities) {
        data.activities.forEach(activity => {
          if (activity.groupId === groupId) {
            delete activity.groupId;
          }
        });
      }
      
      // Remove group
      if (data.activityGroups) {
        data.activityGroups = data.activityGroups.filter(g => g.id !== groupId);
      }
      
      return data;
    });
  }, [updateFullData]);

  const handleRenameGroup = useCallback((groupId: string, newName: string) => {
    updateFullData(data => {
      const group = data.activityGroups?.find(g => g.id === groupId);
      if (group) {
        group.name = newName;
      }
      return data;
    });
  }, [updateFullData]);

  const handleChangeGroupColor = useCallback((groupId: string, newColor: string) => {
    updateFullData(data => {
      const group = data.activityGroups?.find(g => g.id === groupId);
      if (group) {
        group.color = newColor;
      }
      return data;
    });
  }, [updateFullData]);

  // Static cell operations
  const handleStaticCellClick = useCallback((dayId: string, content: string, type: EditableItemType) => {
    // Find the item based on type and dayId
    let item: any = null;
    
    if (type === 'time-relative-cell') {
      item = fullData.timeRelativeCells?.find(cell => cell.dayId === dayId) || {
        id: `time-relative-${dayId}`,
        dayId,
        value: parseInt(content) || 24
      };
    } else if (type === 'time-window-cell') {
      item = fullData.timeWindowCells?.find(cell => cell.dayId === dayId) || {
        id: `time-window-${dayId}`,
        dayId,
        value: parseInt(content) || 24
      };
    } else if (type === 'time-of-day-cell') {
      item = fullData.timeOfDayCells?.find(cell => cell.dayId === dayId) || {
        id: `time-of-day-${dayId}`,
        dayId,
        value: content || 'Morning'
      };
    }
    
    if (item) {
      setEditContext({
        type,
        item
      });
    }
  }, [fullData]);

  // Edit panel operations
  const handleEditSave = useCallback((updatedItem: any) => {
    if (!editContext) return;

    updateFullData(data => {
      if (editContext.type === 'time-relative-cell') {
        if (!data.timeRelativeCells) data.timeRelativeCells = [];
        const index = data.timeRelativeCells.findIndex(cell => cell.id === updatedItem.id);
        if (index !== -1) {
          data.timeRelativeCells[index] = updatedItem;
        } else {
          data.timeRelativeCells.push(updatedItem);
        }
      } else if (editContext.type === 'time-window-cell') {
        if (!data.timeWindowCells) data.timeWindowCells = [];
        const index = data.timeWindowCells.findIndex(cell => cell.id === updatedItem.id);
        if (index !== -1) {
          data.timeWindowCells[index] = updatedItem;
        } else {
          data.timeWindowCells.push(updatedItem);
        }
      } else if (editContext.type === 'time-of-day-cell') {
        if (!data.timeOfDayCells) data.timeOfDayCells = [];
        const index = data.timeOfDayCells.findIndex(cell => cell.id === updatedItem.id);
        if (index !== -1) {
          data.timeOfDayCells[index] = updatedItem;
        } else {
          data.timeOfDayCells.push(updatedItem);
        }
      }
      return data;
    });

    setEditContext(null);
  }, [editContext, updateFullData]);

  const handleEditDelete = useCallback(() => {
    if (!editContext) return;
    // For static cells, we don't delete them, just reset to default values
    setEditContext(null);
  }, [editContext]);

  const handleEditCancel = useCallback(() => {
    setEditContext(null);
  }, []);

  // Timeline item operations
  const handleItemClick = useCallback((item: any, type: EditableItemType) => {
    if (headerManagement.isFocusMode) {
      // If already in focus mode, exit focus mode
      headerManagement.unfocusHeader();
    } else {
      // Enter focus mode for this item
      headerManagement.focusHeader(item.id, type);
    }
  }, [headerManagement]);

  const handleItemHover = useCallback((type: EditableItemType, id: string | null) => {
    setHoveredItems(prev => ({ ...prev, [type]: id }));
  }, []);

  const handleAddItem = useCallback((type: EditableItemType, id: string, side: 'left' | 'right') => {
    // Implementation for adding new timeline items
    console.log('Add item:', type, id, side);
  }, []);

  // Comment operations
  const handleCommentClick = useCallback((e: React.MouseEvent, cellId: string, cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day') => {
    const rect = e.currentTarget.getBoundingClientRect();
    commentsHook.openCommentModal(cellId, cellType, {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });
  }, [commentsHook]);

  // Visit type and text operations
  const handleSetVisitTypeForSingleCell = useCallback(() => {
    if (selectedActivityCells.size !== 1) return;
    
    const cellKey = Array.from(selectedActivityCells)[0];
    const [activityId, dayId] = cellKey.split(':');
    const cellData = getActivityCell(activityId, dayId);
    
    setVisitTypeSelector({
      isOpen: true,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      cellKey,
      currentVisitType: cellData?.visitType
    });
  }, [selectedActivityCells, getActivityCell]);

  const handleAddTextToSingleCell = useCallback(() => {
    if (selectedActivityCells.size !== 1) return;
    
    const cellKey = Array.from(selectedActivityCells)[0];
    const [activityId, dayId] = cellKey.split(':');
    const cellData = getActivityCell(activityId, dayId);
    
    setTextInputModal({
      isOpen: true,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      cellKey,
      currentText: cellData?.customText
    });
  }, [selectedActivityCells, getActivityCell]);

  const handleVisitTypeSelect = useCallback((visitType: VisitType | undefined) => {
    if (!visitTypeSelector.cellKey) return;
    
    const [activityId, dayId] = visitTypeSelector.cellKey.split(':');
    updateActivityCell(activityId, dayId, { visitType });
    
    setVisitTypeSelector(prev => ({ ...prev, isOpen: false }));
  }, [visitTypeSelector.cellKey, updateActivityCell]);

  const handleTextSave = useCallback((text: string) => {
    if (!textInputModal.cellKey) return;
    
    const [activityId, dayId] = textInputModal.cellKey.split(':');
    updateActivityCell(activityId, dayId, { customText: text || undefined });
    
    setTextInputModal(prev => ({ ...prev, isOpen: false }));
  }, [textInputModal.cellKey, updateActivityCell]);

  // Custom text change for merged cells
  const handleActivityCellCustomTextChange = useCallback((activityId: string, dayId: string, newText: string) => {
    updateActivityCell(activityId, dayId, { customText: newText });
  }, [updateActivityCell]);

  const handleTimeWindowCellCustomTextChange = useCallback((dayId: string, newText: string) => {
    updateTimeWindowCell(dayId, { customText: newText });
  }, [updateTimeWindowCell]);

  // Visit link operations
  const handleOpenVisitLinkPanel = useCallback((dayId: string) => {
    setVisitLinkPanel({
      isOpen: true,
      currentDayId: dayId
    });
  }, []);

  // Data operations
  const handleLoadSampleData = useCallback(() => {
    const sampleData = generateSampleData();
    onDataChange(sampleData);
  }, [onDataChange]);

  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      const emptyData = generateEmptyData();
      onDataChange(emptyData);
    }
  }, [onDataChange]);

  // Success feedback
  const showSuccessMessage = useCallback(() => {
    setShowMoveSuccess(true);
    setTimeout(() => setShowMoveSuccess(false), 2000);
  }, []);

  // Check for merged cells
  const isMergedActivityCell = useMemo(() => {
    if (selectedActivityCells.size !== 1) return false;
    const cellKey = Array.from(selectedActivityCells)[0];
    const [activityId, dayId] = cellKey.split(':');
    const cellData = getActivityCell(activityId, dayId);
    return cellData && ((cellData.colspan && cellData.colspan > 1) || (cellData.rowspan && cellData.rowspan > 1));
  }, [selectedActivityCells, getActivityCell]);

  const isMergedTimeWindowCell = useMemo(() => {
    if (selectedTimeWindowCells.size !== 1) return false;
    const dayId = Array.from(selectedTimeWindowCells)[0];
    const cellData = fullData.timeWindowCells?.find(cell => cell.dayId === dayId);
    return cellData && ((cellData.colspan && cellData.colspan > 1) || (cellData.rowspan && cellData.rowspan > 1));
  }, [selectedTimeWindowCells, fullData.timeWindowCells]);

  // Get activities and groups from fullData for display
  const activities = useMemo(() => fullData.activities || [], [fullData.activities]);
  const activityGroups = useMemo(() => fullData.activityGroups || [], [fullData.activityGroups]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <TableHeader
        totalDays={getTotalDays()}
        commentStats={commentsHook.commentStats}
        selectedCellsCount={selectedActivityCells.size}
        selectedTimeWindowCellsCount={selectedTimeWindowCells.size}
        dragState={dragDropHook.dragState}
        showMoveSuccess={showMoveSuccess}
        canUndo={dragDropHook.canUndo}
        historyLength={dragDropHook.history.length}
        onUndo={dragDropHook.undo}
        onOpenHeaderSettings={() => setHeaderSettingsModal(true)}
        onLoadSampleData={handleLoadSampleData}
        onClearData={handleClearData}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TimelineHeaderSection
            data={data}
            headerManagement={headerManagement}
            dragState={dragDropHook.dragState}
            hoveredItems={hoveredItems}
            onDragStart={dragDropHook.handleDragStart}
            onDragEnd={dragDropHook.handleDragEnd}
            onDrop={dragDropHook.handleDrop}
            onItemHover={handleItemHover}
            onItemClick={handleItemClick}
            onAddItem={handleAddItem}
            setHoveredDropZone={dragDropHook.setHoveredDropZone}
            validateDrop={dragDropHook.validateDrop}
            hasComment={commentsHook.hasComment}
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
              selectedTimeWindowCells={selectedTimeWindowCells}
              isVisitLinked={visitLinksHook.isVisitLinked}
              getLinkedVisits={visitLinksHook.getLinkedVisits}
              getVisitLinkInfo={visitLinksHook.getVisitLinkInfo}
              shouldHighlightVisit={visitLinksHook.shouldHighlightVisit}
              handleVisitHover={visitLinksHook.handleVisitHover}
              onStaticCellClick={handleStaticCellClick}
              onTimeWindowCellClick={handleTimeWindowCellClick}
              onTimeWindowCellRightClick={handleTimeWindowCellRightClick}
              onTimeWindowCellCustomTextChange={handleTimeWindowCellCustomTextChange}
              onOpenVisitLinkPanel={handleOpenVisitLinkPanel}
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
              dragState={dragDropHook.dragState}
              getTotalDays={getTotalDays}
              getActivityCell={getActivityCell}
              getCellKey={getCellKey}
              isVisitLinked={visitLinksHook.isVisitLinked}
              shouldHighlightActivityCell={visitLinksHook.shouldHighlightActivityCell}
              hasComment={commentsHook.hasComment}
              onActivityEdit={handleActivityEdit}
              onActivitySave={handleActivitySave}
              onActivityCancel={handleActivityCancel}
              onActivityRemove={handleActivityRemove}
              onActivityHeaderClick={handleActivityHeaderClick}
              onActivityHeaderRightClick={handleActivityHeaderRightClick}
              onActivityCellClick={handleActivityCellClick}
              onActivityCellRightClick={handleActivityCellRightClick}
              onActivityCellCustomTextChange={handleActivityCellCustomTextChange}
              onCommentClick={handleCommentClick}
              onActivityCellHover={visitLinksHook.handleActivityCellHover}
              onActivityRowHover={setHoveredActivityRow}
              onAddActivity={handleAddActivity}
              onToggleGroupCollapse={(groupId) => {
                setCollapsedGroups(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(groupId)) {
                    newSet.delete(groupId);
                  } else {
                    newSet.add(groupId);
                  }
                  return newSet;
                });
              }}
              onRenameGroup={handleRenameGroup}
              onChangeGroupColor={handleChangeGroupColor}
              onUngroupGroup={handleUngroupActivities}
              onDragStart={dragDropHook.handleDragStart}
              onDragEnd={dragDropHook.handleDragEnd}
              onDrop={dragDropHook.handleDrop}
              setHoveredDropZone={dragDropHook.setHoveredDropZone}
              validateDrop={dragDropHook.validateDrop}
            />
          </tbody>
        </table>
      </div>

      {/* Edit Panel */}
      {editContext && (
        <EditPanel
          context={editContext}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          onCancel={handleEditCancel}
        />
      )}

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentsHook.commentModal.isOpen}
        position={commentsHook.commentModal.position}
        cellId={commentsHook.commentModal.cellId}
        cellType={commentsHook.commentModal.cellType}
        existingComment={commentsHook.commentModal.existingComment}
        onSave={commentsHook.saveComment}
        onDelete={commentsHook.deleteComment}
        onClose={commentsHook.closeCommentModal}
      />

      {/* Empty Group Modal */}
      {dragDropHook.emptyGroup && (
        <EmptyGroupModal
          isOpen={!!dragDropHook.emptyGroup}
          groupName={dragDropHook.emptyGroup.name}
          groupType={dragDropHook.emptyGroup.type}
          onKeepEmpty={dragDropHook.handleKeepEmptyGroup}
          onDelete={dragDropHook.handleDeleteEmptyGroup}
          onClose={dragDropHook.closeEmptyGroupModal}
        />
      )}

      {/* Activity Cell Context Menu */}
      <ActivityCellContextMenu
        isOpen={activityCellContextMenu.isOpen}
        position={activityCellContextMenu.position}
        selectedCells={selectedActivityCells}
        selectedTimeWindowCells={selectedTimeWindowCells}
        clickedCell={activityCellContextMenu.clickedCell}
        clickedTimeWindowCell={activityCellContextMenu.clickedTimeWindowCell}
        isMergedCell={isMergedActivityCell}
        isMergedTimeWindowCell={isMergedTimeWindowCell}
        onMerge={handleMergeActivityCells}
        onUnmerge={handleUnmergeActivityCells}
        onMergeTimeWindow={handleMergeTimeWindowCells}
        onUnmergeTimeWindow={handleUnmergeTimeWindowCells}
        onActivateSelected={handleActivateSelectedCells}
        onClearSelected={handleClearSelectedCells}
        onSetVisitTypeForSingleCell={handleSetVisitTypeForSingleCell}
        onAddTextToSingleCell={handleAddTextToSingleCell}
        onClose={() => setActivityCellContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Activity Header Context Menu */}
      <ActivityHeaderContextMenu
        isOpen={activityHeaderContextMenu.isOpen}
        position={activityHeaderContextMenu.position}
        selectedActivityHeaders={selectedActivityHeaders}
        clickedActivityId={activityHeaderContextMenu.clickedActivityId}
        activityGroups={activityGroups}
        activities={activities}
        onGroup={handleGroupActivities}
        onUngroup={handleUngroupActivities}
        onRename={(groupId) => {
          // Handle rename through group header context menu
          console.log('Rename group:', groupId);
        }}
        onChangeColor={(groupId) => {
          // Handle color change through group header context menu
          console.log('Change color:', groupId);
        }}
        onClose={() => setActivityHeaderContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Visit Type Selector */}
      <VisitTypeSelector
        isOpen={visitTypeSelector.isOpen}
        position={visitTypeSelector.position}
        currentVisitType={visitTypeSelector.currentVisitType}
        onSelect={handleVisitTypeSelect}
        onClose={() => setVisitTypeSelector(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={textInputModal.isOpen}
        position={textInputModal.position}
        currentText={textInputModal.currentText}
        onSave={handleTextSave}
        onClose={() => setTextInputModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Visit Link Panel */}
      <VisitLinkPanel
        isOpen={visitLinkPanel.isOpen}
        onClose={() => setVisitLinkPanel(prev => ({ ...prev, isOpen: false }))}
        currentDayId={visitLinkPanel.currentDayId || ''}
        allDays={getAllDays()}
        existingVisitLinks={fullData.visitLinks || []}
        onSaveLinks={visitLinksHook.updateVisitLinks}
        onUnlinkAll={visitLinksHook.unlinkAllVisits}
      />

      {/* Timeline Header Settings Modal */}
      <TimelineHeaderSettingsModal
        isOpen={headerSettingsModal}
        headers={headerManagement.headers}
        activeHeaders={headerManagement.headers.filter(h => h.isActive)}
        inactiveHeaders={headerManagement.headers.filter(h => !h.isActive)}
        editingHeaderId={headerManagement.editingHeaderId}
        onClose={() => setHeaderSettingsModal(false)}
        onStartEdit={headerManagement.startEditingHeader}
        onSaveLabel={headerManagement.saveHeaderLabel}
        onCancelEdit={headerManagement.cancelEditingHeader}
        onToggleVisibility={(headerId) => {
          // Handle visibility toggle
          console.log('Toggle visibility:', headerId);
        }}
        onDisableHeader={(headerId) => {
          // Handle disable header
          console.log('Disable header:', headerId);
        }}
        onEnableHeader={(headerId) => {
          // Handle enable header
          console.log('Enable header:', headerId);
        }}
      />
    </div>
  );
};