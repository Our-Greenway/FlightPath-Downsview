import { MapProvider, useMapContext } from './context/MapContext';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';
import GraphTest from './pages/GraphTest';
import LocationPrompt from './pages/LocationPrompt';

function AppContent() {
  const { userPoint } = useMapContext();

  return (
    <>
      {!userPoint && <LocationPrompt />}
      <div className="flex w-screen h-screen">
        <div className="w-3/5 h-full">
          <MapPage />
        </div>
        <GraphTest />
        <div className="w-2/5 h-full z-10000">
          <InfoPanel />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <MapProvider>
      <AppContent />
    </MapProvider>
  );
}

export default App;
