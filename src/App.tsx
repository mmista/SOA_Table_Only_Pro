import React, { useState } from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { SOAData } from './types/soa';

const initialData: SOAData = {
  periods: [
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
  ],
  visitLinks: [
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
  ]
};

function App() {
  const [soaData, setSoaData] = useState<SOAData>(initialData);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SOATable 
        data={soaData} 
        onDataChange={setSoaData}
      />
      <SOALegend />
    </div>
  );
}

export default App;