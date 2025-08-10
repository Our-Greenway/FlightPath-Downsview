import { MapProvider, useMapContext } from './context/MapContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';
import GraphTest from './pages/GraphTest';
import LocationPrompt from './pages/LocationPrompt';
import { useOrientation } from './context/Orientation';
import PathFinder from './pages/PathFinder';

function MapLayout({ children }: { children: React.ReactNode }) {
  const orientation = useOrientation();
  const { userPoint } = useMapContext();

  if (!userPoint) return <LocationPrompt />;

  return (
    <>
      <div className={`flex w-full overflow-hidden ${orientation === "portrait" ? "flex-col" : "flex-row"}`} style={{ height: '100dvh', width: '100dvw' }}>
        <div className={orientation === "portrait" ? "h-1/2 w-full" : "h-full w-3/5"}>
          <MapPage />
        </div>
        <div className={`relative z-[10000] ${orientation === "portrait" ? "w-full flex flex-col min-h-[50vh]" : "h-full w-2/5"}`}>
          {children}
        </div>
      </div>
      <GraphTest />
    </>
  );
}


function App() {
  return (
    <MapProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<MapLayout><InfoPanel /></MapLayout>} />
        <Route path="/pathfinder" element={<MapLayout><PathFinder /></MapLayout>} />
          </Routes>
      </BrowserRouter>
    </MapProvider>
  );
}

export default App;
