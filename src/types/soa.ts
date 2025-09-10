export interface Day {
  id: string;
  name: string;
  duration?: number;
}

export interface Week {
  id: string;
  name: string;
  duration?: number;
  days: Day[];
}

export interface Cycle {
  id: string;
  name: string;
  duration?: number;
  weeks: Week[];
}

export interface Period {
  id: string;
  name: string;
  duration?: number;
  cycles: Cycle[];
}

export interface SOAData {
  periods: Period[];
  activities?: ActivityData[];
  visitLinks?: VisitLink[];
  timeRelativeCells?: TimeRelativeCell[];
  timeWindowCells?: TimeWindowCell[];
  timeOfDayCells?: TimeOfDayCell[];
}

export interface TimeRelativeCell {
  id: string;
  dayId: string;
  value: number; // hours
}

export interface TimeWindowCell {
  id: string;
  dayId: string;
  value: number; // hours (will be displayed as ±[value]h)
  colspan?: number;
  rowspan?: number;
  isMergedPlaceholder?: boolean;
  customText?: string;
}

export interface TimeOfDayCell {
  id: string;
  dayId: string;
  value: 'Morning' | 'Afternoon' | 'Evening';
}

export interface VisitLink {
  id: string;
  visitIds: string[]; // Array of linked visit IDs
  name?: string; // Optional name for the link group
}

export interface ActivityData {
  id: string;
  description: string;
  category: 'visit' | 'lab' | 'imaging' | 'questionnaire' | 'other';
  variableIds?: string[];
  cells: ActivityCell[];
}

export interface ActivityCell {
  dayId: string;
  isActive: boolean;
  visitType?: VisitType;
  footnote?: string;
  customText?: string;
  comment?: string;
  colspan?: number;
  rowspan?: number;
  isMergedPlaceholder?: boolean;
}

export type VisitType = 'in-person' | 'phone-call' | 'drug-shipment' | 'remote-assessment';

export interface VisitTypeConfig {
  icon: string;
  label: string;
  color: string;
}

export type EditableItem = Period | Cycle | Week | Day | TimeRelativeCell | TimeWindowCell | TimeOfDayCell;
export type EditableItemType = 'period' | 'cycle' | 'week' | 'day' | 'time-relative-cell' | 'time-window-cell' | 'time-of-day-cell';

export interface EditContext {
  item: EditableItem;
  type: EditableItemType;
  periodId?: string;
  cycleId?: string;
  weekId?: string;
}

export interface Comment {
  id: string;
  cellId: string;
  cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day';
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

export interface CommentModalState {
  isOpen: boolean;
  cellId: string;
  cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day';
  position: { x: number; y: number };
  existingComment?: string;
}