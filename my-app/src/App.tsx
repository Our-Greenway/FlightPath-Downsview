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
      <div className={`flex w-screen h-screen ${orientation === "portrait" ? "flex-col" : "flex-row"}`}>
        <div className={orientation === "portrait" ? "h-1/2 w-full" : "h-full w-3/5"}>
          <MapPage />
        </div>
        <div style={{ zIndex: 10000 }} className={orientation === "portrait" ? "flex flex-col w-full flex-1 min-h-[50vh]" : "h-full w-2/5"}>
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
