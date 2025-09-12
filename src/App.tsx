import React from 'react';
import { SOATable } from './components/SOATable';
import { SOALegend } from './components/SOALegend';
import { useTimelineHeaderManagement } from './hooks/useTimelineHeaderManagement';
import { generateSampleData } from './utils/presetData';
import { SOAData } from './types/soa';

function App() {
  const [soaData, setSoaData] = React.useState<SOAData>(() => generateSampleData());
  const headerManagement = useTimelineHeaderManagement();

  const handleDataChange = (newData: SOAData) => {
    setSoaData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <SOATable
        data={soaData}
        onDataChange={handleDataChange}
        headerManagement={headerManagement}
      />
      
      {/* Legend positioned at bottom of content flow - not sticky/fixed */}
      <div className="mt-6">
        <SOALegend />
      </div>
    </div>
  );
}

export default App;