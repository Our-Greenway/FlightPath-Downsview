import { MapProvider, useMapContext } from './context/MapContext';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';
import GraphTest from './pages/GraphTest';
import LocationPrompt from './pages/LocationPrompt';
import { useOrientation } from './context/Orientation';

function AppContent() {
  const orientation = useOrientation();
  const { userPoint } = useMapContext();

  return (
    <>
      {!userPoint && <LocationPrompt />}
      
      <div className={`flex w-screen h-screen ${orientation === "portrait" ? "flex-col" : "flex-row"}`}>
        <div className={orientation === "portrait" ? "h-1/2 w-full" : "h-full w-3/5"}>
          <MapPage />
        </div>
        <div className={orientation === "portrait" ? "h-1/2 w-full" : "h-full w-2/5 z-10000"}>
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
