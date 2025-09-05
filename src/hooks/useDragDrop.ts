import { useState, useCallback } from 'react';
import { SOAData, Period, Cycle, Week, Day, EditableItemType } from '../types/soa';

interface DragDropState {
  isDragging: boolean;
  draggedItem: any;
  draggedType: EditableItemType;
  hoveredDropZone: string | null;
}

interface HistoryEntry {
  data: SOAData;
  action: string;
}

interface EmptyGroupInfo {
  id: string;
  name: string;
  type: EditableItemType;
}

export const useDragDrop = (data: SOAData, onDataChange: (data: SOAData) => void) => {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    draggedType: 'day',
    hoveredDropZone: null
  });
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [emptyGroup, setEmptyGroup] = useState<EmptyGroupInfo | null>(null);

  const saveToHistory = useCallback((action: string) => {
    setHistory(prev => [...prev.slice(-9), { data: JSON.parse(JSON.stringify(data)), action }]);
  }, [data]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    
    const lastEntry = history[history.length - 1];
    onDataChange(lastEntry.data);
    setHistory(prev => prev.slice(0, -1));
  }, [history, onDataChange]);

  const findEmptyParents = useCallback((newData: SOAData, draggedType: EditableItemType, draggedItemId: string) => {
    const emptyParents: EmptyGroupInfo[] = [];
    
    // Only check for empty parents if we moved a child item
    if (draggedType === 'period') return emptyParents;
    
    for (const period of newData.periods) {
      // Check for empty periods (only if we moved a cycle)
      if (draggedType === 'cycle' && period.cycles.length === 0) {
        emptyParents.push({
          id: period.id,
          name: period.name,
          type: 'period'
        });
      }
      
      for (const cycle of period.cycles) {
        // Check for empty cycles (only if we moved a week)
        if (draggedType === 'week' && cycle.weeks.length === 0) {
          emptyParents.push({
            id: cycle.id,
            name: cycle.name,
            type: 'cycle'
          });
        }
        
        for (const week of cycle.weeks) {
          // Check for empty weeks (only if we moved a day)
          if (draggedType === 'day' && week.days.length === 0) {
            emptyParents.push({
              id: week.id,
              name: week.name,
              type: 'week'
            });
          }
        }
      }
    }
    
    return emptyParents;
  }, []);

  const deleteEmptyGroup = useCallback((groupId: string, groupType: EditableItemType) => {
    const newData = JSON.parse(JSON.stringify(data));
    
    if (groupType === 'period') {
      newData.periods = newData.periods.filter((p: Period) => p.id !== groupId);
    } else if (groupType === 'cycle') {
      for (const period of newData.periods) {
        period.cycles = period.cycles.filter((c: Cycle) => c.id !== groupId);
      }
    } else if (groupType === 'week') {
      for (const period of newData.periods) {
        for (const cycle of period.cycles) {
          cycle.weeks = cycle.weeks.filter((w: Week) => w.id !== groupId);
        }
      }
    }
    
    saveToHistory(`Delete empty ${groupType}`);
    onDataChange(newData);
  }, [data, onDataChange, saveToHistory]);

  const findItemPath = useCallback((itemId: string, itemType: EditableItemType) => {
    for (let periodIndex = 0; periodIndex < data.periods.length; periodIndex++) {
      const period = data.periods[periodIndex];
      
      if (itemType === 'period' && period.id === itemId) {
        return { periodIndex };
      }
      
      for (let cycleIndex = 0; cycleIndex < period.cycles.length; cycleIndex++) {
        const cycle = period.cycles[cycleIndex];
        
        if (itemType === 'cycle' && cycle.id === itemId) {
          return { periodIndex, cycleIndex };
        }
        
        for (let weekIndex = 0; weekIndex < cycle.weeks.length; weekIndex++) {
          const week = cycle.weeks[weekIndex];
          
          if (itemType === 'week' && week.id === itemId) {
            return { periodIndex, cycleIndex, weekIndex };
          }
          
          for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];
            
            if (itemType === 'day' && day.id === itemId) {
              return { periodIndex, cycleIndex, weekIndex, dayIndex };
            }
          }
        }
      }
    }
    return null;
  }, [data]);

  const removeItem = useCallback((itemId: string, itemType: EditableItemType) => {
    const newData = JSON.parse(JSON.stringify(data));
    const path = findItemPath(itemId, itemType);
    
    if (!path) return newData;
    
    if (itemType === 'period') {
      newData.periods.splice(path.periodIndex, 1);
    } else if (itemType === 'cycle' && path.cycleIndex !== undefined) {
      newData.periods[path.periodIndex].cycles.splice(path.cycleIndex, 1);
    } else if (itemType === 'week' && path.cycleIndex !== undefined && path.weekIndex !== undefined) {
      newData.periods[path.periodIndex].cycles[path.cycleIndex].weeks.splice(path.weekIndex, 1);
    } else if (itemType === 'day' && path.cycleIndex !== undefined && path.weekIndex !== undefined && path.dayIndex !== undefined) {
      newData.periods[path.periodIndex].cycles[path.cycleIndex].weeks[path.weekIndex].days.splice(path.dayIndex, 1);
    }
    
    return newData;
  }, [data, findItemPath]);

  const insertItem = useCallback((
    item: any,
    itemType: EditableItemType,
    targetId: string,
    targetType: EditableItemType,
    position: 'before' | 'after' | 'inside'
  ): { newData: SOAData; sourceParentInfo: EmptyGroupInfo | null } => {
    const newData = JSON.parse(JSON.stringify(data));
    
    // Find source and target paths
    const sourcePath = findItemPathInData(newData, item.id, itemType);
    const targetPath = findItemPathInData(newData, targetId, targetType);
    
    if (!sourcePath || !targetPath) {
      return { newData: data, sourceParentInfo: null };
    }
    
    // Store source parent info before removal for empty check
    let sourceParentInfo: EmptyGroupInfo | null = null;
    
    // Remove item from source location and check if parent becomes empty
    if (itemType === 'period') {
      newData.periods.splice(sourcePath.periodIndex, 1);
    } else if (itemType === 'cycle' && sourcePath.cycleIndex !== undefined) {
      const sourcePeriod = newData.periods[sourcePath.periodIndex];
      sourcePeriod.cycles.splice(sourcePath.cycleIndex, 1);
      
      // Check if period becomes empty
      if (sourcePeriod.cycles.length === 0) {
        sourceParentInfo = {
          id: sourcePeriod.id,
          name: sourcePeriod.name,
          type: 'period'
        };
      }
    } else if (itemType === 'week' && sourcePath.cycleIndex !== undefined && sourcePath.weekIndex !== undefined) {
      const sourceCycle = newData.periods[sourcePath.periodIndex].cycles[sourcePath.cycleIndex];
      sourceCycle.weeks.splice(sourcePath.weekIndex, 1);
      
      // Check if cycle becomes empty
      if (sourceCycle.weeks.length === 0) {
        sourceParentInfo = {
          id: sourceCycle.id,
          name: sourceCycle.name,
          type: 'cycle'
        };
      }
    } else if (itemType === 'day' && sourcePath.cycleIndex !== undefined && sourcePath.weekIndex !== undefined && sourcePath.dayIndex !== undefined) {
      const sourceWeek = newData.periods[sourcePath.periodIndex].cycles[sourcePath.cycleIndex].weeks[sourcePath.weekIndex];
      sourceWeek.days.splice(sourcePath.dayIndex, 1);
      
      // Check if week becomes empty
      if (sourceWeek.days.length === 0) {
        sourceParentInfo = {
          id: sourceWeek.id,
          name: sourceWeek.name,
          type: 'week'
        };
      }
    }
    
    // Find target path again after source removal (indices may have shifted)
    const updatedTargetPath = findItemPathInData(newData, targetId, targetType);
    if (!updatedTargetPath) {
      return { newData: data, sourceParentInfo: null };
    }
    
    // Insert item at target location
    if (itemType === 'period') {
      let insertIndex = updatedTargetPath.periodIndex;
      if (position === 'after') insertIndex++;
      newData.periods.splice(insertIndex, 0, item);
    } else if (itemType === 'cycle') {
      if (targetType === 'period') {
        const targetPeriod = newData.periods[updatedTargetPath.periodIndex];
        const insertIndex = position === 'inside' ? targetPeriod.cycles.length : 0;
        targetPeriod.cycles.splice(insertIndex, 0, item);
      } else if (targetType === 'cycle' && updatedTargetPath.cycleIndex !== undefined) {
        let insertIndex = updatedTargetPath.cycleIndex;
        if (position === 'after') insertIndex++;
        newData.periods[updatedTargetPath.periodIndex].cycles.splice(insertIndex, 0, item);
      }
    } else if (itemType === 'week') {
      if (targetType === 'cycle' && updatedTargetPath.cycleIndex !== undefined) {
        const targetCycle = newData.periods[updatedTargetPath.periodIndex].cycles[updatedTargetPath.cycleIndex];
        const insertIndex = position === 'inside' ? targetCycle.weeks.length : 0;
        targetCycle.weeks.splice(insertIndex, 0, item);
      } else if (targetType === 'week' && updatedTargetPath.cycleIndex !== undefined && updatedTargetPath.weekIndex !== undefined) {
        let insertIndex = updatedTargetPath.weekIndex;
        if (position === 'after') insertIndex++;
        newData.periods[updatedTargetPath.periodIndex].cycles[updatedTargetPath.cycleIndex].weeks.splice(insertIndex, 0, item);
      }
    } else if (itemType === 'day') {
      if (targetType === 'week' && updatedTargetPath.cycleIndex !== undefined && updatedTargetPath.weekIndex !== undefined) {
        const targetWeek = newData.periods[updatedTargetPath.periodIndex].cycles[updatedTargetPath.cycleIndex].weeks[updatedTargetPath.weekIndex];
        const insertIndex = position === 'inside' ? targetWeek.days.length : 0;
        targetWeek.days.splice(insertIndex, 0, item);
      } else if (targetType === 'day' && updatedTargetPath.cycleIndex !== undefined && updatedTargetPath.weekIndex !== undefined && updatedTargetPath.dayIndex !== undefined) {
        let insertIndex = updatedTargetPath.dayIndex;
        if (position === 'after') insertIndex++;
        newData.periods[updatedTargetPath.periodIndex].cycles[updatedTargetPath.cycleIndex].weeks[updatedTargetPath.weekIndex].days.splice(insertIndex, 0, item);
      }
    }
    
    return { newData, sourceParentInfo };
  }, [data]);

  // Helper function to find item path in a specific data structure
  const findItemPathInData = useCallback((searchData: SOAData, itemId: string, itemType: EditableItemType) => {
    for (let periodIndex = 0; periodIndex < searchData.periods.length; periodIndex++) {
      const period = searchData.periods[periodIndex];
      
      if (itemType === 'period' && period.id === itemId) {
        return { periodIndex };
      }
      
      for (let cycleIndex = 0; cycleIndex < period.cycles.length; cycleIndex++) {
        const cycle = period.cycles[cycleIndex];
        
        if (itemType === 'cycle' && cycle.id === itemId) {
          return { periodIndex, cycleIndex };
        }
        
        for (let weekIndex = 0; weekIndex < cycle.weeks.length; weekIndex++) {
          const week = cycle.weeks[weekIndex];
          
          if (itemType === 'week' && week.id === itemId) {
            return { periodIndex, cycleIndex, weekIndex };
          }
          
          for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];
            
            if (itemType === 'day' && day.id === itemId) {
              return { periodIndex, cycleIndex, weekIndex, dayIndex };
            }
          }
        }
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((item: any, itemType: EditableItemType) => {
    setDragState({
      isDragging: true,
      draggedItem: item,
      draggedType: itemType,
      hoveredDropZone: null
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedType: 'day',
      hoveredDropZone: null
    });
  }, []);

  const handleDrop = useCallback((
    targetId: string,
    targetType: EditableItemType,
    position: 'before' | 'after' | 'inside'
  ) => {
    console.log('🎯 handleDrop called:', { targetId, targetType, position });
    console.log('🎯 Dragged item:', dragState.draggedItem?.name, dragState.draggedType);
    
    if (!dragState.isDragging || !dragState.draggedItem) return;
    
    // Don't allow dropping on self
    if (dragState.draggedItem.id === targetId) {
      console.log('❌ Dropping on self, aborting');
      handleDragEnd();
      return;
    }
    
    // Validate drop target
    const canDrop = validateDrop(dragState.draggedType, targetType, position);
    if (!canDrop) {
      console.log('❌ Invalid drop target, aborting');
      handleDragEnd();
      return;
    }
    
    console.log('💾 Saving to history before drop');
    saveToHistory(`Move ${dragState.draggedType} "${dragState.draggedItem.name}"`);
    
    // Insert item at new position and get source parent info
    console.log('🔄 Inserting item at new position');
    const { newData, sourceParentInfo } = insertItem(
      dragState.draggedItem,
      dragState.draggedType,
      targetId,
      targetType,
      position
    );
    
    console.log('📡 Calling onDataChange with new data');
    onDataChange(newData);
    
    // Show empty group modal only if source parent became empty
    if (sourceParentInfo) {
      console.log('🗑️ Source parent became empty:', sourceParentInfo);
      setEmptyGroup(sourceParentInfo);
    }
    
    console.log('🏁 Drop operation completed');
    handleDragEnd();
  }
  )

  const validateDrop = useCallback((
    dragType: EditableItemType,
    targetType: EditableItemType,
    position: 'before' | 'after' | 'inside'
  ): boolean => {
    // Define valid drop combinations
    const validDrops: Record<EditableItemType, Record<EditableItemType, string[]>> = {
      period: {
        period: ['before', 'after']
      },
      cycle: {
        period: ['inside'],
        cycle: ['before', 'after']
      },
      week: {
        cycle: ['inside'],
        week: ['before', 'after']
      },
      day: {
        week: ['inside'],
        day: ['before', 'after']
      }
    };
    
    return validDrops[dragType]?.[targetType]?.includes(position) || false;
  }, []);

  const setHoveredDropZone = useCallback((zoneId: string | null) => {
    setDragState(prev => ({ ...prev, hoveredDropZone: zoneId }));
  }, []);

  const handleKeepEmptyGroup = useCallback(() => {
    setEmptyGroup(null);
  }, []);

  const handleDeleteEmptyGroup = useCallback(() => {
    if (emptyGroup) {
      deleteEmptyGroup(emptyGroup.id, emptyGroup.type);
      setEmptyGroup(null);
    }
  }, [emptyGroup, deleteEmptyGroup]);

  const closeEmptyGroupModal = useCallback(() => {
    setEmptyGroup(null);
  }, []);

  return {
    dragState,
    history,
    emptyGroup,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    validateDrop,
    setHoveredDropZone,
    undo,
    canUndo: history.length > 0,
    handleKeepEmptyGroup,
    handleDeleteEmptyGroup,
    closeEmptyGroupModal
  };
};