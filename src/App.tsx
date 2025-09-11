import React, { useState } from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { SOAData } from './types/soa';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';

// Generate initial sample data
const initialData: SOAData = generateSampleData();

function App() {
  const [soaData, setSoaData] = useState<SOAData>(initialData);
  
  // Centralized header management
  const headerManagement = useTimelineHeaderManagement();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SOATable 
        data={soaData} 
        onDataChange={setSoaData}
        headerManagement={headerManagement}
      />
      <SOALegend />
    </div>
  );
}

export default App;