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
}

export type VisitType = 'in-person' | 'phone-call' | 'drug-shipment' | 'remote-assessment';

export interface VisitTypeConfig {
  icon: string;
  label: string;
  color: string;
}

export type EditableItem = Period | Cycle | Week | Day;
export type EditableItemType = 'period' | 'cycle' | 'week' | 'day';

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