import { MapProvider } from './context/MapContext';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';
import React from 'react';

function App() {
  return (
    <MapProvider>
      <div className="flex w-screen h-screen">
        <div className="w-3/5 h-full">
          <MapPage />
        </div>

        <div className="w-2/5 h-full z-10000">
          <InfoPanel />
        </div>
      </div>
    </MapProvider>
  );
}

export default App;