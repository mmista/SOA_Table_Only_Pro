import React from 'react';
import { Plus } from 'lucide-react';
import { SOAData, ActivityData, ActivityCell } from '../../types/soa';
import { ActivityRowHeader } from '../molecules/ActivityRowHeader';
import { ActivityCell as ActivityCellComponent } from '../ActivityCell';

interface ActivityRowsSectionProps {
  data: SOAData;
  activities: ActivityData[];
  editingActivity: string | null;
  hoveredActivityRow: string | null;
  selectedActivityCells: Set<string>;
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
  onActivityCellClick: (activityId: string, dayId: string, event: React.MouseEvent) => void;
  onActivityCellRightClick: (e: React.MouseEvent, activityId: string, dayId: string) => void;
  onActivityCellCustomTextChange: (activityId: string, dayId: string, newText: string) => void;
  onCommentClick: (e: React.MouseEvent, cellId: string, cellType: 'activity') => void;
  onActivityCellHover: (dayId: string | null, activityId: string | null) => void;
  onActivityRowHover: (activityId: string | null) => void;
  onAddActivity: () => void;
}

export const ActivityRowsSection: React.FC<ActivityRowsSectionProps> = ({
  data,
  activities,
  editingActivity,
  hoveredActivityRow,
  selectedActivityCells,
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
  onActivityCellClick,
  onActivityCellRightClick,
  onActivityCellCustomTextChange,
  onCommentClick,
  onActivityCellHover,
  onActivityRowHover,
  onAddActivity
}) => {
  return (
    <>
      {/* Trial Activities Rows */}
      {activities.map((activity) => (
        <tr 
          key={activity.id} 
          className="group transition-colors duration-150"
          onMouseEnter={() => onActivityRowHover(activity.id)}
          onMouseLeave={() => onActivityRowHover(null)}
        >
          <ActivityRowHeader
            activity={activity}
            isEditing={editingActivity === activity.id}
            isHovered={hoveredActivityRow === activity.id}
            onEdit={() => onActivityEdit(activity.id)}
            onSave={(newDescription) => onActivitySave(activity.id, newDescription)}
            onCancel={onActivityCancel}
            onRemove={() => onActivityRemove(activity.id)}
          />
          
          {data.periods.map(period =>
            period.cycles.map(cycle =>
              cycle.weeks.map(week =>
                week.days.map((day) => {
                  const cellData = getActivityCell(activity.id, day.id);
                  const isHighlighted = shouldHighlightActivityCell(day.id, activity.id);
                  const activityCellKey = `activity:${activity.id}:${day.id}`;
                  const cellKey = getCellKey(activity.id, day.id);
                  const isSelected = selectedActivityCells.has(cellKey);
                  
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
                      isSelected={isSelected}
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
      ))}
      
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
    </>
  );
};