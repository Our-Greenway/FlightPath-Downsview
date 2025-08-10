import { MapProvider, useMapContext } from './context/MapContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';
import GraphTest from './pages/GraphTest';
import LocationPrompt from './pages/LocationPrompt';
import { useOrientation } from './context/Orientation';
import PathFinder from './pages/PathFinder';
import { useEffect } from 'react';

function MapLayout({ children }: { children: React.ReactNode }) {
  const orientation = useOrientation();
  const { userPoint } = useMapContext();

  if (!userPoint) return <LocationPrompt />;
  
  useEffect(() => {
    const handleOrientation = () => {
      window.scrollTo(0, 0); 
    };
    window.addEventListener("orientationchange", handleOrientation);
    return () => window.removeEventListener("orientationchange", handleOrientation);
  }, []);

  return (
    <>
      <div className={`flex w-full overflow-hidden pt-safe-top pb-safe-bottom ${orientation === "portrait" ? "flex-col" : "flex-row"}`} style={{ height: '100dvh', width: '100dvw', position: 'fixed', top: 0, left: 0}}>
      <div className={orientation === "portrait" ? "h-1/2 w-full touch-pan-x touch-pan-y touch-pinch-zoom" : "h-full w-3/5 touch-pan-x touch-pan-y touch-pinch-zoom"}>
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
