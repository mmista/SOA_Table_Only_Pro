import React from 'react';
import { SOATable } from './components/SOATable';
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
    <div className="min-h-screen bg-gray-100">
      <SOATable
        data={soaData}
        onDataChange={handleDataChange}
        headerManagement={headerManagement}
      />
    </div>
  );
}

export default App;