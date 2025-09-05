# Reset Prompt: Interactive Schedule of Activities (SOA) Table Editor

## App Overview
Create a **Schedule of Activities (SOA) Table Editor** - a clinical trial management tool that allows researchers to create, edit, and manage study timelines with drag-and-drop functionality, activity tracking, and visit linking capabilities.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Drag & Drop**: React Beautiful DnD
- **State Management**: React hooks (useState, useEffect, custom hooks)

## Core Features & Functionality

### 1. **Hierarchical Timeline Structure**
- **Periods** → **Cycles** → **Weeks** → **Days** (4-level hierarchy)
- Each level displays as table headers with appropriate colspan
- Color-coded backgrounds: Periods (blue), Cycles (green), Weeks (orange), Days (purple)
- Drag-and-drop reordering between same-level items
- Add/delete functionality with + buttons on hover

### 2. **Activity Management**
- **Activity rows** below timeline headers
- Each activity has: description, category (visit/lab/imaging/questionnaire/other), and cells for each day
- **Activity cells** can be:
  - Active/inactive (click to toggle)
  - Assigned visit types: in-person, phone-call, drug-shipment, remote-assessment
  - Include footnotes (a, b, c, etc.) and custom text
  - Right-click to set visit type via dropdown menu

### 3. **Visit Linking System**
- Link related visits across the timeline (e.g., baseline assessments)
- Visual indicators with link icons
- Hover effects to highlight linked visits
- When one linked visit is modified, all linked visits update together

### 4. **Comments System**
- Add comments to any cell (timeline headers or activity cells)
- Comment icons appear in corners of cells
- Modal popup for viewing/editing comments
- Comments persist and show visual indicators

### 5. **Drag & Drop with Smart Validation**
- Drag timeline elements (periods, cycles, weeks, days) to reorder
- Visual drop zones with validation (before/after/inside)
- Empty group detection with cleanup prompts
- Undo functionality with history tracking
- Success animations for completed moves

## Component Structure

### Main Components
- `SOATable` - Main table component with all logic
- `DraggableCell` - Reusable draggable timeline cells
- `ActivityCell` - Individual activity cells with visit types
- `EditPanel` - Right sidebar for editing selected items
- `CommentModal` - Popup for comment management
- `VisitTypeSelector` - Dropdown for selecting visit types
- `EmptyGroupModal` - Confirmation dialog for empty groups

### Custom Hooks
- `useDragDrop` - Handles all drag/drop logic and validation
- `useVisitLinks` - Manages visit linking and highlighting
- `useComments` - Comment CRUD operations and state

### Supporting Components
- `CommentIcon` - Reusable comment indicator
- `VisitTypeSelector` - Visit type dropdown menu

## Data Structure (TypeScript Interfaces)

```typescript
interface SOAData {
  periods: Period[];
  visitLinks?: VisitLink[];
}

interface Period {
  id: string;
  name: string;
  duration?: number;
  cycles: Cycle[];
}

interface Cycle {
  id: string;
  name: string;
  duration?: number;
  weeks: Week[];
}

interface Week {
  id: string;
  name: string;
  duration?: number;
  days: Day[];
}

interface Day {
  id: string;
  name: string;
  duration?: number;
}

interface ActivityData {
  id: string;
  description: string;
  category: 'visit' | 'lab' | 'imaging' | 'questionnaire' | 'other';
  cells: ActivityCell[];
}

interface ActivityCell {
  dayId: string;
  isActive: boolean;
  visitType?: VisitType;
  footnote?: string;
  customText?: string;
}

interface VisitLink {
  id: string;
  visitIds: string[];
  name?: string;
}

type VisitType = 'in-person' | 'phone-call' | 'drug-shipment' | 'remote-assessment';
```

## UI/UX Design Requirements

### Design System
- **Tailwind CSS** for all styling
- **Lucide React** icons throughout
- Clean, clinical/medical aesthetic
- Responsive design with horizontal scrolling for large timelines

### Color Scheme
- Periods: Blue (`bg-blue-100`, `text-blue-600`)
- Cycles: Green (`bg-green-100`, `text-green-600`) 
- Weeks: Orange (`bg-orange-100`, `text-orange-600`)
- Days: Purple (`bg-purple-100`, `text-purple-600`)
- Active cells: Light blue backgrounds
- Visit types: Color-coded icons (blue=in-person, green=phone, purple=drug, orange=remote)

### Interactions
- Hover effects on all interactive elements
- Smooth transitions and animations
- Visual feedback for drag operations
- Contextual tooltips and help text

## Sample Data Structure
Include realistic clinical trial data with:

### Timeline Structure
- **Screening Period** (14 days)
  - Cycle 1 (14 days)
    - Week 1 (7 days): Day 1, Day 7

- **Treatment Period** (112 days)
  - Cycle 1 (28 days)
    - Week 1: Day 1, Day 2
    - Week 2: Day 8, Day 9, Day 15
    - Week 3: Day 22, Day 28
  - Cycle 2 (28 days)
    - Week 1: Day 1, Day 8, Day 15
  - Cycle 3 (28 days)
    - Week 1: Day 1, Day 15
  - Cycle 4 (28 days)
    - Week 1: Day 1, Day 8

- **Follow-up Period** (30 days)
  - Cycle 1 (30 days)
    - Week 1: Day 1, Day 30

### Sample Activities
1. **Informed Consent** (visit) - Active on Day 1 with in-person visit, footnote 'a'
2. **Medical History** (visit) - Active on Day 1 with in-person visit, footnote 'a'
3. **Physical Examination** (visit) - Active on Day 1 and every 7th day, in-person visits
4. **Vital Signs** (visit) - Active every 2nd day, alternating in-person/remote
5. **Laboratory Tests** (lab) - Active on Days 1, 7, 14 with in-person visits, footnote 'x'
6. **ECG** (other) - Active on Days 1, 7, 14 with in-person visits, footnote 'x'
7. **Drug Administration** (other) - Active Days 2-15 with drug-shipment type
8. **Adverse Event Assessment** (questionnaire) - Active from Day 2, alternating phone/remote

### Visit Links
- Link Treatment Cycle 1 Day 1 with Treatment Cycle 1 Day 8 (Baseline Assessment Link)
- Link Treatment Cycle 2 Day 1 with Treatment Cycle 3 Day 1 (Treatment Monitoring Link)

## Key Features to Implement
1. ✅ **Timeline Management** - Full CRUD for periods/cycles/weeks/days
2. ✅ **Activity Tracking** - Toggle activities, set visit types, add footnotes
3. ✅ **Drag & Drop** - Reorder timeline elements with validation
4. ✅ **Visit Linking** - Link related visits with visual indicators
5. ✅ **Comments** - Add/edit/delete comments on any cell
6. ✅ **Undo/Redo** - History tracking for all changes
7. ✅ **Responsive Design** - Works on desktop with horizontal scroll

## Table Layout Structure
```
| ACTIVITY DESCRIPTION | PERIOD 1 (colspan=days) | PERIOD 2 (colspan=days) | PERIOD 3 (colspan=days) |
|---------------------|-------------------------|-------------------------|-------------------------|
| CYCLE               | CYCLE 1 (colspan=days)  | CYCLE 1 | CYCLE 2 | CYCLE 3 | CYCLE 4 | CYCLE 1 |
| WEEK                | WEEK 1 (colspan=days)   | WEEK 1 | WEEK 2 | WEEK 3 | WEEK 1 | WEEK 1 | WEEK 1 | WEEK 1 |
| DAY                 | Day 1 | Day 7           | Day 1 | Day 2 | Day 8 | Day 9 | Day 15 | Day 22 | Day 28 | Day 1 | Day 8 | Day 15 | Day 1 | Day 15 | Day 1 | Day 8 | Day 1 | Day 30 |
| TIME OF DAY         | Morning | Afternoon     | Morning | Afternoon | ... |
| ALLOWED WINDOW      | ±1d | ±2h             | ±1d | ±2h | ... |
| VISIT LABEL         | V1 | V2               | V3 | V4 | V5 | V6 | V7 | V8 | V9 | V10 | V11 | V12 | V13 | V14 | V15 | V16 | V17 | V18 |
| Activity 1          | [cell] | [cell]       | [cell] | [cell] | ... |
| Activity 2          | [cell] | [cell]       | [cell] | [cell] | ... |
| ...                 | ...    | ...          | ...    | ...    | ... |
```

## Optional Enhancements for Future
- Export to PDF/Excel functionality
- Import from existing study protocols
- User authentication and multi-user collaboration
- Version control and change tracking
- Integration with clinical trial management systems
- Advanced scheduling algorithms
- Mobile-responsive design improvements

## Technical Implementation Notes
- Use sticky positioning for row/column headers (`sticky left-0` for first column)
- Implement proper z-index layering for overlays (z-[15] for sticky headers)
- Optimize re-renders with React.memo where needed
- Handle edge cases in drag/drop (empty groups, invalid drops)
- Maintain data consistency when structure changes
- Use proper TypeScript interfaces for all data structures
- Implement proper error boundaries and loading states

## File Structure
```
src/
├── components/
│   ├── SOATable.tsx (main component)
│   ├── DraggableCell.tsx
│   ├── ActivityCell.tsx
│   ├── EditPanel.tsx
│   ├── CommentModal.tsx
│   ├── CommentIcon.tsx
│   ├── VisitTypeSelector.tsx
│   └── EmptyGroupModal.tsx
├── hooks/
│   ├── useDragDrop.ts
│   ├── useVisitLinks.ts
│   └── useComments.ts
├── types/
│   └── soa.ts (all TypeScript interfaces)
└── App.tsx (main app with sample data)
```

---

**Instructions**: Use this prompt to create a clean, production-ready SOA Table Editor with all the functionality described above. Focus on code organization, TypeScript safety, smooth user interactions, and maintaining the exact visual design and behavior patterns shown in the specification.