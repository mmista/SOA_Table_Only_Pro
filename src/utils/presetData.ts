import { SOAData, Period, Cycle, Week, Day, ActivityData, TimeRelativeCell, TimeWindowCell, TimeOfDayCell, VisitLink } from '../types/soa';

// Sample data with filled structure and activities
export const generateSampleData = (): SOAData => {
  // Generate periods structure
  const periods: Period[] = [
    {
      id: 'period-1',
      name: 'Screening',
      duration: 14,
      cycles: [
        {
          id: 'cycle-1',
          name: 'Cycle 1',
          duration: 14,
          weeks: [
            {
              id: 'week-1',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-1', name: 'Day 1' },
                { id: 'day-2', name: 'Day 7' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'period-2',
      name: 'Treatment',
      duration: 112,
      cycles: [
        {
          id: 'cycle-2',
          name: 'Cycle 1',
          duration: 28,
          weeks: [
            {
              id: 'week-2',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-3', name: 'Day 1' },
                { id: 'day-4', name: 'Day 2' }
              ]
            },
            {
              id: 'week-3',
              name: 'Week 2',
              duration: 7,
              days: [
                { id: 'day-5', name: 'Day 8' },
                { id: 'day-6', name: 'Day 9' },
                { id: 'day-7', name: 'Day 15' }
              ]
            },
            {
              id: 'week-4',
              name: 'Week 3',
              duration: 7,
              days: [
                { id: 'day-8', name: 'Day 22' },
                { id: 'day-9', name: 'Day 28' }
              ]
            }
          ]
        },
        {
          id: 'cycle-3',
          name: 'Cycle 2',
          duration: 28,
          weeks: [
            {
              id: 'week-5',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-10', name: 'Day 1' },
                { id: 'day-11', name: 'Day 8' },
                { id: 'day-12', name: 'Day 15' }
              ]
            }
          ]
        },
        {
          id: 'cycle-4',
          name: 'Cycle 3',
          duration: 28,
          weeks: [
            {
              id: 'week-6',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-13', name: 'Day 1' },
                { id: 'day-14', name: 'Day 15' }
              ]
            }
          ]
        },
        {
          id: 'cycle-5',
          name: 'Cycle 4',
          duration: 28,
          weeks: [
            {
              id: 'week-7',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-15', name: 'Day 1' },
                { id: 'day-16', name: 'Day 8' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'period-3',
      name: 'Follow-up',
      duration: 30,
      cycles: [
        {
          id: 'cycle-6',
          name: 'Cycle 1',
          duration: 30,
          weeks: [
            {
              id: 'week-8',
              name: 'Week 1',
              duration: 7,
              days: [
                { id: 'day-17', name: 'Day 1' },
                { id: 'day-18', name: 'Day 30' }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Generate all days from the periods structure
  const allDays: Day[] = [];
  periods.forEach(period => {
    period.cycles.forEach(cycle => {
      cycle.weeks.forEach(week => {
        allDays.push(...week.days);
      });
    });
  });

  // Generate sample activities with filled data
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

  const activities: ActivityData[] = trialActivities.map((activity, activityIndex) => ({
    id: `activity-${activityIndex}`,
    description: activity.description,
    category: activity.category,
    cells: allDays.map((day, dayIndex) => {
      const activityName = activity.description;
      let isActive = false;
      let visitType: any;
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

  // Generate time relative cells (24 hours for all days)
  const timeRelativeCells: TimeRelativeCell[] = allDays.map((day) => ({
    id: `time-relative-${day.id}`,
    dayId: day.id,
    value: 24
  }));

  // Generate time window cells (varying hours)
  const timeWindowCells: TimeWindowCell[] = allDays.map((day, index) => ({
    id: `time-window-${day.id}`,
    dayId: day.id,
    value: index % 3 === 0 ? 24 : index % 3 === 1 ? 2 : 4
  }));

  // Generate time of day cells (alternating morning/afternoon)
  const timeOfDayCells: TimeOfDayCell[] = allDays.map((day, index) => ({
    id: `time-of-day-${day.id}`,
    dayId: day.id,
    value: (index % 2 === 0 ? 'Morning' : 'Afternoon') as 'Morning' | 'Afternoon' | 'Evening'
  }));

  // Generate visit links
  const visitLinks: VisitLink[] = [
    {
      id: 'link-1',
      visitIds: ['day-3', 'day-5'], // V3 linked with V7
      name: 'Baseline Assessment Link'
    },
    {
      id: 'link-2', 
      visitIds: ['day-10', 'day-13'], // V8 linked with V10
      name: 'Treatment Monitoring Link'
    }
  ];

  return {
    periods,
    activities,
    activityGroups: [],
    timeRelativeCells,
    timeWindowCells,
    timeOfDayCells,
    visitLinks
  };
};

// Empty data with minimal structure
export const generateEmptyData = (): SOAData => {
  // Minimal structure with just one period, cycle, week, and day
  const periods: Period[] = [
    {
      id: 'period-1',
      name: 'Period 1',
      cycles: [
        {
          id: 'cycle-1',
          name: 'Cycle 1',
          weeks: [
            {
              id: 'week-1',
              name: 'Week 1',
              days: [
                { id: 'day-1', name: 'Day 1' }
              ]
            }
          ]
        }
      ]
    }
  ];

  return {
    periods,
    activities: [],
    activityGroups: [],
    timeRelativeCells: [
      {
        id: 'time-relative-day-1',
        dayId: 'day-1',
        value: 24
      }
    ],
    timeWindowCells: [
      {
        id: 'time-window-day-1',
        dayId: 'day-1',
        value: 24
      }
    ],
    timeOfDayCells: [
      {
        id: 'time-of-day-day-1',
        dayId: 'day-1',
        value: 'Morning'
      }
    ],
    visitLinks: []
  };
};