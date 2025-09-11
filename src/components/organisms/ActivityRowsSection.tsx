import React from 'react';
import { Plus } from 'lucide-react';
import { SOAData, ActivityData, ActivityCell, ActivityGroup, EditableItemType } from '../../types/soa';
import { ActivityRowHeader } from '../molecules/ActivityRowHeader';
import { ActivityCell as ActivityCellComponent } from '../ActivityCell';
import { ActivityGroupHeader } from '../ActivityGroupHeader';
import { ActivityGroupHeaderContextMenu } from '../ActivityGroupHeaderContextMenu';
import { ColorPickerModal } from '../ColorPickerModal';

interface ActivityRowsSectionProps {
  data: SOAData;
  activities: ActivityData[];
  activityGroups: ActivityGroup[];
  selectedActivityHeaders: Set<string>;
  collapsedGroups: Set<string>;
  editingActivity: string | null;
  hoveredActivityRow: string | null;
  selectedActivityCells: Set<string>;
  dragState: {
    isDragging: boolean;
    draggedItem: any;
    draggedType: EditableItemType;
    hoveredDropZone: string | null;
  };
  getTotalDays: () => number;
  getActivityCell: (activityId: string, dayId: string) => ActivityCell | undefined;
  getCellKey: (activityId: string, dayId: string) => string;
  isVisitLinked: (dayId: string) => boolean;
  shouldHighlightActivityCell: (dayId: string, activityId: string) => boolean;
  hasComment: (cellId: string, cellType: string) => boolean;
  onActivityEdit: (activityId: string) => void;
  onActivitySave: (activityId: string, newDescription: string) => void;
  onActivityCancel: () => void;
  onActivityRemove: (activityId: string) => void;
  onActivityHeaderClick: (activityId: string, event: React.MouseEvent) => void;
  onActivityHeaderRightClick: (e: React.MouseEvent, activityId: string) => void;
  onActivityCellClick: (activityId: string, dayId: string, event: React.MouseEvent) => void;
  onActivityCellRightClick: (e: React.MouseEvent, activityId: string, dayId: string) => void;
  onActivityCellCustomTextChange: (activityId: string, dayId: string, newText: string) => void;
  onCommentClick: (e: React.MouseEvent, cellId: string, cellType: 'activity') => void;
  onActivityCellHover: (dayId: string | null, activityId: string | null) => void;
  onActivityRowHover: (activityId: string | null) => void;
  onAddActivity: () => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onChangeGroupColor: (groupId: string, newColor: string) => void;
  onUngroupGroup: (groupId: string) => void;
  onDragStart: (item: any, type: EditableItemType) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => void;
  setHoveredDropZone: (zoneId: string | null) => void;
  validateDrop: (dragType: EditableItemType, targetType: EditableItemType, position: 'before' | 'after' | 'inside') => boolean;
}

interface ColorPickerModalState {
  isOpen: boolean;
  groupId: string | null;
  groupName: string;
  currentColor: string;
}

export const ActivityRowsSection: React.FC<ActivityRowsSectionProps> = ({
  data,
  activities,
  activityGroups,
  selectedActivityHeaders,
  collapsedGroups,
  editingActivity,
  hoveredActivityRow,
  selectedActivityCells,
  dragState,
  getTotalDays,
  getActivityCell,
  getCellKey,
  isVisitLinked,
  shouldHighlightActivityCell,
  hasComment,
  onActivityEdit,
  onActivitySave,
  onActivityCancel,
  onActivityRemove,
  onActivityHeaderClick,
  onActivityHeaderRightClick,
  onActivityCellClick,
  onActivityCellRightClick,
  onActivityCellCustomTextChange,
  onCommentClick,
  onActivityCellHover,
  onActivityRowHover,
  onAddActivity,
  onToggleGroupCollapse,
  onRenameGroup,
  onChangeGroupColor,
  onUngroupGroup,
  onDragStart,
  onDragEnd,
  onDrop,
  setHoveredDropZone,
  validateDrop
}) => {
  const [groupHeaderContextMenu, setGroupHeaderContextMenu] = React.useState<{
    isOpen: boolean,
    position: { x: number, y: number },
    groupId: string | null,
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    groupId: null,
  });

  const [colorPickerModalState, setColorPickerModalState] = React.useState<ColorPickerModalState>({
    isOpen: false,
    groupId: null,
    groupName: '',
    currentColor: '#3B82F6',
  });

  const [dragOver, setDragOver] = React.useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const handleGroupHeaderRightClick = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    setGroupHeaderContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      groupId,
    });
  };

  const handleCloseGroupHeaderContextMenu = () => {
    setGroupHeaderContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleOpenColorPicker = (groupId: string) => {
    const group = activityGroups.find(g => g.id === groupId);
    if (group) {
      setColorPickerModalState({
        isOpen: true,
        groupId: groupId,
        groupName: group.name,
        currentColor: group.color,
      });
    }
    handleCloseGroupHeaderContextMenu();
  };

  const handleCloseColorPicker = () => {
    setColorPickerModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveGroupColor = (groupId: string, newColor: string) => {
    onChangeGroupColor(groupId, newColor);
  };

  // Drag and drop handlers for activities
  const handleActivityDragStart = (e: React.DragEvent, activity: ActivityData) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(activity, 'activity');
  };

  const handleActivityDragOver = (e: React.DragEvent, activityId: string) => {
    e.preventDefault();
    
    if (!dragState.isDragging || (dragState.draggedType !== 'activity' && dragState.draggedType !== 'activity-group')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    const position = y < height / 2 ? 'before' : 'after';
    setDragOver({ id: activityId, position });
    setHoveredDropZone(`${activityId}-${position}`);
  };

  const handleActivityDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(null);
      setHoveredDropZone(null);
    }
  };

  const handleActivityDrop = (e: React.DragEvent, activityId: string) => {
    e.preventDefault();
    if (dragOver && dragState.isDragging) {
      onDrop(activityId, 'activity', dragOver.position);
    }
    setDragOver(null);
    setHoveredDropZone(null);
  };

  // Drag and drop handlers for activity groups
  const handleGroupDragStart = (e: React.DragEvent, group: ActivityGroup) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(group, 'activity-group');
  };

  const handleGroupDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    
    if (!dragState.isDragging || (dragState.draggedType !== 'activity-group' && dragState.draggedType !== 'activity')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    const position = y < height / 2 ? 'before' : 'after';
    setDragOver({ id: groupId, position });
    setHoveredDropZone(`${groupId}-${position}`);
  };

  const handleGroupDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(null);
      setHoveredDropZone(null);
    }
  };

  const handleGroupDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (dragOver && dragState.isDragging) {
      onDrop(groupId, 'activity-group', dragOver.position);
    }
    setDragOver(null);
    setHoveredDropZone(null);
  };

  const getDropZoneStyle = (itemId: string) => {
    if (!dragOver || dragOver.id !== itemId) return '';
    
    switch (dragOver.position) {
      case 'before':
        return 'border-t-4 border-t-blue-500';
      case 'after':
        return 'border-b-4 border-b-blue-500';
      default:
        return '';
    }
  };
  // Organize activities by groups
  const ungroupedActivities = activities.filter(activity => !activity.groupId);
  const groupedActivities = activityGroups.map(group => ({
    group,
    activities: activities.filter(activity => activity.groupId === group.id)
  }));

  const renderActivityRow = (activity: ActivityData) => {
    const group = activityGroups.find(g => g.id === activity.groupId);
    const isSelected = selectedActivityHeaders.has(activity.id);
    const isDragging = dragState.isDragging && dragState.draggedItem?.id === activity.id;
    const isValidDropTarget = dragState.isDragging && 
      dragState.draggedItem?.id !== activity.id &&
      (validateDrop(dragState.draggedType, 'activity', 'before') || validateDrop(dragState.draggedType, 'activity', 'after'));
    
    return (
      <tr 
        key={activity.id} 
        className={`
          group transition-colors duration-150 cursor-move
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isValidDropTarget ? 'ring-1 ring-blue-300' : ''}
          ${getDropZoneStyle(activity.id)}
        `}
        draggable
        onDragStart={(e) => handleActivityDragStart(e, activity)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => handleActivityDragOver(e, activity.id)}
        onDragLeave={handleActivityDragLeave}
        onDrop={(e) => handleActivityDrop(e, activity.id)}
        onMouseEnter={() => onActivityRowHover(activity.id)}
        onMouseLeave={() => onActivityRowHover(null)}
      >
        <ActivityRowHeader
          activity={activity}
          isEditing={editingActivity === activity.id}
          isHovered={hoveredActivityRow === activity.id}
          isSelected={isSelected}
          groupColor={group?.color}
          onEdit={() => onActivityEdit(activity.id)}
          onSave={(newDescription) => onActivitySave(activity.id, newDescription)}
          onCancel={onActivityCancel}
          onRemove={() => onActivityRemove(activity.id)}
          onClick={(e) => onActivityHeaderClick(activity.id, e)}
          onRightClick={(e) => onActivityHeaderRightClick(e, activity.id)}
        />
        
        {data.periods.map(period =>
          period.cycles.map(cycle =>
            cycle.weeks.map(week =>
              week.days.map((day) => {
                const cellData = getActivityCell(activity.id, day.id);
                const isHighlighted = shouldHighlightActivityCell(day.id, activity.id);
                const activityCellKey = `activity:${activity.id}:${day.id}`;
                const cellKey = getCellKey(activity.id, day.id);
                const isSelectedCell = selectedActivityCells.has(cellKey);
                
                return (
                  <ActivityCellComponent
                    key={`${activity.id}-${day.id}`}
                    isActive={cellData?.isActive || false}
                    visitType={cellData?.visitType}
                    footnote={cellData?.footnote}
                    customText={cellData?.customText}
                    isHighlighted={isHighlighted}
                    isLinked={isVisitLinked(day.id)}
                    isRowHovered={hoveredActivityRow === activity.id}
                    hasComment={hasComment(activityCellKey, 'activity')}
                    isSelected={isSelectedCell}
                    colspan={cellData?.colspan}
                    rowspan={cellData?.rowspan}
                    isMergedPlaceholder={cellData?.isMergedPlaceholder}
                    onClick={(e) => onActivityCellClick(activity.id, day.id, e)}
                    onRightClick={(e) => onActivityCellRightClick(e, activity.id, day.id)}
                    onCommentClick={(e) => onCommentClick(e, activityCellKey, 'activity')}
                    onMouseEnter={() => onActivityCellHover(day.id, activity.id)}
                    onMouseLeave={() => onActivityCellHover(null, null)}
                    onCustomTextChange={(newText) => onActivityCellCustomTextChange(activity.id, day.id, newText)}
                  />
                );
              })
            )
          )
        )}
      </tr>
    );
  };

  return (
    <>
      {/* Grouped Activities */}
      {groupedActivities.map(({ group, activities: groupActivities }) => (
        <React.Fragment key={group.id}>
          <ActivityGroupHeader
            group={group}
            totalColumns={getTotalDays()}
            isCollapsed={collapsedGroups.has(group.id)}
            isDragging={dragState.isDragging && dragState.draggedItem?.id === group.id}
            isValidDropTarget={dragState.isDragging && 
              dragState.draggedItem?.id !== group.id &&
              (validateDrop(dragState.draggedType, 'activity-group', 'before') || validateDrop(dragState.draggedType, 'activity-group', 'after'))}
            dropZoneStyle={getDropZoneStyle(group.id)}
            onToggleCollapse={onToggleGroupCollapse}
            onRename={onRenameGroup}
            onChangeColor={onChangeGroupColor}
            onOpenColorPicker={handleOpenColorPicker}
            onUngroup={onUngroupGroup}
            onRightClick={handleGroupHeaderRightClick}
            onDragStart={(e) => handleGroupDragStart(e, group)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => handleGroupDragOver(e, group.id)}
            onDragLeave={handleGroupDragLeave}
            onDrop={(e) => handleGroupDrop(e, group.id)}
          />
          {!collapsedGroups.has(group.id) && groupActivities.map(renderActivityRow)}
        </React.Fragment>
      ))}
      
      {/* Ungrouped Activities */}
      {ungroupedActivities.map(renderActivityRow)}
      
      {/* Add Activity Row */}
      <tr>
        <td className="sticky left-0 bg-white px-6 py-4 border-r border-gray-300 z-[15] border-b border-gray-300">
          <button
            onClick={onAddActivity}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </td>
        <td colSpan={getTotalDays()} className="border border-gray-300 bg-gray-50"></td>
      </tr>
      
      {/* Group Header Context Menu */}
      {groupHeaderContextMenu.isOpen && groupHeaderContextMenu.groupId && (
        <ActivityGroupHeaderContextMenu
          isOpen={groupHeaderContextMenu.isOpen}
          position={groupHeaderContextMenu.position}
          groupId={groupHeaderContextMenu.groupId}
          groupName={activityGroups.find(g => g.id === groupHeaderContextMenu.groupId)?.name || ''}
          onClose={handleCloseGroupHeaderContextMenu}
          onRename={onRenameGroup}
          onChangeColor={handleOpenColorPicker}
          onUngroup={onUngroupGroup}
        />
      )}
      
      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={colorPickerModalState.isOpen}
        groupId={colorPickerModalState.groupId}
        groupName={colorPickerModalState.groupName}
        currentColor={colorPickerModalState.currentColor}
        onClose={handleCloseColorPicker}
        onSaveColor={handleSaveGroupColor}
      />
    </>
  );
};